import { useEffect } from "react";
import { heroSettled, markIntroReady } from "./intro";

type Boot = { finish: () => Promise<void>; leave: () => Promise<void>; intro: Promise<void> };

const MIN_MS = 1400;
const MAX_MS = 8000;
const HERO_WAIT_MS = 3000;

const pageLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else addEventListener("load", () => resolve(), { once: true });
  });

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));

export function Preloader() {
  useEffect(() => {
    const boot = (window as Window & { __boot?: Boot }).__boot;
    if (!boot || !document.getElementById("boot")) {
      markIntroReady();
      return;
    }
    let live = true;
    const loaded = Promise.all([
      pageLoaded(),
      document.fonts?.ready,
      boot.intro,
      wait(MIN_MS - performance.now()),
      location.pathname === "/" ? Promise.race([heroSettled, wait(HERO_WAIT_MS)]) : null,
    ]);
    Promise.race([loaded, wait(MAX_MS - performance.now())])
      .then(() => boot.finish())
      .then(() => {
        if (!live) return;
        boot.leave();
        setTimeout(markIntroReady, 650);
      });
    return () => {
      live = false;
    };
  }, []);

  return null;
}
