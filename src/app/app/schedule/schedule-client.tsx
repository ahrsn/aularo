"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { AutomationCard } from "@/components/schedule/automation-card";
import { AutomationModal } from "@/components/schedule/automation-modal";
import { AddBlockModal } from "@/components/schedule/add-block-modal";
import { DaySwitcher } from "@/components/schedule/day-switcher";
import { Timeline } from "@/components/schedule/timeline";
import {
  fmtHour,
  formatDayLabel,
  todayKey,
} from "@/components/schedule/time-utils";
import { downloadCsv, toCsv } from "@/lib/csv";
import type {
  Automation,
  Display,
  ScheduleBlock,
  Slideshow,
} from "@/lib/schema";

function exportCsv(
  dayKey: string,
  blocks: ScheduleBlock[],
  displays: Display[],
  slideshows: Slideshow[],
) {
  const rows = blocks
    .sort((a, b) => a.start - b.start)
    .map((b) => ({
      day: dayKey,
      start: fmtHour(b.start),
      end: fmtHour(b.end),
      display:
        displays.find((d) => d.id === b.displayId)?.name ?? b.displayId,
      slideshow: b.slideshowId
        ? (slideshows.find((s) => s.id === b.slideshowId)?.name ??
          b.slideshowId)
        : "",
      name: b.name,
      source: b.automated ? "automation" : (b.createdBy ?? "manual"),
      note: b.note ?? "",
    }));
  downloadCsv(
    `aularo-schedule-${dayKey}.csv`,
    toCsv(rows, [
      "day",
      "start",
      "end",
      "display",
      "slideshow",
      "name",
      "source",
      "note",
    ]),
  );
}

