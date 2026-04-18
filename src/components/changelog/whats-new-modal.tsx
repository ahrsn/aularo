"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useMountTransition } from "@/components/ui/motion";
import { acknowledgeChangelog } from "@/lib/actions";
import type { ChangelogRelease } from "@/lib/changelog";

const LOCAL_KEY = "clarra-last-seen-changelog";
const SUPPRESS_KEY = "clarra-suppress-changelog";

type Props = {
  release: ChangelogRelease;
  lastSeenVersion: string | null;
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function WhatsNewModal({ release, lastSeenVersion }: Props) {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [pending, startTransition] = useTransition();
  const { mounted, state } = useMountTransition(open, 320);

  useEffect(() => {
    if (localStorage.getItem(SUPPRESS_KEY) === "1") return;
    const localSeen = localStorage.getItem(LOCAL_KEY);
    const seen = lastSeenVersion ?? localSeen;
    if (seen !== release.version) {
      const t = setTimeout(() => setOpen(true), 240);
      return () => clearTimeout(t);
    }
  }, [release.version, lastSeenVersion]);

  useEffect(() => {
    function onTrigger() {
      setOpen(true);
    }
    window.addEventListener("clarra:open-changelog", onTrigger);
    return () => window.removeEventListener("clarra:open-changelog", onTrigger);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    setOpen(false);
    localStorage.setItem(LOCAL_KEY, release.version);
    if (dontShowAgain) localStorage.setItem(SUPPRESS_KEY, "1");
    startTransition(() => {
      acknowledgeChangelog(release.version).catch(() => {});
    });
  }

  if (!mounted) return null;

  return (
    <div
      data-motion="overlay"
      data-state={state}
      onClick={dismiss}
      className="fixed inset-0 z-[120] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.6)", left: "var(--overlay-left, 0px)" }}
    >
      <div
        data-motion="panel"
        data-state={state}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
        className="flex w-full max-w-[560px] flex-col overflow-hidden rounded-[10px] border border-line bg-surface"
        style={{
          maxHeight: "min(84vh, 760px)",
          boxShadow: "0 32px 72px -20px rgba(14,20,16,0.45)",
        }}
      >
        <div
          className="relative flex flex-col gap-[14px] px-[32px] pb-[24px] pt-[28px]"
          style={{
            background:
              "linear-gradient(180deg, #FBF8F0 0%, #F5F1E8 100%)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="absolute right-[14px] top-[14px] rounded-[4px] p-[6px] text-muted-2 transition-colors duration-quiet ease-quiet hover:bg-[rgba(25,35,26,0.06)] hover:text-muted"
          >
            <Icon name="x" size={14} />
          </button>

          <div className="flex flex-col items-start gap-[14px]">
            <div className="flex flex-wrap items-center gap-[8px]">
              <span
                className="inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[10.5px] font-medium uppercase tracking-[0.09em]"
                style={{
                  background: "var(--moss-soft)",
                  color: "var(--moss)",
                }}
              >
                <Icon name="sparkle" size={11} />
                New in Clarra
              </span>
              <span className="text-[11px] tracking-[-0.005em] text-muted-2">
                v{release.version} · {formatDate(release.date)}
              </span>
            </div>

            <div className="flex flex-col gap-[8px]">
              {release.lede.map((para, i) => (
                <p
                  key={i}
                  id={i === 0 ? "whats-new-title" : undefined}
                  className={
                    i === 0
                      ? "text-ink"
                      : "text-[14px] leading-[1.55] tracking-[-0.005em] text-muted"
                  }
                  style={
                    i === 0
                      ? {
                          fontFamily: "var(--font-newsreader), serif",
                          fontSize: 30,
                          lineHeight: 1.15,
                          letterSpacing: "-0.025em",
                          fontWeight: 500,
                        }
                      : undefined
                  }
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto px-[32px] py-[24px]"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="flex flex-col gap-[22px]">
            {release.groups.map((group) => (
              <section key={group.title} className="flex flex-col gap-[10px]">
                <div className="flex items-center gap-[10px]">
                  <span
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
                    style={{
                      background: "var(--moss-soft)",
                      color: "var(--moss)",
                    }}
                  >
                    <Icon name={group.icon} size={13} />
                  </span>
                  <h3
                    className="text-ink"
                    style={{
                      fontFamily: "var(--font-newsreader), serif",
                      fontSize: 18,
                      fontWeight: 500,
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {group.title}
                  </h3>
                </div>
                {group.body.length > 0 && (
                  <div className="flex flex-col gap-[6px] pl-[36px]">
                    {group.body.map((para, i) => (
                      <p
                        key={i}
                        className="text-[13.5px] leading-[1.6] tracking-[-0.005em] text-muted"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                )}
                {group.items.length > 0 && (
                  <ul className="flex flex-col gap-[6px] pl-[36px]">
                    {group.items.map((item, i) => (
                      <li
                        key={i}
                        className="relative pl-[14px] text-[13.5px] leading-[1.55] tracking-[-0.005em] text-ink"
                      >
                        <span
                          className="absolute left-0 top-[10px] h-[4px] w-[4px] rounded-full"
                          style={{ background: "var(--moss)" }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>

        <div
          className="flex items-center justify-between gap-3 border-t border-line px-[24px] py-[14px]"
          style={{ background: "var(--paper)" }}
        >
          <label className="flex cursor-pointer items-center gap-[8px] select-none">
            <span
              className="relative flex h-[15px] w-[15px] items-center justify-center rounded-[3px] border transition-[background,border-color] duration-quiet ease-quiet"
              style={{
                borderColor: dontShowAgain
                  ? "var(--moss)"
                  : "var(--line-strong)",
                background: dontShowAgain ? "var(--moss)" : "var(--surface)",
              }}
            >
              {dontShowAgain && (
                <Icon
                  name="check"
                  size={10}
                  style={{ color: "var(--paper)" }}
                />
              )}
            </span>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="sr-only"
            />
            <span className="text-[12px] tracking-[-0.005em] text-muted">
              Don&apos;t show future updates
            </span>
          </label>
          <Button
            variant="primary"
            size="sm"
            onClick={dismiss}
            disabled={pending}
            autoFocus
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
