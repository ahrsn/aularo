import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-session";
import { adminDb } from "@/lib/firebase-admin";
import { OnboardingWizard } from "./onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const userSnap = await adminDb().collection("users").doc(user.uid).get();
  if (userSnap.get("onboardingCompletedAt")) redirect("/app/library");

  const workspaceId = userSnap.get("activeWorkspaceId") as string | undefined;
  let defaultWorkspaceName = "My workspace";
  if (workspaceId) {
    const ws = await adminDb()
      .collection("workspaces")
      .doc(workspaceId)
      .get();
    defaultWorkspaceName =
      (ws.get("name") as string | undefined) ?? defaultWorkspaceName;
  }

  const defaultName =
    (userSnap.get("displayName") as string | undefined) ??
    (user.name as string | undefined) ??
    "";

  return (
    <OnboardingWizard
      defaultName={defaultName}
      defaultWorkspaceName={defaultWorkspaceName}
    />
  );
}
