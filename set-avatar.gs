/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — avatar picker write-back endpoint
 * -------------------------------------------------------------
 * Deploy as its OWN Web App (Deploy > New deployment > Web app),
 * bound to the same "Columbus Dog Treat Trail — Data" spreadsheet as
 * approval.gs/verify.gs, execute as yourself, access "Anyone".
 *
 * WHAT IT DOES
 * profile.html lets a contributor pick which of the 10 base avatar
 * faces represents them. Without this endpoint that pick only lives
 * in the picker's own browser (localStorage) — this lets it write to
 * a "Contributors" tab (columns: name, avatar_slug) so the choice
 * shows up in everyone's leaderboard, not just the picker's.
 *
 * SECURITY NOTE — read before deploying
 * Same no-login static-site model as verify.gs, but lower stakes:
 * this endpoint will let anyone set ANY contributor name's
 * avatar_slug, since there's no way to prove who's behind a given
 * name. Worst case if abused: someone's avatar face changes to
 * something they didn't pick — purely cosmetic, instantly fixable by
 * that person re-picking, and it can't touch Stops, verified status,
 * or anything else. Treat it like a shared whiteboard, not an
 * account system.
 *
 * SETUP
 *  1. Same Apps Script project as approval.gs/verify.gs.
 *  2. In the same spreadsheet, add a new tab named exactly
 *     "Contributors" with header row: name | avatar_slug
 *  3. Deploy > New deployment > Web app > Execute as: Me,
 *     Who has access: Anyone. Copy the deployment URL.
 *  4. Paste that URL into SET_AVATAR_URL near the top of
 *     profile.html. Leave it blank to keep the old local-only
 *     (this-browser-only) preview behavior.
 *  5. Publish the Contributors tab as its own CSV (File > Share >
 *     Publish to web, same as the Stops tab) and paste that URL into
 *     CONFIG.CONTRIBUTORS_CSV_URL in assets/stops-client.js so every
 *     visitor's leaderboard reflects everyone's picks.
 */

function doPost(e) {
  var name = (e.parameter.name || '').trim();
  var slug = (e.parameter.avatar_slug || '').trim();
  if (!name || !/^(0[1-9]|10)$/.test(slug)) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'invalid input' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Contributors');
  var values = sheet.getDataRange().getValues();
  var nameCol = values[0].indexOf('name');
  var slugCol = values[0].indexOf('avatar_slug');

  var rowIndex = -1;
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][nameCol]).trim().toLowerCase() === name.toLowerCase()) { rowIndex = r; break; }
  }

  if (rowIndex === -1) {
    var newRow = [];
    newRow[nameCol] = name;
    newRow[slugCol] = slug;
    sheet.appendRow(newRow);
  } else {
    sheet.getRange(rowIndex + 1, slugCol + 1).setValue(slug);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true, name: name, avatar_slug: slug }))
    .setMimeType(ContentService.MimeType.JSON);
}
