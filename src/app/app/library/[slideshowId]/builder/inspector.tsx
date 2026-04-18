"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { EventDoc, Slide } from "@/lib/schema";
import { KindInspector } from "./inspectors";

export function Inspector({
  slide,
  events,
  onField,
  onPickImage,
  onDuplicate,
  onDelete,
  onToggleHidden,
  onDurationChange,
}: {
  slide: Slide | null;
  events: EventDoc[];
  onField: (path: string, value: unknown) => void;
  onPickImage: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleHidden: () => void;
  onDurationChange: (ms: number | null) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const kindLabel = useMemo(
    () =>
      slide
        ? slide.kind.charAt(0).toUpperCase() + slide.kind.slice(1).replace("-", " ")
        : "",
    [slide],
  );

  if (!slide) {
    return (
      <aside
        className="flex h-full flex-col border-l border-line bg-[rgba(25,35,26,0.02)]"
        style={{ width: 340 }}
      >
        <div
          className="flex h-full items-center justify-center text-center"
          style={{ padding: 32 }}
        >
          <div
            className="font-mono uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "rgba(25,35,26,0.45)",
            }}
          >
            No slide selected
          </div>
        </div>
      </aside>
    );
  }

  const durationSec = slide.durationMs ? Math.round(slide.durationMs / 1000) : null;

  return (
    <aside
      className="flex h-full min-h-0 flex-col border-l border-line bg-[rgba(25,35,26,0.02)]"
      style={{ width: 340 }}
    >
      <div
        className="flex items-center justify-between border-b border-line"
        style={{ padding: "12px 16px", minHeight: 44 }}
      >
        <div className="flex items-center gap-[8px]">
          <div className="text-label">Inspector</div>
          <div
            className="font-mono text-[10.5px] uppercase tracking-[0.12em]"
            style={{ color: "rgba(25,35,26,0.5)" }}
          >
            · {kindLabel}
          </div>
        </div>
        <div className="flex items-center gap-[2px]">
          <InspectorAction
            icon="copy"
            label="Duplicate"
            onClick={onDuplicate}
          />
          <InspectorAction
            icon={slide.hidden ? "eye" : "eye-slash"}
            label={slide.hidden ? "Show" : "Hide"}
            onClick={onToggleHidden}
          />
          <InspectorAction
            icon="trash"
            label="Delete"
            onClick={onDelete}
            danger
          />
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "16px 16px 40px" }}
      >
        <div className="flex flex-col gap-[14px]">
          <KindInspector
            slide={slide}
            events={events}
            onField={onField}
            onPickImage={onPickImage}
          />
        </div>

        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="mt-6 flex w-full cursor-pointer items-center justify-between rounded-[4px] px-[4px] py-[6px] text-left"
          aria-expanded={advancedOpen}
        >
          <span className="text-label">Advanced</span>
          <Icon
            name={advancedOpen ? "caret-up" : "caret-down"}
            size={12}
            style={{ color: "rgba(25,35,26,0.55)" }}
          />
        </button>
        {advancedOpen && (
          <div className="mt-[4px] flex flex-col gap-[14px]">
            <label className="flex flex-col gap-[6px]">
              <span
                className="font-mono uppercase text-[10.5px] tracking-[0.12em]"
                style={{ color: "rgba(25,35,26,0.55)" }}
              >
                Duration override
              </span>
              <div className="flex items-center gap-[6px]">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={durationSec ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") onDurationChange(null);
                    else onDurationChange(Number(v) * 1000);
                  }}
                  placeholder="—"
                  className="w-[80px] rounded-[4px] border border-line bg-paper px-3 py-[6px] text-[13px] text-ink focus:border-moss focus:outline-none"
                />
                <span
                  className="text-[12px] tracking-[-0.005em]"
                  style={{ color: "rgba(25,35,26,0.55)" }}
                >
                  seconds (blank = use slideshow default)
                </span>
              </div>
            </label>
          </div>
        )}
      </div>
    </aside>
  );
}

function InspectorAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="cursor-pointer rounded-[3px] p-[6px] text-muted transition-colors hover:bg-[rgba(25,35,26,0.08)]"
      style={{ color: danger ? "#8B3A2F" : undefined }}
    >
      <Icon name={icon} size={13} />
    </button>
  );
}
