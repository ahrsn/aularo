"use client";

import type {
  SlideRendererProps,
  PortraitSlideData,
  ProgramSlideData,
  QuoteSlideData,
  AnnouncementSlideData,
  MarkdownSlideData,
} from "../types";
import { SLIDE_COLORS } from "../theme";

/**
 * TextSlide — the text-led renderer family.
 * Presets: portrait, program, quote, announcement, markdown.
 */
export function TextSlide(props: SlideRendererProps) {
  switch (props.slide.kind) {
    case "portrait":
      return <PortraitLayout {...props} />;
    case "program":
      return <ProgramLayout {...props} />;
    case "quote":
      return <QuoteLayout {...props} />;
    case "announcement":
      return <AnnouncementLayout {...props} />;
    case "markdown":
      return <MarkdownLayout {...props} />;
    default:
      return null;
  }
}

function PortraitLayout({ slide }: SlideRendererProps) {
  const d = slide.data as PortraitSlideData;
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: SLIDE_COLORS.darkBg }}
    >
      {d.img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={d.img}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "saturate(0.82) contrast(1.02)" }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,20,16,0) 35%, rgba(14,20,16,0.85) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute rounded-[2px] border"
        style={{ inset: 32, borderColor: SLIDE_COLORS.ruleOnDark }}
      />
      <div
        className="absolute left-[72px] max-w-[60%]"
        style={{ bottom: 92, color: SLIDE_COLORS.darkInk }}
      >
        {d.eyebrow && (
          <div
            className="font-mono text-[13px] uppercase tracking-[0.08em] opacity-70"
            style={{ marginBottom: 22 }}
          >
            {d.eyebrow}
          </div>
        )}
        {d.title && (
          <div
            className="font-serif"
            style={{
              fontSize: 96,
              lineHeight: 1.0,
              letterSpacing: "-0.026em",
              fontWeight: 500,
              fontVariationSettings: "'opsz' 72",
              marginBottom: 20,
            }}
          >
            {d.title}
          </div>
        )}
        {d.body && (
          <div
            className="font-serif italic"
            style={{
              fontSize: 24,
              lineHeight: 1.35,
              letterSpacing: "-0.012em",
              opacity: 0.88,
              fontVariationSettings: "'opsz' 32",
              maxWidth: 720,
            }}
          >
            {d.body}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramLayout({ slide }: SlideRendererProps) {
  const d = slide.data as ProgramSlideData;
  return (
    <div
      className="relative flex h-full w-full flex-col"
      style={{
        padding: "88px 96px",
        background: SLIDE_COLORS.lightBg,
        color: SLIDE_COLORS.lightInk,
      }}
    >
      {d.eyebrow && (
        <div
          className="font-mono text-[13px] uppercase tracking-[0.08em]"
          style={{ color: SLIDE_COLORS.mutedOnLight, marginBottom: 20 }}
        >
          {d.eyebrow}
        </div>
      )}
      {d.title && (
        <div
          className="font-serif"
          style={{
            fontSize: 88,
            fontWeight: 500,
            letterSpacing: "-0.026em",
            lineHeight: 1.0,
            fontVariationSettings: "'opsz' 72",
            marginBottom: 56,
            maxWidth: 1200,
          }}
        >
          {d.title}
        </div>
      )}
      <div className="flex flex-col">
        {(d.items ?? []).map((it, i) => (
          <div
            key={i}
            className="grid items-baseline border-t"
            style={{
              gridTemplateColumns: "160px 1fr 360px",
              gap: 40,
              padding: "22px 0",
              borderColor: SLIDE_COLORS.ruleOnLight,
            }}
          >
            <div
              className="font-mono"
              style={{ fontSize: 26, letterSpacing: "0.04em" }}
            >
              {it.t}
            </div>
            <div
              className="font-serif"
              style={{
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                fontVariationSettings: "'opsz' 48",
              }}
            >
              {it.n}
            </div>
            <div
              className="text-right"
              style={{
                fontSize: 20,
                letterSpacing: "-0.008em",
                color: SLIDE_COLORS.mutedOnLight,
              }}
            >
              {it.where}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuoteLayout({ slide }: SlideRendererProps) {
  const d = slide.data as QuoteSlideData;
  return (
    <div
      className="relative flex h-full w-full flex-col justify-center"
      style={{
        padding: "0 12vw",
        background: SLIDE_COLORS.darkBg,
        color: SLIDE_COLORS.darkInk,
      }}
    >
      {d.eyebrow && (
        <div
          className="font-mono text-[13px] uppercase tracking-[0.08em]"
          style={{ color: SLIDE_COLORS.mutedOnDark, marginBottom: 32 }}
        >
          {d.eyebrow}
        </div>
      )}
      {d.quote && (
        <div
          className="font-serif italic"
          style={{
            fontSize: 84,
            fontWeight: 400,
            letterSpacing: "-0.022em",
            lineHeight: 1.12,
            fontVariationSettings: "'opsz' 72",
            maxWidth: 1400,
          }}
        >
          “{d.quote}”
        </div>
      )}
      {d.by && (
        <div
          style={{
            fontSize: 20,
            letterSpacing: "-0.008em",
            color: SLIDE_COLORS.mutedOnDark,
            marginTop: 44,
          }}
        >
          — {d.by}
        </div>
      )}
    </div>
  );
}

function AnnouncementLayout({ slide }: SlideRendererProps) {
  const d = slide.data as AnnouncementSlideData;
  const size = d.size ?? "xl";
  const headlineSize = size === "xxl" ? 180 : size === "xl" ? 140 : 104;
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center text-center"
      style={{
        padding: "0 10vw",
        background: SLIDE_COLORS.darkBg,
        color: SLIDE_COLORS.darkInk,
      }}
    >
      {d.headline && (
        <div
          className="font-serif"
          style={{
            fontSize: headlineSize,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 0.98,
            fontVariationSettings: "'opsz' 72",
            maxWidth: 1600,
          }}
        >
          {d.headline}
        </div>
      )}
      {d.subtitle && (
        <div
          className="font-serif italic"
          style={{
            fontSize: 32,
            letterSpacing: "-0.012em",
            color: SLIDE_COLORS.mutedOnDark,
            fontVariationSettings: "'opsz' 48",
            marginTop: 40,
            maxWidth: 1100,
          }}
        >
          {d.subtitle}
        </div>
      )}
    </div>
  );
}

function MarkdownLayout({ slide }: SlideRendererProps) {
  const d = slide.data as MarkdownSlideData;
  // v1 placeholder: render as a monospace block. Real markdown parsing
  // lands in Phase 3 with react-markdown.
  return (
    <div
      className="relative flex h-full w-full flex-col"
      style={{
        padding: "96px 112px",
        background: SLIDE_COLORS.lightBg,
        color: SLIDE_COLORS.lightInk,
      }}
    >
      <pre
        className="whitespace-pre-wrap font-serif"
        style={{
          fontSize: 36,
          lineHeight: 1.35,
          letterSpacing: "-0.012em",
          fontVariationSettings: "'opsz' 48",
        }}
      >
        {d.body ?? "# Markdown slide\n\nComing soon."}
      </pre>
    </div>
  );
}
