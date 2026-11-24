# Prompt: add a project to the portfolio (copy everything below the line)

Works with Claude Code, Cline, Cursor, ChatGPT or any coding assistant that can read and edit files.
Fill in the `PROJECT` block, then paste the whole prompt.

---

You are updating my portfolio (Vite + React + TypeScript). Add one project: its card copy and its
generated images. Work in this order and stop where I say stop.

## PROJECT

- Name:
- Live URL (or "none"):
- GitHub repo URL (or "none"):
- Local folder of the code (or "none"):
- Saved page snapshot in .notes/snapshots/ (SingleFile .htm, or "none"):
- What I built / my role:
- Client or side project:
- Year:

## Rules

1. Never invent facts. Stack, features, numbers, dates and links must come from the repo
   (package.json, source), the live site, or what I wrote above. If something is missing, ask me.
2. Copy style: short (pitch around 120 characters), Gen Z tech words used lightly (glow-up, vibe
   check, buttery, slides into), no city names. A client's own numbers are theirs, not mine.
3. No live link means the card uses the GitHub repo link (`href: null`, `repo: "<url>"`).
4. Never commit secrets. If the repo has a committed `.env` or API key, tell me before linking it.
5. Don't change other projects, components or styles unless I ask.

## Files

- `src/content/site.ts` holds the `projects` array (copy and text). Copy an existing entry's shape:
  slug, n (two digits), category ("Client work" | "Full-stack" | "Side project"), year, title,
  pitch, stack (3-4 items), href, repo, facts ([label, value] pairs), note, sections
  ([heading, text] pairs: Overview, The problem, What it does, How it's built), featured.
- `scripts/shots/manifest.mjs` holds one image recipe per project. The Medaac entry is the
  simplest example and Thulir Media shows the snapshot fallback. The header comment lists every
  option.
- `scripts/shots/templates.mjs` holds the visual designs. Don't edit it unless I ask.
- Generated output (never edit by hand): `public/images/projects/<slug>/` and
  `src/content/shots.json`.

## Steps

**Step 1: facts.** Read the repo or site and list the stack, the main features and the year with
the evidence for each. Ask me about anything unclear. STOP and wait for my OK.

**Step 2: copy.** Add the entry to `site.ts`, matching the existing entries. Show me the pitch.

**Step 3: explore.** Add a manifest entry with `explore` only (desktop and mobile URLs, or the
snapshot URL `new URL("../../.notes/snapshots/<file>.htm", import.meta.url).href`) and empty
`captures`/`slots`. Run:

    npm run shots:explore -- <slug>

Look at the frames in `scripts/shots/.raw/<slug>/explore/{desktop,mobile}/`. Each file name holds
its scroll position (`03-y2700.png` = 2700px down). Pick 3-4 good desktop views and 3-4 mobile
views. Skip empty or half-loaded frames. If a popup covers the page, find its selector for `hide`.
If sections are blank (scroll animations), add `css: revealed`, like Thulir.

**Step 4: recipe.** Fill in `captures` (desktop(url, y) and mobile(url, y)) and `slots`. The
standard set:

- `cover` / `poster`: desktop hero + mobile hero, plus 2 `chips` with true facts (scope, stack)
- `tall` / `duo`: a different desktop view + a different mobile view
- `details` / `zoom`: an interesting area via `crop: [x, y, w, h]` (desktop 1440 wide, mobile 390
  wide), with a short `caption`
- `details` / `handset`: one mobile view, caption "Mobile view"
- `gallery` / `window`: 2-3 desktop views, each with an `alt` that describes what's on screen
- `gallery` / `trio`: three mobile views, with `alt`

**Step 5: run.**

    npm run shots -- --only <slug>

Open `public/images/projects/<slug>/cover-1280.webp`, `tall-720.webp` and `details-1-640.webp`
and check: text hidden behind the phone, faces or headlines cut by crops, blank sections, popups.
Fix the recipe, then rerun with `npm run shots:compose -- --only <slug>` (offline, fast).

**Step 6: verify.**

    npm run typecheck
    npm test

Then tell me what changed and anything you couldn't verify. Don't commit unless I ask.
