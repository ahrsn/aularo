import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { enforceIpRateLimit } from "@/lib/rate-limit";

/**
 * GET /api/pair/check?code=ABC123
 * Returns the claim status of a pairing code. Server-side (Admin SDK) so
 * the kiosk doesn't need any Firestore client permission to poll.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code || !/^[A-Z0-9]{4,10}$/.test(code)) {
    return NextResponse.json({ error: "bad code" }, { status: 400 });
  }
  // Rate-limit per IP to deter code enumeration. Legitimate kiosks poll ~60x
  // per 10-minute code lifetime — 120/min ceiling is well above that.
  const limited = await enforceIpRateLimit(req, "pair:check", {
    limit: 120,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const snap = await adminDb().collection("pairingCodes").doc(code).get();
  if (!snap.exists) {
    return NextResponse.json({ exists: false });
  }
  const data = snap.data() ?? {};
  return NextResponse.json(
    {
      exists: true,
      claimed: Boolean(data.claimedAt),
      workspaceId: (data.workspaceId as string | null) ?? null,
      displayId: (data.displayId as string | null) ?? null,
      expiresAt: (data.expiresAt as number | null) ?? null,
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
