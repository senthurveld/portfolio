import { m, useReducedMotion } from "motion/react";
import { Fragment } from "react";

type Props = {
  text: string;
  as?: "h1" | "h2" | "p";
  className?: string;
  wordClassName?: string;
  delay?: number;
};

export function TextReveal({ text, as: Tag = "h2", className, wordClassName, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="-mt-[0.08em] -mb-[0.14em] inline-block overflow-hidden pt-[0.08em] pb-[0.14em] align-top">
              <m.span
                className={`inline-block ${wordClassName ?? ""}`}
                initial={reduce ? false : { y: "115%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.95, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </m.span>
            </span>
            {i < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
