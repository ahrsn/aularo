import { notFound } from "next/navigation";
import { requireActiveWorkspace } from "@/lib/workspace";
import {
  getSlideshow,
  listDisplays,
  listEvents,
  listPendingSubmissions,
} from "@/lib/slideshow-data";
import { BuilderClient } from "./builder-client";

const APP_BASE =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function SlideshowPage({
  params,
}: {
  params: Promise<{ slideshowId: string }>;
}) {
  const { slideshowId } = await params;
  const { workspaceId } = await requireActiveWorkspace();
  const [slideshow, displays, events, submissions] = await Promise.all([
    getSlideshow(workspaceId, slideshowId),
    listDisplays(workspaceId),
    listEvents(workspaceId),
    listPendingSubmissions(workspaceId, slideshowId),
  ]);
  if (!slideshow) notFound();

  return (
    <BuilderClient
      slideshow={{ ...slideshow, slides: slideshow.slides ?? [] }}
      displays={displays}
      events={events}
      submissions={submissions}
      submissionSlug={slideshow.submissionSlug ?? null}
      workspaceId={workspaceId}
      appBaseUrl={APP_BASE}
    />
  );
}
