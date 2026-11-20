import { Fragment, useEffect, useRef } from "react";
import { icons } from "../content/icons";
import { site } from "../content/site";
import { gsap, prefersReducedMotion, scrollToId } from "../lib/motion";
import { useReveal } from "../lib/hooks";
import WantedPoster from "./WantedPoster";

// Strings split into words; objects become inline tech chips with their brand mark.
const C = (label, icon, tone, after = "") => ({ label, icon, tone, after });
const parts = [
  `I'm ${site.name}, a frontend developer in ${site.city}. I build the whole path: the`,
  C("React", "react", "periwinkle"),
  "interface styled with",
  C("Tailwind", "tailwindcss", "sky", ","),
  "the",
  C("Node.js", "nodedotjs", "mint"),
  "and",
  C("Express", "express", "bubblegum"),
  "API, and the",
  C("MongoDB", "mongodb", "lemon"),
  "data layer. I care about pages that load fast on a 4G phone and work with a keyboard.",
];

const facts = [
  ["Based in", `${site.city}, India`],
  ["Open to", site.openTo.join(", ")],
  ["Languages", "Tamil, English"],
  ["Education", "B.Sc. IT, 2025"],
];

function Chip({ c }) {
  return (
    <span data-word className="clay-pastel ml-[0.1em] inline-flex -translate-y-[0.08em] items-center gap-[0.3em] rounded-[0.45em] px-[0.35em] py-[0.04em] align-middle text-[0.8em] leading-[1.2]" style={{ background: `var(--${c.tone})` }}>
      <svg viewBox="0 0 24 24" className="h-[0.8em] w-[0.8em]" fill="currentColor" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons[c.icon] }} />
      {c.label}
    </span>
  );
}

export default function About() {
  const ref = useReveal();
  const para = useRef(null);
  const poster = useRef(null);

  // Words brighten as the paragraph scrolls through the viewport.
  useEffect(() => {
    if (prefersReducedMotion() || !para.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-word]",
        { "--o": 0.18 },
        { "--o": 1, ease: "none", stagger: 0.06, scrollTrigger: { trigger: para.current, start: "top 78%", end: "bottom 42%", scrub: 0.6 } },
      );
    }, para);
    return () => ctx.revert();
  }, []);

  // The poster is tossed onto the table the first time it comes into view: it drops in tilted,
  // lands, and wobbles flat. Runs on a wrapper so the poster's own drag/throw transforms stay free.
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const el = poster.current;
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 82%", once: true } })
        .from(el, { autoAlpha: 0, duration: 0.25, ease: "power1.out" }, 0)
        .from(el, { yPercent: -28, rotation: -16, scale: 1.12, duration: 0.55, ease: "power3.in" }, 0)
        .to(el, { scaleY: 0.94, scaleX: 1.04, duration: 0.08, ease: "power1.out", transformOrigin: "50% 100%" })
        .to(el, { scaleY: 1, scaleX: 1, duration: 0.9, ease: "elastic.out(1, 0.4)" });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="about" ref={ref} aria-labelledby="about-title" className="section overflow-hidden">
      <div className="wrap">
        <h2 id="about-title" className="label">
          About me
        </h2>
        <p ref={para} data-scrub className="mt-6 max-w-[62rem] font-display text-[clamp(1.6rem,1.05rem+2vw,2.75rem)] font-semibold leading-[1.22] tracking-[-0.025em] text-ink [font-variation-settings:'opsz'_72]">
          {parts.map((p, i) =>
            typeof p === "string" ? (
              <Fragment key={i}>
                {p.split(" ").map((w, j) =>
                  w ? (
                    <Fragment key={j}>
                      <span data-word>{w}</span>{" "}
                    </Fragment>
                  ) : null,
                )}
              </Fragment>
            ) : (
              <Fragment key={i}>
                <Chip c={p} />
                {p.after && <span data-word>{p.after}</span>}{" "}
              </Fragment>
            ),
          )}
        </p>

        <div className="mt-20 grid items-center gap-14 lg:grid-cols-[400px_1fr] lg:gap-20">
          <div ref={poster}>
            <WantedPoster />
          </div>
          <div className="grid min-w-0 gap-10">
            <div className="grid max-w-[56ch] gap-4 text-[1.0625rem]">
              <p data-lines>
                Since March 2026 I've been a web developer intern at Thulir Media, where I built the Thulir Media and Mother India City Shelters websites and redesigned the Medaac Study Abroad frontend.
              </p>
              <p data-lines>Before that I finished a B.Sc. in Information Technology and the MERN full-stack course at Apex Sys, where Musix started.</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {facts.map(([k, v]) => (
                <div key={k} data-reveal>
                  <dt className="label">{k}</dt>
                  <dd className="mt-1 text-[15px] font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div data-reveal className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-8">
              <p className="font-display text-xl font-semibold text-ink">Have a site that needs building?</p>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("contact");
                }}
                data-magnetic
                className="btn btn-primary"
              >
                Start a project
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
