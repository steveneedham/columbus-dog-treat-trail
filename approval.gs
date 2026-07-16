/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — approval automation (geocoding version)
 * App version: v0.5
 * ---------------------------------------------------------------
 * Bound to the "Columbus Dog Treat Trail — Data" spreadsheet.
 * Sheet: Form Responses 1 (gid=1965108209)
 *
 * Column layout this expects in Form Responses 1:
 *   A Timestamp
 *   B Email Address        (auto, from Forms' "collect email" setting)
 *   C Address or cross-streets
 *   D Type                 (form dropdown label, e.g. "Toy box")
 *   E Neighborhood
 *   F Notes
 *   G Your name
 *   H Email                (the optional question — not used here)
 *   I Approve?             (type "Y" to approve)
 *   J Copied                (script writes "Copied" here once processed)
 *   K Seasonal?             (v0.5, optional new form question — "Year-
 *                            round" or "Seasonal". If you add this
 *                            question to the live Form, Google Sheets
 *                            appends its answers as a new column at the
 *                            end, so existing I/J stay put. If you
 *                            haven't added the question yet, leave K
 *                            blank on all rows — it's treated as
 *                            "Year-round" when empty.)
 *
 * FLOW: type "Y" in column I on a response row → script geocodes the
 * address, appends a row to Stops with status "unverified" (or
 * "seasonal-unverified" if column K says seasonal), and marks column J
 * "Copied" so re-triggering the same row is a no-op.
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
 *     Save, authorize when prompted (Sheet + Maps access — no billing
 *     needed for normal volume; Apps Script's Maps service runs under
 *     a default free quota unless you later call
 *     Maps.setAuthenticationByApiKey()).
 *
 * USE: on a response row, set column I ("Approve?") to "Y".
 */
function onApproveEdit(e) {
  var sheet = e.range.getSheet();
  if (sheet.getName() !== 'Form Responses 1') return;
  if (e.range.getColumn() !== 9) return; // column I = "Approve?"
  var row = e.range.getRow();
  if (row === 1) return;
  if (e.range.getValue() !== 'Y') return;

  var flagCell = sheet.getRange(row, 10); // column J
  if (flagCell.getValue() === 'Copied') return;

  var data = sheet.getRange(row, 1, 1, 8).getValues()[0];
  var address = data[2], type = data[3], neighborhood = data[4],
      notes = data[5], submittedBy = data[6];

  // v0.5: optional 11th column ("Seasonal?"). Blank/missing = year-round.
  var seasonalAnswer = sheet.getRange(row, 11).getValue();
  var isSeasonal = String(seasonalAnswer).trim().toLowerCase().indexOf('seasonal') === 0;
  var status = isSeasonal ? 'seasonal-unverified' : 'unverified';

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
  stops.appendRow([newId, address, lat, lng, typeFormatted, neighborhood, status, notes, submittedBy, today]);
  flagCell.setValue('Copied');
}
