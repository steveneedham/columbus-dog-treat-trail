# Setting up the Sheet → JSON pipeline + submission form

This replaces the hardcoded `stops` array with a live Google Sheet, and
replaces the mailto link with a real Google Form — plus a small script
so approving a submission doesn't require manual copy-paste. Nothing
here needs a build step or a backend — it's still a single static
`index.html`.

Three pieces to set up, in order:

## 1. The data sheet ("Stops")

1. Create a new Google Sheet, e.g. **"Columbus Dog Treat Trail — Data"**.
2. Rename the first tab to `Stops`. Header row (exact names, this order):

   ```
   id  name  lat  lng  type  neighborhood  status  notes  submitted_by  date_added
   ```

3. Add the current seed row so the live sheet matches what's already on
   the map:

   | id | name | lat | lng | type | neighborhood | status | notes | submitted_by | date_added |
   |----|------|-----|-----|------|--------------|--------|-------|--------------|------------|
   | 1 | German Village biscuit stash (unconfirmed spot) | 39.9469 | -82.9934 | treat_stand | German Village | unverified | Spotted on a dog-walking route — exact address still needs confirming on foot. | Steven | 2026-07-16 |

   `type` must be one of: `treat_stand`, `stick_library`, `water_bowl`,
   `toy_box`, `mixed` — anything else gets silently dropped by the site's
   loader (the TYPE_META check), so double-check spelling.

4. **Publish just this tab as CSV:** File → Share → Publish to web →
   under "Link", pick the `Stops` sheet (not "Entire document") →
   format **CSV** → Publish. Copy the URL — it looks like:

   ```
   https://docs.google.com/spreadsheets/d/e/2PACX-XXXXXXXX/pub?gid=0&single=true&output=csv
   ```

5. Paste that URL into `CONFIG.SHEET_CSV_URL` near the top of the
   `<script>` block in `index.html`.

**Note on caching:** Google's "publish to web" export is cached and
typically refreshes every few minutes, not instantly. If you edit a row
and don't see it on the site right away, give it a few minutes (or open
the CSV URL directly in a new tab — once *that* shows your change, the
site will too on next load).

## 2. The submission form ("Suggest a stop")

This intentionally does **not** write to the `Stops` tab directly —
anyone with the form link could otherwise put unverified junk straight
on the map. Instead it writes to its own tab, and you promote entries
to `Stops` by hand once you've walked them.

1. Create a Google Form, e.g. **"Suggest a Dog Treat Trail Stop"**, with:
   - **Location** (short answer, required) — "Address or nearest
     cross-streets"
   - **Type** (dropdown, required) — Treat stand / Stick library /
     Water bowl / Toy box / Mixed / Not sure
   - **Neighborhood** (short answer, optional)
   - **Notes** (paragraph, optional) — what they saw, condition, etc.
   - **Your name** (short answer, optional)
   - **Email** (short answer, optional) — in case you want to follow up

2. In the Form's **Responses** tab, click the Sheets icon and link
   responses to the same spreadsheet from step 1, as a new tab (Google
   will name it something like `Form Responses 1`). Keep this separate
   from `Stops`.

3. Get the shareable link: **Send** → link icon → copy URL (or use a
   `forms.gle` short link if you turn that on).

4. Paste that URL into `CONFIG.FORM_URL` near the top of the
   `<script>` block in `index.html`.

### Your review workflow going forward

1. Check the `Form Responses` tab periodically.
2. For anything worth checking out, walk it, confirm it's real, and
   look up the exact coordinates (right-click the spot on Google Maps →
   the lat/lng shows up at the top of the context menu → click it to
   copy).
3. Add a new row to `Stops` with real `lat`/`lng`, `status: verified`
   (or `unverified` if you're logging it but haven't walked it yet),
   and a `date_added`. Delete or mark the response row as handled in
   `Form Responses` however you like — it's just your own scratch pad
   and never read by the site.

Step 3 there is the one that's easy to let slide, since it's manual
copy-paste with no reminder. **Step 3 below automates it.**

## 3. Automate the approval step (recommended)

Instead of retyping each response into `Stops` by hand, add a small
Apps Script so approving a spot is: type "Y" in one cell, done. It
geocodes the typed address automatically and always files the new
row as `unverified` — flipping something to `verified` still requires
you to actually confirm it and edit `Stops` directly, so this only
automates the copy-paste, not the on-foot check.

1. In the `Form Responses` tab, add two columns right after the
   form's own columns: **Approve?** and a blank flag column (the
   script writes "Copied" into the second one after processing —
   no header needed there, just leave it blank).

   **Verify your actual column order first.** The script reads by
   fixed position (columns A–H for the form fields, I for Approve?,
   J for the flag) — it assumes: Timestamp, Email Address (if
   "Collect email addresses" is on), Address, Type, Neighborhood,
   Notes, Your name, Email. If your form's columns land in a
   different order, adjust the indices in the script accordingly.

2. **Extensions → Apps Script**, clear the placeholder code, and
   paste in [`apps-script/approval.gs`](./apps-script/approval.gs)
   from this repo.
3. Click the clock icon (**Triggers**) in the left sidebar → **+ Add
   Trigger**, and set:
   - Function to run: `onApproveEdit`
   - Deployment: `Head`
   - Event source: `From spreadsheet`
   - Event type: `On edit`

   Save, then approve the Google permission prompt. (`Maps` is a
   built-in Apps Script service — no API key or billing needed.)

From then on: type `Y` in the `Approve?` cell for a response row. The
script geocodes the address, slugifies the type (`"Toy box"` →
`"toy_box"`), appends a row to `Stops` with the next `id`, today's
date, and status always `unverified`, then writes `Copied` in the
flag column so re-entering `Y` later won't duplicate it.

Because the coordinates come from geocoding the typed address rather
than a confirmed pin, treat a freshly-approved row as a starting
point — glance at it (or walk it) before manually flipping its
`status` to `verified` in `Stops`.

That's it — no redeploy needed for new stops, since the site reads the
Sheet at page load. You only touch `index.html` again if you change the
schema or want to tweak the two CONFIG values.
