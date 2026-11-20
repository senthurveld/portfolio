import { useState } from "react";
import { Words } from "./Words";
import { process, services } from "../content/site";
import { useReveal } from "../lib/hooks";
import { scrollToId } from "../lib/motion";
import { play } from "../lib/sound";

/** Service "lanes": a numbered list where one lane is open at a time. */
export default function Services() {
  const ref = useReveal();
  const [open, setOpen] = useState(0);

  const ask = (e) => {
    e.preventDefault();
    dispatchEvent(new CustomEvent("contact-topic", { detail: "Freelance project" }));
    scrollToId("contact");
  };

  return (
    <section id="services" ref={ref} aria-labelledby="services-title" className="section">
      <div className="wrap">
        <div className="clay-lg grid gap-12 p-6 sm:p-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:p-14">
          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <div className="head mb-0">
              <p className="label">What I build</p>
              <h2 id="services-title" data-split>
                <Words>{String(services.length).padStart(2, "0")} lanes</Words>
              </h2>
              <p>For businesses and teams who need a working site, not a mock-up. Hire me for one lane or the whole build. Every project starts with a short call and a written quote.</p>
            </div>
            <p data-reveal className="text-[15.5px]">
              Not sure which lane fits?{" "}
              <a href="#contact" onClick={ask} className="link font-medium">
                Tell me what you need
              </a>
            </p>
          </div>

          <ol className="border-t border-line">
            {services.map((s, i) => {
              const on = open === i;
              return (
                <li key={s.name} data-reveal className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      id={`lane-${i}`}
                      aria-expanded={on}
                      aria-controls={`lane-panel-${i}`}
                      onClick={() => (setOpen(on ? -1 : i), play("tick"))}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(i)}
                      className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3 py-6 text-left"
                    >
                      <span className="font-mono text-[13px] text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`font-display text-[clamp(1.4rem,1.1rem+1.4vw,2.2rem)] font-bold leading-[1.05] tracking-[-0.03em] transition-colors duration-300 ${on ? "text-ink" : "text-muted group-hover:text-ink"}`}>
                        {s.name}
                      </span>
                      <span aria-hidden="true" className={`clay-pastel grid h-8 w-8 place-items-center rounded-full text-sm transition-transform duration-500 ease-[var(--ease-spring)] ${on ? "rotate-45" : ""}`} style={{ background: `var(--${s.tone})` }}>
                        +
                      </span>
                      <span className="col-start-2 mt-1 text-[14.5px] text-muted">{s.tagline}</span>
                    </button>
                  </h3>
                  <div
                    id={`lane-panel-${i}`}
                    role="region"
                    aria-labelledby={`lane-${i}`}
                    className="grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out)]"
                    style={{ gridTemplateRows: on ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden" inert={!on}>
                      <div data-lane={on ? "open" : "shut"} className="grid gap-4 pb-7 pl-[calc(2.5rem+0.75rem)]">
                        <p className="lane-in max-w-[46ch] text-[15.5px]" style={{ "--i": 0 }}>
                          {s.line}
                        </p>
                        <ul className="flex flex-wrap gap-2">
                          {s.tags.map((t, j) => (
                            <li key={t} className="lane-in chip" style={{ "--i": j + 1 }}>
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <h3 className="label pt-1 text-ink">How a project runs</h3>
          <ol className="grid gap-4 sm:grid-cols-2">
            {process.map(([h, t], i) => (
              <li key={h} data-reveal="pop" className="well flex flex-col gap-1.5 p-5">
                <span className="font-mono text-xs text-muted">Step {i + 1}</span>
                <span className="font-display text-lg font-bold text-ink">{h}</span>
                <span className="text-[14.5px]">{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
