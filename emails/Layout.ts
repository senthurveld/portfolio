// Plain .ts with createElement (no JSX): Vercel's function tracer resolves "./x.js" imports to x.ts but never x.tsx,
// so .tsx templates were left out of the /api/contact bundle and the function crashed on load. Keep emails/ in .ts.
import { Body, Column, Container, Head, Heading, Html, Preview, Row, Section, Text } from "react-email";
import { createElement as h, type CSSProperties, type ReactNode } from "react";
import { C, FONT, RAINBOW } from "./theme.js";

type Props = { preheader: string; kicker: string; heading: string; accent?: string; foot: ReactNode; children?: ReactNode };

export function Layout({ preheader, kicker, heading, accent = RAINBOW[3]!, foot, children }: Props) {
  return h(
    Html,
    { lang: "en" },
    h(Head, null, h("meta", { name: "color-scheme", content: "light" }), h("meta", { name: "supported-color-schemes", content: "light" })),
    h(Preview, null, preheader),
    h(
      Body,
      { style: { margin: 0, padding: "32px 12px", background: C.paper, fontFamily: FONT, color: C.ink } },
      h(
        Container,
        { style: { maxWidth: 560, background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, overflow: "hidden" } },
        h(
          Row,
          null,
          RAINBOW.map((c) => h(Column, { key: c, style: { height: 6, background: c, fontSize: 0, lineHeight: 0 } }, " ")),
        ),
        h(
          Section,
          { style: { padding: "32px 32px 8px" } },
          h(
            Text,
            { style: { margin: "0 0 8px", fontSize: 11, lineHeight: "16px", letterSpacing: 2, textTransform: "uppercase", color: C.muted } },
            h("span", { style: { color: accent } }, "●"),
            "  ",
            kicker,
          ),
          h(Heading, { as: "h1", style: { margin: 0, fontSize: 26, lineHeight: 1.2, fontWeight: 700, color: C.ink } }, heading),
        ),
        h(Section, { style: { padding: "8px 32px 28px", fontSize: 15, lineHeight: 1.6 } }, children),
        h(Section, { style: { padding: "18px 32px", borderTop: `1px dashed ${C.line}` } }, h(Text, { style: { margin: 0, fontSize: 12, lineHeight: 1.5, color: C.muted } }, foot)),
      ),
    ),
  );
}

export function Quote({ children, accent = RAINBOW[3]! }: { children?: string; accent?: string }) {
  return h(
    Text,
    { style: { margin: "12px 0 0", padding: "14px 16px", borderLeft: `3px solid ${accent}`, background: C.paper, borderRadius: "0 12px 12px 0", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, color: C.ink } },
    children,
  );
}

/** Body paragraph with the email's spacing, so React Email's default Text margins don't creep in. */
export function P({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return h(Text, { style: { margin: 0, fontSize: 15, lineHeight: 1.6, color: C.ink, ...style } }, children);
}
