import "server-only";
import { cache } from "react";
import { adminDb } from "./firebase-admin";
import { requireUser } from "./auth-session";

/**
 * Loads the authenticated user's active workspace.
 * Wrapped in React `cache()` so Topbar, layout, and page all share one
 * Firestore read per request instead of fanning out.
 */
export const requireActiveWorkspace = cache(async () => {
  const user = await requireUser();
  const userDoc = await adminDb().collection("users").doc(user.uid).get();
  const workspaceId = userDoc.get("activeWorkspaceId") as string | undefined;
  if (!workspaceId) throw new Error("NO_WORKSPACE");
  const wsSnap = await adminDb()
    .collection("workspaces")
    .doc(workspaceId)
    .get();
  if (!wsSnap.exists) throw new Error("WORKSPACE_MISSING");

  const memberSnap = await wsSnap.ref.collection("members").doc(user.uid).get();
  if (!memberSnap.exists) throw new Error("NOT_A_MEMBER");

  return {
    uid: user.uid,
    userName: user.name ?? user.email ?? null,
    workspaceId,
    workspace: { id: workspaceId, ...(wsSnap.data() ?? {}) },
    role: memberSnap.get("role") as "owner" | "editor" | "viewer",
  };
});

export function workspaceRef(workspaceId: string) {
  return adminDb().collection("workspaces").doc(workspaceId);
}

/**
 * Resolve a workspace by its public slug. Returns null if no workspace
 * has that slug reserved. Used by public endpoints (display claim) that
 * can't run under requireActiveWorkspace().
 */
export async function getWorkspaceBySlug(slug: string) {
  const slugSnap = await adminDb()
    .collection("workspaceSlugs")
    .doc(slug)
    .get();
  if (!slugSnap.exists) return null;
  const workspaceId = slugSnap.get("workspaceId") as string | undefined;
  if (!workspaceId) return null;
  const wsSnap = await workspaceRef(workspaceId).get();
  if (!wsSnap.exists) return null;
  return { workspaceId, workspace: { id: workspaceId, ...(wsSnap.data() ?? {}) } };
}
