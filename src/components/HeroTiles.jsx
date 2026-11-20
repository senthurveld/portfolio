import { useEffect, useState } from "react";
import { site } from "../content/site";
import { copyEmail } from "../lib/hooks";
import { scrollToId, useReducedMotion } from "../lib/motion";

const IST_MIN = 330;

function istNow() {
  const t = new Date(Date.now() + IST_MIN * 60_000);
  return { h: t.getUTCHours(), m: t.getUTCMinutes(), s: t.getUTCSeconds() };
}

/** "4h 30m ahead of you", from the visitor's own offset. */
function offsetText() {
  const diff = IST_MIN + new Date().getTimezoneOffset();
  if (diff === 0) return "Same time zone as you";
  const a = Math.abs(diff);
  const hm = `${Math.floor(a / 60)}h${a % 60 ? ` ${a % 60}m` : ""}`;
  return `${hm} ${diff > 0 ? "ahead of" : "behind"} you`;
}

function Clock({ h, m, s, seconds }) {
  const hand = (deg, len, w, cls) => (
    <line x1="100" y1="112" x2="100" y2={100 - len} strokeWidth={w} strokeLinecap="round" className={cls} transform={`rotate(${deg} 100 100)`} />
  );
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <circle cx="100" cy="100" r="92" strokeWidth="1.5" className="fill-bg-2 stroke-line" />
      {Array.from({ length: 60 }, (_, i) => (
        <line
          key={i}
          x1="100"
          y1={i % 5 ? 14 : 12}
          x2="100"
          y2={i % 5 ? 18 : 26}
          strokeWidth={i % 15 ? (i % 5 ? 1 : 2.5) : 4}
          strokeLinecap="round"
          className={i % 5 ? "stroke-muted opacity-60" : "stroke-ink"}
          transform={`rotate(${i * 6} 100 100)`}
        />
      ))}
      {hand((h % 12) * 30 + m * 0.5, 48, 7, "stroke-ink")}
      {hand(m * 6 + s * 0.1, 70, 4.5, "stroke-ink")}
      {seconds && hand(s * 6, 76, 1.75, "stroke-red")}
      <circle cx="100" cy="100" r="5" className="fill-red" />
    </svg>
  );
}

/** Live IST clock + copy-email tile under the hero. */
export default function HeroTiles() {
  const rm = useReducedMotion();
  const [t, setT] = useState(istNow);
  const offset = offsetText();

  useEffect(() => {
    const id = setInterval(() => setT(istNow()), rm ? 10_000 : 1000);
    return () => clearInterval(id);
  }, [rm]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16">
      <div data-fade className="clay-lg flex items-center gap-6 p-6 sm:p-7">
        <div className="aspect-square w-[min(9.5rem,34vw)] shrink-0">
          <Clock {...t} seconds={!rm} />
        </div>
        <div className="min-w-0">
          <p className="label">{site.city} · IST</p>
          <p className="mt-2 font-display text-[clamp(2rem,1.5rem+1.6vw,2.9rem)] font-bold leading-none tracking-[-0.03em] tabular-nums text-ink">
            <time>
              {pad(t.h)}:{pad(t.m)}
            </time>
          </p>
          <p className="mt-3 text-[14.5px] text-muted">{offset}</p>
        </div>
      </div>

      <div data-fade className="clay-pastel flex flex-col justify-between gap-6 rounded-(--r-xl) bg-lemon p-6 sm:p-7">
        <div className="grid gap-2">
          <p className="font-display text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] font-bold leading-[1.02] tracking-[-0.03em] [font-variation-settings:'opsz'_72]">
            Have a site in mind? <span className="accent">Let's talk.</span>
          </p>
          <p className="text-[15px] font-medium text-on-pastel/80">I reply within one working day.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={copyEmail}
            aria-label={`Copy email address ${site.email}`}
            className="btn h-12 max-w-full gap-2.5 px-5 text-[15px] [--btn-bg:var(--on-pastel)] [--btn-fg:var(--lemon)] [--hi:rgb(255_255_255/0.12)] [--lo:rgb(0_0_0/0.22)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="12" height="12" rx="2.5" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
            <span className="truncate">{site.email}</span>
          </button>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("contact");
            }}
            className="text-[15px] font-semibold text-on-pastel underline decoration-on-pastel/35 decoration-[1.5px] underline-offset-4 transition-[text-decoration-color] hover:decoration-on-pastel"
          >
            Or use the form →
          </a>
        </div>
      </div>
    </div>
  );
}
