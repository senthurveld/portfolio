import { useEffect, useRef } from "react";
import { projects } from "../content/projects";
import { real, site } from "../content/site";
import { getLenis, gsap, prefersReducedMotion } from "../lib/motion";
import Cover from "./Cover";

/**
 * Case study in a native modal <dialog>: top-layer, focus-trapped, Esc closes.
 * Placeholder copy ([BRACKETS]) never renders: unfinished sections and meta rows are skipped.
 */
export default function CaseStudy({ slug, onClose, onNavigate }) {
  const ref = useRef(null);
  const body = useRef(null);
  const i = projects.findIndex((p) => p.slug === slug);
  const p = projects[i];

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (p && !d.open) {
      d.showModal();
      getLenis()?.stop();
      document.documentElement.style.overflow = "hidden";
      if (!prefersReducedMotion())
        gsap.fromTo(d, { y: 60, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" });
    }
    if (!p && d.open) d.close();
  }, [p]);

  // Content swap when paging between projects.
  useEffect(() => {
    if (!p || !body.current) return;
    body.current.scrollTop = 0;
    if (prefersReducedMotion()) return;
    gsap.fromTo(body.current.querySelectorAll("[data-in]"), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: "expo.out" });
  }, [p]);

  const finish = () => {
    getLenis()?.start();
    document.documentElement.style.overflow = "";
    onClose();
  };

  const close = () => {
    const d = ref.current;
    if (prefersReducedMotion()) return d.close();
    gsap.to(d, { y: 40, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => d.close() });
  };

  const go = (d) => onNavigate(projects[(i + d + projects.length) % projects.length].slug);
  const meta = p ? p.meta.filter(([, v]) => real(v)) : [];
  const sections = p ? p.sections.filter(([, t]) => real(t)) : [];

  return (
    <dialog
      ref={ref}
      className="case m-auto h-[100dvh] w-screen overflow-hidden bg-transparent p-0 text-body sm:h-[min(92dvh,900px)] sm:w-[min(88vw,1120px)]"
      aria-labelledby="case-title"
      onClose={finish}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => e.target === ref.current && close()}
      data-lenis-prevent
    >
      {p && (
        <div className="flex h-full flex-col overflow-hidden bg-surface shadow-[var(--clay-lg)] sm:rounded-[var(--r-xl)]">
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-8">
            <p className="label">
              {p.kind} · {p.status}
            </p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => go(-1)} className="btn btn-icon btn-secondary hidden sm:inline-flex" aria-label="Previous case study">
                ←
              </button>
              <button type="button" onClick={() => go(1)} className="btn btn-icon btn-secondary hidden sm:inline-flex" aria-label="Next case study">
                →
              </button>
              <button type="button" onClick={close} className="btn btn-icon btn-secondary" aria-label="Close case study" autoFocus>
                ✕
              </button>
            </div>
          </header>

          <div ref={body} className="flex-1 overflow-y-auto overscroll-contain">
            <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_280px] lg:gap-10">
              <div className="min-w-0">
                <h2 id="case-title" data-in className="text-[length:var(--text-5)] font-bold leading-[1.02] tracking-[-0.035em] [font-variation-settings:'opsz'_96,'wdth'_86]">
                  {p.title}
                </h2>
                <p data-in className="mt-4 max-w-[58ch] text-[1.0625rem]">
                  {p.blurb}
                </p>
                <div data-in className="mt-8">
                  <Cover project={p} index={i} large />
                </div>
                <div className="mt-10 grid gap-8">
                  {sections.map(([h, t]) => (
                    <section key={h} data-in className="grid gap-2 border-t border-line pt-6 sm:grid-cols-[180px_1fr] sm:gap-8">
                      <h3 className="label pt-1 text-ink">{h}</h3>
                      <p className="max-w-[62ch] text-[16px]">{t}</p>
                    </section>
                  ))}
                </div>
              </div>

              <aside className="flex flex-col gap-6 lg:sticky lg:top-0 lg:self-start">
                {meta.length > 0 && (
                  <dl data-in className="well grid grid-cols-[84px_1fr] gap-x-4 gap-y-3 p-5 text-[14.5px]">
                    {meta.map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="label pt-0.5">{k}</dt>
                        <dd className="text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {p.note && (
                  <p data-in className="text-[14.5px] text-muted">
                    {p.note}
                  </p>
                )}
                <div data-in className="flex flex-col gap-3">
                  {p.href && (
                    <a href={p.href} className="btn btn-primary w-full" target="_blank" rel="noreferrer">
                      Visit live site ↗
                    </a>
                  )}
                  <a href={`mailto:${site.email}?subject=${encodeURIComponent(`Walkthrough: ${p.title}`)}`} className="btn btn-secondary w-full">
                    Request a walkthrough
                  </a>
                </div>
              </aside>
            </div>
            <div className="flex justify-between gap-3 px-5 pb-6 sm:hidden">
              <button type="button" onClick={() => go(-1)} className="btn btn-secondary flex-1">
                ← Prev
              </button>
              <button type="button" onClick={() => go(1)} className="btn btn-secondary flex-1">
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
