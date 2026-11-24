import { ArrowUpRight, ChevronDown, Layers, Search, X } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Picture } from "@/components/Frame";
import { shotsFor } from "@/content/shots";
import { projects, site, type Project } from "@/content/site";
import { cn, real } from "@/lib/logic";

const ease = [0.22, 1, 0.36, 1] as const;
const ANY = "";

const uniq = (xs: string[]) => [...new Set(xs)];
const categories = uniq(projects.map((p) => p.category));
const stacks = uniq(projects.flatMap((p) => p.stack)).sort((a, b) => a.localeCompare(b));

const matches = (p: Project, q: string) =>
  !q || [p.title, p.pitch, p.category, ...p.stack].some((s) => s.toLowerCase().includes(q));

export default function Projects() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [stack, setStack] = useState(ANY);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `Projects — ${site.name}`;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable=true]")) return;
      e.preventDefault();
      search.current?.focus();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const base = useMemo(() => projects.filter((p) => matches(p, q) && (!stack || p.stack.includes(stack))), [q, stack]);
  const shown = cat === "All" ? base : base.filter((p) => p.category === cat);
  const count = (c: string) => (c === "All" ? base.length : base.filter((p) => p.category === c).length);
  const filtered = q !== "" || cat !== "All" || stack !== ANY;
  const reset = () => {
    setQuery("");
    setCat("All");
    setStack(ANY);
  };

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24, filter: "blur(6px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 1.1, delay, ease },
        };

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <header className="relative pt-36 pb-10 sm:pt-40 md:pb-12">
        <div aria-hidden="true" className="page-glow" />
        <div className="shell relative">
          <m.nav aria-label="Breadcrumb" {...rise(0)}>
            <ol className="kicker flex items-center gap-3 text-[var(--home-dim)]">
              {[{ label: "Home", href: "/" }, { label: "Projects" }].map((c, i) => (
                <Fragment key={c.label}>
                  {i > 0 && <li aria-hidden="true" className="opacity-50">/</li>}
                  <li>
                    {c.href ? (
                      <Link to={c.href} className="underline-grow hover:text-[var(--home-fg)]">{c.label}</Link>
                    ) : (
                      <span aria-current="page" className="text-[var(--home-fg)]">{c.label}</span>
                    )}
                  </li>
                </Fragment>
              ))}
            </ol>
          </m.nav>

          <div className="mt-7 flex flex-wrap items-end gap-x-6 gap-y-3">
            <h1 className="overflow-hidden pb-[0.06em] text-[clamp(3.4rem,11vw,9rem)] leading-[0.86] font-bold tracking-[-0.04em] uppercase">
              <m.span
                className="chrome inline-block"
                initial={reduce ? false : { y: "105%", filter: "blur(6px)" }}
                animate={{ y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.4, delay: 0.08, ease }}
              >
                Projects
              </m.span>
            </h1>
            <m.p {...rise(0.35)} className="num mb-[0.9em] text-[var(--home-dim)] uppercase">
              <span className="text-[var(--home-fg)]">{projects.length}</span> shipped
            </m.p>
          </div>

          <m.p {...rise(0.25)} className="mt-6 max-w-[40ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.55] text-[var(--home-muted)]">
            Client sites, full-stack builds and side projects. Filter by type or stack, or open a case study.
          </m.p>

          <m.div {...rise(0.4)} className="mt-10">
            <label className="group/search flex h-14 items-center gap-3 rounded-full border border-[var(--home-line)] bg-[color-mix(in_srgb,var(--home-card)_45%,transparent)] px-5 transition-[border-color,background-color] duration-300 focus-within:border-[var(--home-dim)] hover:border-[color-mix(in_srgb,var(--home-fg)_35%,transparent)]">
              <Search aria-hidden="true" className="size-[1.1rem] shrink-0 text-[var(--home-dim)]" strokeWidth={1.75} />
              <span className="sr-only">Search projects</span>
              <input
                ref={search}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && (setQuery(""), e.currentTarget.blur())}
                placeholder="Search projects or tech, like React"
                className="h-full min-w-0 flex-1 bg-transparent text-base text-[var(--home-fg)] outline-none placeholder:text-[var(--home-dim)] [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-7 place-items-center rounded-full text-[var(--home-dim)] transition-colors hover:bg-[var(--home-faint)] hover:text-[var(--home-fg)]">
                  <X className="size-4" strokeWidth={1.75} />
                </button>
              ) : (
                <kbd aria-hidden="true" className="num hidden h-7 min-w-7 place-items-center rounded-md border border-[var(--home-line)] px-2 text-[0.72rem] text-[var(--home-dim)] sm:grid">/</kbd>
              )}
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
                {["All", ...categories].map((c) => {
                  const on = cat === c;
                  const n = count(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setCat(c)}
                      disabled={!on && n === 0}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[0.92rem] font-semibold transition-[background-color,border-color,color,opacity] duration-300 disabled:cursor-not-allowed disabled:opacity-35",
                        on
                          ? "border-[var(--home-fg)] bg-[var(--home-fg)] text-[var(--home-on-fg)]"
                          : "border-[var(--home-line)] text-[var(--home-muted)] enabled:hover:border-[color-mix(in_srgb,var(--home-fg)_45%,transparent)] enabled:hover:text-[var(--home-fg)]",
                      )}
                    >
                      {c}
                      <span className={cn("num text-[0.7rem] tabular-nums", on ? "opacity-60" : "opacity-55")}>{n}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-5">
                <label className="relative inline-flex h-10 items-center rounded-full border border-[var(--home-line)] transition-colors duration-300 focus-within:border-[var(--home-dim)] hover:border-[color-mix(in_srgb,var(--home-fg)_45%,transparent)]">
                  <span className="sr-only">Filter by stack</span>
                  <Layers aria-hidden="true" className="pointer-events-none absolute left-4 size-4 text-[var(--home-muted)]" strokeWidth={1.75} />
                  <select
                    value={stack}
                    onChange={(e) => setStack(e.target.value)}
                    className="h-full cursor-pointer appearance-none rounded-full bg-transparent pr-10 pl-11 text-[0.92rem] font-semibold text-[var(--home-fg)] outline-none [&>option]:bg-[var(--home-a)]"
                  >
                    <option value={ANY}>Any stack</option>
                    {stacks.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 size-4 text-[var(--home-muted)]" strokeWidth={1.75} />
                </label>
                <p aria-live="polite" className="text-sm font-medium whitespace-nowrap text-[var(--home-dim)] tabular-nums">
                  {shown.length} {shown.length === 1 ? "project" : "projects"}
                </p>
              </div>
            </div>
          </m.div>
        </div>
      </header>

      <section aria-label="Project list" className="shell pb-[var(--section-y)]">
        {shown.length ? (
          <ul key={`${q}|${cat}|${stack}`} className="grid gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-16 md:grid-cols-2 md:pb-36 md:[&>li:nth-child(even)]:translate-y-36">
            {shown.map((p, i) => (
              <Card key={p.slug} p={p} i={i} reduce={!!reduce} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-5 rounded-2xl border border-dashed border-[var(--home-line)] px-8 py-16">
            <p className="text-[clamp(1.4rem,2.6vw,2rem)] font-semibold tracking-[-0.03em]">Nothing matches that yet.</p>
            <p className="max-w-[48ch] text-[var(--home-muted)]">
              No project fits {q ? <>“{query.trim()}”</> : "these filters"}. Try a broader word, or clear the filters to see all {projects.length}.
            </p>
            {filtered && (
              <button type="button" onClick={reset} className="underline-grow font-semibold">Clear filters</button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function Card({ p, i, reduce }: { p: Project; i: number; reduce: boolean }) {
  const href = `/projects/${p.slug}`;
  const meta = [p.category, real(p.year)].filter(Boolean).join(" · ");
  return (
    <m.li
      initial={reduce ? false : { opacity: 0, y: 48, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.2, delay: (i % 2) * 0.12, ease }}
    >
      <article className="group relative">
        <Link to={href} data-cursor="View" tabIndex={-1} aria-hidden="true" className="block">
          <Cover p={p} />
        </Link>
        <div className="mt-6 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="kicker text-[var(--home-dim)]">{meta}</p>
            <h2 className="mt-2 text-[clamp(1.6rem,2.8vw,2.4rem)] leading-[1.05] font-bold tracking-[-0.03em] uppercase">
              <Link to={href} className="relative inline-block pb-1 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-[var(--ease-house)] group-hover:after:scale-x-100 focus-visible:after:scale-x-100">
                {p.title}
              </Link>
            </h2>
            <p className="mt-3 line-clamp-2 max-w-[54ch] leading-[1.6] text-[var(--home-muted)]">{p.pitch}</p>
          </div>
          <Link
            to={href}
            tabIndex={-1}
            aria-hidden="true"
            className="mt-1 grid size-12 shrink-0 place-items-center rounded-full border border-[var(--home-line)] text-[var(--home-fg)] transition-[background-color,border-color,color] duration-500 ease-[var(--ease-house)] group-hover:border-[var(--home-fg)] group-hover:bg-[var(--home-fg)] group-hover:text-[var(--home-on-fg)]"
          >
            <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-house)] group-hover:rotate-45" strokeWidth={1.75} />
          </Link>
        </div>
      </article>
    </m.li>
  );
}

function Cover({ p }: { p: Project }) {
  const shot = shotsFor(p.slug).cover;
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#1a1e23] shadow-[0_24px_60px_-28px_#000c]">
      {shot ? (
        <Picture
          shot={shot}
          sizes="(min-width: 1440px) 650px, (min-width: 768px) 45vw, calc(100vw - 2.5rem)"
          alt=""
          className="transition-transform duration-[1100ms] ease-[var(--ease-house)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 transition-transform duration-[1100ms] ease-[var(--ease-house)] group-hover:scale-[1.04]">
          <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_28%_18%,#4a535e_0%,#2e343c_38%,#15181c_80%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_100%,#d7e2ea1f,transparent_70%)] opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
          <span className="absolute inset-x-[7%] bottom-[9%] text-[clamp(2rem,5.2vw,4.4rem)] leading-[0.9] font-extrabold tracking-[-0.04em] text-balance text-[#d7e2ea] uppercase opacity-[0.16]">
            {p.title}
          </span>
          <span className="num absolute top-[8%] left-[7%] text-[#d7e2ea] opacity-50">{p.n}</span>
        </div>
      )}
    </div>
  );
}
