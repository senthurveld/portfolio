import { m, useReducedMotion, useSpring } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router";
import { Bump } from "@/components/Bump";
import { Magnet } from "@/components/Magnet";
import { hero } from "@/content/site";
import { canRun3D, cn, FINE } from "@/lib/logic";
import { CubePoster } from "@/sections/CubePoster";
import { isIntroReady, markHeroSettled, useIntroReady } from "@/shell/intro";

const Hero3D = lazy(() => import("@/three/Hero3D"));
const REVEAL_MS = 2600;

const ease = [0.22, 1, 0.36, 1] as const;
const lines = hero.title
  .split(" & ")
  .map((l, i, a) => (i < a.length - 1 ? `${l} &` : l));

function useFitRatio(ref: React.RefObject<HTMLHeadingElement | null>) {
  useLayoutEffect(() => {
    const h = ref.current!;
    const measure = () => {
      const cs = getComputedStyle(h);
      const fs = parseFloat(cs.fontSize);
      const first = h.querySelector<HTMLElement>("[data-line]")?.textContent?.trim()[0];
      const ctx = document.createElement("canvas").getContext("2d");
      if (first && ctx) {
        ctx.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
        const ink = -ctx.measureText(first).actualBoundingBoxLeft / fs;
        h.parentElement?.style.setProperty("--title-ink", Math.max(0, ink).toFixed(4));
      }
      const widest = Math.max(
        ...Array.from(
          h.querySelectorAll<HTMLElement>("[data-line]"),
          (l) => l.scrollWidth,
        ),
      );
      const ratio = widest / fs;
      const box = h.parentElement!;
      const cur = parseFloat(
        box.style.getPropertyValue("--fit-ratio") || "12.49",
      );
      if (ratio > 0 && Math.abs(ratio - cur) / cur > 0.004)
        box.style.setProperty("--fit-ratio", ratio.toFixed(3));
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [ref]);
}

function useScrub(
  video: React.RefObject<HTMLVideoElement | null>,
  root: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const v = video.current;
    if (!v || !matchMedia(`${FINE} and (min-width: 768px)`).matches) return;
    let target = 0,
      cur = 0,
      py = 0.5,
      raf = 0;
    const onMove = (e: PointerEvent) => (py = e.clientY / innerHeight);
    const loop = () => {
      const h = root.current!.offsetHeight;
      const s = Math.min(1, Math.max(0, scrollY / h));
      const d = (v.duration || 0) - 0.05;
      target = (0.65 * s + 0.35 * py) * Math.max(0, d);
      cur += (target - cur) * 0.12;
      if (d > 0 && Math.abs(v.currentTime - cur) > 0.01) v.currentTime = cur;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
    };
  }, [video, root]);
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const px = useSpring(0, { stiffness: 60, damping: 18, mass: 0.4 });
  const py = useSpring(0, { stiffness: 60, damping: 18, mass: 0.4 });
  const [webgl] = useState(canRun3D);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mount3D, setMount3D] = useState(false);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setSettled(true), REVEAL_MS);
    return () => clearTimeout(t);
  }, [ready]);
  useFitRatio(h1);
  useScrub(video, root);

  useEffect(() => {
    if (!webgl) return;
    let off = false,
      t = 0,
      idle = 0;
    const load = () =>
      import("@/three/Hero3D").then(
        () => {
          if (off) return;
          if (!isIntroReady()) setMount3D(true);
          else t = window.setTimeout(() => setMount3D(true), REVEAL_MS);
        },
        () => setFailed(true),
      );
    // three.js loads after window load + idle: off the LCP path.
    const start = () => {
      idle = window.requestIdleCallback
        ? window.requestIdleCallback(load, { timeout: 1500 })
        : window.setTimeout(load, 200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      off = true;
      clearTimeout(t);
      window.removeEventListener("load", start);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [webgl]);
  useEffect(() => {
    if (!webgl || live || failed) markHeroSettled();
  }, [webgl, live, failed]);

  useEffect(() => {
    if (!matchMedia(FINE).matches) return;
    const titleLines = h1.current!.querySelectorAll<HTMLElement>("[data-line]");
    let raf = 0, cx = 0, cy = 0;
    const light = () => {
      raf = 0;
      for (const el of titleLines) {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--lx", `${(cx - r.left).toFixed(0)}px`);
        el.style.setProperty("--ly", `${(cy - r.top).toFixed(0)}px`);
      }
    };
    const move = (e: PointerEvent) => {
      px.set((e.clientX / innerWidth - 0.5) * -24);
      py.set((e.clientY / innerHeight - 0.5) * -20);
      cx = e.clientX;
      cy = e.clientY;
      if (!raf && e.clientY < innerHeight) raf = requestAnimationFrame(light);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [px, py]);

  const rise = (delay: number) =>
    reduce
      ? {
          initial: { opacity: 0 },
          animate: ready ? { opacity: 1 } : {},
          transition: { duration: 0.4 },
        }
      : {
          initial: { opacity: 0, y: 28, filter: "blur(6px)" },
          animate: ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : {},
          transition: { duration: 1.6, delay, ease },
        };

  return (
    <header
      ref={root}
      id="top"
      className="relative z-0 flex h-svh min-h-[36rem] flex-col overflow-hidden bg-ink text-[#e6eef3] [color-scheme:dark]"
    >
      <m.div
        aria-hidden="true"
        className="absolute -inset-[3%] will-change-transform"
        style={{ x: px, y: py }}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.22 }}
        animate={ready ? { opacity: 1, scale: 1.04 } : {}}
        transition={{
          opacity: { duration: reduce ? 0.4 : 1.8, ease: "easeOut" },
          scale: { duration: 3.2, ease },
        }}
      >
        {hero.media.poster ? (
          <img
            src={hero.media.poster}
            alt=""
            className="absolute inset-0 size-full object-cover"
            fetchPriority="high"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_70%_45%,#2a313b_0%,#14171b_45%,#0c0c0c_80%)]" />
        )}
        {hero.media.video && (
          <video
            ref={video}
            src={hero.media.video}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </m.div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#0c0c0cc7,#0c0c0c47,#0c0c0ce0)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,12,12,.5)_100%)]"
      />

      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[34%] bottom-[30%] will-change-transform md:top-[18%] md:bottom-[17%] md:left-[42%] md:right-[3%]"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.94 }}
        animate={ready ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{
          duration: reduce ? 0.4 : 2,
          delay: reduce ? 0 : 0.9,
          ease,
        }}
      >
        <m.div
          className="absolute top-1/2 left-1/2 aspect-square h-[118%] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,#b4bec93d,#2a313b4d_55%,transparent)]"
          animate={reduce ? undefined : { opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <CubePoster
          className={cn(
            "absolute top-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 transition-opacity duration-700",
            live && "opacity-0",
          )}
        />
        {mount3D && !failed && (
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              !live && "opacity-0",
            )}
          >
            <Suspense fallback={null}>
              <Hero3D
                reduce={!!reduce}
                paused={!settled}
                onReady={() => setLive(true)}
                onFail={() => {
                  setFailed(true);
                  setLive(false);
                }}
              />
            </Suspense>
          </div>
        )}
      </m.div>

      <div className="relative flex flex-1 flex-col justify-between pt-28 pb-8 sm:pt-32 md:pb-12">
        <div className="px-6 [container-type:inline-size] md:px-10">
          <m.div
            {...rise(0.7)}
            className="mb-4 flex items-center justify-between gap-6 text-sm font-medium tracking-[0.14em] text-steel md:mb-5"
          >
            <p className="pl-[calc(100cqi/var(--fit-ratio,12.49)*var(--title-ink,0))]">{hero.eyebrow}</p>
          </m.div>
          <h1
            ref={h1}
            className="chrome-title font-extrabold tracking-[-0.035em] whitespace-nowrap uppercase select-none [font-size:calc(100cqi/var(--fit-ratio,12.49))] leading-[0.9]"
          >
            <span className="sr-only">{hero.title}</span>
            <span aria-hidden="true">
              {lines.map((l, i) => (
                <span
                  key={l}
                  className="block overflow-hidden pb-[0.14em] -mb-[0.14em]"
                >
                  <m.span
                    data-line
                    className="chrome inline-block pb-[0.14em] will-change-transform"
                    style={{
                      backgroundPosition:
                        i === lines.length - 1 ? "0 0, 0 100%" : "0 0, 0 0",
                    }}
                    initial={reduce ? { opacity: 0 } : { y: "105%" }}
                    animate={ready ? (reduce ? { opacity: 1 } : { y: 0 }) : {}}
                    transition={{
                      duration: reduce ? 0.4 : 1.8,
                      delay: reduce ? 0 : 0.1 + i * 0.18,
                      ease,
                    }}
                  >
                    {l}
                  </m.span>
                </span>
              ))}
            </span>
          </h1>
        </div>

        <div className="shell">
          <m.span
            aria-hidden="true"
            className="mb-6 block h-px origin-left bg-[linear-gradient(90deg,transparent,#d7e2ea59,transparent)] md:mb-8"
            initial={{ scaleX: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
            animate={ready ? { scaleX: 1, opacity: 1 } : {}}
            transition={{
              duration: reduce ? 0.4 : 2,
              delay: reduce ? 0 : 0.8,
              ease,
            }}
          />
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            {/* LCP element: no entrance animation on paragraph/CTAs. */}
            <p
              className="max-w-md text-[clamp(1rem,1.7vw,1.35rem)] leading-[1.625] text-pretty [text-shadow:0_2px_16px_rgba(0,0,0,.65)] md:max-w-lg"
            >
              {hero.sub}
            </p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4 md:pr-16">
              <Magnet padding={50} strength={4} className="max-sm:w-full">
                <a
                  href={hero.primary.href}
                  download={hero.primary.download}
                  className="group inline-flex h-12 min-w-[11rem] max-sm:w-full items-center justify-center gap-1.5 rounded-full border border-transparent bg-steel px-8 text-sm font-semibold tracking-[0.2em] text-ink uppercase shadow-[inset_0_1px_0_#ffffffb3,0_10px_30px_-10px_#d7e2ea66] transition-[transform,background-color] duration-300 hover:scale-[1.03] hover:bg-white md:h-14 md:min-w-[14.5rem]"
                >
                  <Bump text={hero.primary.label} />
                  <ArrowDown aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
              </Magnet>
              <Magnet padding={50} strength={4} className="max-sm:w-full">
                <Link
                  to={hero.secondary.href}
                  className="group inline-flex h-12 min-w-[11rem] max-sm:w-full items-center justify-center gap-1.5 rounded-full border border-steel/25 px-8 text-sm font-semibold tracking-[0.2em] text-steel uppercase transition-[transform,background-color,border-color] duration-300 hover:scale-[1.03] hover:border-steel/60 hover:bg-steel/10 md:h-14 md:min-w-[14.5rem]"
                >
                  <Bump text={hero.secondary.label} />
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Magnet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
