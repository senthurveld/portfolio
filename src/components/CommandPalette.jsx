import { useEffect, useMemo, useRef, useState } from "react";
import { site } from "../content/site";
import { projects } from "../content/projects";
import { scrollToId } from "../lib/motion";
import { toggleTheme } from "../lib/theme";
import { copyEmail } from "../lib/hooks";
import { setSound, soundOn } from "../lib/sound";

/** Lightweight ⌘K palette on a native <dialog> (no cmdk dependency). */
export default function CommandPalette({ open, setOpen }) {
  const ref = useRef(null);
  const input = useRef(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo(
    () => [
      { group: "Go to", label: "Work", hint: "case studies", run: () => scrollToId("work") },
      { group: "Go to", label: "Services", hint: "what to hire me for", run: () => scrollToId("services") },
      { group: "Go to", label: "About", hint: "the poster", run: () => scrollToId("about") },
      { group: "Go to", label: "Experience", hint: "", run: () => scrollToId("experience") },
      { group: "Go to", label: "Lab", hint: "repos", run: () => scrollToId("lab") },
      { group: "Go to", label: "Contact", hint: "", run: () => scrollToId("contact") },
      ...projects.map((p) => ({
        group: "Case studies",
        label: p.title,
        hint: p.kind,
        run: () => dispatchEvent(new CustomEvent("open-case", { detail: p.slug })),
      })),
      { group: "Actions", label: "Copy email", hint: site.email, run: copyEmail },
      { group: "Actions", label: "Toggle theme", hint: "light / dark", run: () => toggleTheme(innerWidth / 2, innerHeight / 2) },
      { group: "Actions", label: "Résumé", hint: "view · save as PDF", run: () => dispatchEvent(new Event("open-resume")) },
      { group: "Actions", label: soundOn() ? "Turn sound off" : "Turn sound on", hint: "UI sounds", run: () => setSound(!soundOn()) },
      { group: "Links", label: "GitHub", hint: "↗", run: () => window.open(site.github, "_blank", "noopener") },
      { group: "Links", label: "LinkedIn", hint: "↗", run: () => window.open(site.linkedin, "_blank", "noopener") },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  const list = items.filter((i) => (i.label + " " + i.group + " " + i.hint).toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [setOpen]);

  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) {
      setQ("");
      setActive(0);
      d.showModal();
      input.current?.focus();
    } else if (!open && d.open) d.close();
  }, [open]);

  const run = (item) => {
    setOpen(false);
    requestAnimationFrame(() => item.run());
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(list.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + list.length) % Math.max(list.length, 1));
    } else if (e.key === "Enter" && list[active]) {
      e.preventDefault();
      run(list[active]);
    }
  };

  let lastGroup = "";
  return (
    <dialog
      ref={ref}
      onClose={() => setOpen(false)}
      onClick={(e) => e.target === ref.current && setOpen(false)}
      aria-label="Command menu"
      data-lenis-prevent
      className="case mx-auto mt-[12vh] w-[min(92vw,580px)] overflow-hidden rounded-[var(--r-lg)] bg-surface p-0 text-ink shadow-[var(--clay-lg)]"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKey}
          placeholder="Go to a section, case study or action"
          className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={list[active] ? `cmd-${active}` : undefined}
        />
        <kbd className="rounded-md border border-line bg-bg-2 px-1.5 font-mono text-[11px] text-muted">Esc</kbd>
      </div>
      <ul id="cmd-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
        {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">Nothing matches “{q}”.</li>}
        {list.map((item, i) => {
          const head = item.group !== lastGroup;
          lastGroup = item.group;
          return (
            <li key={item.group + item.label} role="presentation">
              {head && <p className="label px-3 pb-1.5 pt-3">{item.group}</p>}
              <div
                id={`cmd-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => run(item)}
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${
                  i === active ? "bg-bg-2 text-ink" : ""
                }`}
              >
                <span className="font-medium">{item.label}</span>
                <span className={`truncate font-mono text-[11px] ${"text-muted"}`}>{item.hint}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
