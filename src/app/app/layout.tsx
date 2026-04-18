import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { UIProvider } from "@/components/providers";
import { getSessionUser } from "@/lib/auth-session";
import { adminDb } from "@/lib/firebase-admin";
import { listEvents } from "@/lib/slideshow-data";

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
        />
        <main className="min-w-0">{children}</main>
      </div>
    </UIProvider>
  );
}
