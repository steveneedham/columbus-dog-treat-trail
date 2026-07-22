/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — report write-back endpoint (optional)
 * -------------------------------------------------------------
 * Deploy as its OWN Web App (Deploy > New deployment > Web app),
 * bound to the same "Columbus Dog Treat Trail — Data" spreadsheet as
 * approval.gs/verify.gs, execute as yourself, access "Anyone".
 *
 * WHAT IT DOES
 * index.html's "Report" button lets a visitor flag that something's
 * wrong with a stop (gone, wrong info, etc). This endpoint increments
 * an optional `report_count` column on that row, and once enough
 * reports land (REPORT_FADE_THRESHOLD, matching index.html's CONFIG —
 * default 3), flips a verified stop back to unverified so it goes
 * through the same "confirm it on foot" loop as a brand-new stop.
 * The map also visually fades a pin's opacity as reports accumulate
 * even before that threshold hits, so a stop under a cloud reads as
 * fading away rather than silently flipping one day.
 *
 * SECURITY NOTE — read before deploying
 * This is the one deliberate exception to verify.gs's "only ever
 * moves status FORWARD" rule — reports need to move status backward
 * (verified -> unverified) or the whole feature is pointless. The
 * mitigation is requiring *multiple* reports rather than trusting any
 * single one: index.html also remembers (in that browser's
 * localStorage) which stops it's already reported and disables the
 * button, so flipping a stop back requires a handful of different
 * visitors/devices agreeing something's wrong, not one person
 * clicking repeatedly. It's still not real fraud-proofing — a
 * motivated visitor with 3 browsers could do it — same honesty-over-
 * security tradeoff as every other endpoint on this no-login site.
 * Worst case: a stop wrongly flips back to unverified and needs
 * re-confirming on foot. Nothing is deleted or corrupted.
 *
 * SETUP
 *  1. Same Apps Script project as approval.gs/verify.gs.
 *  2. Add `verify_count` and `report_count` columns to Stops (any
 *     position — found by header name, not column index). Existing
 *     rows are treated as 0 until touched.
 *  3. Deploy > New deployment > Web app > Execute as: Me, Who has
 *     access: Anyone. Copy the deployment URL.
 *  4. Paste that URL into CONFIG.REPORT_URL near the top of
 *     index.html. Leave it blank and Report falls back to the old
 *     mailto-only behavior.
 */

var REPORT_FADE_THRESHOLD = 3; // keep in sync with index.html's CONFIG.REPORT_FADE_THRESHOLD

function doPost(e) {
  var out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);

  try {
    var id = e.parameter.id;
    if (!id) throw new Error('Missing id');

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stops');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idCol = headers.indexOf('id');
    var statusCol = headers.indexOf('status');
    var reportCountCol = headers.indexOf('report_count');
    if (idCol === -1 || statusCol === -1) {
      throw new Error('Stops sheet missing id or status column');
    }
    if (reportCountCol === -1) {
      throw new Error('Stops sheet missing report_count column — see the setup comment at the top of this file');
    }

    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(id)) {
        rowIndex = i + 1; // 1-based sheet row
        break;
      }
    }
    if (rowIndex === -1) throw new Error('Stop id not found: ' + id);

    var reportCount = (Number(data[rowIndex - 1][reportCountCol]) || 0) + 1;
    sheet.getRange(rowIndex, reportCountCol + 1).setValue(reportCount);

    var currentStatus = data[rowIndex - 1][statusCol];
    var changed = false;
    var newStatus = currentStatus;
    if (reportCount >= REPORT_FADE_THRESHOLD) {
      if (currentStatus === 'verified') { newStatus = 'unverified'; changed = true; }
      else if (currentStatus === 'seasonal-verified') { newStatus = 'seasonal-unverified'; changed = true; }
      if (changed) sheet.getRange(rowIndex, statusCol + 1).setValue(newStatus);
    }

    out.setContent(JSON.stringify({ ok: true, report_count: reportCount, changed: changed, status: newStatus }));
    return out;
  } catch (err) {
    out.setContent(JSON.stringify({ ok: false, error: String(err) }));
    return out;
  }
}
