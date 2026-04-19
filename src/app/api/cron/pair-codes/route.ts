import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyCronRequest } from "@/lib/cron-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Belt-and-suspenders sweeper for expired pairingCodes. Native Firestore TTL
 * (see scripts/enable-firestore-ttl.sh) reclaims them within ~24h; this runs
 * every 15 minutes to keep the hot set tight.
 */
export async function GET(req: NextRequest) {
  if (!verifyCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const snap = await adminDb()
    .collection("pairingCodes")
    .where("expiresAt", "<", now)
    .limit(500)
    .get();

  if (snap.empty) return NextResponse.json({ deleted: 0 });

  const batch = adminDb().batch();
  for (const doc of snap.docs) batch.delete(doc.ref);
  await batch.commit();
  return NextResponse.json({ deleted: snap.size });
}
