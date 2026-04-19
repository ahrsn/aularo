import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { heartbeat } from "@/lib/actions";
import { rateLimiter, rateLimitedResponse } from "@/lib/rate-limit";

const bodySchema = z.object({
  workspaceId: z.string(),
  displayId: z.string(),
  screenId: z.string(),
  ts: z.number().int().optional(),
  sig: z.string().optional(),
});

/**
 * POST /api/display/heartbeat
 * Called every 30s from the kiosk to report liveness.
 *
 * Rate-limited per (workspaceId, displayId): the legitimate rate is 2/min, so
 * a 60/min ceiling gives ample headroom while cheaply capping any attacker
 * who guesses a triple and tries to drive write volume.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { workspaceId, displayId } = parsed.data;
  const rl = await rateLimiter().consume(
    `heartbeat:${workspaceId}:${displayId}`,
    { limit: 60, windowMs: 60_000, onError: "closed" },
  );
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterMs);

  try {
    const out = await heartbeat(parsed.data);
    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "error" },
      { status: 403 },
    );
  }
}
