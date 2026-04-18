import { Topbar } from "@/components/layout/topbar";
import { requireActiveWorkspace } from "@/lib/workspace";
import {
  listDisplays,
  listEvents,
  listSlideshows,
} from "@/lib/slideshow-data";
import { LibraryClient } from "./library-client";
import { NewSlideshowButton } from "./new-slideshow-button";

export default async function LibraryPage() {
  const { workspaceId } = await requireActiveWorkspace();
  const [slideshows, displays, events] = await Promise.all([
    listSlideshows(workspaceId),
    listDisplays(workspaceId),
    listEvents(workspaceId),
  ]);

  const safe = slideshows.map((s) => ({ ...s, slides: s.slides ?? [] }));

  return (
    <>
      <Topbar
        crumb="Slideshows"
        actions={<NewSlideshowButton />}
      />
      <LibraryClient
        initialSlideshows={safe}
        displays={displays}
        events={events}
      />
    </>
  );
}
