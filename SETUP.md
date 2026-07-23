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

### Prefilling exact GPS coordinates (optional, recommended)

The weakest link in the form above is the "Address or cross streets"
question — it relies on someone typing a location from memory. The
Suggest-a-stop modal has a **"Use my current location"** button that
captures the visitor's exact GPS coordinates and, once wired up, drops
them straight into that question instead:

1. Open your live form → the **⋮** menu → **Get pre-filled link**.
2. Fill in the "Address or cross streets" question with any placeholder
   text (e.g. `test`), leave the rest blank, and click **Get link**.
3. Copy the link it gives you and find `entry.<a long number>=test` in
   the query string — that number is the entry ID for that question.
4. Paste just the number into `CONFIG.FORM_ENTRY_ADDRESS` near
   `CONFIG.FORM_URL` in `index.html`.

With that set, clicking "Use my current location" rewrites the "Open
the form" link to include `entry.<id>=<lat>,<lng>`, so the question
arrives pre-answered with the device's coordinates. `approval.gs` (see
step 3 below) recognizes that `lat,lng` shape and uses it directly
instead of geocoding — a GPS fix is more accurate than anything
geocoding can derive from typed text.

Leave `FORM_ENTRY_ADDRESS` blank and the button still works: it
captures the coordinates, copies them to the clipboard, and shows them
on screen to paste in by hand.

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

## 12. Optional: "Join the trail" sign-in (`signup.html`)

`signup.html` is a real, working page — not a stand-in — but it does
nothing until you set `GOOGLE_CLIENT_ID` near the top of its script.
It deliberately only offers **Google sign-in**, not a custom
email/password form: a static site with no server has no safe way to
hash and store real passwords, and Google Identity Services hands you
a genuinely verified identity (a real email address, no account
creation flow for you to build or secure) for free.

1. In [Google Cloud Console](https://console.cloud.google.com/), create
   (or reuse) a project, then **APIs & Services → Credentials → Create
   Credentials → OAuth client ID → Web application**.
2. Under **Authorized JavaScript origins**, add this site's real
   origin (e.g. `https://steveneedham.github.io`) — Google Identity
   Services will refuse to initialize from an unlisted origin.
3. Copy the resulting Client ID (`xxxxxxxxxx.apps.googleusercontent.com`)
   into `GOOGLE_CLIENT_ID` near the top of `signup.html`'s script.

Until that's set, the page shows "Sign-in isn't configured yet"
instead of a broken button — same graceful-degradation pattern as
every other optional `CONFIG` value on this site.

**What actually happens on sign-in:** Google's own button (rendered by
their SDK, not a custom-styled fake) opens the real Google account
picker. On success, the page decodes the returned ID token client-side
(just base64 — nothing is verified server-side) to get `{ name, email,
sub, picture }`, saves it to this browser's `localStorage` as
`cdtt_member`, and `index.html`'s nav shows "Hi, {name}" instead of
"Join the trail" from then on.

**Making it durable across devices (optional):** by default the signed-
in identity only lives in that one browser. To persist it:

1. In the same Apps Script project as the other endpoints, add
   [`join.gs`](./join.gs).
2. Add a **Members** tab to the spreadsheet: header row
   `google_sub | name | email | joined_at`.
3. Deploy `join.gs` as its own Web App (same Execute-as-Me,
   Anyone-can-access pattern as `verify.gs`) and paste the URL into
   `JOIN_URL` near the top of `signup.html`.

Read the security note at the top of `join.gs` — it trusts whatever
the browser sends it, same honesty-over-security tradeoff as the
rest of this no-login site's endpoints.

## 13. Optional: reports that fade a pin back to unverified, and upvoting an already-verified stop

Two related v0.6 changes to `index.html`'s map popup:

- **Report** is no longer only for unverified stops — every stop has a
  "Report" button now. As reports come in, the pin visibly fades
  (opacity drops toward ~0.35) even before anything officially
  changes; once `CONFIG.REPORT_FADE_THRESHOLD` (default 3) independent
  reports land, a verified stop flips back to `unverified` so it goes
  through the same on-foot confirmation loop as a new stop.
