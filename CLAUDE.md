# CLAUDE.md

Portfolio of Jigar Hirani, published at https://jigarhirani.tech. Plain HTML and
CSS: no build step, no framework, no dependencies. GitHub Pages serves the repo
root from `main` (repo `jigarhirani.github.io`). DNS for the domain already
points at GitHub Pages (four A records, `www` CNAME).

## Files

| Path | What it is |
|---|---|
| `index.html` | The home page: a lanyard badge (name, title, focus areas, experience, QR to the site, "SPLUNK ENGINEER" band) beside the bio, numbers, connect links, certifications and toolbox. Styles in `assets/badge.css`, which does not use `site.css` |
| `portfolio/index.html` | The full site: hero with the pipeline diagram, stages, experience and toolbox, certification badges, writing, contact. Not linked from anywhere and `noindex`: the user opens it by URL until the content is final |
| `blog/index.html` | Post list |
| `blog/<slug>/index.html` | One post, hand-written HTML |
| `assets/site.css` | Styles for the blog, portfolio and 404 pages. Colours are tokens on `:root`, with a dark set under `prefers-color-scheme` |
| `assets/Jigar-Hirani-Resume.pdf` | Public resume with the phone number removed |
| `robots.txt`, `sitemap.xml` | Crawl rules and the list of pages to index. Add every new blog post to the sitemap |
| `assets/favicon.svg` | Site icon: a bold white J with a green dot on a dark tile, sized to fill the tile (option 1 of the refinements, 2026-10-29) |
| `assets/og.png`, `apple-touch-icon.png`, `favicon-96x96.png`, `favicon.ico` | Share image (1200×630), iOS icon (180px), and favicons for Google, which only uses sizes in multiples of 48px or SVG (96px PNG; ICO holding 16, 32 and 48px). Generated: run `node tools/render-images.mjs` after changing `tools/og.html` or `assets/favicon.svg` |
| `assets/fonts/` | IBM Plex Sans and Plex Mono, self-hosted (SIL Open Font License) |
| `404.html` | GitHub Pages not-found page |
| `CNAME` | Custom domain |
| `_config.yml` | Keeps `README.md`, `CLAUDE.md` and `tools/` off the live site |
| `tools/strip-phone.mjs` | Removes the phone number from a resume PDF using Scrub's core in `../vibe/pdf-text-remover` |
| `tools/render-images.mjs`, `tools/og.html` | Redraw the share image and icons with headless Chrome (puppeteer-core from `../vibe/pdf-text-remover`) |
| `assets/eggs.js` | The three hidden badge games (see Easter eggs) |
| `tools/test-home.mjs` | End-to-end check of the home page: QR contents, the games, layout at 7 widths in light and dark |

## Common changes

- **New post:** copy `blog/starting-this-blog/` to `blog/<slug>/`, edit it, then add a
  `.post` card to `blog/index.html` and to the Writing section of `portfolio/index.html`.
  SPL in a `<pre><code>` block: wrap commands and keywords in `<span class="k">`.
- **Certification passed:** earned badges are the real Credly images. The user's
  public profile is `https://www.credly.com/users/jigarhirani/badges.json`; take the
  new badge's `image_url` and `id` from it. Save the image at 360 px
  (`sips -Z 360`) in `assets/badges/`, then update both pages, which use different
  markup. Home (`index.html`): the Splunk path sits three in one row, highest level
  first (Admin, Power User, User); an earned one is `<a class="c-img">` around the
  `<img>` plus `<a class="when"><span>Earned Mon YYYY</span><span>Verify&nbsp;↗</span></a>`,
  one in progress is `<span class="c-img todo">`. Cribl is the `<p class="also">` line
  below the row. Add the credential to the `hasCredential` list in the JSON-LD too.
  Portfolio (`portfolio/index.html`): `<li class="badge earned">` with
  `<a class="medal">` around the `<img>`; in-progress certs are `<div class="medal">`.
  Links go to `https://www.credly.com/badges/<id>/public_url`. Credly reissued the
  Core User badge under a new ID when Power User was earned, so re-check IDs on
  every new badge. Never show an official badge image for a cert not yet earned.
  Certifications belong in that section only; the badge shows focus areas instead.
- **New resume:** `node tools/strip-phone.mjs "<source.pdf>" assets/Jigar-Hirani-Resume.pdf`.
  It refuses to write if a phone number is left on any page or the email was lost.

## Content rules

- Facts come from `~/Documents/Jigar Hirani Resume.pdf` (2+ years, Data Elicit
  Aug 2024 – Apr 2026, Rojo since May 2026). The "5+ years" resume in Downloads is wrong.
- Positioning is SIEM, Splunk and Cribl; observability is the current role. The
  hero's "Now" line names no tools; tools go in Experience and the toolbox.
- No side projects from `vibe/` on the site for now.
- Keep it short. Every section has to earn its place.

## SEO

Goal: the site shows up when people search "Jigar Hirani". The home page has a
Person + ProfilePage + WebSite JSON-LD graph whose `sameAs` ties the site to
LinkedIn, GitHub and Credly; each post has BlogPosting JSON-LD with the same
author `@id`. Every page needs a unique title, description and canonical URL.
The user has to verify the site in Google Search Console and submit the sitemap;
that cannot be done from here.

## Look

Professional and quiet: IBM Plex Sans for everything, Plex Mono for labels and
code, no decorative animation. The user asked to drop the "fancy" effects
(log-stream background, glows, sweeps) on 2026-10-29, and picked the badge home
page on 2026-11-04. The badge stays a white card in dark mode.

The badge QR holds a vCard 3.0 contact card (name, title, email, website), so
the iPhone Camera and Android (Google Lens, Samsung and Pixel cameras) offer
"Add to Contacts" straight from the scan; no file download, which Android
handles badly. It is 49×49 modules (version 8, error correction L), drawn at
96px, and was generated once with Python `qrcode` into inline SVG path data.
Adding LinkedIn made it 57+ modules, too dense to scan from a screen.
`tools/test-home.mjs` checks the QR still decodes to exactly that card.

## Easter eggs

`assets/eggs.js` hides three games in the badge (styles at the end of
`badge.css`). The user wanted all three, on 2026-11-04:
- click the QR → Snake (score = events indexed)
- click "Detections" → Brute-force Defender (block attacks on nine hosts, 30 s)
- press `/` or tap the J logo three times → a small SPL console

Only one game can be open; Esc or × restores the badge from a saved copy of
its HTML. Run `node tools/test-home.mjs` after touching the badge or the eggs.

## Palette

Green, chosen 2026-10-29 over indigo and amber: it reads as Splunk and as
"healthy" in monitoring. Tokens are the two `:root` blocks at the top of
`site.css`; the favicon's dot uses the dark-mode green.

## Pending

- Content rewrite from the user: the site is too focused on ingest pipelines;
  it should cover the whole job (platform admin, onboarding, detections,
  dashboards, add-ons, observability).
- Confirm the Cribl exam name (currently "Cribl Certified Admin – Stream").

## Check before shipping

```
python3 -m http.server 8765    # then http://localhost:8765
node tools/test-home.mjs       # home page checks; exits non-zero on failure
```

Look at widths 360, 390, 768, 1024 and 1280, in light and dark. No horizontal
page scroll (the SPL block scrolls inside itself, which is fine). The user
reviews on real phones and tablets.
