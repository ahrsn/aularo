"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { Icon } from "@/components/ui/icon";
import { Wordmark } from "@/components/ui/wordmark";
import { firebaseAuth } from "@/lib/firebase-client";
import { cn } from "@/lib/utils";

type SidebarEvent = {
  id: string;
  name: string;
  startAt: number | null;
  endAt: number | null;
};

const nav = [
  { href: "/app/library", icon: "images", label: "Slideshows" },
  { href: "/app/displays", icon: "monitor", label: "Displays" },
  { href: "/app/schedule", icon: "calendar-blank", label: "Schedule" },
  { href: "/app/media", icon: "folder-simple", label: "Media" },
  { href: "/app/insights", icon: "chart-line", label: "Insights" },
];

const bottom = [{ href: "/app/settings", icon: "gear", label: "Settings" }];

function NavItem({
  href,
  icon,
  label,
  selected,
}: {
  href: string;
  icon: string;
  label: string;
  selected: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "mx-2 my-[1px] flex items-center gap-[10px] rounded-[4px] px-[10px] py-[7px] text-[13.5px] tracking-[-0.005em] transition-colors",
        selected
          ? "bg-moss-soft font-medium text-moss"
          : "text-ink hover:bg-[rgba(25,35,26,0.04)]",
      )}
    >
      <Icon
        name={icon}
        size={16}
        style={{ color: selected ? "#3B5A41" : "#6B7268" }}
      />
      {label}
    </Link>
  );
}

function UserMenu({
  userInitials,
  userName,
  workspaceName,
}: {
  userInitials: string;
  userName: string;
  workspaceName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function onSignOut() {
    if (busy) return;
    setBusy(true);
    await signOut(firebaseAuth()).catch(() => {});
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mx-2 flex w-[calc(100%-16px)] items-center gap-[10px] rounded-[4px] px-[10px] py-[7px] text-left transition-colors hover:bg-[rgba(25,35,26,0.04)]"
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-moss text-paper"
          style={{
            fontFamily: "var(--font-newsreader), serif",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {userInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-medium tracking-[-0.005em] text-ink">
            {userName}
          </div>
          <div className="truncate text-[11px] tracking-[-0.005em] text-muted">
            {workspaceName}
          </div>
        </div>
        <Icon
          name="caret-up-down"
          size={14}
          style={{ color: "#9AA099", flexShrink: 0 }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-[calc(100%+8px)] overflow-hidden rounded-[6px] border border-line bg-surface"
          style={{
            bottom: 0,
            minWidth: 180,
            boxShadow: "0 8px 24px rgba(14,20,16,0.12)",
            zIndex: 50,
          }}
        >
          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={onSignOut}
            className="flex w-full items-center gap-[10px] px-3 py-2 text-left text-[13px] tracking-[-0.005em] text-ink hover:bg-[rgba(25,35,26,0.04)] disabled:opacity-60"
          >
            <Icon name="sign-out" size={14} style={{ color: "#6B7268" }} />
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  workspaceName = "Lakeside Hall",
  userInitials = "CL",
  userName = "You",
  events = [],
}: {
  workspaceName?: string;
  userInitials?: string;
  userName?: string;
  events?: SidebarEvent[];
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const isSelected = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/") || false;
  const activeEventId =
    pathname?.startsWith("/app/library") ? (params?.get("event") ?? null) : null;

  return (
    <aside
      className="sticky top-0 flex h-screen flex-col border-r border-line bg-paper"
      style={{ width: 240 }}
    >
      <Link href="/" className="px-[18px] pb-[10px] pt-[18px] text-ink">
        <Wordmark size={22} />
      </Link>
      <nav className="pb-[6px] pt-[14px]">
        {nav.map((it) => (
          <NavItem
            key={it.href}
            href={it.href}
            icon={it.icon}
            label={it.label}
            selected={isSelected(it.href)}
          />
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto px-4 pt-[18px]">
        <div className="mb-[10px] flex items-center justify-between">
          <div
            className="text-muted-2 uppercase"
            style={{
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: "0.08em",
            }}
          >
            Events
          </div>
          <Link
            href="/app/library"
            className="rounded-[3px] p-[2px] text-muted-2 hover:bg-[rgba(25,35,26,0.04)] hover:text-muted"
            aria-label="Manage events"
          >
            <Icon name="plus" size={11} />
          </Link>
        </div>
        {events.length === 0 ? (
          <div className="text-[11px] leading-[1.4] tracking-[-0.005em] text-muted-2">
            No events yet. Create one from the Library.
          </div>
        ) : (
          <div className="flex flex-col">
            {events.map((e) => {
              const sel = activeEventId === e.id;
              return (
                <Link
                  key={e.id}
                  href={`/app/library?event=${encodeURIComponent(e.id)}`}
                  className="rounded-[3px] px-[8px] py-[6px] transition-colors hover:bg-[rgba(25,35,26,0.04)]"
                  style={{
                    background: sel ? "#FBF8F0" : "transparent",
                    border: sel
                      ? "1px solid var(--line)"
                      : "1px solid transparent",
                    marginBottom: 2,
                  }}
                >
                  <div
                    className="flex items-center gap-[6px] text-[12.5px] tracking-[-0.005em] text-ink"
                    style={{ fontWeight: sel ? 500 : 400 }}
                  >
                    {sel && (
                      <span
                        className="rounded-full"
                        style={{
                          width: 5,
                          height: 5,
                          background: "#3B5A41",
                        }}
                      />
                    )}
                    <span className="truncate">{e.name}</span>
                  </div>
                  <div
                    className="mt-[1px] truncate text-[11px] tracking-[-0.005em] text-muted"
                    style={{ paddingLeft: sel ? 11 : 0 }}
                  >
                    {formatEventDates(e.startAt, e.endAt)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="pb-3">
        <div className="mx-4 mb-[10px] mt-2 h-px bg-line" />
        {bottom.map((it) => (
          <NavItem
            key={it.href}
            href={it.href}
            icon={it.icon}
            label={it.label}
            selected={isSelected(it.href)}
          />
        ))}
        <div className="pt-[10px]">
          <UserMenu
            userInitials={userInitials}
            userName={userName}
            workspaceName={workspaceName}
          />
        </div>
      </div>
    </aside>
  );
}

function formatEventDates(start: number | null, end: number | null): string {
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
