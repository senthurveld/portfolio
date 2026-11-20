import { useEffect, useRef } from "react";
import { gsap } from "../lib/motion";

const words = ["Responsive", "Accessible", "Fast to load", "SEO-ready", "Easy to update", "Deployed"];

function Band({ className, reverse, dur }) {
  const items = [...words, ...words, ...words, ...words];
  return (
    <div data-band className={`clay-pastel absolute left-[-5%] top-1/2 w-[110%] -translate-y-1/2 py-3 sm:py-4 ${className}`}>
      <ul className="marquee-track" data-reverse={reverse || undefined} style={{ "--marquee-dur": dur }}>
        {items.map((w, i) => (
          <li key={i} className="flex shrink-0 items-center gap-5 pr-5 font-display text-[clamp(1.1rem,0.85rem+1.1vw,1.85rem)] font-extrabold uppercase leading-none tracking-[-0.02em] [font-variation-settings:'opsz'_72,'wdth'_80]">
            {w}
            <span className="text-[0.6em]">✦</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Two pastel bands crossing in an X. Decorative: the Services section says the same thing in words. */
export default function Ribbons() {
  const root = useRef(null);

  // The X opens as it scrolls past, then pinches shut: the bands twist in opposite directions.
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const [a, b] = root.current.querySelectorAll("[data-band]");
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 };
      gsap.fromTo(a, { rotation: -2 }, { rotation: 2, ease: "none", scrollTrigger: st });
      gsap.fromTo(b, { rotation: 2 }, { rotation: -2, ease: "none", scrollTrigger: { ...st } });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="relative h-[clamp(150px,17vw,230px)] overflow-hidden">
      <Band className="rotate-[4deg] bg-periwinkle" dur="64s" reverse />
      <Band className="-rotate-[3deg] bg-lemon" dur="52s" />
    </div>
  );
}
