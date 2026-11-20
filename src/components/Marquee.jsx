import { projects } from "../content/projects";
import { clients, lab } from "../content/site";

const tones = ["lemon", "sky", "bubblegum", "mint", "periwinkle", "coral"];
const shapes = ["46% 54% 52% 48% / 52% 44% 56% 48%", "999px", "50%"];

// Row 1: everything with a case study. Row 2: client sites and lab builds.
const rowA = projects.map((p) => ({ name: p.title.replace(" client sites", ""), kind: p.kind, tone: p.tone }));
const rowB = [
  ...clients.slice(1, 3).map((c) => ({ name: c.name, kind: c.kind })),
  ...lab.map((l) => ({ name: l.name, kind: "Lab" })),
].map((t, i) => ({ ...t, tone: tones[(i + 2) % tones.length] }));

function Tile({ t, i }) {
  return (
    <li className="clay-pastel relative mr-4 flex h-[136px] w-[250px] shrink-0 flex-col justify-end overflow-hidden rounded-[22px] p-5 sm:h-[156px] sm:w-[300px]" style={{ background: `var(--${t.tone})` }}>
      <span
        className="clay-pastel absolute -right-6 -top-6 aspect-square w-24 bg-white/40"
        style={{ borderRadius: shapes[i % shapes.length] }}
      />
      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] opacity-70">{t.kind}</span>
      <span className="mt-1 font-display text-[22px] font-extrabold leading-[1] tracking-[-0.03em] [font-variation-settings:'opsz'_72,'wdth'_80]">{t.name}</span>
    </li>
  );
}

function Row({ items, reverse, dur }) {
  const doubled = [...items, ...items, ...items, ...items];
  return (
    <div data-reveal={reverse ? "left" : "right"} className="marquee overflow-hidden py-2">
      <ul className="marquee-track" data-reverse={reverse || undefined} style={{ "--marquee-dur": dur }}>
        {doubled.map((t, i) => (
          <Tile key={i} t={t} i={i} />
        ))}
      </ul>
    </div>
  );
}

/** Ticker of everything I've built. Decorative: the Work and Lab sections carry the same content accessibly. */
export default function Marquee() {
  return (
    <div aria-hidden="true" className="grid gap-2 pb-[calc(var(--section-y)*0.4)]">
      <Row items={rowA} dur="52s" />
      <Row items={rowB} reverse dur="64s" />
    </div>
  );
}
