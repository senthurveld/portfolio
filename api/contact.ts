// POST /api/contact: emails you every message; emails the visitor an auto-reply when they chose Email.
// Env (Vercel → Settings → Environment Variables): GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_TO (optional, defaults to GMAIL_USER).
// Templates: emails/*.tsx (React Email). Preview them with `npm run email:dev`.
import nodemailer from "nodemailer";
import { createElement, type ReactElement } from "react";
import { render } from "react-email";
import AutoReply from "../emails/AutoReply.js";
import OwnerNotification from "../emails/OwnerNotification.js";
import { contact, site } from "../src/content/site.js";
import { contactSubject, validateContact, type ContactDraft } from "../src/lib/logic.js";

const MAX_BODY = 10_000;
const MIN_ELAPSED = 3000;

const json = (status: number, body: unknown) => Response.json(body, { status });
const str = (v: unknown) => (typeof v === "string" ? v : "");
const oneLine = (v: unknown) => str(v).replace(/[\r\n]+/g, " ").trim();
const mail = async (el: ReactElement) => ({ html: await render(el), text: await render(el, { plainText: true }) });

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > MAX_BODY) return json(413, { error: "Message too large." });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "Bad request." });
  }
  if (!body || typeof body !== "object") return json(400, { error: "Bad request." });

  // Bots: honeypot filled, or submitted faster than a person could. Say ok, send nothing.
  if (str(body.website) || !(Number(body.elapsed) >= MIN_ELAPSED)) return json(200, { ok: true });

  const reason = contact.reasons.find((r) => r.id === body.reason);
  const channel = contact.channels.find((c) => c.id === body.channel);
  if (!reason || !channel) return json(400, { error: "Bad request." });

  const detail = oneLine(body.detail);
  const timeline = oneLine(body.timeline);
  const d: ContactDraft = {
    reason: reason.id,
    channel: channel.id,
    detail: reason.detail?.options.includes(detail) ? detail : "",
    timeline: reason.timeline && contact.timeline.includes(timeline) ? timeline : "",
    name: oneLine(body.name),
    email: oneLine(body.email),
    company: oneLine(body.company).slice(0, 100),
    message: str(body.message).trim(),
  };
  const errors = validateContact(d);
  if (Object.keys(errors).length) return json(400, { errors });

  const { GMAIL_USER: user, GMAIL_APP_PASSWORD: pass, CONTACT_TO } = process.env;
  if (!user || !pass) {
    console.error("contact: GMAIL_USER or GMAIL_APP_PASSWORD is not set");
    return json(500, { error: "Mail is not set up yet." });
  }
  const owner = CONTACT_TO || user;
  const mailer = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });

  try {
    const subject = `${d.channel === "whatsapp" ? "[via WhatsApp] " : ""}${contactSubject(d)}`;
    const ownerBody = await mail(createElement(OwnerNotification, { d }));
    await mailer.sendMail({ from: { name: "Portfolio contact", address: user }, to: owner, replyTo: { name: d.name, address: d.email }, subject, ...ownerBody });
    if (d.channel === "email") {
      const replyBody = await mail(createElement(AutoReply, { d }));
      await mailer.sendMail({ from: { name: site.name, address: user }, to: { name: d.name, address: d.email }, replyTo: owner, subject: `Got your message, ${d.name.split(/\s+/)[0]}`, ...replyBody });
    }
  } catch (err) {
    console.error("contact: send failed", err);
    return json(502, { error: "Couldn't send right now." });
  }
  return json(200, { ok: true });
}
