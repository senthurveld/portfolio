import { ArrowUpRight, Check } from "lucide-react";
import { Link, useParams } from "react-router";
import { FadeIn } from "@/components/FadeIn";
import { PageHeader } from "@/components/PageHeader";
import { services } from "@/content/site";
import NotFound from "./NotFound";

export default function Service() {
  const { slug = "" } = useParams();
  const i = services.lanes.findIndex((l) => l.slug === slug);
  const lane = services.lanes[i];
  if (!lane) return <NotFound />;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: lane.name }]}
        eyebrow={`${String(i + 1).padStart(2, "0")} · ${lane.summary}`}
        title={lane.name}
        lead={lane.line}
      />
      <div className="shell grid gap-14 pb-[var(--section-y)] lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="inc-title">
          <h2 id="inc-title" className="eyebrow mb-8">What you get</h2>
          <ul className="hair-t">
            {lane.includes.map((x, k) => (
              <FadeIn as="li" key={x} y={20} delay={0.05 * k} className="hair-b flex items-start gap-4 py-5 text-[clamp(1.05rem,1.6vw,1.3rem)]">
                <Check className="mt-1 size-5 shrink-0 text-live" strokeWidth={2} />
                {x}
              </FadeIn>
            ))}
          </ul>
          <ul className="mt-8 flex flex-wrap gap-2">
            {lane.tags.map((t) => (
              <li key={t} className="tech-pill !text-base !px-3 !py-0.5">{t}</li>
            ))}
          </ul>
        </section>
        <aside className="h-fit rounded-[1.75rem] border border-[var(--home-line)] bg-[var(--home-card)] p-7 lg:sticky lg:top-32">
          <p className="text-xl font-semibold tracking-[-0.02em]">Need {lane.name.toLowerCase()}?</p>
          <p className="mt-2 text-[var(--home-muted)]">Every quote follows a short call. No fixed prices on purpose.</p>
          <Link to={`/contact?topic=${slug === "portfolios" ? "portfolio" : slug === "redesigns" ? "redesign" : slug === "freelance" ? "freelance" : "website"}`} className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--home-fg)] px-6 py-3 text-sm font-semibold tracking-[0.2em] text-[var(--home-on-fg)] uppercase">
            Start a project <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
          </Link>
        </aside>
      </div>
    </main>
  );
}
