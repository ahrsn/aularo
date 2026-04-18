import type { ResolvedSlideTheme, SlideThemeOverride } from "./types";

const DEFAULT_ACCENT = "#3B5A41";

export function resolveTheme(
  slideshowTheme: "dark" | "light" | undefined,
  slideshowAccent: string | undefined,
  override: SlideThemeOverride | undefined,
): ResolvedSlideTheme {
  return {
    mode: override?.mode ?? slideshowTheme ?? "dark",
    accent: override?.accent ?? slideshowAccent ?? DEFAULT_ACCENT,
  };
}

export const SLIDE_COLORS = {
  darkBg: "#19231A",
  darkInk: "#F5F1E8",
  lightBg: "#F5F1E8",
  lightInk: "#0E1410",
  mutedOnDark: "rgba(245,241,232,0.55)",
  mutedOnLight: "rgba(14,20,16,0.55)",
  ruleOnLight: "#D4CFC0",
  ruleOnDark: "rgba(245,241,232,0.18)",
} as const;

export function onDarkForKind(
  kind: string,
  theme: ResolvedSlideTheme,
): boolean {
  if (kind === "portrait" || kind === "quote" || kind === "announcement") return true;
  if (kind === "program") return false;
  // Photo/video/gallery/data honour theme.mode.
  return theme.mode === "dark";
}
