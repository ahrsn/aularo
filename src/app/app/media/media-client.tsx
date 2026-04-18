"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import {
  commitMediaAsset,
  createUploadUrl,
  deleteMediaAssets,
  moveMediaAssetsToEvent,
} from "@/lib/actions";
import { toErrorState, type ErrorState } from "@/lib/errors";
import { useToast } from "@/components/ui/toast";
import type { EventDoc, Integration, MediaAsset } from "@/lib/schema";

/* eslint-disable @next/next/no-img-element */

type UploadingFile = { id: string; name: string; size: number; mime: string };

/** Special event scope values. Anything else is a real EventDoc.id. */
type ScopeId = "all" | "unassigned" | "brand" | (string & {});

type TypeFilter = "image" | "video" | "pdf";
type StatusFilter = "pending" | "ready" | "error";

export function MediaClient({
  initialAssets,
  events,
  integrations,
}: {
  initialAssets: MediaAsset[];
  events: EventDoc[];
  integrations: Integration[];
}) {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const [scope, setScope] = useState<ScopeId>("all");
  const [search, setSearch] = useState("");
  const [typeFilters, setTypeFilters] = useState<Set<TypeFilter>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Set<StatusFilter>>(
    new Set(),
  );
  const [unusedOnly, setUnusedOnly] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [err, setErr] = useState<ErrorState | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);

  const drive = integrations.find((i) => i.provider === "drive");
  const dropbox = integrations.find((i) => i.provider === "dropbox");

  // Exit select mode when selection empties by other means.
  useEffect(() => {
    if (!selectMode) setSelectedIds(new Set());
  }, [selectMode]);

  // ESC closes preview / upload menu / select mode.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (previewId) setPreviewId(null);
      else if (uploadMenuOpen) setUploadMenuOpen(false);
      else if (selectMode) setSelectMode(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewId, uploadMenuOpen, selectMode]);

  const scopeEventId = useMemo<string | null | "brand">(() => {
    if (scope === "all") return null;
    if (scope === "unassigned") return null;
    if (scope === "brand") return "brand";
    return scope;
  }, [scope]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialAssets.filter((a) => {
      const aEvent = a.eventId ?? null;
      if (scope === "all") {
        // exclude brand from "all" so brand assets stay a separate bucket
        if (aEvent === "brand") return false;
      } else if (scope === "unassigned") {
        if (aEvent !== null && aEvent !== undefined) return false;
      } else if (scope === "brand") {
        if (aEvent !== "brand") return false;
      } else {
        if (aEvent !== scope) return false;
      }

      if (q && !a.name.toLowerCase().includes(q)) return false;

      if (typeFilters.size > 0) {
        const t = typeOf(a.mime);
        if (!t || !typeFilters.has(t)) return false;
      }

      if (statusFilters.size > 0 && !statusFilters.has(a.status)) return false;

      // Placeholder: usage tracking lands in v2. For now "unused" is a no-op.
      if (unusedOnly) {
        // Until slideshow linkage ships, every asset reads as unused (0 uses).
      }

      return true;
    });
  }, [initialAssets, scope, search, typeFilters, statusFilters, unusedOnly]);

  const scopedTotal = useMemo(() => {
    return initialAssets.filter((a) => {
      const aEvent = a.eventId ?? null;
      if (scope === "all") return aEvent !== "brand";
      if (scope === "unassigned") return aEvent === null || aEvent === undefined;
      if (scope === "brand") return aEvent === "brand";
      return aEvent === scope;
    }).length;
  }, [initialAssets, scope]);

  const scopeLabel = useMemo(() => {
    if (scope === "all") return "all media";
    if (scope === "unassigned") return "Unassigned";
    if (scope === "brand") return "Brand assets";
    return events.find((e) => e.id === scope)?.name ?? "this event";
  }, [scope, events]);

  async function onFiles(files: FileList | null | File[]) {
    const list = files
      ? Array.isArray(files)
        ? files
        : Array.from(files)
      : [];
    if (list.length === 0) return;
    setErr(null);
    const items: UploadingFile[] = list.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      mime: file.type || "application/octet-stream",
    }));
    setUploading((u) => [...u, ...items]);

    // Uploads inherit the current scope when it's a concrete target.
    const targetEventId =
      scope === "all" || scope === "unassigned"
        ? null
        : scope === "brand"
          ? "brand"
          : scope;

    let successCount = 0;
    let failCount = 0;
    await Promise.all(
      items.map(async (item, idx) => {
        const file = list[idx]!;
        try {
          const { assetId, uploadUrl } = await createUploadUrl({
            name: item.name,
            mime: item.mime,
            size: item.size,
            eventId: targetEventId,
          });
          const put = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": item.mime },
            body: file,
          });
          if (!put.ok) throw new Error(`Upload failed (${put.status})`);
          await commitMediaAsset({ assetId, ok: true });
          successCount++;
        } catch (e) {
          failCount++;
          setErr(toErrorState(e, "Upload failed."));
        } finally {
          setUploading((u) => u.filter((x) => x.id !== item.id));
        }
      }),
    );
    if (successCount > 0) {
      toast.success(
        successCount === 1
          ? "Media uploaded"
          : `${successCount} files uploaded`,
      );
    }
    if (failCount > 0) {
      toast.error(null, `${failCount} file${failCount === 1 ? "" : "s"} failed to upload.`);
    }
    startTransition(() => router.refresh());
  }

  function onDragEnter(e: React.DragEvent) {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }
  function onDragOver(e: React.DragEvent) {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    onFiles(e.dataTransfer.files);
  }

  function toggleType(t: TypeFilter) {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }
  function toggleStatus(s: StatusFilter) {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }
  function clearFilters() {
    setTypeFilters(new Set());
    setStatusFilters(new Set());
    setUnusedOnly(false);
    setSearch("");
  }
  const filtersActive =
    typeFilters.size > 0 ||
    statusFilters.size > 0 ||
    unusedOnly ||
    search.trim().length > 0;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function selectAllVisible() {
    setSelectedIds(new Set(filtered.map((a) => a.id)));
  }
  function exitSelect() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function confirmBulkDelete() {
    if (selectedIds.size === 0) return;
    setDeleteIds(Array.from(selectedIds));
  }
  function doDelete() {
    const ids = deleteIds;
    if (!ids || ids.length === 0) return;
    setDeleteIds(null);
    startTransition(async () => {
      try {
        await deleteMediaAssets({ assetIds: ids });
        toast.success(
          ids.length === 1 ? "Media deleted" : `${ids.length} items deleted`,
        );
      } catch (e) {
        setErr(toErrorState(e, "Delete failed."));
        toast.error(e, "Delete failed.");
      } finally {
        exitSelect();
        router.refresh();
      }
    });
  }

  function doMove(targetEventId: string | null) {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const count = ids.length;
    setMoveOpen(false);
    startTransition(async () => {
      try {
        await moveMediaAssetsToEvent({ assetIds: ids, eventId: targetEventId });
        const dest =
          targetEventId === null
            ? "Unassigned"
            : targetEventId === "brand"
              ? "Brand assets"
              : (events.find((e) => e.id === targetEventId)?.name ?? "event");
        toast.success(
          count === 1
            ? `Moved to ${dest}`
            : `${count} items moved to ${dest}`,
        );
      } catch (e) {
        setErr(toErrorState(e, "Move failed."));
        toast.error(e, "Move failed.");
      } finally {
        exitSelect();
        router.refresh();
      }
    });
  }

  async function doDownload() {
    const ids = Array.from(selectedIds);
    const byId = new Map(initialAssets.map((a) => [a.id, a]));
    for (const id of ids) {
      const a = byId.get(id);
      if (!a?.publicUrl) continue;
      const link = document.createElement("a");
      link.href = a.publicUrl;
      link.download = a.name;
      link.target = "_blank";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

  const previewAsset = previewId
    ? initialAssets.find((a) => a.id === previewId) ?? null
    : null;

  const totalBytes = initialAssets.reduce((n, a) => n + (a.size || 0), 0);
  void totalBytes; // storage moved to Settings; kept reference to avoid accidental re-add

  return (
    <div
      className="relative min-w-0"
      style={{ padding: "28px 32px 64px", maxWidth: 1400 }}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Your media</Eyebrow>
          <h2 className="text-h2 mt-[6px]">
            {initialAssets.length === 0 && uploading.length === 0
              ? "No media yet"
              : `${scopedTotal} asset${scopedTotal === 1 ? "" : "s"} in ${scopeLabel}`}
          </h2>
          <div className="mt-1 text-[12.5px] tracking-[-0.005em] text-muted">
            Drag files anywhere on this page — or click Upload. JPG · PNG · MP4
            · PDF, up to 200 MB each.
          </div>
        </div>
        <div className="shrink-0">
          <UploadMenu
            open={uploadMenuOpen}
            onOpen={() => setUploadMenuOpen(true)}
            onClose={() => setUploadMenuOpen(false)}
            onPickComputer={() => {
              setUploadMenuOpen(false);
              inputRef.current?.click();
            }}
            driveConnected={drive?.status === "connected"}
            dropboxConnected={dropbox?.status === "connected"}
          />
        </div>
      </div>

      {err && (
        <div className="mt-4 flex items-start gap-2 rounded-[4px] bg-[#F3E4E0] p-[12px_14px] text-[12.5px] text-[#8B3A2F]">
          <Icon name="warning-circle" size={14} style={{ marginTop: 1 }} />
          <div className="flex-1">
            {err.text}
            {err.upgrade && (
              <>
                {" "}
                <Link
                  href="/app/settings/billing"
                  className="font-medium underline hover:opacity-80"
                >
                  Upgrade plan →
                </Link>
              </>
            )}
          </div>
          <button
            onClick={() => setErr(null)}
            aria-label="Dismiss"
            className="cursor-pointer opacity-70 hover:opacity-100"
          >
            <Icon name="x" size={13} />
          </button>
        </div>
      )}

      {/* Event tabs */}
      <div className="mt-6">
        <EventTabs
          events={events}
          scope={scope}
          onChange={(s) => {
            setScope(s);
            exitSelect();
          }}
          counts={countByScope(initialAssets)}
        />
      </div>

      {/* Toolbar / Bulk action bar */}
      <div className="mt-3">
        {selectMode ? (
          <BulkActionBar
            count={selectedIds.size}
            onSelectAll={selectAllVisible}
            onCancel={exitSelect}
            onDelete={confirmBulkDelete}
            onMove={() => setMoveOpen(true)}
            onDownload={doDownload}
          />
        ) : (
          <MediaToolbar
            search={search}
            onSearch={setSearch}
            typeFilters={typeFilters}
            onToggleType={toggleType}
            statusFilters={statusFilters}
            onToggleStatus={toggleStatus}
            unusedOnly={unusedOnly}
            onToggleUnused={() => setUnusedOnly((v) => !v)}
            filtersActive={filtersActive}
            onClear={clearFilters}
            onEnterSelect={() => setSelectMode(true)}
            scopeLabel={scopeLabel}
            scopeEventId={scopeEventId}
          />
        )}
      </div>

      {/* Grid */}
      <div className="mt-5">
        {initialAssets.length === 0 && uploading.length === 0 ? (
          <EmptyDropzone onBrowse={() => inputRef.current?.click()} />
        ) : filtered.length === 0 && uploading.length === 0 ? (
          <ScopedEmpty
            scopeLabel={scopeLabel}
            filtersActive={filtersActive}
            onClear={clearFilters}
            onBrowse={() => inputRef.current?.click()}
          />
        ) : (
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(172px, 1fr))",
            }}
          >
            {uploading.map((u) => (
              <UploadingTile key={u.id} file={u} />
            ))}
            {filtered.map((a) => (
              <AssetTile
                key={a.id}
                asset={a}
                selectMode={selectMode}
                selected={selectedIds.has(a.id)}
                onClick={() => {
                  if (selectMode) toggleSelect(a.id);
                  else setPreviewId(a.id);
                }}
                onDelete={() => setDeleteIds([a.id])}
              />
            ))}
          </div>
        )}
      </div>

      {dragging && <DropOverlay scopeLabel={scopeLabel} />}

      <ConfirmDialog
        open={deleteIds !== null}
        title={
          deleteIds && deleteIds.length > 1
            ? `Delete ${deleteIds.length} assets?`
            : "Delete this asset?"
        }
        description="Slides using them will break."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={doDelete}
        onCancel={() => setDeleteIds(null)}
      />

      {moveOpen && (
        <MoveToEventMenu
          events={events}
          onPick={doMove}
          onClose={() => setMoveOpen(false)}
          currentScope={scope}
        />
      )}

      {previewAsset && (
        <PreviewLightbox
          asset={previewAsset}
          event={
            previewAsset.eventId && previewAsset.eventId !== "brand"
              ? events.find((e) => e.id === previewAsset.eventId) ?? null
              : null
          }
          scopeLabel={
            previewAsset.eventId === "brand"
              ? "Brand assets"
              : previewAsset.eventId
                ? events.find((e) => e.id === previewAsset.eventId)?.name ??
                  "Event"
                : "Unassigned"
          }
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  );
}

