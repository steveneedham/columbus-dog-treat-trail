The generic floating bordered box used for any map-overlay UI — filter list, legend/status key. White fill, ink border, hard offset shadow.

```jsx
<Panel label="Show">
  <Chip label="Treat stand" color="var(--type-treat-stand)" active />
</Panel>
```

Always absolutely positioned over the map in the real app (top-left for filters, bottom-left for legend) — the Panel itself has no positioning opinion.
