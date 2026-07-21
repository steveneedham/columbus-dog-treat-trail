/**
 * Copyright (c) 2026 Steven Needham — MIT License (see repo LICENSE)
 *
 * Columbus Dog Treat Trail — weekly digest email (optional)
 * -------------------------------------------------------------
 * Composes email-templates/weekly-digest.html from whatever got newly
 * verified in the Stops tab this week and sends it with MailApp.
 *
 * This is NOT a public newsletter signup system — there's no opt-in
 * form, no unsubscribe-list storage, and no sender reputation warmup.
 * It's meant for a short, manually-curated recipient list (yourself,
 * a few neighbors who asked to be kept in the loop), same trust model
 * as the rest of this site's no-login Apps Script endpoints. If you
 * ever want a real public digest list, build a proper opt-in +
 * suppression-list flow first — sending unsolicited bulk email
 * without one risks your Gmail account's sending reputation and, at
 * real volume, CAN-SPAM/GDPR obligations neither this script nor
 * MailApp handle for you.
 *
 * SETUP
 *  1. Same Apps Script project as approval.gs/verify.gs.
 *  2. Project Settings > Script Properties, add:
 *       DIGEST_RECIPIENTS = comma-separated email addresses
 *       MAP_URL           = https://steveneedham.github.io/columbus-dog-treat-trail/
 *  3. Paste the contents of email-templates/weekly-digest.html into
 *     a new HTML file in this Apps Script project named
 *     "weekly-digest" (Apps Script strips the .html extension).
 *  4. Run sendWeeklyDigest once manually to test (approve the Gmail
 *     send permission prompt), then optionally add a time-based
 *     trigger (Triggers > Add Trigger > sendWeeklyDigest > Week
 *     timer) if you want it fully automatic.
 */

function sendWeeklyDigest() {
  var props = PropertiesService.getScriptProperties();
  var recipients = (props.getProperty('DIGEST_RECIPIENTS') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  if (!recipients.length) {
    Logger.log('No DIGEST_RECIPIENTS configured — skipping send.');
    return;
  }
  var mapUrl = props.getProperty('MAP_URL') || 'https://steveneedham.github.io/columbus-dog-treat-trail/';

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
  var html = template.getRawContent()
    .replace(/\{\{STOP_COUNT\}\}/g, String(newlyVerified.length))
    .replace(/\{\{HEADLINE_HOODS\}\}/g, headlineHoods)
    .replace(/\{\{BODY_COPY\}\}/g, bodyCopy)
    .replace(/\{\{MAP_URL\}\}/g, mapUrl)
    .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, 'mailto:' + Session.getEffectiveUser().getEmail() + '?subject=Unsubscribe%20from%20trail%20digest');

  MailApp.sendEmail({
    to: recipients.join(','),
    subject: newlyVerified.length + ' new stop' + (newlyVerified.length === 1 ? '' : 's') + ' verified this week — Columbus Dog Treat Trail',
    htmlBody: html
  });
  Logger.log('Digest sent to: ' + recipients.join(', '));
}
