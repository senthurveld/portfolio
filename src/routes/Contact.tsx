import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Mail, MessageCircle, RotateCcw, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useSearchParams } from "react-router";
import { FadeIn } from "@/components/FadeIn";
import { PageHeader } from "@/components/PageHeader";
import { PaperBurst, type BurstOrigin } from "@/components/PaperBurst";
import { contact, site, type ContactChannel, type ContactReason } from "@/content/site";
import { CONTACT_MAX, cn, contactMailto, contactReasonLine, real, reasonFromParam, validateContact, whatsappLink, type ContactDraft } from "@/lib/logic";
import { LocalTime } from "./Now";

const KEY = "contact-draft-v2";
const empty: ContactDraft = { reason: "", detail: "", timeline: "", name: "", email: "", company: "", message: "", channel: "" };
const EASE = [0.22, 1, 0.36, 1] as const;

function loadDraft(): ContactDraft {
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return empty;
  }
}

function Chips({ legend, options, value, onChange }: { legend: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="kicker mb-4 text-[var(--home-dim)]">{legend}</legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => (
          <label
            key={o}
            className={cn(
              "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-5 text-[0.95rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-steel",
              value === o ? "border-[var(--home-fg)] bg-[var(--home-fg)] text-[var(--home-on-fg)]" : "border-[var(--home-line)] hover:border-[var(--home-fg)]",
            )}
          >
            <input type="radio" name={legend} value={o} checked={value === o} onChange={() => onChange(o)} className="sr-only" />
            {value === o && <Check className="size-4" />}
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Large radio card, used for the reason and the channel. */
function Choice({ name, checked, onChange, title, hint, icon: Icon }: { name: string; checked: boolean; onChange: () => void; title: string; hint: string; icon?: LucideIcon }) {
  return (
    <label
      className={cn(
        "flex min-h-28 cursor-pointer flex-col justify-between gap-6 rounded-2xl border p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-steel",
        checked ? "border-[var(--home-fg)] bg-[var(--home-fg)] text-[var(--home-on-fg)]" : "border-[var(--home-line)] hover:border-[var(--home-fg)]",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span className="flex items-start justify-between gap-3 text-lg leading-tight font-semibold">
        <span className="flex items-center gap-2.5">
          {Icon && <Icon aria-hidden="true" className="size-5" />}
          {title}
        </span>
        <Check aria-hidden="true" className={cn("size-5 shrink-0 transition-opacity", checked ? "opacity-100" : "opacity-0")} />
      </span>
      <span className={cn("text-sm", checked ? "opacity-75" : "text-[var(--home-muted)]")}>{hint}</span>
    </label>
  );
}

function Field({ label, error, optional, children }: { label: string; error?: string; optional?: boolean; children: (id: string, describedBy?: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="kicker mb-2 block text-[var(--home-dim)]">
        {label} {optional && <span className="normal-case tracking-normal opacity-70">(optional)</span>}
      </label>
      {children(id, error ? `${id}-err` : undefined)}
      {error && (
        <p id={`${id}-err`} className="mt-2 text-sm text-[#ff8a8a] light:text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Progress bar. at = steps.length shows everything done. */
function Steps({ at }: { at: number }) {
  return (
    <ol aria-label="Steps" className="mb-10 grid grid-cols-3 gap-2">
      {contact.steps.map((s, i) => (
        <li key={s} aria-current={i === at ? "step" : undefined}>
          <span className={cn("block h-0.5 rounded-full transition-colors", i <= at ? "bg-[var(--home-fg)]" : "bg-[var(--home-line)]")} />
          <span className={cn("kicker mt-2 block text-[0.62rem]", i === at ? "text-[var(--home-fg)]" : "text-[var(--home-dim)]")}>
            <span className="num tracking-normal">{String(i + 1).padStart(2, "0")}</span> {s}
          </span>
        </li>
      ))}
    </ol>
  );
}

const input =
  "w-full rounded-2xl border border-[var(--home-line)] bg-[var(--home-card)] px-5 py-4 text-base outline-none transition-colors placeholder:text-[var(--home-dim)] focus:border-[var(--home-fg)] aria-[invalid=true]:border-[#ff8a8a]";

const primary =
  "group inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--home-fg)] px-7 py-3 text-sm font-semibold tracking-[0.2em] text-[var(--home-on-fg)] uppercase transition-opacity disabled:opacity-40";

export default function Contact() {
  const [params] = useSearchParams();
  const reduce = useReducedMotion();
  const whatsapp = real(site.whatsapp);
  const [d, setD] = useState<ContactDraft>(() => {
    const draft = loadDraft();
    const pre = reasonFromParam(params.get("topic"));
    if (!pre) return draft;
    const same = draft.reason === pre[0];
    return { ...draft, reason: pre[0], detail: pre[1] || (same ? draft.detail : ""), timeline: same ? draft.timeline : "" };
  });
  const [step, setStep] = useState(() => (d.reason ? 1 : 0));
  const [errors, setErrors] = useState<ReturnType<typeof validateContact>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "sent">("idle");
  const [sentVia, setSentVia] = useState<ContactChannel>("email");
  const [tearing, setTearing] = useState(false);
  const [burst, setBurst] = useState<BurstOrigin | null>(null);
  const [formHeight, setFormHeight] = useState<number>();
  const [copied, setCopied] = useState(false);
  const [trap, setTrap] = useState("");
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  const waRef = useRef<HTMLAnchorElement>(null);
  const sentRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch {
      /* storage blocked */
    }
  }, [d]);

  useEffect(() => {
    if (status === "sent") sentRef.current?.focus({ preventScroll: true });
  }, [status]);

  const set = <K extends keyof ContactDraft>(k: K, v: ContactDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const pickReason = (id: ContactReason) => setD((x) => (x.reason === id ? x : { ...x, reason: id, detail: "", timeline: "" }));
  const last = contact.steps.length - 1;
  const reason = contact.reasons.find((r) => r.id === d.reason);
  const channel: ContactChannel | "" = whatsapp ? d.channel : "email";
  const waHref = whatsapp ? whatsappLink(whatsapp, d) : "";

  /** Validates name, email and message; shows errors and focuses the first bad field. */
  const check = () => {
    const e = validateContact(d);
    flushSync(() => setErrors(e));
    if (!Object.keys(e).length) return true;
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    return false;
  };

  const next = () => {
    if (step === 1 && !check()) return;
    setStep((s) => Math.min(last, s + 1));
  };

  const payload = (via: ContactChannel) => JSON.stringify({ ...d, channel: via, website: trap, elapsed: Date.now() - startedAt.current });

  // Slip tears off, button pops, paper bursts from the button, then the success card prints in.
  const celebrate = (via: ContactChannel) => {
    setSentVia(via);
    setFormHeight(formRef.current?.offsetHeight);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    if (reduce) return setStatus("sent");
    const r = (waRef.current ?? sendRef.current)?.getBoundingClientRect();
    setTearing(true);
    if (r) setTimeout(() => setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }), 60);
    setTimeout(() => setStatus("sent"), 380);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (step < last) return next();
    if (channel === "whatsapp") return waRef.current?.click();
    if (channel !== "email" || status === "sending") return;
    if (!check()) return setStep(1);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload("email") });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      celebrate("email");
    } catch {
      setStatus("error");
    }
  };

  // The link itself opens WhatsApp (no popup blocker). This only drops a copy in my inbox.
  const onWhatsApp = () => {
    fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload("whatsapp"), keepalive: true }).catch(() => {});
    celebrate("whatsapp");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the address is visible anyway */
    }
  };

  const pop = tearing ? { scale: [1, 0.94, 1.04, 1] } : undefined;
  const sendLabel = step < last ? "Next" : tearing ? "Sent" : status === "sending" ? "Sending…" : status === "error" ? "Try again" : channel === "email" ? "Send email" : "Send";
  const SendIcon = tearing ? Check : status === "error" && step === last ? RotateCcw : ArrowRight;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} eyebrow={contact.label} title="Contact" lead={contact.intro} />
      {burst && <PaperBurst from={burst} onDone={() => setBurst(null)} />}
      <FadeIn y={28} delay={0.25} className="shell grid gap-14 pb-[var(--section-y)] lg:grid-cols-[1fr_20rem]">
        {status === "sent" ? (
          // Same height as the form it replaces, so the page doesn't jump; the message sits where the button was.
          <m.div
            initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ minHeight: formHeight }}
            className="flex flex-col rounded-[1.75rem] border border-[var(--home-line)] bg-[var(--home-card)] p-6 md:p-10"
          >
            <Steps at={contact.steps.length} />
            <div role="status" className="mt-auto">
              <Check className="size-6 text-live" />
              <h2 ref={sentRef} tabIndex={-1} className="mt-4 text-3xl font-semibold outline-none md:text-4xl">
                Sent.
              </h2>
              <m.p initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.5, ease: EASE }} className="mt-3 max-w-prose text-[var(--home-muted)]">
                {contact.sent[sentVia]}
              </m.p>
              {sentVia === "whatsapp" && waHref && (
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="underline-grow mt-4 inline-block font-medium">
                  Didn't open? Tap here
                </a>
              )}
            </div>
          </m.div>
        ) : (
          <form ref={formRef} onSubmit={submit} noValidate aria-labelledby="form-title" className="rounded-[1.75rem] border border-[var(--home-line)] bg-[var(--home-card)] p-6 md:p-10">
            <h2 id="form-title" className="sr-only">
              Contact form
            </h2>
            <Steps at={step} />

            <div aria-hidden="true" className="absolute -left-[9999px]">
              <label>
                Website <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
              </label>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={step}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="space-y-8"
              >
                {step === 0 && (
                  <div>
                    <fieldset>
                      <legend className="kicker mb-4 text-[var(--home-dim)]">What brings you here?</legend>
                      <div className="grid gap-3 md:grid-cols-3">
                        {contact.reasons.map((r) => (
                          <Choice key={r.id} name="reason" checked={d.reason === r.id} onChange={() => pickReason(r.id)} title={r.label} hint={r.hint} />
                        ))}
                      </div>
                    </fieldset>
                    <AnimatePresence initial={false}>
                      {reason && (reason.detail || reason.timeline) && (
                        <m.div
                          key={reason.id}
                          initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="-mx-1 overflow-hidden px-1"
                        >
                          <div className="space-y-8 pt-8 pb-1">
                            {reason.detail && <Chips legend={reason.detail.legend} options={reason.detail.options} value={d.detail} onChange={(v) => set("detail", v)} />}
                            {reason.timeline && <Chips legend="Timeline (optional)" options={contact.timeline} value={d.timeline} onChange={(v) => set("timeline", v)} />}
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <Field label="Name" error={errors.name}>
                      {(id, db) => <input id={id} className={input} autoComplete="name" maxLength={CONTACT_MAX.name} value={d.name} aria-invalid={!!errors.name} aria-describedby={db} onChange={(e) => set("name", e.target.value)} />}
                    </Field>
                    <Field label="Email" error={errors.email}>
                      {(id, db) => <input id={id} type="email" className={input} autoComplete="email" maxLength={CONTACT_MAX.email} value={d.email} aria-invalid={!!errors.email} aria-describedby={db} onChange={(e) => set("email", e.target.value)} />}
                    </Field>
                    {d.reason !== "hello" && (
                      <div className="md:col-span-2">
                        <Field label="Company" optional>
                          {(id) => <input id={id} className={input} autoComplete="organization" maxLength={100} value={d.company} onChange={(e) => set("company", e.target.value)} />}
                        </Field>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <Field label="Message" error={errors.message}>
                        {(id, db) => (
                          <>
                            <textarea id={id} rows={7} maxLength={CONTACT_MAX.message} className={cn(input, "resize-y")} value={d.message} aria-invalid={!!errors.message} aria-describedby={db} placeholder={reason?.ask} onChange={(e) => set("message", e.target.value)} />
                            <p className="num mt-2 text-right text-[var(--home-dim)]">{d.message.trim().length} / 20+</p>
                          </>
                        )}
                      </Field>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <>
                    <fieldset>
                      <legend className="kicker mb-4 text-[var(--home-dim)]">Send it by</legend>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {contact.channels
                          .filter((c) => c.id === "email" || whatsapp)
                          .map((c) => (
                            <Choice key={c.id} name="channel" checked={channel === c.id} onChange={() => set("channel", c.id)} title={c.label} hint={c.hint} icon={c.id === "email" ? Mail : MessageCircle} />
                          ))}
                      </div>
                    </fieldset>

                    {/* The paper slip: exactly what gets sent. It tears off on send. */}
                    <m.figure
                      animate={tearing ? { y: -90, rotate: -7, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      style={{ transformOrigin: "85% 0%" }}
                      className="rounded-2xl border border-dashed border-[var(--home-line)] bg-band/50 p-5 md:p-6"
                    >
                      <figcaption className="kicker text-[0.62rem] text-[var(--home-dim)]">Your message</figcaption>
                      <dl className="mt-4 grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-2 text-sm">
                        <dt className="kicker pt-0.5 text-[0.62rem] text-[var(--home-dim)]">To</dt>
                        <dd>
                          {site.first}
                          {channel && ` · ${channel === "whatsapp" ? "WhatsApp" : "Email"}`}
                        </dd>
                        <dt className="kicker pt-0.5 text-[0.62rem] text-[var(--home-dim)]">From</dt>
                        <dd className="break-all">
                          {d.name} · {d.email}
                        </dd>
                        <dt className="kicker pt-0.5 text-[0.62rem] text-[var(--home-dim)]">About</dt>
                        <dd>{contactReasonLine(d)}</dd>
                      </dl>
                      <p className="mt-4 line-clamp-4 border-t border-dashed border-[var(--home-line)] pt-4 whitespace-pre-line text-[var(--home-muted)]">{d.message}</p>
                    </m.figure>
                  </>
                )}
              </m.div>
            </AnimatePresence>

            {status === "error" && (
              <div role="alert" className="mt-8 rounded-2xl border border-[#ff8a8a]/50 p-5 text-sm">
                <p className="font-semibold">That didn't go through.</p>
                <p className="mt-1 text-[var(--home-muted)]">
                  Your message is still here. Try again, or{" "}
                  <a href={contactMailto(site.email, d)} className="underline-grow font-medium text-[var(--home-fg)]">
                    email me directly
                  </a>
                  .
                </p>
              </div>
            )}

            <div className="mt-10 flex items-center justify-between gap-4">
              <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || status === "sending"} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold tracking-[0.2em] uppercase disabled:invisible">
                <ArrowLeft className="size-4" /> Back
              </button>
              {step === last && channel === "whatsapp" ? (
                <m.a ref={waRef} href={waHref} target="_blank" rel="noopener noreferrer" onClick={onWhatsApp} animate={pop} transition={{ duration: 0.45, ease: EASE }} className={primary}>
                  Open WhatsApp
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </m.a>
              ) : (
                <m.button
                  ref={sendRef}
                  type="submit"
                  disabled={(step === 0 && !d.reason) || (step === last && !channel) || (status === "sending" && !tearing)}
                  aria-busy={status === "sending" && !tearing}
                  animate={pop}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={primary}
                >
                  {sendLabel}
                  <SendIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </m.button>
              )}
            </div>
          </form>
        )}

        <aside className="space-y-8 lg:pt-2">
          <div>
            <p className="kicker mb-2 text-[var(--home-dim)]">Email</p>
            <a href={`mailto:${site.email}`} className="underline-grow text-lg font-medium break-all">
              {site.email}
            </a>
            <button type="button" onClick={copy} className="kicker mt-3 flex min-h-11 items-center gap-2 text-[var(--home-dim)] hover:text-[var(--home-fg)]">
              {copied ? <Check className="size-4 text-live" /> : <Copy className="size-4" />}
              <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
            </button>
          </div>
          <div>
            <p className="kicker mb-2 text-[var(--home-dim)]">Local time</p>
            <p className="text-lg">
              <LocalTime /> · {site.city}
            </p>
          </div>
          <div>
            <p className="kicker mb-2 text-[var(--home-dim)]">Open to</p>
            <p className="text-lg">{site.openTo.join(" · ")}</p>
          </div>
        </aside>
      </FadeIn>
    </main>
  );
}
