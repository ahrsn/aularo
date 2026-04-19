import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";

/**
 * Fixed-window rate limiter backed by Firestore. Deliberately behind a narrow
 * interface so this can be swapped for Upstash/Vercel KV without touching the
 * call sites. Use this on unauthenticated POSTs that mutate or create documents.
 * HMAC-authenticated high-frequency paths (heartbeat) should not use this —
 * auth does the work there, and a per-request counter write would be costly.
 */

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

export interface RateLimiter {
  consume(key: string, rule: RateLimitRule): Promise<RateLimitResult>;
}

export type RateLimitRule = {
  /** max requests per window */
  limit: number;
  /** window length in ms */
  windowMs: number;
  /**
   * What to do if the backing store fails. "open" lets traffic through on
   * backend errors (right for user-visible flows where blocking would kill
   * legit users). "closed" rejects on backend errors (right for abuse-magnet
   * endpoints where unthrottled traffic is strictly worse than an outage).
   * Defaults to "open".
   */
  onError?: "open" | "closed";
};

/**
 * Pure window computation — exported so the limiter can be unit-tested
 * without Firestore. Given the prior state and a rule, returns the new state
 * and the decision for this attempt.
 */
export function stepWindow(
  now: number,
  prior: { windowStart?: number; count?: number } | undefined,
  { limit, windowMs }: RateLimitRule,
): { next: { windowStart: number; count: number }; result: RateLimitResult } {
  const fresh = !prior || !prior.windowStart || now - prior.windowStart >= windowMs;
  const windowStart = fresh ? now : prior!.windowStart!;
  const count = (fresh ? 0 : prior!.count ?? 0) + 1;

  if (count > limit) {
    return {
      next: { windowStart, count: prior!.count ?? limit },
      result: {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, windowStart + windowMs - now),
      },
    };
  }
  return {
    next: { windowStart, count },
    result: {
      allowed: true,
      remaining: Math.max(0, limit - count),
      retryAfterMs: 0,
    },
  };
}

class FirestoreFixedWindowLimiter implements RateLimiter {
  async consume(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
    // Hash to keep paths short and uniform regardless of raw key shape (IPs
    // with colons, composite keys, etc.).
    const hashed = createHash("sha256").update(key).digest("hex").slice(0, 32);
    const ref = adminDb().collection("rateLimits").doc(hashed);
    const now = Date.now();

    try {
      return await adminDb().runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const prior = snap.data() as { windowStart?: number; count?: number } | undefined;
        const { next, result } = stepWindow(now, prior, rule);
        if (result.allowed) {
          // ttlAt: Firestore TTL sweeper reclaims the doc ~24h after the
          // window + a small grace period closes. See scripts/enable-firestore-ttl.sh.
          const ttlAt = Timestamp.fromMillis(now + rule.windowMs + 60_000);
          tx.set(
            ref,
            { ...next, updatedAt: now, ttlAt },
            { merge: true },
          );
        }
        return result;
      });
    } catch {
      // Fail policy — per-rule. Open is the safe default for user-visible
      // flows where blocking legit traffic during a Firestore hiccup would
      // be worse than briefly losing rate-limit enforcement. Closed is right
      // for abuse-magnet paths like unauth heartbeat where unthrottled
      // traffic is strictly worse than a brief outage.
      if (rule.onError === "closed") {
        return { allowed: false, remaining: 0, retryAfterMs: 5_000 };
      }
      return { allowed: true, remaining: rule.limit, retryAfterMs: 0 };
    }
  }
}

let instance: RateLimiter | null = null;
export function rateLimiter(): RateLimiter {
  if (!instance) instance = new FirestoreFixedWindowLimiter();
  return instance;
}

/**
 * Client IP extraction for rate-limiter keys.
 *
 * SECURITY: trusts `x-forwarded-for` ONLY on Vercel, where the Edge Network
 * replaces any client-supplied XFF with the real caller's IP before the
 * function runs. On any non-Vercel deployment an attacker can spoof XFF and
 * bypass the limiter — we fall back to a constant that collapses all callers
 * to a single bucket, which is overly aggressive but safe.
 *
 * If you deploy to a non-Vercel target, configure your proxy to overwrite
 * XFF and set `TRUST_FORWARDED_FOR=1` explicitly.
 */
function trustForwardedFor(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.TRUST_FORWARDED_FOR === "1"
  );
}

export function extractIp(get: (name: string) => string | null): string {
  if (trustForwardedFor()) {
    const xff = get("x-forwarded-for");
    if (xff) return xff.split(",")[0]!.trim();
    const real = get("x-real-ip");
    if (real) return real.trim();
  }
  return "untrusted";
}

export function getClientIp(req: NextRequest): string {
  return extractIp((name) => req.headers.get(name));
}

/**
 * Same extraction for server actions, which read via `next/headers`.
 */
export async function getClientIpFromHeaders(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  return extractIp((name) => h.get(name));
}

export function rateLimitedResponse(retryAfterMs: number): NextResponse {
  const retryAfter = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return NextResponse.json(
    { error: "rate_limited" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    },
  );
}

/**
 * Convenience: rate-limit by IP and short-circuit to a 429 if over. Returns
 * null on allow, a NextResponse on deny.
 */
export async function enforceIpRateLimit(
  req: NextRequest,
  scope: string,
  rule: RateLimitRule,
): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const result = await rateLimiter().consume(`${scope}:${ip}`, rule);
  if (result.allowed) return null;
  return rateLimitedResponse(result.retryAfterMs);
}
