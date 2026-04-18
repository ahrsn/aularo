"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { SlideshowSettingsModal } from "@/components/slideshow-settings/modal";
import { MediaPickerModal } from "@/components/media-picker/modal";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import {
  addSlide,
  assignSlideshow,
  deleteSlide,
  duplicateSlide,
  renameSlideshow,
  reorderSlides,
  setSlideshowStatus,
  updateSlide,
} from "@/lib/actions";
import type {
  Display,
  EventDoc,
  Slide,
  SlideKind,
  Slideshow,
  SlideshowStatus,
} from "@/lib/schema";
import type { QrSubmission } from "@/lib/slideshow-data";
import { BuilderHeader } from "./builder/header";
import { Filmstrip } from "./builder/filmstrip";
import { PreviewCanvas } from "./builder/preview-canvas";
import { Inspector } from "./builder/inspector";
import { TemplatePicker } from "./builder/template-picker";
import { SubmissionsSheet } from "./builder/submissions-sheet";
import { BuilderKeyboard } from "./builder/keyboard";
import type { SaveStatus } from "./builder/types";

type Props = {
  slideshow: Slideshow;
  displays: Display[];
  events: EventDoc[];
  submissions: QrSubmission[];
  submissionSlug: string | null;
  workspaceId: string;
  appBaseUrl: string;
};

const AUTOSAVE_DEBOUNCE_MS = 400;

