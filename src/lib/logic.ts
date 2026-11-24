import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// Relative + ".js": api/contact.ts imports this file, and Vercel's Node ESM runtime needs real paths.
import { contact, site, type ContactChannel, type ContactReason } from "../content/site.js";

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
  reason: ContactReason | "";
  detail: string;
  timeline: string;
  name: string;
  email: string;
  company: string;
  message: string;
  channel: ContactChannel | "";
};

export const CONTACT_MAX = { name: 100, email: 254, message: 4000 } as const;

export function validateContact(d: Pick<ContactDraft, "name" | "email" | "message">) {
  const e: Partial<Record<"name" | "email" | "message", string>> = {};
  const name = d.name.trim();
  const email = d.email.trim();
  const message = d.message.trim();
  if (!name) e.name = "Add your name.";
  else if (name.length > CONTACT_MAX.name) e.name = `Keep it under ${CONTACT_MAX.name} characters.`;
  if (email.length > CONTACT_MAX.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Add an email I can reply to.";
  if (message.length < 20) e.message = "A few more words, please (20 characters minimum).";
  else if (message.length > CONTACT_MAX.message) e.message = `Keep it under ${CONTACT_MAX.message} characters.`;
  return e;
}

const reasonOf = (id: ContactDraft["reason"]) => contact.reasons.find((r) => r.id === id);

/** "Freelance project · Portfolio website · ASAP" */
export const contactReasonLine = (d: ContactDraft) => [reasonOf(d.reason)?.label ?? "Hello", d.detail, d.timeline].filter(Boolean).join(" · ");

/** "[Freelance · Portfolio website] Asha (Acme)". One line, safe for a mail header. */
export function contactSubject(d: ContactDraft) {
  const tag = [reasonOf(d.reason)?.tag ?? "Hello", d.detail, d.timeline].filter(Boolean).join(" · ");
  const who = d.company.trim() ? `${d.name.trim()} (${d.company.trim()})` : d.name.trim();
  return `[${tag}] ${who}`.replace(/[\r\n]+/g, " ");
}

/** Plain-text body shared by WhatsApp, the mailto fallback and the owner email. */
export function contactSummary(d: ContactDraft) {
  const meta = [`Reason: ${contactReasonLine(d)}`, d.company.trim() && `Company: ${d.company.trim()}`, d.email.trim() && `Reply to: ${d.email.trim()}`].filter(Boolean);
  return [...meta, "", d.message.trim()].join("\n");
}

export function contactMailto(to: string, d: ContactDraft) {
  return `mailto:${to}?subject=${encodeURIComponent(contactSubject(d))}&body=${encodeURIComponent(contactSummary(d))}`;
}

export function whatsappLink(number: string, d: ContactDraft) {
  const text = `Hi ${site.first}, I'm ${d.name.trim()}.\n\n${contactSummary(d)}`;
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

/** ?topic= value (old topic ids or a reason id) to [reason, preselected detail]. */
export function reasonFromParam(id: string | null): [ContactReason, string] | null {
  if (!id) return null;
  if (Object.hasOwn(contact.legacy, id)) return contact.legacy[id] ?? null;
  const r = contact.reasons.find((x) => x.id === id);
  return r ? [r.id, ""] : null;
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
