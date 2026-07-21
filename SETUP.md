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
   id  name  lat  lng  type  neighborhood  status  notes  submitted_by  date_added  venue  photo_url
   ```

   `venue` and `photo_url` are new in v0.5 — `venue` holds the raw
   "private home or business" answer as free text (informational, not
   used for filtering yet), and `photo_url` holds a direct-viewable
   link to the submitted photo, if any (see step 3 for how that gets
   populated and shared).

3. Add the current seed row so the live sheet matches what's already on
   the map:

   | id | name | lat | lng | type | neighborhood | status | notes | submitted_by | date_added | venue | photo_url |
   |----|------|-----|-----|------|--------------|--------|-------|--------------|------------|-------|-----------|
   | 1 | German Village biscuit stash (unconfirmed spot) | 39.9469 | -82.9934 | treat_stand | German Village | unverified | Spotted on a dog-walking route — exact address still needs confirming on foot. | Steven | 2026-07-16 | | |

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

1. Create a Google Form, e.g. **"Suggest a Dog Treat Trail Stop"**.
   The live form currently has:
   - **Stop name** (short answer, required)
   - **Type** (dropdown, required) — Treat stand / Stick library /
     Water bowl / Toy box / Mixed / Not sure
   - **Neighborhood** (short answer, optional)
   - **Notes** (paragraph, optional) — what they saw, condition, etc.
   - **Your name** (short answer, optional)
   - **Email** (short answer, optional) — in case you want to follow up
   - **Address or cross streets** (short answer, required) — used only
     for geocoding, not stored on the pin
   - **Is this available year-round, or seasonal?** (dropdown/short
     answer) — see step 5
   - **Is this at a private home or a business?** (not read by
     `approval.gs` yet — informational for your own review)
   - **Photo** (file upload, optional — not read by `approval.gs` yet)

   You don't need all of these to get started — `approval.gs` only
   requires headers containing `stop name`, `type`, `neighborhood`,
   `notes`, `your name`, `address or cross`, and `year-round` to exist
   somewhere in the sheet (see step 3). Add or reorder questions
   freely; the script finds each field by header text, not position.

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
row as `unverified` (or `seasonal-unverified`, see step 5) — flipping
something to `verified` still requires you to actually confirm it and
edit `Stops` directly (or use the "Mark verified" button from step 4),
so this only automates the copy-paste, not the on-foot check.

1. In the `Form Responses` tab, add two columns after the form's own
   columns: **Approve?** and **Copied?** (the script writes "Copied"
   into that second one after processing — leave it blank otherwise).

   **The script reads columns by header text, not position** — it
   looks for a header containing `"stop name"`, `"type"`,
   `"neighborhood"`, `"notes"`, `"your name"`, `"address or cross"`,
   `"year-round"`, `"private home or a business"`, `"photo"`,
   `"approve"`, and `"copied"` (see `HEADER_KEYWORDS` at the top of
   `approval.gs`). This means it doesn't matter which order your
   form's questions land in — only that each header still contains
   its keyword somewhere. If you rename a question enough that the
   keyword no longer matches, the script throws a clear error naming
   the missing keyword rather than silently reading the wrong cell.

2. **Extensions → Apps Script**, clear the placeholder code, and
   paste in [`approval.gs`](./approval.gs)
   from this repo.
3. Click the clock icon (**Triggers**) in the left sidebar → **+ Add
   Trigger**, and set:
   - Function to run: `onApproveEdit`
   - Deployment: `Head`
   - Event source: `From spreadsheet`
   - Event type: `On edit`

   Save, then approve the Google permission prompt — this now
   includes **Drive**, alongside Sheets and Maps, because approving a
   stop with a photo makes that one photo file viewable (see the
   PHOTO HANDLING note at the top of `approval.gs` for exactly what
   gets shared and what doesn't).

From then on: type `Y` in the `Approve?` cell for a response row. The
script geocodes the address, slugifies the type (`"Toy box"` →
`"toy_box"`), appends a row to `Stops` with the next `id`, the
**Stop name** answer as the pin's name, today's date, status
`unverified` (or `seasonal-unverified`), the raw **venue** answer, and
— if a photo was uploaded — a public view link for it, then writes
`Copied` in the flag column so re-entering `Y` later won't duplicate
it.

Because the coordinates come from geocoding the typed address rather
than a confirmed pin, treat a freshly-approved row as a starting
point — glance at it (or walk it) before manually flipping its
`status` to `verified` in `Stops`.

That's it — no redeploy needed for new stops, since the site reads the
Sheet at page load. You only touch `index.html` again if you change the
schema or want to tweak the two CONFIG values.

## 4. v0.5: real "Mark verified" persistence (optional, recommended)

Before v0.5, the map's "Mark verified" button only updated the
visitor's own browser — nothing was saved anywhere. This step makes it
actually write back to `Stops`.

1. In the same Apps Script project as `approval.gs`, add a new script
   file (**File → New → Script**) and paste in
   [`verify.gs`](./verify.gs).
2. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, authorize the prompt, and copy the deployment URL.
3. Paste that URL into `CONFIG.VERIFY_URL` in `index.html`. Leave it
   blank to keep the old v0.1 local-only-preview behavior.

Read the security note at the top of `verify.gs` before deploying — a
static site can't have real authentication, so the endpoint is
intentionally restricted to one-way writes (unverified → verified
only) rather than protected by a login.

## 5. v0.5: seasonal stops (optional)

If some stops (e.g. outdoor toy boxes or water bowls) go dormant in
winter, you can flag them as seasonal instead of deleting the row.
This is already live on the form (the "Is this available year-round,
or seasonal?" question) — `approval.gs` finds it by header text
wherever it lands in the sheet and writes `seasonal-unverified`
instead of `unverified` when the answer starts with "seasonal".

To flip a seasonal stop to verified, set its `status` in `Stops` to
`seasonal-verified` (or use the persisted "Mark verified" button from
step 4, which handles this automatically).

On the map, seasonal stops get a **dashed ring** instead of a solid
one — see the legend.

## 6. Optional: sponsored/featured pins

Add a `sponsored` column to `Stops` (any value — `y`/`yes`/`true`/`1`
all count as "on", anything else including a blank cell is "off").
A sponsored stop gets an amber ring + star badge on the map, in
popups, and on `stop-detail.html`. This is wired up as pure visual
plumbing for the README's "commercial layer" roadmap item — nothing
elsewhere in the site charges for it or manages who's sponsored.

## 7. Optional: the moderation queue (`moderation.html`)

`moderation.html` is a **read-only** view of pending submissions — it
doesn't (and, being a static page with no login, can't) write
approvals back to the sheet. Approving still means the same manual
"type `Y` in the Approve? column" step from Step 3 above, or letting
`approval.gs` do it. To turn the page on:

1. Publish the **Form Responses** tab as its own CSV, the same way as
   the `Stops` tab in Step 1 (File → Share → Publish to web → pick
   the Form Responses tab → CSV → Publish).
2. Paste that URL into `CONFIG.SUBMISSIONS_CSV_URL` near the top of
   `assets/stops-client.js`.

Leave it blank and the page just says so instead of showing fake
data — same "leave it blank to skip" pattern as the rest of `CONFIG`.

## 8. The other new pages

`neighborhoods.html`, `stop-detail.html`, `profile.html`, `routes.html`,
and `trail-flier.html` all read the same published `Stops` CSV (via
`assets/stops-client.js`) and need no extra setup — they work as soon
as `CONFIG.SHEET_CSV_URL` in `index.html` does. `profile.html`'s
leaderboard and avatar tiers are derived entirely from the `status`
and `submitted_by` columns already in `Stops`; there's no separate
accounts system, so "which contributor are you" is just a
locally-remembered picker, not a login.

`onboarding.html` is shown once per browser (via `localStorage`)
before someone's first `index.html` view, then never again unless
their browser storage is cleared. Add `?skip_onboarding=1` to any
`index.html` link to bypass it (handy for the flier or your own
testing).

## 9. Optional: weekly digest email

`email-templates/weekly-digest.html` + [`digest.gs`](./digest.gs) send
a "N new stops verified this week" email built from whatever's newly
verified in `Stops`. This is **not** a public newsletter signup — it's
meant for a short, manually-curated recipient list you set yourself
(`DIGEST_RECIPIENTS` in Script Properties), the same trust model as
`approval.gs`/`verify.gs`. See the comment at the top of `digest.gs`
for setup steps and why this deliberately isn't a public opt-in list.

## 10. Optional: contributors choosing their own avatar

`profile.html` lets each contributor pick which of the 10 base avatar
faces represents them (a deliberate change from the design system's
own sketch, which framed the face as an earned unlock — see
`admin.html`'s Avatars section). Works with zero setup: picks are
remembered per-browser in `localStorage`, so the picker sees their own
choice everywhere, but nobody else does. To make picks visible to
every visitor instead:

1. In the same Apps Script project as `approval.gs`/`verify.gs`/`digest.gs`,
   add a new script file and paste in [`set-avatar.gs`](./set-avatar.gs).
2. In the same spreadsheet, add a tab named exactly **Contributors**
   with header row `name | avatar_slug`.
3. Deploy `set-avatar.gs` as its own Web App (same Execute-as-Me,
   Anyone-can-access pattern as `verify.gs`) and paste the deployment
   URL into `SET_AVATAR_URL` near the top of `profile.html`.
4. Publish the Contributors tab as its own CSV (same "Publish to web"
   flow as `Stops`) and paste that URL into
   `CONFIG.CONTRIBUTORS_CSV_URL` in `assets/stops-client.js`.

Read the security note at the top of `set-avatar.gs` first — like
`verify.gs`, there's no real auth, but the worst case here is purely
cosmetic (someone's avatar face changes), not a data-integrity risk.

## 11. Optional: Google Analytics

`assets/analytics.js` is a GA4 loader shared by every page — it does
nothing until you set `GA_MEASUREMENT_ID` near the top of that file.

1. Create a GA4 property at https://analytics.google.com (or use an
   existing one) and find its Measurement ID under Admin → Data
   Streams → your web stream (looks like `G-XXXXXXXXXX`).
2. Paste it into `GA_MEASUREMENT_ID` in `assets/analytics.js`. Every
   page that includes this script (all of them, as of this write-up)
   starts sending pageviews immediately — no redeploy of anything else
   needed.

Worth deciding deliberately, not just flipping on: this is real
visitor tracking on a small, personal, transparency-minded site — if
you want to be upfront about it in the spirit of the rest of the
site's voice, a one-line mention somewhere on the map (or a
`privacy.html`) would fit, though nothing here requires it for GA4's
default (cookie-based, no PII) event collection in most jurisdictions.
Not legal advice — check what applies to you if you expect EU/UK
visitors.
