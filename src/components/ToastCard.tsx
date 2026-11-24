import { Check, CircleAlert, Copy, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/logic";

// The site's toast card, rendered headless by Sonner. Use notify() from lib/toast.tsx, not this directly.

export type ToastKind = "success" | "error" | "info";

const KIND: Record<ToastKind, { icon: LucideIcon; disc: string }> = {
  success: { icon: Check, disc: "bg-live/15 text-live" },
  error: { icon: CircleAlert, disc: "bg-[#e5484d]/15 text-[#e5484d]" },
  info: { icon: Copy, disc: "bg-[var(--home-fg)]/10 text-[var(--home-fg)]" },
};

export type ToastOptions = {
  icon?: LucideIcon;
  action?: { label: string; onClick: () => void };
};

export function ToastCard({
  id,
  kind,
  title,
  description,
  icon,
  action,
}: {
  id: string | number;
  kind: ToastKind;
  title: string;
  description?: string;
} & ToastOptions) {
  const { disc } = KIND[kind];
  const Icon = icon ?? KIND[kind].icon;
  return (
    <div className="toast-card relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-[var(--home-line)] bg-[var(--home-card)] py-3.5 pr-11 pl-3.5 text-[var(--home-fg)] shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45),0_2px_6px_-2px_rgb(0_0_0/0.12)]">
      {kind === "success" && (
        <span
          aria-hidden="true"
          className="toast-rainbow absolute inset-x-0 top-0 h-0.5"
        />
      )}
      <span
        aria-hidden="true"
        className={cn(
          "toast-icon grid size-8 shrink-0 place-items-center rounded-full",
          disc,
        )}
      >
        <Icon className="size-4" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 pt-1">
        <p className="text-[0.95rem] leading-tight font-semibold">{title}</p>
        {description && (
          <p className="mt-1 text-sm leading-snug text-[var(--home-muted)] [overflow-wrap:anywhere]">
            {description}
          </p>
        )}
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              toast.dismiss(id);
            }}
            className="mt-2.5 inline-flex min-h-8 items-center rounded-full border border-[var(--home-line)] px-3.5 text-xs font-semibold tracking-[0.14em] uppercase transition-colors hover:border-[var(--home-fg)]"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => toast.dismiss(id)}
        aria-label="Dismiss"
        className="absolute top-2 right-2 grid size-8 place-items-center rounded-full text-[var(--home-muted)] transition-colors hover:bg-[var(--home-fg)]/8 hover:text-[var(--home-fg)]"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
