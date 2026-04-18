"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog, InfoAlert } from "@/components/ui/alert-dialog";
import {
  disconnectIntegration,
  syncDriveFolder,
  syncDropboxFolder,
} from "@/lib/actions";
import type { Integration, IntegrationProvider } from "@/lib/schema";

type CatalogEntry = {
  provider: IntegrationProvider;
  name: string;
  logo: string;
  desc: string;
};

const CATALOG: CatalogEntry[] = [
  {
    provider: "drive",
    name: "Google Drive",
    logo: "https://cdn.simpleicons.org/googledrive",
    desc: "Sync photos from a Drive folder — changes mirror to Clarra",
  },
  {
    provider: "dropbox",
    name: "Dropbox",
    logo: "https://cdn.simpleicons.org/dropbox",
    desc: "Shared folders from vendors and speakers",
  },
  {
    provider: "unsplash",
    name: "Unsplash",
    logo: "https://cdn.simpleicons.org/unsplash/0E1410",
    desc: "Royalty-free photography, searchable in Media",
  },
  {
    provider: "google-calendar",
    name: "Google Calendar",
    logo: "https://cdn.simpleicons.org/googlecalendar",
    desc: "Publish your event calendar as slideshows",
  },
  {
    provider: "slack",
    name: "Slack",
    logo: "https://cdn.simpleicons.org/slack",
    desc: "Incident pings and daily summaries to a channel",
  },
  {
    provider: "figma",
    name: "Figma",
    logo: "https://cdn.simpleicons.org/figma",
    desc: "Use Figma frames as slides — updates live",
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

  return (
    <div className="flex flex-col gap-4">
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
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}
      >
        {CATALOG.map((c) => (
          <IntegrationCard
            key={c.provider}
            info={c}
            state={integrations.find((i) => i.provider === c.provider)}
            canManage={canManage}
          />
        ))}
      </div>
    </div>
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
  const [busy, startTransition] = useTransition();
  const [manageOpen, setManageOpen] = useState(false);
  const [syncInput, setSyncInput] = useState("");
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const connected = state?.status === "connected";
  const syncable = info.provider === "drive" || info.provider === "dropbox";

  function doDisconnect() {
    setConfirmOpen(false);
    startTransition(async () => {
      await disconnectIntegration({ provider: info.provider });
      router.refresh();
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
    setAlertOpen(true);
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
        } else if (info.provider === "dropbox") {
          const { created, total } = await syncDropboxFolder({
            path: syncInput,
            maxFiles: 100,
          });
          setSyncMsg(
            `Imported ${created} new file${created === 1 ? "" : "s"} (of ${total})`,
          );
        }
        router.refresh();
      } catch (e) {
        setSyncMsg(e instanceof Error ? e.message : "Sync failed");
      }
    });
  }

  return (
    <div
      className="flex flex-col rounded-[4px] border border-line bg-surface"
      style={{ padding: 18 }}
    >
      <div className="flex items-start gap-3">
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
      <InfoAlert
        open={alertOpen}
        title={`${info.name} — coming soon`}
        message="We're still building this one. Check back soon."
        onClose={() => setAlertOpen(false)}
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
