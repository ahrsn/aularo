"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import {
  disconnectIntegration,
  syncDriveFolder,
  syncDropboxFolder,
} from "@/lib/actions";
import { useToast } from "@/components/ui/toast";
import type { Integration, IntegrationProvider } from "@/lib/schema";

type CatalogEntry = {
  provider: IntegrationProvider;
  name: string;
  logo: string;
  desc: string;
  category: "storage" | "media" | "calendar" | "comms" | "automation" | "design";
};

const FEATURED: CatalogEntry[] = [
  {
    provider: "drive",
    name: "Google Drive",
    logo: "https://ssl.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png",
    desc: "Sync photos from a Drive folder — changes mirror to Clarra.",
    category: "storage",
  },
  {
    provider: "dropbox",
    name: "Dropbox",
    logo: "https://cdn.simpleicons.org/dropbox",
    desc: "Watch shared folders from vendors and speakers.",
    category: "storage",
  },
];

const CATALOG: CatalogEntry[] = [
  {
    provider: "zapier",
    name: "Zapier",
    logo: "https://cdn.simpleicons.org/zapier/FF4A00",
    desc: "Connect Clarra to 7,000+ apps — no-code automation",
    category: "automation",
  },
  {
    provider: "n8n",
    name: "n8n",
    logo: "https://cdn.simpleicons.org/n8n/EA4B71",
    desc: "Trigger workflows on pair, heartbeat, submission",
    category: "automation",
  },
  {
    provider: "google-calendar",
    name: "Google Calendar",
    logo: "https://ssl.gstatic.com/images/branding/product/2x/calendar_2020q4_48dp.png",
    desc: "Publish your event calendar as slideshows",
    category: "calendar",
  },
  {
    provider: "slack",
    name: "Slack",
    logo: "https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png",
    desc: "Incident pings and daily summaries to a channel",
    category: "comms",
  },
  {
    provider: "unsplash",
    name: "Unsplash",
    logo: "https://cdn.simpleicons.org/unsplash/0E1410",
    desc: "Royalty-free photography, searchable in Media",
    category: "media",
  },
  {
    provider: "canva",
    name: "Canva",
    logo: "https://www.google.com/s2/favicons?domain=canva.com&sz=128",
    desc: "Use Canva designs as slides — updates live",
    category: "design",
  },
];

function bannerFor(name: string, status: string | null | undefined) {
  if (!status) return null;
  if (status === "connected")
    return { kind: "ok" as const, msg: `${name} connected.` };
  if (status === "state_mismatch")
    return {
      kind: "err" as const,
      msg: `${name} security check failed. Start the connect flow again.`,
    };
  if (status === "wrong_user")
    return {
      kind: "err" as const,
      msg: `${name}: wrong account. Sign in as the right user and retry.`,
    };
  return { kind: "err" as const, msg: `${name} connection failed. Try again.` };
}

