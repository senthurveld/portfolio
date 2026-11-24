// To you. Reply-To is the visitor, so hitting Reply in Gmail answers them.
import { Link } from "react-email";
import type { ReactNode } from "react";
import { contactReasonLine, istTime, type ContactDraft } from "../src/lib/logic.js";
import { Layout, Quote } from "./Layout.js";
import { C, linkStyle } from "./theme.js";

type Props = { d: ContactDraft; sentAt?: Date };

export default function OwnerNotification({ d, sentAt = new Date() }: Props) {
  const via = d.channel === "whatsapp" ? "WhatsApp" : "Email";
  const rows: [string, ReactNode][] = [
    ["Name", d.name],
    ["Email", <Link href={`mailto:${d.email}`} style={linkStyle}>{d.email}</Link>],
    ...(d.company ? [["Company", d.company] as [string, ReactNode]] : []),
    ["Reason", contactReasonLine(d)],
    ["Sent via", via === "WhatsApp" ? "WhatsApp (copy; check your chats)" : "Email (auto-reply sent)"],
    ["Time", `${istTime(sentAt)} IST`],
  ];
  return (
    <Layout preheader={d.message.slice(0, 120)} kicker={`New message · via ${via}`} heading={contactReasonLine(d)} foot={`Hit Reply to answer ${d.name} directly.`}>
      <table role="presentation" cellPadding={0} cellSpacing={0}>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td style={{ padding: "6px 16px 6px 0", color: C.muted, fontSize: 13, verticalAlign: "top", whiteSpace: "nowrap" }}>{k}</td>
              <td style={{ padding: "6px 0", fontSize: 14 }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Quote>{d.message}</Quote>
    </Layout>
  );
}

OwnerNotification.PreviewProps = {
  d: { reason: "freelance", channel: "email", detail: "Business website", timeline: "ASAP", name: "Asha Raman", email: "asha@example.com", company: "Asha's Bakery", message: "Hi! I need a five page site for my bakery with a menu and an order form.\n\nCan we talk this week?" },
} satisfies Props;
