"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlideshowSettingsModal } from "@/components/slideshow-settings/modal";
import { MediaPickerModal } from "@/components/media-picker/modal";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import {
  addSlide,
  assignSlideshow,
  deleteSlide,
  reorderSlides,
  setSlideshowEvent,
  updateSlideshow,
} from "@/lib/actions";
import type { Display, EventDoc, Slideshow } from "@/lib/schema";

type Kind = "portrait" | "program" | "quote" | "photo";

export function SlideshowEditor({
  slideshow,
  displays,
  events,
  workspaceId,
  submissionsPanel,
}: {
  slideshow: Slideshow;
  displays: Display[];
  events: EventDoc[];
  workspaceId: string;
  submissionsPanel?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteSlideId, setDeleteSlideId] = useState<string | null>(null);
  const [kind, setKind] = useState<Kind>("photo");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [img, setImg] = useState("");
  const [caption, setCaption] = useState("");
  const [by, setBy] = useState("");

  function onAddSlide(e: React.FormEvent) {
    e.preventDefault();
    const data: Record<string, unknown> = {};
    if (kind === "photo") {
      if (img) data.img = img;
      if (caption) data.caption = caption;
    } else if (kind === "quote") {
      if (title) data.quote = title;
      if (by) data.by = by;
    } else if (kind === "portrait") {
      if (title) data.title = title;
      if (body) data.body = body;
      if (img) data.img = img;
    } else if (kind === "program") {
      if (title) data.title = title;
      data.items = [];
    }
    startTransition(async () => {
      await addSlide({ slideshowId: slideshow.id, kind, data });
      setTitle("");
      setBody("");
      setImg("");
      setCaption("");
      setBy("");
      router.refresh();
    });
  }

  function onPublish(displayId: string) {
    startTransition(async () => {
      await updateSlideshow({ id: slideshow.id, status: "live" });
      await assignSlideshow({ displayId, slideshowId: slideshow.id });
      router.refresh();
    });
  }

  function onDeleteSlide(slideId: string) {
    setDeleteSlideId(slideId);
  }

  function doDeleteSlide() {
    if (!deleteSlideId) return;
    const slideId = deleteSlideId;
    setDeleteSlideId(null);
    startTransition(async () => {
      await deleteSlide({ slideshowId: slideshow.id, slideId });
      router.refresh();
    });
  }

  function onMoveSlide(slideId: string, dir: -1 | 1) {
    const ids = slideshow.slides.map((s) => s.id);
    const idx = ids.indexOf(slideId);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= ids.length) return;
    const next = [...ids];
    [next[idx], next[target]] = [next[target], next[idx]];
    startTransition(async () => {
      await reorderSlides({ slideshowId: slideshow.id, orderedIds: next });
      router.refresh();
    });
  }

  return (
    <div
      className="grid min-w-0 gap-8"
      style={{ padding: "28px 32px 64px", gridTemplateColumns: "1fr 320px" }}
    >
      <section className="flex min-w-0 flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-label">Slideshow</div>
            <h2 className="text-h2">{slideshow.name}</h2>
            <div className="mt-1 text-[12.5px] tracking-[-0.005em] text-muted">
              {slideshow.slides.length} slides · status {slideshow.status}
            </div>
          </div>
          <Button
            variant="ghost"
            icon="gear"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </Button>
        </div>

        <div className="overflow-hidden rounded-[4px] border border-line bg-surface">
          {slideshow.slides.length === 0 && (
            <div className="p-10 text-center text-muted">
              No slides yet. Add one below.
            </div>
          )}
          {slideshow.slides.map((s, i) => {
            const thumb = (s.data as { img?: string })?.img;
            const isFirst = i === 0;
            const isLast = i === slideshow.slides.length - 1;
            return (
              <div
                key={s.id}
                className="flex items-center gap-4 border-b border-line p-4 last:border-b-0"
              >
                <div className="font-mono text-[11px] text-muted-2 min-w-[24px]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                {thumb ? (
                  <div
                    className="relative shrink-0 overflow-hidden rounded-[2px] border"
                    style={{
                      width: 60,
                      height: 34,
                      borderColor: "rgba(25,35,26,0.08)",
                      background: "#EEE9DB",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="shrink-0 rounded-[2px]"
                    style={{
                      width: 60,
                      height: 34,
                      background: "#EEE9DB",
                    }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium tracking-[-0.005em] text-ink">
                    {s.kind[0].toUpperCase() + s.kind.slice(1)}
                  </div>
                  <div className="truncate text-[12px] tracking-[-0.005em] text-muted">
                    {previewFor(s)}
                  </div>
                </div>
                <div className="flex items-center gap-[2px]">
                  <button
                    type="button"
                    onClick={() => onMoveSlide(s.id, -1)}
                    disabled={isFirst || busy}
                    className="cursor-pointer rounded-[4px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Move up"
                  >
                    <Icon name="arrow-up" size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSlide(s.id, 1)}
                    disabled={isLast || busy}
                    className="cursor-pointer rounded-[4px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Move down"
                  >
                    <Icon name="arrow-down" size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSlide(s.id)}
                    disabled={busy}
                    className="cursor-pointer rounded-[4px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-[#8B3A2F] disabled:opacity-40"
                    aria-label="Delete"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={onAddSlide}
          className="flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-5"
        >
          <div className="text-label">Add a slide</div>
          <div className="flex flex-wrap gap-2">
            {(["photo", "portrait", "program", "quote"] as Kind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className="cursor-pointer rounded-[4px] border px-3 py-[6px] text-[12.5px] font-medium tracking-[-0.005em]"
                style={{
                  background: kind === k ? "#19231A" : "transparent",
                  color: kind === k ? "#F5F1E8" : "#0E1410",
                  borderColor: kind === k ? "#19231A" : "#E3DFD3",
                }}
              >
                {k}
              </button>
            ))}
          </div>
          {(kind === "photo" || kind === "portrait") && (
            <div className="flex flex-col gap-2">
              {img && (
                <div
                  className="relative overflow-hidden rounded-[4px] border border-line"
                  style={{ aspectRatio: "16/9", background: "#EEE9DB" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImg("")}
                    className="absolute right-2 top-2 rounded-[3px] px-2 py-[2px] text-[11px] font-medium tracking-[-0.005em] text-paper"
                    style={{ background: "rgba(14,20,16,0.6)" }}
                  >
                    Clear
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  icon="images"
                  onClick={() => setPickerOpen(true)}
                >
                  Pick from Media
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="…or paste an https image URL"
                    value={img}
                    onChange={(e) => setImg(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          {(kind === "portrait" || kind === "program") && (
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          )}
          {kind === "quote" && (
            <>
              <Input
                placeholder="Quote"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                placeholder="Attribution"
                value={by}
                onChange={(e) => setBy(e.target.value)}
              />
            </>
          )}
          {kind === "portrait" && (
            <Input
              placeholder="Body copy (optional)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          )}
          {kind === "photo" && (
            <Input
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          )}
          <div>
            <Button type="submit" variant="primary" icon="plus" disabled={busy}>
              Add slide
            </Button>
          </div>
        </form>
      </section>

      <aside className="flex flex-col gap-5">
        {submissionsPanel}
        <div className="rounded-[4px] border border-line bg-surface p-5">
          <div className="text-label mb-3">Publish to a display</div>
          {displays.length === 0 ? (
            <p className="text-[13px] tracking-[-0.005em] text-muted">
              Pair a display first from the Displays tab.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {displays.map((d) => (
                <Button
                  key={d.id}
                  variant="ghost"
                  icon="monitor"
                  onClick={() => onPublish(d.id)}
                  disabled={busy || slideshow.slides.length === 0}
                >
                  {d.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <SlideshowSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        slideshow={slideshow}
      />

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        workspaceId={workspaceId}
        onPick={(a) => {
          if (a.publicUrl) setImg(a.publicUrl);
        }}
        acceptMime="image/"
      />

      <ConfirmDialog
        open={deleteSlideId !== null}
        title="Delete this slide?"
        description="It drops from the slideshow right away."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={doDeleteSlide}
        onCancel={() => setDeleteSlideId(null)}
      />
    </div>
  );
}

function previewFor(s: { kind: string; data: Record<string, unknown> }) {
  const d = s.data;
  if (s.kind === "quote") return String(d.quote ?? "");
  if (s.kind === "portrait") return String(d.title ?? "");
  if (s.kind === "program") return String(d.title ?? "");
  if (s.kind === "photo") return String(d.caption ?? d.img ?? "");
  return "";
}
