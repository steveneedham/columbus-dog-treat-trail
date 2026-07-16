# Columbus Dog Treat Trail

An interactive map of little dog treat stands, stick libraries, water bowls, and toy boxes spotted on walks around Columbus. Started after noticing a cluster of biscuit stashes in German Village while dog walking — built as a companion to [Columbus PantryMap](https://github.com/steveneedham/columbus-pantry-map), but leaning more "fun neighborhood find" than mutual aid.

**Live map:** https://steveneedham.github.io/columbus-dog-treat-trail/

## Status

v0.5 — one placeholder pin in German Village, marked **unverified**
pending an on-foot check. "Mark verified" now persists to the Sheet
(previously local-only), stops can be flagged seasonal, and the map
auto-refreshes instead of only loading once at page load. Still the
starting point for crowdsourcing a real dataset; there's no existing
directory for this (unlike the pantry map's source orgs), so locations
get added by hand or via submitted tips.

## Features

- Type filters: treat stand, stick library, water bowl, toy box, mixed
- Verified / unverified status per stop — "Mark verified" persists to the Sheet via a small Apps Script Web App (`verify.gs`); falls back to a local-only preview if that's not deployed yet
- Optional seasonal status (dashed ring on the map) for stops that go dormant part of the year
- Optional submitted photo shown in the popup, and a note on whether a stop is at a private home, business, or public space
- Background auto-refresh (every 5 min, and whenever the map is panned/zoomed) so the map stays current without a page reload
- "Near me" geolocation
- Per-location popups with Google Maps directions
- "Suggest a stop" — opens a Google Form once configured; falls back to an email link otherwise
- Data lives in a published Google Sheet, fetched as CSV — no redeploy needed to add a stop
- Approving a submission is a checkbox, not a copy-paste — see `approval.gs`

## Data

Stops live in a Google Sheet (the `Stops` tab), published to the web as CSV and fetched by `index.html` on load. If the Sheet URL isn't configured yet, or the fetch fails, the site falls back to a small hardcoded seed array so it never shows up empty. Each stop:

```js
{
  id, name, lat, lng,
  type: 'treat_stand' | 'stick_library' | 'water_bowl' | 'toy_box' | 'mixed',
  neighborhood,
  status: 'verified' | 'unverified' | 'seasonal-verified' | 'seasonal-unverified',
  notes, submitted_by, date_added,
  venue,      // optional — "private home", "business", "public space", as submitted
  photo_url   // optional — direct-viewable link to the submitted photo
}
```

Submissions come in through a separate Google Form → a separate "Form Responses" tab, kept apart from `Stops` on purpose. Approving a response geocodes it and appends it to `Stops` automatically (see [`approval.gs`](./approval.gs)), as `unverified` (or `seasonal-unverified` if flagged seasonal on the form) — flipping something to `verified` still means walking it and hand-correcting the coordinates, though the map's "Mark verified" button (via [`verify.gs`](./verify.gs)) now does the sheet write for you once you've confirmed it.

**See [SETUP.md](./SETUP.md)** for the full walkthrough on wiring up the Sheet and Form.

## Tech

Single-file HTML app using [Leaflet](https://leafletjs.com/), OpenStreetMap tiles, and [PapaParse](https://www.papaparse.com/) for CSV parsing. No build step, no backend — same approach as the pantry map, just with a Sheet standing in for a database.

## Roadmap

- [x] Swap hardcoded `stops` array for a published Google Sheet → JSON feed
- [x] Wire up a real "suggest a stop" form
- [x] Persist "Mark verified" to the Sheet instead of a local-only preview
- [x] Seasonal status for stops that go dormant part of the year
- [x] Auto-refresh the map (timer + on map movement) instead of load-once
- [ ] Explore commercial layer: sponsored/featured pins for local pet stores, "adopt a stop" restocking partnerships

## About

Corrections and new spottings welcome via issues/PRs once this is live.

## License

Code is [MIT licensed](./LICENSE) — © 2026 Steven Needham.

Third-party pieces keep their own terms:
- [Leaflet](https://leafletjs.com/) — BSD-2-Clause
- [OpenStreetMap](https://www.openstreetmap.org/copyright) tile data — © OpenStreetMap contributors, ODbL (attribution already shown on the map itself, per their terms)
- [PapaParse](https://www.papaparse.com/) — MIT

Stop data itself (the contents of the `Stops` sheet) isn't code and isn't covered by the MIT license above — treat it as community-contributed and don't scrape/republish it commercially without asking.
