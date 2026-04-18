"use client";

import { useMemo } from "react";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { FitBox } from "@/components/slides/fit";
import { resolveTheme } from "@/components/slides/theme";
import type { EventDoc, Slide, Slideshow } from "@/lib/schema";

export function PreviewCanvas({
  slide,
  slideshow,
  events,
}: {
  slide: Slide | null;
  slideshow: Slideshow;
  events: EventDoc[];
}) {
  const eventSnapshot = useMemo(() => {
    if (!slide || slide.kind !== "event-card") return null;
    const eventId = (slide.data as { eventId?: string })?.eventId;
    if (!eventId) return null;
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return null;
    return {
      id: ev.id,
      name: ev.name,
      startAt: ev.startAt,
      colorTag: ev.colorTag,
    };
  }, [slide, events]);

  if (!slide) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div
            className="font-mono uppercase"
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              color: "rgba(25,35,26,0.45)",
              marginBottom: 10,
            }}
          >
            No slide selected
          </div>
          <div
            className="font-serif italic"
            style={{
              fontSize: 22,
              letterSpacing: "-0.012em",
              color: "rgba(25,35,26,0.6)",
            }}
          >
            Pick a slide from the filmstrip, or add a new one.
          </div>
        </div>
      </div>
    );
  }

  const theme = resolveTheme(slideshow.theme, undefined, slide.themeOverride);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{ padding: "32px 40px" }}
    >
      <div
        className="relative w-full overflow-hidden rounded-[4px]"
        style={{
          maxWidth: 1280,
          boxShadow:
            "0 30px 80px -30px rgba(14,20,16,0.25), 0 6px 18px -8px rgba(14,20,16,0.15)",
          border: "1px solid rgba(25,35,26,0.08)",
        }}
      >
        <FitBox>
          <SlideRenderer
            slide={slide}
            mode="preview"
            theme={theme}
            showCaption={slideshow.captions ?? true}
            eventSnapshot={eventSnapshot}
          />
        </FitBox>
      </div>
    </div>
  );
}
