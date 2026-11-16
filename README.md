# Andrii Matviienko — portfolio

A light, static portfolio built with Eleventy 3 and Tailwind CSS 4. The default entry point opens the Ukrainian DefTech profile. A fixed switch at the bottom changes between DefTech (green) and Front-End (blue), preserving the selected language. The layout follows the supplied references: a text-led introduction, rounded menu, and horizontal project cards with restrained hover states.

## Local development

Use Node.js 24 (`nvm use` if available).

```sh
npm ci
npm run dev
```

Open <http://localhost:8080/>. `npm test` builds the production site and checks the four profile pages, language metadata, profile switches, local links, anchors, asset paths, redirect targets, sitemap, and original backup checksum.

| URL | Language | Profile |
| --- | --- | --- |
| `/` | Ukrainian | DefTech |
| `/en/` | English | DefTech |
| `/front-end/` | Ukrainian | Front-End |
| `/en/front-end/` | English | Front-End |

Ukrainian is served directly without a language prefix; `/uk/` routes are not generated. Language changes preserve the selected profile. Profile changes preserve the language. All navigation works without JavaScript. Previous `/contact.html` and `/chat.html` URLs lead to `/#contact`. Each profile links to its own current English PDF under `/assets/resume/`, clearly labelled `PDF · EN` in both site languages. The historical root PDF is not copied into the new site.

## Content and structure

```text
src/
  _data/translations.js   English and Ukrainian copy
  _data/variants.js       Four language/profile routes
  _data/projects.js       DefTech and Front-End projects
  _data/experience.js     Profile-specific work history
  _data/site.json         Email and GitHub
  _includes/base.njk      Shared page structure and metadata
  profiles.njk           Profile template
  styles/tailwind.css    Tailwind source, theme tokens, shared components
  assets/                Favicons, supplied project photos, and the game module
eleventy.config.js       Build, asset copying, URL configuration
scripts/check-site.mjs   Generated-site verification
scripts/build-resumes.py Reproducible English PDF generation
output/pdf/              Two current, profile-specific CVs
.github/workflows/      Build, deployment, and rollback workflows
legacy/                  Unchanged original source files
backups/                 Original site archive
_site/                   Generated production output (ignored)
.cache/site.css          Compiled Tailwind CSS (ignored)
```

The production output includes the new site, the supplied colour portrait, four supplied DefTech photos, and CVs from `output/pdf/`. It excludes the original legacy PDF, legacy source, backup archives, generation scripts, package files, and workflows. There are no third-party fonts, client-side libraries, analytics, or contact-form services in the new site.

Both profiles use avatar favicons: circular PNGs at 16, 32, and 48 pixels, a multi-size ICO, and a 180-pixel Apple touch icon. These versioned assets are copied during builds. After replacing `src/assets/portrait.png`, regenerate them with `python3 scripts/build-favicons.py` in a Python environment with Pillow installed.

## Project and resume content

