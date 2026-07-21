The card shown when a map pin is clicked — this is the app's single richest surface (name, optional photo, type/neighborhood/status meta, optional venue note, free-text notes, and action buttons).

```jsx
<PopupCard name="German Village biscuit stash" typeLabel="Treat stand" neighborhood="German Village" status="unverified" notes="Spotted on a dog-walking route." />
```

"Mark verified" only shows for unverified/seasonal-unverified stops — once verified, only the two map links remain. Directions link out to both Google Maps and Apple Maps (so iOS users land in their native app) rather than a single hardcoded provider. Fixed 230px width to match Leaflet's popup content width in the live site.
