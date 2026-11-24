// Client for POST /api/contact. Every outcome comes back as a value, so the form never has to guess.

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

export type SendResult =
  | { ok: true }
  | { ok: false; kind: "invalid"; errors: FieldErrors }
  | { ok: false; kind: "rate"; retryAfter: number }
  | { ok: false; kind: "offline" | "timeout" | "server" };

export const SEND_TIMEOUT = 15_000;

async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    const data: unknown = await res.json();
    return data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/** One submission id per draft: a retry after a timeout reuses it, so the server can drop the duplicate. */
export const newSubmissionId = () => globalThis.crypto?.randomUUID?.() ?? "";

export async function sendContact(
  body: string,
  { keepalive = false } = {},
): Promise<SendResult> {
  let res: Response;
  try {
    res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive,
      credentials: "same-origin",
      signal: AbortSignal.timeout?.(SEND_TIMEOUT),
    });
  } catch (err) {
    return {
      ok: false,
      kind:
        err instanceof DOMException && err.name === "TimeoutError"
          ? "timeout"
          : "offline",
    };
  }
  if (res.ok) return { ok: true };
  const data = await readJson(res);
  if (res.status === 400 && data.errors && typeof data.errors === "object")
    return { ok: false, kind: "invalid", errors: data.errors as FieldErrors };
  if (res.status === 429)
    return {
      ok: false,
      kind: "rate",
      retryAfter: Number(data.retryAfter) || 60,
    };
  return { ok: false, kind: "server" };
}