DefTech copy and work history are based on the supplied Embedded / UAV resume. Front-End uses the supplied `Andrey_Matviyenko_Resume_SE.pdf`, including fullstack experience, the complete software career since 2015, technical leadership, and current microservices and AI-assisted development work at TalkRemit. The SEO Dashboard summary also uses its [repository README](https://github.com/AndreyMatviyenko/esp32-seo-dashboard). Statuses follow the user's update: SEO Dashboard is nearly complete; Moon Lamp Air Alarm is the next planned project; the FPV assembly and detector work is described in the supplied resume. The final DefTech card is `Coming soon`.

Experience entries span the full page width. DefTech summarises hands-on Embedded / UAV work, the overall software career from developer to team lead with the current TalkRemit role, and manufacturing experience at ANTONOV. Front-End combines work history and commercial projects in one chronological section, with product links grouped under TalkRemit, AgroOnline, and Redwerk. The `#work` and `#experience` anchors both reach this merged section. Personal projects follow, then tools and education. Two desktop columns contain tools and spoken languages on the left, and education plus DefTech training and appreciation on the right. These stack on mobile. Language levels and the letter of appreciation come from the supplied resume; the letter is described as text because no scan has been supplied.

DefTech lists the 10-inch FPV bomber, 7-inch FPV drones, FPV video-signal detector, SEO Dashboard, Moon Lamp Air Alarm, and `Coming soon`, in that order. No unprovided performance specifications or build instructions are included. Front-End lists TalkRemit, Dahabshiil, AgroOnline, OpenTeams, and Justin Alexander. A separate Front-End personal-projects section links to [Webfonts](https://webfonts.com.ua/) and [Psy-notes](https://psy-notes.com/); its descriptions are based on their public pages, with text-only cards because no images were supplied. Earlier web projects are preserved only in the original site backups.

The bomber, 7-inch drones, detector, and SEO Dashboard use supplied photos on `#386038`, `#5f1f1f`, `#263746`, and `#000` backgrounds. The detector photo was edited with the built-in image tool to remove the background, caliper, and loose antenna; its prompt is saved under `output/imagegen/`. Projects without photos use text-only cards with no empty image slot or photo placeholder. To add a supplied photo, place it under `src/assets/projects/` and add these fields to that entry in `src/_data/projects.js`:

```js
image: "/assets/projects/my-project.jpg",
imageAlt: { uk: "Опис зображення", en: "Image description" },
imageFit: "contain",
imageWidth: 1200,
imageHeight: 900,
```

The active CV links point to the supplied `Andrey_Matviyenko_Resume_Embedded_UAV_Engineer.pdf` and `Andrey_Matviyenko_Resume_SE.pdf` under `output/pdf/`; CI copies these unchanged. Older generated CVs are retained there for reference. Do not regenerate over the supplied PDFs.

## Styling and interaction

Eleventy's `eleventy.before` hook runs `npm run build:css` for local development, production builds, and direct `npx eleventy` calls in CI. Tailwind scans literal classes in `src/**/*.njk` and writes the minified stylesheet to `.cache/site.css`; Eleventy publishes it as `assets/site.css`. Source style changes trigger the development watcher. No Tailwind CDN script or browser runtime is used.

Layout, spacing, typography, responsive rules, and individual interaction variants are expressed with Tailwind utilities. Shared controls and theme tokens live in `src/styles/tailwind.css`. DefTech uses green tokens and Front-End overrides them with blue. Color aliases use `@theme inline` so utilities resolve the active profile variables on the element.

Project photos alternate left and right on desktop, starting on the left. Text-only cards do not advance this sequence. On mobile, each photo appears above its project text.

Project, experience, and contact headings share the same type scale and colour. Hovering anywhere within a project card gently enlarges its image; focusing a link within that card provides the same effect. The sticky header uses a translucent white background and backdrop blur where supported, making the glass effect visible as content scrolls behind it; browsers without blur support retain an opaque white background.

Interface icons use [Lucide](https://lucide.dev/guide/icons). `lib/icons.js` imports each icon directly from its own `@lucide/icons/icons/…` module and uses `buildLucideSvg` during the Eleventy build. Templates render them with the `icon` shortcode. Only requested inline SVGs are emitted into HTML; each inherits the link colour and is hidden from assistive technology when its visible label already describes the action. The library licence is included at `assets/lucide-LICENSE.txt`.

Links have hover, focus-visible, and active styles; external web destinations open with `target="_blank"` and `rel="noopener"`. The profile switch exposes its selected state with `aria-current`. The switch pairs DefTech with Lucide's Drone icon and Front-End with CodeXml, imported individually at build time. Main navigation and language links keep separate, comfortably spaced targets. The switch has 44px-tall links and a safe-area-aware bottom offset. The footer reserves `--dock-clearance`, and scroll padding keeps focused controls clear of fixed UI.

The job-search status uses a compact badge with a Lucide magnifier that gently grows by 18% and returns to its original size, pausing between cycles while the text remains still. The intro resume button has a 56px minimum height; the experience resume button spans the full section width with an 80px minimum height. Both have 32px horizontal padding and a white PDF label, with colour following the profile accent. The contact section contains the email link without a duplicate resume button.

Motion includes the magnifier's slow 3.6-second search cycle, a small intro entrance, short color transitions, external-link arrow movement, and slight scaling of supplied images. `prefers-reduced-motion` disables non-essential animations, transitions, and smooth scrolling. Content and navigation remain functional without JavaScript.

## Flight mini-game

The game is currently hidden. Set `gameEnabled` to `true` in `src/_data/site.json` to restore it. While disabled, the portfolio emits no game launcher, dialog, or script. The module, tests, and existing browser records are preserved.

When enabled, the footer's **Play / Грати** button opens a native modal dialog with a small drone arcade game. Both profiles use the same game, with the active profile's accent and the page's EN/UK copy. Each star awards 10 points; the player has three lives, and difficulty increases every 15 seconds. Incoming obstacles have a short edge warning and hits grant a recovery period. Move with the mouse, arrow keys, WASD, or a relative touch drag. Space / P pauses; Escape closes. The game also pauses when the tab loses focus or the arena changes size, and resumes only through an explicit action.

When enabled, `src/assets/game/launch.js` is the only script loaded with the portfolio. It imports `game.js` on the first click; that module composes the pure simulation in `engine.js`, canvas rendering in `draw.js`, and browser-local records in `records.js`. No game loop runs while the dialog is closed or paused. The launcher remains hidden without JavaScript, leaving the portfolio fully usable. A failed load offers a retry. Optional star pulsing is disabled for reduced motion; the game's essential movement remains available after the player starts it.

The best score and longest flight are stored under `am-portfolio-flight:v1` in `localStorage`, shared across languages and profiles on the same origin. Closing a round also saves its results. Blocked or full storage falls back to the current tab's memory; malformed records are reset safely. There is no shared leaderboard or game service. `npm run test:game` checks movement, collection, collision recovery, fast collisions, round completion, resizing, and storage failures; it also runs as part of `npm test` and CI.

## GitHub Pages

The Git remote currently uses an old repository name (`andriimatviienko.github.io`); GitHub redirects it to [AndreyMatviyenko/andreymatviyenko.github.io](https://github.com/AndreyMatviyenko/andreymatviyenko.github.io). The public repository's default branch is `master`.

In the repository's **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. Then push to `master`, or run **Actions → Build and deploy Eleventy → Run workflow** on `master`.

The workflow:

1. Installs locked dependencies with `npm ci` on Node.js 24.
2. Builds and verifies a test deployment under `/test-portfolio/`.
3. Reads the actual origin and base path with `actions/configure-pages`.
4. Builds and verifies the production output, then uploads `_site`.
5. Deploys with `actions/deploy-pages` using the `github-pages` environment.

Pull requests run checks without deployment. Manual runs deploy only from `master`. No personal access token or manually configured secret is needed; the workflow uses GitHub's built-in token and OIDC. See the [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

`ELEVENTY_PATH_PREFIX` is the deployment subpath, and `SITE_URL` is the origin (without the subpath). Local defaults are `/` and `https://andreymatviyenko.github.io`. To verify another origin and path:

```sh
ELEVENTY_PATH_PREFIX=/test-portfolio SITE_URL=https://example.test npx eleventy --output=_site-prefix
ELEVENTY_PATH_PREFIX=/test-portfolio SITE_URL=https://example.test node scripts/check-site.mjs _site-prefix
```

## Previous version and rollback

Before migration, this was a 2017 portfolio with three HTML pages, Gulp 3, Sass, jQuery 1.11, a particle effect, Owl Carousel, a Google Apps Script contact form, and an old PDF CV. There was no Eleventy configuration, lockfile, or GitHub Actions workflow. The working tree was clean at commit `3c335fe5f4114bdb52b73b757a29b151fd617949`.

Every original file except the root `.gitignore` is preserved byte for byte in `legacy/`. The archive also preserves the original `.gitignore` and the entire original tracked tree:

```text
backups/portfolio-pre-11ty-3c335fe.tar.gz
SHA-256: 3fdfe4ce0127f5e0d38e847028ecad10df3efa08896f30bf9fcd305eb405e477
```

To republish the old site without rewriting Git history, run **Actions → Restore pre-Eleventy portfolio → Run workflow** on `master`. This verifies the archive checksum and publishes the original HTML, styles, scripts, images, and PDF. The next push to `master`, or a manual run of **Build and deploy Eleventy**, restores the new site. Both workflows share a deployment concurrency group.

To inspect the original locally, extract the archive into a **new empty directory**, then serve that directory with any static HTTP server. Its pre-existing external integrations are preserved in the archive; their current availability has not been verified. Do not extract over the new source tree.

`backups/portfolio-eleventy-before-deftech.tar.gz` additionally preserves the first Eleventy version before the DefTech redesign. It contains that version's source and workflow files; it does not include installed dependencies or build output. Extract it into a new directory, copy the unchanged `legacy/` and original backup there, and use `npm ci` to reproduce that version. The one-click rollback workflow above continues to restore the original pre-Eleventy site.

`backups/portfolio-before-tailwind.tar.gz` preserves the source and PDFs before the Tailwind conversion and bottom-switch changes.
