import type { Display, EventDoc, Slide, Slideshow, SlideKind } from "@/lib/schema";
import type { QrSubmission } from "@/lib/slideshow-data";

export type SaveStatus =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "saved"; savedAt: number }
  | { state: "offline" }
  | { state: "error"; message?: string };

export type BuilderProps = {
  slideshow: Slideshow;
  displays: Display[];
  events: EventDoc[];
  submissions: QrSubmission[];
  submissionSlug: string | null;
  workspaceId: string;
  appBaseUrl: string;
};

export type SlideActionHandlers = {
  onSelect: (slideId: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onDuplicate: (slideId: string) => void;
  onDelete: (slideId: string) => void;
  onToggleHidden: (slideId: string) => void;
  onEditSlide: (
    slideId: string,
    patch: {
      data?: Record<string, unknown>;
      durationMs?: number | null;
    },
  ) => void;
  onAddSlide: (kind: SlideKind, afterSlideId?: string) => void;
};

export type BuilderRuntime = {
  slides: Slide[];
  selectedId: string | null;
  status: SaveStatus;
} & SlideActionHandlers;
