import { Topbar } from "@/components/layout/topbar";
import { requireActiveWorkspace } from "@/lib/workspace";
import { listDisplays, listSlideshows } from "@/lib/slideshow-data";
import { InsightsClient } from "./insights-client";

export default async function InsightsPage() {
  const { workspaceId, workspace } = await requireActiveWorkspace();
  const [displays, slideshows] = await Promise.all([
    listDisplays(workspaceId),
    listSlideshows(workspaceId),
  ]);
  const ws = workspace as unknown as { name?: string };

  return (
    <>
      <Topbar crumb="Insights" />
      <InsightsClient
        workspaceName={ws.name ?? "Workspace"}
        displays={displays}
        slideshows={slideshows}
      />
    </>
  );
}
