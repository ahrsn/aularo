import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { enforceIpRateLimit } from "@/lib/rate-limit";

/**
 * GET /api/pair/check?code=ABC123&screenId=...
 * Returns the claim status of a pairing code. Server-side (Admin SDK) so
 * the kiosk doesn't need any Firestore client permission to poll.
 *
 * On claimed=true, if the caller provides the matching screenId, the
 * response includes `authSecret` (generated at claim time) and the secret
 * is cleared from the pairingCodes doc so it can only be retrieved once.
 */
export async function GET(req: NextRequest) {
  // Rate-limit FIRST — otherwise malformed-code flooding gets 400s for free.
  // Legitimate kiosks poll ~60x per 10-minute code lifetime; 120/min is ample.
  const limited = await enforceIpRateLimit(req, "pair:check", {
    limit: 120,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const code = req.nextUrl.searchParams.get("code");
  if (!code || !/^[A-Z0-9]{4,10}$/.test(code)) {
    return NextResponse.json({ error: "bad code" }, { status: 400 });
  }
  const screenId = req.nextUrl.searchParams.get("screenId");

  const ref = adminDb().collection("pairingCodes").doc(code);

  // Atomic read-and-clear for the authSecret: two concurrent polls with the
  // same valid screenId must not both receive the secret. `runTransaction`
  // serializes the read/update against any other writer.
  const result = await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { exists: false as const };
    const data = snap.data() ?? {};
    const claimed = Boolean(data.claimedAt);
    let authSecret: string | null = null;
    if (
      claimed &&
      screenId &&
      data.screenId === screenId &&
      typeof data.authSecret === "string"
    ) {
      authSecret = data.authSecret as string;
      tx.update(ref, { authSecret: null });
    }
    return {
      exists: true as const,
      claimed,
      workspaceId: (data.workspaceId as string | null) ?? null,
      displayId: (data.displayId as string | null) ?? null,
      expiresAt: (data.expiresAt as number | null) ?? null,
      authSecret,
    };
  });

  if (!result.exists) {
    return NextResponse.json(
      { exists: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
