/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — verify write-back endpoint
 * App version: v0.5
 * -------------------------------------------------------------
 * Deploy as its OWN Web App (Deploy > New deployment > Web app),
 * bound to the same "Columbus Dog Treat Trail — Data" spreadsheet
 * as approval.gs, execute as yourself, access "Anyone".
 *
 * WHAT IT DOES
 * The site's "Mark verified" button previously only flipped
 * stop.status in the visitor's own browser (see the comment that
 * used to sit in index.html's click handler) — nothing was saved.
 * This endpoint lets the page POST a stop id and have the script
 * write the real status into that row in Stops, so it persists for
 * every visitor, not just the one who clicked.
 *
 * SECURITY NOTE — read before deploying
 * A static site with no server can't really authenticate who's
 * clicking "verified"; anyone reading the page's JS can find this
 * URL. To keep the blast radius small this endpoint:
 *   - only ever moves a stop FORWARD: unverified -> verified, or
 *     seasonal-unverified -> seasonal-verified. It will never move
 *     anything back to unverified, and it never touches any other
 *     field (name, lat/lng, notes, etc).
 *   - Worst case if someone abuses it: a stop gets marked verified
 *     that isn't. That's about the same risk you already accept
 *     from unverified-by-default submissions today — this doesn't
 *     let anyone add, delete, or corrupt data.
 * If you want a modest speed bump against casual abuse, set
 * SHARED_TOKEN below and pass the same value from index.html. It's
 * visible in view-source, so treat it as a "please don't", not real
 * auth — genuine auth would need an actual backend.
 *
 * SETUP
 *  1. Same Apps Script project as approval.gs (or a new script file
 *     in it) works fine — Deploy treats the whole project as one
 *     Web App regardless of how many .gs files are in it.
 *  2. Deploy > New deployment > Web app > Execute as: Me,
 *     Who has access: Anyone > Deploy. Copy the URL.
 *  3. Paste that URL into CONFIG.VERIFY_URL in index.html.
 */

var SHARED_TOKEN = ''; // leave blank to skip the token check entirely

function doPost(e) {
  var out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);

  try {
    var params = e.parameter;
    var id = params.id;
    if (!id) throw new Error('Missing id');
    if (SHARED_TOKEN && params.token !== SHARED_TOKEN) throw new Error('Bad token');

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stops');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idCol = headers.indexOf('id');
    var statusCol = headers.indexOf('status');
    if (idCol === -1 || statusCol === -1) {
      throw new Error('Stops sheet missing id or status column');
    }

    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(id)) {
        rowIndex = i + 1; // 1-based sheet row
        break;
      }
    }
    if (rowIndex === -1) throw new Error('Stop id not found: ' + id);

    var currentStatus = sheet.getRange(rowIndex, statusCol + 1).getValue();
    var newStatus;
    if (currentStatus === 'unverified') {
      newStatus = 'verified';
    } else if (currentStatus === 'seasonal-unverified') {
      newStatus = 'seasonal-verified';
    } else {
      out.setContent(JSON.stringify({ ok: true, changed: false, status: currentStatus }));
      return out;
    }

    sheet.getRange(rowIndex, statusCol + 1).setValue(newStatus);
    out.setContent(JSON.stringify({ ok: true, changed: true, status: newStatus }));
    return out;
  } catch (err) {
    out.setContent(JSON.stringify({ ok: false, error: String(err) }));
    return out;
  }
}
