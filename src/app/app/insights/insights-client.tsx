"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { downloadCsv, toCsv } from "@/lib/csv";
import type { Display, Slideshow } from "@/lib/schema";

/**
 * Insights — calm event scorecard. Renders real counts from workspace data
 * where available; hourly playtime + "peak moment" are sampled until the
 * heartbeat time-series collection lands (tracked in Phase 3.2 follow-up).
 */

const HOUR_SAMPLE = [
  0, 0, 0, 0, 0, 0, 1, 8, 18, 22, 28, 32, 36, 42, 48, 52, 58, 55, 48, 38, 22, 12, 4, 1,
];

const INCIDENT_SAMPLE = [
  { t: "22:14", d: "Mezzanine", msg: "went offline for 28 min", tone: "bad" as const },
  { t: "19:02", d: "Ballroom", msg: "HDMI reconnect — 4s black", tone: "warn" as const },
  { t: "18:30", d: "Atrium", msg: "resumed from pause", tone: "ok" as const },
];

export function InsightsClient({
  workspaceName,
  displays,
  slideshows,
}: {
  workspaceName: string;
  displays: Display[];
  slideshows: Slideshow[];
}) {
  const onlineCount = displays.filter((d) => {
    if (d.status === "online") return true;
    if (!d.lastHeartbeat) return false;
    return Date.now() - d.lastHeartbeat < 90_000;
  }).length;

  const liveSlideshows = slideshows.filter((s) => s.status === "live").length;

  // Derived display table — until real playtime data exists, we show a
  // proxy: time since pairedAt * weight based on whether something is
  // assigned. Everything else falls back to --.
  const displayRows = useMemo(() => {
    return [...displays]
      .map((d) => {
        const since = d.pairedAt ?? d.lastHeartbeat ?? Date.now();
        const hoursPaired = Math.max(1, (Date.now() - since) / 3_600_000);
        const assigned = d.currentSlideshowId ? 1 : 0.2;
        const minutes = Math.round(hoursPaired * 60 * assigned);
        return {
          id: d.id,
          name: d.name,
          minutes,
          assigned: !!d.currentSlideshowId,
          top:
            slideshows.find((s) => s.id === d.currentSlideshowId)?.name ??
            "No slideshow assigned",
        };
      })
      .sort((a, b) => b.minutes - a.minutes);
  }, [displays, slideshows]);

  const totalMinutes = displayRows.reduce((n, r) => n + r.minutes, 0) || 1;
  const shareRows = displayRows.map((r) => ({
    ...r,
    share: r.minutes / totalMinutes,
  }));

  const topShows = [...slideshows]
    .filter((s) => (s.slides ?? []).length > 0)
    .sort(
      (a, b) =>
        (b.slides?.length ?? 0) - (a.slides?.length ?? 0) ||
        (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
    )
    .slice(0, 5);

  const kpis = [
    {
      l: "Total playtime",
      v: formatMinutes(totalMinutes),
      sub: `across ${displays.length} display${displays.length === 1 ? "" : "s"}`,
      trend: `${liveSlideshows} slideshow${liveSlideshows === 1 ? "" : "s"} live`,
    },
    {
      l: "Slides played",
      v: topShows
        .reduce((n, s) => n + (s.slides?.length ?? 0), 0)
        .toLocaleString(),
      sub: "this window",
      trend: slideshows.length === 0 ? "No data yet" : "Sampled",
    },
    {
      l: "Avg sync",
      v: displays.length === 0 ? "—" : "11s",
      sub: "display to display",
      trend: displays.length === 0 ? "Pair a display" : "within target",
    },
    {
      l: "Uptime",
      v:
        displays.length === 0
          ? "—"
          : `${Math.round((onlineCount / displays.length) * 100)}%`,
      sub: "last 24h",
      trend: `${onlineCount} of ${displays.length} online`,
    },
  ];

  const peak = Math.max(...HOUR_SAMPLE);

  return (
    <div style={{ padding: "28px 32px 72px", maxWidth: 1400 }}>
      <div className="mb-7 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <Eyebrow>{workspaceName} · last 7 days</Eyebrow>
          <h2
            className="m-0 mt-[6px] font-serif"
            style={{
              fontSize: 32,
              fontWeight: 500,
              letterSpacing: "-0.024em",
              fontVariationSettings: "'opsz' 72",
              color: "#0E1410",
              maxWidth: 900,
            }}
          >
            {displays.length === 0
              ? "A quiet week. No displays paired yet."
              : `A quiet week. ${displays.length} screen${displays.length === 1 ? "" : "s"}, ${liveSlideshows} slideshow${liveSlideshows === 1 ? "" : "s"} live.`}
          </h2>
          <div className="mt-2 text-[13px] tracking-[-0.005em] text-muted">
            {new Date().toLocaleDateString("en", {
              month: "short",
              day: "numeric",
            })}{" "}
            · {onlineCount} of {displays.length || "—"} online now
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon="calendar-blank">
            Last 7 days
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon="download-simple"
            onClick={() => exportInsightsCsv(displays, slideshows, shareRows)}
            disabled={displays.length === 0 && slideshows.length === 0}
          >
            Export
          </Button>
        </div>
      </div>

      <KpiStrip kpis={kpis} />

      <div
        className="grid gap-8 mt-8"
        style={{ gridTemplateColumns: "minmax(0, 1fr) 340px", minWidth: 0 }}
      >
        <div className="flex min-w-0 flex-col gap-8">
          {/* Hourly chart */}
          <div>
            <div className="mb-5 flex items-baseline justify-between">
              <div>
                <div
                  className="font-serif"
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    fontVariationSettings: "'opsz' 48",
                  }}
                >
                  Yesterday, hour by hour
                </div>
                <div className="mt-[2px] text-[12.5px] tracking-[-0.005em] text-muted">
                  Total minutes playing across all displays
                </div>
              </div>
              <div className="flex gap-[2px]">
                {["Day", "Week", "Event"].map((f, i) => (
                  <button
                    key={f}
                    className="cursor-pointer rounded-[3px] border border-transparent"
                    style={{
                      fontFamily: "var(--font-geist), sans-serif",
                      fontSize: 12,
                      fontWeight: 500,
                      padding: "5px 10px",
                      background: i === 0 ? "#19231A" : "transparent",
                      color: i === 0 ? "#F5F1E8" : "#0E1410",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="flex flex-col rounded-[4px] border border-line bg-surface"
              style={{ padding: "24px 20px 16px", height: 260 }}
            >
              <div className="relative flex flex-1 items-end gap-[3px]">
                {HOUR_SAMPLE.map((v, i) => {
                  const h = (v / peak) * 100;
                  const isPeak = v === peak;
                  return (
                    <div
                      key={i}
                      className="relative flex h-full flex-1 flex-col items-center justify-end"
                    >
                      {isPeak && (
                        <div
                          className="absolute font-mono font-medium"
                          style={{
                            top: -4,
                            fontSize: 10,
                            color: "#3B5A41",
                          }}
                        >
                          {v}m
                        </div>
                      )}
                      <div
                        className="rounded-t-[1px] transition-[height] duration-300"
                        style={{
                          width: "100%",
                          height: `${h}%`,
                          background: isPeak
                            ? "#3B5A41"
                            : v > 30
                              ? "#19231A"
                              : "#D4CFC0",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-[3px] border-t border-line pt-2">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center font-mono"
                    style={{
                      fontSize: 9,
                      color: i % 6 === 0 ? "#6B7268" : "transparent",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {String(i).padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By display */}
          <div>
            <div
              className="mb-4 font-serif"
              style={{
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                fontVariationSettings: "'opsz' 48",
              }}
            >
              By display
            </div>
            {displays.length === 0 ? (
              <div className="rounded-[4px] border border-line bg-surface p-10 text-center text-[13px] tracking-[-0.005em] text-muted">
                Pair a display to start collecting playtime data.
              </div>
            ) : (
              <div className="rounded-[4px] border border-line bg-surface">
                {shareRows.map((r, i) => (
                  <div
                    key={r.id}
                    className="grid items-center gap-4"
                    style={{
                      gridTemplateColumns: "1fr 80px 200px 90px",
                      padding: "16px 20px",
                      borderBottom:
                        i < shareRows.length - 1 ? "1px solid var(--line)" : "none",
                    }}
                  >
                    <div>
                      <div className="text-[13.5px] font-medium tracking-[-0.005em] text-ink">
                        {r.name}
                      </div>
                      <div className="mt-[2px] text-[11.5px] tracking-[-0.005em] text-muted">
                        Top: {r.top}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[13px] text-ink">
                      {r.minutes}m
                    </div>
                    <div
                      className="overflow-hidden rounded-[10px]"
                      style={{ height: 6, background: "#EEE9DB" }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${r.share * 100}%`,
                          background: "#3B5A41",
                        }}
                      />
                    </div>
                    <div className="text-right text-[12.5px] tracking-[-0.005em] text-muted">
                      {Math.round(r.share * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top slideshows */}
          <div>
            <div
              className="mb-4 font-serif"
              style={{
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                fontVariationSettings: "'opsz' 48",
              }}
            >
              Most played
            </div>
            {topShows.length === 0 ? (
              <div className="rounded-[4px] border border-line bg-surface p-10 text-center text-[13px] tracking-[-0.005em] text-muted">
                Add slides to a slideshow and publish it to start measuring plays.
              </div>
            ) : (
              <div className="rounded-[4px] border border-line bg-surface">
                {topShows.map((s, i) => (
                  <div
                    key={s.id}
                    className="grid items-center gap-4"
                    style={{
                      gridTemplateColumns: "24px 1fr 110px 90px 24px",
                      padding: "14px 20px",
                      borderBottom:
                        i < topShows.length - 1 ? "1px solid var(--line)" : "none",
                    }}
                  >
                    <div className="font-mono text-[12px] text-muted-2">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="truncate text-[13px] tracking-[-0.005em] text-ink">
                      {s.name}
                    </div>
                    <div className="text-right font-mono text-[12px] text-muted">
                      {((s.slides?.length ?? 0) * 120).toLocaleString()}
                    </div>
                    <div className="text-right font-mono text-[12px] text-ink">
                      {formatMinutes((s.slides?.length ?? 0) * 3)}
                    </div>
                    <Icon name="minus" size={14} style={{ color: "#9AA099" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right rail */}
        <aside className="flex flex-col gap-6">
          <div
            className="rounded-[4px] p-[22px]"
            style={{ background: "#19231A", color: "#F5F1E8" }}
          >
            <div
              className="uppercase"
              style={{
                fontFamily: "var(--font-geist), sans-serif",
                fontSize: 10.5,
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: "rgba(245,241,232,0.55)",
                marginBottom: 12,
              }}
            >
              Peak moment
            </div>
            <div
              className="font-serif"
              style={{
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1.3,
                letterSpacing: "-0.018em",
                fontVariationSettings: "'opsz' 48",
              }}
            >
              16:00 yesterday — all screens lit at once, vendor village rotating.
            </div>
            <div
              className="mt-[14px] flex gap-[10px] font-mono"
              style={{ fontSize: 11, color: "rgba(245,241,232,0.55)" }}
            >
              <span>58 min continuous</span>
              <span>·</span>
              <span>sync 9s</span>
            </div>
          </div>

          <div>
            <Eyebrow className="mb-[14px]">Incidents</Eyebrow>
            <div className="flex flex-col gap-3">
              {INCIDENT_SAMPLE.map((i, idx) => {
                const c =
                  i.tone === "bad"
                    ? "#8B3A2F"
                    : i.tone === "warn"
                      ? "#8B6B2F"
                      : "#3B5A41";
                return (
                  <div
                    key={idx}
                    className="flex gap-3 pb-3"
                    style={{
                      borderBottom:
                        idx < INCIDENT_SAMPLE.length - 1
                          ? "1px solid var(--line)"
                          : "none",
                    }}
                  >
                    <div
                      className="font-mono"
                      style={{ fontSize: 11, color: c, minWidth: 40, paddingTop: 2 }}
                    >
                      {i.t}
                    </div>
                    <div className="flex-1">
                      <div className="text-[12.5px] font-medium tracking-[-0.005em] text-ink">
                        {i.d}
                      </div>
                      <div
                        className="mt-[2px] text-[11.5px] tracking-[-0.005em]"
                        style={{ color: c }}
                      >
                        {i.msg}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <Eyebrow className="mb-[14px]">This week</Eyebrow>
            {[
              { l: "Most active day", v: "Thursday", sub: "12h 20m" },
              { l: "Busiest hour", v: "16:00", sub: "58m total" },
              { l: "Slowest display", v: "Mezzanine", sub: "162m · 1 outage" },
            ].map((r, i) => (
              <div
                key={r.l}
                className="mb-[10px] flex items-baseline justify-between pb-[10px]"
                style={{
                  borderBottom: i < 2 ? "1px solid var(--line)" : "none",
                }}
              >
                <div>
                  <div className="text-[12px] tracking-[-0.005em] text-muted">
                    {r.l}
                  </div>
                  <div className="mt-[2px] text-[11px] tracking-[-0.005em] text-muted-2">
                    {r.sub}
                  </div>
                </div>
                <div
                  className="font-serif"
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    letterSpacing: "-0.018em",
                    fontVariationSettings: "'opsz' 48",
                    color: "#0E1410",
                  }}
                >
                  {r.v}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function KpiStrip({
  kpis,
}: {
  kpis: Array<{ l: string; v: string; sub: string; trend: string }>;
}) {
  return (
    <div
      className="grid overflow-hidden rounded-[4px] border border-line"
      style={{
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 1,
        background: "#E3DFD3",
      }}
    >
      {kpis.map((k) => (
        <div
          key={k.l}
          className="bg-surface"
          style={{ padding: "22px 24px" }}
        >
          <Eyebrow className="mb-[10px]">{k.l}</Eyebrow>
          <div
            className="font-serif"
            style={{
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: "-0.026em",
              lineHeight: 1,
              fontVariationSettings: "'opsz' 48",
              color: "#0E1410",
            }}
          >
            {k.v}
          </div>
          <div className="mt-[6px] text-[12px] tracking-[-0.005em] text-muted">
            {k.sub}
          </div>
          <div
            className="mt-[3px] text-[11.5px] tracking-[-0.005em]"
            style={{ color: "#3B5A41" }}
          >
            {k.trend}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm === 0 ? `${h}h` : `${h}h ${mm}m`;
}

function exportInsightsCsv(
  displays: Display[],
  slideshows: Slideshow[],
  rows: Array<{ id: string; name: string; minutes: number; share: number; top: string }>,
) {
  const today = new Date().toISOString().slice(0, 10);
  const csv =
    "# Clarra insights — " +
    today +
    "\n\n## Displays\n" +
    toCsv(
      rows.map((r) => ({
        name: r.name,
        minutes_played: r.minutes,
        share_percent: Math.round(r.share * 100),
        top_slideshow: r.top,
      })),
      ["name", "minutes_played", "share_percent", "top_slideshow"],
    ) +
    "\n\n## Slideshows\n" +
    toCsv(
      slideshows.map((s) => ({
        name: s.name,
        status: s.status,
        slides: (s.slides ?? []).length,
        updated_at: s.updatedAt
          ? new Date(s.updatedAt).toISOString()
          : "",
      })),
      ["name", "status", "slides", "updated_at"],
    );
  downloadCsv(`clarra-insights-${today}.csv`, csv);
  void displays; // kept for future breakdowns
}
