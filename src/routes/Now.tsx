import { m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { now, site } from "@/content/site";
import { istTime } from "@/lib/logic";

export function LocalTime() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return <time dateTime={t.toISOString()}>{istTime(t)} IST</time>;
}

export default function Now() {
  const reduce = useReducedMotion();
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Now" }]}
        eyebrow={`Updated ${now.updated}`}
        title="Now"
        lead="What I'm focused on at the moment."
      >
        <p className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[var(--home-dim)]">
          <span aria-hidden="true" className="ping size-2 rounded-full bg-live" />
          {site.city} · <LocalTime />
        </p>
      </PageHeader>
      <ul className="shell hair-t pb-[var(--section-y)]">
        {now.items.map((it, i) => (
          <m.li
            key={it.label}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hair-b grid gap-2 py-8 md:grid-cols-[14rem_1fr]"
          >
            <span className="kicker text-[var(--home-dim)]">{it.label}</span>
            <span className="text-[clamp(1.2rem,2.2vw,1.8rem)] leading-[1.35] font-medium tracking-[-0.015em]">{it.text}</span>
          </m.li>
        ))}
      </ul>
    </main>
  );
}
