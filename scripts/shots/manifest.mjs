// Image recipes per project (text from site.ts). Options + workflow: README.md, PROMPT.md.
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { projects as content } from "../../src/content/site.ts";

const from = (slug) => {
  const p = content.find((x) => x.slug === slug);
  if (!p) throw new Error(`manifest: ${slug} is not in src/content/site.ts`);
  return { slug, n: p.n, title: p.title, category: p.category, stack: p.stack };
};

const reachable = (url) => () =>
  fetch(url, { signal: AbortSignal.timeout(4000) }).then(
    () => true,
    () => false,
  );

const desktop = (url, scrollTo, extra = {}) => ({ url, scrollTo, ...extra });
const mobile = (url, scrollTo, extra = {}) => ({ url, scrollTo, device: "mobile", ...extra });

const thulirSnapshot = new URL("../../.notes/snapshots/thulir.htm", import.meta.url);
const THULIR = existsSync(thulirSnapshot) ? thulirSnapshot.href : "https://www.thulirmedia.com/";
const thulirCache = "https://www.thulirmedia.com/**";
const revealed = '[style*="opacity: 0"],[style*="opacity:0"]{opacity:1!important;visibility:visible!important;transform:none!important;clip-path:none!important}';
const th = (scrollTo) => desktop(THULIR, scrollTo, { settle: 2200, cache: thulirCache, css: revealed });
const thM = (scrollTo) => mobile(THULIR, scrollTo, { settle: 2200, cache: thulirCache, css: revealed });

const MEDAAC = "https://www.medaac.com/";
const medaacHide = ["div.fixed.inset-0.z-999", "div.fixed.inset-0.z-1000", ".npfWidgetButton"];
const med = (scrollTo, extra) => desktop(MEDAAC, scrollTo, { hide: medaacHide, settle: 1800, ...extra });
const medM = (scrollTo, extra) => mobile(MEDAAC, scrollTo, { hide: medaacHide, settle: 1800, ...extra });

const ASWIN = "https://aswins-portfli0.vercel.app/";
const as = (scrollTo, extra) => desktop(ASWIN, scrollTo, { settle: 2500, ...extra });
const asM = (scrollTo, extra) => mobile(ASWIN, scrollTo, { settle: 2500, ...extra });

const DINESH = "https://dinesh-editor-portfolio.netlify.app/";
// Home sections mount only after the ~4.8s edit-suite loader exits.
const dineshWait = { waitFor: "#about", before: (page) => page.waitForTimeout(1500) };
const di = (scrollTo, extra) => desktop(DINESH, scrollTo, { settle: 3000, ...dineshWait, ...extra });
const diM = (scrollTo, extra) => mobile(DINESH, scrollTo, { settle: 3000, ...dineshWait, ...extra });

const BHARATHI = "https://senthurveld.github.io/photography-site/";
const bh = (scrollTo) => desktop(BHARATHI, scrollTo, { settle: 3000, block: ["https://example.com/**"] });
const bhM = (scrollTo) => mobile(BHARATHI, scrollTo, { settle: 3000, block: ["https://example.com/**"] });

const COUNTRY = "https://senthurveld.github.io/country-explorer/";
let dataset;
async function restCountries() {
  if (dataset) return dataset;
  const cache = new URL("./.raw/countriesV3.1.json", import.meta.url);
  try {
    dataset = JSON.parse(await readFile(cache, "utf8"));
  } catch {
    const res = await fetch("https://gitlab.com/restcountries/restcountries/-/raw/master/src/main/resources/countriesV3.1.json");
    if (!res.ok) throw new Error(`REST Countries dataset: HTTP ${res.status}`);
    dataset = await res.json();
    await mkdir(new URL("./.raw/", import.meta.url), { recursive: true });
    await writeFile(cache, JSON.stringify(dataset));
  }
  return dataset;
}
const countryApi = [
  "https://restcountries.com/v3.1/name/**",
  async (route) => {
    const name = decodeURIComponent(new URL(route.request().url()).pathname.split("/").pop()).toLowerCase();
    const hits = (await restCountries()).filter((c) => c.name.common.toLowerCase() === name || c.name.official.toLowerCase() === name);
    await route.fulfill({ status: hits.length ? 200 : 404, json: hits.length ? hits : { status: 404, message: "Not Found" }, headers: { "access-control-allow-origin": "*" } });
  },
];
const search = (country) => async (page) => {
  await page.fill("#searchInput", country);
  await page.click("#searchBtn");
  await page.waitForSelector("#countryDetails img", { timeout: 20_000 });
  await page.waitForSelector(".leaflet-tile-loaded", { timeout: 30_000 }).catch(() => {});
};
const ce = (country, extra) => desktop(COUNTRY, undefined, { routes: [countryApi], before: search(country), settle: 2000, ...extra });
const ceM = (country, extra) => mobile(COUNTRY, undefined, { routes: [countryApi], before: search(country), settle: 2000, ...extra });

