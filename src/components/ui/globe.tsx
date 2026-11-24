import type { COBEOptions, Marker } from "cobe";
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { cn, prefersReducedMotion } from "@/lib/logic";
import { currentTheme, type Theme } from "@/shell/theme";


type Palette = Pick<COBEOptions, "dark" | "baseColor" | "markerColor" | "glowColor" | "mapBrightness" | "diffuse">;
const palettes: Record<Theme, Palette> = {
  dark: { dark: 1, diffuse: 1.4, mapBrightness: 7, baseColor: [0.36, 0.4, 0.45], markerColor: [0.9, 0.94, 0.96], glowColor: [0.17, 0.19, 0.22] },
  light: { dark: 0, diffuse: 1.1, mapBrightness: 7, baseColor: [1, 0.99, 0.97], markerColor: [0.08, 0.09, 0.11], glowColor: [0.94, 0.91, 0.87] },
};

const phiFor = (lon: number) => Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2);
const TAU = Math.PI * 2;
const SPIN = 0.12;
const THETA_MIN = -0.35;
const THETA_MAX = 0.85;

export type GlobeHandle = { locate: () => void };

type Props = {
  className?: string;
  home: [number, number];
  markers?: Marker[];
  theta?: number;
  config?: Partial<COBEOptions>;
  ref?: Ref<GlobeHandle>;
};

export function Globe({ className, home, markers = [], theta: theta0 = 0.3, config, ref }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"idle" | "live" | "failed">("idle");
  const api = useRef<GlobeHandle>({ locate: () => {} });
  useImperativeHandle(ref, () => ({ locate: () => api.current.locate() }), []);

  const opts = useRef({ home, markers, config });
  useEffect(() => {
    opts.current = { home, markers, config };
  });

  useEffect(() => {
    const box = wrap.current;
    const el = canvas.current;
    if (!box || !el) return;
    const reduce = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const homePhi = phiFor(opts.current.home[1]);

    let globe: { toggle: (on: boolean) => void; destroy: () => void } | null = null;
    let alive = true;
    let visible = false;
    let size = box.offsetWidth;
    let palette = palettes[currentTheme()];
    let phi = homePhi;
    let theta = theta0;
    let vPhi = 0;
    let target: number | null = null;
    let drag: { x: number; y: number; phi: number; theta: number; lastX: number; t: number } | null = null;
    let idleAt = performance.now();
    let wake = performance.now();
    let last = performance.now();

    let running = false;
    const run = (on: boolean) => {
      const want = on && visible && !document.hidden;
      if (!globe || want === running) return;
      running = want;
      globe.toggle(want);
    };
    const poke = () => {
      wake = performance.now();
      run(true);
    };

    api.current.locate = () => {
      target = phi + ((((homePhi - phi) % TAU) + TAU + Math.PI) % TAU) - Math.PI;
      vPhi = 0;
      poke();
    };

    const onRender = (s: Record<string, unknown>) => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (!drag) {
        if (target !== null) {
          phi += (target - phi) * (1 - Math.exp(-dt * 5));
          if (Math.abs(target - phi) < 0.001) {
            target = null;
            idleAt = now + 2500;
          }
        } else if (Math.abs(vPhi) > 0.0005) {
          phi += vPhi;
          vPhi *= reduce ? 0 : 0.95;
        } else if (!reduce && now > idleAt) {
          phi += SPIN * dt;
        }
      }
      const { home: h, markers: extra, config: c } = opts.current;
      const pulse = reduce ? 0 : (Math.sin(now / 420) + 1) * 0.012;
      Object.assign(s, palette, c, {
        phi,
        theta,
        width: size * dpr,
        height: size * dpr,
        markers: [{ location: h, size: 0.055 + pulse }, ...extra],
      });
      if (reduce && !drag && target === null && now - wake > 800) requestAnimationFrame(() => run(false));
    };

    const start = async () => {
      const { default: createGlobe } = await import("cobe");
      if (!alive) return;
      try {
        globe = createGlobe(el, {
          devicePixelRatio: dpr,
          width: size * dpr,
          height: size * dpr,
          phi,
          theta,
          mapSamples: matchMedia("(pointer: coarse)").matches ? 12000 : 16000,
          markers: [{ location: opts.current.home, size: 0.055 }, ...opts.current.markers],
          opacity: 0.92,
          ...palette,
          ...opts.current.config,
          onRender,
        });
      } catch {
        setState("failed");
        return;
      }
      el.addEventListener("webglcontextlost", () => setState("failed"), { once: true });
      running = true;
      setState("live");
      run(true);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = !!e?.isIntersecting;
        if (!visible) return run(false);
        if (globe) poke();
        else void start();
      },
      { rootMargin: "150px 0px" },
    );
    io.observe(box);

    const ro = new ResizeObserver(() => {
      size = box.offsetWidth;
      poke();
    });
    ro.observe(box);

    const onTheme = () => {
      palette = palettes[currentTheme()];
      poke();
    };
    const onVis = () => !document.hidden && poke();
    addEventListener("themechange", onTheme);
    document.addEventListener("visibilitychange", onVis);

    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, phi, theta, lastX: e.clientX, t: performance.now() };
      target = null;
      vPhi = 0;
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "";
      poke();
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      phi = drag.phi + (e.clientX - drag.x) / 200;
      theta = Math.min(THETA_MAX, Math.max(THETA_MIN, drag.theta + (e.clientY - drag.y) / 300));
      const now = performance.now();
      vPhi = ((e.clientX - drag.lastX) / 200) * (16 / Math.max(now - drag.t, 1));
      drag.lastX = e.clientX;
      drag.t = now;
    };
    const up = () => {
      if (!drag) return;
      if (performance.now() - drag.t > 80) vPhi = 0;
      drag = null;
      idleAt = performance.now() + 1200;
      delete el.dataset.dragging;
      poke();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);

    return () => {
      alive = false;
      io.disconnect();
      ro.disconnect();
      removeEventListener("themechange", onTheme);
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      globe?.destroy();
    };
  }, [theta0]);

  if (state === "failed") return null;
  return (
    <div ref={wrap} aria-hidden="true" className={cn("aspect-square", className)}>
      <canvas
        ref={canvas}
        className={cn(
          "size-full cursor-grab touch-pan-y opacity-0 transition-opacity duration-1000 [contain:layout_paint_size] data-[dragging]:cursor-grabbing",
          state === "live" && "opacity-100",
        )}
      />
    </div>
  );
}
