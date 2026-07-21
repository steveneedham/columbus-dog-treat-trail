A bottom-center confirmation toast for quick feedback after an action — e.g. "Submission received" or "Stop marked verified".

```jsx
<Toast open kind="success" message="Stop marked verified — thanks!" onClose={() => setOpen(false)} />
```

Colored border + dot match the `kind` (moss/rust/ink); same hard-shadow, ink-border language as Panel and PopupCard. Intentional addition — no toast exists in the source yet, but the "Mark verified" and "Suggest a stop" actions both imply one.
