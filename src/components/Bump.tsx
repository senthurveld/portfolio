import type { CSSProperties } from "react";

export function Bump({ text }: { text: string }) {
  const step = Math.min(18, 240 / Math.max(1, text.length));
  const words = text.split(" ").map((word, w, all) => ({
    word,
    start: w === 0 ? 0 : all.slice(0, w).join(" ").length + 1,
  }));
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map(({ word, start }, w) => (
          <span key={w}>
            {w > 0 && " "}
            <span className="bump">
              {Array.from(word, (ch, i) => (
                <span
                  key={i}
                  style={
                    {
                      "--d": `${Math.round((start + i) * step)}ms`,
                    } as CSSProperties
                  }
                >
                  {ch}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}
