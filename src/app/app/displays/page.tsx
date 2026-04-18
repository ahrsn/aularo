import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { StatusText, type DisplayStatus } from "@/components/ui/status-dot";
import { requireActiveWorkspace } from "@/lib/workspace";
import { listDisplays } from "@/lib/slideshow-data";
import { DisplaysClient } from "./displays-client";

export default async function DisplaysPage() {
  const { workspaceId, workspace } = await requireActiveWorkspace();
  const displays = await listDisplays(workspaceId);
  const workspaceSlug =
    (workspace as { slug?: string | null }).slug ?? null;

  return (
    <>
      <Topbar crumb="Displays" actions={<DisplaysTopbarActions />} />
      <DisplaysClient
        initialDisplays={displays}
        workspaceSlug={workspaceSlug}
      />
    </>
  );
}

function DisplaysTopbarActions() {
  // The button lives in the client file so it can open the modal.
  return null;
}
