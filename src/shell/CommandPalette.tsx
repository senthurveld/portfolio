import { Command } from "cmdk";
import { ArrowUpRight, Copy, FileText, Folder, Moon, Wrench } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { nav, projects, services, site, socials } from "@/content/site";
import { useLenis } from "./scroll";
import { toggleTheme } from "./theme";

const item =
  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] text-[var(--home-muted)] data-[selected=true]:bg-[var(--home-faint)] data-[selected=true]:text-[var(--home-fg)]";
const group = "[&_[cmdk-group-heading]]:kicker [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[var(--home-dim)]";

export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const lenis = useLenis();
  useEffect(() => {
    if (open) lenis.current?.stop();
    else lenis.current?.start();
  }, [open, lenis]);
  const go = (href: string) => {
    onOpenChange(false);
    if (href.startsWith("http") || href.startsWith("mailto:")) window.open(href, "_blank", "noreferrer");
    else navigate(href);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
      overlayClassName="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm"
      contentClassName="fixed top-[14vh] left-1/2 z-[131] w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--home-line)] bg-[var(--home-card)] shadow-[0_24px_60px_-24px_#000000b3]"
    >
      <Command.Input
        placeholder="Pages, projects and services…"
        className="w-full border-b border-[var(--home-line)] bg-transparent px-5 py-4 text-base text-[var(--home-fg)] outline-none placeholder:text-[var(--home-dim)]"
      />
      <Command.List data-lenis-prevent className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-[var(--home-dim)]">No matches.</Command.Empty>
        <Command.Group heading="Pages" className={group}>
          {nav.filter((n) => !n.hidden).map((n) => (
            <Command.Item key={n.href} className={item} onSelect={() => go(n.href)}>
              <FileText className="size-4" /> {n.label}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Projects" className={group}>
          {projects.map((p) => (
            <Command.Item key={p.slug} value={`${p.title} ${p.category}`} className={item} onSelect={() => go(`/projects/${p.slug}`)}>
              <Folder className="size-4" /> {p.title}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Services" className={group}>
          {services.lanes.map((l) => (
            <Command.Item key={l.slug} className={item} onSelect={() => go(`/services/${l.slug}`)}>
              <Wrench className="size-4" /> {l.name}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Actions" className={group}>
          <Command.Item className={item} onSelect={() => (onOpenChange(false), toggleTheme())}>
            <Moon className="size-4" /> Toggle theme <kbd className="num ml-auto opacity-60">D</kbd>
          </Command.Item>
          <Command.Item className={item} onSelect={() => (navigator.clipboard?.writeText(site.email), onOpenChange(false))}>
            <Copy className="size-4" /> Copy email
          </Command.Item>
          {socials.map((s) => (
            <Command.Item key={s.label} className={item} onSelect={() => go(s.href)}>
              <ArrowUpRight className="size-4" /> {s.label}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