export function ScheduleClient({
  displays,
  blocks,
  slideshows,
  automations,
  initialDay,
}: {
  displays: Display[];
  blocks: ScheduleBlock[];
  slideshows: Slideshow[];
  automations: Automation[];
  initialDay: string;
}) {
  const [activeKey, setActiveKey] = useState(initialDay);
  const [addOpen, setAddOpen] = useState(false);
  const [automationModal, setAutomationModal] = useState<
    { mode: "create" } | { mode: "edit"; automation: Automation } | null
  >(null);

  const dayBlocks = useMemo(
    () => blocks.filter((b) => b.dayKey === activeKey),
    [blocks, activeKey],
  );

  const liveNow = dayBlocks.filter((b) => {
    if (activeKey !== todayKey()) return false;
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    return h >= b.start && h <= b.end;
  });

  const activeOns = automations.filter((a) => a.on);
  const { date, weekday } = formatDayLabel(activeKey);
  const upNext = dayBlocks
    .filter((b) => {
      if (activeKey !== todayKey()) return b.start >= 0;
      const now = new Date();
      const h = now.getHours() + now.getMinutes() / 60;
      return b.start > h;
    })
    .sort((a, b) => a.start - b.start)
    .slice(0, 4);

  return (
    <div
      className="grid min-w-0"
      style={{
        padding: "28px 32px 64px",
        gap: 28,
        gridTemplateColumns: "minmax(0, 1fr) 300px",
        maxWidth: 1600,
      }}
    >
      <div className="flex min-w-0 flex-col gap-[22px]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Eyebrow>Run of Show</Eyebrow>
            <h2
              className="m-0 mt-[6px] font-serif"
              style={{
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: "-0.022em",
                fontVariationSettings: "'opsz' 48",
                color: "#0E1410",
              }}
            >
              {weekday} {date}
            </h2>
            <div className="mt-1 text-[12.5px] tracking-[-0.005em] text-muted">
              {dayBlocks.length} scheduled blocks · {activeOns.length} automations
              live · {liveNow.length} playing now
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              icon="download-simple"
              onClick={() => exportCsv(activeKey, dayBlocks, displays, slideshows)}
              disabled={dayBlocks.length === 0}
            >
              Export
            </Button>
            <Button
              variant="primary"
              icon="plus"
              onClick={() => setAddOpen(true)}
            >
              Add Block
            </Button>
          </div>
        </div>

        <DaySwitcher activeKey={activeKey} onPick={setActiveKey} />

        <Timeline
          displays={displays}
          blocks={dayBlocks}
          slideshows={slideshows}
          dayKey={activeKey}
        />

        <div className="flex flex-wrap items-center gap-[18px] text-[11.5px] tracking-[-0.005em] text-muted">
          <span className="inline-flex items-center gap-[6px]">
            <span
              className="rounded-[2px] border"
              style={{
                width: 10,
                height: 10,
                background: "#19231A",
                borderColor: "rgba(25,35,26,0.12)",
              }}
            />{" "}
            Scheduled Slideshow
          </span>
          <span className="inline-flex items-center gap-[6px]">
            <span
              className="rounded-[2px] border"
              style={{
                width: 10,
                height: 10,
                background:
                  "repeating-linear-gradient(135deg, #F5F1E8 0 3px, #EEE9DB 3px 6px)",
                borderColor: "#D4CFC0",
              }}
            />{" "}
            Automation-Driven
          </span>
          <span className="inline-flex items-center gap-[6px]">
            <span style={{ width: 2, height: 12, background: "#8B3A2F" }} />{" "}
            Current time
          </span>
        </div>
      </div>

      <aside className="flex min-w-0 flex-col gap-5">
        <div
          className="rounded-[4px] p-5"
          style={{ background: "#19231A", color: "#F5F1E8" }}
        >
          <div
            className="mb-3 uppercase"
            style={{
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "rgba(245,241,232,0.55)",
            }}
          >
            Up Next
          </div>
          {upNext.length === 0 ? (
            <div
              className="text-[13px] italic tracking-[-0.005em]"
              style={{ color: "rgba(245,241,232,0.55)" }}
            >
              Nothing scheduled after now.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upNext.map((b) => (
                <div
                  key={b.id}
                  className="grid items-baseline gap-[10px]"
                  style={{ gridTemplateColumns: "44px 1fr" }}
                >
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color: "rgba(245,241,232,0.55)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {fmtHour(b.start)}
                  </div>
                  <div>
                    <div
                      className="truncate text-[12.5px] font-medium"
                      style={{ letterSpacing: "-0.005em" }}
                    >
                      {b.automated && (
                        <Icon
                          name="lightning"
                          size={10}
                          style={{
                            color: "rgba(245,241,232,0.55)",
                            marginRight: 5,
                          }}
                        />
                      )}
                      {b.name}
                    </div>
                    <div
                      className="mt-[1px] text-[11px] tracking-[-0.005em]"
                      style={{ color: "rgba(245,241,232,0.55)" }}
                    >
                      {displays.find((d) => d.id === b.displayId)?.name ??
                        "Unassigned"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div
            className="mt-4 border-t pt-3"
            style={{ borderColor: "rgba(245,241,232,0.14)" }}
          >
            <Button
              variant="onDarkGhost"
              size="sm"
              icon="plus"
              onClick={() => setAddOpen(true)}
            >
              Add Block
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[4px] border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line p-[12px_14px]">
            <div
              className="font-serif"
              style={{
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: "-0.015em",
                fontVariationSettings: "'opsz' 48",
              }}
            >
              Automations
            </div>
            <Button
              variant="text"
              size="sm"
              icon="plus"
              onClick={() => setAutomationModal({ mode: "create" })}
            >
              New
            </Button>
          </div>
          {automations.length === 0 ? (
            <div className="p-5 text-[12.5px] tracking-[-0.005em] text-muted">
              No automations yet. Add one from{" "}
              <span className="text-ink">+ New</span> to fire actions at fixed
              times or event triggers.
            </div>
          ) : (
            automations.map((a) => (
              <AutomationCard
                key={a.id}
                a={a}
                onEdit={(auto) =>
                  setAutomationModal({ mode: "edit", automation: auto })
                }
              />
            ))
          )}
        </div>

        <div className="overflow-hidden rounded-[4px] border border-line bg-surface">
          <div className="border-b border-line p-[12px_14px]">
            <div
              className="font-serif"
              style={{
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: "-0.015em",
                fontVariationSettings: "'opsz' 48",
              }}
            >
              Ready to Schedule
            </div>
            <div className="mt-[2px] text-[11px] tracking-[-0.005em] text-muted">
              Drafts you can drop onto the timeline
            </div>
          </div>
          {slideshows.filter((s) => s.status === "draft").slice(0, 5).length === 0 ? (
            <div className="p-5 text-[12.5px] tracking-[-0.005em] text-muted">
              No drafts. Create a slideshow first.
            </div>
          ) : (
            slideshows
              .filter((s) => s.status === "draft")
              .slice(0, 5)
              .map((s) => (
                <div
                  key={s.id}
                  className="grid cursor-grab items-center gap-3 border-b border-line p-[10px_14px]"
                  style={{ gridTemplateColumns: "40px 1fr auto" }}
                >
                  <div
                    className="rounded-[2px]"
                    style={{ width: 40, height: 26, background: "#EEE9DB" }}
                  />
                  <div className="min-w-0">
                    <div
                      className="truncate text-[12.5px] font-medium tracking-[-0.005em] text-ink"
                    >
                      {s.name}
                    </div>
                    <div className="mt-[1px] text-[11px] tracking-[-0.005em] text-muted">
                      {(s.slides ?? []).length} slides
                    </div>
                  </div>
                  <Icon
                    name="dots-six-vertical"
                    size={14}
                    style={{ color: "#D4CFC0" }}
                  />
                </div>
              ))
          )}
        </div>
      </aside>

      <AddBlockModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        displays={displays}
        slideshows={slideshows}
        defaultDayKey={activeKey}
      />

      <AutomationModal
        open={automationModal !== null}
        onClose={() => setAutomationModal(null)}
        mode={automationModal?.mode ?? "create"}
        automation={
          automationModal?.mode === "edit" ? automationModal.automation : undefined
        }
      />
    </div>
  );
}
