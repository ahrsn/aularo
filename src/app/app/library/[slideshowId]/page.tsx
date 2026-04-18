import { notFound } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { requireActiveWorkspace } from "@/lib/workspace";
import {
  getSlideshow,
  listDisplays,
  listEvents,
  listPendingSubmissions,
} from "@/lib/slideshow-data";
import { SlideshowEditor } from "./editor-client";
import { SubmissionsPanel } from "./submissions-panel";

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

  const crumb = (
    <span>
      <Link href="/app/library" className="text-muted hover:underline">
        Slideshows
      </Link>{" "}
      <span className="text-line-strong">/</span>{" "}
      <span className="text-ink">{slideshow.name}</span>
    </span>
  );

  return (
    <>
      <Topbar crumb={crumb} />
      <SlideshowEditor
        slideshow={{ ...slideshow, slides: slideshow.slides ?? [] }}
        displays={displays}
        events={events}
        workspaceId={workspaceId}
        submissionsPanel={
          <SubmissionsPanel
            slideshowId={slideshow.id}
            initialSubmissions={submissions}
            initialSlug={slideshow.submissionSlug ?? null}
            baseUrl={APP_BASE}
          />
        }
      />
    </>
  );
}
