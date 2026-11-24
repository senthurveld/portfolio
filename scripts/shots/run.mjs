#!/usr/bin/env node
// Project images: capture -> compose -> AVIF + WebP. Usage: scripts/shots/README.md.
import { existsSync, readdirSync, realpathSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";
import { projects } from "./manifest.mjs";
import { SLOTS, TEMPLATES, document as htmlDocument } from "./templates.mjs";

const here = realpathSync.native(path.dirname(fileURLToPath(import.meta.url)));
const root = path.resolve(here, "../..");
const RAW = path.join(here, ".raw");
const OUT = path.join(root, "public", "images", "projects");
const JSON_OUT = path.join(root, "src", "content", "shots.json");
// AVIF q60 is ~45% smaller than WebP q86 on these screenshots with no visible loss in small text.
const QUALITY = { avif: 60, webp: 86 };
const BUDGET = 250 * 1024;

export const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
};

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const value = (f) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null;
};
const explore = flag("--explore") ? value("--explore") ?? "*" : null;
const only = (value("--only") ?? (explore && explore !== "*" ? explore : null))?.split(",");
const selected = projects.filter((p) => !only || only.includes(p.slug));
if (only && selected.length !== only.length) fail(`Unknown slug in --only. Known: ${projects.map((p) => p.slug).join(", ")}`);
const doCapture = !flag("--compose");
const doCompose = !flag("--capture") && !explore;

function fail(msg) {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
}

function chromiumCandidates() {
  const list = process.env.SHOTS_CHROME ? [process.env.SHOTS_CHROME] : [];
  const cache =
    process.env.PLAYWRIGHT_BROWSERS_PATH ||
    (process.platform === "win32"
      ? path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright")
      : process.platform === "darwin"
        ? path.join(os.homedir(), "Library", "Caches", "ms-playwright")
        : path.join(os.homedir(), ".cache", "ms-playwright"));
  if (existsSync(cache)) {
    const dirs = readdirSync(cache)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
    const bins = ["chrome-win64/chrome.exe", "chrome-win/chrome.exe", "chrome-linux64/chrome", "chrome-linux/chrome", "chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium", "chrome-mac/Chromium.app/Contents/MacOS/Chromium"];
    for (const d of dirs) for (const b of bins) if (existsSync(path.join(cache, d, b))) list.push(path.join(cache, d, b));
  }
  return list;
}

async function launch() {
  for (const executablePath of chromiumCandidates()) {
    try {
      return await chromium.launch({ executablePath });
    } catch {
      /* try the next one */
    }
  }
  for (const opts of [{}, { channel: "chrome" }, { channel: "msedge" }]) {
    try {
      return await chromium.launch(opts);
    } catch {
      /* try the next one */
    }
  }
  fail("No Chromium found. Run `npx playwright install chromium`, or set SHOTS_CHROME to a Chrome/Edge executable.");
}

const SCROLLER = `window.__scroller = () => {
  const d = document.scrollingElement || document.documentElement;
  if (d.scrollHeight > innerHeight + 20) return d;
  let best = d, area = 0;
  for (const el of document.querySelectorAll("body *")) {
    if (el.scrollHeight <= el.clientHeight + 20 || !/(auto|scroll)/.test(getComputedStyle(el).overflowY)) continue;
    const a = el.clientWidth * el.clientHeight;
    if (a > area) { best = el; area = a; }
  }
  return best;
};`;

async function goto(page, url) {
  for (let attempt = 1; ; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      break;
    } catch (e) {
      if (attempt === 4) throw e;
      console.log(`    retry ${attempt}: ${e.message.split("\n")[0]}`);
      await page.waitForTimeout(5_000 * attempt);
    }
  }
  await page.waitForLoadState("load", { timeout: 45_000 }).catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
}

const sweep = (page) =>
  page.evaluate(async () => {
    const s = window.__scroller();
    for (let i = 0, y = 0; i < 40 && y < s.scrollHeight; i++, y += innerHeight * 0.6) {
      s.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 180));
    }
    await new Promise((r) => setTimeout(r, 500));
    s.scrollTo(0, 0);
  });

const scrollTo = (page, to, offset = 0) =>
  page.evaluate(
    ([to, offset]) => {
      const s = window.__scroller();
      let y = to;
      if (typeof to === "string") {
        const el = document.querySelector(to);
        if (!el) throw new Error(`scrollTo: nothing matches ${to}`);
        const base = s === document.scrollingElement ? 0 : s.getBoundingClientRect().top;
        y = s.scrollTop + el.getBoundingClientRect().top - base;
      }
      s.scrollTo(0, Math.max(0, y - offset));
    },
    [to, offset],
  );