- **"Mark verified"** now also works on already-verified stops —
  relabeled "Still here ✓", it's an upvote: reconfirming a stop
  increments `verify_count` and resets `report_count` to 0, since a
  fresh reconfirmation outweighs stale reports.

Both need two optional columns on `Stops`: `verify_count` and
`report_count` (blank/missing = 0 for every existing row, fully
backward compatible). Without them, both buttons still work in a
"local preview only" mode (same graceful-degradation pattern as
everywhere else) — they just don't persist across visitors.

To make it real:

1. Add `verify_count` and `report_count` columns to `Stops` (any
   position — both endpoints find columns by header name).
2. `verify.gs` already reads/writes both (redeploy it if you deployed
   an older version before this change).
3. Add [`report.gs`](./report.gs) as a new script file in the same
   Apps Script project, deploy it as its own Web App (same
   Execute-as-Me, Anyone-can-access pattern as `verify.gs`), and paste
   the URL into `CONFIG.REPORT_URL` near the top of `index.html`.

Read the security note at the top of `report.gs` first — flipping a
stop backward from verified to unverified is a deliberate, narrow
exception to `verify.gs`'s "only ever moves forward" rule, mitigated
by requiring multiple independent reports (and a per-browser
localStorage guard against one visitor reporting the same stop
twice) rather than trusting any single report.

## 14. Popular stops render bigger on the map

Pins now scale up with `verify_count` — a stop a lot of people have
confirmed "still here" on reads as bigger, capped so a handful of
superfans can't blow one pin up to dominate the whole map (see
`pinSizeFor()` in `index.html`, sqrt-scaled, 22px base → 34px cap
around 16 confirmations). No setup needed beyond what step 13 above
already covers — this reads the same `verify_count` column.

## 15. Real email sign-up for the weekly digest

Section 9 originally built the weekly digest as manually-curated only
— there was no safe way to make it public without an opt-in +
unsubscribe flow. This adds that flow, so `index.html`'s "Weekly
updates" box is a real, working subscribe form.

1. In the same Apps Script project as the other endpoints, add
   [`subscribe.gs`](./subscribe.gs).
2. Add a **Subscribers** tab to the spreadsheet: header row
   `email | subscribed_at | unsubscribed_at`.
3. Deploy `subscribe.gs` as its own Web App (same Execute-as-Me,
   Anyone-can-access pattern as the other endpoints). It handles both
   subscribing (`doPost`) and unsubscribing via a plain link
   (`doGet`, `?action=unsubscribe&email=...`) — no JS needed to
   unsubscribe from an email client.
4. Paste that deployment URL into `CONFIG.SUBSCRIBE_URL` near the top
   of `index.html`.
5. Also paste it into a `SUBSCRIBE_URL` Script Property (Project
   Settings → Script Properties) — `digest.gs` uses this to build each
   recipient's personalized unsubscribe link.
6. `digest.gs` now sends **individually** to each recipient (not one
   bulk-CC'd email) — the union of `DIGEST_RECIPIENTS` (manually-added
   people) and every non-unsubscribed row in Subscribers — so nobody
   sees anyone else's address and unsubscribing actually works.

Leave `CONFIG.SUBSCRIBE_URL` blank and the box still works — it falls
back to a prefilled `mailto:` so you can add people by hand, same
degradation pattern as everything else here. Real bulk email still has
a `MailApp` daily send quota and no sender-reputation warmup, worth
keeping in mind if this list grows well past a small neighborhood.

## 16. Meet Scout

`assets/mascot-scout.svg` is a new, more detailed illustrated mascot —
distinct from the existing abstract paw-compass/dog-face marks, which
stay as the logo/favicon system. Scout is a first-pass appearance,
currently in exactly two spots:

- `onboarding.html`'s first screen ("Meet Scout")
- `index.html`'s "no stops in view" map banner ("Scout can't find any
  stops here")

Nowhere else references him yet — intentionally minimal for a first
pass rather than sprinkling him everywhere at once. Natural next spots
if you want more: the other empty states (offline, GPS-denied), a
loading state, or `neighborhoods.html`/`routes.html` when there's
nothing to show yet.

## 17. Optional: anonymous usage analytics (interest heatmap + popular stops)

Two related, deliberately low-stakes signals, both off unless you wire
them up, both handled by one endpoint ([`engagement.gs`](./engagement.gs))
so there's one setup step instead of two:

