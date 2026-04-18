import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { claimDisplayByShortCode } from "@/lib/actions";

const bodySchema = z.object({
  wsSlug: z.string().min(3).max(32),
  code: z.string().min(4).max(12),
  screenId: z.string().min(8).max(128),
  browserInfo: z.string().max(256).optional(),
});

/**
 * POST /api/display/claim
 * Public endpoint — a kiosk binds itself to a pre-created Display by its
 * workspace slug + short code.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  try {
    const out = await claimDisplayByShortCode({
      wsSlug: parsed.data.wsSlug,
      code: parsed.data.code.toUpperCase(),
      screenId: parsed.data.screenId,
      browserInfo: parsed.data.browserInfo,
    });
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
