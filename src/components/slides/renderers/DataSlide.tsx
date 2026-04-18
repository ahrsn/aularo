"use client";

import { useEffect, useState } from "react";
import type {
  SlideRendererProps,
  CountdownSlideData,
  ClockSlideData,
  WeatherSlideData,
  EventCardSlideData,
} from "../types";
import { SLIDE_COLORS } from "../theme";

/**
 * DataSlide — time/data-driven renderers.
 * In "preview" mode these render with deterministic fixtures.
 * In "display" mode clock + countdown tick live; weather/event use cached data.
 */
export function DataSlide(props: SlideRendererProps) {
  switch (props.slide.kind) {
    case "countdown":
      return <CountdownLayout {...props} />;
    case "clock":
      return <ClockLayout {...props} />;
    case "weather":
      return <WeatherLayout {...props} />;
    case "event-card":
      return <EventCardLayout {...props} />;
    default:
      return null;
  }
}

function useNow(active: boolean, intervalMs: number) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [active, intervalMs]);
  return now;
}

function CountdownLayout({ slide, mode, theme }: SlideRendererProps) {
  const d = slide.data as CountdownSlideData;
  const dark = theme.mode === "dark";
  const now = useNow(mode === "display", 1000);
  const target = d.targetAt ?? now + 3 * 86_400_000;
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  const style = d.style ?? "days";

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center text-center"
      style={{
        background: dark ? SLIDE_COLORS.darkBg : SLIDE_COLORS.lightBg,
        color: dark ? SLIDE_COLORS.darkInk : SLIDE_COLORS.lightInk,
        padding: "0 10vw",
      }}
    >
      {d.title && (
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 16,
            letterSpacing: "0.14em",
            opacity: 0.65,
            marginBottom: 40,
          }}
        >
          {d.title}
        </div>
      )}
      <div
        className="font-serif"
        style={{
          fontSize: 220,
          fontWeight: 500,
          letterSpacing: "-0.03em",
          lineHeight: 0.98,
          fontVariationSettings: "'opsz' 72",
        }}
      >
        {style === "days"
          ? `${days}`
          : `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
      </div>
      {style === "days" && (
        <div
          className="font-serif italic"
          style={{
            fontSize: 28,
            letterSpacing: "-0.012em",
            opacity: 0.7,
            marginTop: 24,
          }}
        >
          {days === 1 ? "day" : "days"} to go
        </div>
      )}
    </div>
  );
}

function ClockLayout({ slide, mode, theme }: SlideRendererProps) {
  const d = slide.data as ClockSlideData;
  const dark = theme.mode === "dark";
  const nowMs = useNow(mode === "display", 1000);
  const now = new Date(nowMs);
  const format = d.format ?? "12h";
  const hours24 = now.getHours();
  const hours12 = ((hours24 + 11) % 12) + 1;
  const hh = format === "24h" ? String(hours24).padStart(2, "0") : String(hours12);
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center text-center"
      style={{
        background: dark ? SLIDE_COLORS.darkBg : SLIDE_COLORS.lightBg,
        color: dark ? SLIDE_COLORS.darkInk : SLIDE_COLORS.lightInk,
      }}
    >
      <div
        className="font-serif tabular-nums"
        style={{
          fontSize: 260,
          fontWeight: 500,
          letterSpacing: "-0.03em",
          lineHeight: 0.95,
          fontVariationSettings: "'opsz' 72",
        }}
      >
        {hh}:{mm}
        {d.showSeconds && (
          <span style={{ fontSize: 160, opacity: 0.55 }}>:{ss}</span>
        )}
        {format === "12h" && (
          <span style={{ fontSize: 72, opacity: 0.5, marginLeft: 20 }}>{ampm}</span>
        )}
      </div>
      {d.showDate && (
        <div
          className="font-serif italic"
          style={{
            fontSize: 36,
            letterSpacing: "-0.012em",
            opacity: 0.65,
            marginTop: 32,
          }}
        >
          {now.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
      )}
    </div>
  );
}

function WeatherLayout({ slide, theme }: SlideRendererProps) {
  const d = slide.data as WeatherSlideData;
  const dark = theme.mode === "dark";
  // v1 placeholder — real fetch lands in Phase 3.
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center text-center"
      style={{
        background: dark ? SLIDE_COLORS.darkBg : SLIDE_COLORS.lightBg,
        color: dark ? SLIDE_COLORS.darkInk : SLIDE_COLORS.lightInk,
      }}
    >
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 14,
          letterSpacing: "0.14em",
          opacity: 0.6,
          marginBottom: 32,
        }}
      >
        {d.city ?? "Weather"}
      </div>
      <div
        className="font-serif"
        style={{
          fontSize: 220,
          fontWeight: 500,
          letterSpacing: "-0.03em",
          lineHeight: 0.95,
          fontVariationSettings: "'opsz' 72",
        }}
      >
        72°{(d.units ?? "f").toUpperCase()}
      </div>
      <div
        className="font-serif italic"
        style={{
          fontSize: 32,
          letterSpacing: "-0.012em",
          opacity: 0.6,
          marginTop: 28,
        }}
      >
        Live weather coming soon
      </div>
    </div>
  );
}

function EventCardLayout({ slide, theme, eventSnapshot }: SlideRendererProps) {
  const d = slide.data as EventCardSlideData;
  const dark = theme.mode === "dark";
  const ev = eventSnapshot;
  const name = ev?.name ?? "Upcoming event";
  const dateLabel = ev?.startAt
    ? new Date(ev.startAt).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Date TBD";

  return (
    <div
      className="relative flex h-full w-full flex-col"
      style={{
        padding: "96px 112px",
        background: dark ? SLIDE_COLORS.darkBg : SLIDE_COLORS.lightBg,
        color: dark ? SLIDE_COLORS.darkInk : SLIDE_COLORS.lightInk,
      }}
    >
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 13,
          letterSpacing: "0.14em",
          opacity: 0.65,
          marginBottom: 28,
        }}
      >
        {ev?.colorTag ? `${ev.colorTag.toUpperCase()} · EVENT` : "EVENT"}
      </div>
      <div
        className="font-serif"
        style={{
          fontSize: 128,
          fontWeight: 500,
          letterSpacing: "-0.028em",
          lineHeight: 1.0,
          fontVariationSettings: "'opsz' 72",
          maxWidth: 1400,
        }}
      >
        {name}
      </div>
      <div
        className="font-serif italic"
        style={{
          fontSize: 40,
          letterSpacing: "-0.012em",
          opacity: 0.7,
          marginTop: 44,
          fontVariationSettings: "'opsz' 48",
        }}
      >
        {dateLabel}
      </div>
      {!d.eventId && (
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 12,
            letterSpacing: "0.14em",
            opacity: 0.45,
            marginTop: 60,
          }}
        >
          No event selected
        </div>
      )}
    </div>
  );
}
