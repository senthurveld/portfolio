import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Copy } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useSearchParams } from "react-router";
import { FadeIn } from "@/components/FadeIn";
import { PageHeader } from "@/components/PageHeader";
import { contact, site } from "@/content/site";
import { cn, contactMailto, validateContact, type ContactDraft } from "@/lib/logic";
import { LocalTime } from "./Now";

const KEY = "contact-draft";
const empty: ContactDraft = { topic: "", looking: "", timeline: "", name: "", email: "", company: "", message: "" };

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

const input =
  "w-full rounded-2xl border border-[var(--home-line)] bg-[var(--home-card)] px-5 py-4 text-base outline-none transition-colors placeholder:text-[var(--home-dim)] focus:border-[var(--home-fg)] aria-[invalid=true]:border-[#ff8a8a]";

export default function Contact() {
  const [params] = useSearchParams();
  const reduce = useReducedMotion();
  const [d, setD] = useState<ContactDraft>(() => {
    const draft = loadDraft();
    const topic = contact.topics.find((t) => t.id === params.get("topic"))?.label;
    return topic ? { ...draft, topic } : draft;
  });
  const [step, setStep] = useState(() => (d.topic ? 1 : 0));
  const [errors, setErrors] = useState<ReturnType<typeof validateContact>>({});
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [trap, setTrap] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch {
      /* storage blocked */
    }
  }, [d]);

  const set = <K extends keyof ContactDraft>(k: K, v: ContactDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const last = contact.steps.length - 1;

  const next = () => {
    if (step === 2) {
      const e = validateContact(d);
      const stepErr = { name: e.name, email: e.email };
      if (stepErr.name || stepErr.email) return setErrors(stepErr);
      setErrors({});
    }
    setStep((s) => Math.min(last, s + 1));
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (step < last) return next();
    if (trap) return;
    const e = validateContact(d);
    setErrors(e);
    if (Object.keys(e).length) {
      if (e.name || e.email) setStep(2);
      return;
    }
    window.location.href = contactMailto(site.email, d);
    setSent(true);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
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

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} eyebrow={contact.label} title="Contact" lead={contact.intro} />
      <FadeIn y={28} delay={0.25} className="shell grid gap-14 pb-[var(--section-y)] lg:grid-cols-[1fr_20rem]">
        {sent ? (
          <div role="status" className="rounded-[1.75rem] border border-[var(--home-line)] bg-[var(--home-card)] p-8">
            <Check className="size-6 text-live" />
            <p className="mt-4 text-xl font-semibold">Almost there.</p>
            <p className="mt-2 text-[var(--home-muted)]">
              {contact.sent}{" "}
              <a href={`mailto:${site.email}`} className="underline-grow font-medium text-[var(--home-fg)]">
                {site.email}
              </a>
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate aria-labelledby="form-title" className="rounded-[1.75rem] border border-[var(--home-line)] bg-[var(--home-card)] p-6 md:p-10">
            <h2 id="form-title" className="sr-only">Project enquiry</h2>
            <ol aria-label="Steps" className="mb-10 grid grid-cols-4 gap-2">
              {contact.steps.map((s, i) => (
                <li key={s} aria-current={i === step ? "step" : undefined}>
                  <span className={cn("block h-0.5 rounded-full transition-colors", i <= step ? "bg-[var(--home-fg)]" : "bg-[var(--home-line)]")} />
                  <span className={cn("kicker mt-2 block text-[0.62rem]", i === step ? "text-[var(--home-fg)]" : "text-[var(--home-dim)]")}>
                    <span className="num tracking-normal">{String(i + 1).padStart(2, "0")}</span> {s}
                  </span>
                </li>
              ))}
            </ol>

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
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                {step === 0 && <Chips legend="What's this about?" options={contact.topics.map((t) => t.label)} value={d.topic} onChange={(v) => set("topic", v)} />}
                {step === 1 && (
                  <>
                    <Chips legend="Looking for (optional)" options={contact.looking} value={d.looking} onChange={(v) => set("looking", v)} />
                    <Chips legend="Timeline (optional)" options={contact.timeline} value={d.timeline} onChange={(v) => set("timeline", v)} />
                  </>
                )}
                {step === 2 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <Field label="Name" error={errors.name}>
                      {(id, db) => <input id={id} className={input} autoComplete="name" value={d.name} aria-invalid={!!errors.name} aria-describedby={db} onChange={(e) => set("name", e.target.value)} />}
                    </Field>
                    <Field label="Email" error={errors.email}>
                      {(id, db) => <input id={id} type="email" className={input} autoComplete="email" value={d.email} aria-invalid={!!errors.email} aria-describedby={db} onChange={(e) => set("email", e.target.value)} />}
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Company" optional>
                        {(id) => <input id={id} className={input} autoComplete="organization" value={d.company} onChange={(e) => set("company", e.target.value)} />}
                      </Field>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <Field label="Message" error={errors.message}>
                    {(id, db) => (
                      <>
                        <textarea id={id} rows={7} className={cn(input, "resize-y")} value={d.message} aria-invalid={!!errors.message} aria-describedby={db} placeholder="What are you building, and what do you need from me?" onChange={(e) => set("message", e.target.value)} />
                        <p className="num mt-2 text-right text-[var(--home-dim)]">{d.message.trim().length} / 20+</p>
                      </>
                    )}
                  </Field>
                )}
              </m.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between gap-4">
              <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold tracking-[0.2em] uppercase disabled:invisible">
                <ArrowLeft className="size-4" /> Back
              </button>
              <button type="submit" disabled={step === 0 && !d.topic} className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--home-fg)] px-7 py-3 text-sm font-semibold tracking-[0.2em] text-[var(--home-on-fg)] uppercase transition-opacity disabled:opacity-40">
                {step === last ? "Send" : "Next"}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
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
