import { NextResponse, type NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { requireUser } from "@/lib/auth-session";
import { adminDb } from "@/lib/firebase-admin";
import { seedChaosOffice } from "@/lib/seed";

export const runtime = "nodejs";

/**
 * POST /api/dev/seed
 * Seeds mock data. Never available in production. Requires SEED_TOKEN header
 * in non-production to prevent lateral abuse from any authenticated session.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const configured = process.env.SEED_TOKEN;
  if (!configured) {
    return NextResponse.json({ error: "seed disabled" }, { status: 404 });
  }
  const provided = req.headers.get("x-seed-token") ?? "";
  const a = createHash("sha256").update(configured).digest();
  const b = createHash("sha256").update(provided).digest();
  if (!timingSafeEqual(a, b)) {
    return new NextResponse(null, { status: 404 });
  }

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  try {
    const db = adminDb();
    const userDoc = await db.collection("users").doc(user.uid).get();
    const workspaceId = userDoc.get("activeWorkspaceId") as string | undefined;
    if (!workspaceId) {
      return NextResponse.json({ error: "no active workspace" }, { status: 400 });
    }
    const result = await seedChaosOffice(db, workspaceId, user.uid);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
