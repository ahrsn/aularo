"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { Display, Slideshow, SlideshowStatus } from "@/lib/schema";
import { StatusPill } from "./status-pill";
import { PublishMenu } from "./publish-menu";
import type { SaveStatus } from "./types";

export function BuilderHeader({
  slideshow,
  saveStatus,
  slideCount,
  displays,
  submissionsCount,
  onRename,
  onStatusToggle,
  onOpenSettings,
  onToggleSubmissions,
  onPreviewFullscreen,
  onPublish,
  onUnpublish,
}: {
  slideshow: Slideshow;
  saveStatus: SaveStatus;
  slideCount: number;
  displays: Display[];
  submissionsCount: number;
  onRename: (name: string) => void;
  onStatusToggle: (next: SlideshowStatus) => void;
  onOpenSettings: () => void;
  onToggleSubmissions: () => void;
  onPreviewFullscreen: () => void;
  onPublish: (displayId: string) => void;
  onUnpublish: (displayId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(slideshow.name);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(slideshow.name);
  }, [slideshow.name]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commitRename() {
    const trimmed = draft.trim();
    setEditing(false);
    if (!trimmed || trimmed === slideshow.name) {
      setDraft(slideshow.name);
      return;
    }
    onRename(trimmed);
  }

  const isLive = slideshow.status === "live";

  return (
    <header
      className="flex items-center gap-4 border-b border-line bg-paper"
      style={{ padding: "12px 20px", minHeight: 60 }}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              else if (e.key === "Escape") {
                setDraft(slideshow.name);
                setEditing(false);
              }
            }}
            className="w-full bg-transparent text-[18px] font-semibold tracking-[-0.012em] text-ink focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-full cursor-text text-left text-[18px] font-semibold tracking-[-0.012em] text-ink"
          >
            {slideshow.name}
          </button>
        )}
        <div
          className="text-[11.5px] tracking-[-0.005em]"
          style={{ color: "rgba(25,35,26,0.55)" }}
        >
          {slideCount} {slideCount === 1 ? "slide" : "slides"}
        </div>
      </div>

      <div className="flex items-center gap-[4px]">
        <StatusPill status={saveStatus} />

        <button
          type="button"
          onClick={() => onStatusToggle(isLive ? "draft" : "live")}
          className="flex cursor-pointer items-center gap-[8px] rounded-[3px] border border-line px-[10px] py-[5px] text-[11.5px] font-medium tracking-[-0.005em] hover:bg-[rgba(25,35,26,0.04)]"
          style={{ background: "transparent" }}
          aria-label={isLive ? "Set to draft" : "Go live"}
        >
          <span
            aria-hidden
            className="inline-block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: isLive ? "#A9C2AD" : "rgba(25,35,26,0.25)",
            }}
          />
          <span style={{ color: "rgba(25,35,26,0.8)" }}>
            {isLive ? "Live" : "Draft"}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleSubmissions}
          aria-label="Audience submissions"
          className="relative cursor-pointer rounded-[3px] p-[7px] transition-colors hover:bg-[rgba(25,35,26,0.06)]"
        >
          <Icon name="bell" size={15} style={{ color: "rgba(25,35,26,0.7)" }} />
          {submissionsCount > 0 && (
            <span
              className="absolute -right-[2px] -top-[2px] flex h-[14px] min-w-[14px] items-center justify-center rounded-full px-[4px] font-mono text-[9.5px] font-medium"
              style={{ background: "#8B3A2F", color: "#F5F1E8" }}
            >
              {submissionsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onPreviewFullscreen}
          aria-label="Full-screen preview"
          className="cursor-pointer rounded-[3px] p-[7px] transition-colors hover:bg-[rgba(25,35,26,0.06)]"
        >
          <Icon name="play" size={14} style={{ color: "rgba(25,35,26,0.7)" }} />
        </button>

        <div className="mx-[2px] h-[18px] w-px bg-line" aria-hidden />

        <PublishMenu
          displays={displays}
          currentSlideshowId={slideshow.id}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
        />

        <Button
          variant="ghost"
          size="sm"
          icon="gear"
          onClick={onOpenSettings}
        >
          Settings
        </Button>
      </div>
    </header>
  );
}
