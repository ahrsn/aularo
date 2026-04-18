"use client";

import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/ui/wordmark";
import { LiveSlide } from "./slides";

type Slide = { id: string; kind: string; data: Record<string, unknown> };

type Settings = {
  duration?: number;
  shuffle?: boolean;
  theme?: "dark" | "light";
  captions?: boolean;
};

export function LiveScreen({
  slides,
  settings,
  label,
  showWatermark,
}: {
  slides: Slide[];
  settings: Settings;
  label?: string;
  showWatermark?: boolean;
}) {
  const duration = settings.duration ?? 6500;
  const theme = settings.theme ?? "dark";
  const showCaption = settings.captions ?? true;

  const orderRef = useRef<number[]>(slides.map((_, i) => i));
  const [idx, setIdx] = useState(0);
  const [showChrome, setShowChrome] = useState(true);

  useEffect(() => {
    if (settings.shuffle) {
      const arr = slides.map((_, i) => i);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      orderRef.current = arr;
    } else {
      orderRef.current = slides.map((_, i) => i);
    }
    setIdx(0);
  }, [settings.shuffle, slides]);

  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), duration);
    return () => clearInterval(t);
  }, [duration, slides.length]);

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

  if (slides.length === 0) return null;
  const slide = slides[orderRef.current[idx] ?? 0];
  const onDark =
    slide.kind === "portrait" ||
    slide.kind === "quote" ||
    (slide.kind === "photo" && theme === "dark");

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <LiveSlide slide={slide} theme={theme} showCaption={showCaption} />

      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[420ms]"
        style={{ opacity: showChrome ? 1 : 0 }}
      >
        {/* Top-left: wordmark + room */}
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

        {/* Top-right: status */}
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

        {/* Bottom-left: watermark */}
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

        {/* Bottom-right: slide progress */}
        <div
          className="absolute flex items-center gap-[14px]"
          style={{ bottom: 32, right: 40, color: onDark ? "#F5F1E8" : "#0E1410" }}
        >
          <div
            className="font-mono"
            style={{ fontSize: 12, letterSpacing: "0.06em", opacity: 0.7 }}
          >
            {idx + 1} / {slides.length}
          </div>
          <div className="flex gap-1">
            {slides.map((_, i) => (
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
