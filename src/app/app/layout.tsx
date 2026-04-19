import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { RouteFade } from "@/components/ui/route-fade";
import { UIProvider } from "@/components/providers";
import { WhatsNewModal } from "@/components/changelog/whats-new-modal";
import { getSessionUser } from "@/lib/auth-session";
import { adminDb } from "@/lib/firebase-admin";
import { listDisplays, listSlideshows } from "@/lib/slideshow-data";
import type { SidebarNowPlaying } from "@/components/layout/sidebar";
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
  let nowPlaying: SidebarNowPlaying[] = [];
  if (workspaceId) {
    const [ws, displays, slideshows] = await Promise.all([
      adminDb().collection("workspaces").doc(workspaceId).get(),
      listDisplays(workspaceId),
      listSlideshows(workspaceId),
    ]);
    workspaceName = (ws.get("name") as string) ?? workspaceName;
    const slideshowName = new Map(slideshows.map((s) => [s.id, s.name]));
    const statusRank: Record<SidebarNowPlaying["status"], number> = {
      live: 0,
      online: 1,
      paused: 2,
      draft: 3,
      offline: 4,
    };
    nowPlaying = displays
      .map((d) => ({
        id: d.id,
        name: d.name,
        status: d.status,
        slideshowName: d.currentSlideshowId
          ? slideshowName.get(d.currentSlideshowId) ?? null
          : null,
      }))
      .filter((d) => d.slideshowName !== null)
      .sort((a, b) => statusRank[a.status] - statusRank[b.status]);
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
          nowPlaying={nowPlaying}
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
