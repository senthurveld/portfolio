import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";

export type Token = string | { node: ReactNode; text: string };
type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

type Props = { tokens: Token[]; className?: string; offset?: Offset };

function Word({ p, i, n, children }: { p: MotionValue<number>; i: number; n: number; children: ReactNode }) {
  const opacity = useTransform(p, [i / n, Math.min(1, i / n + 5 / n)], [0.14, 1]);
  return <m.span style={{ opacity }}>{children}</m.span>;
}

export function WordReveal({ tokens, className, offset = ["start 0.85", "end 0.45"] }: Props) {
  const root = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: root, offset });
  const words: Token[] = tokens.flatMap((t): Token[] => (typeof t === "string" ? t.split(/\s+/).filter(Boolean) : [t]));
  const plain = words.map((w) => (typeof w === "string" ? w : w.text)).join(" ").replace(/ ([,.])/g, "$1");
  const gap = (i: number) => {
    const nx = words[i + 1];
    return nx && !(typeof nx === "string" && /^[,.]/.test(nx)) ? " " : "";
  };

  return (
    <p ref={root} className={className}>
      <span className="sr-only">{plain}</span>
      <span aria-hidden="true">
        {words.map((w, i) => {
          const body = typeof w === "string" ? w : w.node;
          return (
            <span key={i}>
              {reduce ? body : <Word p={scrollYProgress} i={i} n={words.length}>{body}</Word>}
              {gap(i)}
            </span>
          );
        })}
      </span>
    </p>
  );
}
