// Email design tokens. Solid hex colors + inline styles: what Gmail, Outlook and Apple Mail all render.
import type { ContactReason } from "../src/content/site.js";

export const C = { paper: "#f7f4ef", card: "#fffdfb", ink: "#1c1915", muted: "#5c5750", line: "#e4ddd2" };
export const RAINBOW = ["#FF4D4D", "#FF9F1C", "#FFD23F", "#3DDC84", "#2EC4F1", "#6C63FF", "#FF5DA2"];
export const FONT = "'Urbanist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** One accent per contact reason: quote border, step badges, kicker dot. */
export const ACCENT: Record<ContactReason, string> = { hiring: "#6C63FF", freelance: "#3DDC84", hello: "#FF9F1C" };

export const linkStyle = { color: C.ink, fontWeight: 600, textDecoration: "underline" } as const;
