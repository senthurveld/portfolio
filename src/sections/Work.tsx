import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router";
import { Bump } from "@/components/Bump";
import { Frame } from "@/components/Frame";
import { Magnet } from "@/components/Magnet";
import { WordReveal } from "@/components/WordReveal";
import { shotsFor } from "@/content/shots";
import { projects, workIntro, type Project } from "@/content/site";
import { stackDim, stackScale } from "@/lib/logic";

const featured = projects.filter((p) => p.featured).slice(0, 5);

function Card({ p, i, n, progress, still }: { p: Project; i: number; n: number; progress: MotionValue<number>; still: boolean }) {
  const range = [i / n, 1];
  const scale = useTransform(progress, range, [1, stackScale(i, n)]);
  const dim = useTransform(progress, range, [0, stackDim(i, n)]);
  const s = shotsFor(p.slug);
  return (
    <m.article
      data-card
      data-cursor="View"
      aria-labelledby={`card-${p.slug}`}
      className="group sticky origin-top overflow-hidden rounded-[1.75rem] border border-[var(--home-line)] bg-[var(--home-a)] p-4 shadow-[0_24px_80px_#0000008c] sm:rounded-[2rem] sm:p-6 md:rounded-[2.5rem] md:p-7 lg:p-8 light:shadow-[0_18px_48px_#1c19151a]"
      style={{ top: `calc(var(--sticky-base) + ${i} * var(--step))`, zIndex: i + 1, scale: still ? 1 : scale }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_15%_0%,rgba(215,226,234,.06),transparent_55%)]" />
      <div className="relative grid gap-6 md:min-h-[min(68vh,40rem)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
        <div className="flex flex-col">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.24em] text-[var(--home-dim)] uppercase sm:text-xs">
            <span className="num tracking-normal">{p.n}</span>
            <span aria-hidden="true" className="h-px w-6 bg-[var(--home-line)]" />
            {p.category}
          </p>
          <h3 id={`card-${p.slug}`} className="mt-4 text-[clamp(1.6rem,min(3.8vw,5.5vh),3.25rem)] leading-[1.02] font-semibold tracking-[-0.03em]">
            <Link to={`/projects/${p.slug}`} className="after:absolute after:inset-0">
              {p.title}
            </Link>
          </h3>
          <p className="mt-4 line-clamp-3 text-sm text-[var(--home-muted)] sm:text-base md:line-clamp-none md:text-lg">{p.pitch}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <li key={s} className="tech-pill !text-xs !px-2.5 !py-0.5">
                {s}
              </li>
            ))}
          </ul>
          {(p.href ?? p.repo) && (
            <a href={p.href ?? p.repo ?? undefined} target="_blank" rel="noreferrer" className="relative z-10 mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-semibold tracking-[0.2em] uppercase">
              {p.href ? "Live site" : "GitHub"} <ArrowUpRight className="size-4" />
            </a>
          )}
        </div>
        <div className="grid grid-cols-[3fr_2fr] grid-rows-2 gap-3 max-md:[&>*:not(:first-child)]:hidden max-md:grid-cols-1 max-md:grid-rows-1">
          <Frame
            shot={s.cover}
            sizes="calc(100vw - 4rem)"
            art={s.tall && { media: "(min-width: 768px)", shot: s.tall, sizes: "(min-width: 1440px) 430px, 30vw" }}
            alt={`${p.title} screenshot`}
            className="row-span-2 max-md:h-[26dvh]"
            label={p.title}
          />
          <Frame shot={s.details?.[0]} sizes="(min-width: 1440px) 290px, 20vw" alt={`${p.title} detail`} />
          <Frame shot={s.details?.[1]} sizes="(min-width: 1440px) 290px, 20vw" alt={`${p.title} detail`} />
        </div>
      </div>
      <m.span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: still ? 0 : dim }} />
    </m.article>
  );
}

export function Work() {
  const stack = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: stack, offset: ["start start", "end end"] });
  const headScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.9]);
  const headY = useTransform(scrollYProgress, [0.35, 0.95], [0, -28]);
  const headOpacity = useTransform(scrollYProgress, [0.35, 0.95], [1, 0]);
  const { scrollYProgress: approach } = useScroll({ target: stack, offset: ["start 0.58", "start 0.28"] });
  const introOpacity = useTransform(approach, [0, 1], [1, 0]);
  const introY = useTransform(approach, [0, 1], [0, -18]);

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="sheet relative z-10 pt-16 pb-24 [--step:12px] [--sticky-base:4rem] sm:pt-20 sm:pb-28 sm:[--step:22px] sm:[--sticky-base:5.5rem] md:pt-28 md:pb-32 md:[--sticky-base:7rem]"
    >
      <div className="shell">
        <m.div className="sticky top-6 z-0 origin-top sm:top-12" style={reduce ? undefined : { scale: headScale, y: headY, opacity: headOpacity }}>
          <div className="mb-8 flex items-center justify-between">
            <h2 id="work-title" className="eyebrow">
              {workIntro.label}
            </h2>
            <span className="num text-[var(--home-dim)]">{String(featured.length).padStart(2, "0")} featured builds</span>
          </div>
          <m.div style={reduce ? undefined : { opacity: introOpacity, y: introY }}>
            <WordReveal tokens={[workIntro.intro]} offset={["start 0.9", "end 0.7"]} className="max-w-[46rem] text-[clamp(1.3rem,2.1vw,1.85rem)] leading-[1.38] font-medium tracking-[-0.015em]" />
          </m.div>
        </m.div>
        <div ref={stack} className="relative mt-12 flex flex-col gap-6 md:mt-16">
          {featured.map((p, i) => (
            <Card key={p.slug} p={p} i={i} n={featured.length} progress={scrollYProgress} still={reduce} />
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <Magnet padding={50} strength={4}>
            <Link
              to="/projects"
              className="group inline-flex items-center gap-[0.6rem] rounded-full border border-[var(--home-line)] px-7 py-3.5 text-sm font-semibold tracking-[0.2em] uppercase transition-[gap,background-color,color] duration-[350ms] hover:gap-[0.9rem] hover:bg-[var(--home-fg)] hover:text-[var(--home-on-fg)]"
            >
              <Bump text={workIntro.allLink} />
              <ArrowUpRight className="size-4 transition-transform duration-[350ms] group-hover:rotate-45" />
            </Link>
          </Magnet>
        </div>
      </div>
    </section>
  );
}
