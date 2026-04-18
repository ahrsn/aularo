"use client";

import { Fragment, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { StatusText } from "@/components/ui/status-dot";
import { PairModal } from "@/components/pair-modal";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import {
  refreshAllDisplays,
  renameDisplay,
  unpairDisplay,
} from "@/lib/actions";
import type { Display } from "@/lib/schema";

type StatusFilter = "all" | "online" | "offline" | "idle";

function isOnline(d: Display, nowMs: number) {
  if (d.status === "online") return true;
  if (!d.lastHeartbeat) return false;
  return nowMs - d.lastHeartbeat < 90_000;
}

export function DisplaysClient({
  initialDisplays,
}: {
  initialDisplays: Display[];
}) {
  const router = useRouter();
  const [pairOpen, setPairOpen] = useState(false);
  const [renaming, setRenaming] = useState<Display | null>(null);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  // Tick every 30s so "online" computation updates in the UI without a refetch.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const [busy, startTransition] = useTransition();

  const { online, offline, idle } = useMemo(() => {
    const online: Display[] = [];
    const offline: Display[] = [];
    const idle: Display[] = [];
    for (const d of initialDisplays) {
      if (isOnline(d, now)) {
        online.push(d);
        if (!d.currentSlideshowId) idle.push(d);
      } else {
        offline.push(d);
      }
    }
    return { online, offline, idle };
  }, [initialDisplays, now]);

  const visibleDisplays = useMemo(() => {
    if (statusFilter === "all") return initialDisplays;
    if (statusFilter === "online")
      return initialDisplays.filter((d) => isOnline(d, now));
    if (statusFilter === "offline")
      return initialDisplays.filter((d) => !isOnline(d, now));
    // idle
    return initialDisplays.filter(
      (d) => isOnline(d, now) && !d.currentSlideshowId,
    );
  }, [initialDisplays, statusFilter, now]);

  function onRefreshAll() {
    setRefreshMsg(null);
    startTransition(async () => {
      const { count } = await refreshAllDisplays();
      setRefreshMsg(`Pinged ${count} display${count === 1 ? "" : "s"}.`);
      setTimeout(() => setRefreshMsg(null), 3000);
      router.refresh();
    });
  }

  return (
    <div
      className="grid min-w-0"
      style={{
        padding: "28px 32px 64px",
        gap: 28,
        gridTemplateColumns: "minmax(0, 1fr) 240px",
        maxWidth: 1400,
      }}
    >
      <div className="flex min-w-0 flex-col gap-[22px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-label">Connected screens</div>
            <h2 className="text-h2 mt-[6px]">
              {online.length} of {initialDisplays.length} online
            </h2>
            <div className="mt-1 text-[12.5px] tracking-[-0.005em] text-muted">
              {refreshMsg ??
                (statusFilter !== "all"
                  ? `Filtered to ${statusFilter}. ${visibleDisplays.length} shown.`
                  : "Pair any browser-capable screen to this workspace.")}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              icon="arrows-clockwise"
              onClick={onRefreshAll}
              disabled={busy || initialDisplays.length === 0}
            >
              Refresh all
            </Button>
            <Button
              variant="primary"
              icon="plus"
              onClick={() => setPairOpen(true)}
            >
              Pair display
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[4px] border border-line bg-surface">
          <div
            className="grid items-center border-b border-line bg-paper text-muted"
            style={{
              gridTemplateColumns:
                "minmax(0,100px) minmax(160px,1fr) minmax(0,180px) 120px 80px",
              gap: 14,
              padding: "10px 18px",
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <div></div>
            <div>Display</div>
            <div>Now playing</div>
            <div>Status</div>
            <div></div>
          </div>
          {initialDisplays.length === 0 ? (
            <div className="py-14 text-center">
              <div className="text-h2" style={{ fontSize: 20 }}>
                No displays paired yet.
              </div>
              <div className="mt-1 text-[13px] tracking-[-0.005em] text-muted">
                Open clarra.show/screen on any browser and pair it with a code.
              </div>
              <div className="mt-6 flex justify-center">
                <Button
                  variant="primary"
                  icon="plus"
                  onClick={() => setPairOpen(true)}
                >
                  Pair your first display
                </Button>
              </div>
            </div>
          ) : visibleDisplays.length === 0 ? (
            <div className="py-10 text-center">
              <div
                className="font-serif text-ink"
                style={{
                  fontSize: 17,
                  fontWeight: 500,
                  letterSpacing: "-0.018em",
                  fontVariationSettings: "'opsz' 48",
                }}
              >
                No {statusFilter} displays.
              </div>
              <div className="mt-1 text-[12.5px] tracking-[-0.005em] text-muted">
                Clear the filter to see the full fleet.
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  Clear filter
                </Button>
              </div>
            </div>
          ) : (
            visibleDisplays.map((d) => (
              <DisplayRow
                key={d.id}
                d={d}
                onRename={() => setRenaming(d)}
                now={now}
              />
            ))
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-4 self-start">
        <div
          className="rounded-[4px] p-5 text-paper"
          style={{ background: "#19231A" }}
        >
          <div
            className="font-sans uppercase"
            style={{
              fontSize: 10.5,
              letterSpacing: "0.08em",
              color: "rgba(245,241,232,0.55)",
              fontWeight: 500,
              marginBottom: 10,
            }}
          >
            Pair a new display
          </div>
          <div className="text-h2" style={{ fontSize: 17, color: "#F5F1E8" }}>
            Open{" "}
            <span
              className="font-mono"
              style={{ fontSize: 13, letterSpacing: "0.04em" }}
            >
              clarra.show/screen
            </span>{" "}
            on any screen.
          </div>
          <div className="mt-4">
            <Button
              variant="onDark"
              size="sm"
              icon="plus"
              onClick={() => setPairOpen(true)}
            >
              Enter code
            </Button>
          </div>
        </div>

        <FleetHealth
          total={initialDisplays.length}
          online={online.length}
          offline={offline.length}
          idle={idle.length}
          active={statusFilter}
          onFilter={(f) => setStatusFilter(f)}
        />

        <HeartbeatHeatmap displays={initialDisplays} now={now} />

        <KioskKit />
      </aside>

      <PairModal open={pairOpen} onClose={() => setPairOpen(false)} />
      <RenameModal
        display={renaming}
        onClose={() => setRenaming(null)}
      />
    </div>
  );
}

function DisplayRow({
  d,
  onRename,
  now,
}: {
  d: Display;
  onRename: () => void;
  now: number;
}) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [busy, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const online = isOnline(d, now);

  function doUnpair() {
    setConfirmOpen(false);
    startTransition(async () => {
      await unpairDisplay(d.id);
      router.refresh();
    });
  }

  return (
    <>
    <ConfirmDialog
      open={confirmOpen}
      title={`Unpair ${d.name}?`}
      description="The screen reverts to its pairing code."
      confirmLabel="Unpair"
      variant="danger"
      onConfirm={doUnpair}
      onCancel={() => setConfirmOpen(false)}
    />
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="grid items-center border-b border-line"
      style={{
        gridTemplateColumns:
          "minmax(0,100px) minmax(160px,1fr) minmax(0,180px) 120px 80px",
        gap: 14,
        padding: "14px 18px",
        background: hover ? "#F5F1E8" : "transparent",
        transition: "background 120ms cubic-bezier(0.2,0,0,1)",
      }}
    >
      <div
        className="rounded-[2px] border"
        style={{
          width: 100,
          height: 58,
          background: online ? "#19231A" : "#EEE9DB",
          borderColor: "rgba(25,35,26,0.08)",
        }}
      />
      <div className="min-w-0">
        <div className="truncate text-[14.5px] font-medium tracking-[-0.008em] text-ink">
          {d.name}
        </div>
        <div className="mt-[2px] truncate text-[12px] tracking-[-0.005em] text-muted">
          {d.room ?? d.location ?? d.screenId.slice(0, 8).toUpperCase()}
        </div>
      </div>
      <div className="min-w-0 truncate text-[12.5px] tracking-[-0.005em] text-ink">
        {d.currentSlideshowId ? "Live" : "No slideshow"}
      </div>
      <div>
        <StatusText status={online ? "online" : "offline"} />
      </div>
      <div className="flex items-center justify-end gap-[2px]">
        {hover ? (
          <>
            <button
              onClick={onRename}
              disabled={busy}
              className="cursor-pointer rounded-[4px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-ink disabled:opacity-40"
              aria-label="Rename"
            >
              <Icon name="pencil-simple" size={14} />
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={busy}
              className="cursor-pointer rounded-[4px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-[#8B3A2F] disabled:opacity-40"
              aria-label="Unpair"
            >
              <Icon name="trash" size={14} />
            </button>
          </>
        ) : (
          <div className="text-right text-[11px] tracking-[-0.005em] text-muted">
            {d.lastHeartbeat ? timeAgo(d.lastHeartbeat) : "—"}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

function RenameModal({
  display,
  onClose,
}: {
  display: Display | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, startTransition] = useTransition();

  if (!display) return null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await renameDisplay({ displayId: display!.id, name });
      router.refresh();
      onClose();
    });
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.42)", backdropFilter: "blur(6px)" }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="w-full max-w-[420px] overflow-hidden rounded-[6px] border border-line bg-surface"
        style={{ boxShadow: "0 24px 56px -16px rgba(14,20,16,0.4)" }}
      >
        <div className="flex items-center justify-between border-b border-line p-[18px_22px]">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
              Rename display
            </div>
            <div className="text-h2 mt-1" style={{ fontSize: 20 }}>
              {display.name}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-[6px] text-muted hover:text-ink"
            aria-label="Close"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-[22px]">
          <label className="flex flex-col gap-1">
            <span className="text-label">New name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={display.name}
              autoFocus
              required
            />
          </label>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={busy || !name.trim()}
            >
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sidebar modules
// ─────────────────────────────────────────────────────────────────────────

function FleetHealth({
  total,
  online,
  offline,
  idle,
  active,
  onFilter,
}: {
  total: number;
  online: number;
  offline: number;
  idle: number;
  active: StatusFilter;
  onFilter: (f: StatusFilter) => void;
}) {
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);

  return (
    <div className="rounded-[4px] border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-label">Fleet health</div>
        {active !== "all" && (
          <button
            onClick={() => onFilter("all")}
            className="cursor-pointer font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>

      <div
        className="flex overflow-hidden rounded-[3px]"
        style={{ height: 8, background: "#EEE9DB" }}
        aria-label={`${online} online, ${offline} offline, ${idle} idle`}
      >
        {online > 0 && (
          <div
            style={{ width: `${pct(online - idle)}%`, background: "#3B5A41" }}
            title={`${online - idle} playing`}
          />
        )}
        {idle > 0 && (
          <div
            style={{ width: `${pct(idle)}%`, background: "#8B6B2F" }}
            title={`${idle} idle (online, no slideshow)`}
          />
        )}
        {offline > 0 && (
          <div
            style={{ width: `${pct(offline)}%`, background: "#8B3A2F" }}
            title={`${offline} offline`}
          />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-[2px]">
        <FleetRow
          dot="#3B5A41"
          label="Online"
          count={online}
          active={active === "online"}
          onClick={() =>
            onFilter(active === "online" ? "all" : "online")
          }
        />
        <FleetRow
          dot="#8B6B2F"
          label="Idle"
          count={idle}
          active={active === "idle"}
          onClick={() => onFilter(active === "idle" ? "all" : "idle")}
          subtle
        />
        <FleetRow
          dot="#8B3A2F"
          label="Offline"
          count={offline}
          active={active === "offline"}
          onClick={() =>
            onFilter(active === "offline" ? "all" : "offline")
          }
        />
      </div>
    </div>
  );
}

function FleetRow({
  dot,
  label,
  count,
  active,
  onClick,
  subtle,
}: {
  dot: string;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  subtle?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={count === 0 && !active}
      className="group flex cursor-pointer items-center justify-between rounded-[4px] px-2 py-[6px] text-left disabled:cursor-default disabled:opacity-50"
      style={{
        background: active ? "rgba(25,35,26,0.06)" : "transparent",
      }}
    >
      <span className="flex items-center gap-[8px]">
        <span
          className="inline-block rounded-full"
          style={{ width: 7, height: 7, background: dot }}
        />
        <span
          className="text-[12.5px] tracking-[-0.005em]"
          style={{ color: subtle ? "var(--muted)" : "var(--ink)" }}
        >
          {label}
        </span>
      </span>
      <span className="flex items-center gap-[6px] text-[12.5px] font-medium tracking-[-0.005em] text-ink">
        {count}
        <Icon
          name="arrow-right"
          size={11}
          style={{
            opacity: count === 0 ? 0 : active ? 1 : 0,
            transition: "opacity 120ms",
          }}
        />
      </span>
    </button>
  );
}

function HeartbeatHeatmap({
  displays,
  now,
}: {
  displays: Display[];
  now: number;
}) {
  // Build a 7-row × 24-col matrix, row 0 = 6 days ago, row 6 = today.
  const { matrix, max, totalPings, dayLabels } = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0),
    );
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    let max = 0;
    let totalPings = 0;
    for (const d of displays) {
      const map = d.uptimeByHour ?? {};
      for (const [key, count] of Object.entries(map)) {
        // key: "YYYY-MM-DDTHH" — interpret as UTC, display in local
        const ts = Date.parse(`${key}:00:00Z`);
        if (Number.isNaN(ts)) continue;
        const dayStart = new Date(ts);
        dayStart.setHours(0, 0, 0, 0);
        const daysAgo = Math.round(
          (todayMs - dayStart.getTime()) / (24 * 60 * 60 * 1000),
        );
        if (daysAgo < 0 || daysAgo > 6) continue;
        const rowIdx = 6 - daysAgo;
        const hr = new Date(ts).getHours();
        matrix[rowIdx][hr] += count;
        totalPings += count;
        if (matrix[rowIdx][hr] > max) max = matrix[rowIdx][hr];
      }
    }
    const dayLabels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(todayMs);
      dt.setDate(dt.getDate() - i);
      dayLabels.push(
        dt.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2),
      );
    }
    return { matrix, max, totalPings, dayLabels };
  }, [displays, now]);

  const empty = totalPings === 0;

  return (
    <div className="rounded-[4px] border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-label">Heartbeat · 7 days</div>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted">
          {empty ? "No data" : `${totalPings.toLocaleString()} pings`}
        </div>
      </div>

      {empty ? (
        <div className="rounded-[3px] border border-dashed border-line px-3 py-4 text-center text-[11.5px] leading-[1.5] tracking-[-0.005em] text-muted">
          Collecting data — displays build this as they ping every 30 seconds.
        </div>
      ) : (
        <>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "16px repeat(24, minmax(0, 1fr))",
              columnGap: 2,
              rowGap: 2,
            }}
            role="img"
            aria-label="Heatmap of heartbeats, last 7 days by hour of day"
          >
            {matrix.map((row, rowIdx) => (
              <Fragment key={rowIdx}>
                <div
                  className="font-mono text-[9px] uppercase tracking-[0.04em] text-muted-2"
                  style={{ lineHeight: "10px", paddingTop: 1 }}
                >
                  {dayLabels[rowIdx]}
                </div>
                {row.map((v, hr) => (
                  <div
                    key={hr}
                    title={`${dayLabels[rowIdx]} ${String(hr).padStart(2, "0")}:00 — ${v} ping${v === 1 ? "" : "s"}`}
                    className="rounded-[1.5px]"
                    style={{
                      aspectRatio: "1 / 1",
                      background: cellColor(v, max),
                    }}
                  />
                ))}
              </Fragment>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted-2">
            <span>0h</span>
            <span className="flex items-center gap-[3px]">
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <span
                  key={t}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 1.5,
                    background: cellColor(t * max || (t === 0 ? 0 : 1), max),
                    display: "inline-block",
                  }}
                />
              ))}
            </span>
            <span>23h</span>
          </div>
        </>
      )}
    </div>
  );
}

