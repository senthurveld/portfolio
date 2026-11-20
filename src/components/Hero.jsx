import { useEffect, useRef } from "react";
import { clients, site } from "../content/site";
import { gsap, prefersReducedMotion, scrollToId } from "../lib/motion";
import HeroStage from "./HeroStage";
import HeroTiles from "./HeroTiles";
import { Letters } from "./Words";

export default function Hero() {
  const root = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-line] > span", { yPercent: 110, rotate: 3, transformOrigin: "0% 100%", duration: 1.6, stagger: 0.12, ease: "expo.out", delay: 0.1 });
      gsap.from("[data-fade]", { y: 36, autoAlpha: 0, duration: 1.4, stagger: 0.1, ease: "expo.out", delay: 0.45 });
    }, root);
    return () => ctx.revert();
  }, []);

  const go = (id) => (e) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <section id="top" ref={root} aria-labelledby="hero-title" className="relative pb-16 pt-28 sm:pt-36">
      <div className="wrap">
        <p data-fade className="label flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-ink">{site.name}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
            </span>
            Available for work
          </span>
        </p>

        <h1 id="hero-title" className="mt-5 font-extrabold uppercase leading-[0.86] tracking-[-0.035em] text-ink [font-size:clamp(2.9rem,9.6vw,9.6rem)] [font-variation-settings:'opsz'_96,'wdth'_75]">
          <span className="sr-only">{site.name}, Frontend &amp; MERN developer</span>
          {/* Letters stretch toward the cursor along the font's width axis (lib/effects.js). */}
          <span aria-hidden="true" data-stretch="75" className="block w-fit">
            <span data-line className="block overflow-hidden whitespace-nowrap pb-[0.04em]">
              <span className="block">
                <Letters>Frontend &amp;</Letters>
              </span>
            </span>
            <span data-line className="block overflow-hidden whitespace-nowrap pb-[0.06em]">
              <span className="block">
                <Letters>MERN</Letters> <span className="accent text-red">developer</span>
              </span>
            </span>
          </span>
        </h1>

        <div className="mt-12 grid items-start gap-12 lg:mt-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-8 lg:pt-6">
            <p data-fade className="max-w-[30rem] text-[1.0625rem] sm:text-lg">
              I build fast, clear websites in React and MERN for small businesses and product teams, from the first layout to the deployed site.
            </p>
            <div data-fade className="flex flex-wrap items-center gap-3">
              <a href="#contact" onClick={go("contact")} data-magnetic className="btn btn-primary group h-14 px-7">
                Hire me
                <span aria-hidden="true" className="transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-1">
                  →
                </span>
              </a>
              <a href="#work" onClick={go("work")} className="btn btn-secondary h-14 px-7">
                See the work
              </a>
            </div>
            <div data-fade>
              <p className="label">Client sites</p>
              <ul className="mt-3 grid gap-2" aria-label="Client sites">
                {clients.map((c) => (
                  <li key={c.name} className="flex items-baseline justify-between gap-4 border-b border-line pb-2 text-[15px]">
                    <span className="font-display font-semibold text-ink">
                      {c.href ? (
                        <a href={c.href} target="_blank" rel="noreferrer" className="link">
                          {c.name}
                        </a>
                      ) : (
                        c.name
                      )}
                    </span>
                    <span className="text-[13.5px] text-muted">{c.kind}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div data-fade className="min-w-0">
            <HeroStage />
          </div>
        </div>

        <HeroTiles />
      </div>
    </section>
  );
}