export function BuilderClient({
  slideshow: initialSlideshow,
  displays,
  events,
  submissions,
  submissionSlug,
  workspaceId,
  appBaseUrl,
}: Props) {
  const router = useRouter();
  const toast = useToast();

  // Local mirrors that we update optimistically. On server refresh, props
  // change and we reconcile via useEffect below.
  const [slideshow, setSlideshow] = useState<Slideshow>(initialSlideshow);
  const [slides, setSlides] = useState<Slide[]>(initialSlideshow.slides ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(
    (initialSlideshow.slides ?? [])[0]?.id ?? null,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ state: "idle" });
  const [templateOpen, setTemplateOpen] = useState(
    (initialSlideshow.slides ?? []).length === 0,
  );
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [deleteSlideId, setDeleteSlideId] = useState<string | null>(null);
  const [mediaTargetSlideId, setMediaTargetSlideId] = useState<string | null>(null);
  const [mediaTargetField, setMediaTargetField] = useState<string>("img");

  // Reconcile when server props change (after revalidatePath).
  useEffect(() => {
    setSlideshow(initialSlideshow);
    setSlides(initialSlideshow.slides ?? []);
    if (!selectedId && (initialSlideshow.slides ?? []).length > 0) {
      setSelectedId(initialSlideshow.slides[0].id);
    }
  }, [initialSlideshow, selectedId]);

  // Autosave queue: one pending timer per slide.
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const inFlight = useRef<Set<string>>(new Set());

  // Cleanup on unmount.
  useEffect(() => {
    const t = timers.current;
    return () => {
      t.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const selectedSlide = useMemo(
    () => slides.find((s) => s.id === selectedId) ?? null,
    [slides, selectedId],
  );

  // ── Persistence helpers ─────────────────────────────────────────────
  const flushSlide = useCallback(
    async (slideId: string) => {
      const slide = slides.find((s) => s.id === slideId);
      if (!slide) return;
      inFlight.current.add(slideId);
      setSaveStatus({ state: "saving" });
      try {
        const res = await updateSlide({
          slideshowId: slideshow.id,
          slideId,
          data: slide.data ?? {},
          durationMs:
            slide.durationMs === undefined ? undefined : (slide.durationMs ?? null),
          hidden: slide.hidden,
        });
        inFlight.current.delete(slideId);
        if (inFlight.current.size === 0) {
          setSaveStatus({ state: "saved", savedAt: res.savedAt ?? Date.now() });
        }
      } catch (e) {
        inFlight.current.delete(slideId);
        const offline = !navigator.onLine;
        setSaveStatus(
          offline ? { state: "offline" } : { state: "error", message: String(e) },
        );
      }
    },
    [slides, slideshow.id],
  );

  const scheduleSave = useCallback(
    (slideId: string) => {
      const existing = timers.current.get(slideId);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        timers.current.delete(slideId);
        void flushSlide(slideId);
      }, AUTOSAVE_DEBOUNCE_MS);
      timers.current.set(slideId, t);
    },
    [flushSlide],
  );

  // ── Slide-level handlers ────────────────────────────────────────────
  const handleFieldChange = useCallback(
    (path: string, value: unknown) => {
      if (!selectedId) return;
      setSlides((prev) =>
        prev.map((s) =>
          s.id === selectedId
            ? { ...s, data: { ...(s.data ?? {}), [path]: value } }
            : s,
        ),
      );
      scheduleSave(selectedId);
    },
    [selectedId, scheduleSave],
  );

  const handleDurationChange = useCallback(
    (ms: number | null) => {
      if (!selectedId) return;
      setSlides((prev) =>
        prev.map((s) =>
          s.id === selectedId
            ? {
                ...s,
                durationMs: ms === null ? undefined : ms,
              }
            : s,
        ),
      );
      scheduleSave(selectedId);
    },
    [selectedId, scheduleSave],
  );

  const handleReorder = useCallback(
    (orderedIds: string[]) => {
      const byId = new Map(slides.map((s) => [s.id, s]));
      const next = orderedIds
        .map((id) => byId.get(id))
        .filter((s): s is Slide => Boolean(s));
      setSlides(next);
      setSaveStatus({ state: "saving" });
      void (async () => {
        try {
          await reorderSlides({ slideshowId: slideshow.id, orderedIds });
          setSaveStatus({ state: "saved", savedAt: Date.now() });
        } catch (e) {
          setSaveStatus({ state: "error", message: String(e) });
          toast.error(e, "Couldn't save new order.");
          router.refresh();
        }
      })();
    },
    [slides, slideshow.id, router, toast],
  );

  const handleAddSlide = useCallback(
    async (kind: SlideKind) => {
      setTemplateOpen(false);
      setSaveStatus({ state: "saving" });
      try {
        const afterSlideId = selectedId ?? undefined;
        const created = await addSlide({
          slideshowId: slideshow.id,
          kind,
          data: {},
          afterSlideId,
        });
        setSlides((prev) => {
          const idx = afterSlideId
            ? prev.findIndex((s) => s.id === afterSlideId)
            : -1;
          const next = [...prev];
          const slide: Slide = { id: created.id, kind, data: {} };
          if (idx < 0) next.push(slide);
          else next.splice(idx + 1, 0, slide);
          return next;
        });
        setSelectedId(created.id);
        setSaveStatus({ state: "saved", savedAt: Date.now() });
        router.refresh();
      } catch (e) {
        setSaveStatus({ state: "error", message: String(e) });
        toast.error(e, "Couldn't add slide.");
      }
    },
    [slideshow.id, selectedId, router, toast],
  );

  const handleDuplicate = useCallback(
    async (slideId: string) => {
      try {
        const res = await duplicateSlide({ slideshowId: slideshow.id, slideId });
        setSelectedId(res.id);
        toast.success("Slide duplicated");
        router.refresh();
      } catch (e) {
        toast.error(e, "Couldn't duplicate slide.");
      }
    },
    [slideshow.id, router, toast],
  );

  const handleToggleHidden = useCallback(
    (slideId: string) => {
      const slide = slides.find((s) => s.id === slideId);
      if (!slide) return;
      const nextHidden = !slide.hidden;
      setSlides((prev) =>
        prev.map((s) => (s.id === slideId ? { ...s, hidden: nextHidden } : s)),
      );
      setSaveStatus({ state: "saving" });
      void (async () => {
        try {
          const res = await updateSlide({
            slideshowId: slideshow.id,
            slideId,
            data: slide.data ?? {},
            hidden: nextHidden,
          });
          setSaveStatus({ state: "saved", savedAt: res.savedAt ?? Date.now() });
        } catch (e) {
          setSaveStatus({ state: "error", message: String(e) });
          toast.error(e, "Couldn't update slide.");
        }
      })();
    },
    [slides, slideshow.id, toast],
  );

  const handleRequestDelete = useCallback((slideId: string) => {
    setDeleteSlideId(slideId);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteSlideId) return;
    const slideId = deleteSlideId;
    setDeleteSlideId(null);
    const prevSlides = slides;
    const nextSlides = slides.filter((s) => s.id !== slideId);
    setSlides(nextSlides);
    if (selectedId === slideId) {
      setSelectedId(nextSlides[0]?.id ?? null);
    }
    try {
      await deleteSlide({ slideshowId: slideshow.id, slideId });
      toast.success("Slide deleted");
      router.refresh();
    } catch (e) {
      setSlides(prevSlides);
      toast.error(e, "Couldn't delete slide.");
    }
  }, [deleteSlideId, slides, selectedId, slideshow.id, router, toast]);

  // ── Slideshow-level handlers ────────────────────────────────────────
  const handleRename = useCallback(
    async (name: string) => {
      setSlideshow((prev) => ({ ...prev, name }));
      try {
        await renameSlideshow({ slideshowId: slideshow.id, name });
        toast.success("Renamed");
      } catch (e) {
        toast.error(e, "Couldn't rename slideshow.");
        router.refresh();
      }
    },
    [slideshow.id, router, toast],
  );

  const handleStatusToggle = useCallback(
    async (status: SlideshowStatus) => {
      setSlideshow((prev) => ({ ...prev, status }));
      try {
        await setSlideshowStatus({ slideshowId: slideshow.id, status });
      } catch (e) {
        toast.error(e, "Couldn't change status.");
        router.refresh();
      }
    },
    [slideshow.id, router, toast],
  );

  const handlePublish = useCallback(
    async (displayId: string) => {
      try {
        if (slideshow.status !== "live") {
          await setSlideshowStatus({ slideshowId: slideshow.id, status: "live" });
          setSlideshow((prev) => ({ ...prev, status: "live" }));
        }
        await assignSlideshow({ displayId, slideshowId: slideshow.id });
        toast.success("Published");
        router.refresh();
      } catch (e) {
        toast.error(e, "Couldn't publish.");
      }
    },
    [slideshow.id, slideshow.status, router, toast],
  );

  const handleUnpublish = useCallback(
    async (displayId: string) => {
      try {
        await assignSlideshow({ displayId, slideshowId: null });
        toast.success("Stopped playback");
        router.refresh();
      } catch (e) {
        toast.error(e, "Couldn't stop playback.");
      }
    },
    [router, toast],
  );

  const handlePreviewFullscreen = useCallback(() => {
    const publicSlug = slideshow.publicSlug;
    if (publicSlug) {
      window.open(`${appBaseUrl}/s/${publicSlug}`, "_blank");
    } else {
      toast.info(
        "Enable a public preview URL in Settings → Access to launch full-screen preview.",
      );
    }
  }, [slideshow.publicSlug, appBaseUrl, toast]);

  // Media picker bridging — inspectors call `onPickImage` which opens the
  // global picker. We capture the slide+field being edited so the picker's
  // result routes to the right place.
  const openMediaPickerFor = useCallback((slideId: string, field: string) => {
    setMediaTargetSlideId(slideId);
    setMediaTargetField(field);
    setMediaPickerOpen(true);
  }, []);

  const handlePickImageForSelected = useCallback(() => {
    if (!selectedId) return;
    openMediaPickerFor(selectedId, "img");
  }, [selectedId, openMediaPickerFor]);

  // Keyboard shortcuts — map to existing handlers.
  const selectedIdx = useMemo(
    () => (selectedId ? slides.findIndex((s) => s.id === selectedId) : -1),
    [slides, selectedId],
  );

  const kb = useMemo(
    () => ({
      onSelectPrev: () => {
        if (selectedIdx > 0) setSelectedId(slides[selectedIdx - 1].id);
      },
      onSelectNext: () => {
        if (selectedIdx >= 0 && selectedIdx < slides.length - 1) {
          setSelectedId(slides[selectedIdx + 1].id);
        }
      },
      onDuplicate: () => {
        if (selectedId) void handleDuplicate(selectedId);
      },
      onDelete: () => {
        if (selectedId) setDeleteSlideId(selectedId);
      },
      onAddSlide: () => setTemplateOpen(true),
    }),
    [selectedId, selectedIdx, slides, handleDuplicate],
  );

  const pendingSubmissions = submissions.length;

  return (
    <>
      <div className="flex h-screen flex-col">
        <BuilderHeader
          slideshow={slideshow}
          saveStatus={saveStatus}
          slideCount={slides.length}
          displays={displays}
          submissionsCount={pendingSubmissions}
          onRename={handleRename}
          onStatusToggle={handleStatusToggle}
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleSubmissions={() => setSubmissionsOpen((v) => !v)}
          onPreviewFullscreen={handlePreviewFullscreen}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
        />

        {submissionSlug && pendingSubmissions > 0 && !submissionsOpen && (
          <button
            type="button"
            onClick={() => setSubmissionsOpen(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-[8px] border-b border-line text-[12.5px] tracking-[-0.005em] hover:bg-[#FBF5E8]"
            style={{
              padding: "8px 20px",
              background: "#FBF5E8",
              color: "#0E1410",
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{ width: 6, height: 6, background: "#C97A5B" }}
            />
            {pendingSubmissions}{" "}
            {pendingSubmissions === 1 ? "submission" : "submissions"} waiting — review
          </button>
        )}

        <div className="relative flex flex-1 min-h-0">
          <Filmstrip
            slides={slides}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onReorder={handleReorder}
            onDuplicate={(id) => void handleDuplicate(id)}
            onToggleHidden={handleToggleHidden}
            onDelete={handleRequestDelete}
            onAddSlideClick={() => setTemplateOpen(true)}
          />

          <main className="flex flex-1 min-w-0 min-h-0">
            <PreviewCanvas
              slide={selectedSlide}
              slideshow={slideshow}
              events={events}
            />
          </main>

          <Inspector
            slide={selectedSlide}
            events={events}
            onField={handleFieldChange}
            onPickImage={handlePickImageForSelected}
            onDuplicate={() => selectedId && handleDuplicate(selectedId)}
            onDelete={() => selectedId && setDeleteSlideId(selectedId)}
            onToggleHidden={() => selectedId && handleToggleHidden(selectedId)}
            onDurationChange={handleDurationChange}
          />
        </div>
      </div>

      <BuilderKeyboard {...kb} />

      <TemplatePicker
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onPick={(kind) => void handleAddSlide(kind)}
        slideshowTheme={slideshow.theme ?? "dark"}
      />

      <SubmissionsSheet
        open={submissionsOpen}
        onClose={() => setSubmissionsOpen(false)}
        slideshowId={slideshow.id}
        initialSubmissions={submissions}
        initialSlug={submissionSlug}
        baseUrl={appBaseUrl}
      />

      <SlideshowSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        slideshow={slideshow}
      />

      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        workspaceId={workspaceId}
        onPick={(a) => {
          if (!a.publicUrl || !mediaTargetSlideId) return;
          setSlides((prev) =>
            prev.map((s) =>
              s.id === mediaTargetSlideId
                ? {
                    ...s,
                    data: { ...(s.data ?? {}), [mediaTargetField]: a.publicUrl },
                  }
                : s,
            ),
          );
          scheduleSave(mediaTargetSlideId);
        }}
        acceptMime="image/"
      />

      <ConfirmDialog
        open={deleteSlideId !== null}
        title="Delete this slide?"
        description="It drops from the slideshow right away."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteSlideId(null)}
      />
    </>
  );
}
