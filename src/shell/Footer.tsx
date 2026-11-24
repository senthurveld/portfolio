import { SiGithub } from "@icons-pack/react-simple-icons";
import { ArrowUpRight, Mail } from "lucide-react";
import { Link } from "react-router";
import { FadeIn } from "@/components/FadeIn";
import { menu, site, socials } from "@/content/site";
import { GlobeCard } from "./footer/GlobeCard";

function Linkedin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3v-11zm7 0h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4v-11z" />
    </svg>
  );
}

const icons = { github: SiGithub, linkedin: Linkedin, mail: Mail };

export function Footer() {
  return (
    <footer className="sheet relative z-20 overflow-hidden" style={{ background: "var(--footer-bg)" }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_100%,color-mix(in_srgb,var(--home-fg)_6%,transparent),transparent_70%)]" />
      <div className="shell relative pt-20 pb-8 md:pt-28">
        <div className="grid gap-x-16 gap-y-14 lg:grid-cols-[1fr_minmax(0,1.15fr)]">
          <FadeIn y={28} className="flex flex-col justify-between gap-12">
            <div>
              <p className="text-[1.4rem] font-bold tracking-[-0.03em]">{site.name}</p>
              <p className="mt-1 text-[var(--home-dim)]">
                {site.roleShort} · {site.city}
              </p>
              <p className="mt-5 max-w-sm text-[var(--home-muted)]">{site.pitch}</p>
            </div>
            <div className="grid grid-cols-2 gap-10 sm:max-w-md">
              <nav aria-label="Footer">
                <p className="mb-5 text-[0.7rem] font-semibold tracking-[0.24em] text-[var(--home-dim)] uppercase">Navigate</p>
                <ul className="space-y-2">
                  {menu.map((n) => (
                    <li key={n.href}>
                      <Link to={n.href} className="text-[1.08rem] font-medium">
                        <span className="roll">
                          <span data-text={n.label}>{n.label}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div>
                <p className="mb-5 text-[0.7rem] font-semibold tracking-[0.24em] text-[var(--home-dim)] uppercase">Connect</p>
                <ul className="space-y-2">
                  {socials.map((s) => {
                    const Icon = icons[s.icon];
                    return (
                      <li key={s.label}>
                        <a
                          href={s.href}
                          rel="me noreferrer"
                          target={s.href.startsWith("http") ? "_blank" : undefined}
                          className="group inline-flex items-center gap-3 text-[1.08rem] font-medium"
                        >
                          <Icon className="size-4 opacity-70" />
                          <span className="roll">
                            <span data-text={s.label}>{s.label}</span>
                          </span>
                          <ArrowUpRight className="size-3.5 opacity-50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </FadeIn>
          <FadeIn y={36} delay={0.1} className="grid">
            <GlobeCard />
          </FadeIn>
        </div>

        <FadeIn y={60} className="mt-20 [container-type:inline-size] md:mt-28">
          <p
            aria-hidden="true"
            className="bg-[linear-gradient(var(--home-fg),color-mix(in_srgb,var(--home-fg)_32%,transparent)_60%,transparent)] bg-clip-text text-center text-[13.1579cqi] leading-[0.82] font-extrabold tracking-[-0.06em] whitespace-nowrap text-transparent uppercase select-none"
          >
            {site.first}
          </p>
        </FadeIn>

        <div className="hair-t hair-end mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 text-[0.85rem] text-[var(--home-dim)]">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="underline-grow">
              Privacy
            </Link>
            <span>Built with React</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
