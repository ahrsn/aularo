import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { heartbeat } from "@/lib/actions";

const bodySchema = z.object({
  workspaceId: z.string(),
  displayId: z.string(),
  screenId: z.string(),
});

/**
 * POST /api/display/heartbeat
 * Called every 30s from the kiosk to report liveness.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
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
