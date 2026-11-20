import { useEffect, useRef, useState } from "react";
import { giscus } from "../content/site";
import { useReveal } from "../lib/hooks";

const ready = giscus.repo && giscus.repoId && giscus.category && giscus.categoryId;
const theme = () => (document.documentElement.classList.contains("dark") ? "noborder_dark" : "noborder_light");

/** Guestbook on GitHub Discussions (Giscus). Loads only near the viewport; hidden until configured. */
export default function Guestbook() {
  const ref = useReveal();
  const box = useRef(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (!ready || !box.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setLoad(true), io.disconnect()), { rootMargin: "400px" });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!load || !box.current) return;
    const s = document.createElement("script");
    Object.entries({
      src: "https://giscus.app/client.js",
      "data-repo": giscus.repo,
      "data-repo-id": giscus.repoId,
      "data-category": giscus.category,
      "data-category-id": giscus.categoryId,
      "data-mapping": "specific",
      "data-term": "Guestbook",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": theme(),
      "data-lang": "en",
      "data-loading": "lazy",
      crossorigin: "anonymous",
    }).forEach(([k, v]) => s.setAttribute(k, v));
    s.async = true;
    box.current.appendChild(s);

    // Keep the iframe's theme in step with the site toggle.
    const mo = new MutationObserver(() =>
      document.querySelector("iframe.giscus-frame")?.contentWindow?.postMessage({ giscus: { setConfig: { theme: theme() } } }, "https://giscus.app"),
    );
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [load]);

  if (!ready) return null;
  return (
    <section id="guestbook" ref={ref} aria-labelledby="gb-title" className="section pt-0">
      <div className="wrap">
        <div className="mb-12 grid gap-5">
          <p className="label">Guestbook</p>
          <h2 id="gb-title" className="font-extrabold uppercase leading-[0.88] tracking-[-0.035em] [font-size:clamp(2.6rem,7.5vw,7rem)] [font-variation-settings:'opsz'_96,'wdth'_75]">
            Leave your{" "}
            <span className="clay-pastel inline-block -rotate-2 rounded-[0.18em] bg-lemon px-[0.15em] font-poster normal-case tracking-normal">signature</span>
          </h2>
          <p data-lines className="max-w-[40rem] text-[1.0625rem]">Sign in with GitHub and say hello. Recruiters, clients and fellow developers all welcome.</p>
        </div>
        <div data-reveal className="clay min-h-[320px] p-4 sm:p-6">
          <div ref={box} />
        </div>
      </div>
    </section>
  );
}
