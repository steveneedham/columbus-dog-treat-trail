# Columbus Dog Treat Trail

An interactive map of little dog treat stands, stick libraries, water bowls, and toy boxes spotted on walks around Columbus. Started after noticing a cluster of biscuit stashes in German Village while dog walking — built as a companion to [Columbus PantryMap](https://github.com/steveneedham/columbus-pantry-map), but leaning more "fun neighborhood find" than mutual aid.

**Live map:** https://steveneedham.github.io/columbus-dog-treat-trail/

## Status

Seed / v0.2 — one placeholder pin in German Village, marked **unverified** pending an on-foot check. This is the starting point for crowdsourcing a real dataset; there's no existing directory for this (unlike the pantry map's source orgs), so locations get added by hand or via submitted tips.

## Features

- Type filters: treat stand, stick library, water bowl, toy box, mixed
- Verified / unverified status per stop, with an on-map "mark verified" preview action
- "Near me" geolocation
- Per-location popups with Google Maps directions
- "Suggest a stop" — opens a Google Form once configured; falls back to an email link otherwise
- Data lives in a published Google Sheet, fetched as CSV on page load — no redeploy needed to add a stop
- Approving a submission is a checkbox, not a copy-paste — see the Apps Script in `apps-script/`

## Data

Stops live in a Google Sheet (the `Stops` tab), published to the web as CSV and fetched by `index.html` on load. If the Sheet URL isn't configured yet, or the fetch fails, the site falls back to a small hardcoded seed array so it never shows up empty. Each stop:

```js
{
  id, name, lat, lng,
  type: 'treat_stand' | 'stick_library' | 'water_bowl' | 'toy_box' | 'mixed',
  neighborhood,
  status: 'verified' | 'unverified',
  notes, submitted_by, date_added
}
```

Submissions come in through a separate Google Form → a separate "Form Responses" tab, kept apart from `Stops` on purpose — nothing goes live until it's been walked and confirmed, then copied into `Stops` by hand with real coordinates.

**See [SETUP.md](./SETUP.md)** for the full walkthrough on wiring up the Sheet and Form.

## Tech

Single-file HTML app using [Leaflet](https://leafletjs.com/), OpenStreetMap tiles, and [PapaParse](https://www.papaparse.com/) for CSV parsing. No build step, no backend — same approach as the pantry map, just with a Sheet standing in for a database.

## Roadmap

- [x] Swap hardcoded `stops` array for a published Google Sheet → JSON feed
- [x] Wire up a real "suggest a stop" form
- [ ] Explore commercial layer: sponsored/featured pins for local pet stores, "adopt a stop" restocking partnerships

## About

Corrections and new spottings welcome via issues/PRs once this is live.
