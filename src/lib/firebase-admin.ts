import "server-only";

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firebase Admin bootstrap. Supports two credential modes:
 *
 * 1. Service-account JSON in FIREBASE_SERVICE_ACCOUNT (single-line JSON).
 *    Preferred for production.
 *
 * 2. Application Default Credentials (ADC). Used when FIREBASE_SERVICE_ACCOUNT
 *    is empty. Locally: `gcloud auth application-default login`. On Vercel:
 *    set GOOGLE_APPLICATION_CREDENTIALS or use Workload Identity Federation.
 *
 * Either way, NEXT_PUBLIC_FIREBASE_PROJECT_ID must be set so the SDK knows
 * which project to target.
 */

function loadCredentialFromJson() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) return null;
  try {
    return cert(JSON.parse(raw));
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT must be valid JSON (paste the whole service-account key on one line)",
    );
  }
}

function ensureApp() {
  if (getApps().length) return;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID missing");
  }
  const credential = loadCredentialFromJson() ?? applicationDefault();
  initializeApp({ credential, projectId });
}

export function adminAuth() {
  ensureApp();
  return getAuth();
}

export function adminDb() {
  ensureApp();
  return getFirestore();
}
