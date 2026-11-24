import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = { children: ReactNode; y?: number; delay?: number; className?: string; as?: "div" | "li" | "section" };

export function FadeIn({ children, y = 30, delay = 0, className, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const M = m[as];
  if (reduce) return <M className={className}>{children}</M>;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </M>
  );
}

export function GrowRule({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <m.span
      aria-hidden="true"
      className={`block h-px origin-left bg-[var(--home-line)] ${className ?? ""}`}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
