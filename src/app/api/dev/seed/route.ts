import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { adminDb } from "@/lib/firebase-admin";
import { seedChaosOffice } from "@/lib/seed";

/**
 * POST /api/dev/seed
 * Seeds Chaos Digital Office mock data into the authenticated user's
 * active workspace. Gated to the owner's email for safety.
 */
export async function POST() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  if (user.email !== "harrisonahmaad@gmail.com") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
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
