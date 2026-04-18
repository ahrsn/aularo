import { Topbar } from "@/components/layout/topbar";
import { requireActiveWorkspace } from "@/lib/workspace";
import {
  listAutomations,
  listDisplays,
  listScheduleBlocks,
  listSlideshows,
} from "@/lib/slideshow-data";
import { ScheduleClient } from "./schedule-client";
import { todayKey } from "@/components/schedule/time-utils";

export default async function SchedulePage() {
  const { workspaceId } = await requireActiveWorkspace();
  const [displays, slideshows, blocks, automations] = await Promise.all([
    listDisplays(workspaceId),
    listSlideshows(workspaceId),
    listScheduleBlocks(workspaceId),
    listAutomations(workspaceId),
  ]);

  return (
    <>
      <Topbar crumb="Schedule" />
      <ScheduleClient
        displays={displays}
        blocks={blocks}
        slideshows={slideshows}
        automations={automations}
        initialDay={todayKey()}
      />
    </>
  );
}
