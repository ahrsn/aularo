"use client";

import type { SlideRendererProps, SlideshowEmbedSlideData } from "../types";
import { SLIDE_COLORS } from "../theme";

/**
 * CompositeSlide — renderers that aggregate other content.
 * v1 preset: slideshow-embed (placeholder until Phase 3 wires the real sub-player).
 */
export function CompositeSlide(props: SlideRendererProps) {
  switch (props.slide.kind) {
    case "slideshow-embed":
      return <SlideshowEmbedLayout {...props} />;
    default:
      return null;
  }
}

function SlideshowEmbedLayout({ slide, theme }: SlideRendererProps) {
  const d = slide.data as SlideshowEmbedSlideData;
  const dark = theme.mode === "dark";
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center text-center"
      style={{
        background: dark ? SLIDE_COLORS.darkBg : SLIDE_COLORS.lightBg,
        color: dark ? SLIDE_COLORS.darkInk : SLIDE_COLORS.lightInk,
        padding: "0 10vw",
      }}
    >
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 14,
          letterSpacing: "0.14em",
          opacity: 0.6,
          marginBottom: 36,
        }}
      >
        Embedded slideshow
      </div>
      <div
        className="font-serif"
        style={{
          fontSize: 96,
          fontWeight: 500,
          letterSpacing: "-0.028em",
          lineHeight: 1.0,
          fontVariationSettings: "'opsz' 72",
        }}
      >
        {d.slideshowId ? `→ ${d.slideshowId}` : "Pick a slideshow to embed"}
      </div>
      <div
        className="font-serif italic"
        style={{
          fontSize: 28,
          letterSpacing: "-0.012em",
          opacity: 0.55,
          marginTop: 36,
        }}
      >
        Sub-slideshow playback arrives in Phase 3.
      </div>
    </div>
  );
}
