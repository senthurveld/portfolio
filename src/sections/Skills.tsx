import {
  SiCss,
  SiExpress,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiLeaflet,
  SiMongodb,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVercel,
  SiVite,
} from "@icons-pack/react-simple-icons";
import { Boxes, Spline, Webhook } from "lucide-react";
import { m, useReducedMotion, type Variants } from "motion/react";
import { useState, type ComponentType, type CSSProperties } from "react";
import { Bump } from "@/components/Bump";
import { FadeIn } from "@/components/FadeIn";
import { WordReveal } from "@/components/WordReveal";
import { skills, type SkillIcon } from "@/content/site";
import { cn } from "@/lib/logic";

type Logo = { Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>; brand?: string };
const logos: Record<SkillIcon, Logo> = {
  html: { Icon: SiHtml5, brand: "#E34F26" },
  css: { Icon: SiCss, brand: "#663399" },
  javascript: { Icon: SiJavascript, brand: "#F7DF1E" },
  typescript: { Icon: SiTypescript, brand: "#3178C6" },
  react: { Icon: SiReact, brand: "#61DAFB" },
  tailwind: { Icon: SiTailwindcss, brand: "#06B6D4" },
  zustand: { Icon: Boxes },
  motion: { Icon: Spline },
  three: { Icon: SiThreedotjs },
  leaflet: { Icon: SiLeaflet, brand: "#199900" },
  node: { Icon: SiNodedotjs, brand: "#5FA04E" },
  express: { Icon: SiExpress },
  mongodb: { Icon: SiMongodb, brand: "#47A248" },
  rest: { Icon: Webhook },
  git: { Icon: SiGit, brand: "#F05032" },
  github: { Icon: SiGithub },
  vite: { Icon: SiVite, brand: "#646CFF" },
  vercel: { Icon: SiVercel },
};

const tools = skills.groups.flatMap((g) => g.items.map((t) => ({ ...t, group: g.name })));

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const chip: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

export function Skills() {
  const reduce = useReducedMotion();
  const [group, setGroup] = useState<string | null>(null);
  const filters = [{ name: null, label: "All", n: tools.length }, ...skills.groups.map((g) => ({ name: g.name, label: g.name, n: g.items.length }))];

  return (
    <section id="skills" aria-labelledby="skills-title" className="sheet section-y relative z-[12]">
      <div className="shell">
        <FadeIn y={16} className="mb-10 flex items-center justify-between md:mb-14">
          <h2 id="skills-title" className="eyebrow">
            {skills.label}
          </h2>
          <span className="num text-[var(--home-dim)]">{tools.length} tools</span>
        </FadeIn>

        <WordReveal tokens={[skills.intro]} className="max-w-[46rem] text-[clamp(1.3rem,2.1vw,1.85rem)] leading-[1.38] font-medium tracking-[-0.015em]" />

        <FadeIn y={20} delay={0.1} className="mt-14 md:mt-20">
          <div role="group" aria-label="Show tools by area" className="flex flex-wrap justify-center gap-2.5">
            {filters.map((f) => {
              const on = group === f.name;
              return (
                <button
                  key={f.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setGroup(f.name)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-[0.95rem] transition-colors duration-300",
                    on
                      ? "border-[var(--home-fg)] bg-[var(--home-fg)] text-[var(--home-on-fg)]"
                      : "border-[var(--home-line)] hover:border-[var(--home-fg)]",
                  )}
                >
                  {f.label}
                  <span className={cn("num", on ? "opacity-60" : "text-[var(--home-dim)]")}>{f.n}</span>
                </button>
              );
            })}
          </div>
        </FadeIn>

        <m.ul
          className="mx-auto mt-10 flex max-w-[64rem] flex-wrap justify-center gap-2.5 md:mt-12 md:gap-3"
          variants={reduce ? undefined : list}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        >
          {tools.map((t) => {
            const { Icon, brand } = logos[t.icon];
            return (
              <m.li
                key={t.label}
                variants={reduce ? undefined : chip}
                className="tool-chip"
                data-tech={t.icon}
                data-dim={group && group !== t.group ? "" : undefined}
                style={brand ? ({ "--brand": brand } as CSSProperties) : undefined}
              >
                <Icon aria-hidden="true" className="tool-logo" />
                <Bump text={t.label} />
              </m.li>
            );
          })}
        </m.ul>
      </div>
    </section>
  );
}
