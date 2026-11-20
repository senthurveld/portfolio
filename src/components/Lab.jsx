import { lab, real, site } from "../content/site";
import { Words } from "./Words";
import { useReveal } from "../lib/hooks";

const tones = ["lemon", "mint", "sky", "bubblegum", "periwinkle", "coral"];

/** Learning repos as a plain index: name, one line, link. */
export default function Lab() {
  const ref = useReveal();
  return (
    <section id="lab" ref={ref} aria-labelledby="lab-title" className="section pt-0">
      <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
        <div className="head mb-0 content-start">
          <p className="label">Lab · on GitHub</p>
          <h2 id="lab-title" data-split>
            <Words>
              Small builds, made to <span className="accent">learn.</span>
            </Words>
          </h2>
          <a href={`${site.github}?tab=repositories`} target="_blank" rel="noreferrer" className="link w-fit text-[15px] font-medium">
            All repositories ↗
          </a>
        </div>

        <ul className="border-t border-line">
          {lab.map((l, i) => {
            const desc = real(l.desc);
            return (
              <li key={l.name} data-reveal="left" className="border-b border-line">
                <a href={l.href} target="_blank" rel="noreferrer" className="group relative isolate -mx-4 grid items-baseline gap-x-6 gap-y-1 px-4 py-6 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_auto]">
                  {/* Pastel fill wipes in from the left on hover. */}
                  <span aria-hidden="true" className="lab-fill absolute inset-x-0 inset-y-1.5 -z-10 rounded-2xl" style={{ "--tone": `var(--${tones[i % tones.length]})` }} />
                  <span className="font-display text-[1.35rem] font-bold tracking-[-0.025em] text-ink transition-transform duration-500 ease-[var(--ease-spring)] group-hover:translate-x-1.5">{l.name}</span>
                  <span className="text-[15px]">
                    {desc ?? l.tags.join(" · ")}
                  </span>
                  <span aria-hidden="true" className="hidden h-9 w-9 place-items-center rounded-full bg-bg-2 text-ink transition-[rotate,background-color,color] duration-500 ease-[var(--ease-spring)] group-hover:rotate-45 group-hover:bg-ink group-hover:text-bg sm:grid">
                    ↗
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
