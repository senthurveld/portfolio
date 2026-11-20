import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { scrollToId, ScrollTrigger } from "../lib/motion";
import { toggleTheme } from "../lib/theme";
import { useSoundOn } from "../lib/hooks";
import { play, setSound } from "../lib/sound";
import { giscus } from "../content/site";

const links = [
  ["about", "About"],
  ["work", "Work"],
  ["services", "Services"],
  ["skills", "Skills"],
];
const more = [
  ["experience", "Experience"],
  ["lab", "Lab"],
  ...(giscus.repo && giscus.repoId ? [["guestbook", "Guestbook"]] : []),
  ["contact", "Contact"],
];

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export default function Nav({ onOpenPalette }) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [drop, setDrop] = useState(false);
  const last = useRef(0);
  const bar = useRef(null);

  // Hide on scroll down, reveal on scroll up. Progress bar falls back to JS without scroll timelines.
  useEffect(() => {
    const css = CSS.supports?.("animation-timeline: scroll()");
    const on = () => {
      const y = window.scrollY;
      if (!css && bar.current) bar.current.style.setProperty("--p", y / Math.max(1, document.documentElement.scrollHeight - innerHeight));
      setScrolled(y > 8);
      setHidden(y > 240 && y > last.current + 4 ? true : y < last.current - 4 ? false : (h) => h);
      last.current = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!drop) return;
    const off = (e) => !e.target.closest?.("[data-more]") && setDrop(false);
    const esc = (e) => e.key === "Escape" && setDrop(false);
    addEventListener("pointerdown", off);
    addEventListener("keydown", esc);
    return () => (removeEventListener("pointerdown", off), removeEventListener("keydown", esc));
  }, [drop]);

  useEffect(() => {
    if (!menu) return;
    const esc = (e) => e.key === "Escape" && setMenu(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [menu]);

  // Scrollspy: which section is under the middle of the screen.
  const [active, setActive] = useState(null);
  const spy = useRef(null);
  const pill = useRef(null);
  const spyKey = links.some(([id]) => id === active) ? active : more.some(([id]) => id === active) ? "more" : null;

  useEffect(() => {
    const sts = [...links, ...more, ["top"]]
      .map(([id]) => document.getElementById(id))
      .filter(Boolean)
      .map((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (s) => s.isActive && setActive(el.id === "top" ? null : el.id),
        }),
      );
    return () => sts.forEach((s) => s.kill());
  }, []);

  useLayoutEffect(() => {
    const ul = spy.current;
    const p = pill.current;
    const place = () => {
      const el = spyKey && ul.querySelector(`[data-spy="${spyKey}"]`);
      p.style.opacity = el ? "1" : "0";
      if (!el) return;
      p.style.transform = `translateX(${el.parentElement.offsetLeft}px)`;
      p.style.width = `${el.offsetWidth}px`;
    };
    place();
    const raf = requestAnimationFrame(() => (p.dataset.ready = ""));
    const ro = new ResizeObserver(place);
    ro.observe(ul);
    return () => (cancelAnimationFrame(raf), ro.disconnect());
  }, [spyKey]);

  const go = (e, id) => {
    e.preventDefault();
    setMenu(false);
    setDrop(false);
    scrollToId(id);
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-[100] px-3 pt-3 transition-transform duration-500 ease-[var(--ease-out)] sm:px-5 sm:pt-4"
      style={{ transform: hidden && !menu ? "translateY(-120%)" : "none" }}
      onFocus={() => setHidden(false)}
    >
      <nav
        aria-label="Primary"
        className={`relative mx-auto max-w-[1160px] rounded-[24px] bg-surface/95 transition-shadow duration-300 ${
          scrolled || menu ? "shadow-[var(--clay)]" : ""
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-3 pl-3 pr-2 sm:pl-4">
          <a href="#top" onClick={(e) => go(e, "top")} className="group flex items-center gap-2.5" aria-label="Senthurvel D, home">
            <Mark />
            <span className="font-display text-[15px] font-bold tracking-tight text-ink">senthurvel</span>
          </a>

          <ul ref={spy} className="relative isolate hidden items-center gap-1 md:flex">
            {/* Slides to whichever section you're reading. */}
            <li ref={pill} aria-hidden="true" className="nav-pill absolute left-0 top-1/2 -z-10 h-9 -translate-y-1/2 rounded-full bg-bg-2 opacity-0" />
            {links.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  data-spy={id}
                  aria-current={active === id ? "location" : undefined}
                  onClick={(e) => go(e, id)}
                  className="block rounded-full px-3.5 py-2 text-[14.5px] font-medium text-body transition-colors hover:bg-bg-2 hover:text-ink aria-[current]:text-ink aria-[current]:hover:bg-transparent"
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="relative" data-more>
              <button
                type="button"
                data-spy="more"
                aria-expanded={drop}
                aria-controls="more-menu"
                onClick={() => setDrop((d) => !d)}
                className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[14.5px] font-medium transition-colors hover:bg-bg-2 hover:text-ink ${spyKey === "more" ? "text-ink hover:bg-transparent" : "text-body"}`}
              >
                More
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" className={`transition-transform duration-300 ${drop ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div id="more-menu" hidden={!drop} className="clay absolute left-1/2 top-[calc(100%+10px)] w-52 -translate-x-1/2 p-2">
                <ul className="grid">
                  {more.map(([id, label]) => (
                    <li key={id}>
                      <a href={`#${id}`} onClick={(e) => go(e, id)} className="block rounded-xl px-3 py-2 text-[14.5px] text-ink hover:bg-bg-2">
                        {label}
                      </a>
                    </li>
                  ))}
                  <li className="mt-1 border-t border-line pt-1">
                    <button type="button" onClick={() => (setDrop(false), dispatchEvent(new Event("open-resume")))} className="block w-full rounded-xl px-3 py-2 text-left text-[14.5px] text-ink hover:bg-bg-2">
                      Résumé
                    </button>
                  </li>
                </ul>
              </div>
            </li>
          </ul>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenPalette}
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm text-body transition-colors hover:bg-bg-2 sm:flex"
              aria-label="Open command menu"
              aria-keyshortcuts="Control+K Meta+K"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <kbd className="font-mono text-[11px] text-muted">{isMac ? "⌘K" : "Ctrl K"}</kbd>
            </button>
            <SoundSwitch />
            <ThemeSwitch />
            <a
              href="#contact"
              onClick={(e) => (dispatchEvent(new CustomEvent("contact-topic", { detail: "Freelance project" })), go(e, "contact"))}
              className="btn btn-primary ml-1 hidden min-h-10 px-4 text-[14px] lg:inline-flex"
            >
              Book a call
            </a>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-bg-2 md:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
              onClick={() => setMenu((m) => !m)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                {menu ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </div>

        <div id="mobile-menu" hidden={!menu} className="md:hidden">
          <ul className="grid gap-1 px-3 pb-4">
            {[...links, ...more].map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} onClick={(e) => go(e, id)} className="block rounded-2xl px-4 py-3 font-display text-xl font-semibold text-ink active:bg-bg-2">
                  {label}
                </a>
              </li>
            ))}
            <li className="px-1 pt-2">
              <button type="button" onClick={() => (setMenu(false), dispatchEvent(new Event("open-resume")))} className="btn btn-secondary w-full">
                Résumé
              </button>
            </li>
          </ul>
        </div>
        {/* Clipped on its own, so the nav itself doesn't need overflow-hidden (which cut off the More menu). */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <span ref={bar} className="progress-bar absolute inset-x-0 bottom-0 h-[2px] bg-red/70" />
        </span>
      </nav>
    </header>
  );
}

/** Logo: a small clay "S" pebble. */
function Mark() {
  return (
    <span className="clay-pastel grid h-9 w-9 place-items-center rounded-[12px] bg-lemon font-display text-[15px] font-extrabold transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-12">
      S
    </span>
  );
}

function SoundSwitch() {
  const on = useSoundOn();
  return (
    <button
      type="button"
      onClick={() => setSound(!on)}
      aria-pressed={on}
      aria-label="UI sounds"
      title={on ? "Sound on" : "Sound off"}
      className="grid h-10 w-10 place-items-center rounded-full text-body transition-colors hover:bg-bg-2 hover:text-ink"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        {on ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="m17 9 5 6m0-6-5 6" />}
      </svg>
    </button>
  );
}

function ThemeSwitch() {
  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        play("tick");
        toggleTheme(r.left + r.width / 2, r.top + r.height / 2);
      }}
      className="grid h-10 w-10 place-items-center rounded-full text-body transition-colors hover:bg-bg-2 hover:text-ink"
      aria-label="Toggle dark mode"
    >
      <svg className="dark:hidden" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="hidden dark:block" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5z" />
      </svg>
    </button>
  );
}
