import { useEffect, useRef, useState } from "react";
import { Words } from "./Words";
import { projects } from "../content/projects";
import { real } from "../content/site";
import { getLenis, gsap } from "../lib/motion";
import { play } from "../lib/sound";
import CaseStudy from "./CaseStudy";
import Cover from "./Cover";

const TOP = 92; // sticky offset below the nav (md+ only)
const STEP = 22; // each card peeks this much below the one before

function Card({ p, i, onOpen }) {
  const meta = p.meta.filter(([, v]) => real(v)).slice(0, 3);
  return (
    <li data-stack className="md:sticky" style={{ top: TOP + i * STEP }}>
      <article data-card className="clay-lg relative isolate origin-top p-4 sm:p-6 lg:p-8">
        {/* Fades the card toward the page colour as the next one covers it. Opacity only, so it stays on the compositor. */}
        <span data-shade aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-bg opacity-0" />
        <div data-reveal className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 px-1">
          <div className="min-w-0 max-w-[40rem]">
            <p className="label flex flex-wrap gap-x-2">
              <span className="text-ink">{String(i + 1).padStart(2, "0")}</span>
              <span aria-hidden="true">·</span>
              <span>{p.kind}</span>
              <span aria-hidden="true">·</span>
              <span>{p.status}</span>
            </p>
            <h3 className="mt-3 text-[length:var(--text-4)] font-bold leading-[1.02] tracking-[-0.035em] [font-variation-settings:'opsz'_96,'wdth'_84]">{p.title}</h3>
            <p className="mt-3 text-[15.5px]">{p.blurb}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" onClick={(e) => onOpen(p.slug, e.currentTarget)} className="btn btn-secondary min-h-11 px-5 text-[15px]">
              Case study
            </button>
            {p.href && (
              <a href={p.href} target="_blank" rel="noreferrer" className="btn btn-secondary min-h-11 px-5 text-[15px]">
                Live site ↗
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <button type="button" data-cover data-reveal="clip" onClick={(e) => onOpen(p.slug, e.currentTarget)} className="group relative block rounded-[22px] text-left [&:hover_[data-shape]]:-translate-y-2 [&:hover_[data-shape]]:rotate-[-5deg]" aria-label={`Open case study: ${p.title}`}>
            <Cover project={p} index={i} />
            {/* Follows the cursor over the cover (fine pointers only); the button's label carries the meaning. */}
            <span data-follow aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 z-10 flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 font-display text-[14px] font-semibold text-bg shadow-[var(--clay)]">
              Open case study
              <span className="grid h-5 w-5 place-items-center rounded-full bg-red text-[11px] text-on-red">→</span>
            </span>
          </button>
          <div data-reveal="right" className="grid content-start gap-4">
            <div className="well p-5">
              <p className="label">Stack</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <li key={t} className="chip bg-surface shadow-[var(--clay)]">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            {meta.length > 0 && (
              <dl className="well grid gap-3 p-5 text-[14.5px]">
                {meta.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[80px_1fr] gap-3">
                    <dt className="label pt-0.5">{k}</dt>
                    <dd className="text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

export default function Work() {
  const list = useRef(null);
  // Deep link: #case-<slug> opens straight into a case study.
  const [open, setOpen] = useState(() => {
    const m = location.hash.match(/^#case-(.+)$/);
    return m && projects.some((p) => p.slug === m[1]) ? m[1] : null;
  });
  const opener = useRef(null);

  const onOpen = (slug, el) => {
    opener.current = el ?? document.activeElement;
    play("tick");
    setOpen(slug);
    history.replaceState(null, "", `#case-${slug}`);
  };

  // ⌘K palette opens case studies through a window event.
  useEffect(() => {
    const on = (e) => onOpen(e.detail);
    addEventListener("open-case", on);
    return () => removeEventListener("open-case", on);
  }, []);

  // As the next card slides over, the one underneath tips back and fades into the page.
  // Transform + opacity only: animating `filter` on a card this size re-rasters it every
  // frame and flashed black in Chrome when the tween kicked in.
  useEffect(() => {
    if (!list.current) return;
    const mm = gsap.matchMedia();
    // Phones: cards are taller than the screen, so they stay a plain list.
    mm.add({ desktop: "(min-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
      if (!conditions.desktop) return;
      const items = gsap.utils.toArray("[data-stack]", list.current);
      items.slice(0, -1).forEach((li, i) => {
        const card = li.querySelector("[data-card]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: items[i + 1], start: "top bottom", end: `top ${TOP + (i + 1) * STEP}px`, scrub: 0.4 },
        });
        tl.to(li.querySelector("[data-shade]"), { opacity: 0.55, ease: "none" }, 0);
        // Reduced motion keeps the fade (it still shows depth) and drops the movement.
        if (!conditions.reduce) {
          gsap.set(card, { transformPerspective: 1600, willChange: "transform" });
          tl.to(card, { scale: 0.93, rotationX: -5, ease: "none" }, 0);
        }
      });
    });
    // A label rides the cursor over each cover, trailing a little so it feels carried, not glued.
    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      const offs = gsap.utils.toArray("[data-cover]", list.current).map((btn) => {
        const tag = btn.querySelector("[data-follow]");
        gsap.set(tag, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 });
        const xTo = gsap.quickTo(tag, "x", { duration: 0.45, ease: "power3.out" });
        const yTo = gsap.quickTo(tag, "y", { duration: 0.45, ease: "power3.out" });
        const at = (e, jump) => {
          const r = btn.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          if (jump) gsap.set(tag, { x, y });
          else (xTo(x), yTo(y));
        };
        const enter = (e) => {
          at(e, true);
          gsap.to(tag, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)", overwrite: "auto" });
        };
        const move = (e) => at(e);
        const leave = () => gsap.to(tag, { autoAlpha: 0, scale: 0.6, duration: 0.2, ease: "power2.out", overwrite: "auto" });
        btn.addEventListener("pointerenter", enter);
        btn.addEventListener("pointermove", move);
        btn.addEventListener("pointerleave", leave);
        return () => {
          btn.removeEventListener("pointerenter", enter);
          btn.removeEventListener("pointermove", move);
          btn.removeEventListener("pointerleave", leave);
        };
      });
      return () => offs.forEach((f) => f());
    });
    return () => mm.revert();
  }, []);

  // Keyboard: Shift+Tab can land on a card that's hidden under the next stuck one.
  // The browser won't scroll it into view (sticky makes it look on-screen), so do it here.
  const revealFocused = (e) => {
    if (!matchMedia("(min-width: 768px)").matches) return;
    const items = [...list.current.children];
    const i = items.findIndex((li) => li.contains(e.target));
    const next = items[i + 1];
    if (i < 0 || !next || next.getBoundingClientRect().top >= e.target.getBoundingClientRect().bottom) return;
    const gap = parseFloat(getComputedStyle(list.current).rowGap) || 0;
    let y = list.current.getBoundingClientRect().top + scrollY - (TOP + i * STEP);
    for (let k = 0; k < i; k++) y += items[k].offsetHeight + gap;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else scrollTo(0, y);
  };

  const close = () => {
    setOpen(null);
    history.replaceState(null, "", "#work");
    opener.current?.focus?.({ preventScroll: true });
  };

  return (
    <section id="work" aria-labelledby="work-title" className="section">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div className="head mb-0">
            <p className="label">Selected work</p>
            <h2 id="work-title" data-split>
              <Words>
                {String(projects.length).padStart(2, "0")} featured <span className="accent">builds</span>
              </Words>
            </h2>
          </div>
          <p data-lines className="max-w-[26rem] pb-1 text-[15.5px]">Client sites in production first, then the projects I built to learn. Open any card for the case study.</p>
        </div>

        <ul ref={list} onFocus={revealFocused} className="mt-14 grid gap-8 pb-8">
          {projects.map((p, i) => (
            <Card key={p.slug} p={p} i={i} onOpen={onOpen} />
          ))}
        </ul>
      </div>
      <CaseStudy slug={open} onClose={close} onNavigate={(s) => onOpen(s, opener.current)} />
    </section>
  );
}
