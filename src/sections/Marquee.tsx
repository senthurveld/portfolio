import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { Frame } from "@/components/Frame";
import { shotsFor } from "@/content/shots";
import { projects } from "@/content/site";
import { wrap } from "@/lib/logic";

const rows = [projects, [...projects].reverse()];
const COPIES = 3;

export function Marquee() {
  const section = useRef<HTMLElement>(null);
  const tracks = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = rows.map(() => ({ x: 0, paused: false }));
    let dir = 1, lastY = scrollY, last = performance.now(), raf = 0;
    const cleanups = tracks.current.map((t, i) => {
      const row = t!.parentElement!;
      const on = () => (state[i]!.paused = true);
      const off = () => (state[i]!.paused = false);
      row.addEventListener("pointerenter", on);
      row.addEventListener("pointerleave", off);
      return () => (row.removeEventListener("pointerenter", on), row.removeEventListener("pointerleave", off));
    });
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dy = scrollY - lastY;
      if (Math.abs(dy) > 0.5) dir = dy > 0 ? 1 : -1;
      lastY = scrollY;
      if (!section.current) return;
      const top = section.current.offsetTop;
      const parallax = (scrollY - top + innerHeight) * 0.55;
      tracks.current.forEach((t, i) => {
        if (!t) return;
        const s = state[i]!;
        const sign = i === 0 ? -1 : 1;
        if (!reduce && !s.paused) s.x += sign * dir * 40 * dt;
        const half = t.scrollWidth / 2;
        t.style.transform = `translate3d(${wrap(s.x + sign * parallax, half)}px,0,0)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      cleanups.forEach((c) => c());
    };
  }, []);

  return (
    <section
      ref={section}
      aria-label="Selected work previews"
      className="relative z-[1] overflow-hidden bg-[var(--home-a)] pt-20 pb-12 sm:pt-28 sm:pb-16 md:pt-36 md:pb-20"
    >
      <div className="flex flex-col gap-4 [mask-image:linear-gradient(90deg,transparent_0%,#000_6%,#000_94%,transparent_100%)] sm:gap-5 md:gap-6">
        {rows.map((row, r) => (
          <div key={r} className="overflow-hidden">
            <div ref={(el) => void (tracks.current[r] = el)} className="flex w-max gap-4 will-change-transform sm:gap-5 md:gap-6">
              {[0, 1].map((half) =>
                Array.from({ length: COPIES }, (_, c) =>
                  row.map((p) => {
                    const dup = half > 0 || c > 0;
                    return (
                      <Link
                        key={`${half}-${c}-${p.slug}`}
                        to={`/projects/${p.slug}`}
                        aria-hidden={dup || undefined}
                        tabIndex={dup ? -1 : undefined}
                        data-cursor="View"
                        className="group relative block h-[240px] w-[380px] shrink-0 overflow-hidden rounded-xl border border-steel/12 shadow-[0_12px_40px_rgba(0,0,0,.35)] transition-[translate,border-color,box-shadow] duration-500 hover:-translate-y-0.5 hover:border-steel/35 hover:shadow-[0_20px_50px_rgba(0,0,0,.5)] sm:h-[300px] sm:w-[460px] sm:rounded-2xl md:h-[340px] md:w-[520px] lg:h-[380px] lg:w-[580px]"
                      >
                        <Frame
                          shot={shotsFor(p.slug).cover}
                          sizes="(min-width: 1024px) 580px, (min-width: 768px) 520px, (min-width: 640px) 460px, 380px"
                          alt={p.title}
                          className="size-full rounded-none border-0"
                          label={p.category}
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-5 pt-10 pb-4 text-[11px] font-medium tracking-[0.2em] text-steel/85 uppercase">
                          {p.title}
                        </span>
                      </Link>
                    );
                  }),
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
