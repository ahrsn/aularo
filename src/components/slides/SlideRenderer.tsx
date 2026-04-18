"use client";

import { SLIDE_KIND_FAMILY, type SlideKind } from "@/lib/schema";
import type { SlideRendererProps } from "./types";
import { TextSlide } from "./renderers/TextSlide";
import { MediaSlide } from "./renderers/MediaSlide";
import { DataSlide } from "./renderers/DataSlide";
import { CompositeSlide } from "./renderers/CompositeSlide";

/**
 * SlideRenderer — the single entry point for rendering a slide, shared
 * between /screen/[displayId] playback and the builder preview canvas.
 *
 * Dispatches to one of four family renderers by kind. Unknown kinds
 * render a minimal "unsupported" placeholder so a stale Firestore doc
 * can never crash the display runtime.
 */
export function SlideRenderer(props: SlideRendererProps) {
  const family = SLIDE_KIND_FAMILY[props.slide.kind as SlideKind];

  switch (family) {
    case "text":
      return <TextSlide {...props} />;
    case "media":
      return <MediaSlide {...props} />;
    case "data":
      return <DataSlide {...props} />;
    case "composite":
      return <CompositeSlide {...props} />;
    default:
      return <UnsupportedSlide kind={props.slide.kind} />;
  }
}

function UnsupportedSlide({ kind }: { kind: string }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center text-center"
      style={{ background: "#19231A", color: "#F5F1E8" }}
    >
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 13,
          letterSpacing: "0.14em",
          opacity: 0.55,
          marginBottom: 20,
        }}
      >
        Unsupported slide kind
      </div>
      <div
        className="font-serif italic"
        style={{
          fontSize: 48,
          letterSpacing: "-0.012em",
          opacity: 0.75,
        }}
      >
        “{kind}”
      </div>
    </div>
  );
}
