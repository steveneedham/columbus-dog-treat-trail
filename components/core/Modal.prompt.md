A centered backdrop dialog. In the live app it's used for exactly one flow — "Suggest a stop" — linking out to a Google Form (or falling back to a mailto link if the form isn't configured yet).

```jsx
<Modal open title="Suggest a stop" ctaLabel="Open the form →" ctaHref="https://forms.gle/...">
  Seen a treat stand, stick library, water bowl, or toy box on a walk? Tell us where.
</Modal>
```

Thick 2px border, 5px radius, largest shadow token (`--shadow-lg`) — the modal is the single "biggest" surface in the UI, so it gets the boldest depth treatment.
