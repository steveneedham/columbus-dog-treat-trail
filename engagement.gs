/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — engagement/analytics endpoint (optional)
 * -------------------------------------------------------------
 * Deploy as its OWN Web App (Deploy > New deployment > Web app),
 * bound to the same "Columbus Dog Treat Trail — Data" spreadsheet as
 * approval.gs/verify.gs/report.gs, execute as yourself, access "Anyone".
 *
 * WHAT IT DOES — two unrelated, deliberately low-stakes writes, kept
 * in one file/one deployment so wiring this up is one setup step
 * instead of two:
 *
 *   action=ping  — index.html calls this at most once per visit, only
 *   after a visitor has already granted location for something else
 *   ("Near me" or "Use my current location" in Suggest-a-stop) — this
 *   endpoint never triggers a location prompt itself. Appends one row
 *   (timestamp, lat, lng) to a "Pings" tab. lat/lng arrive already
 *   rounded to 3 decimal places (~110m) by index.html, and nothing
 *   else is recorded — no name, no email, no device/browser info, no
 *   stop id — so a row can't be tied back to a person or a precise
 *   address. This is meant to answer "which areas is the map being
 *   used from", not "where does person X live".
 *
 *   action=view  — index.html calls this once per stop per visit, the
 *   first time that stop's map popup opens. Increments a `view_count`
 *   column on that row in Stops, same header-lookup pattern as
 *   report_count/verify_count. Answers "which stops get looked at the
 *   most".
 *
 * SETUP
 *  1. Same Apps Script project as approval.gs/verify.gs/report.gs.
 *  2. Add a `view_count` column to Stops (any position — found by
 *     header name). Existing rows are treated as 0 until touched.
 *  3. This creates the "Pings" tab itself on first ping if it doesn't
 *     already exist — nothing to add there by hand.
 *  4. Deploy > New deployment > Web app > Execute as: Me, Who has
 *     access: Anyone. Copy the deployment URL.
 *  5. Paste that URL into CONFIG.ENGAGEMENT_URL near the top of
 *     index.html. Leave it blank and both features are silently
 *     skipped — no behavior change, no network calls.
 *
 * EXPLORING THE DATA — see SETUP.md for the full walkthrough, but in
 * short: publish the Pings tab to the web as CSV the same way as the
 * Stops tab, then drag that CSV into kepler.gl (no account needed) for
 * a heatmap. view_count just needs sorting in the Stops tab directly.
 */

function doPost(e) {
  var out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);

  try {
    var action = e.parameter.action;
    if (action === 'ping') return logPing_(e, out);
    if (action === 'view') return logView_(e, out);
    throw new Error('Unknown or missing action: ' + action);
  } catch (err) {
    out.setContent(JSON.stringify({ ok: false, error: String(err) }));
    return out;
  }
}

function logPing_(e, out) {
  var lat = Number(e.parameter.lat);
  var lng = Number(e.parameter.lng);
  if (!isFinite(lat) || !isFinite(lng)) throw new Error('Missing or invalid lat/lng');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Pings');
  if (!sheet) {
    sheet = ss.insertSheet('Pings');
    sheet.appendRow(['timestamp', 'lat', 'lng']);
  }
  sheet.appendRow([new Date(), lat, lng]);

  out.setContent(JSON.stringify({ ok: true }));
  return out;
}

function logView_(e, out) {
  var id = e.parameter.id;
  if (!id) throw new Error('Missing id');

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stops');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf('id');
  var viewCountCol = headers.indexOf('view_count');
  if (idCol === -1) throw new Error('Stops sheet missing id column');
  if (viewCountCol === -1) {
    throw new Error('Stops sheet missing view_count column — see the setup comment at the top of this file');
  }

  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      rowIndex = i + 1; // 1-based sheet row
      break;
    }
  }
  if (rowIndex === -1) throw new Error('Stop id not found: ' + id);

  var viewCount = (Number(data[rowIndex - 1][viewCountCol]) || 0) + 1;
  sheet.getRange(rowIndex, viewCountCol + 1).setValue(viewCount);

  out.setContent(JSON.stringify({ ok: true, view_count: viewCount }));
  return out;
}
