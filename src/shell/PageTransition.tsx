import { useAnimate } from "motion/react-mini";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { preloadRoute } from "@/routes/load";
import { BLIND, BLINDS, blindDelay, ease } from "./blinds";
import { markCover } from "./intro";

const REVEAL_AT = 0.5;

export function PageTransition() {
  const [scope, animate] = useAnimate();
  const navigate = useNavigate();
  const busy = useRef(false);
  const { pathname } = useLocation();
  // navigate() commits in a React transition, so the new page can land well after the call.
  // Hold the cover until the router has committed the target path.
  const arrival = useRef<{ path: string; done: () => void } | null>(null);

  useEffect(() => {
    if (arrival.current?.path !== pathname) return;
    arrival.current.done();
    arrival.current = null;
  }, [pathname]);

  useEffect(() => {
    const blinds = (reveal: boolean) =>
      Promise.all(
        Array.from({ length: BLINDS }, (_, i) =>
          animate(
            `[data-blind="${i}"]`,
            { transform: reveal ? ["scaleY(1)", "scaleY(0)"] : ["scaleY(0)", "scaleY(1)"] },
            { duration: BLIND.duration, ease, delay: blindDelay(i, reveal) },
          ),
        ),
      );

    const onClick = async (e: MouseEvent) => {
      if (busy.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target || a.hasAttribute("download") || a.closest("[data-no-transition]")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      busy.current = true;
      const root = scope.current as HTMLElement;
      const line = root.querySelector<HTMLElement>("[data-line]")!;
      root.style.visibility = "visible";

      let loaded = false;
      const ready = preloadRoute(url.href).then(() => (loaded = true));
      await blinds(false);
      if (!loaded) {
        line.style.opacity = "1";
        await ready;
        line.style.opacity = "0";
      }

      const arrived = new Promise<void>((done) => (arrival.current = { path: url.pathname, done }));
      markCover(REVEAL_AT);
      navigate(url.pathname + url.search + url.hash);
      await arrived;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await blinds(true);
      root.style.visibility = "hidden";
      busy.current = false;
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [animate, navigate, scope]);

  return (
    <div ref={scope} aria-hidden="true" className="pointer-events-none invisible fixed inset-0 z-[200]">
      <div className="absolute inset-0 grid grid-cols-5">
        {Array.from({ length: BLINDS }, (_, i) => (
          <span key={i} data-blind={i} className="origin-top" style={{ background: "var(--menu-bg)", transform: "scaleY(0)" }} />
        ))}
      </div>
      <div
        className="absolute inset-0 grid place-items-center"
        style={{ "--home-fg": "var(--menu-fg)", "--home-line": "color-mix(in srgb, var(--menu-fg) 20%, transparent)" } as React.CSSProperties}
      >
        <span data-line className="load-line opacity-0 transition-opacity duration-300" />
      </div>
    </div>
  );
}
