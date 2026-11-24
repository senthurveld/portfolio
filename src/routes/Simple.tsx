import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { FadeIn } from "@/components/FadeIn";
import { PageHeader } from "@/components/PageHeader";
import { guides, posts, tools } from "@/content/site";

export function Privacy() {
  const rows: [string, string][] = [
    ["Analytics", "None. This site does not track you or set analytics cookies."],
    ["Stored on your device", "Your theme choice, the projects layout and an unsent contact-form draft live in your browser's local storage. Clear site data to remove them."],
    ["Contact form", "Submitting opens your own mail app. Nothing is sent to a server from this site."],
    ["Fonts and assets", "Fonts and site images are served from this site."],
  ];
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]} eyebrow="Last updated November 2026" title="Privacy" />
      <dl className="shell hair-t max-w-4xl pb-[var(--section-y)]">
        {rows.map(([k, v], i) => (
          <FadeIn key={k} y={20} delay={0.2 + i * 0.06} className="hair-b grid gap-2 py-7 md:grid-cols-[14rem_1fr]">
            <dt className="kicker text-[var(--home-dim)]">{k}</dt>
            <dd className="text-lg text-[var(--home-muted)]">{v}</dd>
          </FadeIn>
        ))}
      </dl>
    </main>
  );
}

export function NotFoundPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "404" }]} eyebrow="Error 404" title="Page not found" docTitle="Not found" lead="This page doesn't exist or has moved. Press Ctrl+K to search pages and projects.">
        <Link to="/" className="group mt-10 inline-flex items-center gap-2 rounded-full bg-[var(--home-fg)] px-7 py-3 text-sm font-semibold tracking-[0.2em] text-[var(--home-on-fg)] uppercase">
          Back home <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
        </Link>
      </PageHeader>
      <div className="pb-[var(--section-y)]" />
    </main>
  );
}

export function Listing({ kind }: { kind: "blog" | "guides" | "tools" }) {
  const list = { blog: posts, guides, tools }[kind];
  if (list.length === 0) return <NotFoundPage />;
  const title = { blog: "Blog", guides: "Guides", tools: "Free tools" }[kind];
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: title }]} title={title} />
      <ul className="shell grid gap-6 pb-[var(--section-y)] sm:grid-cols-2 lg:grid-cols-3">
        {list.map((x, i) => (
          <FadeIn as="li" key={x.slug} delay={0.06 * Math.min(i, 5)} className="rounded-[1.75rem] border border-[var(--home-line)] p-6">
            <Link to={`/${kind}/${x.slug}`} data-cursor="Read" className="block">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{x.title}</h2>
              <p className="mt-2 text-[var(--home-muted)]">{x.dek}</p>
            </Link>
          </FadeIn>
        ))}
      </ul>
    </main>
  );
}
