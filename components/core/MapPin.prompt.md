The Leaflet marker icon — a filled circle (stop-type color) with a status ring (moss = verified, amber = unverified), dashed instead of solid when the stop is seasonal.

```jsx
<MapPin color="var(--type-treat-stand)" status="unverified" />
<MapPin color="var(--type-water-bowl)" status="verified" seasonal />
<MapPin color="var(--type-mixed)" status="verified" sponsored />
```

In the live app this renders via Leaflet's `L.divIcon` with the same inline styles — this component is the visual spec other implementations should match. `sponsored` is an intentional addition for the README's "commercial layer" roadmap item (featured/sponsored pins) — not in the current source, flagged accordingly.