export function IntegrationsClient({
  canManage,
  integrations,
}: {
  canManage: boolean;
  integrations: Integration[];
}) {
  const params = useSearchParams();
  const driveStatus = params?.get("drive");
  const dropboxStatus = params?.get("dropbox");
  const banner =
    bannerFor("Google Drive", driveStatus) ??
    bannerFor("Dropbox", dropboxStatus);

  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? CATALOG.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q) ||
          c.category.includes(q),
      )
    : CATALOG;

  return (
    <div className="flex flex-col gap-6">
      {banner && (
        <div
          className="rounded-[4px] p-3 text-[12.5px] tracking-[-0.005em]"
          style={{
            background: banner.kind === "ok" ? "#E8EDE6" : "#F3E4E0",
            color: banner.kind === "ok" ? "#3B5A41" : "#8B3A2F",
          }}
        >
          {banner.msg}
        </div>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            Primary storage
          </div>
          <div className="text-[11.5px] tracking-[-0.005em] text-muted-2">
            Where your media lives
          </div>
        </div>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}
        >
          {FEATURED.map((c) => (
            <FeaturedCard
              key={c.provider}
              info={c}
              state={integrations.find((i) => i.provider === c.provider)}
              canManage={canManage}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            More connections
          </div>
          <Input
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-7 w-56 text-[12.5px]"
          />
        </div>
        <ul className="flex flex-col overflow-hidden rounded-[4px] border border-line bg-surface">
          {filtered.map((c, idx) => (
            <IntegrationRow
              key={c.provider}
              info={c}
              state={integrations.find((i) => i.provider === c.provider)}
              canManage={canManage}
              isLast={idx === filtered.length - 1}
            />
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-[12.5px] text-muted">
              No connections match “{query}”.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function FeaturedCard({
  info,
  state,
  canManage,
}: {
  info: CatalogEntry;
  state: Integration | undefined;
  canManage: boolean;
}) {
  return (
    <IntegrationCard info={info} state={state} canManage={canManage} />
  );
}

function IntegrationRow({
  info,
  state,
  canManage,
  isLast,
}: {
  info: CatalogEntry;
  state: Integration | undefined;
  canManage: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const connected = state?.status === "connected";
  const available = info.provider === "drive" || info.provider === "dropbox";

  function onConnect() {
    if (info.provider === "drive") {
      window.location.href = "/api/auth/drive/start";
      return;
    }
    if (info.provider === "dropbox") {
      window.location.href = "/api/auth/dropbox/start";
      return;
    }
    toast.info(`${info.name} — coming soon`, {
      description: "We're still building this one.",
    });
  }

  function doDisconnect() {
    setConfirmOpen(false);
    startTransition(async () => {
      await disconnectIntegration({ provider: info.provider });
      router.refresh();
      toast.success("Integration disconnected");
    });
  }

  return (
    <li
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: isLast ? "none" : "1px solid var(--line)" }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px]"
        style={{ background: "#F5F1E8", border: "1px solid var(--line)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={info.logo}
          alt=""
          width={18}
          height={18}
          style={{ width: 18, height: 18, objectFit: "contain" }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium tracking-[-0.005em] text-ink">
            {info.name}
          </span>
          <span
            className="rounded-[3px] font-sans uppercase text-muted-2"
            style={{
              fontSize: 9.5,
              fontWeight: 500,
              letterSpacing: "0.08em",
            }}
          >
            · {info.category}
          </span>
          {connected && (
            <span
              className="rounded-[3px] font-sans uppercase"
              style={{
                fontSize: 9.5,
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: "#3B5A41",
                background: "#E8EDE6",
                padding: "2px 5px",
              }}
            >
              Connected
            </span>
          )}
        </div>
        <div
          className="truncate text-[12px] tracking-[-0.005em] text-muted"
          style={{ lineHeight: 1.5 }}
        >
          {info.desc}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {connected ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canManage || busy}
            onClick={() => setConfirmOpen(true)}
          >
            Disconnect
          </Button>
        ) : available ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canManage}
            onClick={onConnect}
          >
            Connect
          </Button>
        ) : (
          <span
            className="rounded-[3px] font-sans uppercase"
            style={{
              fontSize: 9.5,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "var(--muted-2)",
              background: "transparent",
              border: "1px solid var(--line)",
              padding: "3px 7px",
            }}
          >
            Coming soon
          </span>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Disconnect ${info.name}?`}
        description="Synced media stays. New changes stop syncing."
        confirmLabel="Disconnect"
        variant="danger"
        onConfirm={doDisconnect}
        onCancel={() => setConfirmOpen(false)}
      />
    </li>
  );
}

function IntegrationCard({
  info,
  state,
  canManage,
}: {
  info: CatalogEntry;
  state: Integration | undefined;
  canManage: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, startTransition] = useTransition();
  const [manageOpen, setManageOpen] = useState(false);
  const [syncInput, setSyncInput] = useState("");
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const connected = state?.status === "connected";
  const syncable = info.provider === "drive" || info.provider === "dropbox";

  function doDisconnect() {
    setConfirmOpen(false);
    startTransition(async () => {
      await disconnectIntegration({ provider: info.provider });
      router.refresh();
      toast.success("Integration disconnected");
    });
  }

  function onConnect() {
    if (info.provider === "drive") {
      window.location.href = "/api/auth/drive/start";
      return;
    }
    if (info.provider === "dropbox") {
      window.location.href = "/api/auth/dropbox/start";
      return;
    }
    toast.info(`${info.name} — coming soon`, {
      description: "We're still building this one.",
    });
  }

  function onSync(e: React.FormEvent) {
    e.preventDefault();
    setSyncMsg(null);
    startTransition(async () => {
      try {
        if (info.provider === "drive") {
          const { created, total } = await syncDriveFolder({
            folderId: syncInput,
            maxFiles: 100,
          });
          setSyncMsg(
            `Imported ${created} new file${created === 1 ? "" : "s"} (of ${total})`,
          );
          toast.success("Folder synced");
        } else if (info.provider === "dropbox") {
          const { created, total } = await syncDropboxFolder({
            path: syncInput,
            maxFiles: 100,
          });
          setSyncMsg(
            `Imported ${created} new file${created === 1 ? "" : "s"} (of ${total})`,
          );
          toast.success("Folder synced");
        }
        router.refresh();
      } catch (e) {
        toast.error(e, "Sync failed.");
      }
    });
  }

  return (
    <div
      className="flex flex-col rounded-[4px] border border-line bg-surface"
      style={{ padding: 18 }}
    >
      <div className="flex flex-1 items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px]"
          style={{ background: "#F5F1E8", border: "1px solid var(--line)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={info.logo}
            alt=""
            width={22}
            height={22}
            style={{ width: 22, height: 22, objectFit: "contain" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[14px] font-medium tracking-[-0.005em] text-ink">
              {info.name}
            </div>
            {connected && (
              <span
                className="rounded-[3px] font-sans uppercase"
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  color: "#3B5A41",
                  background: "#E8EDE6",
                  padding: "2px 6px",
                }}
              >
                Connected
              </span>
            )}
          </div>
          <div
            className="mt-1 text-[12.5px] tracking-[-0.005em] text-muted"
            style={{ lineHeight: 1.5 }}
          >
            {info.desc}
          </div>
          {connected && state?.accountEmail && (
            <div
              className="mt-1.5 font-mono text-muted-2"
              style={{ fontSize: 11, letterSpacing: "-0.005em" }}
            >
              {state.accountEmail}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        {connected ? (
          <>
            {syncable && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon="gear"
                disabled={!canManage}
                onClick={() => setManageOpen((o) => !o)}
              >
                Manage
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canManage || busy}
              onClick={() => setConfirmOpen(true)}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!canManage}
            onClick={onConnect}
          >
            Connect
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Disconnect ${info.name}?`}
        description="Synced media stays. New changes stop syncing."
        confirmLabel="Disconnect"
        variant="danger"
        onConfirm={doDisconnect}
        onCancel={() => setConfirmOpen(false)}
      />

      {connected && syncable && manageOpen && (
        <form
          onSubmit={onSync}
          className="mt-3 flex flex-col gap-2 rounded-[4px] border border-line"
          style={{ background: "#F5F1E8", padding: 12 }}
        >
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            Sync a folder
          </div>
          <Input
            placeholder={
              info.provider === "drive"
                ? "Drive folder ID"
                : "Dropbox path, e.g. /Events/Design Week"
            }
            value={syncInput}
            onChange={(e) => setSyncInput(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <div className="text-[11px] tracking-[-0.005em] text-muted">
              {syncMsg ?? "Metadata only — files stay where they are."}
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon="arrows-clockwise"
              disabled={busy || syncInput.trim().length < 2}
            >
              {busy ? "Syncing…" : "Sync"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
