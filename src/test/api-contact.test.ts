// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { services } from "@/content/site";
import { POST } from "../../api/contact";

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
const post = (body: unknown) => POST(new Request("http://localhost/api/contact", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));
const mails = () => sendMail.mock.calls.map((c) => c[0]);

beforeEach(() => {
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
    const [owner, reply] = mails();
    expect(mails()).toHaveLength(2);
    expect(owner).toMatchObject({ to: "me@gmail.com", replyTo: { name: "Asha", address: "asha@example.com" }, subject: "[Freelance · Redesign · ASAP] Asha" });
    expect(reply).toMatchObject({ to: { address: "asha@example.com" }, replyTo: "me@gmail.com", subject: "Got your message, Asha" });
    expect(reply.html).toContain(services.process[0]![0]); // freelance variant lists the process
    expect(reply.text).toContain(ok.message);
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

  it("rejects bad input", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post({ ...ok, reason: "spam" })).status).toBe(400);
    expect((await post({ ...ok, channel: "sms" })).status).toBe(400);
    const res = await post({ ...ok, email: "nope", message: "short" });
    expect(res.status).toBe(400);
    expect(Object.keys((await res.json()).errors).sort()).toEqual(["email", "message"]);
    expect((await post({ ...ok, message: "x".repeat(11_000) })).status).toBe(413);
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

  it("returns 502 when Gmail refuses and 500 when not configured", async () => {
    sendMail.mockRejectedValueOnce(new Error("535 auth"));
    expect((await post(ok)).status).toBe(502);
    vi.stubEnv("GMAIL_APP_PASSWORD", "");
    expect((await post(ok)).status).toBe(500);
  });
});
