import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyCronRequest } from "@/lib/cron-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STALE_MS = 2 * 60_000;

/**
 * Mark online displays offline when no heartbeat has arrived in 2 minutes.
 * Runs every minute. Uses a collection-group query to sweep across all
 * workspaces in one pass.
 */
export async function GET(req: NextRequest) {
  if (!verifyCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cutoff = Date.now() - STALE_MS;
  const snap = await adminDb()
    .collectionGroup("displays")
    .where("status", "==", "online")
    .where("lastHeartbeat", "<", cutoff)
    .limit(500)
    .get();

  if (snap.empty) return NextResponse.json({ marked: 0 });

  const batch = adminDb().batch();
  for (const doc of snap.docs) batch.update(doc.ref, { status: "offline" });
  await batch.commit();
  return NextResponse.json({ marked: snap.size });
}
