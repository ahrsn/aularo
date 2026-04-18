import { listInvites, listMembers } from "@/lib/slideshow-data";
import { requireActiveWorkspace } from "@/lib/workspace";
import type { Workspace } from "@/lib/schema";
import { IdentityHeader } from "./identity-header";
import { GeneralForm } from "./general-form";
import { TeamSection } from "./team-section";
import { DangerZone } from "./danger-zone";

export default async function WorkspaceSettingsPage() {
  const { uid, workspaceId, workspace, role } = await requireActiveWorkspace();
  const [members, invites] = await Promise.all([
    listMembers(workspaceId),
    listInvites(workspaceId),
  ]);

  const ws = workspace as unknown as Workspace;

  return (
    <div className="flex flex-col gap-8">
      <IdentityHeader workspace={ws} canEdit={role === "owner"} />

      <GeneralForm
        canEdit={role === "owner"}
        initialName={ws.name ?? ""}
        initialSlug={ws.slug ?? null}
        initialTimezone={ws.timezone ?? "America/Chicago"}
      />

      <TeamSection
        canManage={role === "owner"}
        currentUid={uid}
        initialMembers={members}
        initialInvites={invites}
      />

      {role === "owner" && (
        <DangerZone
          workspaceName={ws.name ?? ""}
          currentUid={uid}
          members={members}
        />
      )}
    </div>
  );
}
