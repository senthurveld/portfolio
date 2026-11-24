import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { Bump } from "@/components/Bump";
import { FadeIn } from "@/components/FadeIn";
import { contact, site } from "@/content/site";

export function ContactBlock() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="sheet sheet-b section-y relative z-[13]">
      <div className="shell">
        <FadeIn y={16} className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <p className="eyebrow">{contact.label}</p>
          {site.available && (
            <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--home-line)] px-4 py-2 text-sm">
              <span aria-hidden="true" className="ping size-[0.45rem] rounded-full bg-live" />
              {contact.availability}
            </span>
          )}
        </FadeIn>
        <FadeIn>
          <h2 id="contact-title" className="grad-text max-w-5xl text-[clamp(2.4rem,6.5vw,6rem)] leading-[0.95] font-bold tracking-[-0.04em] uppercase">
            {contact.heading}
          </h2>
        </FadeIn>
        <FadeIn y={28} className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="max-w-lg text-[clamp(1.05rem,1.5vw,1.25rem)] leading-[1.6] text-[var(--home-muted)]">{contact.intro}</p>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {contact.topics.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/contact?topic=${t.id}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-[var(--home-line)] px-5 text-[0.95rem] transition-colors duration-300 hover:border-[var(--home-fg)] hover:bg-[var(--home-fg)] hover:text-[var(--home-on-fg)]"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link
            to={contact.link.href}
            className="group inline-flex items-center gap-[0.6rem] rounded-full bg-steel px-8 py-4 text-sm font-semibold tracking-[0.2em] text-ink uppercase shadow-[inset_0_1px_0_rgba(255,255,255,.8),inset_0_-1px_0_rgba(12,12,12,.14),0_12px_36px_rgba(215,226,234,.14)] transition-[gap,background-color] duration-[350ms] hover:gap-[0.9rem] hover:bg-white light:bg-ink light:text-plate light:shadow-none"
          >
            <Bump text={contact.link.label} />
            <ArrowUpRight className="size-4 transition-transform duration-[350ms] group-hover:rotate-45" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
