import { useEffect, useRef, useState } from "react";
import { site } from "../content/site";
import { getLenis } from "../lib/motion";
import { copyEmail } from "../lib/hooks";

// Web résumé — content mirrors the PDF résumé. Phone number deliberately left off the public web.
const R = {
  summary:
    "Frontend developer with a strong foundation in React, JavaScript, HTML5 and CSS3, and MERN full-stack experience. Builds responsive web apps and reusable UI components; currently building client sites as an intern. Available to join immediately.",
  experience: [
    {
      role: "Web Developer Intern",
      org: "Thulir Media Pvt. Ltd., Coimbatore",
      when: "Mar 2026 – Present",
      points: [
        "Developed the Thulir Media and Mother India City Shelters websites — frontend implementation and responsive design.",
        "Redesigned the Medaac Study Abroad Consultancy frontend with modern UI layouts and reusable components.",
      ],
    },
  ],
  projects: [
    ["Musix", "MERN music player: YouTube search scraped server-side, JWT auth, protected routes, CRUD, env config. React, Express, Node.js, MongoDB Atlas, Mailtrap, Tailwind, Zustand."],
    ["Country Explorer", "REST Countries API + Leaflet maps, async/await JavaScript."],
    ["Bharathi Photography", "Responsive website for an event photography studio."],
  ],
  skills: [
    ["Languages", "JavaScript (ES6+), Java (basic)"],
    ["Frontend", "HTML5, CSS3, Tailwind CSS, React.js"],
    ["Backend", "Node.js, Express.js, RESTful APIs"],
    ["Databases", "MongoDB, MySQL"],
    ["Tools", "Git, GitHub, VS Code, Postman, npm, Vite"],
  ],
  education: ["B.Sc. Information Technology", "Aug 2022 – May 2025 · GPA 7.22 / 10"],
  courses: ["MERN Full Stack Developer — Apex Sys, Coimbatore", "Internship Completion Certificate — Thulir Media Pvt. Ltd."],
  languages: "Tamil (native) · English (intermediate)",
};

function H({ children }) {
  return <h3 className="label mb-3 mt-7 border-b border-line pb-2 text-ink first:mt-0 print:mb-2 print:mt-4 print:border-black print:text-black">{children}</h3>;
}

/** One-screen résumé in a dialog. "Save as PDF" prints just this sheet. */
export default function Resume() {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const opener = useRef(null);

  useEffect(() => {
    const on = () => {
      opener.current = document.activeElement;
      setOpen(true);
    };
    addEventListener("open-resume", on);
    return () => removeEventListener("open-resume", on);
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) {
      d.showModal();
      getLenis()?.stop();
    } else if (!open && d.open) d.close();
  }, [open]);

  const onClose = () => {
    setOpen(false);
    getLenis()?.start();
    opener.current?.focus?.();
  };

  return (
    <dialog
      ref={ref}
      id="resume-sheet"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && setOpen(false)}
      aria-labelledby="resume-title"
      data-lenis-prevent
      className="case m-auto h-[100dvh] w-screen bg-transparent p-0 sm:h-[min(92dvh,980px)] sm:w-[min(92vw,820px)] print:static print:!h-auto print:!max-h-none print:!w-full print:!overflow-visible"
    >
      {open && (
        <div className="flex h-full flex-col overflow-hidden bg-surface text-body shadow-[var(--clay-lg)] sm:rounded-[var(--r-xl)] print:h-auto print:overflow-visible print:rounded-none print:border-0 print:bg-white print:text-black">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-bg-2 px-5 py-3 print:hidden">
            <p className="label">Résumé · web version</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => window.print()} className="btn btn-primary min-h-10 px-4 text-sm">
                Save as PDF
              </button>
              <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary btn-icon min-h-10 w-10" aria-label="Close résumé" autoFocus>
                ✕
              </button>
            </div>
          </div>

          <article className="flex-1 overflow-y-auto overscroll-contain px-6 py-7 text-[15px] leading-relaxed sm:px-10 sm:py-9 print:overflow-visible print:p-0 print:text-[10pt] print:leading-normal">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="resume-title" className="font-display text-3xl font-extrabold tracking-[-0.04em] print:text-black">
                  {site.name}
                </h2>
                <p className="mt-1 font-medium text-ink print:text-black">Frontend Developer · React · MERN — Coimbatore, IN</p>
              </div>
              <ul className="text-right font-mono text-[12px] leading-6 print:text-black">
                <li>
                  <button type="button" onClick={copyEmail} className="underline decoration-line underline-offset-4 hover:decoration-periwinkle print:no-underline">
                    {site.email}
                  </button>
                </li>
                <li>
                  <a href={site.github} className="underline decoration-line underline-offset-4">github.com/{site.githubUser}</a>
                </li>
                <li>
                  <a href={site.linkedin} className="underline decoration-line underline-offset-4">{site.linkedin.replace("https://www.", "")}</a>
                </li>
              </ul>
            </header>

            <div className="mt-8">
              <H>Summary</H>
              <p>{R.summary}</p>

              <H>Experience</H>
              {R.experience.map((x) => (
                <div key={x.org}>
                  <p className="flex flex-wrap justify-between gap-2 font-semibold text-ink print:text-black">
                    <span>
                      {x.role} — {x.org}
                    </span>
                    <span className="font-mono text-[12px] font-normal">{x.when}</span>
                  </p>
                  <ul className="mt-1.5 list-disc pl-5">
                    {x.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <H>Projects</H>
              <ul className="flex flex-col gap-2">
                {R.projects.map(([n, d]) => (
                  <li key={n}>
                    <span className="font-semibold text-ink print:text-black">{n}</span> — {d}
                  </li>
                ))}
              </ul>

              <H>Skills</H>
              <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-1">
                {R.skills.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-semibold text-ink print:text-black">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 grid gap-x-10 gap-y-7 sm:grid-cols-2 print:mt-4 print:grid-cols-2">
                <div>
                  <H>Education</H>
                  <p className="font-semibold text-ink print:text-black">{R.education[0]}</p>
                  <p>{R.education[1]}</p>
                </div>
                <div>
                  <H>Courses & certificates</H>
                  <ul className="list-disc pl-5">
                    {R.courses.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <H>Languages</H>
              <p>{R.languages}</p>
            </div>
          </article>
        </div>
      )}
    </dialog>
  );
}
