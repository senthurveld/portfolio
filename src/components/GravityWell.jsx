import { useEffect, useRef, useState } from "react";
import { stack } from "../content/site";
import { gsap, useReducedMotion } from "../lib/motion";
import { play } from "../lib/sound";

const items = stack.slice(0, 12);

/** Kick every pebble away from the well; closer ones fly harder. */
function burst(s) {
  for (const b of s.bodies) {
    const dx = b.x - s.well.x;
    const dy = b.y - s.well.y;
    const d = Math.hypot(dx, dy) || 1;
    const kick = 6 + 16 * (1 - Math.min(d, 260) / 260);
    b.vx += (dx / d) * kick + (Math.random() - 0.5) * 3;
    b.vy += (dy / d) * kick + (Math.random() - 0.5) * 3;
  }
}

/**
 * The tools I build with, as clay pebbles in a gravity well.
 * The well follows the pointer; hold to pull everything in, let go to scatter.
 * Plain circle physics on the GSAP ticker, paused off-screen and in hidden tabs.
 */
export default function GravityWell() {
  const rm = useReducedMotion();
  const stage = useRef(null);
  const ring = useRef(null);
  const els = useRef([]);
  const sim = useRef(null);
  const [base, setBase] = useState(0); // pebble diameter for r = 1
  const [pulling, setPulling] = useState(false);

  // Size pebbles to the stage.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width: w, height: h } = e.contentRect;
      setBase(Math.round(Math.max(54, Math.min(84, w * 0.13, h * 0.21))));
      if (sim.current) Object.assign(sim.current, { w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Physics loop.
  useEffect(() => {
    const el = stage.current;
    if (rm || !el || !base) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const s = {
      w,
      h,
      well: { x: w / 2, y: h / 2, tx: w / 2, ty: h / 2 },
      hover: false,
      pull: false,
      t: 0,
      bodies: items.map((it, i) => {
        // Start scattered on a wide ring, so the first thing you see is them being drawn in.
        const a = (i / items.length) * Math.PI * 2 + 0.4;
        const r = (base * it.r) / 2;
        return { x: w / 2 + Math.cos(a) * w * 0.42, y: h / 2 + Math.sin(a) * h * 0.4, vx: 0, vy: 0, r };
      }),
    };
    sim.current = s;

    const tick = (_, dt) => {
      const f = Math.min(dt / 16.67, 2);
      s.t += dt;
      const { well, bodies } = s;
      if (!s.hover && !s.pull) {
        // Idle: the well wanders a small orbit around the centre.
        well.tx = s.w / 2 + Math.cos(s.t * 0.0005) * s.w * 0.09;
        well.ty = s.h / 2 + Math.sin(s.t * 0.0007) * s.h * 0.08;
      }
      well.x += (well.tx - well.x) * 0.18 * f;
      well.y += (well.ty - well.y) * 0.18 * f;
      const k = s.pull ? 0.9 : s.hover ? 0.22 : 0.12;

      for (const b of bodies) {
        const dx = well.x - b.x;
        const dy = well.y - b.y;
        const d = Math.hypot(dx, dy) + 0.001;
        const a = Math.min(k * (d / 50), k * 3.5);
        b.vx = (b.vx + (dx / d) * a * f) * Math.pow(s.pull ? 0.86 : 0.93, f);
        b.vy = (b.vy + (dy / d) * a * f) * Math.pow(s.pull ? 0.86 : 0.93, f);
        b.x += b.vx * f;
        b.y += b.vy * f;
      }

      // Collisions (two passes is plenty for a dozen bodies).
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            const p = bodies[i];
            const q = bodies[j];
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const d = Math.hypot(dx, dy) || 0.01;
            const min = p.r + q.r + 2;
            if (d >= min) continue;
            const nx = dx / d;
            const ny = dy / d;
            const push = (min - d) / 2;
            p.x -= nx * push;
            p.y -= ny * push;
            q.x += nx * push;
            q.y += ny * push;
            const vn = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
            if (vn < 0) {
              const j2 = (-1.45 * vn) / 2;
              p.vx -= j2 * nx;
              p.vy -= j2 * ny;
              q.vx += j2 * nx;
              q.vy += j2 * ny;
            }
          }
        }
      }

      bodies.forEach((b, i) => {
        if (b.x < b.r) (b.x = b.r), (b.vx = Math.abs(b.vx) * 0.5);
        if (b.x > s.w - b.r) (b.x = s.w - b.r), (b.vx = -Math.abs(b.vx) * 0.5);
        if (b.y < b.r) (b.y = b.r), (b.vy = Math.abs(b.vy) * 0.5);
        if (b.y > s.h - b.r) (b.y = s.h - b.r), (b.vy = -Math.abs(b.vy) * 0.5);
        const n = els.current[i];
        if (n) n.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`;
      });
      if (ring.current) ring.current.style.transform = `translate3d(${well.x}px, ${well.y}px, 0)`;
    };

    // Run only while the stage is on screen and the tab is visible.
    let visible = false;
    let running = false;
    const sync = () => {
      const want = visible && !document.hidden;
      if (want === running) return;
      running = want;
      if (want) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    };
    const io = new IntersectionObserver(([e]) => ((visible = e.isIntersecting), sync()));
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      gsap.ticker.remove(tick);
      sim.current = null;
    };
  }, [rm, base]);

  const local = (ev) => {
    const r = stage.current.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  };
  const aim = (ev) => {
    const s = sim.current;
    if (!s) return;
    const p = local(ev);
    s.well.tx = p.x;
    s.well.ty = p.y;
    s.hover = true;
  };
  const pull = (on) => {
    const s = sim.current;
    if (!s || s.pull === on) return;
    s.pull = on;
    setPulling(on);
    if (on) return play("tick");
    scatter();
  };
  const scatter = () => {
    const s = sim.current;
    if (!s) return;
    s.pull = false;
    setPulling(false);
    burst(s);
    play("pop");
  };

  return (
    <div className="clay-lg relative overflow-hidden p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 px-2 pb-3 pt-1">
        <span className="label text-[10.5px]">What I build with</span>
        <span className="label hidden text-[10.5px] sm:block">{rm ? "Motion paused" : "Hold to pull · let go to scatter"}</span>
      </div>

      <div
        ref={stage}
        onPointerMove={aim}
        onPointerDown={(ev) => {
          if (rm) return;
          aim(ev);
          ev.currentTarget.setPointerCapture(ev.pointerId);
          pull(true);
        }}
        onPointerUp={() => pull(false)}
        onPointerCancel={() => pull(false)}
        onPointerLeave={() => sim.current && (sim.current.hover = false)}
        className={`dot-grid well relative h-[330px] touch-pan-y select-none overflow-hidden rounded-[22px] sm:h-[380px] lg:h-[400px] ${rm ? "" : pulling ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {!rm && (
          <span
            ref={ring}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-0 w-0"
            style={{ transform: "translate3d(-200px, -200px, 0)" }}
          >
            <span className={`absolute -left-20 -top-20 h-40 w-40 rounded-full border border-dashed transition-[scale,border-color] duration-500 ease-[var(--ease-out)] ${pulling ? "scale-[0.55] border-red/60" : "border-ink/25"}`}>
              <span className="absolute inset-[38%] rounded-full bg-ink/10" />
            </span>
          </span>
        )}

        <ul aria-label="Tools I build with" className={rm ? "flex h-full flex-wrap content-center justify-center gap-2.5 p-6" : ""}>
          {items.map((it, i) => (
            <li
              key={it.id}
              ref={(n) => (els.current[i] = n)}
              className={`clay-pastel grid place-items-center rounded-full text-center font-display font-semibold leading-none tracking-[-0.02em] ${rm ? "px-4 py-3 text-[14px]" : "absolute left-0 top-0 will-change-transform"}`}
              style={{
                background: `var(--${it.tone})`,
                ...(rm ? null : { width: base * it.r, height: base * it.r, fontSize: Math.max(11, base * it.r * 0.17), transform: "translate3d(-200px, -200px, 0)" }),
              }}
            >
              {it.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-1 pb-1 pt-4">
        <p className="text-[13px] text-muted">The stack behind every client site.</p>
        {!rm && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => pull(!pulling)} aria-pressed={pulling} className="btn btn-secondary min-h-9 px-3.5 text-[13px]">
              {pulling ? "Release" : "Pull in"}
            </button>
            <button type="button" onClick={scatter} className="btn btn-secondary min-h-9 px-3.5 text-[13px]">
              Scatter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
