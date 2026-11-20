import { useEffect, useRef, useState } from "react";
import { currently, site } from "../content/site";
import { useIstTime } from "../lib/hooks";
import { gsap, scrollToId } from "../lib/motion";
import { Letters } from "./Words";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

// WMO weather codes, grouped into words people use.
const sky = (c) => (c === 0 ? "clear" : c <= 3 ? "cloudy" : c <= 48 ? "hazy" : c <= 67 || (c >= 80 && c <= 82) ? "raining" : c >= 95 ? "stormy" : "overcast");

function useWeather() {
  const [w, setW] = useState(null);
  useEffect(() => {
    const ac = new AbortController();
    fetch("https://api.open-meteo.com/v1/forecast?latitude=11.02&longitude=76.96&current=temperature_2m,weather_code&timezone=Asia%2FKolkata", { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.current && setW({ t: Math.round(j.current.temperature_2m), s: sky(j.current.weather_code) }))
      .catch(() => {});
    return () => ac.abort();
  }, []);
  return w;
}

function useNowPlaying() {
  const [np, setNp] = useState(null);
  useEffect(() => {
    let live = true;
    const get = () =>
      fetch("/api/now-playing")
        .then((r) => (r.ok && r.headers.get("content-type")?.includes("json") ? r.json() : null))
        .then((j) => live && setNp(j?.title ? j : null))
        .catch(() => {});
    get();
    const id = setInterval(get, 60_000);
    return () => ((live = false), clearInterval(id));
  }, []);
  return np;
}

function Eq() {
  return (
    <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
      {[0, 0.2, 0.4].map((d) => (
        <span key={d} className="eq-bar h-full w-[3px] rounded-full bg-mint" style={{ animationDelay: `${d}s` }} />
      ))}
    </span>
  );
}

export default function Footer() {
  const time = useIstTime();
  const weather = useWeather();
  const np = useNowPlaying();
  const mark = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(mark.current.querySelectorAll("[data-l]"), {
        yPercent: 100,
        ease: "none",
        stagger: { each: 0.08, from: "center" },
        scrollTrigger: { trigger: mark.current, start: "top bottom", end: "bottom bottom", scrub: 0.5 },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <footer className="pb-8 pt-4">
      <div className="wrap">
        <div data-reveal="pop" className="clay grid gap-8 p-6 sm:p-8 md:grid-cols-[1.2fr_1fr]">
          <div className="grid content-start gap-5">
            <p className="font-display text-[length:var(--text-4)] font-bold leading-none tracking-[-0.04em] text-ink [font-variation-settings:'opsz'_96,'wdth'_80]">{site.name}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
              <li>
                <a className="link" href={site.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
              <li>
                <a className="link" href={site.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </li>
              <li>
                <button type="button" className="link" onClick={() => dispatchEvent(new Event("open-resume"))}>
                  Résumé
                </button>
              </li>
              <li>
                <button type="button" className="link" onClick={() => scrollToId("top")}>
                  Back to top ↑
                </button>
              </li>
            </ul>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[14.5px]">
            <div>
              <dt className="label">Local time</dt>
              <dd className="mt-1 text-ink">
                <time className="tabular-nums">{time}</time> in {site.city}
                {weather && (
                  <span className="text-muted">
                    , {weather.t}°C {weather.s}
                  </span>
                )}
              </dd>
            </div>
            {currently.map((c) => (
              <div key={c.title}>
                <dt className="label">{c.kind}</dt>
                <dd className="mt-1 text-ink">{c.title}</dd>
              </div>
            ))}
            {np && (
              <div className="col-span-2">
                <dt className="label flex items-center gap-2">
                  {np.playing && <Eq />}
                  {np.playing ? "Listening now" : "Last played"}
                </dt>
                <dd className="mt-1 truncate text-ink">
                  <a href={np.url} target="_blank" rel="noreferrer" className="link">
                    {np.title}
                  </a>
                  <span className="text-muted"> · {np.artist}</span>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Sign-off wordmark: letters rise as the page bottoms out, and stretch under the cursor like the hero. */}
        <p ref={mark} aria-hidden="true" data-stretch="75" className="mt-10 select-none overflow-hidden whitespace-nowrap pb-[0.02em] text-center font-display font-extrabold uppercase leading-[0.8] tracking-[-0.04em] text-ink [font-size:clamp(3.4rem,21vw,18rem)] [font-variation-settings:'opsz'_96,'wdth'_75]">
          <Letters>{site.name.split(" ")[0]}</Letters>
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-2 font-mono text-[12px] text-muted">
          <p>
            © {new Date().getFullYear()} {site.name}
            {import.meta.env.VITE_GIT_SHA && ` · Build ${import.meta.env.VITE_GIT_SHA}`}
          </p>
          <p className="hidden sm:block">Press {isMac ? "⌘K" : "Ctrl K"} for the command menu</p>
        </div>
      </div>
    </footer>
  );
}
