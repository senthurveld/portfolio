import { useEffect, useEffectEvent, useRef } from "react";
import { createPortal } from "react-dom";

// "Paper party": two cannons fire flat confetti slips (flip between a front and a darker back face)
// and curly paper ribbons (fixed-length strips that twist as they fall). One canvas, mounted per burst.
// Callers skip it under prefers-reduced-motion.

const HUES = ["#FF4D4D", "#FF9F1C", "#FFD23F", "#3DDC84", "#2EC4F1", "#6C63FF", "#FF5DA2"];
const darker = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const k = 0.68;
  return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`;
};
const BACKS = HUES.map(darker);

const CONFETTI = 96;
const RIBBONS = 22;
const LINKS = 12; // points per ribbon
const LINK = 5; // px between points
const GRAVITY = 0.3;
const MAX_MS = 5000;
const FADE_MS = 800;
const TAU = Math.PI * 2;

export type BurstOrigin = { x: number; y: number; w: number };

type Slip = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; tilt: number; vt: number; w: number; h: number; front: string; back: string; phase: number; sway: number };
type Ribbon = { pts: { x: number; y: number }[]; vx: number; vy: number; twist: number; vt: number; front: string; back: string; phase: number; sway: number };

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

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

    // Left cannon aims up-left, right cannon up-right, from either side of the button.
    const launch = (i: number) => {
      const left = i % 2 === 0;
      const a = ((left ? -112 : -68) + rnd(-22, 22)) * (Math.PI / 180);
      const s = rnd(10, 17);
      return { x: from.x + (left ? -0.25 : 0.25) * from.w, y: from.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s };
    };

    const slips: Slip[] = Array.from({ length: CONFETTI }, (_, i) => ({
      ...launch(i),
      rot: rnd(0, TAU),
      vr: rnd(-0.2, 0.2),
      tilt: rnd(0, TAU),
      vt: rnd(0.08, 0.22),
      w: rnd(6, 11),
      h: rnd(10, 16),
      front: HUES[i % HUES.length]!,
      back: BACKS[i % HUES.length]!,
      phase: rnd(0, TAU),
      sway: rnd(0.04, 0.09),
    }));

    const ribbons: Ribbon[] = Array.from({ length: RIBBONS }, (_, i) => {
      const { x, y, vx, vy } = launch(i);
      return {
        pts: Array.from({ length: LINKS }, () => ({ x, y })),
        vx: vx * 0.85,
        vy: vy * 0.85,
        twist: rnd(0, TAU),
        vt: rnd(0.1, 0.2),
        front: HUES[i % HUES.length]!,
        back: HUES[(i + 1) % HUES.length]!, // two adjacent hues per ribbon
        phase: rnd(0, TAU),
        sway: rnd(0.03, 0.06),
      };
    });

    let raf = 0;
    const start = performance.now();
    let last = start;

    const frame = (now: number) => {
      const k = Math.min(3, (now - last) / 16.667);
      last = now;
      const t = now - start;
      const dragS = 0.986 ** k;
      const dragR = 0.975 ** k;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = Math.max(0, Math.min(1, (MAX_MS - t) / FADE_MS));
      let alive = 0;

      for (const s of slips) {
        s.vx *= dragS;
        s.vy = Math.min(s.vy * dragS + GRAVITY * k, 4.5); // paper has a low terminal speed
        s.phase += s.sway * k;
        s.x += (s.vx + Math.sin(s.phase) * 0.6) * k;
        s.y += s.vy * k;
        s.rot += s.vr * k;
        s.tilt += s.vt * k;
        if (s.y > H + 40) continue;
        alive++;
        const c = Math.cos(s.rot);
        const sn = Math.sin(s.rot);
        const ct = Math.cos(s.tilt); // squash = the slip turning over
        ctx.setTransform(dpr * c, dpr * sn, -dpr * sn * ct, dpr * c * ct, dpr * s.x, dpr * s.y);
        ctx.fillStyle = ct >= 0 ? s.front : s.back;
        ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      for (const r of ribbons) {
        r.vx *= dragR;
        r.vy = Math.min(r.vy * dragR + GRAVITY * k, 3.2);
        r.phase += r.sway * k;
        r.twist += r.vt * k;
        const head = r.pts[0]!;
        head.x += (r.vx + Math.sin(r.phase) * 1.4) * k;
        head.y += r.vy * k;
        // Follow the leader at a fixed spacing: the strip keeps its length and traces the head's path.
        for (let i = 1; i < LINKS; i++) {
          const p = r.pts[i]!;
          const q = r.pts[i - 1]!;
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.hypot(dx, dy) || 1;
          p.x = q.x + (dx / d) * LINK;
          p.y = q.y + (dy / d) * LINK;
        }
        if (Math.min(head.y, r.pts[LINKS - 1]!.y) > H + 40) continue;
        alive++;
        for (let i = 0; i < LINKS - 1; i++) {
          const a = r.pts[i]!;
          const b = r.pts[i + 1]!;
          const face = Math.cos(r.twist + i * 0.55); // width ripples along the strip = twisting paper
          ctx.lineWidth = 1 + 5 * Math.abs(face);
          ctx.strokeStyle = face >= 0 ? r.front : r.back;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
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
