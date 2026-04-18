"use client";

import { Wordmark } from "@/components/ui/wordmark";

/**
 * Idle screen shown on a paired display when no slideshow is assigned
 * (or the assigned slideshow has zero playable slides).
 *
 * The per-kind slide renderers used to live here. They've moved to
 * src/components/slides/ as a family-based module shared between the
 * display runtime and the builder preview — use <SlideRenderer />.
 */
export function IdleScreen() {
  return (
    <div className="relative h-screen w-screen" style={{ background: "#EEE9DB" }}>
      <div className="absolute" style={{ top: 36, left: 40 }}>
        <Wordmark size={22} color="#0E1410" />
      </div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ padding: "0 8vw" }}
      >
        <div
          className="font-mono uppercase text-muted"
          style={{ fontSize: 13, letterSpacing: "0.14em", marginBottom: 28 }}
        >
          Paired · waiting for content
        </div>
        <div
          className="font-serif text-ink"
          style={{
            fontSize: 92,
            fontWeight: 500,
            letterSpacing: "-0.026em",
            lineHeight: 1.02,
            fontVariationSettings: "'opsz' 72",
            maxWidth: 1400,
            marginBottom: 24,
          }}
        >
          Nothing playing here right now.
        </div>
        <div
          className="font-serif italic"
          style={{
            fontSize: 26,
            letterSpacing: "-0.012em",
            color: "#3A433B",
            fontVariationSettings: "'opsz' 48",
            maxWidth: 900,
          }}
        >
          Your next slideshow will appear automatically the moment it&rsquo;s published.
        </div>
      </div>
    </div>
  );
}
