import { useEffect, useRef, useState } from "react";
import { gsap, useReducedMotion } from "../lib/motion";
import { play } from "../lib/sound";
import GravityWell from "./GravityWell";
import HeroStudio from "./HeroStudio";

const modes = [
  ["well", "Gravity well"],
  ["blueprint", "Blueprint"],
];
const KEY = "hero-mode";

/** The hero's right-hand piece: two interactive takes, one tab switch. Remembers the last pick. */
export default function HeroStage() {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "blueprint" ? "blueprint" : "well";
    } catch {
      return "well";
    }
  });
  const panel = useRef(null);
  const tabs = useRef([]);
  const first = useRef(true);
  const rm = useReducedMotion();

  useEffect(() => {
    if (first.current) return void (first.current = false);
    if (!rm && panel.current) gsap.fromTo(panel.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" });
  }, [mode, rm]);

  const pick = (m) => {
    if (m === mode) return;
    setMode(m);
    play("tick");
    try {
      localStorage.setItem(KEY, m);
    } catch {
      /* storage blocked: the choice just won't persist */
    }
  };

  // Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation).
  const onKey = (ev) => {
    const i = modes.findIndex((m) => m[0] === mode);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: modes.length - 1 }[ev.key];
    if (next === undefined) return;
    ev.preventDefault();
    const n = (next + modes.length) % modes.length;
    pick(modes[n][0]);
    tabs.current[n]?.focus();
  };

  const i = modes.findIndex((m) => m[0] === mode);
  return (
    <div>
      <div role="tablist" aria-label="Hero demo" onKeyDown={onKey} className="well relative mb-4 inline-grid grid-cols-2 rounded-full p-1">
        <span
          aria-hidden="true"
          className="absolute bottom-1 left-1 top-1 w-[calc((100%-8px)/2)] rounded-full bg-surface shadow-[var(--clay)] transition-transform duration-500 ease-[var(--ease-spring)]"
          style={{ transform: `translateX(${i * 100}%)` }}
        />
        {modes.map(([id, label], n) => (
          <button
            key={id}
            ref={(el) => (tabs.current[n] = el)}
            type="button"
            role="tab"
            id={`hero-tab-${id}`}
            aria-selected={mode === id}
            aria-controls="hero-panel"
            tabIndex={mode === id ? 0 : -1}
            onClick={() => pick(id)}
            className={`relative z-10 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${mode === id ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div ref={panel} id="hero-panel" role="tabpanel" aria-labelledby={`hero-tab-${mode}`}>
        {mode === "well" ? <GravityWell /> : <HeroStudio />}
      </div>
    </div>
  );
}
