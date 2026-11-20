import { experience, real } from "../content/site";
import { Words } from "./Words";
import { useEffect, useRef } from "react";
import { useReveal } from "../lib/hooks";
import { gsap, ScrollTrigger } from "../lib/motion";

export default function Experience() {
  const ref = useReveal();
  const list = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 640px) and (prefers-reduced-motion: no-preference)", () => {
      const ol = list.current;
      // The fill's tip sits on the 60% line of the viewport, so a node lights exactly as the tip passes it.
      gsap.to(ol.querySelector("[data-rail]"), {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: ol.querySelector("[data-rail]").parentElement, start: "top 60%", end: "bottom 60%", scrub: true },
      });
      ol.querySelectorAll("[data-node]").forEach((n) =>
        ScrollTrigger.create({ trigger: n, start: "center 60%", toggleClass: { targets: n, className: "is-on" } }),
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="experience" ref={ref} aria-labelledby="exp-title" className="section pt-0">
      <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
        <div className="head mb-0 content-start lg:sticky lg:top-28 lg:self-start">
          <p className="label">Experience</p>
          <h2 id="exp-title" data-split>
            <Words>
              Where I've worked and <span className="accent">studied.</span>
            </Words>
          </h2>
          <button type="button" onClick={() => dispatchEvent(new Event("open-resume"))} className="link w-fit text-[15px] font-medium" aria-haspopup="dialog">
            Full résumé →
          </button>
        </div>

        <ol ref={list} className="relative grid gap-5 sm:pl-10">
          {/* Timeline rail: fills as you read down, and each role's node lights when the fill reaches it. */}
          <span aria-hidden="true" className="absolute bottom-10 left-3 top-10 hidden w-[3px] rounded-full bg-line sm:block">
            <span data-rail className="block h-full w-full origin-top scale-y-0 rounded-full bg-red" />
          </span>
          {experience.map((x) => {
            const dates = real(x.dates);
            const org = real(x.org);
            const details = x.details.filter(real);
            return (
              <li key={x.title} data-reveal="pop" className="clay relative grid gap-3 p-6 sm:p-7">
                <span data-node aria-hidden="true" className="exp-node absolute -left-[34.5px] top-9 hidden h-4 w-4 rounded-full sm:block" style={{ "--tone": `var(--${x.tone})` }} />
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-[length:var(--text-3)] font-bold leading-tight tracking-[-0.02em]">{x.title}</h3>
                  {dates && <span className="font-mono text-[13px] text-muted tabular-nums">{dates}</span>}
                </div>
                {org && (
                  <p className="flex items-center gap-2 text-[15px] font-medium text-ink">
                    <span aria-hidden="true" className="clay-pastel h-3 w-3 rounded-full" style={{ background: `var(--${x.tone})` }} />
                    {org}
                  </p>
                )}
                <p className="max-w-[60ch] text-[15.5px]">{x.summary}</p>
                {details.length > 0 && (
                  <ul className="grid gap-1.5 text-[15px]">
                    {details.map((d) => (
                      <li key={d} className="flex gap-3">
                        <span aria-hidden="true" className="mt-[0.7em] h-1 w-3 shrink-0 rounded-full bg-line" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