// ── Event tabs ──────────────────────────────────────────────────────────

function countByScope(assets: MediaAsset[]): Record<string, number> {
  const counts: Record<string, number> = {
    all: 0,
    unassigned: 0,
    brand: 0,
  };
  for (const a of assets) {
    const e = a.eventId ?? null;
    if (e === "brand") counts.brand++;
    else {
      counts.all++;
      if (e === null || e === undefined) counts.unassigned++;
      else counts[e] = (counts[e] ?? 0) + 1;
    }
  }
  return counts;
}

function EventTabs({
  events,
  scope,
  onChange,
  counts,
}: {
  events: EventDoc[];
  scope: ScopeId;
  onChange: (scope: ScopeId) => void;
  counts: Record<string, number>;
}) {
  const tabs: Array<{ id: ScopeId; label: string; count: number }> = [
    { id: "all", label: "All", count: counts.all ?? 0 },
    { id: "unassigned", label: "Unassigned", count: counts.unassigned ?? 0 },
    ...events.map((e) => ({
      id: e.id as ScopeId,
      label: e.name,
      count: counts[e.id] ?? 0,
    })),
    { id: "brand", label: "Brand assets", count: counts.brand ?? 0 },
  ];

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto"
      style={{ scrollbarWidth: "thin" }}
      role="tablist"
      aria-label="Filter by event"
    >
      {tabs.map((t) => {
        const active = scope === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className="group flex shrink-0 cursor-pointer items-center gap-[7px] rounded-[4px] border transition-colors"
            style={{
              padding: "7px 12px",
              fontSize: 12.5,
              letterSpacing: "-0.005em",
              borderColor: active ? "#19231A" : "transparent",
              background: active ? "#19231A" : "transparent",
              color: active ? "#F5F1E8" : "#0E1410",
            }}
          >
            <span className="font-medium">{t.label}</span>
            <span
              className="font-mono"
              style={{
                fontSize: 10.5,
                letterSpacing: "0.04em",
                color: active ? "rgba(245,241,232,0.7)" : "#6B7268",
              }}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Toolbar ─────────────────────────────────────────────────────────────

function MediaToolbar({
  search,
  onSearch,
  typeFilters,
  onToggleType,
  statusFilters,
  onToggleStatus,
  unusedOnly,
  onToggleUnused,
  filtersActive,
  onClear,
  onEnterSelect,
  scopeLabel,
  scopeEventId,
}: {
  search: string;
  onSearch: (v: string) => void;
  typeFilters: Set<TypeFilter>;
  onToggleType: (t: TypeFilter) => void;
  statusFilters: Set<StatusFilter>;
  onToggleStatus: (s: StatusFilter) => void;
  unusedOnly: boolean;
  onToggleUnused: () => void;
  filtersActive: boolean;
  onClear: () => void;
  onEnterSelect: () => void;
  scopeLabel: string;
  scopeEventId: string | null | "brand";
}) {
  void scopeLabel;
  void scopeEventId;
  const typeLabel =
    typeFilters.size === 0
      ? "Type"
      : typeFilters.size === 1
        ? Array.from(typeFilters)[0] === "image"
          ? "Images"
          : Array.from(typeFilters)[0] === "video"
            ? "Video"
            : "PDF"
        : `Type · ${typeFilters.size}`;

  const statusLabel =
    statusFilters.size === 0
      ? "Status"
      : statusFilters.size === 1
        ? capitalize(Array.from(statusFilters)[0])
        : `Status · ${statusFilters.size}`;

  return (
    <div
      className="flex items-center gap-2 rounded-[4px] border border-line bg-surface"
      style={{ padding: "6px 8px" }}
    >
      <button
        type="button"
        onClick={onEnterSelect}
        aria-label="Select items"
        title="Select"
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[4px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-ink"
      >
        <Icon name="check-square" size={16} />
      </button>

      <div className="min-w-0 flex-1">
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search filenames…"
          icon="magnifying-glass"
        />
      </div>

      <FilterDropdown
        label={typeLabel}
        active={typeFilters.size > 0}
        options={[
          { value: "image", label: "Images" },
          { value: "video", label: "Video" },
          { value: "pdf", label: "PDF" },
        ]}
        selected={typeFilters as Set<string>}
        onToggle={(v) => onToggleType(v as TypeFilter)}
      />

      <FilterDropdown
        label={statusLabel}
        active={statusFilters.size > 0}
        options={[
          { value: "ready", label: "Ready" },
          { value: "pending", label: "Pending" },
          { value: "error", label: "Error" },
        ]}
        selected={statusFilters as Set<string>}
        onToggle={(v) => onToggleStatus(v as StatusFilter)}
      />

      <Chip active={unusedOnly} onClick={onToggleUnused}>
        Unused
      </Chip>

      {filtersActive && (
        <Button variant="text" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function FilterDropdown({
  label,
  active,
  options,
  selected,
  onToggle,
}: {
  label: string;
  active: boolean;
  options: Array<{ value: string; label: string }>;
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-[6px] rounded-[4px] border transition-colors"
        style={{
          padding: "6px 10px",
          fontSize: 12.5,
          letterSpacing: "-0.005em",
          borderColor: active ? "#19231A" : "#D4CFC0",
          background: active ? "#19231A" : "transparent",
          color: active ? "#F5F1E8" : "#0E1410",
          fontWeight: active ? 500 : 400,
        }}
      >
        {label}
        <Icon name={open ? "caret-up" : "caret-down"} size={11} />
      </button>
      {open && (
        <div
          role="menu"
          data-motion="menu"
          data-state="open"
          className="absolute right-0 z-50 mt-[6px] overflow-hidden rounded-[6px] border border-line bg-surface"
          style={{
            minWidth: 180,
            boxShadow: "0 18px 40px -12px rgba(14,20,16,0.28)",
          }}
        >
          {options.map((opt) => {
            const on = selected.has(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemcheckbox"
                aria-checked={on}
                onClick={() => onToggle(opt.value)}
                className="flex w-full cursor-pointer items-center justify-between px-[14px] py-[9px] text-left text-[13px] tracking-[-0.005em] text-ink hover:bg-[rgba(25,35,26,0.05)]"
              >
                <span>{opt.label}</span>
                <span
                  className="flex h-[14px] w-[14px] items-center justify-center rounded-[3px] border"
                  style={{
                    borderColor: on ? "#19231A" : "rgba(14,20,16,0.25)",
                    background: on ? "#19231A" : "transparent",
                    color: "#F5F1E8",
                  }}
                >
                  {on && <Icon name="check" size={10} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="cursor-pointer rounded-full border transition-colors"
      style={{
        padding: "5px 11px",
        fontSize: 12,
        letterSpacing: "-0.005em",
        borderColor: active ? "#19231A" : "#D4CFC0",
        background: active ? "#19231A" : "transparent",
        color: active ? "#F5F1E8" : "#0E1410",
        fontWeight: active ? 500 : 400,
      }}
    >
      {children}
    </button>
  );
}

// ── Bulk action bar ─────────────────────────────────────────────────────

function BulkActionBar({
  count,
  onSelectAll,
  onCancel,
  onDelete,
  onMove,
  onDownload,
}: {
  count: number;
  onSelectAll: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onMove: () => void;
  onDownload: () => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-[4px] border bg-[#19231A] text-paper"
      style={{ padding: "8px 12px", borderColor: "#0E1410" }}
    >
      <div className="flex items-center gap-2 text-[12.5px] tracking-[-0.005em]">
        <span className="font-medium">{count}</span>
        <span style={{ color: "rgba(245,241,232,0.7)" }}>selected</span>
      </div>
      <button
        type="button"
        onClick={onSelectAll}
        className="cursor-pointer rounded-[3px] px-2 py-[3px] text-[12px] tracking-[-0.005em] hover:bg-[rgba(245,241,232,0.08)]"
        style={{ color: "rgba(245,241,232,0.85)" }}
      >
        Select all visible
      </button>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="onDarkGhost"
          size="sm"
          icon="arrows-left-right"
          onClick={onMove}
          disabled={count === 0}
        >
          Move to event
        </Button>
        <Button
          variant="onDarkGhost"
          size="sm"
          icon="download-simple"
          onClick={onDownload}
          disabled={count === 0}
        >
          Download
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon="trash"
          onClick={onDelete}
          disabled={count === 0}
        >
          Delete
        </Button>
        <Button variant="onDarkGhost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Move to event menu ──────────────────────────────────────────────────

function MoveToEventMenu({
  events,
  onPick,
  onClose,
  currentScope,
}: {
  events: EventDoc[];
  onPick: (eventId: string | null) => void;
  onClose: () => void;
  currentScope: ScopeId;
}) {
  const options: Array<{ id: string | null | "brand"; label: string }> = [
    { id: null, label: "Unassigned" },
    ...events.map((e) => ({ id: e.id as string, label: e.name })),
    { id: "brand", label: "Brand assets" },
  ];
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.55)", left: "var(--overlay-left, 0px)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Move to event"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] overflow-hidden rounded-[6px] border border-line bg-surface"
        style={{ boxShadow: "0 24px 56px -16px rgba(14,20,16,0.4)" }}
      >
        <div className="flex items-center justify-between border-b border-line px-[18px] py-[14px]">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
            Move selection to…
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer p-[6px] text-muted hover:text-ink"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
        <ul className="py-2">
          {options.map((opt) => {
            const isCurrent =
              (opt.id === null && currentScope === "unassigned") ||
              (opt.id === "brand" && currentScope === "brand") ||
              opt.id === currentScope;
            return (
              <li key={String(opt.id)}>
                <button
                  type="button"
                  onClick={() =>
                    onPick(
                      opt.id === "brand" ? "brand" : (opt.id as string | null),
                    )
                  }
                  className="flex w-full cursor-pointer items-center justify-between px-[18px] py-[10px] text-left text-[13px] tracking-[-0.005em] text-ink hover:bg-[rgba(25,35,26,0.04)]"
                >
                  <span>{opt.label}</span>
                  {isCurrent && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                      Current
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ── Upload menu ─────────────────────────────────────────────────────────

function UploadMenu({
  open,
  onOpen,
  onClose,
  onPickComputer,
  driveConnected,
  dropboxConnected,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onPickComputer: () => void;
  driveConnected: boolean;
  dropboxConnected: boolean;
}) {
  return (
    <div className="relative">
      <Button
        variant="primary"
        icon="upload-simple"
        iconRight={open ? "caret-up" : "caret-down"}
        onClick={open ? onClose : onOpen}
      >
        Upload
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={onClose} />
          <div
            role="menu"
            className="absolute right-0 z-[95] mt-2 overflow-hidden rounded-[6px] border border-line bg-surface"
            style={{
              minWidth: 260,
              boxShadow: "0 18px 40px -12px rgba(14,20,16,0.35)",
            }}
          >
            <UploadMenuItem
              icon="desktop"
              label="From this device"
              hint="Drag, drop, or browse — up to 200 MB"
              onClick={onPickComputer}
            />
            <div className="h-px bg-line" />
            <UploadMenuItem
              logo="https://ssl.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png"
              label="Google Drive"
              hint={
                driveConnected
                  ? "Pick a folder to sync"
                  : "Not connected yet — set it up"
              }
              href="/app/settings/integrations"
              connected={driveConnected}
            />
            <UploadMenuItem
              logo="https://cdn.simpleicons.org/dropbox"
              label="Dropbox"
              hint={
                dropboxConnected
                  ? "Pick a folder to sync"
                  : "Not connected yet — set it up"
              }
              href="/app/settings/integrations"
              connected={dropboxConnected}
            />
          </div>
        </>
      )}
    </div>
  );
}

function UploadMenuItem({
  icon,
  logo,
  label,
  hint,
  onClick,
  href,
  connected,
}: {
  icon?: string;
  logo?: string;
  label: string;
  hint: string;
  onClick?: () => void;
  href?: string;
  connected?: boolean;
}) {
  const isIntegration = logo !== undefined;
  const content = (
    <div
      className="flex w-full cursor-pointer items-center gap-3 px-[16px] py-[12px] text-left transition-colors hover:bg-[rgba(25,35,26,0.04)]"
    >
      <div
        className="flex shrink-0 items-center justify-center rounded-[5px]"
        style={{
          width: 32,
          height: 32,
          background: "#F5F1E8",
          border: "1px solid var(--line)",
          color: "#19231A",
        }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            width={18}
            height={18}
            style={{ width: 18, height: 18, objectFit: "contain" }}
          />
        ) : icon ? (
          <Icon name={icon} size={16} />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-[6px]">
          <span className="text-[13px] font-medium tracking-[-0.005em] text-ink">
            {label}
          </span>
          {isIntegration && connected && (
            <span
              className="inline-flex items-center gap-[4px] rounded-full px-[6px] py-[1px] text-[10px] font-medium tracking-[-0.005em]"
              style={{
                background: "rgba(34,94,52,0.08)",
                color: "#225E34",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: "#3E8A5A",
                }}
              />
              Connected
            </span>
          )}
        </div>
        <div className="mt-[1px] text-[11.5px] tracking-[-0.005em] text-muted">
          {hint}
        </div>
      </div>
      {href && (
        <Icon
          name="arrow-up-right"
          size={13}
          style={{ color: "#6B7268" }}
        />
      )}
    </div>
  );
  if (href) {
    return (
      <a href={href} role="menuitem" className="block">
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="block w-full"
    >
      {content}
    </button>
  );
}

// ── Asset tile ──────────────────────────────────────────────────────────

function AssetTile({
  asset,
  selectMode,
  selected,
  onClick,
  onDelete,
}: {
  asset: MediaAsset;
  selectMode: boolean;
  selected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [hover, setHover] = useState(false);
  const kind = typeOf(asset.mime);
  const isImage = kind === "image";
  const isVideo = kind === "video";
  const isPdf = kind === "pdf";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={selectMode ? selected : undefined}
      className="group relative cursor-pointer overflow-hidden rounded-[4px] border bg-surface transition-[border-color]"
      style={{
        borderColor: selected ? "#19231A" : "#E3DFD3",
        boxShadow: selected ? "inset 0 0 0 1px #19231A" : undefined,
      }}
    >
      <div
        className="relative"
        style={{ aspectRatio: "1 / 1", background: "#EEE9DB" }}
      >
        {isImage && asset.publicUrl ? (
          <img
            src={asset.publicUrl}
            alt={asset.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : isVideo && asset.publicUrl ? (
          <video
            src={asset.publicUrl}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-2">
            <Icon name={isVideo ? "video" : isPdf ? "file-pdf" : "file"} size={28} />
          </div>
        )}

        {/* Type tag (bottom-left) */}
        <div
          className="absolute bottom-2 left-2 rounded-[3px] px-[6px] py-[2px] font-mono uppercase"
          style={{
            fontSize: 9,
            letterSpacing: "0.06em",
            background: "rgba(14,20,16,0.58)",
            color: "#F5F1E8",
            backdropFilter: "blur(4px)",
          }}
        >
          {kind ?? "file"}
        </div>

        {/* Status badge */}
        {asset.status !== "ready" && (
          <div
            className="absolute right-2 bottom-2 rounded-[3px] px-2 py-[2px] font-mono uppercase"
            style={{
              fontSize: 9,
              letterSpacing: "0.05em",
              background:
                asset.status === "error"
                  ? "rgba(139,58,47,0.88)"
                  : "rgba(14,20,16,0.6)",
              color: "#F5F1E8",
              backdropFilter: "blur(4px)",
            }}
          >
            {asset.status}
          </div>
        )}

        {/* Select checkbox */}
        {selectMode && (
          <div
            className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-[3px]"
            style={{
              background: selected ? "#19231A" : "rgba(245,241,232,0.92)",
              border: "1px solid",
              borderColor: selected ? "#19231A" : "rgba(14,20,16,0.2)",
              color: "#F5F1E8",
            }}
          >
            {selected && <Icon name="check" size={13} />}
          </div>
        )}

        {/* Hover delete (only when not in select mode) */}
        {!selectMode && hover && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete"
            className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-[3px] text-paper"
            style={{
              background: "rgba(14,20,16,0.6)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Icon name="trash" size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-[2px] p-[10px_12px]">
        <div className="truncate text-[12.5px] font-medium tracking-[-0.005em] text-ink">
          {asset.name}
        </div>
        <div className="flex items-center gap-[6px] text-[11px] tracking-[-0.005em] text-muted">
          <span>{formatSize(asset.size)}</span>
          {asset.width && asset.height && (
            <>
              <span style={{ color: "#D4CFC0" }}>·</span>
              <span>
                {asset.width}×{asset.height}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Preview lightbox ────────────────────────────────────────────────────

function PreviewLightbox({
  asset,
  event,
  scopeLabel,
  onClose,
}: {
  asset: MediaAsset;
  event: EventDoc | null;
  scopeLabel: string;
  onClose: () => void;
}) {
  void event;
  const kind = typeOf(asset.mime);
  return (
    <div
      className="fixed inset-0 z-[120] flex"
      style={{ background: "rgba(14,20,16,0.82)", left: "var(--overlay-left, 0px)" }}
      onClick={onClose}
    >
      <div
        className="relative m-auto flex max-h-[92vh] w-full max-w-[1180px] gap-5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-[4px] text-paper hover:bg-[rgba(245,241,232,0.08)]"
        >
          <Icon name="x" size={18} />
        </button>

        <div
          className="flex flex-1 items-center justify-center overflow-hidden rounded-[6px]"
          style={{ background: "#0E1410" }}
        >
          {kind === "image" && asset.publicUrl ? (
            <img
              src={asset.publicUrl}
              alt={asset.name}
              className="max-h-[86vh] max-w-full object-contain"
            />
          ) : kind === "video" && asset.publicUrl ? (
            <video
              src={asset.publicUrl}
              controls
              autoPlay
              className="max-h-[86vh] max-w-full"
            />
          ) : kind === "pdf" && asset.publicUrl ? (
            <iframe
              src={asset.publicUrl}
              title={asset.name}
              className="h-[86vh] w-full"
              style={{ background: "#F5F1E8" }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 p-10 text-paper">
              <Icon name="file" size={40} />
              <div className="text-[13px] opacity-70">No preview available</div>
            </div>
          )}
        </div>

        <aside
          className="flex w-[280px] shrink-0 flex-col gap-4 rounded-[6px] border border-line bg-surface p-5"
          style={{ maxHeight: "86vh", overflow: "auto" }}
        >
          <div>
            <Eyebrow>File</Eyebrow>
            <div className="mt-1 break-all text-[14px] font-medium tracking-[-0.01em] text-ink">
              {asset.name}
            </div>
          </div>
          <Field label="Type">{kind?.toUpperCase() ?? "FILE"}</Field>
          <Field label="Size">{formatSize(asset.size)}</Field>
          {asset.width && asset.height && (
            <Field label="Dimensions">
              {asset.width} × {asset.height}
            </Field>
          )}
          <Field label="Scope">{scopeLabel}</Field>
          <Field label="Uploaded by">{asset.uploadedBy ?? "—"}</Field>
          <Field label="Uploaded">{formatDate(asset.createdAt)}</Field>
          <Field label="Source">{asset.source}</Field>
          <Field label="Used in">—</Field>
          {asset.publicUrl && (
            <a
              href={asset.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-[6px] self-start text-[12.5px] text-ink underline underline-offset-[3px]"
            >
              <Icon name="arrow-square-out" size={13} />
              Open original
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-2">
        {label}
      </div>
      <div className="mt-[2px] text-[12.5px] tracking-[-0.005em] text-ink">
        {children}
      </div>
    </div>
  );
}

// ── Empty states ────────────────────────────────────────────────────────

function EmptyDropzone({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[6px] border border-dashed text-center"
      style={{
        padding: "80px 32px",
        borderColor: "rgba(25,35,26,0.18)",
        background:
          "repeating-linear-gradient(135deg, #FBF8F0 0 10px, #F5F1E8 10px 20px)",
      }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 48,
          height: 48,
          background: "#F5F1E8",
          border: "1px solid var(--line)",
        }}
      >
        <Icon name="upload-simple" size={20} style={{ color: "#19231A" }} />
      </div>
      <div
        className="mt-4 font-serif text-ink"
        style={{
          fontSize: 24,
          fontWeight: 500,
          letterSpacing: "-0.018em",
          fontVariationSettings: "'opsz' 48",
        }}
      >
        Drop files to upload
      </div>
      <div className="mt-1 max-w-[320px] text-[13px] leading-[1.5] tracking-[-0.005em] text-muted">
        Drag from your desktop, or browse. Anything you upload is ready to pin
        on a slide.
      </div>
      <div className="mt-5">
        <Button variant="primary" size="md" icon="folder-open" onClick={onBrowse}>
          Browse files
        </Button>
      </div>
      <div className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-2">
        JPG · PNG · MP4 · PDF · up to 200 MB
      </div>
    </div>
  );
}

function ScopedEmpty({
  scopeLabel,
  filtersActive,
  onClear,
  onBrowse,
}: {
  scopeLabel: string;
  filtersActive: boolean;
  onClear: () => void;
  onBrowse: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[6px] border border-dashed text-center"
      style={{
        padding: "60px 32px",
        borderColor: "rgba(25,35,26,0.18)",
      }}
    >
      <div
        className="font-serif text-ink"
        style={{
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: "-0.016em",
          fontVariationSettings: "'opsz' 48",
        }}
      >
        {filtersActive
          ? "Nothing matches these filters"
          : `No media in ${scopeLabel} yet`}
      </div>
      <div className="mt-1 max-w-[360px] text-[13px] tracking-[-0.005em] text-muted">
        {filtersActive
          ? "Try clearing filters, or pick a different event."
          : "Drop files here — they'll be tagged to this event automatically."}
      </div>
      <div className="mt-4 flex items-center gap-2">
        {filtersActive ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        ) : (
          <Button variant="primary" size="sm" icon="folder-open" onClick={onBrowse}>
            Browse files
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Uploading tile & drop overlay ───────────────────────────────────────

function UploadingTile({ file }: { file: UploadingFile }) {
  return (
    <div
      className="relative overflow-hidden rounded-[4px] border border-line bg-surface"
      aria-label={`Uploading ${file.name}`}
    >
      <div
        className="clarra-shimmer relative flex items-center justify-center"
        style={{ aspectRatio: "1 / 1" }}
      >
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted">
            Uploading
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[2px] p-[10px_12px]">
        <div className="truncate text-[12.5px] font-medium tracking-[-0.005em] text-ink">
          {file.name}
        </div>
        <div className="text-[11px] tracking-[-0.005em] text-muted">
          {formatSize(file.size)}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      aria-hidden
      className="clarra-spin"
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        border: "2px solid rgba(25,35,26,0.15)",
        borderTopColor: "#19231A",
      }}
    />
  );
}

function DropOverlay({ scopeLabel }: { scopeLabel: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[6px]"
      style={{
        background: "rgba(25,35,26,0.06)",
        border: "2px dashed #19231A",
        backdropFilter: "blur(1px)",
      }}
    >
      <div
        className="flex flex-col items-center gap-3 rounded-[6px] px-6 py-5 text-ink"
        style={{
          background: "#F5F1E8",
          border: "1px solid var(--line)",
          boxShadow: "0 18px 40px -12px rgba(14,20,16,0.35)",
        }}
      >
        <Icon name="download-simple" size={22} style={{ color: "#19231A" }} />
        <div
          className="font-serif"
          style={{
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "-0.018em",
            fontVariationSettings: "'opsz' 48",
          }}
        >
          Drop to add to {scopeLabel}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────

function typeOf(mime: string): TypeFilter | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return null;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log10(bytes) / 3));
  const value = bytes / 1000 ** i;
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
