Bordered, hard-edged button used for every clickable action in the app — top-bar actions, popup actions, modal CTA.

```jsx
<Button variant="primary" icon="+">Suggest a stop</Button>
<Button icon="📍">Near me</Button>
```

Variants: `default` (white, ink border, inverts to solid ink on hover) and `primary` (rust fill, reserved for the single most important action on screen). Press state shrinks to scale(0.97) — no shadow change. Never fully rounded; radius is `--radius-lg` (4px).
