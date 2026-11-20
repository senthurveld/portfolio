// Clay cover art for a project: tone ground, the project's name set large, and a few clay shapes.
// Stands in for screenshots (client code is private) without pretending to be one.
const layouts = [
  [
    ["pebble", "62%", "18%", "34%", "--bubblegum"],
    ["pill", "8%", "14%", "38%", "--lemon"],
    ["dot", "78%", "66%", "12%", "--mint"],
  ],
  [
    ["dot", "70%", "10%", "22%", "--coral"],
    ["pebble", "8%", "10%", "26%", "--sky"],
    ["pill", "52%", "70%", "36%", "--periwinkle"],
  ],
  [
    ["pill", "56%", "14%", "38%", "--mint"],
    ["dot", "10%", "12%", "16%", "--lemon"],
    ["pebble", "66%", "56%", "26%", "--bubblegum"],
  ],
  [
    ["pebble", "64%", "8%", "28%", "--lemon"],
    ["dot", "8%", "14%", "14%", "--coral"],
    ["pill", "58%", "68%", "34%", "--sky"],
  ],
];

const shape = {
  pebble: { borderRadius: "46% 54% 52% 48% / 52% 44% 56% 48%", aspectRatio: "1.15" },
  pill: { borderRadius: "999px", aspectRatio: "3.2" },
  dot: { borderRadius: "50%", aspectRatio: "1" },
};

export default function Cover({ project, index = 0, large = false }) {
  const shapes = layouts[index % layouts.length];
  return (
    <div
      aria-hidden="true"
      className={`clay-pastel relative overflow-hidden rounded-[22px] ${large ? "aspect-[16/7]" : "aspect-[16/10]"}`}
      style={{ background: `var(--${project.tone})` }}
    >
      {shapes.map(([k, left, top, w, tone], i) => (
        <span
          key={i}
          data-shape
          className="clay-pastel absolute transition-transform duration-700 ease-[var(--ease-spring)]"
          style={{ left, top, width: w, background: `color-mix(in oklab, var(${tone}) 85%, #fff)`, ...shape[k] }}
        />
      ))}
      <span className="absolute bottom-[8%] left-[6%] right-[6%] font-display font-extrabold leading-[0.9] tracking-[-0.05em] text-on-pastel/85 [font-variation-settings:'opsz'_96,'wdth'_78]" style={{ fontSize: large ? "clamp(2.4rem, 6vw, 5rem)" : "clamp(1.9rem, 4.2vw, 3.2rem)" }}>
        {project.title.split(" ")[0]}
      </span>
    </div>
  );
}
