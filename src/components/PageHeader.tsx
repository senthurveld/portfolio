import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { site } from "@/content/site";
import { enterDelay } from "@/shell/intro";
import { FadeIn } from "./FadeIn";
import { TextReveal } from "./TextReveal";

type Crumb = { label: string; href?: string };
type Props = { crumbs: Crumb[]; eyebrow?: string; title: string; lead?: ReactNode; children?: ReactNode; docTitle?: string };

export function PageHeader({ crumbs, eyebrow, title, lead, children, docTitle }: Props) {
  useEffect(() => {
    document.title = `${docTitle ?? title} — ${site.name}`;
  }, [docTitle, title]);
  const [d] = useState(enterDelay);

  return (
    <header className="relative pt-36 pb-14 sm:pt-44 md:pb-20">
      <div aria-hidden="true" className="page-glow" />
      <div className="shell relative">
        <FadeIn y={16} delay={d}>
          <nav aria-label="Breadcrumb">
            <ol className="kicker flex flex-wrap items-center gap-2 text-[var(--home-dim)]">
              {crumbs.map((c, i) => (
                <Fragment key={c.label}>
                  {i > 0 && <li aria-hidden="true">/</li>}
                  <li>
                    {c.href ? (
                      <Link to={c.href} className="underline-grow hover:text-[var(--home-fg)]">
                        {c.label}
                      </Link>
                    ) : (
                      <span aria-current="page" className="text-[var(--home-fg)]">{c.label}</span>
                    )}
                  </li>
                </Fragment>
              ))}
            </ol>
          </nav>
        </FadeIn>
        {eyebrow && (
          <FadeIn y={16} delay={d + 0.05}>
            <p className="eyebrow mt-10">{eyebrow}</p>
          </FadeIn>
        )}
        <TextReveal as="h1" text={title} delay={d + 0.1} className="page-title mt-6" wordClassName="grad-text" />
        {lead && (
          <FadeIn delay={d + 0.18}>
            <div className="mt-8 max-w-2xl text-[clamp(1.1rem,1.8vw,1.4rem)] leading-[1.5] text-[var(--home-muted)]">{lead}</div>
          </FadeIn>
        )}
        {children}
      </div>
    </header>
  );
}
