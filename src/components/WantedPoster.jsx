import { useEffect, useRef, useState } from "react";
import { currently, site, stack } from "../content/site";
import { gsap, useReducedMotion } from "../lib/motion";
import { play } from "../lib/sound";
import { toast } from "../lib/toast";

// Optional real photo for the portrait frame (e.g. "/me.jpg" in /public). Null draws the clay illustration.
const PHOTO = null;
const CLIENT_SITES = 4;

/**
 * The signature object: a wanted poster you can grab, throw and flip.
 * Click (no drag) or the Flip button turns it over. Original art only; no series assets.
 */
export default function WantedPoster() {
  const card = useRef(null);
  const rm = useReducedMotion();
  const [flipped, setFlipped] = useState(false);

  const flip = () => {
    setFlipped((f) => !f);
    play("flip");
  };

  // Drag + throw with a springy return to rest.
  useEffect(() => {
    const el = card.current;
    if (!el || rm) return;
    const x = gsap.quickTo(el, "x", { duration: 0.25, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.25, ease: "power3.out" });
    const r = gsap.quickTo(el, "rotation", { duration: 0.4, ease: "power3.out" });
    let s = null;

    const down = (e) => {
      if (e.button !== 0 || e.target.closest("button, a")) return;
      el.setPointerCapture(e.pointerId);
      gsap.killTweensOf(el);
      s = { x0: e.clientX, y0: e.clientY, px: e.clientX, py: e.clientY, t: performance.now(), vx: 0, vy: 0, moved: 0 };
      el.dataset.dragging = "";
    };
    const move = (e) => {
      if (!s) return;
      const now = performance.now();
      const dt = Math.max(1, now - s.t);
      s.vx = (e.clientX - s.px) / dt;
      s.vy = (e.clientY - s.py) / dt;
      s.px = e.clientX;
      s.py = e.clientY;
      s.t = now;
      const dx = e.clientX - s.x0;
      const dy = e.clientY - s.y0;
      s.moved = Math.max(s.moved, Math.hypot(dx, dy));
      x(dx);
      y(dy);
      r(gsap.utils.clamp(-18, 18, s.vx * 10));
    };
    const up = () => {
      if (!s) return;
      delete el.dataset.dragging;
      const { moved, vx, vy } = s;
      s = null;
      if (moved < 6) {
        gsap.to(el, { x: 0, y: 0, rotation: 0, duration: 0.3 });
        flip();
        return;
      }
      const cx = gsap.getProperty(el, "x");
      const cy = gsap.getProperty(el, "y");
      const clamp = gsap.utils.clamp(-360, 360);
      gsap
        .timeline()
        .to(el, { x: clamp(cx + vx * 220), y: clamp(cy + vy * 220), rotation: gsap.utils.clamp(-40, 40, vx * 30), duration: 0.35, ease: "power2.out" })
        .to(el, { x: 0, y: 0, rotation: -2, duration: 1.1, ease: "elastic.out(1, 0.5)", onStart: () => play("stamp") });
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [rm]);

  // Easter egg: type "luffy" anywhere (outside fields) and the poster stretches.
  useEffect(() => {
    let buf = "";
    const on = (e) => {
      if (e.target.closest?.("input, textarea, [contenteditable]") || e.metaKey || e.ctrlKey) return;
      buf = (buf + e.key.toLowerCase()).slice(-5);
      if (buf !== "luffy") return;
      play("pop");
      toast("Found the captain");
      if (!rm && card.current)
        gsap.fromTo(card.current, { scaleY: 1.35, scaleX: 0.82 }, { scaleY: 1, scaleX: 1, duration: 1.2, ease: "elastic.out(1.1, 0.3)" });
    };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, [rm]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        ref={card}
        className="relative w-[min(100%,330px)] touch-none select-none [perspective:1400px] data-[dragging]:cursor-grabbing"
        style={{ transform: "rotate(-2deg)", cursor: rm ? "pointer" : "grab" }}
        onClick={rm ? flip : undefined}
      >
        <div
          className="relative aspect-[3/4.25] transition-transform duration-700 ease-[var(--ease-spring)] [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
        >
          <Front hidden={flipped} />
          <Back hidden={!flipped} />
        </div>
      </div>
      <button type="button" onClick={flip} aria-pressed={flipped} className="btn btn-secondary min-h-11 px-5 text-[15px]">
        {flipped ? "Show the poster" : "Flip the poster"}
      </button>
    </div>
  );
}

const face = "poster-paper absolute inset-0 flex flex-col rounded-[10px] p-[7%] shadow-[0_2px_0_rgb(0_0_0/0.06),0_30px_50px_-24px_rgb(30_20_10/0.55)] [backface-visibility:hidden]";

function Front({ hidden }) {
  return (
    <div className={face} role="img" aria-hidden={hidden} aria-label="Wanted poster: Senthurvel D, frontend developer. Bounty: four client sites.">
      <div aria-hidden="true" className="flex min-h-0 flex-1 flex-col">
        <p className="text-center font-poster text-[clamp(2.3rem,10vw,3.15rem)] leading-[0.95] tracking-[0.02em]">WANTED</p>
        <p className="mt-1 text-center font-mono text-[10px] tracking-[0.32em] opacity-75">手配書 · DEAD OR DEPLOYED</p>
        <div className="mt-[5%] min-h-0 flex-1 overflow-hidden rounded-[3px] border-[2.5px] border-[#2b1f14]">
          {PHOTO ? <img src={PHOTO} alt="" className="h-full w-full object-cover sepia-[.35]" draggable="false" /> : <Portrait />}
        </div>
        <p className="mt-[5%] text-center font-poster text-[clamp(1.35rem,5.6vw,1.75rem)] leading-none">SENTHURVEL D</p>
        <p className="mt-1.5 text-center font-mono text-[10px] tracking-[0.18em] opacity-75">FRONTEND · MERN · {site.city.toUpperCase()}</p>
        <div className="mt-[5%] flex items-end justify-between border-t-[2.5px] border-[#2b1f14] pt-2">
          <span className="font-mono text-[9.5px] leading-tight tracking-[0.14em]">
            BOUNTY
            <br />
            CLIENT SITES
          </span>
          <span className="font-poster text-[2rem] leading-none tabular-nums">{CLIENT_SITES}</span>
        </div>
      </div>
    </div>
  );
}

function Back({ hidden }) {
  const tools = stack.slice(0, 5).map((s) => s.label);
  return (
    <div className={`${face} [transform:rotateY(180deg)]`} aria-hidden={hidden}>
      <p className="font-poster text-[1.6rem] leading-none">CREW LOG</p>
      <dl className="mt-5 grid gap-4 text-[13.5px] leading-snug">
        <div>
          <dt className="font-mono text-[10px] tracking-[0.16em] opacity-70">CURRENTLY</dt>
          {currently.map((c) => (
            <dd key={c.title} className="mt-1 font-semibold">
              {c.kind}: {c.title}
            </dd>
          ))}
        </div>
        <div>
          <dt className="font-mono text-[10px] tracking-[0.16em] opacity-70">FAVOURITE TOOLS</dt>
          <dd className="mt-1 font-semibold">{tools.join(", ")}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] tracking-[0.16em] opacity-70">LAST SEEN</dt>
          <dd className="mt-1 font-semibold">{site.city}, Tamil Nadu</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] tracking-[0.16em] opacity-70">WILL SAIL TO</dt>
          <dd className="mt-1 font-semibold">{site.openTo.join(", ")}</dd>
        </div>
      </dl>
      <p className="mt-auto border-t-[2px] border-[#2b1f14]/40 pt-2 font-mono text-[9px] leading-snug opacity-70">
        Fan-made poster. Not affiliated with Shueisha or Toei Animation.
      </p>
    </div>
  );
}

/** Original clay portrait: a figure in a straw sun hat, drawn in SVG. */
function Portrait() {
  return (
    <svg viewBox="0 0 200 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="pg-bg" cx="50%" cy="35%" r="75%">
          <stop offset="0" stopColor="#c9ddff" />
          <stop offset="1" stopColor="#a99dff" />
        </radialGradient>
        <radialGradient id="pg-skin" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#e2b48c" />
          <stop offset="1" stopColor="#b9825a" />
        </radialGradient>
        <radialGradient id="pg-hat" cx="40%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffe98a" />
          <stop offset="1" stopColor="#e0b43c" />
        </radialGradient>
      </defs>
      <rect width="200" height="220" fill="url(#pg-bg)" />
      {/* shoulders */}
      <path d="M28 220c4-44 34-64 72-64s68 20 72 64z" fill="#cf3e2a" />
      <path d="M86 158l14 26 14-26" fill="none" stroke="#2b1f14" strokeWidth="3" strokeLinecap="round" opacity=".35" />
      {/* neck + head */}
      <rect x="88" y="128" width="24" height="30" rx="10" fill="url(#pg-skin)" />
      <ellipse cx="100" cy="104" rx="38" ry="42" fill="url(#pg-skin)" />
      {/* hair */}
      <path d="M62 98c-2-26 16-44 38-44s42 16 38 44c-6-10-14-16-22-18-6 8-26 10-40 4-6 4-11 9-14 14z" fill="#1e1a22" />
      {/* face */}
      <ellipse cx="86" cy="108" rx="3.6" ry="4.6" fill="#1e1a22" />
      <ellipse cx="114" cy="108" rx="3.6" ry="4.6" fill="#1e1a22" />
      <path d="M88 126c7 6 17 6 24 0" fill="none" stroke="#1e1a22" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="78" cy="120" rx="6" ry="3.5" fill="#ff8a7a" opacity=".45" />
      <ellipse cx="122" cy="120" rx="6" ry="3.5" fill="#ff8a7a" opacity=".45" />
      {/* straw sun hat */}
      <ellipse cx="100" cy="72" rx="74" ry="16" fill="url(#pg-hat)" />
      <path d="M62 72c0-24 16-38 38-38s38 14 38 38z" fill="url(#pg-hat)" />
      <path d="M62.5 66h75" stroke="#cf3e2a" strokeWidth="7" />
      <path d="M40 74c20 8 100 8 120 0" fill="none" stroke="#b38a2a" strokeWidth="1.5" opacity=".6" />
    </svg>
  );
}
