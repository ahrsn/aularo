import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { RouteFade } from "@/components/ui/route-fade";
import { UIProvider } from "@/components/providers";
import { WhatsNewModal } from "@/components/changelog/whats-new-modal";
import { getSessionUser } from "@/lib/auth-session";
import { adminDb } from "@/lib/firebase-admin";
import { listEvents } from "@/lib/slideshow-data";
import { getChangelog } from "@/lib/changelog";
import pkg from "../../../package.json";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const userDoc = await adminDb().collection("users").doc(user.uid).get();
  const onboardingCompletedAt = userDoc.get("onboardingCompletedAt") as
    | number
    | null
    | undefined;
  if (!onboardingCompletedAt) redirect("/onboarding");
  const workspaceId = userDoc.get("activeWorkspaceId") as string | undefined;
  const lastSeenChangelogVersion =
    (userDoc.get("lastSeenChangelogVersion") as string | null | undefined) ??
    null;
  const currentRelease =
    getChangelog().find((r) => r.version === pkg.version) ?? null;
  let workspaceName = "Workspace";
  let events: Array<{
    id: string;
    name: string;
    startAt: number | null;
    endAt: number | null;
  }> = [];
  if (workspaceId) {
    const [ws, evts] = await Promise.all([
      adminDb().collection("workspaces").doc(workspaceId).get(),
      listEvents(workspaceId),
    ]);
    workspaceName = (ws.get("name") as string) ?? workspaceName;
    events = evts.map((e) => ({
      id: e.id,
      name: e.name,
      startAt: e.startAt ?? null,
      endAt: e.endAt ?? null,
    }));
  }

  const initials =
    ((user.name as string | undefined) ?? (user.email as string | undefined) ?? "you")
      .split(/\s+/)
      .map((s: string) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CL";

  return (
    <UIProvider>
      <div className="grid min-h-screen" style={{ gridTemplateColumns: "240px 1fr" }}>
        <Sidebar
          workspaceName={workspaceName}
          userInitials={initials}
          userName={user.name ?? user.email ?? "You"}
          events={events}
          appVersion={pkg.version}
        />
        <main className="min-w-0">
          <RouteFade>{children}</RouteFade>
        </main>
      </div>
      {currentRelease && (
        <WhatsNewModal
          release={currentRelease}
          lastSeenVersion={lastSeenChangelogVersion}
        />
      )}
    </UIProvider>
  );
}
