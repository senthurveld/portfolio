// To the visitor. Reply-To is you. Copy lives in REPLY below: edit freely.
// Goes to an address anyone can type, so it never echoes their text: no message quote, and the name only via greetName().
// Plain .ts with createElement (no JSX) so Vercel bundles it with /api/contact: see the note in Layout.ts.
import { Button, Hr, Link, Section } from "react-email";
import { createElement as h, Fragment } from "react";
import { services, site, socials, type ContactReason } from "../src/content/site.js";
import { greetName, type ContactDraft } from "../src/lib/logic.js";
import { Layout, P } from "./Layout.js";
import { ACCENT, C, linkStyle } from "./theme.js";

const REPLY = {
  hiring: {
    lead: "Thanks for reaching out about a role.",
    body: "I read and answer every message myself, so you'll hear back from me personally. Until then, here is my resume and where my work lives.",
    cta: { label: "Download my resume", href: `${site.url}/resume.pdf` },
  },
  freelance: {
    lead: "Thanks for telling me about your project.",
    body: "I read and answer every message myself. Here is how working together usually goes:",
    cta: { label: "See recent projects", href: `${site.url}/projects` },
  },
  hello: {
    lead: "Thanks for saying hi.",
    body: "I read and answer every message myself, so expect a real reply. Meanwhile, have a look around:",
    cta: { label: "Browse my projects", href: `${site.url}/projects` },
  },
} satisfies Record<ContactReason, { lead: string; body: string; cta: { label: string; href: string } }>;

const linkedin = socials.find((s) => s.label === "LinkedIn")!.href;
const github = socials.find((s) => s.label === "GitHub")!.href;
const host = site.url.replace(/^https?:\/\//, "");

type Props = { d: ContactDraft };

export default function AutoReply({ d }: Props) {
  const reason = (d.reason || "hello") as ContactReason;
  const copy = REPLY[reason];
  const accent = ACCENT[reason];
  const asked = [d.detail, d.timeline].filter(Boolean).join(" · ");

  return h(
    Layout,
    {
      preheader: `${copy.lead} I'll reply personally.`,
      kicker: "Message received",
      heading: `Hi ${greetName(d.name)}, got it.`,
      accent,
      foot: h(Fragment, null, "You're getting this because you wrote to me through ", host, ". Reply to this email to add anything."),
    },
    h(P, null, copy.lead, " ", copy.body),

    reason === "hiring" &&
      site.available &&
      h(P, { style: { margin: "16px 0 0", fontSize: 14, color: C.muted } }, "Open to roles in ", h("strong", { style: { color: C.ink } }, site.openTo.join(" · "))),

    reason === "freelance" &&
      h(
        Fragment,
        null,
        asked && h(P, { style: { margin: "16px 0 0", fontSize: 14, color: C.muted } }, "You asked about: ", h("strong", { style: { color: C.ink } }, asked)),
        h(
          "table",
          { role: "presentation", cellPadding: 0, cellSpacing: 0, style: { margin: "16px 0 0" } },
          h(
            "tbody",
            null,
            services.process.map(([step, line], i) =>
              h(
                "tr",
                { key: step },
                h(
                  "td",
                  { style: { padding: "6px 12px 6px 0", verticalAlign: "top" } },
                  h("span", { style: { display: "inline-block", width: 24, height: 24, lineHeight: "24px", borderRadius: 12, background: accent, color: C.ink, fontSize: 12, fontWeight: 700, textAlign: "center" } }, i + 1),
                ),
                h("td", { style: { padding: "6px 0", fontSize: 14, lineHeight: 1.5 } }, h("strong", null, step), "  ", line),
              ),
            ),
          ),
        ),
      ),

    h(
      Section,
      { style: { margin: "24px 0 0" } },
      h(Button, { href: copy.cta.href, style: { background: C.ink, color: C.card, padding: "12px 22px", borderRadius: 999, fontSize: 14, fontWeight: 600 } }, copy.cta.label, " →"),
    ),
    h(
      P,
      { style: { margin: "14px 0 0", fontSize: 14 } },
      reason === "hello" && h(Fragment, null, h(Link, { href: `${site.url}/now`, style: linkStyle }, "What I'm doing now"), "  · ", " "),
      h(Link, { href: linkedin, style: linkStyle }, "LinkedIn"),
      "  ·  ",
      h(Link, { href: github, style: linkStyle }, "GitHub"),
    ),

    h(Hr, { style: { margin: "28px 0 0", borderColor: C.line } }),

    h(
      P,
      { style: { margin: "28px 0 0" } },
      site.first,
      h("br"),
      h("span", { style: { color: C.muted, fontSize: 13 } }, site.role, " · ", site.city, " · ", h(Link, { href: site.url, style: linkStyle }, host)),
    ),
  );
}

AutoReply.PreviewProps = {
  d: { reason: "freelance", channel: "email", detail: "Business website", timeline: "ASAP", name: "Asha Raman", email: "asha@example.com", company: "Asha's Bakery", message: "Hi! I need a five page site for my bakery with a menu and an order form.\n\nCan we talk this week?" },
} satisfies Props;
