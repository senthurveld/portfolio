# 001 — Replace ribbon streamers with rainbow paper confetti that fills the contact form box

- **Status**: DONE (applied; manual feel check pending)
- **Commit**: 75c6aa6
- **Severity**: LOW
- **Category**: Missed opportunities (delight moment, rare: fires once per successful contact send)
- **Estimated scope**: 2 files — `src/components/PaperBurst.tsx` (rewrite, ~150 lines), `src/routes/Contact.tsx` (3 lines)

## Problem

The send celebration fires two "cannons" from the send button and mixes flat slips with long,
fixed-length curly ribbons. The owner wants the classic party-confetti look instead: only small
rainbow paper pieces, spraying so they fill the **whole contact form card**, not a narrow jet from the button.

```tsx
// src/components/PaperBurst.tsx:16-19 — current
const CONFETTI = 96;
const RIBBONS = 22;
const LINKS = 12; // points per ribbon
const LINK = 5; // px between points
```

```tsx
// src/components/PaperBurst.tsx:47-53 — current: launches from either side of the button only
const launch = (i: number) => {
  const left = i % 2 === 0;
  const a = ((left ? -112 : -68) + rnd(-22, 22)) * (Math.PI / 180);
  const s = rnd(10, 17);
  return { x: from.x + (left ? -0.25 : 0.25) * from.w, y: from.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s };
};
```

```tsx
// src/routes/Contact.tsx:234-236 — current: origin is the send / WhatsApp button
const r = (waRef.current ?? sendRef.current)?.getBoundingClientRect();
setTearing(true);
if (r) setTimeout(() => setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }), 60);
```

## Target

- No ribbons at all. Only small paper pieces: ~75% rectangles (5–9 × 8–14 px), ~25% small circles
  (radius 3–4.5 px). Same 7 rainbow hues as today, each piece flips between its hue and a darker back face.
- Origin is the **form card's rect** (`left, top, w, h`). Pieces launch from random points along the
  card's bottom edge (5%–95% of the width), mostly straight up with a small sideways spread, with
  launch speed solved so each piece's apex lands between 8% and 100% of the card height above the
  bottom edge. Result: the card fills top-to-bottom, edge-to-edge, then the paper flutters down through it.
- A small stagger: each piece launches after a random delay of 0–180 ms (spray, not a single pop).
- Piece count scales with card area: `clamp(round(w * h / 2200), 90, 220)`.
- Physics constants (keep): gravity `0.3` px/frame², paper terminal speed `4.5` px/frame, per-frame drag
  `0.986`, sway `rnd(0.04, 0.09)` rad/frame with ±0.6 px horizontal flutter, max life `5000 ms`, fade over the
  last `800 ms`. Frame-rate independence via `k = min(3, dt / 16.667)` (keep).
- Reduced motion: unchanged — the caller (`Contact.tsx:233`) already returns before mounting the burst.

### Target file — replace the entire contents of `src/components/PaperBurst.tsx` with:

```tsx
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
```

### Target — `src/routes/Contact.tsx` lines 220 and 234–236 become:

```tsx
  // Slip tears off, button pops, confetti fills the form card, then the success card prints in.
```

```tsx
    const r = formRef.current?.getBoundingClientRect();
    setTearing(true);
    if (r) setTimeout(() => setBurst({ left: r.left, top: r.top, width: r.width, height: r.height }), 60);
```

## Repo conventions to follow

- Canvas confetti already lives in `src/components/PaperBurst.tsx` and is portaled to `document.body`
  with `pointer-events-none fixed inset-0 z-[150]` — keep that exactly (the portal comment explains why).
- `useEffectEvent(onDone)` pattern for the completion callback (current `PaperBurst.tsx:34`) — keep.
- Reduced motion is handled by the caller: `Contact.tsx:233` `if (reduce) return done();` — do not add a second check.
- Code style: 2-space indent, double quotes, trailing commas, `!` non-null on array index reads (`noUncheckedIndexedAccess` is on).

## Steps

1. Replace the entire contents of `src/components/PaperBurst.tsx` with the target file above, verbatim.
   (Prettier may reflow the `Piece` type onto one line per field — that is fine.)
2. In `src/routes/Contact.tsx`, replace the comment on line 220
   `// Slip tears off, button pops, paper bursts from the button, then the success card prints in.`
   with
   `// Slip tears off, button pops, confetti fills the form card, then the success card prints in.`
3. In `src/routes/Contact.tsx`, replace lines 234–236 (shown in Problem) with the three target lines above.
   `formRef` already exists (`Contact.tsx:173`, `useRef<HTMLFormElement>(null)`, attached to the `<form>` at line 333).
4. Search the repo for other uses of `BurstOrigin` or `PaperBurst` (`src/**`). Only `Contact.tsx` is expected.
   If another caller exists, STOP and report — do not guess its new origin.
5. If `src/test/components.test.tsx` references the old `{ x, y, w }` shape, update only that shape to
   `{ left, top, width, height }`; change nothing else in tests.

## Boundaries

- Do NOT touch any file other than `src/components/PaperBurst.tsx`, `src/routes/Contact.tsx`, and (only per step 5) `src/test/components.test.tsx`.
- Do NOT change the tear / button-pop / success-card animations, their timings (60 ms, 380 ms), or the toast.
- Do NOT add dependencies (no canvas-confetti etc.).
- Do NOT commit.
- If the code at the cited lines differs from the excerpts (drift since commit 75c6aa6), STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` → exit 0. `npx eslint src/components/PaperBurst.tsx src/routes/Contact.tsx` → no errors. `npm test` → all pass (one skipped mail smoke test is expected).
- **Feel check**: `npm run dev`, open `/contact`, complete all three steps, send (Email, or WhatsApp if enabled):
  - Confetti rises from along the whole bottom edge of the form card and reaches its top edge — the card looks *full* of paper at ~0.6–0.9 s, not a jet from the button.
  - No long ribbons/streamers anywhere; only small rectangles and dots in the 7 rainbow hues, visibly flipping (colour darkens as they turn).
  - Pieces flutter down slowly (terminal ~4.5 px/frame), drift side to side, and the canvas fades out by 5 s.
  - On a phone-width viewport (375 px) the spray still spans the card edge to edge with ≥ 90 pieces.
  - DevTools → Rendering → emulate `prefers-reduced-motion: reduce`: no confetti at all, success card still appears.
  - Performance panel: no long frames during the burst at 220 pieces on a mid laptop.
- **Done when**: the three steps above are applied, mechanical checks pass, and the feel check shows a card-filling rainbow confetti spray with zero ribbons.
