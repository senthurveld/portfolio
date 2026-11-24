import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router";
import { FINE } from "@/lib/logic";

type Props = { children: ReactNode; padding?: number; strength?: number; maxPull?: number; className?: string };

export function Magnet({ children, padding = 56, strength = 4.5, maxPull = 14, className }: Props) {
  const el = useRef<HTMLSpanElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== "/" || !matchMedia(FINE).matches) return;
    const node = el.current!;
    let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0, active = false;
    const smooth = (t: number) => t * t * (3 - 2 * t);
    const move = (e: PointerEvent) => {
      const b = node.getBoundingClientRect();
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const reach = Math.hypot(b.width, b.height) / 2 + padding;
      const d = Math.hypot(dx, dy);
      active = d < reach;
      const f = active ? smooth(1 - d / reach) : 0;
      const clamp = (v: number) => Math.max(-maxPull, Math.min(maxPull, v));
      tx = clamp((dx / strength) * f);
      ty = clamp((dy / strength) * f);
      if (!raf) raf = requestAnimationFrame(step);
    };
    const step = () => {
      const [k, damp] = active ? [0.22, 0.62] : [0.16, 0.8];
      vx = (vx + (tx - x) * k) * damp;
      vy = (vy + (ty - y) * k) * damp;
      x += vx;
      y += vy;
      node.style.transform = `translate3d(${x}px,${y}px,0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) > 0.05 ? requestAnimationFrame(step) : 0;
    };
    addEventListener("pointermove", move, { passive: true });
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
      node.style.transform = "";
    };
  }, [pathname, padding, strength, maxPull]);

  return (
    <span ref={el} className={`inline-block will-change-transform ${className ?? ""}`}>
      {children}
    </span>
  );
}
