import { LocateFixed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Globe, type GlobeHandle } from "@/components/ui/globe";
import { contact, footer, site } from "@/content/site";
import { istTime } from "@/lib/logic";
import { spot } from "./live";

const HOME: [number, number] = [11.0168, 76.9558];
const OPEN_TO = [
  { location: [13.0827, 80.2707] as [number, number], size: 0.035 }, // Chennai
  { location: [12.9716, 77.5946] as [number, number], size: 0.035 }, // Bengaluru
];

function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return (
    <time dateTime={t.toISOString()} className="tabular-nums">
      {istTime(t)}
    </time>
  );
}

export function GlobeCard() {
  const g = footer.globe;
  const globe = useRef<GlobeHandle>(null);
  return (
    <div onPointerMove={spot} className="f-card min-h-[26rem] sm:min-h-[24rem]">
      <Globe
        ref={globe}
        home={HOME}
        markers={OPEN_TO}
        theta={0.32}
        className="absolute right-[-24%] bottom-[-40%] w-[min(34rem,120%)] sm:right-[-14%] sm:w-[min(32rem,76%)]"
      />
      <button
        type="button"
        onClick={() => globe.current?.locate()}
        aria-label={`Spin the globe back to ${site.city}`}
        title={g.locate}
        className="absolute top-5 right-5 z-10 grid size-11 place-items-center rounded-full border border-[var(--home-line)] bg-[var(--home-a)] text-[var(--home-dim)] transition-[color,border-color,rotate] duration-300 hover:rotate-90 hover:border-[var(--home-fg)] hover:text-[var(--home-fg)]"
      >
        <LocateFixed aria-hidden="true" className="size-[1.1rem]" />
      </button>
      <div className="pointer-events-none relative max-w-[17rem]">
        <p className="kicker text-[var(--home-dim)]">{g.label}</p>
        <h3 className="mt-5 text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.12] font-semibold tracking-[-0.025em]">{g.title}</h3>
        <p className="mt-3 text-[var(--home-muted)]">
          <span className="font-semibold text-[var(--home-fg)]">
            <Clock />
          </span>{" "}
          {g.zone}
        </p>
      </div>
      <div className="pointer-events-none relative mt-auto max-w-[15rem] pt-10">
        {site.available && (
          <p className="inline-flex items-center gap-2.5 rounded-full border border-[var(--home-line)] bg-[var(--home-a)] px-3.5 py-1.5 text-sm">
            <span aria-hidden="true" className="ping size-[0.45rem] rounded-full bg-live" />
            {contact.availability}
          </p>
        )}
        <p className="kicker mt-4 text-[var(--home-dim)]">
          {g.openLabel} {site.openTo.join(" · ")}
        </p>
        <p className="num mt-2 hidden text-[var(--home-dim)] [@media(hover:hover)]:block">{g.hint}</p>
      </div>
    </div>
  );
}
