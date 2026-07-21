A small toggle chip with a color dot, used in the filter panel to show/hide a stop type on the map.

```jsx
<Chip label="Treat stand" color="var(--type-treat-stand)" icon="assets/icons/treat.svg" active onClick={toggle} />
```

Active chips get an ink border and 600 weight; inactive chips fall back to a subtle `--line` border on the paper background. Always paired one-per-stop-type, stacked vertically in a Panel. Pass the matching stop-type icon (treat/stick/water-bowl/toy) alongside the color dot for quicker scanning.
