export const BLINDS = 5;
export const BLIND = { duration: 1.0, stagger: 0.08 };
export const ease = [0.76, 0, 0.24, 1] as const;
export const blindDelay = (i: number, reveal = false) => (reveal ? BLINDS - 1 - i : i) * BLIND.stagger;
