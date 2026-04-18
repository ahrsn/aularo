"use client";

import { useMemo } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@/components/ui/icon";
import type { Slide } from "@/lib/schema";

export function Filmstrip({
  slides,
  selectedId,
  onSelect,
  onReorder,
  onDuplicate,
  onToggleHidden,
  onDelete,
  onAddSlideClick,
}: {
  slides: Slide[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onDuplicate: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSlideClick: () => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = useMemo(() => slides.map((s) => s.id), [slides]);

  function handleDragEnd(ev: DragEndEvent) {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const next = [...ids];
    const [moved] = next.splice(oldIdx, 1);
    next.splice(newIdx, 0, moved);
    onReorder(next);
  }

  return (
    <aside
      className="flex h-full min-h-0 flex-col border-r border-line bg-[rgba(25,35,26,0.02)]"
      style={{ width: 220 }}
    >
      <div
        className="flex items-center justify-between border-b border-line"
        style={{ padding: "14px 16px", minHeight: 44 }}
      >
        <div className="text-label">Slides</div>
        <div
          className="font-mono text-[11px] tracking-[0.06em]"
          style={{ color: "rgba(25,35,26,0.45)" }}
        >
          {slides.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: "10px 10px 96px" }}>
        {slides.length === 0 ? (
          <div
            className="flex h-full items-center justify-center text-center"
            style={{ padding: 24 }}
          >
            <div>
              <div
                className="font-mono uppercase"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: "rgba(25,35,26,0.45)",
                  marginBottom: 8,
                }}
              >
                Empty
              </div>
              <div
                className="text-[12.5px] tracking-[-0.005em]"
                style={{ color: "rgba(25,35,26,0.6)" }}
              >
                Add your first slide to get started.
              </div>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <ol className="flex flex-col gap-[6px]">
                {slides.map((s, i) => (
                  <FilmstripItem
                    key={s.id}
                    index={i}
                    slide={s}
                    selected={s.id === selectedId}
                    onSelect={() => onSelect(s.id)}
                    onDuplicate={() => onDuplicate(s.id)}
                    onToggleHidden={() => onToggleHidden(s.id)}
                    onDelete={() => onDelete(s.id)}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div
        className="absolute left-0 right-0 border-t border-line bg-[rgba(245,241,232,0.9)] backdrop-blur-sm"
        style={{
          bottom: 0,
          padding: "12px 12px",
          width: 220,
        }}
      >
        <button
          type="button"
          onClick={onAddSlideClick}
          className="flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[4px] border border-dashed transition-colors hover:bg-[rgba(25,35,26,0.04)]"
          style={{
            padding: "10px 12px",
            borderColor: "rgba(25,35,26,0.2)",
            color: "rgba(25,35,26,0.75)",
          }}
        >
          <Icon name="plus" size={14} />
          <span className="text-[12.5px] tracking-[-0.005em]">Add slide</span>
        </button>
      </div>
    </aside>
  );
}

function FilmstripItem({
  index,
  slide,
  selected,
  onSelect,
  onDuplicate,
  onToggleHidden,
  onDelete,
}: {
  index: number;
  slide: Slide;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : slide.hidden ? 0.5 : 1,
  };

  const thumb = (slide.data as { img?: string })?.img;
  const label = slide.kind.charAt(0).toUpperCase() + slide.kind.slice(1);
  const preview = previewFor(slide);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="relative flex cursor-pointer select-none items-center gap-[10px] rounded-[4px] border"
      onClick={onSelect}
      data-selected={selected ? "true" : undefined}
    >
      <div
        className="flex items-center gap-[10px] rounded-[4px] border transition-colors"
        style={{
          padding: "8px 8px 8px 6px",
          width: "100%",
          background: selected ? "#FBF8F0" : "transparent",
          borderColor: selected ? "rgba(25,35,26,0.28)" : "transparent",
        }}
      >
        <button
          type="button"
          className="shrink-0 cursor-grab text-muted-2 hover:text-ink focus:outline-none active:cursor-grabbing"
          style={{ padding: 2 }}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
        >
          <Icon name="dots-six-vertical" size={14} />
        </button>
        <div
          className="font-mono text-[10.5px] shrink-0"
          style={{ color: "rgba(25,35,26,0.45)", width: 18 }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
        {thumb ? (
          <div
            className="relative shrink-0 overflow-hidden rounded-[2px]"
            style={{
              width: 44,
              height: 26,
              background: "#EEE9DB",
              border: "1px solid rgba(25,35,26,0.08)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className="shrink-0 rounded-[2px]"
            style={{
              width: 44,
              height: 26,
              background: "#EEE9DB",
              border: "1px solid rgba(25,35,26,0.08)",
            }}
          />
        )}
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-[12px] font-medium tracking-[-0.005em]"
            style={{ color: "#0E1410" }}
          >
            {label}
          </div>
          {preview && (
            <div
              className="truncate text-[11px] tracking-[-0.005em]"
              style={{ color: "rgba(25,35,26,0.55)" }}
            >
              {preview}
            </div>
          )}
        </div>
        {slide.hidden && (
          <div
            className="font-mono text-[9.5px] uppercase tracking-[0.1em]"
            style={{ color: "rgba(25,35,26,0.5)" }}
          >
            hidden
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div
        className="pointer-events-none absolute inset-y-0 right-1 flex items-center gap-[2px] opacity-0 transition-opacity data-[show=true]:opacity-100"
        data-show={selected ? "true" : undefined}
      >
        <RowAction
          icon="copy"
          label="Duplicate"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        />
        <RowAction
          icon={slide.hidden ? "eye" : "eye-slash"}
          label={slide.hidden ? "Show" : "Hide"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleHidden();
          }}
        />
        <RowAction
          icon="trash"
          label="Delete"
          danger
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      </div>
    </li>
  );
}

function RowAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: string;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto cursor-pointer rounded-[3px] p-[4px] text-muted transition-colors hover:bg-[rgba(25,35,26,0.08)]"
      style={{ color: danger ? "#8B3A2F" : undefined }}
    >
      <Icon name={icon} size={12} />
    </button>
  );
}

function previewFor(s: Slide): string {
  const d = s.data as Record<string, unknown>;
  switch (s.kind) {
    case "quote":
      return String(d.quote ?? "");
    case "portrait":
    case "program":
      return String(d.title ?? "");
    case "photo":
      return String(d.caption ?? d.img ?? "");
    case "announcement":
      return String(d.headline ?? "");
    case "markdown":
      return String(d.body ?? "").slice(0, 60);
    case "video":
      return String(d.src ?? "");
    case "gallery": {
      const items = (d.items ?? []) as Array<unknown>;
      return `${items.length} photo${items.length === 1 ? "" : "s"}`;
    }
    case "countdown":
      return String(d.title ?? "Countdown");
    case "weather":
      return String(d.city ?? "Weather");
    case "clock":
      return "Live clock";
    case "event-card":
      return d.eventId ? "Event card" : "Pick an event";
    case "slideshow-embed":
      return d.slideshowId ? "Embedded slideshow" : "Pick a slideshow";
    default:
      return "";
  }
}
