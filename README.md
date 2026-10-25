# Maulik’s corner of the internet

A complete, build-free portfolio: plain HTML, CSS and JavaScript, with all visual assets and the attached résumé included.

## Open it

Unzip the archive and open `portfolio/index.html` in a browser. Keep the folder together so the styles, scripts, avatar and résumé remain available.

No npm install, framework, account, API key or build step is required. The page and portrait animation work offline. Email, GitHub, LinkedIn and Jio Institute links naturally need an internet connection.

For a local HTTP preview, run this from the `portfolio` folder if Python 3 is installed:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## What’s included

- `index.html` — biography, AI/data projects, Tekion work, interests, notebook and contact links.
- `styles.css` — responsive layout, light/dark themes and animation styles.
- `script.js` — theme and motion preferences, interests, email copying, scroll progress and small interactions.
- `avatar-sketch.js` — self-contained SVG portrait drawing animation, with a short arrival delay and click-to-replay.
- `assets/avatar-outline.png` — transparent, outline-only portrait fallback.
- `assets/avatar-outline.svg` — editable vector version of the portrait.
- `assets/maulik-chaudhary-resume.pdf` — the supplied résumé, copied without modification.
- `assets/favicon.svg` — small monogram icon.
- `assets/og-image.png` — 1200×630 preview card for LinkedIn and other link previews. The `og:image` tag points to `https://const-variable.github.io/assets/og-image.png`; change it in `index.html` if the site is hosted elsewhere.

Small touches added in v2 (all switch off with the Motion toggle or the system's reduced-motion setting): pencil underlines under section titles, a hand-drawn loop around the interview count, a self-drawing career timeline, live local time in the "Right now" note, a doodle for each interest, a connect-the-dots sketch in the notebook, asterisks that turn as you scroll, a small burst when the email is copied and an easter egg (type "hello").
- `.nojekyll` — keeps GitHub Pages compatible with the static files.

The sketch respects the operating system’s reduced-motion preference and the page’s Motion control. Light/dark and motion choices are remembered when browser storage is available. Content and links remain usable without JavaScript.

## Edit it

Change copy and links directly in `index.html`. Theme colors are CSS variables at the start of `styles.css`. Interest responses live in the `interests` object in `script.js`. Replace the résumé PDF while keeping its filename to preserve both résumé links.

Company projects carry a short NDA note in place of links. Other write-ups without public URLs are marked “More stuff coming in…”. There are no fake project destinations or form submissions.

## Hosting later

These files are ready for static hosting, including GitHub Pages. When you decide to publish, place the contents of `portfolio/` in your repository’s publishing folder, preserving the `assets/` directory. Nothing has been pushed or published as part of this delivery.

## Verification

JavaScript syntax, local asset references, section anchors, portrait data, contrast, archive integrity and résumé checksum were checked. A live browser preview could not be run in this session because local serving was restricted. Please preview in your browser before publishing.
