import { icons } from "../content/icons";
import { Words } from "./Words";
import { stack } from "../content/site";
import { useEffect, useRef } from "react";
import { useReveal } from "../lib/hooks";
import { gsap, ScrollTrigger } from "../lib/motion";

// stack id -> Simple Icons key (null = no brand mark; a neutral glyph is drawn instead)
const mark = { react: "react", js: "javascript", tailwind: "tailwindcss", node: "nodedotjs", mongodb: "mongodb", express: "express", vite: "vite", git: "git", rest: null, zustand: null, jwt: "jsonwebtokens", mysql: "mysql", postman: "postman", html: "html5", css: "css" };
const extra = [
  { id: "github", label: "GitHub", tone: "periwinkle" },
  { id: "npm", label: "npm", tone: "coral" },
  { id: "vercel", label: "Vercel", tone: "mint" },
];
const tools = [...stack.map((s) => ({ ...s, icon: mark[s.id] })), ...extra.map((e) => ({ ...e, icon: e.id }))];

const traits = ["Mobile-first", "Accessible by default", "Fast on 4G", "Keyboard-friendly", "Reusable components", "Clear handover", "Plain-English updates"];

export default function Skills() {
  const ref = useReveal();
  const grid = useRef(null);

  // Tiles drop in a row at a time, squash as they land, and wobble back: lumps of clay set on a table.
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tiles = gsap.utils.toArray("[data-tile]", grid.current);
      gsap.set(tiles, { autoAlpha: 0, transformOrigin: "50% 100%" });
      ScrollTrigger.batch(tiles, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          batch.forEach((el, i) =>
            gsap
              .timeline({ delay: i * 0.05 })
              .fromTo(el, { autoAlpha: 0, y: -44 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.in" })
              .to(el, { scaleY: 0.86, scaleX: 1.08, duration: 0.08, ease: "power1.out" })
              .to(el, { scaleY: 1, scaleX: 1, duration: 0.75, ease: "elastic.out(1, 0.35)" }),
          ),
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="skills" ref={ref} aria-labelledby="skills-title" className="section pt-0">
      <div className="wrap">
        <div className="head">
          <p className="label">Skillset</p>
          <h2 id="skills-title" data-split>
            <Words>
              The tools I reach <span className="accent">for.</span>
            </Words>
          </h2>
        </div>
        <ul ref={grid} className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {tools.map((t) => (
            <li key={t.id} data-tile className="group">
              <div className="clay flex aspect-[1.15] flex-col items-center justify-center gap-3 rounded-[22px] p-3 text-center transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-1.5">
                <span className="clay-pastel grid h-12 w-12 place-items-center rounded-[16px] transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-8 group-hover:scale-110" style={{ background: `var(--${t.tone})` }}>
                  {t.icon ? (
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons[t.icon] }} />
                  ) : (
                    <span aria-hidden="true" className="font-mono text-[13px] font-semibold">
                      {t.label.slice(0, 2)}
                    </span>
                  )}
                </span>
                <span className="text-[14px] font-medium text-ink">{t.label}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div aria-hidden="true" data-reveal="left" className="marquee mt-14 overflow-hidden border-y border-line py-5">
        <ul className="marquee-track" style={{ "--marquee-dur": "40s" }}>
          {[...traits, ...traits, ...traits, ...traits].map((t, i) => (
            <li key={i} className="flex shrink-0 items-center gap-6 pr-6 font-display text-[clamp(1.3rem,1rem+1.2vw,2rem)] font-bold tracking-[-0.02em] text-ink">
              {t}
              <span className="clay-pastel h-3 w-3 rounded-full" style={{ background: `var(--${["lemon", "mint", "bubblegum", "sky"][i % 4]})` }} />
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only">Working style: {traits.join(", ")}.</p>
    </section>
  );
}
