import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Words } from "./Words";
import { site } from "../content/site";
import { copyEmail, useIstTime, useReveal } from "../lib/hooks";
import { play } from "../lib/sound";

// Must match TOPICS in api/contact.js.
const topics = ["Freelance project", "Full-time role", "Something else"];

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = "Add your name (2+ characters).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "That email doesn't look right.";
  if (v.message.trim().length < 10) e.message = "A line or two more, please (10+ characters).";
  if (v.message.length > 2000) e.message = "Keep it under 2000 characters.";
  return e;
}

export default function Contact() {
  const ref = useReveal();
  const time = useIstTime();
  const [v, setV] = useState({ name: "", email: "", topic: topics[0], message: "", company: "" });
  const [err, setErr] = useState({});
  const [status, setStatus] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | sent

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  // Park the topic thumb under the checked pill. Transitions switch on after the first placement
  // so it doesn't slide in from the corner on load.
  const pills = useRef(null);
  const thumb = useRef(null);
  useLayoutEffect(() => {
    const box = pills.current;
    const t = thumb.current;
    const place = () => {
      const el = box.querySelector("input:checked + span");
      if (!el) return;
      t.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`;
      t.style.width = `${el.offsetWidth}px`;
      t.style.height = `${el.offsetHeight}px`;
    };
    place();
    const raf = requestAnimationFrame(() => (t.dataset.ready = ""));
    const ro = new ResizeObserver(place);
    ro.observe(box);
    return () => (cancelAnimationFrame(raf), ro.disconnect());
  }, [v.topic]);

  // Services section can preselect a topic.
  useEffect(() => {
    const on = (e) => topics.includes(e.detail) && setV((s) => ({ ...s, topic: e.detail }));
    addEventListener("contact-topic", on);
    return () => removeEventListener("contact-topic", on);
  }, []);

  const mailFallback = () => {
    const subject = `Portfolio: ${v.topic} - ${v.name}`;
    const body = `${v.message}\n\n${v.name} (${v.email})`;
    location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("Opening your mail app instead. If nothing happens, copy the email address above.");
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(v);
    setErr(found);
    if (Object.keys(found).length) {
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setState("sending");
    setStatus("");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = r.headers.get("content-type")?.includes("json") ? await r.json() : null;
      if (r.ok && data?.ok) {
        setState("sent");
        play("sent");
        setStatus(`Sent. Thanks, ${v.name.split(" ")[0]}. I'll reply within one working day.`);
        setV((s) => ({ ...s, message: "" }));
        return;
      }
      setState("idle");
      // No function deployed (dev / 404) or email not configured: fall back, values kept.
      if (!data || r.status === 503 || r.status >= 500) return mailFallback();
      setStatus(data.error || "Something went wrong. Please try again.");
    } catch {
      setState("idle");
      mailFallback();
    }
  };

  const field =
    "mt-2 w-full rounded-[14px] bg-bg-2 px-4 py-3 text-[15px] text-ink shadow-[var(--clay-press)] outline-none transition-shadow placeholder:text-muted/80 focus-visible:outline-2 focus-visible:outline-red aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-red";

  return (
    <section id="contact" ref={ref} aria-labelledby="contact-title" className="section">
      <div className="wrap">
        <div className="clay-lg grid gap-12 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 lg:p-14">
          <div className="flex min-w-0 flex-col">
            <div className="head mb-8">
              <p className="label">Contact</p>
              <h2 id="contact-title" data-split>
                <Words>
                  Tell me what you're <span className="accent">building.</span>
                </Words>
              </h2>
              <p>A project, a role, or a question. Send the problem and a rough timeline, and I'll reply within one working day.</p>
            </div>

            <ul data-reveal className="mb-6 flex flex-wrap gap-2">
              <li className="chip gap-2 bg-surface shadow-[var(--clay)]">
                <span className="h-2 w-2 rounded-full bg-mint" aria-hidden="true" />
                Open to new projects
              </li>
              <li className="chip bg-surface shadow-[var(--clay)]">
                {site.city} · <time className="tabular-nums">{time}</time> IST
              </li>
            </ul>
            <div data-reveal className="well flex flex-wrap items-center justify-between gap-3 p-2 pl-4">
              <span className="min-w-0 truncate font-mono text-[14px] text-ink">{site.email}</span>
              <button type="button" onClick={copyEmail} className="btn btn-secondary min-h-10 px-4 text-sm">
                Copy
              </button>
            </div>
            <div data-reveal className="mt-4 flex flex-wrap gap-3">
              <a href={site.github} target="_blank" rel="noreferrer" className="btn btn-secondary">
                GitHub ↗
              </a>
              <a href={site.linkedin} target="_blank" rel="noreferrer" className="btn btn-secondary">
                LinkedIn ↗
              </a>
            </div>
          </div>

          <form onSubmit={submit} noValidate className="grid min-w-0 content-start gap-5">
            <fieldset data-reveal>
              <legend className="label text-ink">I'm reaching out about</legend>
              {/* A single ink pill slides to the chosen topic, instead of three pills swapping colour. */}
              <div ref={pills} className="relative isolate mt-3 flex w-fit max-w-full flex-wrap gap-1 rounded-[22px] bg-bg-2 p-1 shadow-[var(--clay-press)]">
                <span ref={thumb} aria-hidden="true" className="topic-thumb absolute left-0 top-0 rounded-full bg-ink shadow-[var(--clay)]" />
                {topics.map((t) => (
                  <label key={t}>
                    <input type="radio" name="topic" value={t} checked={v.topic === t} onChange={set("topic")} className="peer sr-only" />
                    <span className="relative block cursor-pointer rounded-full px-4 py-2 text-[14.5px] font-medium text-ink transition-colors duration-300 peer-checked:text-bg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red">
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div data-reveal className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="f-name" className="text-[14.5px] font-medium text-ink">
                  Name
                </label>
                <input id="f-name" value={v.name} onChange={set("name")} autoComplete="name" className={field} aria-invalid={!!err.name} aria-describedby={err.name ? "e-name" : undefined} />
                {err.name && (
                  <p id="e-name" className="msg-in mt-1.5 text-[13.5px] text-red">
                    {err.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="f-email" className="text-[14.5px] font-medium text-ink">
                  Email
                </label>
                <input id="f-email" type="email" value={v.email} onChange={set("email")} autoComplete="email" className={field} aria-invalid={!!err.email} aria-describedby={err.email ? "e-email" : undefined} />
                {err.email && (
                  <p id="e-email" className="msg-in mt-1.5 text-[13.5px] text-red">
                    {err.email}
                  </p>
                )}
              </div>
            </div>

            <div data-reveal>
              <label htmlFor="f-message" className="text-[14.5px] font-medium text-ink">
                Message
              </label>
              <textarea
                id="f-message"
                rows={5}
                value={v.message}
                onChange={set("message")}
                className={`${field} resize-y`}
                aria-invalid={!!err.message}
                aria-describedby={err.message ? "e-message h-message" : "h-message"}
                placeholder="What it is, who it's for, and when you need it."
              />
              <p id="h-message" className="mt-1.5 text-[13px] text-muted">
                {err.message ? (
                  <span id="e-message" className="msg-in inline-block text-red">
                    {err.message}
                  </span>
                ) : (
                  `${v.message.length} / 2000`
                )}
              </p>
            </div>

            {/* Honeypot: hidden from people, filled by bots */}
            <div aria-hidden="true" className="absolute -left-[9999px]">
              <label htmlFor="f-company">Company</label>
              <input id="f-company" tabIndex={-1} autoComplete="off" value={v.company} onChange={set("company")} />
            </div>

            <div data-reveal className="flex flex-wrap items-center gap-4">
              <button type="submit" data-magnetic className="btn btn-primary h-14 px-8" disabled={state === "sending"}>
                {state === "sending" && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
                {state === "sent" && (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path className="draw-in" pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
                {state === "sending" ? "Sending…" : state === "sent" ? "Send another" : "Send message"}
              </button>
              <p role="status" aria-live="polite" className="min-w-0 text-[14.5px] text-ink">
                {status && (
                  <span key={status} className="msg-in inline-block">
                    {status}
                  </span>
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
