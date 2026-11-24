import { useEffect, useRef } from "react";
import { cursorModeFor, FINE, type CursorMode } from "@/lib/logic";

const RING = 38.4;
const LINK = 57.6;
const LABEL = 92;
const PAD = 12;
const CONTROL = "a,button,[role=button],summary,label[for]";
const EPS = 0.05;

const ease = (k: number, dt: number) => 1 - Math.pow(1 - k, dt / 16.667);

// Perf: rAF loop sleeps once landed; DOM writes only on change. Fine pointer + motion-OK only.
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mq = matchMedia(FINE);
    if (!mq.matches) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const d = dot.current!,
      r = ring.current!,
      lb = label.current!;
    const layer = r.parentElement!;
    const rs = r.style,
      ds = d.style;

    let tx = -100,
      ty = -100,
      x = tx,
      y = ty,
      w = RING,
      h = RING,
      rad = RING / 2;
    let ww = -1,
      wh = -1,
      wr = -1,
      wdx = NaN,
      wdy = NaN;
    let stretch = 0,
      angle = 0,
      last = 0;
    let mode: CursorMode = { mode: "default" };
    let overTarget: Element | null = null;
    let hugEl: Element | null = null;
    let hugRadius = 0;
    let shown = false,
      pressed = false,
      recheck = false,
      raf = 0;

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const setMode = (target: Element | null) => {
      overTarget = target;
      const m = cursorModeFor(target);
      mode = m;
      hugEl = null;
      if (m.mode === "link" && target) {
        const ctl = target.closest(CONTROL);
        if (ctl && !ctl.closest("[data-cursor-nohug]")) {
          const b = ctl.getBoundingClientRect();
          if (b.width <= 360 && b.height <= 96) {
            hugEl = ctl;
            hugRadius = b.height / 2;
          }
        }
      }
      const text = m.mode === "label" ? (m.label ?? "") : "";
      if (lb.textContent !== text) lb.textContent = text;
      const dm = hugEl ? "hug" : m.mode;
      if (r.dataset.mode !== dm) r.dataset.mode = dm;
      const op = hugEl || m.mode === "text" || m.mode === "hidden" || m.mode === "label" ? "0" : "1";
      if (ds.opacity !== op) ds.opacity = op;
      wake();
    };

    const show = () => {
      shown = true;
      layer.style.opacity = "1";
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        x = tx;
        y = ty;
        show();
      }
      wake();
    };
    const over = (e: PointerEvent) => {
      if (e.target !== overTarget) setMode(e.target as Element);
    };
    const scrolled = () => {
      if (!shown) return;
      recheck = true;
      wake();
    };
    const down = () => {
      pressed = true;
      wake();
    };
    const up = () => {
      pressed = false;
      wake();
    };
    const hide = () => {
      shown = false;
      layer.style.opacity = "0";
    };

    const loop = (now: number) => {
      raf = 0;
      const dt = Math.min(64, Math.max(1, now - last));
      last = now;
      if ((recheck && shown) || (hugEl && !hugEl.isConnected)) {
        recheck = false;
        const el = document.elementFromPoint(tx, ty);
        if (el !== overTarget || (hugEl && !hugEl.isConnected)) setMode(el);
        raf = 0;
      }

      if (tx !== wdx || ty !== wdy) {
        wdx = tx;
        wdy = ty;
        ds.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`;
      }

      let tw = RING,
        th = RING,
        tr = RING / 2,
        cx = tx,
        cy = ty,
        k = 0.22;
      if (hugEl) {
        const b = hugEl.getBoundingClientRect();
        tw = b.width + PAD;
        th = b.height + PAD;
        tr = hugRadius + PAD / 2;
        const mx = b.left + b.width / 2,
          my = b.top + b.height / 2;
        cx = mx + (tx - mx) * 0.08;
        cy = my + (ty - my) * 0.08;
        k = 0.3;
      } else if (mode.mode === "link") {
        tw = th = LINK;
        tr = LINK / 2;
      } else if (mode.mode === "label") {
        tw = th = LABEL;
        tr = LABEL / 2;
      } else if (mode.mode === "text") {
        tw = 2;
        th = 25.6;
        tr = 2;
      }

      const f = ease(k, dt),
        fs = ease(0.26, dt);
      const vx = (cx - x) * f,
        vy = (cy - y) * f;
      x += vx;
      y += vy;
      w += (tw - w) * fs;
      h += (th - h) * fs;
      rad += (tr - rad) * fs;
      const dist = Math.hypot(vx, vy) * (16.667 / dt);
      const target = hugEl || mode.mode !== "default" ? 0 : Math.min(dist / 140, 0.55) * 4;
      stretch += (Math.max(-0.2, Math.min(0.6, target)) - stretch) * ease(0.22, dt);
      if (dist > 0.5) angle = Math.atan2(vy, vx);

      const settled =
        Math.abs(cx - x) < EPS &&
        Math.abs(cy - y) < EPS &&
        Math.abs(tw - w) < EPS &&
        Math.abs(th - h) < EPS &&
        Math.abs(tr - rad) < EPS &&
        Math.abs(stretch) < 0.002;
      if (settled) {
        x = cx;
        y = cy;
        w = tw;
        h = th;
        rad = tr;
        stretch = 0;
      }

      const nw = Math.round(w * 10) / 10,
        nh = Math.round(h * 10) / 10,
        nr = Math.round(rad * 10) / 10;
      if (nw !== ww) rs.width = `${(ww = nw)}px`;
      if (nh !== wh) rs.height = `${(wh = nh)}px`;
      if (nr !== wr) rs.borderRadius = `${(wr = nr)}px`;

      const s = pressed ? 0.86 : 1;
      rs.transform =
        stretch === 0
          ? `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${s})`
          : `translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${angle}rad) scale(${(1 + stretch) * s},${(1 - 0.45 * stretch) * s}) rotate(${-angle}rad)`;

      if (!settled || (hugEl && shown)) raf = requestAnimationFrame(loop);
    };

    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", over, { passive: true });
    addEventListener("scroll", scrolled, { passive: true, capture: true });
    addEventListener("pointerdown", down, { passive: true });
    addEventListener("pointerup", up, { passive: true });
    addEventListener("blur", hide);
    html.addEventListener("mouseleave", hide);
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("has-cursor");
      removeEventListener("pointermove", move);
      removeEventListener("pointerover", over);
      removeEventListener("scroll", scrolled, { capture: true });
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      removeEventListener("blur", hide);
      html.removeEventListener("mouseleave", hide);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2147483000] opacity-0 transition-opacity duration-300 [contain:strict] [@media(not_((hover:hover)_and_(pointer:fine)))]:hidden"
    >
      <div
        ref={dot}
        className="fixed top-0 left-0 size-[0.36rem] rounded-full bg-white mix-blend-difference transition-opacity duration-200 will-change-transform"
      />
      <div
        ref={ring}
        data-mode="default"
        className="fixed top-0 left-0 grid place-items-center border-[1.5px] border-white/90 mix-blend-difference transition-[background-color,border-color,opacity] duration-300 ease-[var(--ease-house)] will-change-transform data-[mode=hidden]:opacity-0 data-[mode=hug]:border-white/75 data-[mode=hug]:bg-white/[0.06] data-[mode=label]:border-0 data-[mode=label]:bg-[#f4f7f9] data-[mode=label]:mix-blend-normal data-[mode=link]:bg-white/[0.12] data-[mode=text]:border-0 data-[mode=text]:bg-white"
      >
        <span
          ref={label}
          className="text-[0.72rem] font-bold tracking-[0.16em] text-[#0c0c0c] uppercase"
        />
      </div>
    </div>
  );
}
