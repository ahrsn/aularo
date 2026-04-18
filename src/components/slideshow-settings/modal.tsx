"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { togglePublicPreview, updateSlideshow } from "@/lib/actions";
import type { Slideshow } from "@/lib/schema";

type Tab = "playback" | "look" | "schedule" | "access";

const tabs: Array<{ key: Tab; label: string; icon: string }> = [
  { key: "playback", label: "Playback", icon: "play" },
  { key: "look", label: "Look & feel", icon: "palette" },
  { key: "schedule", label: "Schedule", icon: "calendar-blank" },
  { key: "access", label: "Access", icon: "lock-key" },
];

export function SlideshowSettingsModal({
  open,
  onClose,
  slideshow,
}: {
  open: boolean;
  onClose: () => void;
  slideshow: Slideshow | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("playback");
  const [state, setState] = useState<Slideshow | null>(slideshow);
  const [saved, setSaved] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    setState(slideshow);
    setTab("playback");
  }, [slideshow]);

  if (!open || !state) return null;

  function applyPatch(patch: Partial<Slideshow>) {
    const next = { ...state!, ...patch };
    setState(next);
    startTransition(async () => {
      try {
        await updateSlideshow({
          id: next.id,
          name: patch.name ?? undefined,
          duration: patch.duration,
          shuffle: patch.shuffle,
          loop: patch.loop,
          theme: patch.theme,
          captions: patch.captions,
          transition: patch.transition,
          kenBurns: patch.kenBurns,
        });
        setSaved("Saved just now");
        router.refresh();
      } catch {
        setSaved("Couldn't save");
      }
    });
  }

  async function onTogglePublic(enabled: boolean) {
    startTransition(async () => {
      const { slug } = await togglePublicPreview({ id: state!.id, enabled });
      setState({ ...state!, publicSlug: slug });
      router.refresh();
    });
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.42)", backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid w-full overflow-hidden rounded-[6px] bg-surface"
        style={{
          maxWidth: 880,
          maxHeight: "88vh",
          gridTemplateColumns: "220px 1fr",
          boxShadow: "0 32px 80px -16px rgba(14,20,16,0.4)",
        }}
      >
        <Sidebar
          tab={tab}
          onTab={setTab}
          name={state.name}
          slideCount={(state.slides ?? []).length}
          duration={state.duration}
        />
        <section className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between border-b border-line px-7 py-5">
            <div
              className="font-serif"
              style={{
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                fontVariationSettings: "'opsz' 48",
              }}
            >
              {tabs.find((t) => t.key === tab)!.label}
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[4px] border border-line bg-transparent text-muted"
              aria-label="Close"
            >
              <Icon name="x" size={14} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-7 py-2 pb-6">
            {tab === "playback" && (
              <PlaybackTab
                duration={Math.round((state.duration ?? 6500) / 1000)}
                shuffle={state.shuffle}
                loop={state.loop}
                transition={state.transition}
                kenBurns={state.kenBurns}
                onChange={(p) => applyPatch(p)}
              />
            )}
            {tab === "look" && (
              <LookTab
                theme={state.theme}
                captions={state.captions}
                onChange={(p) => applyPatch(p)}
              />
            )}
            {tab === "schedule" && <ScheduleTab />}
            {tab === "access" && (
              <AccessTab slug={state.publicSlug} onToggle={onTogglePublic} />
            )}
          </div>

          <footer
            className="flex items-center justify-between border-t border-line px-7 py-[14px]"
            style={{ background: "#F5F1E8" }}
          >
            <div className="text-[11.5px] tracking-[-0.005em] text-muted">
              {saved || "Changes save as you go. Live screens update in ~2s."}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon="check"
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

