import { Body, Column, Container, Head, Heading, Html, Preview, Row, Section, Text } from "react-email";
import type { ReactNode } from "react";
import { C, FONT, RAINBOW } from "./theme.js";

type Props = { preheader: string; kicker: string; heading: string; accent?: string; foot: ReactNode; children: ReactNode };

export function Layout({ preheader, kicker, heading, accent = RAINBOW[3]!, foot, children }: Props) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preheader}</Preview>
      <Body style={{ margin: 0, padding: "32px 12px", background: C.paper, fontFamily: FONT, color: C.ink }}>
        <Container style={{ maxWidth: 560, background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, overflow: "hidden" }}>
          <Row>
            {RAINBOW.map((c) => (
              <Column key={c} style={{ height: 6, background: c, fontSize: 0, lineHeight: 0 }}>
                &nbsp;
              </Column>
            ))}
          </Row>
          <Section style={{ padding: "32px 32px 8px" }}>
            <Text style={{ margin: "0 0 8px", fontSize: 11, lineHeight: "16px", letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>
              <span style={{ color: accent }}>●</span>&nbsp; {kicker}
            </Text>
            <Heading as="h1" style={{ margin: 0, fontSize: 26, lineHeight: 1.2, fontWeight: 700, color: C.ink }}>
              {heading}
            </Heading>
          </Section>
          <Section style={{ padding: "8px 32px 28px", fontSize: 15, lineHeight: 1.6 }}>{children}</Section>
          <Section style={{ padding: "18px 32px", borderTop: `1px dashed ${C.line}` }}>
            <Text style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: C.muted }}>{foot}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function Quote({ children, accent = RAINBOW[3]! }: { children: string; accent?: string }) {
  return (
    <Text style={{ margin: "12px 0 0", padding: "14px 16px", borderLeft: `3px solid ${accent}`, background: C.paper, borderRadius: "0 12px 12px 0", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, color: C.ink }}>
      {children}
    </Text>
  );
}

/** Body paragraph with the email's spacing, so React Email's default Text margins don't creep in. */
export function P({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <Text style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.ink, ...style }}>{children}</Text>;
}
