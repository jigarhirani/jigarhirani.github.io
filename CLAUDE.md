# CLAUDE.md

Portfolio of Jigar Hirani, published at https://jigarhirani.tech. Plain HTML and
CSS: no build step, no framework, no dependencies. GitHub Pages serves the repo
root from `main` (repo `jigarhirani.github.io`). DNS for the domain already
points at GitHub Pages (four A records, `www` CNAME).

## Files

| Path | What it is |
|---|---|
| `index.html` | The home page: hero with the pipeline diagram, stages, experience and toolbox, certification badges, writing, contact |
| `blog/index.html` | Post list |
| `blog/<slug>/index.html` | One post, hand-written HTML |
| `assets/site.css` | All styles. Colours are tokens on `:root`, with a dark set under `prefers-color-scheme` |
| `assets/Jigar-Hirani-Resume.pdf` | Public resume with the phone number removed |
| `404.html` | GitHub Pages not-found page |
| `CNAME` | Custom domain |
| `_config.yml` | Keeps `README.md`, `CLAUDE.md` and `tools/` off the live site |
| `tools/strip-phone.mjs` | Removes the phone number from a resume PDF using Scrub's core in `../vibe/pdf-text-remover` |

## Common changes

- **New post:** copy `blog/starting-this-blog/` to `blog/<slug>/`, edit it, then add a
  `.post` card to `blog/index.html` and to the Writing section of `index.html`.
  SPL in a `<pre><code>` block: wrap commands and keywords in `<span class="k">`.
- **Certification passed:** earned badges are the real Credly images. The user's
  public profile is `https://www.credly.com/users/jigarhirani/badges.json`; take the
  new badge's `image_url` and `id` from it. Save the image at 240 px
  (`sips -Z 240`) in `assets/badges/`, then copy the earned `<li>` in `index.html`:
  class `earned`, `<a class="medal">` wrapping the `<img>`, and both links to
  `https://www.credly.com/badges/<id>/public_url`. In-progress certs are a dashed
  `div.medal` placeholder; never show an official badge image for a cert not yet earned.
- **New resume:** `node tools/strip-phone.mjs "<source.pdf>" assets/Jigar-Hirani-Resume.pdf`.
  It refuses to write if the phone number is still there or the email was lost.

## Content rules

- Facts come from `~/Documents/Jigar Hirani Resume.pdf` (2+ years, Data Elicit
  Aug 2024 – Apr 2026, Rojo since May 2026). The "5+ years" resume in Downloads is wrong.
- Positioning is SIEM, Splunk and Cribl; observability is the current role. The
  hero's "Now" line names no tools; tools go in Experience and the toolbox.
- No side projects from `vibe/` on the site for now.
- Keep it short. Every section has to earn its place.

## Palette

Green, chosen 2026-10-29 over indigo and amber: it reads as Splunk and as
"healthy" in monitoring. Tokens are the two `:root` blocks at the top of
`site.css`; the favicon uses the dark-mode green.

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
