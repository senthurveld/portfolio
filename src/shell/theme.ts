import { revealRadius } from "@/lib/logic";

export type Theme = "dark" | "light";
const KEY = "theme";

export const currentTheme = (): Theme => (document.documentElement.classList.contains("light") ? "light" : "dark");

function apply(t: Theme) {
  const html = document.documentElement;
  html.classList.toggle("light", t === "light");
  html.classList.toggle("dark", t === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#F4F5F6" : "#0C0C0C");
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* storage blocked: theme still applies for this page */
  }
  window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
}

let busy = false;

export function toggleTheme(x = innerWidth / 2, y = innerHeight / 2) {
  if (busy) return;
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) return apply(next);
  const html = document.documentElement;
  html.style.setProperty("--theme-x", `${x}px`);
  html.style.setProperty("--theme-y", `${y}px`);
  html.style.setProperty("--theme-r", `${revealRadius(x, y, innerWidth, innerHeight)}px`);
  busy = true;
  html.classList.add("theme-animating");
  const vt = document.startViewTransition(() => apply(next));
  vt.finished.finally(() => {
    html.classList.remove("theme-animating");
    busy = false;
  });
}

export function onThemeKey(e: KeyboardEvent) {
  if (e.key.toLowerCase() !== "d" || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
  const t = e.target as HTMLElement | null;
  if (t?.closest("input,textarea,select,[contenteditable='true']")) return;
  toggleTheme();
}
