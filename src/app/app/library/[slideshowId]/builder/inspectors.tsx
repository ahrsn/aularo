"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import type { Slide, EventDoc } from "@/lib/schema";

type InspectorProps = {
  slide: Slide;
  events: EventDoc[];
  onField: (path: string, value: unknown) => void;
  onPickImage: () => void;
};

/**
 * Per-kind inspectors. Each one mutates slide.data via the onField callback.
 * The orchestrator debounces and persists changes.
 */
export function KindInspector({
  slide,
  events,
  onField,
  onPickImage,
}: InspectorProps) {
  switch (slide.kind) {
    case "photo":
      return <PhotoInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "portrait":
      return <PortraitInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "quote":
      return <QuoteInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "program":
      return <ProgramInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "announcement":
      return <AnnouncementInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "markdown":
      return <MarkdownInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "video":
      return <VideoInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "gallery":
      return <GalleryInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "countdown":
      return <CountdownInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "weather":
      return <WeatherInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "clock":
      return <ClockInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "event-card":
      return <EventCardInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    case "slideshow-embed":
      return <SlideshowEmbedInspector slide={slide} onField={onField} onPickImage={onPickImage} events={events} />;
    default:
      return null;
  }
}

// ── Field primitives ────────────────────────────────────────────────────

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex flex-col gap-[6px]">
      <span
        className="font-mono uppercase text-[10.5px] tracking-[0.12em]"
        style={{ color: "rgba(25,35,26,0.55)" }}
      >
        {label}
      </span>
      {children}
      {hint && (
        <span
          className="text-[11.5px] tracking-[-0.005em]"
          style={{ color: "rgba(25,35,26,0.55)" }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded-[4px] border border-line bg-paper px-3 py-[8px] text-[13px] tracking-[-0.005em] text-ink focus:border-moss focus:outline-none"
      />
    );
  }
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function ImagePickerField({
  value,
  onChange,
  onPickImage,
}: {
  value: string;
  onChange: (v: string) => void;
  onPickImage: () => void;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      {value && (
        <div
          className="relative overflow-hidden rounded-[4px] border border-line"
          style={{ aspectRatio: "16/9", background: "#EEE9DB" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 cursor-pointer rounded-[3px] px-2 py-[2px] text-[11px] font-medium text-paper"
            style={{ background: "rgba(14,20,16,0.6)" }}
          >
            Clear
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={onPickImage}
        className="flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[4px] border border-line bg-paper px-3 py-[10px] text-[12.5px] tracking-[-0.005em] text-ink hover:bg-[rgba(25,35,26,0.04)]"
      >
        <Icon name="images" size={14} />
        {value ? "Replace photo" : "Pick from Media"}
      </button>
    </div>
  );
}

function SegmentedField<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="inline-flex rounded-[4px] border border-line"
      style={{ background: "#FBF8F0", padding: 2 }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className="cursor-pointer rounded-[3px] px-[10px] py-[5px] text-[11.5px] font-medium tracking-[-0.005em]"
          style={{
            background: value === o.value ? "#19231A" : "transparent",
            color: value === o.value ? "#F5F1E8" : "#0E1410",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ToggleField({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex cursor-pointer items-center justify-between rounded-[4px] border border-line bg-paper px-3 py-[10px]"
    >
      <span className="text-[13px] tracking-[-0.005em] text-ink">{label}</span>
      <span
        className="inline-block rounded-full"
        style={{
          width: 28,
          height: 16,
          background: value ? "#3B5A41" : "rgba(25,35,26,0.2)",
          position: "relative",
          transition: "background 180ms",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: value ? 14 : 2,
            width: 12,
            height: 12,
            background: "#F5F1E8",
            borderRadius: "50%",
            transition: "left 180ms",
          }}
        />
      </span>
    </button>
  );
}

// ── Kind-specific inspectors ────────────────────────────────────────────

function PhotoInspector({ slide, onField, onPickImage }: InspectorProps) {
  const d = slide.data as { img?: string; caption?: string; credit?: string };
  return (
    <>
      <Field label="Photo">
        <ImagePickerField
          value={d.img ?? ""}
          onChange={(v) => onField("img", v)}
          onPickImage={onPickImage}
        />
      </Field>
      <Field label="Caption">
        <TextField
          value={d.caption ?? ""}
          onChange={(v) => onField("caption", v)}
          placeholder="Short description"
        />
      </Field>
      <Field label="Credit">
        <TextField
          value={d.credit ?? ""}
          onChange={(v) => onField("credit", v)}
          placeholder="Photographer, source, etc."
        />
      </Field>
    </>
  );
}

function PortraitInspector({ slide, onField, onPickImage }: InspectorProps) {
  const d = slide.data as {
    img?: string;
    eyebrow?: string;
    title?: string;
    body?: string;
  };
  return (
    <>
      <Field label="Background image">
        <ImagePickerField
          value={d.img ?? ""}
          onChange={(v) => onField("img", v)}
          onPickImage={onPickImage}
        />
      </Field>
      <Field label="Eyebrow">
        <TextField
          value={d.eyebrow ?? ""}
          onChange={(v) => onField("eyebrow", v)}
          placeholder="SHORT · UPPERCASE"
        />
      </Field>
      <Field label="Title">
        <TextField
          value={d.title ?? ""}
          onChange={(v) => onField("title", v)}
          placeholder="Big display headline"
        />
      </Field>
      <Field label="Body">
        <TextField
          value={d.body ?? ""}
          onChange={(v) => onField("body", v)}
          placeholder="Optional supporting copy"
          multiline
        />
      </Field>
    </>
  );
}

function QuoteInspector({ slide, onField }: InspectorProps) {
  const d = slide.data as { eyebrow?: string; quote?: string; by?: string };
  return (
    <>
      <Field label="Eyebrow">
        <TextField
          value={d.eyebrow ?? ""}
          onChange={(v) => onField("eyebrow", v)}
          placeholder="OPTIONAL"
        />
      </Field>
      <Field label="Quote">
        <TextField
          value={d.quote ?? ""}
          onChange={(v) => onField("quote", v)}
          placeholder="The full quote — no need for quote marks."
          multiline
        />
      </Field>
      <Field label="Attribution">
        <TextField
          value={d.by ?? ""}
          onChange={(v) => onField("by", v)}
          placeholder="Who said it"
        />
      </Field>
    </>
  );
}

function ProgramInspector({ slide, onField }: InspectorProps) {
  const d = slide.data as {
    eyebrow?: string;
    title?: string;
    items?: Array<{ t: string; n: string; where: string }>;
  };
  const items = d.items ?? [];
  function update(i: number, key: "t" | "n" | "where", value: string) {
    const next = items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it));
    onField("items", next);
  }
  function add() {
    onField("items", [...items, { t: "", n: "", where: "" }]);
  }
  function remove(i: number) {
    onField(
      "items",
      items.filter((_, idx) => idx !== i),
    );
  }
  return (
    <>
      <Field label="Eyebrow">
        <TextField
          value={d.eyebrow ?? ""}
          onChange={(v) => onField("eyebrow", v)}
          placeholder="OPTIONAL"
        />
      </Field>
      <Field label="Title">
        <TextField
          value={d.title ?? ""}
          onChange={(v) => onField("title", v)}
          placeholder="e.g., Tonight's schedule"
        />
      </Field>
      <Field label="Items">
        <div className="flex flex-col gap-[8px]">
          {items.length === 0 && (
            <div
              className="text-[12px] tracking-[-0.005em]"
              style={{ color: "rgba(25,35,26,0.55)" }}
            >
              No items yet.
            </div>
          )}
          {items.map((it, i) => (
            <div
              key={i}
              className="grid gap-[6px] rounded-[4px] border border-line bg-paper p-[10px]"
              style={{ gridTemplateColumns: "80px 1fr 110px 24px" }}
            >
              <Input
                placeholder="7:30"
                value={it.t}
                onChange={(e) => update(i, "t", e.target.value)}
              />
              <Input
                placeholder="Item name"
                value={it.n}
                onChange={(e) => update(i, "n", e.target.value)}
              />
              <Input
                placeholder="Location"
                value={it.where}
                onChange={(e) => update(i, "where", e.target.value)}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="cursor-pointer rounded-[3px] p-[4px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-[#8B3A2F]"
                aria-label="Remove"
              >
                <Icon name="x" size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={add}
            className="flex cursor-pointer items-center justify-center gap-[6px] rounded-[4px] border border-dashed px-3 py-[8px] text-[12px] tracking-[-0.005em]"
            style={{
              borderColor: "rgba(25,35,26,0.2)",
              color: "rgba(25,35,26,0.75)",
            }}
          >
            <Icon name="plus" size={12} />
            Add item
          </button>
        </div>
      </Field>
    </>
  );
}

function AnnouncementInspector({ slide, onField }: InspectorProps) {
  const d = slide.data as {
    headline?: string;
    subtitle?: string;
    size?: "lg" | "xl" | "xxl";
  };
  return (
    <>
      <Field label="Headline">
        <TextField
          value={d.headline ?? ""}
          onChange={(v) => onField("headline", v)}
          placeholder="Big announcement"
          multiline
        />
      </Field>
      <Field label="Subtitle">
        <TextField
          value={d.subtitle ?? ""}
          onChange={(v) => onField("subtitle", v)}
          placeholder="Optional supporting line"
        />
      </Field>
      <Field label="Size">
        <SegmentedField
          value={d.size ?? "xl"}
          options={[
            { value: "lg", label: "Large" },
            { value: "xl", label: "XL" },
            { value: "xxl", label: "XXL" },
          ]}
          onChange={(v) => onField("size", v)}
        />
      </Field>
    </>
  );
}

function MarkdownInspector({ slide, onField }: InspectorProps) {
  const d = slide.data as { body?: string };
  return (
    <Field
      label="Markdown"
      hint="Supports headings, lists, bold, italic. Full rendering lands in Phase 3."
    >
      <TextField
        value={d.body ?? ""}
        onChange={(v) => onField("body", v)}
        placeholder="# Your heading\n\nWrite your content here."
        multiline
      />
    </Field>
  );
}

function VideoInspector({ slide, onField, onPickImage }: InspectorProps) {
  const d = slide.data as {
    src?: string;
    poster?: string;
    muted?: boolean;
    loop?: boolean;
  };
  return (
    <>
      <Field label="Video URL" hint="MP4 / WebM. Short, muted loops work best.">
        <TextField
          value={d.src ?? ""}
          onChange={(v) => onField("src", v)}
          placeholder="https://…"
        />
      </Field>
      <Field label="Poster image">
        <ImagePickerField
          value={d.poster ?? ""}
          onChange={(v) => onField("poster", v)}
          onPickImage={onPickImage}
        />
      </Field>
      <ToggleField
        value={d.muted ?? true}
        onChange={(v) => onField("muted", v)}
        label="Muted"
      />
      <ToggleField
        value={d.loop ?? true}
        onChange={(v) => onField("loop", v)}
        label="Loop"
      />
    </>
  );
}

function GalleryInspector({ slide, onField, onPickImage }: InspectorProps) {
  const d = slide.data as {
    items?: Array<{ img: string; caption?: string }>;
    layout?: "grid-2" | "grid-3" | "grid-4" | "feature";
  };
  const items = d.items ?? [];
  function addItem() {
    onField("items", [...items, { img: "" }]);
  }
  function updateItem(i: number, next: { img: string; caption?: string }) {
    onField(
      "items",
      items.map((it, idx) => (idx === i ? next : it)),
    );
  }
  function removeItem(i: number) {
    onField(
      "items",
      items.filter((_, idx) => idx !== i),
    );
  }
  return (
    <>
      <Field label="Layout">
        <SegmentedField
          value={d.layout ?? "grid-2"}
          options={[
            { value: "grid-2", label: "2" },
            { value: "grid-3", label: "3" },
            { value: "grid-4", label: "4" },
            { value: "feature", label: "Feature" },
          ]}
          onChange={(v) => onField("layout", v)}
        />
      </Field>
      <Field label="Photos">
        <div className="flex flex-col gap-[10px]">
          {items.map((it, i) => (
            <div
              key={i}
              className="rounded-[4px] border border-line bg-paper p-[10px]"
            >
              <ImagePickerField
                value={it.img}
                onChange={(v) => updateItem(i, { ...it, img: v })}
                onPickImage={onPickImage}
              />
              <div className="mt-[6px] flex gap-[6px]">
                <Input
                  placeholder="Caption (optional)"
                  value={it.caption ?? ""}
                  onChange={(e) =>
                    updateItem(i, { ...it, caption: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="cursor-pointer rounded-[3px] p-[4px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-[#8B3A2F]"
                  aria-label="Remove"
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="flex cursor-pointer items-center justify-center gap-[6px] rounded-[4px] border border-dashed px-3 py-[8px] text-[12px] tracking-[-0.005em]"
            style={{
              borderColor: "rgba(25,35,26,0.2)",
              color: "rgba(25,35,26,0.75)",
            }}
          >
            <Icon name="plus" size={12} />
            Add photo
          </button>
        </div>
      </Field>
    </>
  );
}

function CountdownInspector({ slide, onField }: InspectorProps) {
  const d = slide.data as {
    title?: string;
    targetAt?: number;
    style?: "days" | "full";
  };
  const dateValue = d.targetAt
    ? new Date(d.targetAt).toISOString().slice(0, 16)
    : "";
  return (
    <>
      <Field label="Title">
        <TextField
          value={d.title ?? ""}
          onChange={(v) => onField("title", v)}
          placeholder="Doors open in…"
        />
      </Field>
      <Field label="Target date & time">
        <input
          type="datetime-local"
          value={dateValue}
          onChange={(e) => {
            const t = e.target.value ? new Date(e.target.value).getTime() : null;
            onField("targetAt", t);
          }}
          className="w-full rounded-[4px] border border-line bg-paper px-3 py-[8px] text-[13px] text-ink focus:border-moss focus:outline-none"
        />
      </Field>
      <Field label="Style">
        <SegmentedField
          value={d.style ?? "days"}
          options={[
            { value: "days", label: "Days only" },
            { value: "full", label: "D / H / M / S" },
          ]}
          onChange={(v) => onField("style", v)}
        />
      </Field>
    </>
  );
}

function WeatherInspector({ slide, onField }: InspectorProps) {
  const d = slide.data as { city?: string; units?: "c" | "f" };
  return (
    <>
      <Field label="City">
        <TextField
          value={d.city ?? ""}
          onChange={(v) => onField("city", v)}
          placeholder="Austin, TX"
        />
      </Field>
      <Field label="Units">
        <SegmentedField
          value={d.units ?? "f"}
          options={[
            { value: "f", label: "°F" },
            { value: "c", label: "°C" },
          ]}
          onChange={(v) => onField("units", v)}
        />
      </Field>
      <div
        className="rounded-[4px] border border-line bg-[#FBF8F0] p-[12px] text-[11.5px] leading-[1.6] tracking-[-0.005em]"
        style={{ color: "rgba(25,35,26,0.65)" }}
      >
        Live weather fetch arrives in Phase 3 (via open-meteo).
      </div>
    </>
  );
}

function ClockInspector({ slide, onField }: InspectorProps) {
  const d = slide.data as {
    format?: "12h" | "24h";
    showSeconds?: boolean;
    showDate?: boolean;
  };
  return (
    <>
      <Field label="Format">
        <SegmentedField
          value={d.format ?? "12h"}
          options={[
            { value: "12h", label: "12-hour" },
            { value: "24h", label: "24-hour" },
          ]}
          onChange={(v) => onField("format", v)}
        />
      </Field>
      <ToggleField
        value={d.showSeconds ?? false}
        onChange={(v) => onField("showSeconds", v)}
        label="Show seconds"
      />
      <ToggleField
        value={d.showDate ?? true}
        onChange={(v) => onField("showDate", v)}
        label="Show date"
      />
    </>
  );
}

function EventCardInspector({ slide, events, onField }: InspectorProps) {
  const d = slide.data as { eventId?: string };
  return (
    <Field label="Event" hint="Pulls name, date, and color tag from your Events.">
      {events.length === 0 ? (
        <div
          className="rounded-[4px] border border-line bg-[#FBF8F0] p-[12px] text-[12px] tracking-[-0.005em]"
          style={{ color: "rgba(25,35,26,0.65)" }}
        >
          No events yet. Create one from the left sidebar.
        </div>
      ) : (
        <select
          value={d.eventId ?? ""}
          onChange={(e) => onField("eventId", e.target.value || undefined)}
          className="w-full rounded-[4px] border border-line bg-paper px-3 py-[8px] text-[13px] text-ink focus:border-moss focus:outline-none"
        >
          <option value="">Pick an event…</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

function SlideshowEmbedInspector({ slide, onField }: InspectorProps) {
  const d = slide.data as { slideshowId?: string };
  return (
    <Field
      label="Slideshow ID"
      hint="Paste the ID of another slideshow. Full picker + playback lands in Phase 3."
    >
      <TextField
        value={d.slideshowId ?? ""}
        onChange={(v) => onField("slideshowId", v)}
        placeholder="slideshow-id"
      />
    </Field>
  );
}
