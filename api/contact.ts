// POST /api/contact: emails you every message; emails the visitor an auto-reply when they chose Email.
// Env (Vercel → Settings → Environment Variables): GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_TO (optional, defaults to GMAIL_USER).
// Templates: emails/*.ts (React Email, written with createElement: Vercel won't bundle .tsx imports here). Preview them with `npm run email:dev`.
//
// Abuse model: the auto-reply goes to whatever address is typed in, from your Gmail. So every request must
// come from this site's own pages (Origin + JSON content type), is rate limited per IP, each recipient gets
// at most 2 auto-replies a day, and the auto-reply never echoes the visitor's text. See api/_limit.ts.
import nodemailer from "nodemailer";
import { createElement, type ReactElement } from "react";
import { render } from "react-email";
import AutoReply from "../emails/AutoReply.js";
import OwnerNotification from "../emails/OwnerNotification.js";
import { contact, site } from "../src/content/site.js";
import { contactSubject, greetName, validateContact, type ContactDraft } from "../src/lib/logic.js";
import { autoReplies, delivered, perIp, perRecipient } from "./_limit.js";

const MAX_BODY = 10_000;
const MIN_ELAPSED = 3000;
const SUBMISSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (status: number, body: unknown, headers?: Record<string, string>) => Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
const str = (v: unknown) => (typeof v === "string" ? v : "");
const oneLine = (v: unknown) => str(v).replace(/[\r\n]+/g, " ").trim();
const mail = async (el: ReactElement) => ({ html: await render(el), text: await render(el, { plainText: true }) });

/** Browsers always send Origin on a POST. Only this deployment's host or the public site may call. */
function sameSite(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const host = new URL(origin).host;
    return host === new URL(req.url).host || host === new URL(site.url).host;
  } catch {
    return false;
  }
}

/** Vercel sets x-real-ip / x-forwarded-for at its edge; a client can't override them there. */
const clientIp = (req: Request) => req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

export async function POST(req: Request) {
  if (!sameSite(req)) return json(403, { error: "Forbidden." });
  // JSON only: a cross-site <form> or text/plain fetch can't send it without a CORS preflight, which we never allow.
  if (req.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") return json(415, { error: "Send JSON." });
  if (Number(req.headers.get("content-length")) > MAX_BODY) return json(413, { error: "Message too large." });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json(413, { error: "Message too large." });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "Bad request." });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { error: "Bad request." });

  const wait = perIp.take(clientIp(req));
  if (wait) {
    const secs = Math.ceil(wait / 1000);
    return json(429, { error: "Too many messages.", retryAfter: secs }, { "Retry-After": String(secs) });
  }

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

  // Same submission retried after a timeout that actually went through: don't mail twice.
  const id = str(body.id);
  if (SUBMISSION_ID.test(id) && delivered.has(id)) return json(200, { ok: true });

  const { GMAIL_USER: user, GMAIL_APP_PASSWORD: pass, CONTACT_TO } = process.env;
  if (!user || !pass) {
    console.error("contact: GMAIL_USER or GMAIL_APP_PASSWORD is not set");
    return json(500, { error: "Mail is not set up yet." });
  }
  const owner = CONTACT_TO || user;
  const mailer = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });

  try {
    const subject = `${d.channel === "whatsapp" ? "[via WhatsApp] " : ""}${contactSubject(d)}`;
    await mailer.sendMail({ from: { name: "Portfolio contact", address: user }, to: owner, replyTo: { name: d.name, address: d.email }, subject, ...(await mail(createElement(OwnerNotification, { d }))) });
  } catch (err) {
    console.error("contact: send failed", err);
    return json(502, { error: "Couldn't send right now." });
  }
  if (SUBMISSION_ID.test(id)) delivered.add(id);

  // The lead is safe in your inbox. The auto-reply is a courtesy: skip it when a recipient or this
  // instance is over its cap, and never fail the request because of it.
  if (d.channel === "email" && !perRecipient.take(d.email.toLowerCase()) && !autoReplies.take("all")) {
    const hi = greetName(d.name);
    try {
      await mailer.sendMail({
        from: { name: site.name, address: user },
        to: d.email,
        replyTo: owner,
        subject: hi === "there" ? "Got your message" : `Got your message, ${hi}`,
        ...(await mail(createElement(AutoReply, { d }))),
      });
    } catch (err) {
      console.error("contact: auto-reply failed", err);
    }
  }
  return json(200, { ok: true });
}