async function settle(page, ms = 1200) {
  await page.evaluate(() =>
    Promise.all(
      [...document.images]
        .filter((i) => i.getBoundingClientRect().top < innerHeight * 1.5)
        .map((i) =>
          Promise.race([
            (i.complete ? Promise.resolve() : new Promise((r) => i.addEventListener("load", r, { once: true }))).then(() => i.decode?.()).catch(() => {}),
            new Promise((r) => setTimeout(r, 15_000)),
          ]),
        ),
    ),
  );
  await page.waitForTimeout(ms);
}

const hideCss = (hide = []) =>
  `${hide.map((s) => `${s}{display:none!important}`).join("")}html{scrollbar-width:none}::-webkit-scrollbar{display:none}*{caret-color:transparent!important}`;

async function cached(route) {
  const req = route.request();
  if (req.method() !== "GET") return route.continue();
  const file = path.join(RAW, ".cache", createHash("sha1").update(req.url()).digest("hex"));
  if (existsSync(`${file}.json`)) {
    const { status, headers } = JSON.parse(await readFile(`${file}.json`, "utf8"));
    return route.fulfill({ status, headers, body: await readFile(file) });
  }
  const res = await route.fetch({ timeout: 60_000 });
  const body = await res.body();
  const headers = Object.fromEntries(Object.entries(res.headers()).filter(([k]) => !["content-encoding", "content-length", "transfer-encoding"].includes(k)));
  if (res.status() < 400) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
    await writeFile(`${file}.json`, JSON.stringify({ status: res.status(), headers }));
  }
  return route.fulfill({ status: res.status(), headers, body });
}

async function openPage(browser, c) {
  const device = DEVICES[c.device ?? "desktop"];
  const ctx = await browser.newContext({ ...device, colorScheme: c.colorScheme ?? "light", locale: "en-US", timezoneId: "Asia/Kolkata" });
  await ctx.addInitScript(SCROLLER);
  if (c.storage) await ctx.addInitScript((kv) => Object.entries(kv).forEach(([k, v]) => localStorage.setItem(k, v)), c.storage);
  if (c.cache) await ctx.route(c.cache, cached);
  for (const pattern of c.block ?? []) await ctx.route(pattern, (r) => r.abort());
  for (const [pattern, handler] of c.routes ?? []) await ctx.route(pattern, handler);
  const page = await ctx.newPage();
  await goto(page, c.url);
  if (c.waitFor) await page.waitForSelector(c.waitFor, { state: "visible", timeout: 45_000 });
  await page.evaluate(() => document.fonts.ready);
  if (c.before) await c.before(page);
  return { ctx, page };
}

async function capture(browser, p, id, c) {
  const { ctx, page } = await openPage(browser, c);
  try {
    await sweep(page);
    if (c.scrollTo !== undefined) await scrollTo(page, c.scrollTo, c.offset);
    if (c.after) await c.after(page);
    await page.addStyleTag({ content: hideCss(c.hide) + (c.css ?? "") });
    await settle(page, c.settle);
    const file = path.join(RAW, p.slug, `${id}.png`);
    await page.screenshot({ path: file, animations: "disabled", caret: "hide", scale: "device" });
    console.log(`  ✓ captured ${id}`);
  } finally {
    await ctx.close();
  }
}

async function exploreProject(browser, p) {
  for (const [id, c] of Object.entries(p.explore ?? {})) {
    const dir = path.join(RAW, p.slug, "explore", id);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
    const { ctx, page } = await openPage(browser, c);
    try {
      await sweep(page);
      await page.addStyleTag({ content: hideCss(c.hide) + (c.css ?? "") });
      const { height, view } = await page.evaluate(() => ({ height: window.__scroller().scrollHeight, view: innerHeight }));
      for (let i = 0, y = 0; y < height && i < 30; i++, y += view) {
        await scrollTo(page, y);
        await settle(page, 700);
        await page.screenshot({ path: path.join(dir, `${String(i).padStart(2, "0")}-y${y}.png`), animations: "disabled", scale: "css" });
      }
      console.log(`  ✓ explored ${id}: ${dir}`);
    } finally {
      await ctx.close();
    }
  }
}

function fontCss() {
  const require = createRequire(import.meta.url);
  for (const spec of ["@fontsource-variable/urbanist/index.css", "@fontsource-variable/urbanist"]) {
    try {
      const file = require.resolve(spec);
      if (file.endsWith(".css")) return pathToFileURL(file).href;
    } catch {
      /* next */
    }
  }
  console.warn("  ! Urbanist font CSS not found; compositions fall back to system fonts");
  return null;
}

