// Vercel Node function: contact form → email via Resend.
// Env: RESEND_API_KEY (server only). CONTACT_FROM defaults to Resend's onboarding sender until a domain is verified.
const TO = "senthurveld2005@gmail.com";
const FROM = process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>";
const TOPICS = ["Full-time role", "Freelance project", "Something else"];

// In-memory rate limit: resets whenever the function instance is recycled. Good enough to stop bursts.
const hits = new Map();
const LIMIT = 5;
const WINDOW = 10 * 60 * 1000;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function validate(b) {
  const name = typeof b?.name === "string" ? b.name.trim() : "";
  const email = typeof b?.email === "string" ? b.email.trim() : "";
  const message = typeof b?.message === "string" ? b.message.trim() : "";
  const topic = TOPICS.includes(b?.topic) ? b.topic : null;
  if (name.length < 2 || name.length > 80) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return null;
  if (message.length < 10 || message.length > 2000) return null;
  if (!topic) return null;
  return { name, email, message, topic };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

  // Honeypot filled → pretend success, send nothing.
  if (body.company) return res.status(200).json({ ok: true });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (recent.length >= LIMIT) return res.status(429).json({ ok: false, error: "Too many messages — try again in a few minutes." });
  hits.set(ip, [...recent, now]);

  const v = validate(body);
  if (!v) return res.status(400).json({ ok: false, error: "Please check the form fields." });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: "Email isn't set up yet." });

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: v.email,
        subject: `Portfolio: ${v.topic} — ${v.name}`,
        text: `${v.message}\n\n— ${v.name} <${v.email}>`,
        html: `<p>${esc(v.message).replace(/\n/g, "<br>")}</p><p>— ${esc(v.name)} &lt;${esc(v.email)}&gt;<br>Topic: ${esc(v.topic)}</p>`,
      }),
    });
    if (!r.ok) throw new Error(`resend ${r.status}: ${await r.text()}`);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("contact", e);
    return res.status(500).json({ ok: false, error: "Couldn't send right now." });
  }
}
