# CLAUDE.md

Portfolio of Jigar Hirani, published at https://jigarhirani.tech. Plain HTML and
CSS: no build step, no framework, no dependencies. GitHub Pages serves the repo
root from `main` (repo `jigarhirani.github.io`). DNS for the domain already
points at GitHub Pages (four A records, `www` CNAME).

## Files

| Path | What it is |
|---|---|
| `index.html` | The home page: a profile card (bio, connect links, toolbox, Credly badges). Styles in `assets/card.css` on top of `site.css` |
| `portfolio/index.html` | The full site: hero with the pipeline diagram, stages, experience and toolbox, certification badges, writing, contact. Not linked from anywhere and `noindex`: the user opens it by URL until the content is final |
| `blog/index.html` | Post list |
| `blog/<slug>/index.html` | One post, hand-written HTML |
| `assets/site.css` | All styles. Colours are tokens on `:root`, with a dark set under `prefers-color-scheme` |
| `assets/Jigar-Hirani-Resume.pdf` | Public resume with the phone number removed |
| `robots.txt`, `sitemap.xml` | Crawl rules and the list of pages to index. Add every new blog post to the sitemap |
| `assets/favicon.svg` | Site icon: a bold white J with a green dot on a dark tile, sized to fill the tile (option 1 of the refinements, 2026-10-29) |
| `assets/og.png`, `apple-touch-icon.png`, `favicon.ico` | Share image (1200×630), iOS icon (180px) and fallback icon (32px PNG inside an ICO). Generated: run `node tools/render-images.mjs` after changing `tools/og.html` or `assets/favicon.svg` |
| `404.html` | GitHub Pages not-found page |
| `CNAME` | Custom domain |
| `_config.yml` | Keeps `README.md`, `CLAUDE.md` and `tools/` off the live site |
| `tools/strip-phone.mjs` | Removes the phone number from a resume PDF using Scrub's core in `../vibe/pdf-text-remover` |
| `tools/render-images.mjs`, `tools/og.html` | Redraw the share image and icons with headless Chrome (puppeteer-core from `../vibe/pdf-text-remover`) |

## Common changes

- **New post:** copy `blog/starting-this-blog/` to `blog/<slug>/`, edit it, then add a
  `.post` card to `blog/index.html` and to the Writing section of `portfolio/index.html`.
  SPL in a `<pre><code>` block: wrap commands and keywords in `<span class="k">`.
- **Certification passed:** earned badges are the real Credly images. The user's
  public profile is `https://www.credly.com/users/jigarhirani/badges.json`; take the
  new badge's `image_url` and `id` from it. Save the image at 360 px
  (`sips -Z 360`) in `assets/badges/`, then update both pages, which use different
  markup. Card (`index.html`): `<li class="earned">` with `<a class="c-img">` around
  the `<img>` and `<a class="c-when">`; in-progress certs are `<span class="c-img">`.
  Portfolio (`portfolio/index.html`): `<li class="badge earned">` with
  `<a class="medal">` around the `<img>`; in-progress certs are `<div class="medal">`.
  Both links go to `https://www.credly.com/badges/<id>/public_url`. Never show an
  official badge image for a cert not yet earned.
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

Professional and quiet: Inter (self-hosted, `assets/fonts/`) for everything, system
monospace only in blog code blocks, no decorative animation. The user asked to
drop the "fancy" effects (log-stream background, glows, sweeps) on 2026-10-29.

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
```

Look at widths 360, 390, 768, 1024 and 1280, in light and dark. No horizontal
page scroll (the SPL block scrolls inside itself, which is fine). The user
reviews on real phones and tablets.
