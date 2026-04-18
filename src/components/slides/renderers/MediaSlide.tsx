"use client";

import type {
  SlideRendererProps,
  PhotoSlideData,
  VideoSlideData,
  GallerySlideData,
} from "../types";
import { SLIDE_COLORS } from "../theme";

/**
 * MediaSlide — photo, video, gallery.
 */
export function MediaSlide(props: SlideRendererProps) {
  switch (props.slide.kind) {
    case "photo":
      return <PhotoLayout {...props} />;
    case "video":
      return <VideoLayout {...props} />;
    case "gallery":
      return <GalleryLayout {...props} />;
    default:
      return null;
  }
}

function PhotoLayout({ slide, theme, showCaption = true }: SlideRendererProps) {
  const d = slide.data as PhotoSlideData;
  const dark = theme.mode === "dark";
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: dark ? "#0E1410" : SLIDE_COLORS.lightBg }}
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
              background: dark
                ? "rgba(14,20,16,0.35)"
                : "rgba(245,241,232,0.25)",
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ padding: "5vh 5vw" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
          style={{ color: dark ? SLIDE_COLORS.darkInk : SLIDE_COLORS.lightInk }}
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

function VideoLayout({ slide, mode, theme }: SlideRendererProps) {
  const d = slide.data as VideoSlideData;
  const dark = theme.mode === "dark";
  const autoplay = mode === "display";
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: dark ? "#0E1410" : SLIDE_COLORS.lightBg }}
    >
      {d.src ? (
        <video
          key={d.src}
          src={d.src}
          poster={d.poster}
          autoPlay={autoplay}
          muted={d.muted ?? true}
          loop={d.loop ?? true}
          playsInline
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : (
        <EmptyHint
          label="Video slide"
          hint="Add a video URL to preview"
          onDark={dark}
        />
      )}
    </div>
  );
}

function GalleryLayout({ slide, theme }: SlideRendererProps) {
  const d = slide.data as GallerySlideData;
  const items = d.items ?? [];
  const layout = d.layout ?? "grid-2";
  const dark = theme.mode === "dark";
  const cols = layout === "grid-2" ? 2 : layout === "grid-3" ? 3 : layout === "grid-4" ? 4 : 2;

  if (items.length === 0) {
    return (
      <div
        className="relative h-full w-full"
        style={{ background: dark ? "#0E1410" : SLIDE_COLORS.lightBg }}
      >
        <EmptyHint label="Gallery slide" hint="Add photos to preview" onDark={dark} />
      </div>
    );
  }

  return (
    <div
      className="relative grid h-full w-full gap-4"
      style={{
        padding: 48,
        background: dark ? "#0E1410" : SLIDE_COLORS.lightBg,
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          className="relative h-full w-full overflow-hidden rounded-[2px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={it.img}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function EmptyHint({
  label,
  hint,
  onDark,
}: {
  label: string;
  hint: string;
  onDark: boolean;
}) {
  const ink = onDark ? SLIDE_COLORS.darkInk : SLIDE_COLORS.lightInk;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-center">
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 13,
          letterSpacing: "0.14em",
          color: ink,
          opacity: 0.55,
          marginBottom: 18,
        }}
      >
        {label}
      </div>
      <div
        className="font-serif italic"
        style={{
          fontSize: 32,
          letterSpacing: "-0.012em",
          color: ink,
          opacity: 0.75,
          fontVariationSettings: "'opsz' 48",
        }}
      >
        {hint}
      </div>
    </div>
  );
}
