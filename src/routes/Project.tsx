import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link, useParams } from "react-router";
import { FadeIn } from "@/components/FadeIn";
import { Frame } from "@/components/Frame";
import { PageHeader } from "@/components/PageHeader";
import { shotsFor } from "@/content/shots";
import { projects } from "@/content/site";
import { neighbours, real } from "@/lib/logic";
import NotFound from "./NotFound";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function Project() {
  const { slug = "" } = useParams();
  const p = projects.find((x) => x.slug === slug);
  const around = neighbours(projects, slug);
  if (!p || !around) return <NotFound />;

  const sections = p.sections.filter(([, t]) => real(t));
  const facts = [["Type", p.category], ["Year", p.year], ["Stack", p.stack.join(", ")], ...p.facts].filter(([, v]) => real(v));
  const shots = shotsFor(p.slug);
  const gallery = shots.gallery ?? [];

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Projects", href: "/projects" }, { label: p.title }]} eyebrow={`${p.n} · ${p.category}`} title={p.title} lead={p.pitch}>
        <FadeIn delay={0.24} className="mt-8 flex flex-wrap items-center gap-4">
          {p.href && (
            <a href={p.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-steel px-7 py-3 text-sm font-semibold tracking-[0.2em] text-ink uppercase hover:bg-white">
              Live site <ArrowUpRight className="size-4" />
            </a>
          )}
          {p.repo && (
            <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[var(--home-line)] px-7 py-3 text-sm font-semibold tracking-[0.2em] uppercase">
              Source <ArrowUpRight className="size-4" />
            </a>
          )}
          {p.note && <p className="text-sm text-[var(--home-dim)]">{p.note}</p>}
        </FadeIn>
      </PageHeader>

      <div className="shell">
        <FadeIn>
          <dl className="hair-t hair-b grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="kicker text-[var(--home-dim)]">{k}</dt>
                <dd className="mt-1.5">{v}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>
        <FadeIn className="mt-12">
          <Frame shot={shots.cover} sizes="(min-width: 1440px) 1360px, 94vw" alt={`${p.title} cover`} label={p.title} className="aspect-[16/10]" eager />
        </FadeIn>
      </div>

      <div className="shell grid gap-12 py-[var(--section-y)] lg:grid-cols-[15rem_1fr] lg:gap-20">
        <nav aria-label="On this page" className="lg:sticky lg:top-32 lg:self-start">
          <p className="kicker mb-4 text-[var(--home-dim)]">On this page</p>
          <ol className="space-y-2 border-l border-[var(--home-line)]">
            {[...sections.map(([h]) => h), ...(gallery.length ? ["Gallery"] : [])].map((h) => (
              <li key={h}>
                <a href={`#${slugify(h)}`} className="-ml-px block border-l border-transparent pl-4 text-[var(--home-dim)] transition-colors hover:border-[var(--home-fg)] hover:text-[var(--home-fg)]">
                  {h}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="max-w-3xl space-y-16">
          {sections.map(([h, t], i) => (
            <FadeIn key={h}>
              <section id={slugify(h)} aria-labelledby={`h-${slugify(h)}`} className="scroll-mt-32">
                <p className="num text-[var(--home-dim)]">{String(i + 1).padStart(2, "0")}</p>
                <h2 id={`h-${slugify(h)}`} className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-[-0.03em]">{h}</h2>
                <p className="mt-4 text-[clamp(1.02rem,1.5vw,1.2rem)] leading-[1.7] text-[var(--home-muted)]">{t}</p>
              </section>
            </FadeIn>
          ))}
          {gallery.length > 0 && (
            <section id="gallery" aria-labelledby="h-gallery" className="scroll-mt-32">
              <h2 id="h-gallery" className="text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-[-0.03em]">Gallery</h2>
              <div className="mt-6 columns-1 gap-4 sm:columns-2 [&>*]:mb-4">
                {gallery.map((g, i) => (
                  <Frame key={g.src} shot={g} sizes="(min-width: 1440px) 504px, (min-width: 1024px) calc(46vw - 168px), (min-width: 640px) 46vw, calc(100vw - 2.5rem)" alt={g.alt ?? `${p.title} screenshot ${i + 1}`} />
                ))}
              </div>
            </section>
          )}
        </article>
      </div>

      <nav aria-label="More projects" className="sheet sheet-b">
        <div className="shell grid gap-4 py-16 md:grid-cols-2 md:py-20">
          {(
            [
              ["Previous", around.prev, ArrowLeft],
              ["Next", around.next, ArrowRight],
            ] as const
          ).map(([dir, q, Icon]) => (
            <Link key={dir} to={`/projects/${q.slug}`} className={`group rounded-[1.75rem] border border-[var(--home-line)] p-6 transition-colors hover:bg-[var(--home-faint)] md:p-8 ${dir === "Next" ? "md:text-right" : ""}`}>
              <span className={`kicker flex items-center gap-2 text-[var(--home-dim)] ${dir === "Next" ? "md:flex-row-reverse" : ""}`}>
                <Icon className="size-4" /> {dir}
              </span>
              <span className="mt-3 block text-[clamp(1.4rem,2.6vw,2.2rem)] font-semibold tracking-[-0.03em]">{q.title}</span>
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
