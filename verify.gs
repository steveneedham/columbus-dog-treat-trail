/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — verify write-back endpoint
 * App version: v0.6
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
 * v0.6: an already-verified stop can now be "upvoted" too — the
 * button just reconfirms it's still there. That doesn't change
 * `status` (already verified), but it does increment an optional
 * `verify_count` column and reset `report_count` to 0, since a fresh
 * reconfirmation is stronger community signal than any stale reports
 * sitting on the row. Both columns are optional — if the sheet
 * doesn't have them yet, this endpoint just skips that part rather
 * than erroring out.
 *
 * SECURITY NOTE — read before deploying
 * A static site with no server can't really authenticate who's
 * clicking "verified"; anyone reading the page's JS can find this
 * URL. To keep the blast radius small this endpoint:
 *   - only ever moves `status` FORWARD: unverified -> verified, or
 *     seasonal-unverified -> seasonal-verified. It will never move
 *     status back to unverified, and it never touches any other
 *     field (name, lat/lng, notes, etc) besides verify_count/report_count.
 *   - Worst case if someone abuses it: a stop gets marked verified
 *     that isn't, or its verify_count is inflated. That's about the
 *     same risk you already accept from unverified-by-default
 *     submissions today — this doesn't let anyone add, delete, or
 *     corrupt data.
 * If you want a modest speed bump against casual abuse, set
 * SHARED_TOKEN below and pass the same value from index.html. It's
 * visible in view-source, so treat it as a "please don't", not real
 * auth — genuine auth would need an actual backend.
 *
 * SETUP
 *  1. Same Apps Script project as approval.gs (or a new script file
 *     in it) works fine — Deploy treats the whole project as one
 *     Web App regardless of how many .gs files are in it.
 *  2. Optional: add `verify_count` and `report_count` columns to
 *     Stops (see report.gs and SETUP.md) to power the fade/upvote UI.
 *  3. Deploy > New deployment > Web app > Execute as: Me,
 *     Who has access: Anyone > Deploy. Copy the URL.
 *  4. Paste that URL into CONFIG.VERIFY_URL in index.html.
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
    var verifyCountCol = headers.indexOf('verify_count');
    var reportCountCol = headers.indexOf('report_count');
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
    var newStatus = currentStatus;
    var changed = false;
    if (currentStatus === 'unverified') {
      newStatus = 'verified';
      changed = true;
    } else if (currentStatus === 'seasonal-unverified') {
      newStatus = 'seasonal-verified';
      changed = true;
    }
    if (changed) sheet.getRange(rowIndex, statusCol + 1).setValue(newStatus);

    // Optional columns — every verify/upvote bumps the count and clears
    // any prior reports, whether or not `status` itself just changed.
    var verifyCount = null;
    if (verifyCountCol !== -1) {
      var currentCount = Number(data[rowIndex - 1][verifyCountCol]) || 0;
      verifyCount = currentCount + 1;
      sheet.getRange(rowIndex, verifyCountCol + 1).setValue(verifyCount);
    }
    if (reportCountCol !== -1) {
      sheet.getRange(rowIndex, reportCountCol + 1).setValue(0);
    }

    out.setContent(JSON.stringify({ ok: true, changed: changed, status: newStatus, verify_count: verifyCount }));
    return out;
  } catch (err) {
    out.setContent(JSON.stringify({ ok: false, error: String(err) }));
    return out;
  }
}
