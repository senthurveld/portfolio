import Lenis from "lenis";
import { FINE } from "@/lib/logic";
import { cancelFrame, frame } from "motion/react";
import {
  createContext,
  use,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

const LenisCtx = createContext<RefObject<Lenis | null>>({ current: null });
export const useLenis = () => use(LenisCtx);

const NAV_OFFSET = 96;

export function scrollToTarget(
  lenis: Lenis | null,
  target: number | HTMLElement,
  duration = 1.15,
) {
  if (lenis) return lenis.scrollTo(target, { duration });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top =
    typeof target === "number"
      ? target
      : target.getBoundingClientRect().top + scrollY - NAV_OFFSET;
  scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}

export function jumpToTop(lenis: Lenis | null) {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else scrollTo(0, 0);
}

// Lenis on fine pointers only; touch keeps native scroll.
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!matchMedia(FINE).matches) return;
    const l = new Lenis({
      autoRaf: false,
      lerp: 0.09,
      smoothWheel: true,
      anchors: true,
    });
    const tick = ({ timestamp }: { timestamp: number }) => l.raf(timestamp);
    frame.update(tick, true);
    lenis.current = l;
    return () => {
      cancelFrame(tick);
      l.destroy();
      lenis.current = null;
    };
  }, []);

  return <LenisCtx value={lenis}>{children}</LenisCtx>;
}
