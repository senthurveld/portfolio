// Sliding-window counters for /api/contact. "_" prefix = Vercel does not deploy this file as a route.
// In-memory, so per serverless instance: they reset on a cold start and aren't shared between instances.
// That slows down repeat abuse from one client; it is not a hard global cap.

export function limiter(max: number, windowMs: number, maxKeys = 5000) {
  const hits = new Map<string, number[]>();
  return {
    /** Counts a hit for key. Returns 0 if allowed, else ms until the oldest hit expires. */
    take(key: string, now = Date.now()) {
      const live = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      hits.delete(key); // re-insert below so Map order = least recently used first
      if (live.length >= max) {
        hits.set(key, live);
        return live[0]! + windowMs - now;
      }
      live.push(now);
      hits.set(key, live);
      if (hits.size > maxKeys) hits.delete(hits.keys().next().value!); // bound memory under a flood
      return 0;
    },
    clear: () => hits.clear(),
  };
}

/** Remembers keys for ttlMs. Used to drop a retried submission that was already delivered. */
export function memory(ttlMs: number, maxKeys = 5000) {
  const seen = new Map<string, number>();
  return {
    has: (key: string, now = Date.now()) =>
      now - (seen.get(key) ?? -Infinity) < ttlMs,
    add(key: string, now = Date.now()) {
      seen.delete(key);
      seen.set(key, now);
      if (seen.size > maxKeys) seen.delete(seen.keys().next().value!);
    },
    clear: () => seen.clear(),
  };
}

// 5 messages per IP per 10 min; 2 auto-replies per recipient per day; 100 auto-replies per instance per day.
export const perIp = limiter(5, 10 * 60_000);
export const perRecipient = limiter(2, 24 * 60 * 60_000);
export const autoReplies = limiter(100, 24 * 60 * 60_000);
export const delivered = memory(15 * 60_000);

/** Test hook. */
export const resetLimits = () =>
  [perIp, perRecipient, autoReplies, delivered].forEach((l) => l.clear());
