// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { services } from "@/content/site";
import { POST } from "../../api/contact";
import { resetLimits } from "../../api/_limit";

const { sendMail } = vi.hoisted(() => ({ sendMail: vi.fn() }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail }) } }));

const ok = {
  reason: "freelance",
  detail: "Redesign",
  timeline: "ASAP",
  name: "Asha",
  email: "asha@example.com",
  company: "",
  message: "I need a five page site for my bakery.",
  channel: "email",
  website: "",
  elapsed: 9000,
};
const JSON_HEADERS = { "Content-Type": "application/json", Origin: "http://localhost", "x-real-ip": "203.0.113.1" };
const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(new Request("http://localhost/api/contact", { method: "POST", headers: { ...JSON_HEADERS, ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) }));
const mails = () => sendMail.mock.calls.map((c) => c[0]);

beforeEach(() => {
  resetLimits();
  sendMail.mockReset().mockResolvedValue({});
  vi.stubEnv("GMAIL_USER", "me@gmail.com");
  vi.stubEnv("GMAIL_APP_PASSWORD", "app-password");
  vi.stubEnv("CONTACT_TO", "");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/contact", () => {
  it("emails the owner (reply-to visitor) and auto-replies on the email channel", async () => {
    const res = await post(ok);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const [owner, reply] = mails();
    expect(mails()).toHaveLength(2);
    expect(owner).toMatchObject({ to: "me@gmail.com", replyTo: { name: "Asha", address: "asha@example.com" }, subject: "[Freelance · Redesign · ASAP] Asha" });
    expect(owner.text).toContain(ok.message);
    expect(reply).toMatchObject({ to: "asha@example.com", replyTo: "me@gmail.com", subject: "Got your message, Asha" });
    expect(reply.html).toContain(services.process[0]![0]); // freelance variant lists the process
  });

  it("never echoes the visitor's text in the auto-reply", async () => {
    await post({ ...ok, name: "evil.com/win Bob", message: "Claim your prize at https://evil.example now!!" });
    const [, reply] = mails();
    expect(reply.subject).toBe("Got your message");
    expect(reply.html).toContain("Hi there, got it.");
    for (const part of [reply.html, reply.text, reply.subject]) {
      expect(part).not.toContain("evil");
      expect(part).not.toContain("Claim your prize");
    }
  });

  it("tailors the auto-reply to the reason", async () => {
    await post({ ...ok, reason: "hiring", detail: "Full-time", timeline: "" });
    const [, reply] = mails();
    expect(reply.html).toContain("/resume.pdf");
    expect(reply.html).toContain("Download my resume");
    expect(reply.html).not.toContain(services.process[0]![1]);
    expect(reply.text).toContain("Download my resume");
  });

  it("only copies the owner on the WhatsApp channel", async () => {
    await post({ ...ok, channel: "whatsapp" });
    expect(mails()).toHaveLength(1);
    expect(mails()[0].subject.startsWith("[via WhatsApp] ")).toBe(true);
  });

  it("silently drops bots: honeypot filled or too fast", async () => {
    expect((await post({ ...ok, website: "spam.example" })).status).toBe(200);
    expect((await post({ ...ok, elapsed: 400 })).status).toBe(200);
    expect((await post({ ...ok, elapsed: undefined })).status).toBe(200);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("only accepts JSON from this site's own pages", async () => {
    expect((await post(ok, { Origin: "" })).status).toBe(403);
    expect((await post(ok, { Origin: "https://evil.example" })).status).toBe(403);
    expect((await post(ok, { Origin: "null" })).status).toBe(403);
    expect((await post(ok, { "Content-Type": "text/plain" })).status).toBe(415);
    expect((await post(ok, { "Content-Type": "application/x-www-form-urlencoded" })).status).toBe(415);
    expect((await post(ok, { Origin: "https://senthurdev.vercel.app" })).status).toBe(200); // public site via a proxy/custom host
    expect(mails()).toHaveLength(2);
  });

  it("rejects bad input", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post("[1,2]")).status).toBe(400);
    expect((await post({ ...ok, reason: "spam" })).status).toBe(400);
    expect((await post({ ...ok, channel: "sms" })).status).toBe(400);
    const res = await post({ ...ok, email: "nope", message: "short" });
    expect(res.status).toBe(400);
    expect(Object.keys((await res.json()).errors).sort()).toEqual(["email", "message"]);
    expect((await post({ ...ok, message: "x".repeat(11_000) })).status).toBe(413);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("refuses addresses that could smuggle a second recipient", async () => {
    for (const email of ["a,b@example.com", "a@example.com, b@example.com", '"a"@example.com', "<a@example.com>", "a@example"]) {
      expect((await post({ ...ok, email }, { "x-real-ip": email })).status).toBe(400);
    }
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("drops follow-ups that aren't on the list and escapes HTML", async () => {
    await post({ ...ok, detail: "<img src=x>", timeline: "Yesterday", name: "<b>Asha</b>" });
    const [owner] = mails();
    expect(owner.subject).toBe("[Freelance] <b>Asha</b>");
    expect(owner.html).not.toContain("<b>Asha</b>");
    expect(owner.html).toContain("&lt;b&gt;Asha&lt;/b&gt;");
    expect(owner.html).not.toContain("<img");
  });

  it("rate limits each IP: 5 per 10 minutes, with Retry-After", async () => {
    for (let i = 0; i < 5; i++) expect((await post(ok, { "x-real-ip": "198.51.100.7" })).status).toBe(200);
    const res = await post(ok, { "x-real-ip": "198.51.100.7" });
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(500);
    expect((await res.json()).retryAfter).toBeGreaterThan(500);
    expect((await post(ok, { "x-real-ip": "198.51.100.8" })).status).toBe(200); // other visitors unaffected
  });

  it("caps auto-replies per recipient at 2 a day but still delivers the lead", async () => {
    for (const ip of ["192.0.2.1", "192.0.2.2", "192.0.2.3"]) await post({ ...ok, email: "Victim@Example.com" }, { "x-real-ip": ip });
    const to = mails().map((m) => m.to);
    expect(to.filter((t) => t === "me@gmail.com")).toHaveLength(3);
    expect(to.filter((t) => t !== "me@gmail.com")).toHaveLength(2);
  });

  it("drops a retried submission that was already delivered", async () => {
    const id = "6f1c2a9e-3b4d-4e5f-8a7b-1c2d3e4f5a6b";
    expect((await post({ ...ok, id })).status).toBe(200);
    expect((await post({ ...ok, id })).status).toBe(200);
    expect(mails()).toHaveLength(2); // owner + auto-reply, once
    await post({ ...ok, id: "6f1c2a9e-3b4d-4e5f-8a7b-1c2d3e4f5a6c" });
    expect(mails()).toHaveLength(4); // new id = new lead, plus this recipient's 2nd (last) auto-reply today
  });

  it("returns 502 when Gmail refuses the lead, 200 if only the auto-reply fails, 500 when not configured", async () => {
    sendMail.mockRejectedValueOnce(new Error("535 auth"));
    expect((await post(ok)).status).toBe(502);
    sendMail.mockReset().mockResolvedValueOnce({}).mockRejectedValueOnce(new Error("550 mailbox"));
    expect((await post(ok)).status).toBe(200);
    vi.stubEnv("GMAIL_APP_PASSWORD", "");
    expect((await post(ok)).status).toBe(500);
  });
});
