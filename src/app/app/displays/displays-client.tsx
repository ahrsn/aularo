"use client";

import { Fragment, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { StatusText } from "@/components/ui/status-dot";
import { PairModal } from "@/components/pair-modal";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useMountTransition } from "@/components/ui/motion";
import {
  checkShortCodeAvailable,
  clearDisplayShortCode,
  createPreassignedDisplay,
  refreshAllDisplays,
  renameDisplay,
  rotateDisplayShortCode,
  unpairDisplay,
} from "@/lib/actions";
import { humanizeError, toErrorState, type ErrorState } from "@/lib/errors";
import { useToast } from "@/components/ui/toast";
import type { Display } from "@/lib/schema";

type StatusFilter = "all" | "online" | "offline" | "idle";

function isOnline(d: Display, nowMs: number) {
  if (d.status === "online") return true;
  if (!d.lastHeartbeat) return false;
  return nowMs - d.lastHeartbeat < 90_000;
}

export function DisplaysClient({
  initialDisplays,
  workspaceSlug,
}: {
  initialDisplays: Display[];
  workspaceSlug: string | null;
}) {
  const router = useRouter();
  const [pairOpen, setPairOpen] = useState(false);
  const [preassignOpen, setPreassignOpen] = useState(false);
  const [rotating, setRotating] = useState<Display | null>(null);
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
              variant="ghost"
              icon="plus"
              onClick={() => setPreassignOpen(true)}
              title="Create a display with a short code anyone can type"
            >
              New display
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
                onRotateCode={() => setRotating(d)}
                workspaceSlug={workspaceSlug}
                now={now}
              />
            ))
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-4 self-start">
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
      <PreassignModal
        open={preassignOpen}
        onClose={() => setPreassignOpen(false)}
        workspaceSlug={workspaceSlug}
      />
      <RotateCodeModal
        display={rotating}
        workspaceSlug={workspaceSlug}
        onClose={() => setRotating(null)}
      />
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
  onRotateCode,
  workspaceSlug,
  now,
}: {
  d: Display;
  onRename: () => void;
  onRotateCode: () => void;
  workspaceSlug: string | null;
  now: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [hover, setHover] = useState(false);
  const [busy, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const online = isOnline(d, now);

  function doUnpair() {
    setConfirmOpen(false);
    startTransition(async () => {
      try {
        await unpairDisplay(d.id);
        toast.success("Display removed");
        router.refresh();
      } catch (e) {
        toast.error(e, "Couldn't unpair display.");
      }
    });
  }

  function copyClaimUrl() {
    if (!workspaceSlug || !d.shortCode) return;
    const url = `${window.location.origin}/d/${workspaceSlug}/${d.shortCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
        <div className="flex items-center gap-2">
          <span className="truncate text-[14.5px] font-medium tracking-[-0.008em] text-ink">
            {d.name}
          </span>
          {d.shortCode && (
            <button
              onClick={copyClaimUrl}
              disabled={!workspaceSlug}
              title={
                workspaceSlug
                  ? `Copy ${window.location.origin}/d/${workspaceSlug}/${d.shortCode}`
                  : "Set a workspace slug first"
              }
              className="cursor-pointer rounded-[3px] border border-line bg-paper px-[6px] py-[1px] font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink hover:bg-[rgba(25,35,26,0.06)] disabled:cursor-default disabled:opacity-60"
            >
              {copied ? "Copied" : d.shortCode}
            </button>
          )}
        </div>
        <div className="mt-[2px] truncate text-[12px] tracking-[-0.005em] text-muted">
          {d.room ??
            d.location ??
            (d.screenId
              ? d.screenId.slice(0, 8).toUpperCase()
              : "Awaiting screen")}
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
              onClick={onRotateCode}
              disabled={busy}
              className="cursor-pointer rounded-[4px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-ink disabled:opacity-40"
              aria-label="Rotate short code"
              title="Short code"
            >
              <Icon name="hash" size={14} />
            </button>
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
  const toast = useToast();
  const [name, setName] = useState("");
  const [busy, startTransition] = useTransition();
  const [cached, setCached] = useState<Display | null>(null);
  useEffect(() => {
    if (display) setCached(display);
  }, [display]);
  const { mounted, state } = useMountTransition(display !== null, 320);

  if (!mounted || !cached) return null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !cached) return;
    startTransition(async () => {
      try {
        await renameDisplay({ displayId: cached.id, name });
        toast.success("Display renamed");
        router.refresh();
        onClose();
      } catch (e) {
        toast.error(e, "Couldn't rename display.");
      }
    });
  }

  return (
    <div
      data-motion="overlay"
      data-state={state}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.55)", left: "var(--overlay-left, 0px)" }}
    >
      <form
        data-motion="panel"
        data-state={state}
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
              {cached.name}
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
              placeholder={cached.name}
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
  icon: string;
}[] = [
  {
    name: "Fire TV Stick 4K Max",
    tagline: "Cheapest reliable kiosk. Silk browser runs Clarra well.",
    url: "https://www.amazon.com/dp/B0BW1YXCD6?tag=clarra-20",
    price: "60",
    icon: "device-tablet-speaker",
  },
  {
    name: "Mac mini (M4)",
    tagline: "Silent, 4K-capable, runs 24/7 on Safari or Chrome.",
    url: "https://www.amazon.com/dp/B0DLBHB7X7?tag=clarra-20",
    price: "599",
    icon: "desktop",
  },
  {
    name: "VESA mount bundle",
    tagline: "Hides the mini behind any VESA-compatible TV.",
    url: "https://www.amazon.com/dp/B09PLHL2TY?tag=clarra-20",
    price: "25",
    icon: "push-pin",
  },
];

function KioskKit() {
  return (
    <div
      className="relative overflow-hidden rounded-[5px] border"
      style={{
        borderColor: "var(--line)",
        background: "var(--surface)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-baseline justify-between border-b border-line"
        style={{ padding: "14px 16px 12px" }}
      >
        <div className="flex items-center gap-[6px]">
          <Icon
            name="tag"
            size={10}
            style={{ color: "var(--moss)", opacity: 0.75 }}
          />
          <span className="text-label" style={{ letterSpacing: "0.09em" }}>
            The kit
          </span>
        </div>
        <span
          className="font-mono uppercase"
          style={{
            fontSize: 9,
            letterSpacing: "0.08em",
            color: "var(--muted-2)",
          }}
        >
          {KIOSK_RECS.length} picks
        </span>
      </div>

      {/* Title */}
      <div style={{ padding: "16px 16px 4px" }}>
        <div
          className="font-serif text-ink"
          style={{
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            fontVariationSettings: "'opsz' 48",
            lineHeight: 1.25,
          }}
        >
          What we put on our walls.
        </div>
        <div className="mt-[6px] text-[11.5px] leading-[1.5] tracking-[-0.005em] text-muted">
          Hardware we&rsquo;ve tested and trust for Clarra screens.
        </div>
      </div>

      {/* Items */}
      <ol className="mt-3 flex flex-col">
        {KIOSK_RECS.map((r, i) => (
          <li key={r.name}>
            <a
              href={r.url}
              target="_blank"
              rel="sponsored noopener"
              className="group relative flex items-center gap-[12px] border-t border-line transition-[background] duration-quiet ease-quiet hover:bg-[rgba(25,35,26,0.035)]"
              style={{ padding: "12px 16px" }}
            >
              {/* Index */}
              <span
                aria-hidden
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: "var(--muted-2)",
                  letterSpacing: "0.04em",
                  width: 16,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon chip */}
              <span
                className="flex shrink-0 items-center justify-center rounded-[4px] transition-colors duration-quiet ease-quiet group-hover:bg-moss-soft"
                style={{
                  width: 28,
                  height: 28,
                  background: "var(--surface-sunk)",
                  color: "var(--ink)",
                }}
              >
                <Icon name={r.icon} size={14} />
              </span>

              {/* Text */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-[6px]">
                  <span className="truncate text-[13px] font-medium tracking-[-0.008em] text-ink">
                    {r.name}
                  </span>
                  <Icon
                    name="arrow-up-right"
                    size={11}
                    style={{ color: "var(--muted-2)" }}
                    className="shrink-0 opacity-0 transition-opacity duration-quiet ease-quiet group-hover:opacity-100"
                  />
                </div>
                <div className="mt-[1px] line-clamp-1 text-[11px] leading-[1.4] tracking-[-0.003em] text-muted">
                  {r.tagline}
                </div>
              </div>

              {/* Price */}
              <div
                className="shrink-0 rounded-[3px] border px-[7px] py-[3px] font-mono"
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.02em",
                  borderColor: "var(--line)",
                  background: "var(--paper)",
                  color: "var(--ink)",
                }}
              >
                <span style={{ color: "var(--muted-2)" }}>$</span>
                {r.price}
              </div>
            </a>
          </li>
        ))}
      </ol>

      {/* Footnote */}
      <div
        className="border-t border-line"
        style={{
          padding: "9px 16px 10px",
          background: "var(--paper)",
        }}
      >
        <div className="flex items-center gap-[6px] text-[10.5px] leading-[1.4] tracking-[-0.003em] text-muted">
          <Icon
            name="info"
            size={10}
            style={{ color: "var(--muted-2)", flexShrink: 0 }}
          />
          <span>
            Affiliate links — no cost to you, small cut to Clarra.
          </span>
        </div>
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

// ─────────────────────────────────────────────────────────────────────────
// Pre-assign modal — create a display with a human-typable short code
// ─────────────────────────────────────────────────────────────────────────

type CreatedResult = {
  displayId: string;
  shortCode: string;
  workspaceSlug: string;
};

function PreassignModal({
  open,
  onClose,
  workspaceSlug,
}: {
  open: boolean;
  onClose: () => void;
  workspaceSlug: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [busy, startTransition] = useTransition();
  const [err, setErr] = useState<ErrorState | null>(null);
  const [created, setCreated] = useState<CreatedResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setCode("");
      setCodeState("idle");
      setErr(null);
      setCreated(null);
      setCopied(false);
    }
  }, [open]);

  // Debounced availability check.
  useEffect(() => {
    if (!code) {
      setCodeState("idle");
      return;
    }
    if (!/^[A-Z0-9]{4,12}$/.test(code)) {
      setCodeState("invalid");
      return;
    }
    setCodeState("checking");
    const t = setTimeout(async () => {
      try {
        const res = await checkShortCodeAvailable({ shortCode: code });
        setCodeState(res.available ? "available" : "taken");
      } catch {
        setCodeState("idle");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [code]);

  const { mounted, state } = useMountTransition(open, 320);
  if (!mounted) return null;

  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  const canSubmit =
    name.trim().length >= 1 &&
    (code === "" || codeState === "available") &&
    !busy;

  function onGenerate() {
    // Light-weight client-side generator; server regenerates on collision.
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 5; i++)
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    setCode(out);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !workspaceSlug) return;
    setErr(null);
    startTransition(async () => {
      try {
        const result = await createPreassignedDisplay({
          name: name.trim(),
          shortCode: normalized || undefined,
        });
        setCreated(result);
        toast.success("Display created");
        router.refresh();
      } catch (e) {
        if (e instanceof Error && e.message === "CODE_TAKEN") {
          setCodeState("taken");
        } else {
          setErr(toErrorState(e, "Couldn't create display."));
        }
      }
    });
  }

  function copyUrl() {
    if (!created) return;
    const url = `${window.location.origin}/d/${created.workspaceSlug}/${created.shortCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const claimUrl = created
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/d/${created.workspaceSlug}/${created.shortCode}`
    : null;

  return (
    <div
      data-motion="overlay"
      data-state={state}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.55)", left: "var(--overlay-left, 0px)" }}
    >
      <form
        data-motion="panel"
        data-state={state}
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="w-full max-w-[520px] overflow-hidden rounded-[6px] border border-line bg-surface"
        style={{ boxShadow: "0 24px 56px -16px rgba(14,20,16,0.4)" }}
      >
        <div className="flex items-center justify-between border-b border-line p-[18px_22px]">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
              New display
            </div>
            <div className="text-h2 mt-1" style={{ fontSize: 22 }}>
              {created ? "Display ready to pair" : "Add a display anyone can pair"}
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

        {!created && !workspaceSlug && (
          <div className="flex flex-col gap-4 p-[22px]">
            <div
              className="rounded-[4px] border p-[14px_16px]"
              style={{
                borderColor: "rgba(139,107,47,0.28)",
                background: "rgba(243,235,216,0.6)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "#F3EBD8", color: "#8B6B2F" }}
                >
                  <Icon name="warning" size={14} />
                </div>
                <div>
                  <div
                    className="font-serif text-ink"
                    style={{ fontSize: 16, letterSpacing: "-0.018em" }}
                  >
                    Set a workspace slug first.
                  </div>
                  <div className="mt-1 text-[12.5px] leading-[1.5] tracking-[-0.005em] text-muted">
                    Pre-assigned displays use URLs like{" "}
                    <span className="font-mono text-[11.5px]">
                      /d/your-slug/LOBBY
                    </span>
                    . Without a slug there&rsquo;s nothing to type.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Link href="/app/settings/workspace">
                <Button variant="primary" type="button" iconRight="arrow-right">
                  Go to settings
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!created && workspaceSlug && (
          <div className="flex flex-col gap-4 p-[22px]">
            <p className="font-serif text-[14.5px] leading-[1.5] text-[#3A433B]">
              Whoever&rsquo;s at the TV types{" "}
              <span className="rounded bg-[rgba(25,35,26,0.07)] px-[7px] py-[2px] font-mono text-[12.5px]">
                {typeof window !== "undefined" ? window.location.host : ""}/d/{workspaceSlug}/CODE
              </span>
              . No login, no admin access.
            </p>

            <label className="flex flex-col gap-1">
              <span className="text-label">Display name</span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lobby TV, Ballroom Left"
                autoFocus
                required
              />
            </label>

            <div className="flex flex-col gap-[6px]">
              <span className="text-label">Short code</span>
              <div
                className="group flex items-center rounded-[4px] border bg-paper transition-colors focus-within:border-moss"
                style={{
                  borderColor:
                    codeState === "taken" || codeState === "invalid"
                      ? "rgba(139,58,47,0.45)"
                      : "var(--line)",
                }}
              >
                <input
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 12),
                    )
                  }
                  placeholder="LOBBY"
                  inputMode="text"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="flex-1 bg-transparent px-3 py-[10px] font-mono text-[18px] uppercase tracking-[0.1em] text-ink outline-none placeholder:text-muted-2"
                />
                <InlineCodeStatus state={codeState} />
                <button
                  type="button"
                  onClick={onGenerate}
                  className="flex cursor-pointer items-center gap-[5px] border-l border-line px-[12px] py-[10px] font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted hover:bg-[rgba(25,35,26,0.04)] hover:text-ink"
                  title="Auto-generate a random code"
                >
                  <Icon name="arrows-clockwise" size={11} />
                  Generate
                </button>
              </div>
              <div className="text-[11.5px] tracking-[-0.005em] text-muted">
                {codeState === "taken"
                  ? "That code is already used by another display."
                  : codeState === "invalid"
                    ? "Use 4-12 letters or numbers."
                    : "4-12 letters or numbers. Leave blank to auto-generate."}
              </div>
            </div>

            {err && (
              <div className="rounded-[4px] bg-[rgba(139,58,47,0.08)] px-3 py-2 text-[12.5px] text-[#8B3A2F]">
                {err.text}
                {err.upgrade && (
                  <>
                    {" "}
                    <Link
                      href="/app/settings/billing"
                      className="font-medium underline hover:opacity-80"
                      onClick={onClose}
                    >
                      Upgrade plan →
                    </Link>
                  </>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!canSubmit || !workspaceSlug}
              >
                {busy ? "Creating…" : "Create display"}
              </Button>
            </div>
          </div>
        )}

        {created && claimUrl && (
          <div className="flex flex-col gap-4 p-[22px]">
            <div className="rounded-[4px] border border-line bg-paper p-[14px_16px]">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
                Pair URL
              </div>
              <div
                className="mt-1 truncate font-mono text-[13px] text-ink"
                title={claimUrl}
              >
                {claimUrl}
              </div>
            </div>
            <p className="font-serif text-[14.5px] leading-[1.5] text-[#3A433B]">
              Print this, text it, or drop it on the run-of-show sheet. Anyone
              who types it into a browser will pair that TV to{" "}
              <span className="font-medium">{name}</span> and start playing
              instantly.
            </p>
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="ghost" type="button" onClick={copyUrl}>
                {copied ? "Copied" : "Copy URL"}
              </Button>
              <Button variant="primary" type="button" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function InlineCodeStatus({
  state,
}: {
  state: "idle" | "checking" | "available" | "taken" | "invalid";
}) {
  if (state === "idle") return null;
  const map = {
    checking: { label: "Checking", color: "var(--muted)", dot: "#B8B2A3" },
    available: { label: "Available", color: "#3B5A41", dot: "#3B5A41" },
    taken: { label: "Taken", color: "#8B3A2F", dot: "#8B3A2F" },
    invalid: { label: "Invalid", color: "#8B6B2F", dot: "#8B6B2F" },
  } as const;
  const entry = map[state];
  return (
    <div
      className="flex shrink-0 items-center gap-[6px] px-[10px] font-mono text-[10.5px] uppercase tracking-[0.06em]"
      style={{ color: entry.color }}
    >
      <span
        className="inline-block rounded-full"
        style={{ width: 6, height: 6, background: entry.dot }}
      />
      {entry.label}
    </div>
  );
}

function CodeStatusChip({
  state,
}: {
  state: "idle" | "checking" | "available" | "taken" | "invalid";
}) {
  if (state === "idle")
    return (
      <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-2">
        —
      </div>
    );
  const map = {
    checking: { label: "Checking", color: "var(--muted)" },
    available: { label: "Available", color: "#3B5A41" },
    taken: { label: "Taken", color: "#8B3A2F" },
    invalid: { label: "Invalid", color: "#8B6B2F" },
  } as const;
  const entry = map[state];
  return (
    <div
      className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.06em]"
      style={{ color: entry.color }}
    >
      {entry.label}
    </div>
  );
}

function RotateCodeModal({
  display,
  workspaceSlug,
  onClose,
}: {
  display: Display | null;
  workspaceSlug: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [busy, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [cached, setCached] = useState<Display | null>(null);
  const { mounted, state } = useMountTransition(display !== null, 320);

  useEffect(() => {
    if (display) {
      setCached(display);
      setCode("");
      setCodeState("idle");
      setErr(null);
    }
  }, [display]);

  useEffect(() => {
    if (!code) {
      setCodeState("idle");
      return;
    }
    if (!/^[A-Z0-9]{4,12}$/.test(code)) {
      setCodeState("invalid");
      return;
    }
    if (display?.shortCode === code) {
      setCodeState("available");
      return;
    }
    setCodeState("checking");
    const t = setTimeout(async () => {
      try {
        const res = await checkShortCodeAvailable({ shortCode: code });
        setCodeState(res.available ? "available" : "taken");
      } catch {
        setCodeState("idle");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [code, display?.shortCode]);

  if (!mounted || !cached) return null;

  function doRotate(newCode?: string) {
    setErr(null);
    startTransition(async () => {
      try {
        await rotateDisplayShortCode({
          displayId: cached!.id,
          newShortCode: newCode,
        });
        toast.success("Short code rotated");
        router.refresh();
        onClose();
      } catch (e) {
        if (e instanceof Error && e.message === "CODE_TAKEN") {
          setCodeState("taken");
        } else {
          setErr(humanizeError(e, "Couldn't rotate code."));
          toast.error(e, "Couldn't rotate code.");
        }
      }
    });
  }

  function doClear() {
    setErr(null);
    startTransition(async () => {
      try {
        await clearDisplayShortCode(cached!.id);
        toast.success("Short code removed");
        router.refresh();
        onClose();
      } catch (e) {
        setErr(humanizeError(e, "Couldn't remove code."));
        toast.error(e, "Couldn't remove code.");
      }
    });
  }

  const canSubmit =
    code.length > 0 && (codeState === "available") && !busy;

  return (
    <div
      data-motion="overlay"
      data-state={state}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.55)", left: "var(--overlay-left, 0px)" }}
    >
      <div
        data-motion="panel"
        data-state={state}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] overflow-hidden rounded-[6px] border border-line bg-surface"
        style={{ boxShadow: "0 24px 56px -16px rgba(14,20,16,0.4)" }}
      >
        <div className="flex items-center justify-between border-b border-line p-[18px_22px]">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
              Short code
            </div>
            <div className="text-h2 mt-1" style={{ fontSize: 20 }}>
              {cached.name}
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
          <div className="flex flex-col gap-1">
            <div className="text-label">Current code</div>
            <div className="font-mono text-[18px] tracking-[0.08em] text-ink">
              {cached.shortCode ?? "—"}
            </div>
            {workspaceSlug && cached.shortCode && (
              <div className="truncate font-mono text-[11px] tracking-[0.04em] text-muted">
                {typeof window !== "undefined" ? window.location.host : ""}/d/{workspaceSlug}/{cached.shortCode}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-[6px]">
            <div className="text-label">Rotate to</div>
            <div
              className="flex items-center rounded-[4px] border bg-paper transition-colors focus-within:border-moss"
              style={{
                borderColor:
                  codeState === "taken" || codeState === "invalid"
                    ? "rgba(139,58,47,0.45)"
                    : "var(--line)",
              }}
            >
              <input
                value={code}
                onChange={(e) =>
                  setCode(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 12),
                  )
                }
                placeholder="Leave blank to auto-generate"
                inputMode="text"
                autoCapitalize="characters"
                spellCheck={false}
                className="flex-1 bg-transparent px-3 py-[10px] font-mono text-[16px] uppercase tracking-[0.1em] text-ink outline-none placeholder:text-muted-2"
              />
              <InlineCodeStatus state={codeState} />
            </div>
            <div className="text-[11.5px] tracking-[-0.005em] text-muted">
              {codeState === "taken"
                ? "That code is already used by another display."
                : codeState === "invalid"
                  ? "Use 4-12 letters or numbers."
                  : "The old code stops working immediately. Any screen already paired keeps running."}
            </div>
          </div>

          {err && (
            <div className="rounded-[4px] bg-[rgba(139,58,47,0.08)] px-3 py-2 text-[12.5px] text-[#8B3A2F]">
              {err}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-line pt-4">
            <Button
              variant="ghost"
              type="button"
              onClick={doClear}
              disabled={busy || !cached.shortCode}
            >
              Remove code
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => doRotate(undefined)}
                disabled={busy}
              >
                Auto-generate
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={() => doRotate(code)}
                disabled={!canSubmit}
              >
                {busy ? "Rotating…" : "Rotate"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
