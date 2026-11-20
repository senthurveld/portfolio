import { prefersReducedMotion } from "./motion";

const apply = (dark) => {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    /* storage blocked: theme still applies for this visit */
  }
};

/** Circle wipe from (x, y) via a same-document View Transition; instant when unsupported or RM. */
export function toggleTheme(x = innerWidth / 2, y = 0) {
  const dark = !document.documentElement.classList.contains("dark");
  if (!document.startViewTransition || prefersReducedMotion()) {
    apply(dark);
    return;
  }
  const t = document.startViewTransition(() => apply(dark));
  t.ready.then(() => {
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 520, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}
