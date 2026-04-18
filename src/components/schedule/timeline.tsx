"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { Display, ScheduleBlock, Slideshow } from "@/lib/schema";
import {
  HOUR_END,
  HOUR_START,
  currentDecimalHour,
  fmtHour,
  hourToPct,
  todayKey,
} from "./time-utils";

export function TimeHeader() {
  const ticks: number[] = [];
  for (let h = HOUR_START; h <= HOUR_END; h++) ticks.push(h);
  return (
    <div
      className="sticky top-0 z-[3] grid border-b border-line bg-paper"
      style={{ gridTemplateColumns: "180px 1fr" }}
    >
      <div
        className="border-r border-line text-label"
        style={{ padding: "12px 16px", letterSpacing: "0.08em" }}
      >
        Display
      </div>
      <div className="relative" style={{ height: 38 }}>
        {ticks.map((h, i) => (
          <div
            key={h}
            className="absolute flex items-center"
            style={{
              left: `${hourToPct(h)}%`,
              top: 0,
              bottom: 0,
              borderLeft: i === 0 ? "none" : "1px solid #EEE9DB",
              paddingLeft: 6,
            }}
          >
            <span
              className="font-mono"
              style={{ fontSize: 10, color: "#9AA099", letterSpacing: "0.02em" }}
            >
              {h === 24 ? "24:00" : `${String(h).padStart(2, "0")}:00`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Block({
  b,
  slideshow,
}: {
  b: ScheduleBlock;
  slideshow?: Slideshow;
}) {
  const [hover, setHover] = useState(false);
  const left = hourToPct(b.start);
  const width = hourToPct(b.end) - hourToPct(b.start);
  const automated = b.automated;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="absolute cursor-pointer overflow-hidden rounded-[3px]"
      style={{
        left: `calc(${left}% + 2px)`,
        width: `calc(${width}% - 4px)`,
        top: 6,
        bottom: 6,
        background: automated
          ? "repeating-linear-gradient(135deg, #F5F1E8 0 6px, #EEE9DB 6px 12px)"
          : "#19231A",
        border: `1px solid ${automated ? "#D4CFC0" : "rgba(25,35,26,0.12)"}`,
        boxShadow: hover ? "0 4px 14px -6px rgba(25,35,26,0.25)" : "none",
        transition: "box-shadow 120ms",
        zIndex: hover ? 2 : 1,
      }}
    >
      {/* Overlay gradient for legibility on solid dark blocks */}
      {!automated && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(14,20,16,0.15), rgba(14,20,16,0.0) 50%)",
          }}
        />
      )}
      <div
        className="absolute inset-0 flex flex-col justify-between"
        style={{
          padding: "7px 10px",
          color: automated ? "#6B7268" : "#F5F1E8",
        }}
      >
        <div className="min-w-0">
          <div
            className="flex items-center gap-[6px] truncate text-[12px] font-medium"
            style={{ letterSpacing: "-0.005em" }}
          >
            {automated && (
              <Icon
                name="lightning"
                size={11}
                style={{ flexShrink: 0, color: "#9AA099" }}
              />
            )}
            <span className="truncate">{b.name}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-[6px]">
          <span
            className="truncate font-mono"
            style={{
              fontSize: 9.5,
              letterSpacing: "0.02em",
              opacity: 0.85,
            }}
          >
            {fmtHour(b.start)}–{fmtHour(b.end)}
          </span>
          {slideshow && !automated && (
            <span
              className="truncate text-[10.5px]"
              style={{ opacity: 0.75 }}
            >
              {slideshow.name}
            </span>
          )}
        </div>
      </div>
      {hover && (
        <div
          className="absolute z-[5] min-w-[240px] rounded-[3px]"
          style={{
            bottom: "calc(100% + 6px)",
            left: 0,
            background: "#0E1410",
            color: "#F5F1E8",
            padding: "10px 12px",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.35)",
            pointerEvents: "none",
          }}
        >
          <div
            className="mb-[3px] text-[12.5px] font-medium"
            style={{ letterSpacing: "-0.005em" }}
          >
            {b.name}
          </div>
          <div
            className="text-[11.5px]"
            style={{
              color: "rgba(245,241,232,0.65)",
              letterSpacing: "-0.005em",
            }}
          >
            {fmtHour(b.start)} — {fmtHour(b.end)} ·{" "}
            {automated ? "automation" : `by ${b.createdBy ?? "team"}`}
          </div>
          {b.note && (
            <div
              className="mt-[6px] italic"
              style={{
                fontSize: 11,
                color: "rgba(245,241,232,0.5)",
                letterSpacing: "-0.005em",
              }}
            >
              {b.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RoomRow({
  display,
  blocks,
  slideshowMap,
}: {
  display: Display;
  blocks: ScheduleBlock[];
  slideshowMap: Map<string, Slideshow>;
}) {
  const online =
    display.status === "online" ||
    (display.lastHeartbeat != null &&
      Date.now() - display.lastHeartbeat < 90_000);
  const hourLines: number[] = [];
  for (let h = HOUR_START + 1; h < HOUR_END; h++) hourLines.push(h);

  return (
    <div
      className="grid border-b"
      style={{
        gridTemplateColumns: "180px 1fr",
        borderColor: "#EEE9DB",
        minHeight: 62,
      }}
    >
      <div
        className="border-r border-line bg-surface"
        style={{ padding: "12px 16px" }}
      >
        <div className="text-[13px] font-medium tracking-[-0.008em] text-ink">
          {display.name}
        </div>
        <div className="mt-[2px] text-[11px] tracking-[-0.005em] text-muted">
          {display.location ?? display.room ?? (online ? "Online" : "Offline")}
        </div>
      </div>
      <div
        className="relative"
        style={{
          background: online
            ? "#FBF8F0"
            : "repeating-linear-gradient(45deg, #F5F1E8 0 8px, #EEE9DB 8px 16px)",
        }}
      >
        {hourLines.map((h) => (
          <div
            key={h}
            className="absolute"
            style={{
              left: `${hourToPct(h)}%`,
              top: 0,
              bottom: 0,
              borderLeft: "1px solid #EEE9DB",
            }}
          />
        ))}
        {blocks.map((b) => (
          <Block
            key={b.id}
            b={b}
            slideshow={b.slideshowId ? slideshowMap.get(b.slideshowId) : undefined}
          />
        ))}
        {blocks.length === 0 && online && (
          <div
            className="absolute inset-0 flex items-center justify-center text-[11.5px] tracking-[-0.005em] text-muted-2"
          >
            No blocks scheduled
          </div>
        )}
        {!online && (
          <div
            className="absolute inset-0 flex items-center justify-center gap-[6px] text-[11.5px] tracking-[-0.005em]"
            style={{ color: "#8B3A2F" }}
          >
            <Icon name="warning" size={12} /> Display offline
          </div>
        )}
      </div>
    </div>
  );
}

export function Timeline({
  displays,
  blocks,
  slideshows,
  dayKey,
}: {
  displays: Display[];
  blocks: ScheduleBlock[];
  slideshows: Slideshow[];
  dayKey: string;
}) {
  const slideshowMap = new Map(slideshows.map((s) => [s.id, s]));
  const blocksByDisplay = new Map<string, ScheduleBlock[]>();
  for (const b of blocks) {
    const list = blocksByDisplay.get(b.displayId) ?? [];
    list.push(b);
    blocksByDisplay.set(b.displayId, list);
  }
  const showNow = dayKey === todayKey();

  return (
    <div className="relative overflow-hidden rounded-[4px] border border-line bg-surface">
      <TimeHeader />
      <div className="relative">
        {displays.map((d) => (
          <RoomRow
            key={d.id}
            display={d}
            blocks={blocksByDisplay.get(d.id) ?? []}
            slideshowMap={slideshowMap}
          />
        ))}
        {displays.length === 0 && (
          <div
            className="flex items-center justify-center py-12 text-[13px] tracking-[-0.005em] text-muted"
          >
            No displays paired yet — pair one to start scheduling.
          </div>
        )}
        {showNow && displays.length > 0 && <NowLine />}
      </div>
    </div>
  );
}

function NowLine() {
  // Re-ticks every minute so the marker moves on its own.
  const [now, setNow] = useState(() => currentDecimalHour());
  useEffect(() => {
    const t = setInterval(() => setNow(currentDecimalHour()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (now < HOUR_START || now > HOUR_END) return null;

  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 z-[2]"
      style={{ left: 180, right: 0 }}
    >
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: `${hourToPct(now)}%`,
          width: 2,
          background: "#8B3A2F",
        }}
      />
      <div
        className="absolute rounded-[2px] font-mono"
        style={{
          top: 4,
          left: `calc(${hourToPct(now)}% + 4px)`,
          padding: "2px 6px",
          background: "#8B3A2F",
          color: "#F5F1E8",
          fontSize: 9.5,
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        NOW · {fmtHour(now)}
      </div>
    </div>
  );
}
