/**
 * Seed Chaos Digital Office mock data into the real Firebase project
 * for a specific user (looked up by email). Run with:
 *
 *   pnpm tsx --env-file=.env.local scripts/seed.ts
 *
 * Reads FIREBASE_SERVICE_ACCOUNT + NEXT_PUBLIC_FIREBASE_PROJECT_ID from env.
 */

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { seedChaosOffice } from "../src/lib/seed";

const TARGET_EMAIL = process.env.SEED_EMAIL ?? "harrisonahmaad@gmail.com";

function credentialFromEnv() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) return applicationDefault();
  return cert(JSON.parse(raw));
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID missing");

  if (!getApps().length) {
    initializeApp({ credential: credentialFromEnv(), projectId });
  }

  const auth = getAuth();
  const db = getFirestore();

  console.log(`→ looking up user: ${TARGET_EMAIL}`);
  const user = await auth.getUserByEmail(TARGET_EMAIL);
  console.log(`  uid: ${user.uid}`);

  const userDoc = await db.collection("users").doc(user.uid).get();
  const workspaceId = userDoc.get("activeWorkspaceId") as string | undefined;
  if (!workspaceId) {
    throw new Error(
      `user ${TARGET_EMAIL} has no activeWorkspaceId — log into the app once first`,
    );
  }
  console.log(`  workspace: ${workspaceId}`);

  console.log(`→ seeding...`);
  const result = await seedChaosOffice(db, workspaceId, user.uid);
  console.log("✓ seeded");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("✗ seed failed:", err);
  process.exit(1);
});
