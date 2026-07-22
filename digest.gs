/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — weekly digest email
 * -------------------------------------------------------------
 * Composes email-templates/weekly-digest.html from whatever got newly
 * verified in the Stops tab this week and sends it with MailApp.
 *
 * v0.7: this is now a real public opt-in list — index.html's "Weekly
 * updates" box lets anyone subscribe via subscribe.gs, which is also
 * what makes unsubscribing possible (required for any real bulk
 * email). Recipients here are the union of:
 *   - Script Property DIGEST_RECIPIENTS (a short, manually-curated
 *     list — yourself, neighbors who asked directly), and
 *   - every row in the Subscribers tab without an unsubscribed_at.
 * Each recipient gets their OWN email (not one bulk-CC'd send) with
 * their own personalized unsubscribe link, so subscribers never see
 * each other's addresses and can actually opt out.
 *
 * SETUP
 *  1. Same Apps Script project as approval.gs/verify.gs.
 *  2. Set up subscribe.gs first (Subscribers tab + its own deployment).
 *  3. Project Settings > Script Properties, add:
 *       DIGEST_RECIPIENTS = comma-separated email addresses (optional,
 *                           for people you're adding by hand)
 *       MAP_URL           = https://steveneedham.github.io/columbus-dog-treat-trail/
 *       SUBSCRIBE_URL     = subscribe.gs's Web App deployment URL
 *                           (used to build unsubscribe links)
 *  4. Paste the contents of email-templates/weekly-digest.html into
 *     a new HTML file in this Apps Script project named
 *     "weekly-digest" (Apps Script strips the .html extension).
 *  5. Run sendWeeklyDigest once manually to test (approve the Gmail
 *     send permission prompt), then optionally add a time-based
 *     trigger (Triggers > Add Trigger > sendWeeklyDigest > Week
 *     timer) if you want it fully automatic.
 *
 * Sending real volume through MailApp still has a daily quota
 * (varies by account type) and no sender-reputation warmup — fine
 * for a small neighborhood list, worth watching if this ever grows
 * past a few hundred subscribers.
 */

function getActiveSubscriberEmails() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Subscribers');
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var emailCol = values[0].indexOf('email');
  var unsubCol = values[0].indexOf('unsubscribed_at');
  var emails = [];
  for (var r = 1; r < values.length; r++) {
    if (!values[r][unsubCol]) {
      var email = String(values[r][emailCol]).trim().toLowerCase();
      if (email) emails.push(email);
    }
  }
  return emails;
}

function sendWeeklyDigest() {
  var props = PropertiesService.getScriptProperties();
  var manualRecipients = (props.getProperty('DIGEST_RECIPIENTS') || '').split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
  var recipients = [];
  var seen = {};
  manualRecipients.concat(getActiveSubscriberEmails()).forEach(function (email) {
    if (!seen[email]) { seen[email] = true; recipients.push(email); }
  });
  if (!recipients.length) {
    Logger.log('No recipients (DIGEST_RECIPIENTS empty and no active Subscribers) — skipping send.');
    return;
  }
  var mapUrl = props.getProperty('MAP_URL') || 'https://steveneedham.github.io/columbus-dog-treat-trail/';
  var subscribeUrl = props.getProperty('SUBSCRIBE_URL') || '';

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stops');
  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(function (h) { return String(h).trim().toLowerCase(); });
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });

  var oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  var newlyVerified = [];
  var hoods = {};
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var status = String(row[col['status']] || '');
    var dateAdded = row[col['date_added']];
    var addedDate = dateAdded instanceof Date ? dateAdded : new Date(dateAdded);
    if (status.indexOf('verified') === 0 || status === 'seasonal-verified') {
      if (addedDate instanceof Date && !isNaN(addedDate) && addedDate >= oneWeekAgo) {
        newlyVerified.push(row[col['name']]);
        var hood = row[col['neighborhood']];
        if (hood) hoods[hood] = true;
      }
    }
  }

  if (!newlyVerified.length) {
    Logger.log('Nothing newly verified this week — skipping send so the digest stays worth opening.');
    return;
  }

  var hoodNames = Object.keys(hoods);
  var headlineHoods = hoodNames.length <= 2
    ? hoodNames.join(' and ')
    : hoodNames.slice(0, -1).join(', ') + ', and ' + hoodNames[hoodNames.length - 1];
  var bodyCopy = 'Neighbors walked and confirmed ' + newlyVerified.length + ' stash' +
    (newlyVerified.length === 1 ? '' : 'es') + (headlineHoods ? ' in ' + headlineHoods : '') +
    ' this week — including ' + newlyVerified[0] + '. See what\'s new before your next walk.';

  var template = HtmlService.createTemplateFromFile('weekly-digest');
  // createTemplateFromFile doesn't do {{token}} substitution on its own —
  // simplest is a plain string replace on the rendered HTML instead of
  // fighting Apps Script's own <?= ?> templating syntax for this one file.
  // Everything except UNSUBSCRIBE_URL is the same for every recipient —
  // that one token gets filled in per-recipient in the send loop below.
  var baseHtml = template.getRawContent()
    .replace(/\{\{STOP_COUNT\}\}/g, String(newlyVerified.length))
    .replace(/\{\{HEADLINE_HOODS\}\}/g, headlineHoods)
    .replace(/\{\{BODY_COPY\}\}/g, bodyCopy)
    .replace(/\{\{MAP_URL\}\}/g, mapUrl);

  var subject = newlyVerified.length + ' new stop' + (newlyVerified.length === 1 ? '' : 's') + ' verified this week — Columbus Dog Treat Trail';

  recipients.forEach(function (email) {
    var unsubscribeUrl = subscribeUrl
      ? subscribeUrl + '?action=unsubscribe&email=' + encodeURIComponent(email)
      : 'mailto:' + Session.getEffectiveUser().getEmail() + '?subject=Unsubscribe%20from%20trail%20digest';
    var html = baseHtml.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);
    MailApp.sendEmail({ to: email, subject: subject, htmlBody: html });
  });
  Logger.log('Digest sent individually to ' + recipients.length + ' recipient(s).');
}
