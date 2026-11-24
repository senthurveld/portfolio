import { useId } from "react";

type V = [number, number];
const R = 147;
const H = R * Math.cos(Math.PI / 6);
const FACES: { id: "top" | "left" | "right"; o: V; u: V; v: V }[] = [
  { id: "top", o: [0, 0], u: [H, -R / 2], v: [-H, -R / 2] },
  { id: "left", o: [0, 0], u: [-H, -R / 2], v: [0, R] },
  { id: "right", o: [0, 0], u: [H, -R / 2], v: [0, R] },
];
const GAP = 0.014;

const at = (f: (typeof FACES)[number], a: number, b: number): string =>
  `${(f.o[0] + f.u[0] * a + f.v[0] * b).toFixed(1)},${(f.o[1] + f.u[1] * a + f.v[1] * b).toFixed(1)}`;
const tiles = FACES.map((f) =>
  [0, 1, 2].flatMap((i) =>
    [0, 1, 2].map((j) => {
      const [a0, a1, b0, b1] = [i / 3 + GAP, (i + 1) / 3 - GAP, j / 3 + GAP, (j + 1) / 3 - GAP];
      return [at(f, a0, b0), at(f, a1, b0), at(f, a1, b1), at(f, a0, b1)].join(" ");
    }),
  ),
);

export function CubePoster({ className }: { className?: string }) {
  const id = useId();
  const [top, left, right] = FACES.map((f) => `${id}${f.id}`);
  return (
    <svg viewBox="-189.2 -189.2 378.4 378.4" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={top} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#6b7681" />
          <stop offset="1" stopColor="#1e2329" />
        </linearGradient>
        <linearGradient id={left} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#363d46" />
          <stop offset="0.5" stopColor="#171b20" />
        </linearGradient>
        <linearGradient id={right} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a3038" />
          <stop offset="0.6" stopColor="#101317" />
        </linearGradient>
      </defs>
      <polygon points={`0,${-R} ${H},${-R / 2} ${H},${R / 2} 0,${R} ${-H},${R / 2} ${-H},${-R / 2}`} fill="#0a0c0f" />
      {FACES.map((f, k) => (
        <g key={f.id} fill={`url(#${[top, left, right][k]})`} stroke={`url(#${[top, left, right][k]})`} strokeWidth="6" strokeLinejoin="round">
          {tiles[k]?.map((pts) => (
            <polygon key={pts} points={pts} />
          ))}
        </g>
      ))}
      <g stroke="#e6eef3" strokeLinecap="round" fill="none">
        <path d={`M ${-H * 0.92} ${-R * 0.46} L -6 -3.5`} strokeWidth="2.5" strokeOpacity="0.55" />
        <path d={`M 6 -3.5 L ${H * 0.92} ${-R * 0.46}`} strokeWidth="2.5" strokeOpacity="0.8" />
        <path d={`M 0 8 L 0 ${R * 0.9}`} strokeWidth="1.5" strokeOpacity="0.25" />
        <path d={`M ${H} ${-R / 2 + 8} L ${H} ${R / 2 - 8}`} stroke="#a7b4c2" strokeWidth="2" strokeOpacity="0.6" />
      </g>
    </svg>
  );
}
