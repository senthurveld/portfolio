import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

const RM = "(prefers-reduced-motion: reduce)";
const FINE = "(hover: hover) and (pointer: fine)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(RM).matches;

function useMedia(query) {
  const [match, setMatch] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export const useReducedMotion = () => useMedia(RM);
export const useFinePointer = () => useMedia(FINE);

let lenis = null;
export const getLenis = () => lenis;

/** Lenis on desktop only, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function startSmoothScroll() {
  if (prefersReducedMotion() || !window.matchMedia(FINE).matches) return () => {};
  lenis = new Lenis({ autoRaf: false, lerp: 0.11 });
  lenis.on("scroll", ScrollTrigger.update);

  // While the page moves under a still cursor, the browser hit-tests and restyles hover states
  // every frame, and pointer effects (tilt, magnetic CTAs) fire for nothing. Switch pointer events
  // off for the content until scrolling has been still for 150ms. See [data-scrolling] in index.css.
  const root = document.documentElement;
  let idle;
  lenis.on("scroll", () => {
    if (!root.hasAttribute("data-scrolling")) root.setAttribute("data-scrolling", "");
    clearTimeout(idle);
    idle = setTimeout(() => root.removeAttribute("data-scrolling"), 150);
  });

  const tick = (t) => lenis.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    clearTimeout(idle);
    root.removeAttribute("data-scrolling");
    gsap.ticker.remove(tick);
    lenis.destroy();
    lenis = null;
  };
}

/** easeInOutQuart: the same curve as the --ease-in-out token, for a glide that starts at rest. */
const easeInOut = (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);
/** easeOutQuint: matches the --ease-out token, for a glide that arrives already moving. */
const easeOut = (t) => 1 - (1 - t) ** 5;

/** Jumps longer than this many screens skip the middle instead of painting every section on the way. */
const SKIP = 2;
/** How much of the trip, in screens, is still animated after the skip. */
const RUNWAY = 1.5;

/**
 * Glide to a section.
 * Short hops ease in and out over the whole distance. Long jumps (About → Contact is ~8,000px)
 * cut to RUNWAY screens before the target and decelerate in, so the browser never rasters the
 * heavy sections in between at full speed: that mid-flight painting was the stutter.
 * Moves focus to the section so the next Tab continues from there, and keeps the hash in sync.
 */
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = id === "top" ? 0 : Math.max(0, el.getBoundingClientRect().top + scrollY - 24);
  const from = lenis ? lenis.scroll : scrollY;
  const dist = top - from;
  const vh = innerHeight;
  const skip = Math.abs(dist) > SKIP * vh;
  const start = skip ? top - Math.sign(dist) * RUNWAY * vh : from;

  const glide = () =>
    lenis
      ? lenis.scrollTo(top, skip ? { duration: 0.9, easing: easeOut } : { duration: 0.55 + Math.sqrt(Math.abs(dist)) / 120, easing: easeInOut })
      : scrollTo({ top, behavior: "smooth" });

  if (prefersReducedMotion()) {
    scrollTo({ top, behavior: "auto" });
  } else if (skip) {
    if (lenis) lenis.scrollTo(start, { immediate: true });
    else scrollTo({ top: start, behavior: "auto" });
    // Let the cut paint first: rastering the new region would otherwise eat the glide's opening frames.
    requestAnimationFrame(() => requestAnimationFrame(glide));
  } else {
    glide();
  }

  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  history.replaceState(null, "", id === "top" ? location.pathname + location.search : `#${id}`);
}
