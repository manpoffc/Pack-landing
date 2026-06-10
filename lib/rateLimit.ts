// Best-effort in-memory rate limiter for the waitlist join route.
//
// Real production traffic will (eventually) need Vercel KV / Upstash so the
// limit survives across edge instances. For now this is a single-process
// floor: 10 signups per IP per 10 minutes. If you scale beyond one Vercel
// instance, swap this out for KV.
//
// We intentionally do NOT throw on memory pressure — the worst case is the
// limit fails open, which is acceptable for a marketing-page rate limit.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;

const hits = new Map<string, number[]>();

export function rateLimit(ip: string | null): { ok: boolean; remaining: number } {
  if (!ip) return { ok: true, remaining: MAX_PER_WINDOW };
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const prev = (hits.get(ip) ?? []).filter((t) => t > cutoff);
  if (prev.length >= MAX_PER_WINDOW) {
    hits.set(ip, prev);
    return { ok: false, remaining: 0 };
  }
  prev.push(now);
  hits.set(ip, prev);
  return { ok: true, remaining: MAX_PER_WINDOW - prev.length };
}

export function clientIp(req: Request): string | null {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    null
  );
}
