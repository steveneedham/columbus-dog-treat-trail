/*
  Columbus Dog Treat Trail — optional Google Analytics (GA4) loader
  -----------------------------------------------------------
  Does nothing until GA_MEASUREMENT_ID below is set — same "leave it
  blank to skip" pattern as CONFIG.SHEET_CSV_URL etc. elsewhere on this
  site. Include this script near the top of <head>, before other
  scripts, on any page that should be tracked.

  To enable: create a GA4 property at https://analytics.google.com,
  grab its Measurement ID (looks like "G-XXXXXXXXXX" — Admin > Data
  Streams > your web stream), and paste it below.
*/
(function () {
  var GA_MEASUREMENT_ID = "G-63K9JCMGPT"; // blank disables analytics entirely

  if (!GA_MEASUREMENT_ID) return;

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
})();
