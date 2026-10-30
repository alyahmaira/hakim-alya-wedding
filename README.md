# Wedding Invitation — Groom's Side

Interactive wedding invitation for **Hakim & Alya**, led from the groom's side.
Same event as [alya-hakim-wedding](https://github.com/alyahmaira/alya-hakim-wedding)
(bride's side) — same date/venue/programme, different name order, color palette,
and family contacts, with its own RSVP backend (`GROOM_RSVP_ENDPOINT`).

Static single page (`index.html` + `assets/`): garden-estate cover with a
wax-sealed envelope; tapping pops out the childhood photos, which fly into
cameo frames on the first page. Grid-paper inside pages (bow + cherry accents),
BM/EN switch, background music, butterflies, Save the Date + Maps, programme,
countdown, Add to Calendar, doa, couple gallery.

Personalise the `WEDDING` settings block in `index.html`; see `POST-BUILD.md`.

## Run locally
`python3 -m http.server 8080`, then visit http://localhost:8080
