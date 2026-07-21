/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — membership write-back endpoint (optional)
 * -------------------------------------------------------------
 * Deploy as its OWN Web App (Deploy > New deployment > Web app),
 * bound to the same "Columbus Dog Treat Trail — Data" spreadsheet as
 * approval.gs/verify.gs/digest.gs/set-avatar.gs, execute as yourself,
 * access "Anyone".
 *
 * WHAT IT DOES
 * signup.html signs someone in with a real Google account (Google
 * Identity Services) — that's already a genuine, verified identity
 * with zero password storage on our end. This endpoint just makes
 * that identity durable across devices by upserting a row in a
 * "Members" tab, keyed by the Google account's stable `sub` id. Without
 * it, the sign-in still works fine — it just only remembers you in
 * that one browser's localStorage.
 *
 * SECURITY NOTE
 * Unlike set-avatar.gs (which trusts a plain name with no proof), this
 * endpoint's `google_sub` comes from a Google-issued ID token that the
 * browser decoded — a visitor can send whatever they want here since
 * this endpoint doesn't re-verify the token's signature server-side,
 * so treat `google_sub`/`name`/`email` as self-reported, same trust
 * level as everything else on this no-login site. It's still an
 * upgrade over a bare name field: forging a *specific* real person's
 * Google sub requires having seen it somewhere, not just guessing a
 * common name.
 *
 * SETUP
 *  1. Same Apps Script project as the other endpoints.
 *  2. In the same spreadsheet, add a tab named exactly "Members" with
 *     header row: google_sub | name | email | joined_at
 *  3. Deploy > New deployment > Web app > Execute as: Me, Who has
 *     access: Anyone. Copy the deployment URL.
 *  4. Paste that URL into JOIN_URL near the top of signup.html.
 */

function doPost(e) {
  var googleSub = (e.parameter.google_sub || '').trim();
  var name = (e.parameter.name || '').trim();
  var email = (e.parameter.email || '').trim();
  if (!googleSub) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'missing google_sub' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Members');
  var values = sheet.getDataRange().getValues();
  var subCol = values[0].indexOf('google_sub');
  var nameCol = values[0].indexOf('name');
  var emailCol = values[0].indexOf('email');
  var joinedCol = values[0].indexOf('joined_at');

  var rowIndex = -1;
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][subCol]).trim() === googleSub) { rowIndex = r; break; }
  }

  if (rowIndex === -1) {
    var newRow = [];
    newRow[subCol] = googleSub;
    newRow[nameCol] = name;
    newRow[emailCol] = email;
    newRow[joinedCol] = new Date();
    sheet.appendRow(newRow);
  } else {
    sheet.getRange(rowIndex + 1, nameCol + 1).setValue(name);
    sheet.getRange(rowIndex + 1, emailCol + 1).setValue(email);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
