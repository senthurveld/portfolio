import { testimonials } from "../content/site";
import { Words } from "./Words";
import { useReveal } from "../lib/hooks";

/** Client quotes. Renders nothing until real, approved quotes are added to content/site.js. */
export default function Testimonials() {
  const ref = useReveal();
  if (!testimonials.length) return null;
  return (
    <section ref={ref} aria-labelledby="quotes-title" className="section">
      <div className="wrap">
        <div className="head">
          <p className="label">Clients</p>
          <h2 id="quotes-title" data-split>
            <Words>
              What clients <span className="accent">said.</span>
            </Words>
          </h2>
        </div>
        <ul className={`grid gap-5 ${testimonials.length > 1 ? "md:grid-cols-2" : "max-w-3xl"}`}>
          {testimonials.map((t) => (
            <li key={t.name} data-reveal="pop">
              <figure className="clay flex h-full flex-col gap-6 p-7 sm:p-8">
                <blockquote className="font-display text-[1.3rem] font-medium leading-snug tracking-[-0.015em] text-ink">“{t.quote}”</blockquote>
                <figcaption className="mt-auto text-[14.5px]">
                  <span className="font-semibold text-ink">{t.name}</span>
                  <span className="text-muted">
                    {" "}
                    · {t.role}, {t.org}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