- **Interest pings** — a rounded (~110m) lat/lng, logged at most once
  per visit, and *only* right after a visitor has already granted
  location for something else ("Near me" or "Use my current location"
  in Suggest-a-stop). Nothing else about the visitor is recorded — no
  name, email, device info, or stop id — and this never pops its own
  location prompt. Answers "which parts of Columbus is the map
  actually being used from".
- **Stop view counts** — a `view_count` bump the first time each
  stop's popup opens in a visit. Answers "which stops get looked at
  the most".

### Setup

1. In the same Apps Script project as `approval.gs`/`verify.gs`, add
   [`engagement.gs`](./engagement.gs) as a new script file.
2. Add a `view_count` column to `Stops` (any position — found by
   header name, existing rows count as 0 until touched). You don't
   need to create a `Pings` tab yourself — the script creates it the
   first time a ping lands.
3. Deploy `engagement.gs` as its own Web App (same Execute-as-Me,
   Anyone-can-access pattern as `verify.gs`), and paste the deployment
   URL into `CONFIG.ENGAGEMENT_URL` near the top of `index.html`.
   Leave it blank and both features are silently skipped.

### Exploring interest pings with kepler.gl

1. Publish the `Pings` tab to the web as CSV, same steps as `Stops` in
   section 1 (File > Share > Publish to web > pick the `Pings` tab >
   CSV).
2. Open [kepler.gl](https://kepler.gl/demo) (no account needed) and
   either drag in a downloaded copy of that CSV, or add it by URL
   under "Add Data".
3. Kepler auto-detects the `lat`/`lng` columns — switch the layer type
   to **Heatmap** to see where the map is getting the most use.

### Popular stops

`view_count` lives on the `Stops` tab like `verify_count`/
`report_count` — sort or filter that column directly in Sheets to see
what's getting looked at. Nothing in `index.html` reads or displays it
today, so adding it doesn't change anything visitors see.

## 18. Optional: "Design your promo" (`promo.html`) — QR landing for businesses

This is the README's "commercial layer" roadmap item (sponsored/
featured pins — see section 6) made concrete as a real page: a QR
code on a physical sign or flier at a stop can point here, and a
business owner walks through a 4-step wizard (their info → the offer
→ a live preview of what their sponsored pin/popup would look like →
send it in) instead of you fielding it ad hoc by email or text.

It's a stub in the honest sense — there's no real backend behind it
yet, just like `FORM_URL` before section 2 was set up:

- Leave `CONFIG.PROMO_FORM_URL` (near the top of `promo.html`'s
  `<script>` block) blank and "Send it in" opens a prefilled `mailto:`
  with everything they entered, same fallback pattern as the old
  Suggest-a-stop flow.
- If you later build a real Google Form for business sign-ups, paste
  its link into `PROMO_FORM_URL` and that button opens it instead. It
  doesn't prefill any fields yet the way `FORM_ENTRY_ADDRESS` does for
  Suggest-a-stop — that'd need the same "Get pre-filled link" entry-ID
  lookup per field if you want it, see section 2.

The preview step doesn't publish anything — turning a submission into
a real sponsored pin is still the same manual step as section 6
(you add/edit a row in `Stops` with `sponsored` set).

### Capturing where the QR code gets scanned

Tapping past the first screen ("Design my promo →") asks for the
visitor's location — the one deliberate exception to this whole
site's "never request location just for tracking" rule, because
`promo.html` has no other feature to piggyback a prompt on the way
index.html's pings do (see section 17). The browser's own permission
dialog is the consent, and there's a one-line note above the button
explaining why before it fires.

If granted, two things happen, both using the same `engagement.gs`
from section 17 (paste the same deployment URL into
`CONFIG.ENGAGEMENT_URL` near the top of `promo.html`, blank = both
skipped):

- An anonymous, rounded (~110m) location ping logs to the `Pings` tab
  tagged `source=promo`, so you can tell QR scans apart from map
  "near me" pings (`source=map`) when you pull it into kepler.gl.
- The wizard auto-fills the "nearest neighborhood" field by comparing
  the visitor's position against every loaded stop (only if something
  is within ~2 miles — otherwise it leaves the field for them to fill
  in, rather than guessing).

