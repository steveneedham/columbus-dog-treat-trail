/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — weekly digest subscribe/unsubscribe endpoint
 * -------------------------------------------------------------
 * Deploy as its OWN Web App (Deploy > New deployment > Web app),
 * bound to the same "Columbus Dog Treat Trail — Data" spreadsheet as
 * approval.gs/verify.gs/digest.gs, execute as yourself, access "Anyone".
 *
 * WHAT IT DOES
 * index.html's "Weekly updates" box lets a visitor type their email
 * and get added to the real weekly digest list — this is the missing
 * piece that turns digest.gs from "manually-curated recipients only"
 * into an actual public opt-in newsletter, the thing its own comment
 * originally said this site didn't have a safe way to do. It now
 * does, because this endpoint also handles unsubscribing (required
 * for any real bulk email — see digest.gs for how the link gets
 * built and sent).
 *
 * doPost — subscribe. doGet — unsubscribe (a plain link works from
 * any email client; no JS needed on that end).
 *
 * SETUP
 *  1. Same Apps Script project as approval.gs/verify.gs/digest.gs.
 *  2. Add a "Subscribers" tab: header row
 *     email | subscribed_at | unsubscribed_at
 *  3. Deploy > New deployment > Web app > Execute as: Me, Who has
 *     access: Anyone. Copy the deployment URL.
 *  4. Paste that URL into CONFIG.SUBSCRIBE_URL near the top of
 *     index.html, AND into the SUBSCRIBE_URL Script Property (Project
 *     Settings > Script Properties) so digest.gs can build unsubscribe
 *     links from the same deployment.
 */

function doPost(e) {
  var out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  try {
    var email = (e.parameter.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      out.setContent(JSON.stringify({ ok: false, error: 'invalid email' }));
      return out;
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Subscribers');
    var values = sheet.getDataRange().getValues();
    var emailCol = values[0].indexOf('email');
    var subCol = values[0].indexOf('subscribed_at');
    var unsubCol = values[0].indexOf('unsubscribed_at');

    var rowIndex = -1;
    for (var r = 1; r < values.length; r++) {
      if (String(values[r][emailCol]).trim().toLowerCase() === email) { rowIndex = r; break; }
    }

    if (rowIndex === -1) {
      var newRow = [];
      newRow[emailCol] = email;
      newRow[subCol] = new Date();
      newRow[unsubCol] = '';
      sheet.appendRow(newRow);
    } else {
      // Re-subscribing (including someone who'd previously unsubscribed)
      // just clears unsubscribed_at and bumps the subscribed_at date.
      sheet.getRange(rowIndex + 1, subCol + 1).setValue(new Date());
      sheet.getRange(rowIndex + 1, unsubCol + 1).setValue('');
    }

    out.setContent(JSON.stringify({ ok: true }));
    return out;
  } catch (err) {
    out.setContent(JSON.stringify({ ok: false, error: String(err) }));
    return out;
  }
}

function doGet(e) {
  var email = (e.parameter.email || '').trim().toLowerCase();
  if (e.parameter.action !== 'unsubscribe' || !email) {
    return HtmlService.createHtmlOutput('Nothing to see here.');
  }
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Subscribers');
    var values = sheet.getDataRange().getValues();
    var emailCol = values[0].indexOf('email');
    var unsubCol = values[0].indexOf('unsubscribed_at');
    for (var r = 1; r < values.length; r++) {
      if (String(values[r][emailCol]).trim().toLowerCase() === email) {
        sheet.getRange(r + 1, unsubCol + 1).setValue(new Date());
        break;
      }
    }
    return HtmlService.createHtmlOutput(
      '<body style="font-family:sans-serif;padding:40px;text-align:center;">' +
      '<p>You’re unsubscribed from the Columbus Dog Treat Trail weekly digest.</p>' +
      '<p>Sorry to see you go — come back any time.</p></body>'
    );
  } catch (err) {
    return HtmlService.createHtmlOutput('Something went wrong unsubscribing — email sjneedham@icloud.com and I’ll do it by hand.');
  }
}
