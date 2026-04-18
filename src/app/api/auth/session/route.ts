import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  clearSessionCookie,
  createSessionCookie,
} from "@/lib/auth-session";
import { TRIAL_DURATION_MS } from "@/lib/schema";
import { displayLimitFor } from "@/lib/plan";

const bodySchema = z.object({
  idToken: z.string().min(1),
});

/**
 * POST /api/auth/session
 * Accepts a Firebase ID token from the client, mints a session cookie,
 * and ensures the user has a default workspace on first login.
 */
export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const decoded = await adminAuth()
    .verifyIdToken(parsed.data.idToken)
    .catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  await createSessionCookie(parsed.data.idToken);
  await ensureUserAndWorkspace(decoded.uid, {
    email: decoded.email ?? null,
    name: decoded.name ?? null,
    photo: decoded.picture ?? null,
  });

  return NextResponse.json({ ok: true });
}

/** DELETE /api/auth/session — sign out. */
export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

async function ensureUserAndWorkspace(
  uid: string,
  profile: { email: string | null; name: string | null; photo: string | null },
) {
  const db = adminDb();
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();

  if (userSnap.exists && userSnap.get("activeWorkspaceId")) return;

  const workspaceRef = db.collection("workspaces").doc();
  const workspaceId = workspaceRef.id;
  const defaultName = profile.name
    ? `${profile.name.split(" ")[0]}'s workspace`
    : "My workspace";
  const now = Date.now();

  const batch = db.batch();
  batch.set(
    userRef,
    {
      email: profile.email,
      displayName: profile.name,
      photoURL: profile.photo,
      createdAt: now,
      activeWorkspaceId: workspaceId,
      onboardingCompletedAt: null,
      source: null,
    },
    { merge: true },
  );
  batch.set(workspaceRef, {
    id: workspaceId,
    name: defaultName,
    ownerUid: uid,
    plan: "free",
    displayLimit: displayLimitFor("free"),
    createdAt: now,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    useCase: null,
    trialStartedAt: now,
    trialEndsAt: now + TRIAL_DURATION_MS,
    slug: null,
    timezone: "America/Chicago",
    logoUrl: null,
    logoR2Key: null,
    brand: { accent: "#3B5A41", background: "#F5F1E8" },
  });
  batch.set(workspaceRef.collection("members").doc(uid), {
    role: "owner",
    joinedAt: Date.now(),
    uid,
  });
  await batch.commit();
}
