import { Children, isValidElement } from "react";

const text = (node) =>
  Children.toArray(node)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : isValidElement(c) ? text(c.props.children) : ""))
    .join("");

/**
 * Splits a heading into masked words for the rise-in (see lib/effects.js).
 * Screen readers get the plain sentence; the split copy is hidden from them.
 * Inline elements (the serif accent) stay whole and move as one word.
 */
export function Words({ children }) {
  const parts = Children.toArray(children).flatMap((c) => (typeof c === "string" || typeof c === "number" ? String(c).split(/(\s+)/) : [c]));
  return (
    <>
      <span className="sr-only">{text(children)}</span>
      <span aria-hidden="true">
        {parts.map((p, i) =>
          typeof p === "string" && !p.trim() ? (
            p && " "
          ) : (
            <span key={i} data-w className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] pr-[0.04em] align-bottom">
              <span className="inline-block">{p}</span>
            </span>
          ),
        )}
      </span>
    </>
  );
}

/** One span per letter, for the cursor stretch. Hidden from screen readers; pair with real text. */
export function Letters({ children }) {
  return [...children].map((ch, i) =>
    ch === " " ? (
      " "
    ) : (
      <span key={i} data-l className="inline-block">
        {ch}
      </span>
    ),
  );
}
