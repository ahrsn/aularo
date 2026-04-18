"use client";

import { Wordmark } from "@/components/ui/wordmark";

/**
 * Slide renderers — ported from design bundle src/show.jsx.
 * Supports four slide kinds: portrait, program, quote, photo.
 * Kept in one file so layout-related styles stay visible side-by-side.
 */

type AnyData = Record<string, unknown>;

type Slide = { id: string; kind: string; data: AnyData };

// ── Portrait (image background + large title) ────────────────────────────
export function PortraitSlide({ slide }: { slide: Slide }) {
  const d = slide.data as {
    img?: string;
    eyebrow?: string;
    title?: string;
    body?: string;
  };
  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: "#19231A" }}
    >
      {d.img && (
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
        style={{
          inset: 32,
          borderColor: "rgba(245,241,232,0.18)",
        }}
      />
      <div
        className="absolute left-[72px] max-w-[60%] text-paper"
        style={{ bottom: 92 }}
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

// ── Program (light BG, schedule list) ────────────────────────────────────
export function ProgramSlide({ slide }: { slide: Slide }) {
  const d = slide.data as {
    eyebrow?: string;
    title?: string;
    items?: Array<{ t: string; n: string; where: string }>;
  };
  return (
    <div
      className="relative flex h-screen w-screen flex-col bg-paper text-ink"
      style={{ padding: "88px 96px" }}
    >
      {d.eyebrow && (
        <div
          className="font-mono text-[13px] uppercase tracking-[0.08em] text-muted"
          style={{ marginBottom: 20 }}
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
              borderColor: "#D4CFC0",
            }}
          >
            <div
              className="font-mono text-ink"
              style={{ fontSize: 26, letterSpacing: "0.04em" }}
            >
              {it.t}
            </div>
            <div
              className="font-serif text-ink"
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
              className="text-right text-muted"
              style={{ fontSize: 20, letterSpacing: "-0.008em" }}
            >
              {it.where}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Quote (dark BG, italic pull-quote) ───────────────────────────────────
export function QuoteSlide({ slide }: { slide: Slide }) {
  const d = slide.data as { eyebrow?: string; quote?: string; by?: string };
  return (
    <div
      className="relative flex h-screen w-screen flex-col justify-center"
      style={{
        padding: "0 12vw",
        background: "#19231A",
        color: "#F5F1E8",
      }}
    >
      {d.eyebrow && (
        <div
          className="font-mono text-[13px] uppercase tracking-[0.08em]"
          style={{ color: "rgba(245,241,232,0.55)", marginBottom: 32 }}
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
            color: "rgba(245,241,232,0.65)",
            marginTop: 44,
          }}
        >
          — {d.by}
        </div>
      )}
    </div>
  );
}

// ── Photo (contain + blurred background fill) ────────────────────────────
export function PhotoSlide({
  slide,
  theme = "dark",
  showCaption = true,
}: {
  slide: Slide;
  theme?: "light" | "dark";
  showCaption?: boolean;
}) {
  const d = slide.data as { img?: string; caption?: string; credit?: string };
  const dark = theme === "dark";
  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: dark ? "#0E1410" : "#F5F1E8" }}
    >
      {d.img && (
        <>
          <div
            className="absolute"
            style={{
              inset: "-5%",
              backgroundImage: `url(${d.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: `blur(48px) saturate(1.1) brightness(${dark ? 0.55 : 0.95})`,
              transform: "scale(1.15)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: dark ? "rgba(14,20,16,0.35)" : "rgba(245,241,232,0.25)",
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ padding: "5vh 5vw" }}
          >
            <img
              src={d.img}
              alt=""
              className="rounded-[2px]"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                boxShadow:
                  "0 30px 80px -30px rgba(0,0,0,0.6), 0 8px 24px -8px rgba(0,0,0,0.35)",
              }}
            />
          </div>
        </>
      )}
      {showCaption && (d.caption || d.credit) && (
        <div
          className="absolute bottom-9 left-0 right-0 flex items-baseline justify-center gap-[14px]"
          style={{ color: dark ? "#F5F1E8" : "#0E1410" }}
        >
          {d.caption && (
            <div
              className="font-serif italic"
              style={{
                fontSize: 22,
                letterSpacing: "-0.012em",
                fontVariationSettings: "'opsz' 32",
                opacity: 0.92,
              }}
            >
              {d.caption}
            </div>
          )}
          {d.credit && (
            <div
              className="font-mono uppercase"
              style={{
                fontSize: 11,
                letterSpacing: "0.06em",
                opacity: 0.55,
              }}
            >
              {d.credit}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LiveSlide({
  slide,
  theme,
  showCaption,
}: {
  slide: Slide;
  theme?: "light" | "dark";
  showCaption?: boolean;
}) {
  switch (slide.kind) {
    case "portrait":
      return <PortraitSlide slide={slide} />;
    case "program":
      return <ProgramSlide slide={slide} />;
    case "quote":
      return <QuoteSlide slide={slide} />;
    case "photo":
    default:
      return <PhotoSlide slide={slide} theme={theme} showCaption={showCaption} />;
  }
}

// ── Idle + Pair + Pairing screens (composed with Wordmark) ───────────────
export function IdleScreen() {
  return (
    <div className="relative h-screen w-screen" style={{ background: "#EEE9DB" }}>
      <div className="absolute" style={{ top: 36, left: 40 }}>
        <Wordmark size={22} color="#0E1410" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: "0 8vw" }}>
        <div className="font-mono uppercase text-muted" style={{ fontSize: 13, letterSpacing: "0.14em", marginBottom: 28 }}>
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
