import { FadeIn } from "@/components/FadeIn";
import { PageHeader } from "@/components/PageHeader";
import { services } from "@/content/site";
import { Lanes } from "@/sections/Services";

export default function ServicesPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]} eyebrow={services.label} title="Services" lead={services.intro} />
      <section aria-label="Service lanes" className="shell pb-[var(--section-y)]">
        <Lanes />
      </section>
      <section aria-labelledby="process-title" className="sheet sheet-b section-y">
        <div className="shell">
          <h2 id="process-title" className="eyebrow mb-12">How a project runs</h2>
          <ol className="grid gap-px overflow-hidden rounded-[1.75rem] border border-[var(--home-line)] bg-[var(--home-line)] sm:grid-cols-2 lg:grid-cols-4">
            {services.process.map(([t, d], i) => (
              <FadeIn as="li" key={t} delay={0.07 * i} className="bg-[var(--home-b)] p-7">
                <p className="num text-[var(--home-dim)]">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">{t}</h3>
                <p className="mt-2 text-[var(--home-muted)]">{d}</p>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
