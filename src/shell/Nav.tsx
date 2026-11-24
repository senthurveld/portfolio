import { m, useMotionValueEvent, useScroll } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { navVisible } from "@/lib/logic";
import { useIntroReady } from "./intro";
import { MenuButton } from "./MenuButton";

const Menu = lazy(() => import("./Menu").then((mod) => ({ default: mod.Menu })));
import { scrollToTarget, useLenis } from "./scroll";

const zyd = [
  "M10 27C17 22 27 22 34 24C27 32 19 39 12 46C21 44 30 44 38 47", // z
  "M47 24C48 36 52 45 60 44C66 43 69 34 70 23C70 40 70 52 66 60C62 67 52 66 50 60", // y
  "M104 30C100 24 86 23 82 34C79 44 88 49 96 46C101 44 104 40 104 34", // d bowl
  "M104 8C104 22 104 38 107 48C109 52 113 52 114 47", // d stem, flicks up into a swash
  "M10 27C7 29 5 26 6 23", // z head curls back
  "M24 45.5C24 50 23 54 24.5 57", // melted drip off the z base
  "M88 47.5C88 51 89 53 88.5 55", // drip under the d bowl
].join("");
const sparkle = "M116 4L117 8L121 9L117 10L116 14L115 10L111 9L115 8Z";

function Wordmark() {
  return (
    <svg viewBox="0 0 122 76" aria-hidden="true" className="h-[2.375rem] w-auto" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="zyd-chrome" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="74">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.3" stopColor="#c9cdd3" />
          <stop offset="0.46" stopColor="#5d626a" />
          <stop offset="0.52" stopColor="#1b1e23" />
          <stop offset="0.64" stopColor="#8e949c" />
          <stop offset="0.82" stopColor="#eef0f2" />
          <stop offset="1" stopColor="#7f858d" />
        </linearGradient>
        <filter id="zyd-inflate" x="-10%" y="-10%" width="120%" height="130%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="bump" />
          <feDiffuseLighting in="bump" surfaceScale="5" diffuseConstant="1.1" lightingColor="#fff" result="shade">
            <feDistantLight azimuth="235" elevation="58" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="shade" operator="arithmetic" k1="1.15" result="lit" />
          <feSpecularLighting in="bump" surfaceScale="5" specularConstant="1.3" specularExponent="30" lightingColor="#fff" result="glint">
            <feDistantLight azimuth="235" elevation="42" />
          </feSpecularLighting>
          <feComposite in="glint" in2="SourceAlpha" operator="in" result="glintIn" />
          <feComposite in="glintIn" in2="lit" operator="arithmetic" k2="1" k3="1" result="chrome" />
          <feDropShadow in="chrome" dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#zyd-inflate)">
        <path d={zyd} stroke="#15171b" strokeWidth="15" />
        <path d={zyd} stroke="url(#zyd-chrome)" strokeWidth="12" />
      </g>
      <path d={zyd} stroke="#fff" strokeWidth="2" strokeOpacity="0.75" transform="translate(-1 -2)" />
      <path d={sparkle} fill="#fff" stroke="none" />
    </svg>
  );
}

export function Nav() {
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const ready = useIntroReady();
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();
  const [entered, setEntered] = useState(false);
  const [menuWanted, setMenuWanted] = useState(false);

  useEffect(() => {
    let idle = 0;
    const want = () => setMenuWanted(true);
    const start = () => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(want, { timeout: 3000 }) : window.setTimeout(want, 1500);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, []);

  const placeholder = (
    <MenuButton
      aria-label="Open menu"
      data-state="closed"
      onPointerEnter={() => setMenuWanted(true)}
      onFocus={() => setMenuWanted(true)}
      onClick={() => {
        setMenuWanted(true);
        setOpen(true);
      }}
    />
  );

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setShown((cur) => open || navVisible(y, y - prev, cur));
    setScrolled(y > 24);
  });

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-4 sm:pt-5 md:pt-6">
      <m.div
        className="shell"
        initial={{ y: "-140%", opacity: 0 }}
        animate={
          !ready
            ? undefined
            : shown
              ? { y: 0, opacity: 1 }
              : { y: "calc(-100% - 1.25rem)", opacity: 1 }
        }
        transition={
          shown
            ? { duration: entered ? 0.75 : 1.2, ease: [0.22, 1, 0.36, 1], delay: entered ? 0 : 0.5 }
            : { duration: 0.65, ease: [0.4, 0, 0.2, 1] }
        }
        onAnimationComplete={() => ready && setEntered(true)}
      >
        <nav
          aria-label="Primary"
          className="pointer-events-auto flex items-center justify-between rounded-full border py-2 pr-2 pl-5 backdrop-blur-md transition-[box-shadow,border-color] duration-300 md:pl-6"
          style={{
            background: "var(--nav-bg)",
            borderColor: "var(--nav-border)",
            boxShadow: scrolled ? "var(--nav-shadow)" : "var(--nav-rest)",
            color: "var(--nav-fg)",
          }}
        >
          <Link
            to="/"
            className="flex min-h-10 items-center rounded-full"
            aria-label="zyd, home"
            onClick={(e) => {
              if (pathname !== "/") return;
              e.preventDefault();
              if (hash) navigate("/", { replace: true });
              scrollToTarget(lenis.current, 0);
            }}
          >
            <Wordmark />
          </Link>
          {menuWanted ? (
            <Suspense fallback={placeholder}>
              <Menu open={open} onOpenChange={setOpen} />
            </Suspense>
          ) : (
            placeholder
          )}
        </nav>
      </m.div>
    </header>
  );
}