Declining the prompt, or `ENGAGEMENT_URL` being blank, doesn't block
anything — the wizard advances immediately either way and the
neighborhood field just stays manual.

### Generating a QR code for it

Once the site's deployed, any QR generator pointed at
`https://steveneedham.github.io/columbus-dog-treat-trail/promo.html`
works — there's nothing app-specific about the code itself.

## 19. Optional: ScoutSights (`scoutsights.html`) — real GA4 reporting + a Pings heatmap

This turns the earlier "publish a CSV, drag it into kepler.gl by hand"
workflow (section 17) and a real Google Analytics report into one
admin-facing page in the app itself, styled like the rest of the site
rather than a generic tool screenshot. Like `moderation.html`, it's not
linked from the main nav and has no login — same honesty-over-security
tradeoff as the rest of this no-login site (see `report.gs`'s security
note). Both panels are independently optional.

### Google Analytics panel

This is the one integration in the project that isn't "paste a
deployment URL and go" — Apps Script can't infer it needs Analytics
access on its own, so [`ga-report.gs`](./ga-report.gs) needs two extra
steps beyond the usual. Full instructions are in the comment at the
top of that file, but in short:

1. Add `ga-report.gs` as a new Apps Script file (its own project, or a
   new file in the existing one — it never touches the Stops sheet).
2. Find your **GA4 property ID** (Analytics > Admin > Property details
   — a plain number, not the `G-XXXXXXX` measurement ID already in
   `assets/analytics.js`) and paste it into `GA4_PROPERTY_ID`.
3. In the Apps Script editor, show the `appsscript.json` manifest and
   add an `oauthScopes` array requesting
   `analytics.readonly` + `script.external_request` — without this the
   report call 403s.
4. Confirm the account that owns the script has Viewer access on the
   GA4 property, then deploy as a Web App (Execute as Me, Anyone can
   access) and paste the URL into `CONFIG.GA_REPORT_URL` near the top
   of `scoutsights.html`.

Once set, the panel shows real 30-day totals (users, sessions,
engagement rate, average engagement time), a sessions-per-day
sparkline, and the top pages by views — all pulled live from GA4 and
cached for an hour so refreshing the page doesn't burn through the
Data API's daily quota. Leave `GA_REPORT_URL` blank and the panel just
explains what's missing instead of erroring.

### Location interest heatmap panel

Uses the real `Pings` tab from section 17 — publish it to the web as
CSV the same way as `Stops`, and paste that URL into
`CONFIG.PINGS_CSV_URL`. The panel then renders an actual Leaflet map
with a `leaflet.heat` layer over the real pings (colored moss → amber
→ rust, the site's own accent colors), auto-fit to wherever the data
actually is. Leave it blank and, again, it just explains what's
missing. Exploring the same data in kepler.gl (section 17) still works
independently — this doesn't replace that, it's just a faster
day-to-day glance without leaving the app.

## 20. "You are here" avatar + first-visit welcome tour

Two small additions to "Near me" in `index.html`, no setup required —
both read only from things visitors have already done elsewhere in
the app:

**Your own avatar as the location pin.** Instead of a generic dot,
"Near me" now shows whichever identity this browser already has:

- Signed in via `signup.html` (`cdtt_member` in localStorage) → their
  Google profile picture.
- Named via `profile.html` (`cdtt_profile_name` + `cdtt_avatar_choices`)
  → their chosen avatar, same resolution order as that page.
- Neither → the same greyed-out "locked" avatar art `profile.html`
  already uses for an unearned avatar (`avatar-04-locked.svg`), so
  anonymous visitors get a visibly different, "not yet personalized"
  pin rather than a copy of everyone else's. Tapping it opens a popup
  with "Join the trail →" / "Pick a name →" links.

**First-visit welcome tour.** The first time "Near me" lands somewhere
with stops nearby in a neighborhood this browser hasn't seen before
(tracked in `cdtt_visited_hoods`), a small modal introduces it by name
and spotlights its top 3 stops by `verify_count` — "walked and
confirmed by other neighbors," not just whatever's closest. Shows once
per neighborhood per browser; the teleport-to-nearest banner (section
above it in `index.html`) and this tour are mutually exclusive — one
fires when nothing's nearby, the other only when something is.
