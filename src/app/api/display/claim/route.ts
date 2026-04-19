import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { claimDisplayByShortCode } from "@/lib/actions";
import {
  enforceIpRateLimit,
  rateLimiter,
  rateLimitedResponse,
} from "@/lib/rate-limit";

const bodySchema = z.object({
  wsSlug: z.string().min(3).max(32),
  code: z
    .string()
    .min(4)
    .max(12)
    .transform((s) => s.toUpperCase()),
  screenId: z.string().min(8).max(128),
  browserInfo: z.string().max(256).optional(),
});

/**
 * POST /api/display/claim
 * Public endpoint — a kiosk binds itself to a pre-created Display by its
 * workspace slug + short code.
 */
export async function POST(req: NextRequest) {
  const limited = await enforceIpRateLimit(req, "display:claim", {
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  // Per-(wsSlug, code) cap: makes brute-forcing a specific target display's
  // code uninteresting even on distributed IPs. 5/hour is well above any
  // legitimate retry pattern (user fat-fingers the code a few times, asks
  // admin for a new one).
  const perCodeRl = await rateLimiter().consume(
    `display:claim:${parsed.data.wsSlug}:${parsed.data.code}`,
    { limit: 5, windowMs: 60 * 60_000, onError: "closed" },
  );
  if (!perCodeRl.allowed) return rateLimitedResponse(perCodeRl.retryAfterMs);

  try {
    const out = await claimDisplayByShortCode(parsed.data);
    return NextResponse.json(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    const knownErrors = new Set([
      "WORKSPACE_NOT_FOUND",
      "CODE_NOT_FOUND",
      "DISPLAY_MISSING",
      "DISPLAY_IN_USE",
    ]);
    const status = knownErrors.has(msg) ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