const MUSIX = process.env.MUSIX_URL ?? "http://localhost:5181/";
const musixAuth = [
  "**/api/auth/check-auth",
  (route) =>
    route.fulfill({
      json: { success: true, user: { name: "Listener", email: "listener@example.com", isVerified: true } },
      headers: { "access-control-allow-origin": new URL(MUSIX).origin, "access-control-allow-credentials": "true" },
    }),
];
const mx = (route, extra) => desktop(`${MUSIX}${route}`, undefined, { settle: 1500, ...extra });
const mxIn = (route, extra) => mx(route, { routes: [musixAuth], ...extra });
const mxM = (route, extra) => mx(route, { device: "mobile", ...extra });
const musixSearch = (q) => async (page) => {
  await page.selectOption("select", "archive");
  const input = page.locator('input[placeholder^="Search songs"]');
  await input.fill(q);
  await Promise.all([page.waitForResponse((r) => r.url().includes("/api/search/search"), { timeout: 90_000 }), input.press("Enter")]);
  await page.waitForTimeout(1000);
};

export const projects = [
  {
    ...from("thulir-media"),
    domain: "thulirmedia.com",
    accent: "#d91b1b",
    tagline: "Studio site, buttery smooth",
    ready: THULIR.startsWith("file:") ? undefined : reachable(THULIR),
    readyHint: "thulirmedia.com is not responding; try again later",
    explore: {
      desktop: th(),
      mobile: thM(),
    },
    captures: {
      hero: th(0),
      about: th(900),
      services: th(1800),
      why: th(2700),
      "m-hero": thM(0),
      "m-about": thM(844),
      "m-stats": thM(1688),
      "m-services": thM(2532),
    },
    slots: [
      {
        slot: "cover",
        template: "poster",
        desktop: "hero",
        mobile: "m-hero",
        chips: [
          { x: 1250, y: 70, label: "Scope", value: "Whole site", to: [1180, 180] },
          { x: 1230, y: 860, label: "Motion", value: "GSAP + Lenis", to: [1130, 790] },
        ],
      },
      { slot: "tall", template: "duo", desktop: "about", mobile: "m-services" },
      { slot: "details", template: "zoom", shot: "hero", crop: [250, 90, 600, 600], caption: "Hero slider" },
      { slot: "details", template: "handset", shot: "m-services", caption: "Mobile view" },
      { slot: "gallery", template: "window", shot: "about", alt: "Thulir Media intro, Every Frame Tells Your Story, with the studio's headline numbers" },
      { slot: "gallery", template: "window", shot: "services", alt: "Wedding photography and videography section with a photo collage and service tags" },
      { slot: "gallery", template: "window", shot: "why", alt: "Why choose Thulir Media: studio story beside a framed couple photo" },
      { slot: "gallery", template: "trio", shots: ["m-hero", "m-about", "m-services"], alt: "Thulir Media on mobile: hero, intro and wedding services" },
    ],
  },
  {
    ...from("medaac"),
    domain: "medaac.com",
    accent: "#e10a6f",
    tagline: "A full UI glow-up",
    explore: {
      desktop: { url: MEDAAC, hide: medaacHide },
      mobile: { url: MEDAAC, device: "mobile", hide: medaacHide },
    },
    captures: {
      hero: med(0),
      mission: med(900),
      courses: med(1800),
      states: med(2700),
      journey: med(3600),
      "m-hero": medM(0),
      "m-mission": medM(844),
      "m-courses": medM(1688),
    },
    slots: [
      {
        slot: "cover",
        template: "poster",
        desktop: "hero",
        mobile: "m-hero",
        chips: [
          { x: 1250, y: 70, label: "Scope", value: "Full UI redesign", to: [1180, 180] },
          { x: 1210, y: 860, label: "Built with", value: "React + Swiper", to: [1120, 790] },
        ],
      },
      { slot: "tall", template: "duo", desktop: "hero", mobile: "m-courses" },
      { slot: "details", template: "zoom", shot: "hero", crop: [736, 200, 620, 620], caption: "Admissions at a glance" },
      { slot: "details", template: "handset", shot: "m-mission", caption: "Mobile view" },
      { slot: "gallery", template: "window", shot: "mission", alt: "Medaac mission section with a graduation photo and the trending-courses carousel" },
      { slot: "gallery", template: "window", shot: "states", alt: "Choose your preferred state: destination cards with flags" },
      { slot: "gallery", template: "window", shot: "journey", alt: "Simplifying your admission journey: a three-step guide beside a student photo" },
      { slot: "gallery", template: "trio", shots: ["m-hero", "m-mission", "m-courses"], alt: "Medaac on mobile: the hero, how-it-works steps with headline numbers, and the mission section" },
    ],
  },
  {
    ...from("bharathi-studio"),
    domain: "senthurveld.github.io",
    accent: "#9b3b2c",
    tagline: "Photo studio, WhatsApp-first",
    explore: {
      desktop: { url: BHARATHI, block: ["https://example.com/**"] },
      mobile: { url: BHARATHI, device: "mobile", block: ["https://example.com/**"] },
    },
    captures: {
      hero: bh(0),
      services: bh(1800),
      gallery: bh(3400),
      "m-hero": bhM(0),
      "m-packages": bhM(4350),
      "m-gallery": bhM(5220),
    },
    slots: [
      {
        slot: "cover",
        template: "poster",
        desktop: "hero",
        mobile: "m-hero",
        chips: [
          { x: 1250, y: 70, label: "Pre-booking", value: "Straight to WhatsApp", to: [1180, 180] },
          { x: 1240, y: 860, label: "Built with", value: "Bootstrap 5", to: [1140, 790] },
        ],
      },
      { slot: "tall", template: "duo", desktop: "gallery", mobile: "m-hero" },
      { slot: "details", template: "zoom", shot: "hero", crop: [380, 90, 700, 700], caption: "Hero carousel" },
      { slot: "details", template: "handset", shot: "m-gallery", caption: "Gallery" },
      { slot: "gallery", template: "window", shot: "services", alt: "Bharathi Studio services: wedding, pre-wedding, puberty ceremony and birthday shoots" },
      { slot: "gallery", template: "window", shot: "gallery", alt: "Photo gallery grid above the footer with contact details" },
      { slot: "gallery", template: "trio", shots: ["m-hero", "m-packages", "m-gallery"], alt: "Bharathi Studio on mobile: hero, a package and the gallery" },
    ],
  },
  {
    ...from("aswin-portfolio"),
    domain: "aswins-portfli0.vercel.app",
    accent: "#0f68a6",
    tagline: "AI work, told as case studies",
    explore: {
      desktop: { url: ASWIN, settle: 2500 },
      mobile: { url: ASWIN, device: "mobile", settle: 2500 },
    },
    captures: {
      hero: as(0),
      about: as(2250),
      work: as(3200),
      contact: as(4150),
      "m-hero": asM(0),
      "m-work": asM(2200),
      "m-contact": asM(3376),
    },
    slots: [
      {
        slot: "cover",
        template: "poster",
        desktop: "hero",
        mobile: "m-hero",
        chips: [
          { x: 1250, y: 70, label: "Motion", value: "GSAP + Lenis", to: [1180, 180] },
          { x: 1210, y: 860, label: "Built with", value: "React + Tailwind v4", to: [1120, 790] },
        ],
      },
      { slot: "tall", template: "duo", desktop: "work", mobile: "m-work" },
      { slot: "details", template: "zoom", shot: "hero", crop: [40, 80, 720, 720], caption: "Sky hero" },
      { slot: "details", template: "handset", shot: "m-contact", caption: "Mobile view" },
      { slot: "gallery", template: "window", shot: "about", alt: "Aswin Kumar's about section: a word-by-word statement on shipping AI systems" },
      { slot: "gallery", template: "window", shot: "work", alt: "Selected work carousel with AI HR Assistant and Hazardous Waste Detection case-study cards" },
      { slot: "gallery", template: "window", shot: "contact", alt: "Contact section, Have something worth automating, beside the Write to me form" },
      { slot: "gallery", template: "trio", shots: ["m-hero", "m-work", "m-contact"], alt: "Aswin Kumar's portfolio on mobile: sky hero, a case-study card and the contact form" },
    ],
  },
  {
    ...from("dinesh-portfolio"),
    domain: "dinesh-editor-portfolio.netlify.app",
    accent: "#39d401",
    tagline: "Reels first, edit-suite vibes",
    explore: {
      desktop: { url: DINESH, ...dineshWait },
      mobile: { url: DINESH, device: "mobile", ...dineshWait },
    },
    captures: {
      hero: di(0),
      reel: di(1000),
      about: di(2150),
      skills: di(3700),
      "m-hero": diM(0),
      "m-reel": diM(1100),
      "m-about": diM(1600),
      "m-skills": diM(4150),
    },
    slots: [
      {
        slot: "cover",
        template: "poster",
        desktop: "hero",
        mobile: "m-hero",
        chips: [
          { x: 1250, y: 70, label: "Graphics", value: "WebGL via OGL", to: [1180, 180] },
          { x: 1210, y: 860, label: "Built with", value: "React + GSAP", to: [1120, 790] },
        ],
      },
      { slot: "tall", template: "duo", desktop: "reel", mobile: "m-about" },
      { slot: "details", template: "zoom", shot: "hero", crop: [160, 220, 680, 680], caption: "Hero" },
      { slot: "details", template: "handset", shot: "m-skills", caption: "Mobile view" },
      { slot: "gallery", template: "window", shot: "reel", alt: "Works showcase, Stories through edits and sound, above an autoplaying reel" },
      { slot: "gallery", template: "window", shot: "about", alt: "Crafting stories: Dinesh's biography beside his experience timeline" },
      { slot: "gallery", template: "window", shot: "skills", alt: "What I use: tool grid with After Effects selected, its proficiency and uses" },
      { slot: "gallery", template: "trio", shots: ["m-hero", "m-reel", "m-about"], alt: "Dinesh R's portfolio on mobile: hero, showreel and biography, with the bottom dock nav" },
    ],
  },
  {
    ...from("musix"),
    domain: "localhost:5181",
    accent: "#22c55e",
    tagline: "Search it. Play it. Vibe.",
    ready: reachable(MUSIX),
    readyHint: "start the Musix client first (cd music-app/client && npx vite --port 5181), or set MUSIX_URL",
    explore: {
      login: mx("login"),
      search: mxIn("search", { before: musixSearch("classical piano") }),
    },
    captures: {
      login: mx("login"),
      signup: mx("signup"),
      search: mxIn("search", { before: musixSearch("classical piano") }),
      "m-login": mxM("login"),
      "m-signup": mxM("signup"),
      "m-search": mxM("search", { routes: [musixAuth], before: musixSearch("jazz"), scrollTo: 560 }),
    },
    slots: [
      {
        slot: "cover",
        template: "poster",
        desktop: "search",
        mobile: "m-login",
        chips: [
          { x: 1210, y: 70, label: "Sources", value: "YouTube + Internet Archive", to: [1150, 180] },
          { x: 1250, y: 860, label: "Auth", value: "JWT + email verify", to: [1150, 790] },
        ],
      },
      { slot: "tall", template: "duo", desktop: "login", mobile: "m-search" },
      { slot: "details", template: "zoom", shot: "search", crop: [150, 80, 760, 760], caption: "Two sources, one search" },
      { slot: "details", template: "handset", shot: "m-signup", caption: "Password strength meter" },
      { slot: "gallery", template: "window", shot: "search", alt: "Musix search for classical piano: source cards and Internet Archive results with audio players" },
      { slot: "gallery", template: "window", shot: "signup", alt: "Musix sign-up form with a live password strength checklist" },
      { slot: "gallery", template: "trio", shots: ["m-login", "m-search", "m-signup"], alt: "Musix on mobile: log in, search results and sign-up" },
    ],
  },
  {
    ...from("country-explorer"),
    domain: "senthurveld.github.io",
    accent: "#3b82f6",
    tagline: "Every country, one search",
    explore: {
      japan: ce("Japan"),
      "m-japan": ceM("Japan"),
    },
    captures: {
      japan: ce("Japan"),
      "m-japan": ceM("Japan"),
      "m-brazil": ceM("Brazil"),
      "m-iceland": ceM("Iceland"),
    },
    slots: [
      {
        slot: "cover",
        template: "poster",
        desktop: "japan",
        crop: [0, 0, 1440, 690],
        mobile: "m-japan",
        chips: [
          { x: 1250, y: 70, label: "Data", value: "REST Countries", to: [1180, 180] },
          { x: 1250, y: 760, label: "Maps", value: "Leaflet + OSM", to: [1150, 640] },
        ],
      },
      { slot: "tall", template: "duo", desktop: "japan", crop: [0, 0, 1440, 690], mobile: "m-brazil" },
      { slot: "details", template: "zoom", shot: "m-japan", crop: [0, 150, 390, 390], caption: "Search result" },
      { slot: "details", template: "handset", shot: "m-iceland", caption: "Any country" },
      { slot: "gallery", template: "window", shot: "japan", crop: [0, 0, 1440, 700], alt: "Country Explorer showing Japan: flag, region, capital, population, language and timezone, with a Leaflet map" },
      { slot: "gallery", template: "trio", shots: ["m-japan", "m-brazil", "m-iceland"], alt: "Country Explorer on mobile: Japan, Brazil and Iceland" },
    ],
  },
];
