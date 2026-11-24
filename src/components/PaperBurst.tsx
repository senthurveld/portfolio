import { useEffect, useEffectEvent, useRef } from "react";
import { createPortal } from "react-dom";

// Party confetti: small rainbow paper pieces (rectangles and dots) spray up from the bottom edge of a box
// and fill it, then flutter down, flipping between a front and a darker back face. One canvas per burst.
// Callers skip it under prefers-reduced-motion.

const HUES = ["#FF4D4D", "#FF9F1C", "#FFD23F", "#3DDC84", "#2EC4F1", "#6C63FF", "#FF5DA2"];
const darker = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const k = 0.68;
  return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`;
};
const BACKS = HUES.map(darker);

const GRAVITY = 0.3; // px / frame²
const TERMINAL = 4.5; // paper falls slowly
const DRAG = 0.986; // per frame
const MAX_MS = 5000;
const FADE_MS = 800;
const STAGGER_MS = 180;
const TAU = Math.PI * 2;

/** The box to fill, in viewport coordinates (a DOMRect works). */
export type BurstOrigin = { left: number; top: number; width: number; height: number };

type Piece = {
  x: number; y: number; vx: number; vy: number;
  rot: number; vr: number; tilt: number; vt: number;
  w: number; h: number; round: boolean;
  front: string; back: string; phase: number; sway: number; delay: number;
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** Height a piece launched upward at speed v climbs before gravity + drag stop it (same integration as the frame loop, k = 1). */
const rise = (v: number) => {
  let y = 0;
  let vy = -v;
  while (vy < 0) {
    vy = vy * DRAG + GRAVITY;
    y -= vy;
  }
  return y;
};

/** Launch speed whose apex is ~h px above the start. */
const speedFor = (h: number) => {
  let v = 2;
  while (rise(v) < h && v < 60) v += 0.25;
  return v;
};

export function PaperBurst({ from, onDone }: { from: BurstOrigin; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const done = useEffectEvent(onDone);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return done();

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    const { left, top, width, height } = from;
    const bottom = top + height;
    const count = Math.max(90, Math.min(220, Math.round((width * height) / 2200)));

    const pieces: Piece[] = Array.from({ length: count }, (_, i) => {
      const round = Math.random() < 0.25;
      const s = round ? rnd(6, 9) : 0;
      const v = speedFor(height * rnd(0.08, 1));
      return {
        x: left + width * rnd(0.05, 0.95),
        y: bottom - rnd(0, 12),
        vx: rnd(-2.2, 2.2),
        vy: -v,
        rot: rnd(0, TAU),
        vr: rnd(-0.2, 0.2),
        tilt: rnd(0, TAU),
        vt: rnd(0.08, 0.22),
        w: round ? s : rnd(5, 9),
        h: round ? s : rnd(8, 14),
        round,
        front: HUES[i % HUES.length]!,
        back: BACKS[i % HUES.length]!,
        phase: rnd(0, TAU),
        sway: rnd(0.04, 0.09),
        delay: rnd(0, STAGGER_MS),
      };
    });

    let raf = 0;
    const start = performance.now();
    let last = start;

    const frame = (now: number) => {
      const k = Math.min(3, (now - last) / 16.667);
      last = now;
      const t = now - start;
      const drag = DRAG ** k;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = Math.max(0, Math.min(1, (MAX_MS - t) / FADE_MS));
      let alive = 0;

      for (const p of pieces) {
        if (t < p.delay) {
          alive++;
          continue;
        }
        p.vx *= drag;
        p.vy = Math.min(p.vy * drag + GRAVITY * k, TERMINAL);
        p.phase += p.sway * k;
        p.x += (p.vx + Math.sin(p.phase) * 0.6) * k;
        p.y += p.vy * k;
        p.rot += p.vr * k;
        p.tilt += p.vt * k;
        if (p.y > H + 40) continue;
        alive++;
        const c = Math.cos(p.rot);
        const sn = Math.sin(p.rot);
        const ct = Math.cos(p.tilt); // squash = the paper turning over
        ctx.setTransform(dpr * c, dpr * sn, -dpr * sn * ct, dpr * c * ct, dpr * p.x, dpr * p.y);
        ctx.fillStyle = ct >= 0 ? p.front : p.back;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, TAU);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
      }

      if (!alive || t > MAX_MS) return done();
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (!document.hidden) return;
      cancelAnimationFrame(raf);
      done();
    };
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [from]);

  // Portal: a transformed ancestor (page transitions, FadeIn) would trap position: fixed.
  return createPortal(<canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[150] h-full w-full" />, document.body);
}
