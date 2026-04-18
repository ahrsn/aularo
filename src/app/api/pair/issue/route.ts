import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { issuePairingCode } from "@/lib/actions";

const bodySchema = z.object({
  screenId: z.string().min(8).max(128),
});

/**
 * POST /api/pair/issue
 * Public endpoint — a kiosk requests a fresh pairing code for its screenId.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const out = await issuePairingCode(parsed.data);
  return NextResponse.json(out);
}
