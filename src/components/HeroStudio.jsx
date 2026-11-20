import { useEffect, useRef, useState } from "react";
import { gsap, useFinePointer, useReducedMotion } from "../lib/motion";
import { useTilt } from "../lib/hooks";
import { play } from "../lib/sound";

// Example businesses, modelled on the kinds of clients I've built for. Names are fictional.
const examples = [
  {
    id: "studio",
    kind: "Photo studio",
    brand: "Lumen Studio",
    url: "lumenstudio.in",
    title: "Weddings and events, photographed with care.",
    line: "Galleries that load fast on a phone, where your clients look first.",
    cta: "Check dates",
    items: ["Weddings", "Portraits", "Events"],
  },
  {
    id: "trust",
    kind: "Non-profit",
    brand: "Open Door Trust",
    url: "opendoortrust.org",
    title: "A safe bed tonight, and support after.",
    line: "Clear pages for donors, volunteers and the people who need help.",
    cta: "Donate",
    items: ["Shelters", "Meals", "Volunteer"],
  },
  {
    id: "abroad",
    kind: "Consultancy",
    brand: "Northstar Abroad",
    url: "northstarabroad.com",
    title: "Study in the UK, Canada or Ireland.",
    line: "Courses, visas and scholarships, explained in plain words.",
    cta: "Book a call",
    items: ["Courses", "Visas", "Scholarships"],
  },
];

const devices = [
  ["desktop", "Desktop", "100%", 1280],
  ["tablet", "Tablet", "70%", 768],
  ["phone", "Phone", "44%", 390],
];
const accents = ["periwinkle", "coral", "mint", "lemon", "sky"];

