import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...v: ClassValue[]) => twMerge(clsx(v));

/** Non-empty and free of [BRACKET] placeholders, else null. */
export const real = (s: string | null | undefined): string | null =>
  typeof s === "string" && s.trim() && !/\[[^\]]*\]/.test(s) ? s : null;

export function navVisible(y: number, delta: number, current: boolean) {
  if (y < 48) return true;
  if (Math.abs(delta) < 8) return current;
  return delta < 0;
}

export const revealRadius = (x: number, y: number, w: number, h: number) =>
  Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

export function wrap(offset: number, half: number) {
  if (half <= 0) return 0;
  const m = offset % half;
  return m > 0 ? m - half : m === 0 ? 0 : m;
}

export function splitRows<T>(items: T[]): T[][] {
  if (items.length < 4) return [items];
  const k = Math.ceil(items.length / 2);
  return [items.slice(0, k), items.slice(k)];
}

export const stackScale = (i: number, n: number) => 1 - 0.04 * (n - 1 - i);
export const stackDim = (i: number, n: number) => Math.min(0.5, 0.16 * (n - 1 - i));

export type CursorMode = { mode: "default" | "link" | "label" | "text" | "hidden"; label?: string };

const LINKY = "a,button,[role=button],[role=tab],[role=switch],[role=checkbox],[role=menuitem],[role=option],select,summary,label[for]";

export function cursorModeFor(target: Element | null): CursorMode {
  if (!target) return { mode: "default" };
  if (target.closest("[data-cursor='none']")) return { mode: "hidden" };
  if (target.closest("input,textarea,[contenteditable='true']")) return { mode: "text" };
  const labelled = target.closest<HTMLElement>("[data-cursor]");
  const link = target.closest(LINKY);
  if (labelled && (!link || link === labelled || labelled.contains(link) === false)) return { mode: "label", label: labelled.dataset.cursor };
  if (link) return { mode: "link" };
  return { mode: "default" };
}

export type ContactDraft = {
  topic: string;
  looking: string;
  timeline: string;
  name: string;
  email: string;
  company: string;
  message: string;
};

export function validateContact(d: Pick<ContactDraft, "name" | "email" | "message">) {
  const e: Partial<Record<"name" | "email" | "message", string>> = {};
  if (!d.name.trim()) e.name = "Add your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.email = "Add an email I can reply to.";
  if (d.message.trim().length < 20) e.message = "A few more words, please (20 characters minimum).";
  return e;
}

export function contactMailto(to: string, d: ContactDraft) {
  const subject = [d.topic || "Hello", d.name].filter(Boolean).join(" — ");
  const meta = [
    d.looking && `Looking for: ${d.looking}`,
    d.timeline && `Timeline: ${d.timeline}`,
    d.company && `Company: ${d.company}`,
    d.email && `Reply to: ${d.email}`,
  ].filter(Boolean) as string[];
  const lines = meta.length ? [...meta, "", d.message] : [d.message];
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export function neighbours<T extends { slug: string }>(list: T[], slug: string) {
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0) return null;
  const at = (k: number) => list[(k + list.length) % list.length] as T;
  return { prev: at(i - 1), next: at(i + 1) };
}

export const istTime = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(d);

export const FINE = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 3D gate: WebGL2, no Save-Data, >= 4 cores and >= 4 GB.
export function canRun3D() {
  if (typeof window === "undefined" || typeof WebGL2RenderingContext === "undefined") return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if (nav.hardwareConcurrency < 4 || (nav.deviceMemory ?? 8) < 4) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}
