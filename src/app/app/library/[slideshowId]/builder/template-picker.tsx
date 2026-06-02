"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { FitBox } from "@/components/slides/fit";
import { resolveTheme } from "@/components/slides/theme";
import type { Slide, SlideKind } from "@/lib/schema";
import { useMountTransition } from "@/components/ui/motion";
import { Icon } from "@/components/ui/icon";
import { SITE_NAME } from "@/lib/site";

type Template = {
  kind: SlideKind;
  label: string;
  description: string;
  fixture: Slide;
  family: "content" | "media" | "data" | "advanced";
};

const TEMPLATES: Template[] = [
  {
    kind: "photo",
    label: "Photo",
    family: "media",
    description: "One photo with optional caption.",
    fixture: {
      id: "t-photo",
      kind: "photo",
      data: {
        img: "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1600",
        caption: "Studio Visit · April",
      },
    },
  },
  {
    kind: "portrait",
    label: "Portrait",
    family: "content",
    description: "Full-bleed hero with title and body.",
    fixture: {
      id: "t-portrait",
      kind: "portrait",
      data: {
        img: "https://images.unsplash.com/photo-1511497584788-876760111969?w=1600",
        eyebrow: "WELCOME",
        title: "Client visit week",
        body: "Say hi at reception.",
      },
    },
  },
  {
    kind: "program",
    label: "Program",
    family: "data",
    description: "Time-blocked schedule on a light card.",
    fixture: {
      id: "t-program",
      kind: "program",
      data: {
        eyebrow: "TODAY",
        title: "Run of show",
        items: [
          { t: "7:30", n: "Doors open", where: "Lobby" },
          { t: "8:00", n: "Opening remarks", where: "Main stage" },
          { t: "9:15", n: "Panel", where: "Studio B" },
        ],
      },
    },
  },
  {
    kind: "quote",
    label: "Quote",
    family: "content",
    description: "Large pull quote on a dark background.",
    fixture: {
      id: "t-quote",
      kind: "quote",
      data: {
        eyebrow: "BAUHAUS",
        quote: "Form follows function — that has been misunderstood. Form and function should be one.",
        by: "Frank Lloyd Wright",
      },
    },
  },
  {
    kind: "announcement",
    label: "Announcement",
    family: "content",
    description: "Giant headline for PSAs and hype moments.",
    fixture: {
      id: "t-ann",
      kind: "announcement",
      data: {
        headline: "Doors open at 7:30",
        subtitle: "Grab a badge at reception.",
        size: "xl",
      },
    },
  },
  {
    kind: "markdown",
    label: "Markdown",
    family: "content",
    description: "Long-form updates, release notes, memos.",
    fixture: {
      id: "t-md",
      kind: "markdown",
      data: { body: "# This week\n\n- Ship the redesign\n- Walk through galleries\n- Say hi to new hires" },
    },
  },
  {
    kind: "video",
    label: "Video",
    family: "media",
    description: "MP4 or WebM, looped and muted.",
    fixture: { id: "t-video", kind: "video", data: {} },
  },
  {
    kind: "gallery",
    label: "Gallery",
    family: "media",
    description: "Multi-photo grid, 2–4 up or featured.",
    fixture: {
      id: "t-gallery",
      kind: "gallery",
      data: {
        layout: "grid-2",
        items: [
          { img: "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800" },
          { img: "https://images.unsplash.com/photo-1511497584788-876760111969?w=800" },
        ],
      },
    },
  },
  {
    kind: "countdown",
    label: "Countdown",
    family: "data",
    description: "Days (or full clock) to a date.",
    fixture: {
      id: "t-countdown",
      kind: "countdown",
      data: {
        title: "Doors open in",
        targetAt: Date.now() + 3 * 86_400_000,
        style: "days",
      },
    },
  },
  {
    kind: "weather",
    label: "Weather",
    family: "data",
    description: "Current conditions for a city.",
    fixture: {
      id: "t-weather",
      kind: "weather",
      data: { city: "Austin, TX", units: "f" },
    },
  },
  {
    kind: "clock",
    label: "Clock",
    family: "data",
    description: "Live wall clock, 12 or 24 hour.",
    fixture: {
      id: "t-clock",
      kind: "clock",
      data: { format: "12h", showDate: true, showSeconds: false },
    },
  },
  {
    kind: "event-card",
    label: "Event card",
    family: "data",
    description: `Auto-fills from a ${SITE_NAME} event.`,
    fixture: {
      id: "t-event",
      kind: "event-card",
      data: {},
    },
  },
  {
    kind: "slideshow-embed",
    label: "Slideshow",
    family: "advanced",
    description: "Embed another slideshow as a segment.",
    fixture: {
      id: "t-embed",
      kind: "slideshow-embed",
      data: {},
    },
  },
];

const FAMILY_LABEL: Record<Template["family"], string> = {
  content: "Content",
  media: "Media",
  data: "Data & time",
  advanced: "Advanced",
};

