"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StatusText, type DisplayStatus } from "@/components/ui/status-dot";
import { Eyebrow } from "@/components/ui/label";
import { SlideshowSettingsModal } from "@/components/slideshow-settings/modal";
import { EventCreateModal } from "@/components/library/event-create-modal";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import {
  createSlideshow,
  deleteSlideshow,
  setSlideshowEvent,
} from "@/lib/actions";
import type { Display, EventDoc, Slideshow } from "@/lib/schema";

type Filter = "All" | "Playing" | "Drafts" | "Paused";
const filters: Filter[] = ["All", "Playing", "Drafts", "Paused"];

const UNASSIGNED = "__unassigned";

export function LibraryClient({
  initialSlideshows,
  displays,
  events,
}: {
  initialSlideshows: Slideshow[];
  displays: Display[];
  events: EventDoc[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const urlEvent = params?.get("event") ?? null;
  const [filter, setFilter] = useState<Filter>("All");
  // Active event is derived from the URL so the sidebar (which also reads
  // ?event=) can navigate to the filtered view directly.
  const activeEvent: string =
    urlEvent === "unassigned"
      ? UNASSIGNED
      : urlEvent && events.some((e) => e.id === urlEvent)
        ? urlEvent
        : (events[0]?.id ?? UNASSIGNED);

  function setActiveEvent(eventId: string) {
    const next = new URLSearchParams(params?.toString() ?? "");
    next.set("event", eventId === UNASSIGNED ? "unassigned" : eventId);
    router.replace(`/app/library?${next.toString()}`);
  }

  // Sync URL when active event was resolved via fallback so the sidebar
  // (which reads ?event=) highlights the correct item.
  useEffect(() => {
    if (urlEvent) return;
    if (activeEvent === UNASSIGNED) return;
    const next = new URLSearchParams(params?.toString() ?? "");
    next.set("event", activeEvent);
    router.replace(`/app/library?${next.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlEvent, activeEvent]);
  const [settingsFor, setSettingsFor] = useState<Slideshow | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const eventShows = useMemo(
    () =>
      initialSlideshows.filter((s) =>
        activeEvent === UNASSIGNED ? !s.eventId : s.eventId === activeEvent,
      ),
    [initialSlideshows, activeEvent],
  );

  const visible = useMemo(() => {
    if (filter === "All") return eventShows;
    if (filter === "Playing") return eventShows.filter((s) => s.status === "live");
    if (filter === "Drafts") return eventShows.filter((s) => s.status === "draft");
    return eventShows.filter((s) => s.status === "paused");
  }, [eventShows, filter]);

  const liveSlideshows = eventShows.filter((s) => s.status === "live");

  // Build "now playing" strip: which displays are running which slideshow?
  const displayByAssignment = new Map<string, Display[]>();
  for (const d of displays) {
    if (!d.currentSlideshowId) continue;
    const list = displayByAssignment.get(d.currentSlideshowId) ?? [];
    list.push(d);
    displayByAssignment.set(d.currentSlideshowId, list);
  }
  const nowPlaying = liveSlideshows.filter((s) =>
    displayByAssignment.has(s.id),
  );

  async function onNew() {
    const name = window.prompt("Slideshow name?");
    if (!name) return;
    startTransition(async () => {
      const { id } = await createSlideshow({ name });
      if (activeEvent !== UNASSIGNED) {
        await setSlideshowEvent({ slideshowId: id, eventId: activeEvent });
      }
      router.refresh();
    });
  }

  function onDelete(id: string) {
    setDeleteId(id);
  }

  function doDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    startTransition(async () => {
      await deleteSlideshow(id);
      router.refresh();
    });
  }

  const currentEvent =
    activeEvent === UNASSIGNED
      ? null
      : (events.find((e) => e.id === activeEvent) ?? null);

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
        {/* Now playing strip — only shown when there are live shows for this event */}
        {nowPlaying.length > 0 && (
          <NowStrip shows={nowPlaying} assignments={displayByAssignment} />
        )}

        {/* Event title + filters */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-label mb-[6px]">Event</div>
            <h2
              className="m-0 font-serif text-ink"
              style={{
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: "-0.022em",
                fontVariationSettings: "'opsz' 48",
              }}
            >
              {currentEvent
                ? currentEvent.name
                : activeEvent === UNASSIGNED
                  ? "Unassigned slideshows"
                  : "—"}
            </h2>
            <div className="mt-[2px] text-[12.5px] tracking-[-0.005em] text-muted">
              {currentEvent
                ? formatDateRange(currentEvent.startAt, currentEvent.endAt)
                : "Slideshows not tied to any event"}
            </div>
          </div>
          <div className="flex gap-[2px]">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="cursor-pointer rounded-[4px] border border-transparent px-3 py-[6px] text-[12.5px] font-medium tracking-[-0.005em]"
                style={{
                  background: filter === f ? "#19231A" : "transparent",
                  color: filter === f ? "#F5F1E8" : "#0E1410",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="overflow-hidden rounded-[4px] border border-line bg-surface">
          <div
            className="grid items-center border-b border-line bg-paper text-muted"
            style={{
              gridTemplateColumns:
                "minmax(0,88px) minmax(160px,1fr) minmax(0,140px) 100px 100px 84px",
              gap: 14,
              padding: "10px 18px",
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <div></div>
            <div>Slideshow</div>
            <div>Display</div>
            <div>Status</div>
            <div>Updated</div>
            <div></div>
          </div>
          {visible.map((s) => (
            <SlideshowRow
              key={s.id}
              s={s}
              displaysById={displayByAssignment.get(s.id) ?? []}
              onDelete={() => onDelete(s.id)}
              onOpenSettings={() => setSettingsFor(s)}
            />
          ))}
          {visible.length === 0 && (
            <div className="py-14 text-center">
              <div className="text-h2" style={{ fontSize: 20 }}>
                Nothing here yet.
              </div>
              <div className="mt-1 text-[13px] tracking-[-0.005em] text-muted">
                {eventShows.length === 0
                  ? "Add a slideshow to this event."
                  : "Try a different filter."}
              </div>
              <div className="mt-6 flex justify-center">
                <Button
                  variant="primary"
                  size="md"
                  icon="plus"
                  onClick={onNew}
                  disabled={pending}
                >
                  New slideshow
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-5">
        <div>
          <div className="mb-[10px] flex items-center justify-between">
            <Eyebrow>Your events</Eyebrow>
            <button
              type="button"
              onClick={() => setEventModalOpen(true)}
              className="cursor-pointer rounded-[4px] p-[4px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-ink"
              aria-label="New event"
            >
              <Icon name="plus" size={13} />
            </button>
          </div>
          <div className="flex flex-col gap-[2px]">
            {events.map((e) => {
              const sel = e.id === activeEvent;
              return (
                <button
                  key={e.id}
                  onClick={() => setActiveEvent(e.id)}
                  className="cursor-pointer rounded-[4px] text-left"
                  style={{
                    background: sel ? "#FBF8F0" : "transparent",
                    border: sel ? "1px solid var(--line)" : "1px solid transparent",
                    padding: "10px 12px",
                    fontFamily: "var(--font-geist), sans-serif",
                  }}
                >
                  <div className="flex items-center gap-2 text-[13px] font-medium tracking-[-0.005em] text-ink">
                    {sel && (
                      <span
                        className="rounded-full"
                        style={{ width: 5, height: 5, background: "#3B5A41" }}
                      />
                    )}
                    {e.name}
                  </div>
                  <div
                    className="mt-[2px] text-[11.5px] tracking-[-0.005em] text-muted"
                    style={{ paddingLeft: sel ? 13 : 0 }}
                  >
                    {formatDateRange(e.startAt, e.endAt)}
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => setActiveEvent(UNASSIGNED)}
              className="cursor-pointer rounded-[4px] text-left"
              style={{
                background: activeEvent === UNASSIGNED ? "#FBF8F0" : "transparent",
                border:
                  activeEvent === UNASSIGNED
                    ? "1px solid var(--line)"
                    : "1px solid transparent",
                padding: "10px 12px",
              }}
            >
              <div className="flex items-center gap-2 text-[13px] font-medium tracking-[-0.005em] text-ink">
                {activeEvent === UNASSIGNED && (
                  <span
                    className="rounded-full"
                    style={{ width: 5, height: 5, background: "#3B5A41" }}
                  />
                )}
                Unassigned
              </div>
              <div
                className="mt-[2px] text-[11.5px] tracking-[-0.005em] text-muted"
                style={{
                  paddingLeft: activeEvent === UNASSIGNED ? 13 : 0,
                }}
              >
                Not tied to an event
              </div>
            </button>
          </div>
        </div>

        <div className="border-t border-line pt-[18px]">
          <Eyebrow className="mb-3">This event</Eyebrow>
          <div className="flex flex-col gap-[14px]">
            {[
              {
                l: "Playing",
                v: eventShows.filter((s) => s.status === "live").length,
              },
              {
                l: "In draft",
                v: eventShows.filter((s) => s.status === "draft").length,
              },
              {
                l: "Paused",
                v: eventShows.filter((s) => s.status === "paused").length,
              },
              {
                l: "Total slides",
                v: eventShows.reduce((n, s) => n + (s.slides?.length ?? 0), 0),
              },
            ].map((r) => (
              <div
                key={r.l}
                className="flex items-baseline justify-between border-b border-line pb-3"
              >
                <div className="text-[12.5px] tracking-[-0.005em] text-muted">
                  {r.l}
                </div>
                <div
                  className="font-serif text-ink"
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: "-0.022em",
                    fontVariationSettings: "'opsz' 48",
                  }}
                >
                  {r.v}
                </div>
              </div>
            ))}
          </div>
        </div>

      </aside>

      <SlideshowSettingsModal
        open={!!settingsFor}
        onClose={() => setSettingsFor(null)}
        slideshow={settingsFor}
      />
      <EventCreateModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
      />
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this slideshow?"
        description="Slides and schedule go with it."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function NowStrip({
  shows,
  assignments,
}: {
  shows: Slideshow[];
  assignments: Map<string, Display[]>;
}) {
  return (
    <div className="overflow-hidden rounded-[4px] border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-5 py-[14px]">
        <div className="flex items-center gap-[10px]">
          <span
            className="rounded-full"
            style={{ width: 7, height: 7, background: "#3B5A41" }}
          />
          <div
            className="font-serif text-ink"
            style={{
              fontSize: 17,
              fontWeight: 500,
              letterSpacing: "-0.018em",
              fontVariationSettings: "'opsz' 48",
            }}
          >
            Playing now
          </div>
          <div className="text-[12.5px] tracking-[-0.005em] text-muted">
            {shows.length} slideshow{shows.length === 1 ? "" : "s"} ·{" "}
            {new Set(
              shows.flatMap((s) => assignments.get(s.id)?.map((d) => d.id) ?? []),
            ).size}{" "}
            display{shows.length === 1 ? "" : "s"}
          </div>
        </div>
        <Link
          href="/app/displays"
          className="text-[12.5px] tracking-[-0.005em] text-ink underline underline-offset-[3px]"
        >
          View all displays
        </Link>
      </div>
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${Math.min(shows.length, 4)}, 1fr)` }}
      >
        {shows.slice(0, 4).map((s, i) => {
          const ds = assignments.get(s.id) ?? [];
          return (
            <Link
              key={s.id}
              href={`/app/library/${s.id}`}
              className="flex items-center gap-[14px] px-5 py-[14px]"
              style={{
                borderRight: i < Math.min(shows.length, 4) - 1 ? "1px solid var(--line)" : "none",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {(() => {
                const firstImg = (s.slides ?? [])
                  .map((sl) => (sl.data as { img?: string } | undefined)?.img)
                  .find((u): u is string => typeof u === "string" && u.length > 0);
                return (
                  <div
                    className="shrink-0 overflow-hidden rounded-[2px]"
                    style={{ width: 72, height: 40, background: "#EEE9DB" }}
                  >
                    {firstImg && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={firstImg}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "saturate(0.85)",
                        }}
                      />
                    )}
                  </div>
                );
              })()}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium tracking-[-0.008em] text-ink">
                  {s.name}
                </div>
                <div className="mt-[1px] flex items-center gap-[4px] truncate text-[11.5px] tracking-[-0.005em] text-muted">
                  <Icon name="monitor" size={10} style={{ color: "#9AA099" }} />
                  {ds.map((d) => d.name).join(", ")}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SlideshowRow({
  s,
  displaysById,
  onDelete,
  onOpenSettings,
}: {
  s: Slideshow;
  displaysById: Display[];
  onDelete: () => void;
  onOpenSettings: () => void;
}) {
  const [hover, setHover] = useState(false);
  const displayStatus: DisplayStatus =
    s.status === "live"
      ? "live"
      : s.status === "paused"
        ? "paused"
        : "draft";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="grid cursor-pointer items-center border-b border-line"
      style={{
        gridTemplateColumns:
          "minmax(0,88px) minmax(160px,1fr) minmax(0,140px) 100px 100px 84px",
        gap: 14,
        padding: "14px 18px",
        background: hover ? "#F5F1E8" : "transparent",
      }}
    >
      <Link href={`/app/library/${s.id}`} className="contents">
        {(() => {
          const firstImg = (s.slides ?? [])
            .map((sl) => (sl.data as { img?: string } | undefined)?.img)
            .find((u): u is string => typeof u === "string" && u.length > 0);
          return (
            <div
              className="relative overflow-hidden rounded-[2px] border"
              style={{
                width: 88,
                height: 50,
                background: "#EEE9DB",
                borderColor: "rgba(25,35,26,0.06)",
              }}
            >
              {firstImg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={firstImg}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "saturate(0.85)",
                  }}
                />
              )}
            </div>
          );
        })()}
        <div className="min-w-0">
          <div className="truncate text-[14px] font-medium tracking-[-0.008em] text-ink">
            {s.name}
          </div>
          <div className="mt-[2px] text-[12px] tracking-[-0.005em] text-muted">
            {(s.slides ?? []).length} slides
          </div>
        </div>
        <div className="min-w-0 truncate text-[12.5px] tracking-[-0.005em]"
             style={{ color: displaysById.length > 0 ? "#0E1410" : "#9AA099" }}>
          {displaysById.length > 0
            ? displaysById.map((d) => d.name).join(", ")
            : "Not assigned"}
        </div>
        <div className="min-w-0">
          <StatusText status={displayStatus} />
        </div>
        <div className="min-w-0 text-[12.5px] tracking-[-0.005em] text-muted">
          {timeAgo(s.updatedAt ?? s.createdAt ?? Date.now())}
        </div>
      </Link>
      <div className="flex justify-end gap-1">
        {hover && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenSettings();
              }}
              className="cursor-pointer rounded-[4px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-ink"
              aria-label="Settings"
            >
              <Icon name="gear" size={14} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="cursor-pointer rounded-[4px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-[#8B3A2F]"
              aria-label="Delete"
            >
              <Icon name="trash" size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function formatDateRange(start: number | null, end: number | null): string {
  if (!start && !end) return "No dates set";
  const fmt = (ms: number) =>
    new Date(ms).toLocaleDateString("en", { month: "short", day: "numeric" });
  if (start && end) {
    if (new Date(start).toDateString() === new Date(end).toDateString()) {
      return fmt(start);
    }
    return `${fmt(start)} — ${fmt(end)}`;
  }
  return fmt(start ?? end ?? 0);
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
