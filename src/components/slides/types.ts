import type { Slide, SlideThemeOverride } from "@/lib/schema";

/**
 * Per-kind data shapes. These are TS-only hints for editor/inspector
 * components; runtime validation stays in schema.ts as a free-form record
 * to keep existing Firestore docs readable without a migration.
 */

export type PortraitSlideData = {
  img?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
};

export type ProgramSlideData = {
  eyebrow?: string;
  title?: string;
  items?: Array<{ t: string; n: string; where: string }>;
};

export type QuoteSlideData = {
  eyebrow?: string;
  quote?: string;
  by?: string;
};

export type PhotoSlideData = {
  img?: string;
  caption?: string;
  credit?: string;
};

export type VideoSlideData = {
  src?: string;
  poster?: string;
  muted?: boolean;
  loop?: boolean;
};

export type GalleryItem = { img: string; caption?: string };
export type GallerySlideData = {
  items?: GalleryItem[];
  layout?: "grid-2" | "grid-3" | "grid-4" | "feature";
};

export type AnnouncementSlideData = {
  headline?: string;
  subtitle?: string;
  size?: "lg" | "xl" | "xxl";
};

export type MarkdownSlideData = {
  body?: string;
  accent?: string;
};

export type CountdownSlideData = {
  title?: string;
  targetAt?: number;
  timezone?: string;
  style?: "days" | "full";
};

export type WeatherSlideData = {
  city?: string;
  units?: "c" | "f";
};

export type ClockSlideData = {
  format?: "12h" | "24h";
  showSeconds?: boolean;
  showDate?: boolean;
  timezone?: string;
};

export type EventCardSlideData = {
  eventId?: string;
};

export type SlideshowEmbedSlideData = {
  slideshowId?: string;
  segmentStart?: number;
  segmentEnd?: number;
};

/**
 * Runtime mode for slide renderers.
 * - "display": full playback context (autoplay video, live data fetches, ticking clock)
 * - "preview": static preview suitable for the builder canvas (no autoplay, no network)
 */
export type SlideRenderMode = "display" | "preview";

export type ResolvedSlideTheme = {
  mode: "dark" | "light";
  accent: string;
};

export type SlideRendererProps = {
  slide: Slide;
  mode: SlideRenderMode;
  theme: ResolvedSlideTheme;
  /** Show captions / credits overlay. Defaults to true. */
  showCaption?: boolean;
  /** Override to pass event data for event-card slides without fetching. */
  eventSnapshot?: {
    id: string;
    name: string;
    startAt?: number | null;
    colorTag?: string | null;
  } | null;
};

export type { SlideThemeOverride };
