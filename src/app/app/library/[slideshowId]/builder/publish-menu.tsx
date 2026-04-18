"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Display } from "@/lib/schema";

export function PublishMenu({
  displays,
  currentSlideshowId,
  disabled,
  onPublish,
  onUnpublish,
}: {
  displays: Display[];
  currentSlideshowId: string;
  disabled?: boolean;
  onPublish: (displayId: string) => void;
  onUnpublish: (displayId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const currentlyPlaying = displays.filter(
    (d) => d.currentSlideshowId === currentSlideshowId,
  );

  const summary =
    currentlyPlaying.length === 0
      ? "Publish"
      : currentlyPlaying.length === 1
        ? `Live on ${currentlyPlaying[0].name}`
        : `Live on ${currentlyPlaying.length} displays`;

  return (
    <div ref={ref} className="relative">
      <Button
        variant={currentlyPlaying.length > 0 ? "ghost" : "primary"}
        size="sm"
        icon="monitor"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
      >
        {summary}
      </Button>
      {open && (
        <div
          className="absolute right-0 z-50 mt-[6px] overflow-hidden rounded-[4px] border border-line bg-paper shadow-[0_20px_40px_-20px_rgba(14,20,16,0.25)]"
          style={{ width: 300 }}
          role="menu"
        >
          <div
            className="border-b border-line"
            style={{ padding: "10px 14px" }}
          >
            <div className="text-label">Publish to a display</div>
          </div>
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {displays.length === 0 ? (
              <div
                className="text-[12.5px] tracking-[-0.005em]"
                style={{ padding: "14px 14px", color: "rgba(25,35,26,0.6)" }}
              >
                Pair a display first from the Displays tab.
              </div>
            ) : (
              displays.map((d) => {
                const isLive = d.currentSlideshowId === currentSlideshowId;
                const isOnline =
                  d.status === "online" ||
                  (d.lastHeartbeat ?? 0) > Date.now() - 60_000;
                return (
                  <div
                    key={d.id}
                    className="flex items-center gap-[10px] border-b border-line last:border-b-0"
                    style={{ padding: "10px 14px" }}
                  >
                    <span
                      aria-hidden
                      className="inline-block rounded-full"
                      style={{
                        width: 6,
                        height: 6,
                        background: isOnline ? "#A9C2AD" : "rgba(25,35,26,0.25)",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-[13px] font-medium tracking-[-0.005em]"
                        style={{ color: "#0E1410" }}
                      >
                        {d.name}
                      </div>
                      {d.room && (
                        <div
                          className="truncate text-[11px] tracking-[-0.005em]"
                          style={{ color: "rgba(25,35,26,0.55)" }}
                        >
                          {d.room}
                        </div>
                      )}
                    </div>
                    {isLive ? (
                      <button
                        type="button"
                        onClick={() => {
                          onUnpublish(d.id);
                          setOpen(false);
                        }}
                        className="cursor-pointer rounded-[3px] border border-line bg-paper px-[10px] py-[4px] text-[11.5px] font-medium tracking-[-0.005em] text-ink hover:bg-[rgba(25,35,26,0.06)]"
                      >
                        Stop
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onPublish(d.id);
                          setOpen(false);
                        }}
                        className="cursor-pointer rounded-[3px] px-[10px] py-[4px] text-[11.5px] font-medium tracking-[-0.005em]"
                        style={{ background: "#19231A", color: "#F5F1E8" }}
                      >
                        Publish
                      </button>
                    )}
                    {isLive && (
                      <Icon
                        name="broadcast"
                        size={12}
                        style={{ color: "#3B5A41" }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