function cellColor(v: number, max: number) {
  if (max === 0 || v === 0) return "#EEE9DB";
  const t = Math.min(1, v / max);
  // interpolate surface-sunk → moss
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  const r = mix(0xee, 0x3b);
  const g = mix(0xe9, 0x5a);
  const b = mix(0xdb, 0x41);
  return `rgb(${r}, ${g}, ${b})`;
}

const KIOSK_RECS: {
  name: string;
  tagline: string;
  url: string;
  price: string;
}[] = [
  {
    name: "Amazon Fire TV Stick 4K Max",
    tagline: "Cheapest reliable kiosk — Silk browser runs Clarra well.",
    url: "https://www.amazon.com/dp/B0BW1YXCD6?tag=clarra-20",
    price: "~$60",
  },
  {
    name: "Mac mini (M4)",
    tagline: "Silent, 4K-capable, runs 24/7 on Safari or Chrome.",
    url: "https://www.amazon.com/dp/B0DLBHB7X7?tag=clarra-20",
    price: "~$599",
  },
  {
    name: "VESA mount bundle",
    tagline: "Hides the mini behind any VESA-compatible TV.",
    url: "https://www.amazon.com/dp/B09PLHL2TY?tag=clarra-20",
    price: "~$25",
  },
];

function KioskKit() {
  return (
    <div
      className="rounded-[4px] border p-5"
      style={{
        borderColor: "var(--line)",
        background:
          "linear-gradient(180deg, #FBF8F0 0%, #F5F1E8 100%)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-label">Recommended kit</div>
        <Icon name="tag" size={12} style={{ color: "var(--muted-2)" }} />
      </div>
      <div
        className="font-serif text-ink"
        style={{
          fontSize: 17,
          fontWeight: 500,
          letterSpacing: "-0.018em",
          fontVariationSettings: "'opsz' 48",
          lineHeight: 1.3,
        }}
      >
        Need a screen? Here's what we use.
      </div>
      <div className="mt-1 text-[11.5px] leading-[1.5] tracking-[-0.005em] text-muted">
        Affiliate links — a small cut comes back to Clarra at no extra cost to
        you.
      </div>

      <div className="mt-4 flex flex-col gap-[2px]">
        {KIOSK_RECS.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="sponsored noopener"
            className="group flex items-start justify-between gap-2 rounded-[4px] px-2 py-[8px] hover:bg-[rgba(25,35,26,0.05)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-[6px]">
                <span className="truncate text-[12.5px] font-medium tracking-[-0.005em] text-ink">
                  {r.name}
                </span>
                <Icon
                  name="arrow-up-right"
                  size={11}
                  style={{
                    color: "var(--muted-2)",
                    opacity: 0.6,
                  }}
                />
              </div>
              <div className="mt-[2px] text-[11px] leading-[1.4] tracking-[-0.005em] text-muted">
                {r.tagline}
              </div>
            </div>
            <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted">
              {r.price}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}
