/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — ScoutSights GA4 reporting endpoint (optional)
 * -------------------------------------------------------------
 * This is the one Apps Script file in this project that does NOT touch
 * the "Columbus Dog Treat Trail — Data" spreadsheet at all — it's a
 * standalone read-only bridge to Google Analytics 4, so it can live in
 * its own Apps Script project (script.google.com/home > New project)
 * or be added as an extra file in the existing one. Either works.
 *
 * WHAT IT DOES
 * scoutsights.html's Google Analytics panel calls this endpoint to show
 * real numbers instead of the mockup's sample data: users, sessions,
 * engagement rate, and average engagement time over the last 30 days,
 * a day-by-day sessions count for the sparkline, and the top pages by
 * views. All read via the GA4 Data API's runReport call, using Apps
 * Script's own OAuth identity — no API key or client secret to manage.
 *
 * SETUP — this one has two steps beyond the usual "paste the URL"
 * because Apps Script can't infer it needs Analytics access on its own:
 *
 *  1. Find your GA4 property ID: Google Analytics > Admin > Property
 *     details > "Property ID" (a plain number). This is NOT the
 *     G-XXXXXXX measurement ID from assets/analytics.js — that
 *     identifies the tracking stream; this identifies the property
 *     you're reading a report from. Paste it into GA4_PROPERTY_ID
 *     below, keeping the "properties/" prefix.
 *
 *  2. In the Apps Script editor: Project Settings (gear icon) > check
 *     "Show appsscript.json manifest file in editor" > open
 *     appsscript.json > add an oauthScopes array:
 *       "oauthScopes": [
 *         "https://www.googleapis.com/auth/analytics.readonly",
 *         "https://www.googleapis.com/auth/script.external_request"
 *       ]
 *     Without this, ScriptApp.getOAuthToken() below won't carry
 *     Analytics access and every call fails with a 403.
 *
 *  3. Make sure the Google account that owns this Apps Script project
 *     has at least Viewer access on the GA4 property itself (Analytics
 *     > Admin > Property Access Management) — the report runs AS that
 *     account, same as every other .gs file in this project runs
 *     Sheet writes as its owning account.
 *
 *  4. Deploy > New deployment > Web app > Execute as: Me, Who has
 *     access: Anyone. Copy the URL into CONFIG.GA_REPORT_URL near the
 *     top of scoutsights.html. Leave it blank and that panel shows its
 *     "not configured yet" state instead — no behavior change.
 *
 * Results are cached for an hour (CacheService) so refreshing
 * ScoutSights doesn't chew through the Data API's daily quota.
 */

var GA4_PROPERTY_ID = 'properties/000000000'; // <-- paste your real GA4 property ID here

function doGet(e) {
  var out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);

  try {
    var cache = CacheService.getScriptCache();
    var cacheKey = 'scoutsights_ga_report';
    var cached = cache.get(cacheKey);
    if (cached) {
      out.setContent(cached);
      return out;
    }

    var totals = runReport_({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'engagementRate' },
        { name: 'averageSessionDuration' }
      ]
    });
    var totalsRow = (totals.rows && totals.rows[0] && totals.rows[0].metricValues) || [];

    var byDate = runReport_({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }]
    });
    var dailySessions = (byDate.rows || []).map(function (r) {
      return { date: r.dimensionValues[0].value, sessions: Number(r.metricValues[0].value) };
    });

    var byPage = runReport_({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 8
    });
    var topPages = (byPage.rows || []).map(function (r) {
      return { path: r.dimensionValues[0].value, views: Number(r.metricValues[0].value) };
    });

    var result = {
      ok: true,
      users: Number(totalsRow[0] ? totalsRow[0].value : 0),
      sessions: Number(totalsRow[1] ? totalsRow[1].value : 0),
      engagementRate: Number(totalsRow[2] ? totalsRow[2].value : 0),
      avgEngagementSeconds: Number(totalsRow[3] ? totalsRow[3].value : 0),
      dailySessions: dailySessions,
      topPages: topPages
    };
    var json = JSON.stringify(result);
    cache.put(cacheKey, json, 3600);
    out.setContent(json);
    return out;
  } catch (err) {
    out.setContent(JSON.stringify({ ok: false, error: String(err) }));
    return out;
  }
}

function runReport_(body) {
  var url = 'https://analyticsdata.googleapis.com/v1beta/' + GA4_PROPERTY_ID + ':runReport';
  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });
  var parsed = JSON.parse(res.getContentText());
  if (parsed.error) throw new Error(parsed.error.message || 'GA4 Data API error');
  return parsed;
}
