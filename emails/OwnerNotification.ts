// To you. Reply-To is the visitor, so hitting Reply in Gmail answers them.
// Plain .ts with createElement (no JSX) so Vercel bundles it with /api/contact: see the note in Layout.ts.
import { Link } from "react-email";
import { createElement as h, type ReactNode } from "react";
import { contactReasonLine, istTime, type ContactDraft } from "../src/lib/logic.js";
import { Layout, Quote } from "./Layout.js";
import { C, linkStyle } from "./theme.js";

type Props = { d: ContactDraft; sentAt?: Date };

export default function OwnerNotification({ d, sentAt = new Date() }: Props) {
  const via = d.channel === "whatsapp" ? "WhatsApp" : "Email";
  const rows: [string, ReactNode][] = [
    ["Name", d.name],
    ["Email", h(Link, { href: `mailto:${d.email}`, style: linkStyle }, d.email)],
    ...(d.company ? [["Company", d.company] as [string, ReactNode]] : []),
    ["Reason", contactReasonLine(d)],
    ["Sent via", via === "WhatsApp" ? "WhatsApp (copy; check your chats)" : "Email (auto-reply sent)"],
    ["Time", `${istTime(sentAt)} IST`],
  ];
  return h(
    Layout,
    { preheader: d.message.slice(0, 120), kicker: `New message · via ${via}`, heading: contactReasonLine(d), foot: `Hit Reply to answer ${d.name} directly.` },
    h(
      "table",
      { role: "presentation", cellPadding: 0, cellSpacing: 0 },
      h(
        "tbody",
        null,
        rows.map(([k, v]) =>
          h(
            "tr",
            { key: k },
            h("td", { style: { padding: "6px 16px 6px 0", color: C.muted, fontSize: 13, verticalAlign: "top", whiteSpace: "nowrap" } }, k),
            h("td", { style: { padding: "6px 0", fontSize: 14 } }, v),
          ),
        ),
      ),
    ),
    h(Quote, null, d.message),
  );
}

OwnerNotification.PreviewProps = {
  d: { reason: "freelance", channel: "email", detail: "Business website", timeline: "ASAP", name: "Asha Raman", email: "asha@example.com", company: "Asha's Bakery", message: "Hi! I need a five page site for my bakery with a menu and an order form.\n\nCan we talk this week?" },
} satisfies Props;
