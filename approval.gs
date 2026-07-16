/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — approval automation (geocoding version)
 * App version: v0.5
 * ---------------------------------------------------------------
 * Bound to the "Columbus Dog Treat Trail — Data" spreadsheet.
 * Sheet: Form Responses 1
 *
 * WHY HEADER-LOOKUP (not fixed columns)
 * The first version of this script read columns by fixed letter
 * (A-J), and it broke the first time the form changed — "Approve?"
 * and "Copied?" ended up at columns N/O instead of I/J once new
 * questions (Stop name, seasonal, private/business, photo) were
 * added. This version reads every field by matching a keyword
 * against row 1's header text instead, so it doesn't matter what
 * order the questions are in or how many get added later — as long
 * as each header still contains its keyword somewhere in it.
 *
 * KEYWORDS THIS LOOKS FOR (edit HEADER_KEYWORDS below if you rename
 * a question enough that its keyword no longer matches):
 *   name        → a header containing "stop name"
 *   type        → a header containing "type"
 *   neighborhood→ a header containing "neighborhood"
 *   notes       → a header containing "notes"
 *   submittedBy → a header containing "your name"
 *   address     → a header containing "address or cross"
 *   seasonal    → a header containing "year-round"
 *   venue       → a header containing "private home or a business"
 *   photo       → a header containing "photo"
 *   approve     → a header containing "approve"
 *   copied      → a header containing "copied"
 *
 * PHOTO HANDLING — one extra permission, one privacy note
 * The Photo question is a Forms file-upload, which lands in a Drive
 * folder owned by you and is PRIVATE by default — only you can open
 * it. To show a photo on the public map, this script sets that one
 * file (not the whole folder, not every submission — only the file
 * on a row you actually approve) to "Anyone with the link can view"
 * at approval time, then stores a direct-viewable URL in Stops.
 * That means the first time you run this, Google will prompt for an
 * additional Drive permission alongside Sheets/Maps — that's this
 * feature, not a bug.
 *
 * If the uploader attached more than one photo, only the first is
 * used — Stops has one photo_url column, not a gallery.
 *
 * FLOW: type "Y" in the Approve? column on a response row → script
 * geocodes the address, appends a row to Stops with status
 * "unverified" (or "seasonal-unverified" if the seasonal question
 * says seasonal), using the "Stop name" answer as the pin's name —
 * and marks the Copied? column so re-triggering is a no-op.
 *
 * This does NOT require walking the spot first — it publishes an
 * approximate, unverified pin straight from the typed address. That's
 * intentional (matches the "unverified = reported, not yet checked"
 * legend on the map) but means:
 *   - geocoding accuracy is only as good as the typed address/cross-
 *     streets, not the literal spot — nudge lat/lng once you've
 *     actually walked it and are flipping status to "verified".
 *   - if geocoding fails, lat/lng are left blank and the row still
 *     gets appended + marked "Copied" — but the site's loader drops
 *     any Stops row with non-numeric lat/lng, so it just won't show
 *     up on the map with no error anywhere. Worth an occasional glance
 *     at the Stops tab for blank lat/lng cells.
 *
 * SETUP:
 *  1. Extensions > Apps Script > paste this in > save.
 *  2. Triggers (clock icon) > + Add Trigger:
 *       function: onApproveEdit
 *       deployment: Head
 *       event source: From spreadsheet
 *       event type: On edit
 *     Save, authorize when prompted (Sheet + Maps + Drive access — no
 *     billing needed for normal volume; Apps Script's Maps service
 *     runs under a default free quota unless you later call
 *     Maps.setAuthenticationByApiKey(). Drive access is used only to
 *     make an approved stop's photo viewable — see PHOTO HANDLING
 *     above).
 *
 * USE: on a response row, set the "Approve?" cell to "Y".
 */

var HEADER_KEYWORDS = {
  name: 'stop name',
  type: 'type',
  neighborhood: 'neighborhood',
  notes: 'notes',
  submittedBy: 'your name',
  address: 'address or cross',
  seasonal: 'year-round',
  venue: 'private home or a business',
  photo: 'photo',
  approve: 'approve',
  copied: 'copied'
};

