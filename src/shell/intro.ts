import { useSyncExternalStore } from "react";

let ready = false;
const subs = new Set<() => void>();

export function markIntroReady() {
  if (ready) return;
  ready = true;
  subs.forEach((f) => f());
}

let heroDone: () => void;
export const heroSettled = new Promise<void>((r) => (heroDone = r));
export const markHeroSettled = () => heroDone();

export const isIntroReady = () => ready;

let coverAt = -Infinity;
let coverDelay = 0;
export const markCover = (delay: number) => {
  coverAt = performance.now();
  coverDelay = delay;
};
export const enterDelay = () => (performance.now() - coverAt < 600 ? coverDelay : 0);

export const useIntroReady = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => ready,
    () => false,
  );