export default function HeroStudio() {
  const [device, setDevice] = useState("desktop");
  const [accent, setAccent] = useState("periwinkle");
  const [dark, setDark] = useState(false);
  const [ex, setEx] = useState(0);
  const [split, setSplit] = useState(46); // % of the frame shown as blueprint
  const tilt = useTilt(3);
  const site = useRef(null);
  const stage = useRef(null);
  const intro = useRef(null);
  const drag = useRef(false);
  const rm = useReducedMotion();
  const fine = useFinePointer();
  const e = examples[ex];
  const dev = devices.find((d) => d[0] === device);

  // Content swap: stagger the mini-site (and its blueprint) back in.
  useEffect(() => {
    if (rm || !site.current) return;
    gsap.fromTo(site.current.querySelectorAll("[data-m]"), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.035, ease: "expo.out" });
  }, [ex, rm]);

  // First load: the drawing comes first, then the finished site sweeps in over it.
  useEffect(() => {
    if (rm) return;
    const o = { v: 100 };
    intro.current = gsap.fromTo(o, { v: 100 }, { v: 46, duration: 1.8, delay: 1, ease: "expo.inOut", onUpdate: () => setSplit(o.v) });
    return () => intro.current?.kill();
  }, [rm]);

  const setFromPointer = (ev) => {
    const r = site.current.getBoundingClientRect();
    setSplit(Math.min(100, Math.max(0, ((ev.clientX - r.left) / r.width) * 100)));
  };
  const onDown = (ev) => {
    intro.current?.kill();
    drag.current = true;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    setFromPointer(ev);
  };
  const onMove = (ev) => drag.current && setFromPointer(ev);
  const onUp = () => {
    if (drag.current) play("tick");
    drag.current = false;
  };
  const onKey = (ev) => {
    const step = ev.shiftKey ? 20 : 5;
    const next = { ArrowLeft: split - step, ArrowRight: split + step, Home: 0, End: 100 }[ev.key];
    if (next === undefined) return;
    ev.preventDefault();
    intro.current?.kill();
    setSplit(Math.min(100, Math.max(0, Math.round(next))));
  };

  // Pebbles drift away from the pointer, a little.
  useEffect(() => {
    const el = stage.current;
    if (!el || rm || !fine) return;
    const pebbles = [...el.querySelectorAll("[data-pebble]")].map((n, i) => ({
      x: gsap.quickTo(n, "x", { duration: 1.2, ease: "power3.out" }),
      y: gsap.quickTo(n, "y", { duration: 1.2, ease: "power3.out" }),
      k: [18, -26, 14][i] ?? 12,
    }));
    const move = (ev) => {
      const r = el.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;
      const py = (ev.clientY - r.top) / r.height - 0.5;
      pebbles.forEach((p) => (p.x(px * p.k), p.y(py * p.k)));
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, [rm, fine]);

  const pick = (fn) => (v) => {
    fn(v);
    play("tick");
  };

  return (
    <div ref={stage} className="relative">
      <Pebbles />
      <div ref={tilt} className="clay-lg relative overflow-hidden p-3 [transform-style:preserve-3d] sm:p-4">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-2 pb-3 pt-1">
          <span aria-hidden="true" className="flex gap-1.5">
            {["coral", "lemon", "mint"].map((t) => (
              <span key={t} className="clay-pastel h-3 w-3 rounded-full" style={{ background: `var(--${t})` }} />
            ))}
          </span>
          <span className="well flex min-w-0 flex-1 items-center gap-2 rounded-full px-3 py-1 font-mono text-[11.5px] text-muted">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <span className="truncate">{e.url}</span>
          </span>
          <span className="label hidden text-[10.5px] sm:block">Live preview</span>
        </div>

        {/* Stage: the frame resizes, the mini-site reflows with container queries */}
        <div className="dot-grid well relative flex h-[330px] justify-center overflow-hidden rounded-[22px] p-3 sm:h-[380px] lg:h-[400px]">
          <div
            ref={site}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="relative h-full min-w-[190px] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-[16px] shadow-[0_18px_40px_-20px_rgb(30_20_50/0.45)] @container transition-[width] duration-700 ease-[var(--ease-spring)]"
            style={{ width: dev[2] }}
          >
            <div role="img" aria-label={`Example website for a ${e.kind.toLowerCase()}, shown at ${device} width. Left of the divider is its wireframe, right is the finished site.`} className="h-full">
              <MiniSite e={e} accent={accent} dark={dark} />
              <div aria-hidden="true" className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
                <MiniSite key={ex} e={e} accent={accent} dark={dark} bp />
                <Marks n={ex + 1} px={dev[3]} />
              </div>
            </div>

            {/* Divider: drag anywhere on the frame, or focus it and use the arrow keys */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-[2px] -translate-x-1/2 bg-[#e61919]" style={{ left: `${split}%` }} />
            <span
                role="slider"
                tabIndex={0}
                aria-label="Wireframe to finished site"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(split)}
                aria-valuetext={`${Math.round(split)}% wireframe`}
                onKeyDown={onKey}
                className="absolute top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center bg-[#111] font-mono text-[11px] text-[#f4f4f0]"
                style={{ left: `clamp(16px, ${split}%, calc(100% - 16px))` }}
              >
                <span aria-hidden="true">◂▸</span>
              </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-1 pb-1 pt-4">
          <Segmented value={device} onChange={pick(setDevice)} />
          <div className="flex items-center gap-2" role="group" aria-label="Accent colour">
            {accents.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => pick(setAccent)(a)}
                aria-pressed={accent === a}
                aria-label={a}
                className={`clay-pastel h-6 w-6 rounded-full transition-transform duration-300 ease-[var(--ease-spring)] hover:scale-110 ${accent === a ? "scale-110 ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""}`}
                style={{ background: `var(--${a})` }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => pick(setDark)(!dark)} aria-pressed={dark} className="btn btn-secondary min-h-9 px-3.5 text-[13px]">
              {dark ? "Dark" : "Light"}
            </button>
            <button type="button" onClick={() => pick(setEx)((ex + 1) % examples.length)} className="btn btn-secondary min-h-9 px-3.5 text-[13px]" aria-label={`Show next example. Now: ${e.kind}`}>
              {e.kind} <span aria-hidden="true">↻</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Segmented({ value, onChange }) {
  const i = devices.findIndex((d) => d[0] === value);
  return (
    <div role="group" aria-label="Preview width" className="well relative grid grid-cols-3 rounded-full p-1">
      <span
        aria-hidden="true"
        className="absolute bottom-1 left-1 top-1 w-[calc((100%-8px)/3)] rounded-full bg-surface shadow-[var(--clay)] transition-transform duration-500 ease-[var(--ease-spring)]"
        style={{ transform: `translateX(${i * 100}%)` }}
      />
      {devices.map(([id, label]) => (
        <button key={id} type="button" onClick={() => onChange(id)} aria-pressed={value === id} className={`relative z-10 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${value === id ? "text-ink" : "text-muted hover:text-ink"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * The example website. Fixed palette per mode so it reads as someone else's site, not this one.
 * `bp` renders the same layout as its blueprint: identical boxes, no paint, outlined and tagged.
 */
function MiniSite({ e, accent, dark, bp = false }) {
  const c = bp
    ? { bg: "transparent", fg: "transparent", sub: "transparent", card: "transparent" }
    : dark
      ? { bg: "#1c1a22", fg: "#f2eff4", sub: "#a9a3b3", card: "#26232e" }
      : { bg: "#fdfcfb", fg: "#1b1820", sub: "#6b6573", card: "#f3f0f5" };
  const acc = bp ? "transparent" : `var(--${accent})`;
  const b = bp ? " bp-box" : "";
  const tag = (t) => bp && <Tag t={t} />;
  return (
    <div aria-hidden="true" className={`h-full overflow-hidden transition-colors duration-500${bp ? " bp-paper" : ""}`} style={{ background: bp ? undefined : c.bg, color: c.fg }}>
      <div className="flex items-center justify-between px-4 py-3 @md:px-6">
        <span data-m className={`flex items-center gap-2 text-[12px] font-bold${b}`}>
          {tag("Logo")}
          <span className={`h-4 w-4 rounded-[6px] transition-colors duration-500${b}`} style={{ background: acc }} />
          {e.brand}
        </span>
        <span data-m className={`hidden gap-4 text-[11px] @md:flex${b}`} style={{ color: c.sub }}>
          {tag(`Nav × ${e.items.length}`)}
          {e.items.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </span>
        <span data-m className={`grid gap-[3px] @md:hidden${b}`} style={{ color: c.fg }}>
          <span className="block h-[2px] w-3.5 rounded bg-current" />
          <span className="block h-[2px] w-3.5 rounded bg-current" />
        </span>
      </div>

      <div className="grid gap-4 px-4 pb-4 pt-2 @md:grid-cols-[1.15fr_1fr] @md:items-center @md:gap-6 @md:px-6 @md:pt-4">
        <div className="min-w-0">
          <p data-m className={`font-mono text-[9.5px] uppercase tracking-[0.12em]${b}`} style={{ color: c.sub }}>
            {e.kind}
          </p>
          <p data-m className={`mt-2 font-display text-[19px] font-bold leading-[1.05] tracking-[-0.03em] @md:text-[24px] @lg:text-[28px]${b}`}>
            {tag("H1 / Display")}
            {e.title}
          </p>
          <p data-m className={`mt-2 text-[11.5px] leading-snug @md:text-[12.5px]${b}`} style={{ color: c.sub }}>
            {tag("P / Body")}
            {e.line}
          </p>
          <div data-m className="mt-3 flex gap-2">
            <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors duration-500${bp ? b : " text-[#18151d]"}`} style={{ background: acc }}>
              {tag("CTA")}
              {e.cta}
            </span>
            <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold${b}`} style={{ background: c.card }}>
              Learn more
            </span>
          </div>
        </div>
        <div
          data-m
          className={`relative aspect-[4/3] overflow-hidden rounded-[12px] transition-colors duration-500 @md:aspect-[4/5]${b}`}
          style={{ background: bp ? "repeating-linear-gradient(45deg, rgb(17 17 17 / 0.1) 0 1px, transparent 1px 8px)" : `color-mix(in oklab, var(--${accent}) 55%, ${c.bg})` }}
        >
          {bp ? (
            <>
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 0L100 100M100 0L0 100" stroke="#111" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
              </svg>
              {tag("IMG / 4:5")}
            </>
          ) : (
            <>
              <span className="absolute left-[12%] top-[14%] aspect-square w-[38%] rounded-full bg-white/45" />
              <span className="absolute bottom-[12%] right-[10%] aspect-[1.1] w-[46%] rounded-[46%_54%_52%_48%/52%_44%_56%_48%] bg-black/10" />
              <span className="absolute bottom-[18%] left-[10%] h-[9%] w-[40%] rounded-full bg-white/60" />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 @md:px-6">
        {e.items.map((t, i) => (
          <span key={t} data-m className={`rounded-[10px] px-2.5 py-2 text-[10.5px] font-semibold${b}`} style={{ background: c.card }}>
            {tag(`Card 0${i + 1}`)}
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A red spec tag whose label resolves out of noise, like a plotter catching up. */
function Tag({ t }) {
  return (
    <span className="bp-tag">
      <Scramble text={t} />
    </span>
  );
}

const NOISE = "#/\\<>[]_+01";
function Scramble({ text }) {
  const ref = useRef(null);
  const rm = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || rm) return;
    let f = 0;
    const id = setInterval(() => {
      f++;
      el.textContent = [...text].map((ch, i) => (ch === " " || f > i * 2 + 8 ? ch : NOISE[(Math.random() * NOISE.length) | 0])).join("");
      if (f > text.length * 2 + 8) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [text, rm]);
  return <span ref={ref}>{text}</span>;
}

/** Drawing furniture on the blueprint layer: corner crosshairs, figure label, width dimension. */
function Marks({ n, px }) {
  const cross = "absolute font-mono text-[11px] leading-none text-[#111]";
  return (
    <div className="pointer-events-none absolute inset-0 font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#111]">
      <span className={`${cross} left-1 top-1`}>+</span>
      <span className={`${cross} right-1 top-1`}>+</span>
      <span className={`${cross} bottom-1 left-1`}>+</span>
      <span className={`${cross} bottom-1 right-1`}>+</span>
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
        <span className="bg-[#f4f4f0] px-1 font-semibold">
          <Scramble text={`Fig.0${n}`} />
        </span>
        <span className="relative h-px flex-1 bg-[#e61919]">
          <span className="absolute -top-[3px] left-0 h-[7px] w-px bg-[#e61919]" />
          <span className="absolute -top-[3px] right-0 h-[7px] w-px bg-[#e61919]" />
        </span>
        <span className="bg-[#f4f4f0] px-1 font-semibold text-[#e61919]">
          <Scramble text={`${px} px`} />
        </span>
      </div>
    </div>
  );
}

/** Three clay pebbles that sit just outside the card and drift with the pointer. */
function Pebbles() {
  return (
    <>
      <span data-pebble aria-hidden="true" className="clay-pastel absolute -left-5 top-16 z-10 hidden aspect-[1.15] w-14 rounded-[46%_54%_52%_48%/52%_44%_56%_48%] bg-lemon sm:block" />
      <span data-pebble aria-hidden="true" className="clay-pastel absolute -right-4 -top-5 z-10 hidden h-11 w-11 rounded-full bg-bubblegum sm:block" />
      <span data-pebble aria-hidden="true" className="clay-pastel absolute -bottom-4 right-16 z-10 hidden h-7 w-20 rounded-full bg-mint sm:block" />
    </>
  );
}
