import { SiExpress, SiJavascript, SiMongodb, SiNextdotjs, SiNodedotjs, SiReact, SiTailwindcss, SiTypescript } from "@icons-pack/react-simple-icons";
import { ArrowUpRight } from "lucide-react";
import type { ComponentType, CSSProperties } from "react";
import { Link } from "react-router";
import { Bump } from "@/components/Bump";
import { FadeIn } from "@/components/FadeIn";
import { WordReveal, type Token } from "@/components/WordReveal";
import { about, site, type Tech } from "@/content/site";

const logos: Partial<Record<Tech, { Logo: ComponentType<{ className?: string }>; brand: string }>> = {
  react: { Logo: SiReact, brand: "#61DAFB" },
  typescript: { Logo: SiTypescript, brand: "#3178C6" },
  nextjs: { Logo: SiNextdotjs, brand: "#FFFFFF" },
  tailwind: { Logo: SiTailwindcss, brand: "#06B6D4" },
  node: { Logo: SiNodedotjs, brand: "#5FA04E" },
  express: { Logo: SiExpress, brand: "#FFFFFF" },
  mongodb: { Logo: SiMongodb, brand: "#47A248" },
  javascript: { Logo: SiJavascript, brand: "#F7DF1E" },
};

export const techToken = (tech: Tech, label: string): Token => {
  const logo = logos[tech];
  return {
    text: label,
    node: (
      <span className="tech-pill" data-tech={tech} style={logo ? ({ "--brand": logo.brand } as CSSProperties) : undefined}>
        <span className="tech-logo">{logo && <logo.Logo />}</span>
        {label}
      </span>
    ),
  };
};

const nameToken: Token = {
  text: site.first,
  node: (
    <span className="name-pop">
      {site.first}
      <span aria-hidden="true" className="name-pop-emoji">
        👍
      </span>
    </span>
  ),
};

const tokens: Token[] = about.body.flatMap((t): Token[] => {
  if (typeof t !== "string") return [techToken(t.tech, t.label)];
  const [before, ...rest] = t.split(site.first);
  return rest.length ? [before ?? "", nameToken, rest.join(site.first)] : [t];
});

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="sheet section-y relative z-[1] !mt-0">
      <div className="shell">
        <FadeIn y={16}>
          <h2 id="about-title" className="eyebrow mb-10 md:mb-14">
            {about.label}
          </h2>
        </FadeIn>
        <WordReveal tokens={tokens} className="max-w-[76rem] text-[clamp(1.85rem,3.9vw,3.85rem)] leading-[1.22] font-semibold tracking-[-0.025em] [word-spacing:0.08em]" />

        <div className="mt-20 grid gap-14 md:mt-28 min-[960px]:grid-cols-[5fr_7fr]">
          <FadeIn y={28}>
            <p className="max-w-sm text-[clamp(1.3rem,2.1vw,1.85rem)] leading-[1.38] font-medium tracking-[-0.015em]">{about.cta}</p>
            <Link to={about.ctaLink.href} className="group mt-6 inline-flex items-center gap-[0.6rem] text-sm font-semibold tracking-[0.2em] uppercase transition-[gap] duration-[350ms] hover:gap-[0.9rem]">
              <Bump text={about.ctaLink.label} />
              <ArrowUpRight className="size-4 transition-transform duration-[350ms] group-hover:rotate-45" />
            </Link>
          </FadeIn>
          <FadeIn y={28}>
            <h3 className="kicker mb-4 text-[var(--home-dim)]">{about.ossLabel}</h3>
            <ul className="oss-list hair-t">
              {about.oss.map((o) => (
                <li key={o.name} className="hair-b transition-opacity duration-500 ease-[var(--ease-house)]">
                  <a href={o.href} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-6 py-5">
                    <span className="transition-[translate] duration-[400ms] ease-[var(--ease-house)] [@media(hover:hover)]:group-hover:translate-x-[.35rem] group-focus-visible:translate-x-[.35rem]">
                      <span className="block text-[clamp(1.25rem,2vw,1.6rem)] font-semibold tracking-[-0.02em]">{o.name}</span>
                      <span className="text-sm text-[var(--home-dim)] transition-colors duration-500 group-hover:text-[var(--home-fg)] group-focus-visible:text-[var(--home-fg)]">
                        {o.note}
                      </span>
                    </span>
                    <ArrowUpRight className="size-5 shrink-0 text-[var(--home-dim)] transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px] group-hover:text-[var(--home-fg)]" />
                  </a>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
