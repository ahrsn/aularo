"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Wordmark } from "@/components/ui/wordmark";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { onDarkForKind, resolveTheme } from "@/components/slides/theme";
import type { Slide, SlideThemeOverride } from "@/lib/schema";

type Settings = {
  duration?: number;
  shuffle?: boolean;
  theme?: "dark" | "light";
  captions?: boolean;
  accent?: string;
};

type IncomingSlide = {
  id: string;
  kind: string;
  data: Record<string, unknown>;
  durationMs?: number;
  hidden?: boolean;
  themeOverride?: SlideThemeOverride;
};

export function LiveScreen({
  slides,
  settings,
  label,
  showWatermark,
}: {
  slides: IncomingSlide[];
  settings: Settings;
  label?: string;
  showWatermark?: boolean;
}) {
  const defaultDuration = settings.duration ?? 6500;
  const theme = settings.theme ?? "dark";
  const accent = settings.accent;
  const showCaption = settings.captions ?? true;

  // Hide any slides flagged as hidden; fall back to zero playable slides → idle.
  const playable = useMemo(
    () => slides.filter((s) => !s.hidden),
    [slides],
  );

  const orderRef = useRef<number[]>(playable.map((_, i) => i));
  const [idx, setIdx] = useState(0);
  const [showChrome, setShowChrome] = useState(true);

  useEffect(() => {
    if (settings.shuffle) {
      const arr = playable.map((_, i) => i);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      orderRef.current = arr;
    } else {
      orderRef.current = playable.map((_, i) => i);
    }
    setIdx(0);
  }, [settings.shuffle, playable]);

  const currentSlide = playable[orderRef.current[idx] ?? 0];
  const currentDuration = currentSlide?.durationMs ?? defaultDuration;

  useEffect(() => {
    if (playable.length === 0) return;
    const t = setTimeout(
      () => setIdx((i) => (i + 1) % playable.length),
      currentDuration,
    );
    return () => clearTimeout(t);
  }, [currentDuration, playable.length, idx]);

  useEffect(() => {
    let to: ReturnType<typeof setTimeout>;
    const bump = () => {
      setShowChrome(true);
      clearTimeout(to);
      to = setTimeout(() => setShowChrome(false), 2800);
    };
    bump();
    window.addEventListener("mousemove", bump);
    return () => {
      window.removeEventListener("mousemove", bump);
      clearTimeout(to);
    };
  }, []);

  if (playable.length === 0 || !currentSlide) return null;

  const resolvedTheme = resolveTheme(theme, accent, currentSlide.themeOverride);
  const onDark = onDarkForKind(currentSlide.kind, resolvedTheme);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <SlideRenderer
        slide={currentSlide as Slide}
        mode="display"
        theme={resolvedTheme}
        showCaption={showCaption}
      />

      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[420ms]"
        style={{ opacity: showChrome ? 1 : 0 }}
      >
        <div
          className="absolute flex items-center gap-3"
          style={{ top: 32, left: 40, color: onDark ? "#F5F1E8" : "#0E1410" }}
        >
          <Wordmark size={18} color={onDark ? "#F5F1E8" : "#0E1410"} />
          {label && (
            <>
              <div
                className="mx-1 h-[14px] w-px"
                style={{
                  background: onDark
                    ? "rgba(245,241,232,0.3)"
                    : "rgba(14,20,16,0.2)",
                }}
              />
              <div
                className="font-mono uppercase"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  opacity: 0.7,
                }}
              >
                {label}
              </div>
            </>
          )}
        </div>

        <div
          className="absolute flex items-center gap-[10px] text-[12.5px] tracking-[-0.005em]"
          style={{ top: 32, right: 40, color: onDark ? "#F5F1E8" : "#0E1410" }}
        >
          <span
            className="inline-block rounded-full"
            style={{ width: 6, height: 6, background: "#A9C2AD" }}
          />
          <span className="opacity-75">Live</span>
        </div>

        {showWatermark && (
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: 32,
              left: 40,
              fontSize: 10.5,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.55,
              color: onDark ? "#F5F1E8" : "#0E1410",
              fontFamily: "var(--font-geist), sans-serif",
            }}
          >
            Made with Clarra
          </div>
        )}

        <div
          className="absolute flex items-center gap-[14px]"
          style={{ bottom: 32, right: 40, color: onDark ? "#F5F1E8" : "#0E1410" }}
        >
          <div
            className="font-mono"
            style={{ fontSize: 12, letterSpacing: "0.06em", opacity: 0.7 }}
          >
            {idx + 1} / {playable.length}
          </div>
          <div className="flex gap-1">
            {playable.map((_, i) => (
              <div
                key={i}
                className="rounded-[2px] transition-[width] duration-[320ms]"
                style={{
                  width: i === idx ? 28 : 10,
                  height: 3,
                  background:
                    i === idx
                      ? onDark
                        ? "#F5F1E8"
                        : "#0E1410"
                      : onDark
                        ? "rgba(245,241,232,0.3)"
                        : "rgba(14,20,16,0.2)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
