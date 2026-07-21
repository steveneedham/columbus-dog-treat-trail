/*
  Columbus Dog Treat Trail — shared read-only data client
  -----------------------------------------------------------
  Used by the secondary pages (neighborhoods, stop-detail, profile,
  routes, trail-flier, moderation) so the "Stops" Sheet URL and CSV
  shape only live in one place outside of index.html itself. index.html
  keeps its own copy inline because it also handles write-back
  (Mark verified) and stale-read protection that these read-only pages
  don't need.

  Load PapaParse before this file. Exposes a single global: CDTT.
*/
(function (global) {
  const CONFIG = {
    SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRConYdz281L3B8jXoR6ocsHiHzox0rLsPauOPp3uTj9OWjNj2l1lHhGBp4X3Zo56LK0UaoXd4R5ulB/pub?gid=0&single=true&output=csv",
    // Optional: publish the "Form Responses" tab as its own CSV (same
    // way as the Stops tab, see SETUP.md) to power moderation.html's
    // pending-submissions queue. Leave blank to keep that page in its
    // "not configured yet" state.
    SUBMISSIONS_CSV_URL: ""
  };

  const TYPE_META = {
    treat_stand:   { label: "Treat stand",   color: "#B5502C" },
    stick_library: { label: "Stick library", color: "#4C6B4F" },
    water_bowl:    { label: "Water bowl",     color: "#3E6E8E" },
    toy_box:       { label: "Toy box",        color: "#8A5FB0" },
    mixed:         { label: "Mixed",          color: "#C68A2E" }
  };
  const TYPE_META_KEYS = Object.keys(TYPE_META);

  function isVerified(status) { return status === "verified" || status === "seasonal-verified"; }
  function isSeasonal(status) { return status === "seasonal-verified" || status === "seasonal-unverified"; }

  function csvToStops(csvText) {
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    return parsed.data
      .map(row => ({
        id: row.id,
        name: (row.name || "").trim(),
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        type: (row.type || "").trim(),
        neighborhood: (row.neighborhood || "").trim(),
        status: (row.status || "unverified").trim(),
        notes: row.notes || "",
        submitted_by: (row.submitted_by || "").trim(),
        date_added: row.date_added || "",
        venue: row.venue || "",
        photo_url: row.photo_url || "",
        // Optional column, see SETUP.md — visual sketch of the roadmap's
        // "commercial layer" (sponsored/featured pins). Anything truthy
        // ("y"/"yes"/"true"/"1") turns it on; absent column = false for
        // every existing sheet, so this is fully backward compatible.
        sponsored: /^(y|yes|true|1)$/i.test((row.sponsored || "").trim())
      }))
      .filter(s => s.name && Number.isFinite(s.lat) && Number.isFinite(s.lng) && TYPE_META_KEYS.includes(s.type));
  }

  async function loadStops() {
    if (!CONFIG.SHEET_CSV_URL) return [];
    const res = await fetch(CONFIG.SHEET_CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const text = await res.text();
    return csvToStops(text);
  }

  // Fixed-point rows: header text, not position, matching approval.gs'
  // own approach so a reordered form doesn't break either reader.
  function findHeader(row, keyword) {
    return Object.keys(row).find(h => h.toLowerCase().includes(keyword));
  }

  async function loadSubmissions() {
    if (!CONFIG.SUBMISSIONS_CSV_URL) return null;
    const res = await fetch(CONFIG.SUBMISSIONS_CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Submissions fetch failed: ${res.status}`);
    const text = await res.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    return parsed.data.map((row, i) => {
      const get = (kw) => { const h = findHeader(row, kw); return h ? (row[h] || "").trim() : ""; };
      return {
        rowIndex: i,
        name: get("stop name"),
        type: get("type"),
        neighborhood: get("neighborhood"),
        notes: get("notes"),
        submitter: get("your name") || "anonymous form",
        address: get("address or cross"),
        yearRound: get("year-round"),
        venue: get("private home or a business"),
        approve: get("approve"),
        copied: get("copied")
      };
    }).filter(s => s.name && !s.copied);
  }

  // Haversine distance in miles.
  function distanceMiles(a, b) {
    const R = 3958.8;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // Greedy nearest-neighbor ordering starting from the first stop —
  // good enough for a half-dozen stops in one neighborhood, not meant
  // to be an optimal TSP solve.
  function greedyRoute(stops) {
    if (stops.length <= 2) return stops.slice();
    const remaining = stops.slice(1);
    const ordered = [stops[0]];
    let current = stops[0];
    while (remaining.length) {
      let bestIdx = 0, bestDist = Infinity;
      remaining.forEach((s, i) => {
        const d = distanceMiles(current, s);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      current = remaining.splice(bestIdx, 1)[0];
      ordered.push(current);
    }
    return ordered;
  }

  function routeDistanceMiles(ordered) {
    let total = 0;
    for (let i = 1; i < ordered.length; i++) total += distanceMiles(ordered[i - 1], ordered[i]);
    return total;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  global.CDTT = {
    CONFIG, TYPE_META, TYPE_META_KEYS,
    isVerified, isSeasonal, csvToStops, loadStops, loadSubmissions,
    distanceMiles, greedyRoute, routeDistanceMiles, escapeHtml
  };
})(window);
