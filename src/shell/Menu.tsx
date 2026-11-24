import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Bump } from "@/components/Bump";
import { menu as links, site, socials } from "@/content/site";
import { preloadRoute } from "@/routes/load";
import { BLIND, BLINDS, blindDelay, ease } from "./blinds";
import { markCover } from "./intro";
import { MenuButton } from "./MenuButton";
import { useLenis } from "./scroll";

const rise = [0.22, 1, 0.36, 1] as const;
const sink = [0.64, 0, 0.78, 0] as const;
const LINKS_IN = 0.6;
const LINKS_OUT = 0.7;
const BLINDS_OUT = 0.45;

function isActive(href: string, pathname: string, hash: string) {
  if (href.includes("#")) return pathname + hash === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Menu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const lenis = useLenis();
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const go = async (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setPending(true);
    await preloadRoute(href);
    setPending(false);
    markCover(BLINDS_OUT + 0.55);
    navigate(href);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) lenis.current?.stop();
    else lenis.current?.start();
  }, [open, lenis]);

  useEffect(() => onOpenChange(false), [pathname, hash, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <MenuButton aria-label={open ? "Close menu" : "Open menu"} />
      </Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Content forceMount aria-describedby={undefined} className="fixed inset-0 z-[120] outline-none" style={{ color: "var(--menu-fg)" }}>
              <Dialog.Title className="sr-only">Menu</Dialog.Title>
              <div aria-hidden="true" className="absolute inset-0 grid grid-cols-5">
                {Array.from({ length: BLINDS }, (_, i) => (
                  <m.span
                    key={i}
                    className="origin-top"
                    style={{ background: "var(--menu-bg)" }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1, transition: { duration: BLIND.duration, ease, delay: blindDelay(i) } }}
                    exit={{ scaleY: 0, transition: { duration: BLIND.duration, ease, delay: BLINDS_OUT + blindDelay(i, true) } }}
                  />
                ))}
              </div>
              <m.div
                className="shell relative flex h-full flex-col pt-28 pb-8 sm:pt-32"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: LINKS_IN - 0.1, duration: 0.5 } }}
                exit={{ opacity: 0, transition: { delay: BLINDS_OUT, duration: 0.4 } }}
              >
                <Dialog.Close
                  className="group absolute top-5 right-[var(--gutter)] grid size-11 place-items-center rounded-full border border-current/25 sm:top-7"
                  aria-label="Close menu"
                >
                  <span className="relative block size-4 transition-transform duration-500 group-hover:rotate-90">
                    <span className="absolute top-1/2 left-0 h-[1.5px] w-full rotate-45 bg-current" />
                    <span className="absolute top-1/2 left-0 h-[1.5px] w-full -rotate-45 bg-current" />
                  </span>
                </Dialog.Close>
                <nav aria-label="Menu" data-lenis-prevent data-no-transition className="flex-1 overflow-y-auto">
                  <ul>
                    {links.map((l, i) => {
                      const active = isActive(l.href, pathname, hash);
                      return (
                        <li key={l.href} className="overflow-hidden">
                          <m.div
                            initial={{ y: "110%" }}
                            animate={{ y: 0, transition: { duration: 1.1, ease: rise, delay: LINKS_IN + i * 0.08 } }}
                            exit={{ y: "110%", transition: { duration: LINKS_OUT, ease: sink, delay: (links.length - 1 - i) * 0.08 } }}
                          >
                            <Link
                              to={l.href}
                              onClick={(e) => go(e, l.href)}
                              aria-current={active ? "page" : undefined}
                              className="menu-link group flex items-center gap-5 py-1 sm:gap-8"
                            >
                              <span className="num inline-flex w-6 items-center gap-1.5 text-xs opacity-45 transition-[opacity,translate] duration-500 ease-[var(--ease-house)] group-hover:translate-x-1 group-hover:opacity-90">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="menu-label text-[clamp(2.4rem,min(8.5vw,9.5vh),7.25rem)] font-bold tracking-[-0.045em] uppercase">
                                <Bump text={l.label} />
                                {active && <span aria-hidden="true" className="ml-3 inline-block size-[0.14em] translate-y-[-0.35em] rounded-full bg-current align-middle" />}
                              </span>
                              <span className="ml-auto hidden max-w-[16rem] text-right text-sm opacity-50 transition-opacity duration-500 group-hover:opacity-90 md:block">
                                {l.note}
                              </span>
                            </Link>
                          </m.div>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                <span
                  aria-hidden="true"
                  className={`load-line mx-auto transition-opacity duration-300 ${pending ? "opacity-100" : "opacity-0"}`}
                  style={{ "--home-fg": "currentColor", "--home-line": "color-mix(in srgb, currentColor 20%, transparent)" } as React.CSSProperties}
                />
                <div className="hair-t no-draw mt-8 flex flex-wrap items-end justify-between gap-6 pt-6 [--hair:color-mix(in_srgb,currentColor_18%,transparent)]">
                  <a href={`mailto:${site.email}`} className="underline-grow text-lg font-medium">
                    {site.email}
                  </a>
                  <ul className="flex gap-6">
                    {socials.map((s) => (
                      <li key={s.label}>
                        <a href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="me noreferrer" className="kicker inline-flex items-center gap-1 opacity-80 hover:opacity-100">
                          {s.label}
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
