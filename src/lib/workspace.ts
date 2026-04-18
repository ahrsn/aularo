import "server-only";
import { adminDb } from "./firebase-admin";
import { requireUser } from "./auth-session";

/**
 * Loads the authenticated user's active workspace.
 * Throws if the user has no workspace — which shouldn't happen after
 * /api/auth/session runs on first login, but guards against regressions.
 */
export async function requireActiveWorkspace() {
  const user = await requireUser();
  const userDoc = await adminDb().collection("users").doc(user.uid).get();
  const workspaceId = userDoc.get("activeWorkspaceId") as string | undefined;
  if (!workspaceId) throw new Error("NO_WORKSPACE");
  const wsSnap = await adminDb()
    .collection("workspaces")
    .doc(workspaceId)
    .get();
  if (!wsSnap.exists) throw new Error("WORKSPACE_MISSING");

  // Verify membership.
  const memberSnap = await wsSnap.ref.collection("members").doc(user.uid).get();
  if (!memberSnap.exists) throw new Error("NOT_A_MEMBER");

  return {
    uid: user.uid,
    userName: user.name ?? user.email ?? null,
    workspaceId,
    workspace: { id: workspaceId, ...(wsSnap.data() ?? {}) },
    role: memberSnap.get("role") as "owner" | "editor" | "viewer",
  };
}

export function workspaceRef(workspaceId: string) {
  return adminDb().collection("workspaces").doc(workspaceId);
}
