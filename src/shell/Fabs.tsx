import { AnimatePresence, m, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUp, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Magnet } from "@/components/Magnet";
import { currentTheme, onThemeKey, toggleTheme, type Theme } from "./theme";
import { scrollToTarget, useLenis } from "./scroll";

const ease = [0.22, 1, 0.36, 1] as const;

export function Fabs() {
  const lenis = useLenis();
  const { scrollY, scrollYProgress } = useScroll();
  const [up, setUp] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => (typeof document === "undefined" ? "dark" : currentTheme()));
  useMotionValueEvent(scrollY, "change", (y) => setUp(y > 480));

  useEffect(() => {
    const sync = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    addEventListener("themechange", sync);
    addEventListener("keydown", onThemeKey);
    return () => {
      removeEventListener("themechange", sync);
      removeEventListener("keydown", onThemeKey);
    };
  }, []);

  return (
    <>
      <m.div aria-hidden="true" className="scroll-progress" style={{ scaleX: scrollYProgress }} />
      <div className="fixed right-4 bottom-4 z-50 flex flex-col items-center gap-2.5 sm:right-6 sm:bottom-6 sm:gap-3 md:right-8 md:bottom-8">
        <AnimatePresence>
          {up && (
            <m.div
              key="top"
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.92 }}
              transition={{ duration: 0.28, ease }}
            >
              <Magnet padding={40} strength={6}>
                <button type="button" className="fab" aria-label="Back to top" onClick={() => scrollToTarget(lenis.current, 0)}>
                  <ArrowUp className="size-4" strokeWidth={1.75} />
                </button>
              </Magnet>
            </m.div>
          )}
        </AnimatePresence>
        <Magnet padding={40} strength={6}>
          <button
            type="button"
            className="fab"
            aria-label={theme === "dark" ? "Switch to light theme (D)" : "Switch to dark theme (D)"}
            onClick={(e) => {
              const b = e.currentTarget.getBoundingClientRect();
              toggleTheme(b.left + b.width / 2, b.top + b.height / 2);
            }}
          >
            {theme === "dark" ? <Sun className="size-4" strokeWidth={1.75} /> : <Moon className="size-4" strokeWidth={1.75} />}
          </button>
        </Magnet>
      </div>
    </>
  );
}
