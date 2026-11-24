import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ArrowUpRight, Plus } from "lucide-react";
import { useId, useState } from "react";
import { Link } from "react-router";
import { Bump } from "@/components/Bump";
import { FadeIn } from "@/components/FadeIn";
import { WordReveal } from "@/components/WordReveal";
import { services } from "@/content/site";

const ease = [0.22, 1, 0.36, 1] as const;

export function Lanes() {
  const [open, setOpen] = useState(0);
  const uid = useId();
  const reduce = useReducedMotion();

  return (
    <ol className="hair-t">
      {services.lanes.map((lane, i) => {
        const isOpen = open === i;
        const panel = `${uid}-${i}`;
        return (
          <FadeIn as="li" key={lane.slug} y={28} delay={0.06 * Math.min(i, 5)} className="hair-b">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? -1 : i)}
                data-cursor-nohug
                className="group grid w-full grid-cols-[2.75rem_1fr_auto] items-center gap-4 py-[clamp(1.4rem,2.6vw,2rem)] text-left min-[900px]:grid-cols-[4.5rem_1fr_minmax(0,18rem)_auto] min-[900px]:gap-8"
              >
                <span className="num text-[var(--home-dim)]">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className={`text-[clamp(1.6rem,3.4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em] transition-[color,translate] duration-[400ms] ease-[var(--ease-house)] [@media(hover:hover)]:group-hover:translate-x-[.35rem] ${
                    isOpen ? "text-[var(--home-fg)]" : "text-[color-mix(in_srgb,var(--home-fg)_72%,transparent)] group-hover:text-[var(--home-fg)]"
                  }`}
                >
                  {lane.name}
                </span>
                <span className="hidden text-right text-sm text-[var(--home-dim)] min-[900px]:block">{lane.summary}</span>
                <span
                  aria-hidden="true"
                  className={`grid size-10 place-items-center rounded-full border transition-[transform,background-color,color,border-color] duration-[450ms] ease-[var(--ease-house)] ${
                    isOpen ? "rotate-45 border-[var(--home-fg)] bg-[var(--home-fg)] text-[var(--home-on-fg)]" : "border-[var(--home-line)] group-hover:border-[var(--home-fg)]"
                  }`}
                >
                  <Plus className="size-4" strokeWidth={1.75} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  id={panel}
                  role="region"
                  aria-label={lane.name}
                  className="overflow-hidden"
                  initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0.15 : 0.55, ease }}
                >
                  <div className="pb-8 pl-[calc(2.75rem+1rem)] min-[900px]:pl-[calc(4.5rem+2rem)]">
                    <p className="max-w-[46rem] text-[clamp(1.02rem,1.5vw,1.25rem)] leading-[1.6] text-[var(--home-muted)]">{lane.line}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {lane.tags.map((t) => (
                        <li key={t} className="tech-pill !text-[1.05rem] !px-3 !py-0.5">
                          {t}
                        </li>
                      ))}
                    </ul>
                    <Link to={`/services/${lane.slug}`} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.2em] uppercase">
                      <Bump text="Details" />
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                    </Link>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </FadeIn>
        );
      })}
    </ol>
  );
}

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="sheet sheet-b section-y relative z-[2]">
      <div className="shell">
        <FadeIn y={16} className="mb-10 flex items-center justify-between md:mb-14">
          <h2 id="services-title" className="eyebrow">
            {services.label}
          </h2>
          <span className="num text-[var(--home-dim)]">{String(services.lanes.length).padStart(2, "0")} lanes</span>
        </FadeIn>
        <WordReveal
          tokens={[services.intro]}
          className="mb-16 max-w-[46rem] text-[clamp(1.3rem,2.1vw,1.85rem)] leading-[1.38] font-medium tracking-[-0.015em] md:mb-24"
        />
        <Lanes />
        <p className="mt-10 text-[var(--home-dim)]">
          {services.foot}{" "}
          <Link to={services.footLink.href} className="underline-grow font-medium text-[var(--home-fg)]">
            {services.footLink.label}
          </Link>
        </p>
      </div>
    </section>
  );
}