function Sidebar({
  tab,
  onTab,
  name,
  slideCount,
  duration,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  name: string;
  slideCount: number;
  duration: number;
}) {
  return (
    <aside
      className="flex flex-col border-r border-line bg-paper"
      style={{ padding: "24px 0" }}
    >
      <div className="border-b border-line pb-[18px]" style={{ padding: "0 22px 18px" }}>
        <div className="text-label mb-[6px]">Slideshow</div>
        <div
          className="font-serif leading-[1.2] text-ink"
          style={{
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "-0.018em",
            fontVariationSettings: "'opsz' 48",
          }}
        >
          {name || "Untitled"}
        </div>
        <div className="mt-1 text-[11.5px] tracking-[-0.005em] text-muted">
          {slideCount} slides · {Math.round(duration / 1000)}s per slide
        </div>
      </div>

      <div className="flex-1 py-3">
        {tabs.map((t) => {
          const sel = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onTab(t.key)}
              className="flex w-full cursor-pointer items-center gap-[10px] text-left text-[13px] tracking-[-0.005em]"
              style={{
                padding: "9px 22px 9px 19px",
                border: "none",
                background: sel ? "#E8EDE6" : "transparent",
                color: sel ? "#3B5A41" : "#0E1410",
                fontWeight: sel ? 500 : 400,
                borderLeft: `3px solid ${sel ? "#3B5A41" : "transparent"}`,
              }}
            >
              <Icon
                name={t.icon}
                size={15}
                style={{ color: sel ? "#3B5A41" : "#6B7268" }}
              />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="border-t border-line" style={{ padding: "18px 22px" }}>
        <div className="text-[11px] leading-[1.5] tracking-[-0.005em] text-muted">
          Changes save as you go. Live screens update within a few seconds.
        </div>
      </div>
    </aside>
  );
}

// ── Rows + primitives ──────────────────────────────────────────────────

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid items-center gap-6 border-b border-line"
      style={{ gridTemplateColumns: "1fr auto", padding: "18px 0" }}
    >
      <div className="min-w-0">
        <div className="text-[13.5px] font-medium tracking-[-0.005em] text-ink">
          {label}
        </div>
        {hint && (
          <div className="mt-[3px] text-[12px] tracking-[-0.005em] text-muted">
            {hint}
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative shrink-0 cursor-pointer rounded-[20px]"
      style={{
        width: 36,
        height: 20,
        padding: 0,
        border: "none",
        background: on ? "#3B5A41" : "#D4CFC0",
      }}
      aria-pressed={on}
    >
      <span
        className="absolute rounded-full transition-[left] duration-[140ms]"
        style={{
          top: 2,
          left: on ? 18 : 2,
          width: 16,
          height: 16,
          background: "#F5F1E8",
        }}
      />
    </button>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ v: T; l: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="inline-flex rounded-[4px] border border-line bg-paper"
      style={{ padding: 2 }}
    >
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className="cursor-pointer rounded-[3px] border-none"
          style={{
            fontSize: 12,
            fontWeight: 500,
            padding: "5px 11px",
            background: value === o.v ? "#19231A" : "transparent",
            color: value === o.v ? "#F5F1E8" : "#0E1410",
            letterSpacing: "-0.005em",
          }}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

// ── Tabs ────────────────────────────────────────────────────────────────

function PlaybackTab({
  duration,
  shuffle,
  loop,
  transition,
  kenBurns,
  onChange,
}: {
  duration: number;
  shuffle: boolean;
  loop: boolean;
  transition: "fade" | "cut" | "slide";
  kenBurns: boolean;
  onChange: (p: Partial<Slideshow>) => void;
}) {
  return (
    <>
      <Row
        label="Slide duration"
        hint="How long each slide stays on screen"
      >
        <div className="flex items-center gap-[14px]">
          <input
            type="range"
            min={2}
            max={30}
            step={1}
            value={duration}
            onChange={(e) =>
              onChange({ duration: Number(e.target.value) * 1000 })
            }
            style={{ width: 180 }}
          />
          <div
            className="min-w-[40px] text-right font-mono text-[13px] text-ink"
            style={{ letterSpacing: "0.02em" }}
          >
            {duration}s
          </div>
        </div>
      </Row>
      <Row
        label="Shuffle order"
        hint="Randomize slides each loop. Great for photo reels, bad for agendas."
      >
        <Toggle on={shuffle} onChange={(v) => onChange({ shuffle: v })} />
      </Row>
      <Row
        label="Loop"
        hint="Restart at the beginning when the last slide ends"
      >
        <Toggle on={loop} onChange={(v) => onChange({ loop: v })} />
      </Row>
      <Row label="Transition" hint="How one slide becomes the next">
        <Segmented
          value={transition}
          options={[
            { v: "fade", l: "Fade" },
            { v: "slide", l: "Slide" },
            { v: "cut", l: "Cut" },
          ]}
          onChange={(v) => onChange({ transition: v })}
        />
      </Row>
      <Row
        label="Ken Burns effect"
        hint="Slow pan and zoom on photos. Adds life to static images."
      >
        <Toggle on={kenBurns} onChange={(v) => onChange({ kenBurns: v })} />
      </Row>
    </>
  );
}

function LookTab({
  theme,
  captions,
  onChange,
}: {
  theme: "dark" | "light";
  captions: boolean;
  onChange: (p: Partial<Slideshow>) => void;
}) {
  return (
    <>
      <Row
        label="Theme"
        hint="The background when a photo doesn't fill the screen"
      >
        <Segmented
          value={theme}
          options={[
            { v: "dark", l: "Dark" },
            { v: "light", l: "Light" },
          ]}
          onChange={(v) => onChange({ theme: v })}
        />
      </Row>
      <Row
        label="Show captions"
        hint="Photo captions appear at the bottom center"
      >
        <Toggle on={captions} onChange={(v) => onChange({ captions: v })} />
      </Row>
      <div
        className="mt-5 rounded-[4px] border border-line p-[18px]"
        style={{ background: "#F5F1E8" }}
      >
        <div className="text-label mb-[10px]">Preview</div>
        <div
          className="relative overflow-hidden rounded-[3px]"
          style={{ aspectRatio: "16 / 9", background: "#19231A" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 40%, #3A433B 0%, #19231A 70%)",
            }}
          />
          <div
            className="absolute flex items-center justify-center rounded-[2px] text-muted-2"
            style={{
              inset: "12% 30%",
              background: "#EEE9DB",
            }}
          >
            <Icon name="image" size={24} />
          </div>
          {captions && (
            <div
              className="absolute bottom-3 left-0 right-0 text-center italic"
              style={{
                color: "#F5F1E8",
                fontFamily: "var(--font-newsreader), serif",
                fontSize: 11,
                opacity: 0.9,
              }}
            >
              Caption appears here
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ScheduleTab() {
  return (
    <div
      className="flex items-start gap-3 rounded-[4px] p-[16px]"
      style={{ background: "#F3EBD8", marginTop: 18 }}
    >
      <Icon name="info" size={16} style={{ color: "#8B6B2F", marginTop: 2 }} />
      <div
        className="text-[12.5px] leading-[1.5] tracking-[-0.005em]"
        style={{ color: "#8B6B2F" }}
      >
        Per-slideshow time windows live under{" "}
        <span className="font-medium">Schedule</span>. Add a block there to
        assign this slideshow to a display during a specific window.
      </div>
    </div>
  );
}

function AccessTab({
  slug,
  onToggle,
}: {
  slug: string | null | undefined;
  onToggle: (enabled: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const publicUrl =
    slug && typeof window !== "undefined"
      ? `${window.location.origin}/s/${slug}`
      : slug
        ? `/s/${slug}`
        : "";

  async function copy() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <Row
        label="Public preview link"
        hint="Anyone with the link can view — not edit. Revoke anytime."
      >
        <Toggle on={!!slug} onChange={onToggle} />
      </Row>
      {slug && (
        <div
          className="flex gap-2 rounded-[4px] border border-line"
          style={{ padding: "10px 12px", background: "#F5F1E8", marginTop: 14 }}
        >
          <div
            className="flex-1 truncate font-mono text-[12px] tracking-[0.01em] text-ink"
          >
            {publicUrl}
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={copied ? "check" : "copy"}
            onClick={copy}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      )}
      <Row
        label="Workspace members"
        hint="Everyone in your workspace with editor role or above can edit."
      >
        <div className="text-[12.5px] tracking-[-0.005em] text-muted">
          Managed in Settings
        </div>
      </Row>
    </>
  );
}