export function TemplatePicker({
  open,
  onClose,
  onPick,
  slideshowTheme,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (kind: SlideKind) => void;
  slideshowTheme: "dark" | "light";
}) {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { mounted, state } = useMountTransition(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (searchMode) {
          setSearchMode(false);
          setQuery("");
        } else {
          onClose();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchMode((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, searchMode]);

  useEffect(() => {
    if (searchMode) searchRef.current?.focus();
  }, [searchMode]);

  const filtered = useMemo(() => {
    if (!query.trim()) return TEMPLATES;
    const q = query.trim().toLowerCase();
    return TEMPLATES.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.kind.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const out: Record<Template["family"], Template[]> = {
      content: [],
      media: [],
      data: [],
      advanced: [],
    };
    for (const t of filtered) out[t.family].push(t);
    return out;
  }, [filtered]);

  if (!mounted) return null;
  const theme = resolveTheme(slideshowTheme, undefined, undefined);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center transition-opacity duration-[280ms]"
      style={{
        background: "rgba(14,20,16,0.45)",
        backdropFilter: "blur(4px)",
        opacity: state === "open" ? 1 : 0,
        padding: "56px 32px",
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Add a slide"
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-[1100px] flex-col overflow-hidden rounded-[6px] bg-paper shadow-[0_60px_120px_-30px_rgba(14,20,16,0.5)]"
        style={{
          maxHeight: "calc(100vh - 112px)",
          transform: state === "open" ? "translateY(0)" : "translateY(8px)",
          opacity: state === "open" ? 1 : 0,
          transition: "transform 240ms var(--ease-settle), opacity 200ms ease-out",
        }}
      >
        <div
          className="flex items-center justify-between gap-4 border-b border-line"
          style={{ padding: "16px 22px" }}
        >
          <div>
            <div className="text-label">New slide</div>
            <div
              className="mt-[2px] text-[12.5px] tracking-[-0.005em]"
              style={{ color: "rgba(25,35,26,0.6)" }}
            >
              Pick a template to add to this slideshow.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchMode((v) => !v)}
              className="flex cursor-pointer items-center gap-[6px] rounded-[3px] border border-line px-[10px] py-[5px] text-[12px] tracking-[-0.005em] hover:bg-[rgba(25,35,26,0.04)]"
              style={{ color: "rgba(25,35,26,0.75)" }}
            >
              <Icon name="magnifying-glass" size={12} />
              Search
              <span
                className="ml-[4px] font-mono text-[10px]"
                style={{ color: "rgba(25,35,26,0.45)" }}
              >
                ⌘K
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer rounded-[3px] p-[6px] text-muted transition-colors hover:bg-[rgba(25,35,26,0.08)]"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        </div>

        {searchMode && (
          <div
            className="border-b border-line"
            style={{ padding: "10px 22px" }}
          >
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search slide types…"
              className="w-full bg-transparent text-[16px] tracking-[-0.012em] text-ink focus:outline-none"
            />
          </div>
        )}

        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: "20px 22px 28px" }}
        >
          {filtered.length === 0 ? (
            <div
              className="flex h-[300px] items-center justify-center text-[13px] tracking-[-0.005em]"
              style={{ color: "rgba(25,35,26,0.55)" }}
            >
              No matches for “{query}”.
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {(Object.keys(grouped) as Template["family"][]).map((family) => {
                const list = grouped[family];
                if (list.length === 0) return null;
                return (
                  <section key={family}>
                    <div
                      className="mb-[10px] font-mono uppercase text-[10.5px] tracking-[0.12em]"
                      style={{ color: "rgba(25,35,26,0.5)" }}
                    >
                      {FAMILY_LABEL[family]}
                    </div>
                    <div
                      className="grid gap-[14px]"
                      style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
                    >
                      {list.map((t) => (
                        <button
                          key={t.kind}
                          type="button"
                          onClick={() => onPick(t.kind)}
                          className="group flex cursor-pointer flex-col overflow-hidden rounded-[4px] border text-left transition-all"
                          style={{
                            borderColor: "rgba(25,35,26,0.12)",
                            background: "#FBF8F0",
                          }}
                        >
                          <div
                            className="relative overflow-hidden"
                            style={{
                              aspectRatio: "16/9",
                              borderBottom: "1px solid rgba(25,35,26,0.08)",
                            }}
                          >
                            <FitBox>
                              <SlideRenderer
                                slide={t.fixture}
                                mode="preview"
                                theme={theme}
                                showCaption
                              />
                            </FitBox>
                          </div>
                          <div style={{ padding: "10px 12px" }}>
                            <div
                              className="text-[13px] font-medium tracking-[-0.005em]"
                              style={{ color: "#0E1410" }}
                            >
                              {t.label}
                            </div>
                            <div
                              className="mt-[2px] text-[11.5px] leading-[1.45] tracking-[-0.005em]"
                              style={{ color: "rgba(25,35,26,0.6)" }}
                            >
                              {t.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
