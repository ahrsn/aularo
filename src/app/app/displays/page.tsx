import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { StatusText, type DisplayStatus } from "@/components/ui/status-dot";
import { requireActiveWorkspace } from "@/lib/workspace";
import { listDisplays } from "@/lib/slideshow-data";
import { DisplaysClient } from "./displays-client";

export default async function DisplaysPage() {
  const { workspaceId } = await requireActiveWorkspace();
  const displays = await listDisplays(workspaceId);

  return (
    <>
      <Topbar crumb="Displays" actions={<DisplaysTopbarActions />} />
      <DisplaysClient initialDisplays={displays} />
    </>
  );
}

function DisplaysTopbarActions() {
  // The button lives in the client file so it can open the modal.
  return null;
}
