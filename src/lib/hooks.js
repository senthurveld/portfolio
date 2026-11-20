import { useEffect, useRef, useState } from "react";
import { gsap, useFinePointer, useReducedMotion } from "./motion";
import { site } from "../content/site";
import { toast } from "./toast";
import { onSoundChange, play, soundOn } from "./sound";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** IST clock string, "HH:MM". Minutes are enough; a seconds ticker is noise. */
export function useIstTime() {
  const [now, setNow] = useState(() => fmt.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(fmt.format(new Date())), 10_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Current sound preference, live. */
export function useSoundOn() {
  const [v, setV] = useState(soundOn);
  useEffect(() => onSoundChange(setV), []);
  return v;
}

/**
 * Section ref. [data-reveal] / [data-lines] children are revealed site-wide by GSAP in
 * lib/effects.js (one system, so CSS transitions never fight GSAP for the same properties).
 */
export function useReveal() {
  return useRef(null);
}

/** Pointer-follow tilt with a moving shine (--mx / --my). Fine pointers only. */
export function useTilt(max = 7) {
  const ref = useRef(null);
  const fine = useFinePointer();
  const rm = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || !fine || rm) return;
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 2 * max);
      rx(-(py - 0.5) * 2 * max);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [fine, rm, max]);
  return ref;
}

/** Copy email to clipboard with a toast; mailto when the clipboard is blocked. */
export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(site.email);
    play("tick");
    toast("Email copied");
  } catch {
    location.href = `mailto:${site.email}`;
  }
}
