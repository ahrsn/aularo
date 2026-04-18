import { Topbar } from "@/components/layout/topbar";
import { requireActiveWorkspace } from "@/lib/workspace";
import {
  listEvents,
  listIntegrations,
  listMediaAssets,
} from "@/lib/slideshow-data";
import { MediaClient } from "./media-client";

export default async function MediaPage() {
  const { workspaceId } = await requireActiveWorkspace();
  const [assets, events, integrations] = await Promise.all([
    listMediaAssets(workspaceId),
    listEvents(workspaceId),
    listIntegrations(workspaceId),
  ]);

  return (
    <>
      <Topbar crumb="Media" />
      <MediaClient
        initialAssets={assets}
        events={events}
        integrations={integrations}
      />
    </>
  );
}
