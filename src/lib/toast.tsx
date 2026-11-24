import { toast } from "sonner";
import {
  ToastCard,
  type ToastKind,
  type ToastOptions,
} from "@/components/ToastCard";

// Site toasts: Sonner keeps positioning, stacking, swipe and pause-on-hover; the card is ours (headless),
// so it follows the site tokens in both themes. <Toaster /> is mounted once in App.

const DURATION: Record<ToastKind, number> = {
  success: 4500,
  error: 7000,
  info: 3000,
};

const show =
  (kind: ToastKind) =>
  (title: string, description?: string, opts: ToastOptions = {}) =>
    toast.custom(
      (id) => (
        <ToastCard
          id={id}
          kind={kind}
          title={title}
          description={description}
          {...opts}
        />
      ),
      {
        duration: opts.action ? 6000 : DURATION[kind], // time to reach an Undo
      },
    );

export const notify = {
  success: show("success"),
  error: show("error"),
  info: show("info"),
};
