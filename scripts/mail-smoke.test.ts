// @vitest-environment node
// Sends REAL emails through Gmail using your local .env. Run: npm run mail:test
// Skipped during `npm test`. The visitor is you+portfolio-test@gmail.com, so both mails land in your inbox.
import { expect, it } from "vitest";
import { POST } from "../api/contact";

it.runIf(process.env.npm_lifecycle_event === "mail:test")("sends the owner mail and the auto-reply via Gmail", async () => {
  process.loadEnvFile(".env");
  const user = process.env.GMAIL_USER;
  if (!user || !process.env.GMAIL_APP_PASSWORD) throw new Error("Add GMAIL_USER and GMAIL_APP_PASSWORD to .env");

  const reason = (process.env.MAIL_REASON ?? "freelance") as "hiring" | "freelance" | "hello";
  const visitor = user.replace("@", "+portfolio-test@");
  const res = await POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost" },
      body: JSON.stringify({
        reason,
        detail: reason === "hiring" ? "Full-time" : reason === "freelance" ? "Business website" : "",
        timeline: reason === "freelance" ? "ASAP" : "",
        name: "Test Visitor",
        email: visitor,
        company: "Local test",
        message: `Local smoke test of the ${reason} auto-reply.\n\nIf you can read this, Gmail sending works.`,
        channel: "email",
        website: "",
        elapsed: 9000,
      }),
    }),
  );
  const body = await res.json();
  console.log(`status ${res.status}`, body, `\nCheck ${user}: "[...] Test Visitor" + "Got your message, Test" (to ${visitor}).`);
  expect(res.status, JSON.stringify(body)).toBe(200);
}, 30_000);
