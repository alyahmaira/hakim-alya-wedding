# hakim-alya-wedding Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the `hakim-alya-wedding` repo as a groom-led duplicate of `alya-hakim-wedding/version-2`'s garden-envelope design — same structure/animations, a deep-green-instead-of-burgundy palette, "Hakim & Alya" name order, and RSVP wired to the already-live `GROOM_RSVP_ENDPOINT`.

**Architecture:** Single static page (`index.html` + `assets/`) plus one Vercel serverless function (`api/rsvp.js`, copied unchanged — it's already side-agnostic). No build step, no new dependencies.

**Tech Stack:** Static HTML/CSS/vanilla JS, Node.js serverless function (CommonJS, Vercel runtime), Node's built-in test runner (`node:test`).

**Reference spec:** `docs/superpowers/specs/2026-10-30-hakim-alya-wedding-design.md`

**Source repo for copying:** `/Users/alyaaccess/dev/wedding/alya-hakim-wedding/version-2/`
**Target repo (already created + cloned):** `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/`

---

### Task 1: Scaffold the repo from version-2

**Files:**
- Create: everything under `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/` (copied from source)
- Create: `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/.gitignore`

- [ ] **Step 1: Copy static assets and code, excluding Vercel/env secrets**

```bash
cd /Users/alyaaccess/dev/wedding
rsync -a \
  --exclude='.vercel' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.git' \
  --exclude='.gitignore' \
  --exclude='docs' \
  alya-hakim-wedding/version-2/ hakim-alya-wedding/
```

Expected: `hakim-alya-wedding/` now contains `index.html`, `POST-BUILD.md`, `.env.example`, `api/rsvp.js`, `api/rsvp.test.js`, and `assets/` (with `envelope.jpg`, `scene.jpg`, `gift-qr.jpg`, `music.m4a`, `family/`, `gallery/`, `photos/`). `docs/` (already containing the design spec from a prior step) and `.vercel`/`.env*` are untouched/excluded.

- [ ] **Step 2: Verify no secrets were copied**

Run: `ls -la /Users/alyaaccess/dev/wedding/hakim-alya-wedding/`
Expected: no `.vercel` directory, no `.env` or `.env.local` file present — only `.env.example`.

- [ ] **Step 3: Write the repo's `.gitignore`**

Create `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/.gitignore`:

```
.DS_Store
.vercel
.env*
node_modules/
```

- [ ] **Step 4: Commit**

```bash
cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding
git add index.html POST-BUILD.md .env.example .gitignore api assets
git commit -m "Scaffold hakim-alya-wedding from alya-hakim-wedding/version-2"
```

---

### Task 2: Verify the RSVP backend works unchanged

**Files:** none (verification only — `api/rsvp.js`/`api/rsvp.test.js` were copied verbatim in Task 1 and are already side-agnostic)

- [ ] **Step 1: Run the copied test suite**

Run: `cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding && node --test api/rsvp.test.js`
Expected: PASS — 4 tests passing, 0 failing (same handler as the bride repo; this just confirms the copy is intact).

---

### Task 3: Point the RSVP form at the groom endpoint

**Files:**
- Modify: `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/index.html`

- [ ] **Step 1: Change the endpoint constant**

Find:

```js
  const RSVP_ENDPOINT = '/api/rsvp?side=bride';
```

Replace with:

```js
  const RSVP_ENDPOINT = '/api/rsvp?side=groom';
```

- [ ] **Step 2: Change the submit payload's `side` field**

Find:

```js
    const reply = {
      name, phone, attendance: att,
      guestCount, guestGroup,
      message: $('#rNotes').value.trim(),
      side: 'bride'
    };
```

Replace with:

```js
    const reply = {
      name, phone, attendance: att,
      guestCount, guestGroup,
      message: $('#rNotes').value.trim(),
      side: 'groom'
    };
```

- [ ] **Step 3: Personalize the guest-group dropdown labels**

Find:

```js
  function renderGroupOptions() {
    const t = I18N[LANG], list = $('#groupList');
    const labels = t.guestgroup_labels('Alya');
```

Replace with:

```js
  function renderGroupOptions() {
    const t = I18N[LANG], list = $('#groupList');
    const labels = t.guestgroup_labels('Hakim');
```

- [ ] **Step 4: Update the `GUEST_GROUP_VALUES` wording (canonical English values stored in the sheet)**

Find:

```js
  const GUEST_GROUP_VALUES = ['Relatives', 'Friends', "Bride's Friends and Colleagues"];
```

Replace with:

```js
  const GUEST_GROUP_VALUES = ['Relatives', 'Friends', "Groom's Friends and Colleagues"];
```

- [ ] **Step 5: Verify the script still parses**

Run: `cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding && node -e "const fs=require('fs'); const src=fs.readFileSync('index.html','utf8'); const m=src.match(/<script>([\s\S]*)<\/script>/); new Function(m[1])"`
Expected: no `SyntaxError` thrown.

- [ ] **Step 6: Commit**

```bash
cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding
git add index.html
git commit -m "Wire RSVP form to the groom endpoint and personalize guest-group labels"
```

---

### Task 4: Swap the color palette from burgundy to deep green

**Files:**
- Modify: `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/index.html`

- [ ] **Step 1: Replace the burgundy hex and its derived RGB triplet everywhere**

This single pair of substitutions covers the `--burgundy` CSS variable definition, the inline favicon SVG, the `<symbol id="bow">` strokes, and every `rgba(110,26,40,...)` shadow/border declaration in the stylesheet — all of them are derived from the same `#6e1a28` base color (`rgb(110,26,40)`).

Run:

```bash
cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding
sed -i '' 's/6e1a28/1f3d2b/g; s/110,26,40/31,61,43/g' index.html
```

Expected (verify): `grep -c '6e1a28\|110,26,40' index.html` prints `0`, and `grep -c '1f3d2b\|31,61,43' index.html` prints a number greater than 0 (the same count the old values had).

- [ ] **Step 2: Re-tone the butterfly wing colors**

The butterflies use their own standalone hex pairs (burgundy/pink tones), not the `--burgundy` variable, so they need a direct edit.

Find:

```js
    const colours = [
      ['#e9b7bd', '#d99aa5'], ['#8b2232', '#6e1a28'], ['#e9b7bd', '#c98a96'],
      ['#c9a35c', '#a97f3a'], ['#8b2232', '#c98a96'], ['#e9b7bd', '#6e1a28']
    ];
```

(Note: after Step 1's `sed`, the two `#6e1a28` occurrences in this array will already read `#1f3d2b` — this step replaces the remaining pink-toned pairs with green tones so the whole array reads as a green/gold palette.)

Find (post-sed state):

```js
    const colours = [
      ['#e9b7bd', '#d99aa5'], ['#8b2232', '#1f3d2b'], ['#e9b7bd', '#c98a96'],
      ['#c9a35c', '#a97f3a'], ['#8b2232', '#c98a96'], ['#e9b7bd', '#1f3d2b']
    ];
```

Replace with:

```js
    const colours = [
      ['#a9c9b0', '#7fa88a'], ['#2e5940', '#1f3d2b'], ['#a9c9b0', '#6e8f77'],
      ['#c9a35c', '#a97f3a'], ['#2e5940', '#6e8f77'], ['#a9c9b0', '#1f3d2b']
    ];
```

- [ ] **Step 3: Visual check**

Run: `cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding && python3 -m http.server 8080`, open `http://localhost:8080`.
Expected: cover, envelope, hero, postcard, buttons, and dropdown borders all render in deep green instead of burgundy; gold and cream tones are unchanged; opening the envelope releases green/gold butterflies instead of pink/burgundy ones.

- [ ] **Step 4: Commit**

```bash
cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding
git add index.html
git commit -m "Swap color palette from burgundy to deep green"
```

---

### Task 5: Flip the name order to "Hakim & Alya"

**Files:**
- Modify: `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/index.html`

- [ ] **Step 1: Update `<title>` and meta tags**

Find:

```html
<title>Walimatul Urus · Alya &amp; Hakim · 26.12.2026</title>
<meta name="description" content="Jemputan Majlis Perkahwinan Alya Humaira &amp; Hakim · Sabtu, 26 Disember 2026 · ISTAC, Bukit Tunku, Kuala Lumpur">
<meta property="og:type" content="website">
<meta property="og:title" content="Walimatul Urus · Alya &amp; Hakim">
```

Replace with:

```html
<title>Walimatul Urus · Hakim &amp; Alya · 26.12.2026</title>
<meta name="description" content="Jemputan Majlis Perkahwinan Muhammad Hakim &amp; Alya Humaira · Sabtu, 26 Disember 2026 · ISTAC, Bukit Tunku, Kuala Lumpur">
<meta property="og:type" content="website">
<meta property="og:title" content="Walimatul Urus · Hakim &amp; Alya">
```

- [ ] **Step 2: Flip the envelope cameo photo order (groom's photo leads)**

Find:

```html
    <div class="envwrap">
      <div class="kphoto k1" id="k1"><div class="img" data-photo="bride"></div><div class="cap">Alya</div></div>
      <div class="kphoto k2" id="k2"><div class="img" data-photo="groom"></div><div class="cap">Hakim</div></div>
      <img class="env" src="assets/envelope.jpg" alt="" width="900" height="640">
    </div>
```

Replace with:

```html
    <div class="envwrap">
      <div class="kphoto k1" id="k1"><div class="img" data-photo="groom"></div><div class="cap">Hakim</div></div>
      <div class="kphoto k2" id="k2"><div class="img" data-photo="bride"></div><div class="cap">Alya</div></div>
      <img class="env" src="assets/envelope.jpg" alt="" width="900" height="640">
    </div>
```

- [ ] **Step 3: Flip the hero cameo/name order**

Find:

```html
    <div class="pair">
      <div class="cameo" id="c1"><div class="ring fade"></div><div class="img" data-photo="bride" role="img" aria-label="Alya"></div></div>
      <div class="amp fade late">&amp;</div>
      <div class="cameo" id="c2"><div class="ring fade"></div><div class="img" data-photo="groom" role="img" aria-label="Hakim"></div></div>
    </div>
    <h1 class="names script fade late">Alya &amp; Hakim</h1>
```

Replace with:

```html
    <div class="pair">
      <div class="cameo" id="c1"><div class="ring fade"></div><div class="img" data-photo="groom" role="img" aria-label="Hakim"></div></div>
      <div class="amp fade late">&amp;</div>
      <div class="cameo" id="c2"><div class="ring fade"></div><div class="img" data-photo="bride" role="img" aria-label="Alya"></div></div>
    </div>
    <h1 class="names script fade late">Hakim &amp; Alya</h1>
```

(The `openInvite()` flight animation in the `<script>` block references `k1`→`c1` and `k2`→`c2` by id only, not by which name they hold, so it keeps working — groom's photo now flies from `k1` to `c1`, bride's from `k2` to `c2`, matching the new markup order.)

- [ ] **Step 4: Flip the postcard "Kepada"/stamp (both the form and the thank-you card)**

Find (appears twice, in `#rsvpForm` and `#rsvpThanks`):

```html
        <div class="pc-top"><div class="to"><span data-i18n="to">Kepada</span><b>Alya &amp; Hakim</b></div><div class="stamp" aria-hidden="true"><span>A&amp;H</span></div></div>
```

Replace **both** occurrences with:

```html
        <div class="pc-top"><div class="to"><span data-i18n="to">Kepada</span><b>Hakim &amp; Alya</b></div><div class="stamp" aria-hidden="true"><span>H&amp;A</span></div></div>
```

- [ ] **Step 5: Flip the closing section's names**

Find:

```html
      <div class="sname script">Alya &amp; Hakim</div>
    </div>
  </section>
</main>
```

Replace with:

```html
      <div class="sname script">Hakim &amp; Alya</div>
    </div>
  </section>
</main>
```

- [ ] **Step 6: Update the calendar event text and WhatsApp strings in `I18N`**

Find (in the `WEDDING` config):

```js
    calendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Majlis%20Perkahwinan%20Alya%20%26%20Hakim&dates=20261226T030000Z/20261226T080000Z&location=ISTAC-IIUM%2C%2024%20Persiaran%20Tuanku%20Syed%20Sirajuddin%2C%20Bukit%20Tunku%2C%2050480%20Kuala%20Lumpur',
```

Replace with:

```js
    calendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Majlis%20Perkahwinan%20Hakim%20%26%20Alya&dates=20261226T030000Z/20261226T080000Z&location=ISTAC-IIUM%2C%2024%20Persiaran%20Tuanku%20Syed%20Sirajuddin%2C%20Bukit%20Tunku%2C%2050480%20Kuala%20Lumpur',
```

Find (in the `ms` block of `I18N`):

```js
      waRsvp: 'RSVP Majlis Perkahwinan Alya & Hakim', waName: 'Nama', waAttend: 'Kehadiran', waPax: 'Bilangan', waNotes: 'Catatan',
```
```js
      waHello: 'Assalamualaikum, saya ingin bertanya tentang majlis perkahwinan Alya & Hakim.',
```

Replace with:

```js
      waRsvp: 'RSVP Majlis Perkahwinan Hakim & Alya', waName: 'Nama', waAttend: 'Kehadiran', waPax: 'Bilangan', waNotes: 'Catatan',
```
```js
      waHello: 'Assalamualaikum, saya ingin bertanya tentang majlis perkahwinan Hakim & Alya.',
```

Find (in the `en` block of `I18N`):

```js
      waRsvp: 'RSVP · Wedding of Alya & Hakim', waName: 'Name', waAttend: 'Attendance', waPax: 'People', waNotes: 'Notes',
```
```js
      waHello: "Assalamualaikum, I'd like to ask about Alya & Hakim's wedding.",
```

Replace with:

```js
      waRsvp: 'RSVP · Wedding of Hakim & Alya', waName: 'Name', waAttend: 'Attendance', waPax: 'People', waNotes: 'Notes',
```
```js
      waHello: "Assalamualaikum, I'd like to ask about Hakim & Alya's wedding.",
```

- [ ] **Step 7: Verify the HTML still parses**

Run: `cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding && python3 -c "import html.parser; html.parser.HTMLParser().feed(open('index.html').read())"`
Expected: no exception raised.

- [ ] **Step 8: Commit**

```bash
cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding
git add index.html
git commit -m "Flip name order to Hakim & Alya throughout"
```

---

### Task 6: Personalize the invite text, parents' names, and patronymic

**Files:**
- Modify: `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/index.html`

Groom's full name and father's first name are already present in the source markup
(`Muhammad Hakim bin Zulkhainain`); his father's full patronymic and his mother's
name are not yet known, so they're filled with bracketed placeholders that the
site owner edits later — consistent with how `POST-BUILD.md` already documents
bride-side placeholders (parents' names, programme times) as "still to fill".

- [ ] **Step 1: Swap the parents' names block**

Find:

```html
      <p class="caps parents">HJ. AHMAD SHUKRI BIN HARUN<br>&amp;<br>HANI SORAYA BINTI ISHAK</p>
```

Replace with:

```html
      <p class="caps parents">ZULKHAINAIN BIN [GROOM'S GRANDFATHER'S NAME]<br>&amp;<br>[GROOM'S MOTHER'S FULL NAME]</p>
```

- [ ] **Step 2: Swap the invite text (BM + EN) from "our daughter" to "our son"**

Find (in the `ms` block of `I18N`):

```js
      invite: "dengan penuh kesyukuran menjemput<br>Tan Sri / Puan Sri / Dato' Seri / Datin Seri /<br>Dato' / Datin / Tuan / Puan / Encik / Cik<br>ke majlis perkahwinan puteri kami",
```

Replace with:

```js
      invite: "dengan penuh kesyukuran menjemput<br>Tan Sri / Puan Sri / Dato' Seri / Datin Seri /<br>Dato' / Datin / Tuan / Puan / Encik / Cik<br>ke majlis perkahwinan putera kami",
```

Find (in the `en` block of `I18N`):

```js
      invite: "with hearts full of gratitude, cordially invite<br>Tan Sri / Puan Sri / Dato' Seri / Datin Seri /<br>Dato' / Datin / Mr / Mrs / Ms<br>to the wedding reception of our daughter",
```

Replace with:

```js
      invite: "with hearts full of gratitude, cordially invite<br>Tan Sri / Puan Sri / Dato' Seri / Datin Seri /<br>Dato' / Datin / Mr / Mrs / Ms<br>to the wedding reception of our son",
```

- [ ] **Step 3: Flip the fullname/patronymic order so the groom's name leads**

Find:

```html
      <div class="fullname" style="margin-top:14px"><span class="sname script">Alya Humaira</span><span class="patr">binti Hj Ahmad Shukri</span></div>
      <div class="amp">&amp;</div>
      <div class="fullname"><span class="sname script">Muhammad Hakim</span><span class="patr">bin Zulkhainain</span></div>
```

Replace with:

```html
      <div class="fullname" style="margin-top:14px"><span class="sname script">Muhammad Hakim</span><span class="patr">bin Zulkhainain</span></div>
      <div class="amp">&amp;</div>
      <div class="fullname"><span class="sname script">Alya Humaira</span><span class="patr">binti Hj Ahmad Shukri</span></div>
```

- [ ] **Step 4: Verify the HTML still parses**

Run: `cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding && python3 -c "import html.parser; html.parser.HTMLParser().feed(open('index.html').read())"`
Expected: no exception raised.

- [ ] **Step 5: Commit**

```bash
cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding
git add index.html
git commit -m "Personalize invite text, parents' names, and patronymic order for groom's side"
```

---

### Task 7: Replace family contacts with the groom's family

**Files:**
- Modify: `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/index.html`

The current `contacts` array holds the bride's father/mother/sister with real
photos (`assets/family/father.jpg`, `mother.jpg`, `sister.jpg`) which are
specific people and must not be reused for the groom's family. Real names,
phone numbers, and photos for the groom's family aren't available yet, so
this step swaps in the groom's father and mother with bracketed placeholders
for name/phone, and points their avatar at the existing generic
`assets/photos/kid-placeholder.jpg` (already used elsewhere in this project as
a stand-in image) until real photos are supplied.

- [ ] **Step 1: Replace the `contacts` array**

Find:

```js
    contacts: [                                         // phone in international format, digits only (60 = Malaysia)
      { name: 'Hj. Ahmad Shukri', role: { ms: 'Bapa Pengantin', en: "Bride's Father" }, phone: '60193178840',
        avatar: 'assets/family/father.jpg',
        msg: { ms: 'Jemput hadir memeriahkan majlis perkahwinan puteri sulung kami!', en: 'Please join us in celebrating the wedding of our eldest daughter!' } },
      { name: 'Hani Soraya',            role: { ms: 'Ibu Pengantin',  en: "Bride's Mother" }, phone: '60126192225',
        avatar: 'assets/family/mother.jpg',
        msg: { ms: 'Kehadiran dan doa restu anda amat kami hargai.', en: 'Your presence and prayers mean a great deal to us.' } },
      { name: 'Areena Sofea',           role: { ms: 'Adik Pengantin', en: "Bride's Sister" }, phone: '601158937740',
        avatar: 'assets/family/sister.jpg',
        msg: { ms: 'Tak pasti jalan ke ISTAC? Saya boleh bantu!', en: 'Not sure how to get to ISTAC? I can help!' } }
    ],
```

Replace with:

```js
    contacts: [                                         // phone in international format, digits only (60 = Malaysia)
      { name: 'Zulkhainain', role: { ms: 'Bapa Pengantin', en: "Groom's Father" }, phone: '60100000001',
        avatar: 'assets/photos/kid-placeholder.jpg',
        msg: { ms: 'Jemput hadir memeriahkan majlis perkahwinan putera sulung kami!', en: 'Please join us in celebrating the wedding of our eldest son!' } },
      { name: "[Groom's Mother's Name]", role: { ms: 'Ibu Pengantin', en: "Groom's Mother" }, phone: '60100000002',
        avatar: 'assets/photos/kid-placeholder.jpg',
        msg: { ms: 'Kehadiran dan doa restu anda amat kami hargai.', en: 'Your presence and prayers mean a great deal to us.' } }
    ],
```

(Note: the bride's version had 3 contacts including a sister; the groom's
siblings aren't specified yet, so this starts with 2 — father and mother — and
can grow to match once sibling details are available. `assets/family/` is no
longer referenced by `contacts` after this change but is left in place since
`POST-BUILD.md` still documents it as the convention for where to put contact
photos.)

- [ ] **Step 2: Verify the script still parses**

Run: `cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding && node -e "const fs=require('fs'); const src=fs.readFileSync('index.html','utf8'); const m=src.match(/<script>([\s\S]*)<\/script>/); new Function(m[1])"`
Expected: no `SyntaxError` thrown.

- [ ] **Step 3: Commit**

```bash
cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding
git add index.html
git commit -m "Replace family contacts with the groom's father and mother"
```

---

### Task 8: Update POST-BUILD.md and .env.example for this repo

**Files:**
- Modify: `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/POST-BUILD.md`
- Modify: `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/.env.example`

- [ ] **Step 1: Rewrite the header and RSVP section of `POST-BUILD.md`**

Find:

```markdown
# POST-BUILD — Version 2 (Garden envelope · Alya & Hakim)
```

Replace with:

```markdown
# POST-BUILD — hakim-alya-wedding (Garden envelope · Hakim & Alya)
```

Find:

```markdown
## RSVP → serverless proxy → Google Sheet
The RSVP form POSTs to `/api/rsvp?side=bride`, a Vercel serverless function
(`api/rsvp.js`) that forwards the request to the Google Apps Script URL in the
`BRIDE_RSVP_ENDPOINT` environment variable.

1. Copy `.env.example` into your Vercel project's Environment Variables
   (Project Settings → Environment Variables). `BRIDE_RSVP_ENDPOINT` must
   point at an Apps Script web app that accepts
   `{ name, phone, attendance, guestCount, guestGroup, message, side }`.
2. Deploy with `npx vercel` (or your usual flow) so `/api/rsvp` is served
   alongside the static site.
3. A guest's own reply is remembered on their phone (they see the thank-you
   card and can send another).
```

Replace with:

```markdown
## RSVP → serverless proxy → Google Sheet
The RSVP form POSTs to `/api/rsvp?side=groom`, a Vercel serverless function
(`api/rsvp.js`) that forwards the request to the Google Apps Script URL in the
`GROOM_RSVP_ENDPOINT` environment variable — the same live spreadsheet the
original `wedding-groom` repo used.

1. Copy `.env.example` into your Vercel project's Environment Variables
   (Project Settings → Environment Variables). `GROOM_RSVP_ENDPOINT` must
   point at an Apps Script web app that accepts
   `{ name, phone, attendance, guestCount, guestGroup, message, side }`.
2. Deploy with `npx vercel` (or your usual flow) so `/api/rsvp` is served
   alongside the static site.
3. A guest's own reply is remembered on their phone (they see the thank-you
   card and can send another).
```

- [ ] **Step 2: Update the "still placeholders" note**

Find:

```markdown
All visible wording (BM + EN) lives in the `I18N` object just below. Still placeholders:
parents' names (`parents`), and programme times/items (`p1`–`p4` plus the times in the HTML).
```

Replace with:

```markdown
All visible wording (BM + EN) lives in the `I18N` object just below. Still placeholders:
groom's father's full patronymic and mother's name (`.parents` block), the two
family `contacts` entries' real names/phones/photos, and programme times/items
(`p1`–`p4` plus the times in the HTML) — programme/date/venue match the bride's
site since it's the same event.
```

- [ ] **Step 3: Update `.env.example`'s comment to point at the relevant var for this repo**

Find:

```
# Copy these into your Vercel project Environment Variables.
# Change the values only when you update the Google Apps Script /exec URLs.
BRIDE_RSVP_ENDPOINT=https://script.google.com/macros/s/AKfycbxy8jCXgau5B20Okh6bgH9ZVZTqj8MwxmrBXzHnNMrP2mHPIImzG5Rr8wbfOzsXIC8/exec
GROOM_RSVP_ENDPOINT=https://script.google.com/macros/s/AKfycbzgUGB2T7QMuPfa_7iR3hHKdFru6-F4wVCzgeg_hIWBw81AsDOwM5suVbjCX6JaB9d7/exec
```

Replace with:

```
# Copy these into your Vercel project Environment Variables.
# Change the values only when you update the Google Apps Script /exec URLs.
# This site only actually needs GROOM_RSVP_ENDPOINT set (the form always posts
# ?side=groom) - BRIDE_RSVP_ENDPOINT is kept here only so api/rsvp.js, copied
# verbatim from alya-hakim-wedding, doesn't need to be edited.
GROOM_RSVP_ENDPOINT=https://script.google.com/macros/s/AKfycbzgUGB2T7QMuPfa_7iR3hHKdFru6-F4wVCzgeg_hIWBw81AsDOwM5suVbjCX6JaB9d7/exec
BRIDE_RSVP_ENDPOINT=https://script.google.com/macros/s/AKfycbxy8jCXgau5B20Okh6bgH9ZVZTqj8MwxmrBXzHnNMrP2mHPIImzG5Rr8wbfOzsXIC8/exec
```

- [ ] **Step 4: Commit**

```bash
cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding
git add POST-BUILD.md .env.example
git commit -m "Update POST-BUILD.md and .env.example for the groom-side repo"
```

---

### Task 9: Add a short README

**Files:**
- Create: `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/README.md`

- [ ] **Step 1: Write the README**

Create `/Users/alyaaccess/dev/wedding/hakim-alya-wedding/README.md`:

```markdown
# Wedding Invitation — Groom's Side

Interactive wedding invitation for **Hakim & Alya**, led from the groom's side.
Same event as [alya-hakim-wedding](https://github.com/alyahmaira/alya-hakim-wedding)
(bride's side) — same date/venue/programme, different name order, color palette,
and family contacts, with its own RSVP backend (`GROOM_RSVP_ENDPOINT`).

Static single page (`index.html` + `assets/`): garden-estate cover with a
wax-sealed envelope; tapping pops out the childhood photos, which fly into
cameo frames on the first page. Grid-paper inside pages (bow + cherry accents),
BM/EN switch, background music, butterflies, Save the Date + Maps, programme,
countdown, Add to Calendar, doa, couple gallery, money-gift popup.

Personalise the `WEDDING` settings block in `index.html`; see `POST-BUILD.md`.

## Run locally
`python3 -m http.server 8080`, then visit http://localhost:8080
```

- [ ] **Step 2: Commit**

```bash
cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding
git add README.md
git commit -m "Add README"
```

---

### Task 10: End-to-end verification and push

**Files:** none (verification only)

- [ ] **Step 1: Full manual browser check**

Run: `cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding && python3 -m http.server 8080`, open `http://localhost:8080`.

Check, for both BM and EN:
- Cover/envelope/hero/postcard/buttons render in the new green palette.
- Opening the envelope flies Hakim's photo into the first cameo, Alya's into the second; hero reads "Hakim & Alya".
- RSVP form validates in the right order; guest-count and guest-group dropdowns work; guest-group labels read "...Hakim's Friends and Colleagues" (EN) / BM equivalent.
- Family contacts section shows the two groom's-family placeholder cards with working WhatsApp/Call links (links will use the placeholder phone numbers until real ones are filled in).
- Language switch (BM ⇄ EN) updates every swapped string (title, invite text, WA messages, guest-group labels).

- [ ] **Step 2: `vercel dev` smoke test (optional but recommended)**

```bash
cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding
cp .env.example .env
npx --yes vercel dev
```

Open the printed local URL, submit a test RSVP (e.g. name "Test Guest", a dummy
phone number, "Not Attending" so no real seat is reserved), and confirm:
- The request hits `/api/rsvp?side=groom` with `"side":"groom"` in the payload.
- The response is `{"ok":true}`.
- Optionally check the Google Sheet behind `GROOM_RSVP_ENDPOINT` for the new
  test row, then delete it.

Clean up afterwards:

```bash
rm /Users/alyaaccess/dev/wedding/hakim-alya-wedding/.env
```

(No commit — `.env` must never be committed; `.gitignore` already covers it.
Verify with `git status` that `.env` doesn't show as untracked-and-about-to-be-added.)

- [ ] **Step 3: Push to GitHub**

```bash
cd /Users/alyaaccess/dev/wedding/hakim-alya-wedding
git push
```

Expected: pushes cleanly to `origin/main` (the repo was already created via
`gh repo create alyahmaira/hakim-alya-wedding --public --clone` and has
`origin` set up).
