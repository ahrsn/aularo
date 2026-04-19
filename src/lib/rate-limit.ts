import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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
};

class FirestoreFixedWindowLimiter implements RateLimiter {
  async consume(key: string, { limit, windowMs }: RateLimitRule): Promise<RateLimitResult> {
    // Hash to keep paths short and uniform regardless of raw key shape (IPs
    // with colons, composite keys, etc.).
    const hashed = createHash("sha256").update(key).digest("hex").slice(0, 32);
    const ref = adminDb().collection("rateLimits").doc(hashed);
    const now = Date.now();

    try {
      return await adminDb().runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const data = snap.data() as { windowStart?: number; count?: number } | undefined;
        const fresh = !data || !data.windowStart || now - data.windowStart >= windowMs;
        const windowStart = fresh ? now : data!.windowStart!;
        const count = (fresh ? 0 : data!.count ?? 0) + 1;

        if (count > limit) {
          return {
            allowed: false,
            remaining: 0,
            retryAfterMs: Math.max(0, windowStart + windowMs - now),
          };
        }

        tx.set(ref, { windowStart, count, updatedAt: now }, { merge: true });
        return {
          allowed: true,
          remaining: Math.max(0, limit - count),
          retryAfterMs: 0,
        };
      });
    } catch {
      // Fail open rather than block legitimate traffic if Firestore has a
      // transient issue. A denial-of-service on the limiter itself shouldn't
      // cascade into a full outage.
      return { allowed: true, remaining: limit, retryAfterMs: 0 };
    }
  }
}

let instance: RateLimiter | null = null;
export function rateLimiter(): RateLimiter {
  if (!instance) instance = new FirestoreFixedWindowLimiter();
  return instance;
}

/**
 * Best-effort client IP extraction. Trusts the platform's forwarded header.
 * On Vercel, `x-forwarded-for` is set from the Edge Network. Local dev falls
 * back to a constant which effectively disables rate limiting — intentional.
 */
export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "local";
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