// Pulls a Drive file ID out of the URL Forms writes into the sheet
// for a file-upload question (Drive file IDs are a long run of
// letters/digits/-/_ ; 25 chars is a safe minimum length to avoid
// matching something shorter elsewhere in the URL).
function extractDriveFileId_(url) {
  var match = String(url || '').match(/[-\w]{25,}/);
  return match ? match[0] : '';
}

// Given the raw Photo cell (one or more comma-separated Drive URLs),
// shares the first file publicly (view-only) and returns a URL an
// <img> tag can load directly. Returns '' if there's no photo or the
// share/lookup fails for any reason — a missing photo shouldn't block
// the rest of the approval.
function resolvePhotoUrl_(rawCellValue) {
  var urls = String(rawCellValue || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  if (!urls.length) return '';
  var fileId = extractDriveFileId_(urls[0]);
  if (!fileId) return '';
  try {
    var file = DriveApp.getFileById(fileId);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return 'https://drive.google.com/uc?export=view&id=' + fileId;
  } catch (err) {
    return '';
  }
}

// Finds the 1-based column whose header (row 1) contains `keyword`,
// case-insensitively. Throws a clear error if nothing matches, so a
// renamed question fails loudly instead of silently reading the
// wrong cell.
function findCol_(headers, keyword) {
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).toLowerCase().indexOf(keyword) !== -1) return i + 1;
  }
  throw new Error('No header found containing "' + keyword + '" — check HEADER_KEYWORDS against row 1.');
}

function onApproveEdit(e) {
  var sheet = e.range.getSheet();
  if (sheet.getName() !== 'Form Responses 1') return;

  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var col = {};
  Object.keys(HEADER_KEYWORDS).forEach(function (key) {
    col[key] = findCol_(headers, HEADER_KEYWORDS[key]);
  });

  if (e.range.getColumn() !== col.approve) return;
  var row = e.range.getRow();
  if (row === 1) return;
  if (e.range.getValue() !== 'Y') return;

  var flagCell = sheet.getRange(row, col.copied);
  if (flagCell.getValue() === 'Copied') return;

  var get = function (key) {
    return sheet.getRange(row, col[key]).getValue();
  };

  var name = get('name');
  var address = get('address');
  var type = get('type');
  var neighborhood = get('neighborhood');
  var notes = get('notes');
  var submittedBy = get('submittedBy');
  var seasonalAnswer = get('seasonal');
  var venue = get('venue');
  var photoRaw = get('photo');

  var isSeasonal = String(seasonalAnswer).trim().toLowerCase().indexOf('seasonal') === 0;
  var status = isSeasonal ? 'seasonal-unverified' : 'unverified';
  var photoUrl = resolvePhotoUrl_(photoRaw);

  var stops = e.source.getSheetByName('Stops');
  var lastRow = stops.getLastRow();
  var newId = 1;
  if (lastRow >= 2) {
    var lastId = Number(stops.getRange(lastRow, 1).getValue()) || 0;
    newId = lastId + 1;
  }

  var lat = '', lng = '';
  try {
    var geo = Maps.newGeocoder().geocode(address + ', Columbus, OH');
    if (geo.results && geo.results.length > 0) {
      lat = geo.results[0].geometry.location.lat;
      lng = geo.results[0].geometry.location.lng;
    }
  } catch (err) {
    // leave lat/lng blank if geocoding fails — see note above about
    // this being a silent failure on the map side
  }

  var typeFormatted = String(type).trim().toLowerCase().replace(/\s+/g, '_');
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // Stops columns: id, name, lat, lng, type, neighborhood, status,
  // notes, submitted_by, date_added, venue, photo_url. "name" now
  // comes from the Stop name question, not the raw address — the
  // address is only used for geocoding and isn't stored in Stops.
  stops.appendRow([newId, name, lat, lng, typeFormatted, neighborhood, status, notes, submittedBy, today, venue, photoUrl]);
  flagCell.setValue('Copied');
}

