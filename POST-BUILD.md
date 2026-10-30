# POST-BUILD — hakim-alya-wedding (Garden envelope · Hakim & Alya)

Static site: `index.html` + `assets/`. No build step.

## Personalise
Edit the `WEDDING` settings block near the bottom of `index.html`:
- `photos.bride` / `photos.groom` — childhood photos (portrait, face near the top). Put files in `assets/photos/`.
  Currently `bride-kid.jpg` / `groom-kid.jpg`.
- `music.youtubeId` / `music.startTime` — YouTube video ID and start-time (seconds) for the background music, played via a hidden YouTube IFrame player.
- `contacts` — 3 family contacts: `name`, `role` (BM + EN), `phone` in international digits (e.g. `60123456789`).
  Each gets a WhatsApp button (pre-filled greeting) and a Call button. Avatars are flat
  cartoon-icon SVGs (`assets/photos/icon-father.svg` etc.), not real photos.
- `mapsUrl`, `calendarUrl`, `start` (countdown target, Malaysia time).

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

## Bottom bar
Utama · Lokasi · RSVP · Hubungi — appears after the envelope is opened and highlights the section in view.

All visible wording (BM + EN) lives in the `I18N` object just below. Still placeholders:
groom's father's full patronymic and mother's name (`.parents` block), the two
family `contacts` entries' real names/phones/photos, and programme times/items
(`p1`–`p4` plus the times in the HTML) — programme/date/venue match the bride's
site since it's the same event.

## Run locally
`python3 -m http.server 8080` in the repo root, then open http://localhost:8080

## Deploy (any static host)
- **Netlify Drop**: drag this repo's root folder onto https://app.netlify.com/drop
- **Vercel**: `npx vercel` in the repo root
- **GitHub Pages / Cloudflare Pages**: publish the repo root as the site root

After deploying, change `og:image` in `<head>` to the full URL (e.g. `https://your-site/assets/scene.jpg`)
so WhatsApp/Telegram link previews show the garden image.
