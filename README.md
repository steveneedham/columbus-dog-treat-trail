# Columbus Dog Treat Trail

An interactive map of little dog treat stands, stick libraries, water bowls, and toy boxes spotted on walks around Columbus. Started after noticing a cluster of biscuit stashes in German Village while dog walking — built as a companion to [Columbus PantryMap](https://github.com/steveneedham/columbus-pantry-map), but leaning more "fun neighborhood find" than mutual aid.

**Live map:** https://steveneedham.github.io/columbus-dog-treat-trail/

## Status

Seed / v0.1 — one placeholder pin in German Village, marked **unverified** pending an on-foot check. This is the starting point for crowdsourcing a real dataset; there's no existing directory for this (unlike the pantry map's source orgs), so locations get added by hand or via submitted tips.

## Features

- Type filters: treat stand, stick library, water bowl, toy box, mixed
- Verified / unverified status per stop, with an on-map "mark verified" action
- "Near me" geolocation
- Per-location popups with Google Maps directions
- "Suggest a stop" — currently routes to email; a real submission form (Google Form → Sheet → JSON) is the planned v0.2 upgrade

## Data

Stops are currently hardcoded in `index.html` (see the `stops` array) rather than pulled from a backend. Each stop:

```js
{
  id, name, lat, lng,
  type: 'treat_stand' | 'stick_library' | 'water_bowl' | 'toy_box' | 'mixed',
  neighborhood,
  status: 'verified' | 'unverified',
  notes, submitted_by, date_added
}
```

To add a stop: confirm the location on foot, then add an entry to the `stops` array with real coordinates and `status: 'verified'`.

## Tech

Single-file HTML app using [Leaflet](https://leafletjs.com/) and OpenStreetMap tiles. No build step, no backend — same approach as the pantry map.

## Roadmap

- [ ] Swap hardcoded `stops` array for a published Google Sheet → JSON feed
- [ ] Wire up a real "suggest a stop" form
- [ ] Explore commercial layer: sponsored/featured pins for local pet stores, "adopt a stop" restocking partnerships

## About

Corrections and new spottings welcome via issues/PRs once this is live.