// Each width as AVIF (served first) and WebP (fallback), plus a 16px WebP data URI shown while the real image loads.
async function encode(png, widths) {
  const files = [];
  for (const w of widths) {
    const img = sharp(png).resize(w);
    const [webp, avif] = await Promise.all([
      img.clone().webp({ quality: QUALITY.webp, effort: 6 }).toBuffer({ resolveWithObject: true }),
      img.clone().avif({ quality: QUALITY.avif, effort: 5 }).toBuffer(),
    ]);
    files.push({ w, h: webp.info.height, webp: webp.data, avif });
  }
  const lqip = await sharp(png).resize(16).webp({ quality: 50 }).toBuffer();
  return { files, lqip: `data:image/webp;base64,${lqip.toString("base64")}` };
}

async function compose(browser, p, font) {
  const shot = (id) => {
    const c = p.captures[id];
    const file = path.join(RAW, p.slug, `${id}.png`);
    if (!c) fail(`${p.slug}: no capture named "${id}"`);
    if (!existsSync(file)) fail(`${p.slug}: missing ${file}. Run without --compose first.`);
    const { width, height } = DEVICES[c.device ?? "desktop"].viewport;
    return { src: pathToFileURL(file).href, w: width, h: height };
  };
  const dir = path.join(OUT, p.slug);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const ctx = await browser.newContext({ deviceScaleFactor: 2 });
  const result = {};
  const count = {};
  let bytes = 0;
  for (const s of p.slots) {
    const size = SLOTS[s.slot];
    const template = TEMPLATES[s.template];
    if (!size || !template) fail(`${p.slug}: unknown slot "${s.slot}" or template "${s.template}"`);
    count[s.slot] = (count[s.slot] ?? 0) + 1;
    const multi = s.slot === "details" || s.slot === "gallery";
    const name = multi ? `${s.slot}-${count[s.slot]}` : s.slot;

    const html = htmlDocument(template({ p, s, shot, size }), size, font);
    const htmlFile = path.join(RAW, p.slug, `_${name}.html`);
    await writeFile(htmlFile, html);
    const page = await ctx.newPage();
    await page.setViewportSize({ width: size.w, height: size.h });
    await page.goto(pathToFileURL(htmlFile).href);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    });
    const png = await page.screenshot({ type: "png" });
    await page.close();

    const { files, lqip } = await encode(png, size.widths);
    for (const f of files) {
      for (const ext of ["avif", "webp"]) {
        const file = path.join(dir, `${name}-${f.w}.${ext}`);
        const n = f[ext].length;
        await writeFile(file, f[ext]);
        bytes += n;
        if (n > BUDGET) console.warn(`  ! ${path.relative(root, file)} is ${Math.round(n / 1024)} KB (budget ${BUDGET / 1024} KB)`);
      }
    }
    const url = (w, ext) => `/images/projects/${p.slug}/${name}-${w}.${ext}`;
    const set = (ext) => files.map((f) => `${url(f.w, ext)} ${f.w}w`).join(", ");
    const largest = files.at(-1);
    const entry = { src: url(largest.w, "webp"), srcSet: set("webp"), avif: set("avif"), w: largest.w, h: largest.h, lqip, ...(s.alt ? { alt: s.alt } : {}) };
    if (multi) (result[s.slot] ??= []).push(entry);
    else result[s.slot] = entry;
  }
  await ctx.close();
  console.log(`  ✓ composed ${Object.values(count).reduce((a, b) => a + b, 0)} images, ${Math.round(bytes / 1024)} KB total`);
  return result;
}

async function saveJson(all) {
  const ordered = Object.fromEntries(projects.filter((p) => all[p.slug]).map((p) => [p.slug, all[p.slug]]));
  await writeFile(JSON_OUT, `${JSON.stringify(ordered, null, 2)}\n`);
}

const browser = await launch();
const failed = [];
try {
  const font = doCompose ? fontCss() : null;
  const all = JSON.parse(await readFile(JSON_OUT, "utf8").catch(() => "{}"));
  for (const p of selected) {
    console.log(`\n${p.slug}`);
    try {
      await mkdir(path.join(RAW, p.slug), { recursive: true });
      if (explore) {
        await exploreProject(browser, p);
        continue;
      }
      if (doCapture) {
        if (p.ready && !(await p.ready())) throw new Error(p.readyHint ?? "not reachable");
        for (const [id, c] of Object.entries(p.captures)) await capture(browser, p, id, c);
      }
      if (doCompose && !p.slots.length) console.warn("  ! no slots in manifest.mjs yet: nothing to compose");
      else if (doCompose) {
        all[p.slug] = await compose(browser, p, font);
        await saveJson(all);
      }
    } catch (e) {
      failed.push(p.slug);
      console.error(`  ✖ ${e.message.split("\n")[0]}`);
    }
  }
} finally {
  await browser.close();
}
if (doCompose && !explore) console.log(`\nshots.json: ${path.relative(root, JSON_OUT)}`);
if (failed.length) {
  console.error(`\nFailed: ${failed.join(", ")}. Earlier images for these are kept; rerun with --only ${failed.join(",")}.`);
  process.exitCode = 1;
}
