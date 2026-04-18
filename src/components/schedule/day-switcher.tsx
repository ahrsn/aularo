"use client";

import { addDaysKey, formatDayLabel, todayKey } from "./time-utils";

export function DaySwitcher({
  activeKey,
  onPick,
  range = 6,
}: {
  activeKey: string;
  onPick: (key: string) => void;
  range?: number;
}) {
  const today = todayKey();
  const days: string[] = [];
  for (let i = -1; i < range - 1; i++) {
    days.push(addDaysKey(today, i));
  }

  return (
    <div
      className="flex overflow-hidden rounded-[4px] border border-line bg-surface"
      style={{ gap: 0 }}
    >
      {days.map((k, i) => {
        const sel = k === activeKey;
        const isToday = k === today;
        const { weekday, date } = formatDayLabel(k);
        return (
          <button
            key={k}
            onClick={() => onPick(k)}
            className="flex-1 cursor-pointer border-r border-line px-4 py-[10px] text-left last:border-r-0"
            style={{
              background: sel ? "#19231A" : "transparent",
              color: sel ? "#F5F1E8" : "#0E1410",
              border: "none",
              letterSpacing: "-0.005em",
            }}
          >
            <div className="flex items-center gap-[6px]">
              {isToday && (
                <span
                  className="rounded-full"
                  style={{
                    width: 5,
                    height: 5,
                    background: sel ? "#F5F1E8" : "#8B3A2F",
                  }}
                />
              )}
              <div
                className="text-[12px] font-medium"
                style={{ opacity: sel ? 1 : 0.95 }}
              >
                {weekday} {date}
              </div>
            </div>
            <div
              className="mt-[2px] text-[11px]"
              style={{
                opacity: sel ? 0.7 : 0.55,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {isToday ? "Today" : weekday === "Sat" || weekday === "Sun" ? "Weekend" : ""}
            </div>
          </button>
        );
      })}
    </div>
  );
}
