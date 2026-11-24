# Project images: manual and offline guide

To get an AI to do it, use [PROMPT.md](PROMPT.md). By hand, it takes about 10 minutes per project.

## One-time setup

```sh
npm install
npx playwright install chromium      # the browser used for screenshots (~150 MB, once)
```

You need Node 22.18 or newer (`node -v`). To use your own Chrome or Edge instead:
`set SHOTS_CHROME=C:\path\to\chrome.exe` (PowerShell: `$env:SHOTS_CHROME="..."`).

## Commands

| Command | Internet? | What it does |
| --- | --- | --- |
| `npm run shots` | yes | Capture every project, then compose |
| `npm run shots -- --only <slug>` | yes | One project (comma-separate several) |
| `npm run shots:explore -- <slug>` | yes* | One frame per screen height, to pick scroll positions |
| `npm run shots:compose` | **no** | Rebuild every image from saved screenshots |
| `npm run shots:compose -- --only <slug>` | **no** | Rebuild one project |
| `npm run shots:capture -- --only <slug>` | yes* | Screenshots only, no composing |

\* No internet needed when the project's URL is a saved snapshot (see below).

## Working fully offline

1. **Design changes** (`templates.mjs`, crops, captions, chips, taglines):
   `npm run shots:compose`. It uses the screenshots already in `scripts/shots/.raw/`.
2. **New screenshots without the internet:** save each page while online with the **SingleFile**
   browser extension ("Save page"). It writes one `.htm` with every image and font inlined. Put it
   in `.notes/snapshots/`, then point the recipe at it:
   ```js
   const URL = new URL("../../.notes/snapshots/mysite.htm", import.meta.url).href;
   ```
   Explore and capture now run with no network. Scroll the page to the bottom before saving, so
   lazy images and scroll animations are included. If sections still come out blank, add
   `css: revealed` (see the Thulir entry).
3. **Sites that rate-limit or block bots:** add `cache: "https://site.com/**"` to the captures.
   Each file is downloaded once into `.raw/.cache` and replayed after that.
4. **Local apps** (no deploy): start the app's dev server, use `http://localhost:<port>/` as the
   URL (see the Musix entry). Mock API answers with `routes` instead of using real data or secrets.

## Adding a project by hand

1. Add the entry to `src/content/site.ts` (`projects`).
2. Copy the Medaac entry in `manifest.mjs`. Change `from("<slug>")`, `domain`, `accent`
   (brand colour), `tagline` and `explore` URLs. Leave `captures: {}` and `slots: []`.
3. `npm run shots:explore -- <slug>`, then look in `.raw/<slug>/explore/`.
4. Fill in `captures` with the good scroll positions and `slots` with the standard set (see
   PROMPT.md step 4).
5. `npm run shots -- --only <slug>`, then check `public/images/projects/<slug>/`.
6. `npm run dev` and look at the home cards, `/projects` and `/projects/<slug>`.

## Quick fixes

| Problem | Fix in the capture or slot |
| --- | --- |
| Popup or chat widget in the shot | `hide: [".popup", "#chat"]` |
| Heavy images still blank | `settle: 3000` (ms to wait) |
| Close-up shows the wrong area | `crop: [x, y, w, h]` (desktop 1440 wide, mobile 390 wide) |
| Third-party script hangs the page | `block: ["https://slow-cdn.com/**"]` |
| Needs a click or typing first | `before: async (page) => { await page.click("#btn") }` |
| App needs login | `routes: [["**/api/me", (r) => r.fulfill({ json: {...} })]]` |
| Image over 250 KB warning | fewer busy photos in that slot, or a tighter crop |

Raw screenshots (`.raw/`) are git-ignored. Commit `public/images/projects/` and
`src/content/shots.json`.
