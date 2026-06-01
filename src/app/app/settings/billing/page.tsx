import {
  listDisplays,
  listMediaAssets,
  listMembers,
} from "@/lib/slideshow-data";
import { notFound } from "next/navigation";
import { requireActiveWorkspace } from "@/lib/workspace";
import type { Workspace } from "@/lib/schema";
import { TRIAL_DURATION_MS } from "@/lib/schema";
import { PortalButton, UpgradeButton } from "./upgrade-button";
import { PLAN_LIMITS } from "@/lib/plan";
import { isCommunity } from "@/lib/edition";

type PlanMeta = {
  label: string;
  price: string;
  cadence: string;
  tagline: string;
  limit: number;
};

const PLAN_META: Record<"free" | "studio" | "venue", PlanMeta> = {
  free: {
    label: "Free",
    price: "$0",
    cadence: "",
    tagline: "1 display · 3 slideshows · 2 GB storage",
    limit: 1,
  },
  studio: {
    label: "Studio",
    price: "$19",
    cadence: "/display / mo",
    tagline: "Up to 5 displays · Preview links · Drive/Dropbox · 25 GB",
    limit: 5,
  },
  venue: {
    label: "Venue",
    price: "$29",
    cadence: "/display / mo",
    tagline: "Unlimited displays · Team · Scheduling · 100 GB",
    limit: 999,
  },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export default async function BillingPage() {
  // No billing surface in the self-hosted community edition.
  if (isCommunity) notFound();
  const { workspaceId, workspace } = await requireActiveWorkspace();
  const ws = workspace as unknown as Workspace;
  const [displays, members, media] = await Promise.all([
    listDisplays(workspaceId),
    listMembers(workspaceId),
    listMediaAssets(workspaceId),
  ]);

  const currentKey = (ws.plan ?? "free") as "free" | "studio" | "venue";
  const meta = PLAN_META[currentKey];
  const hasSubscription = Boolean(ws.stripeSubscriptionId);

  const now = Date.now();
  const msLeft = ws.trialEndsAt ? ws.trialEndsAt - now : 0;
  const inTrial =
    !hasSubscription &&
    msLeft > 0 &&
    msLeft <= TRIAL_DURATION_MS &&
    currentKey !== "free";
  const trialDaysLeft = inTrial
    ? Math.ceil(msLeft / (24 * 60 * 60 * 1000))
    : null;

  const totalBytes = media.reduce((n, m) => n + (m.size || 0), 0);
  const storageLimitBytes = PLAN_LIMITS[currentKey].storageBytes;
  const storageLimitGb = storageLimitBytes / (1024 * 1024 * 1024);

  const displayText =
    meta.limit >= 999 ? `${displays.length}` : `${displays.length} / ${meta.limit}`;

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-h2">Billing</h2>
        <div className="mt-1 text-[13px] tracking-[-0.005em] text-muted">
          {hasSubscription
            ? `You're on the ${meta.label} plan. Invoiced monthly.`
            : inTrial
              ? `You're trialing ${meta.label}. ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left — no charge until the trial ends.`
              : `You're on the Free plan. Upgrade anytime.`}
        </div>
      </section>

      <section
        className="rounded-[4px] p-6"
        style={{ background: "#19231A", color: "#F5F1E8" }}
      >
        <div
          className="font-sans uppercase"
          style={{
            fontSize: 10.5,
            letterSpacing: "0.08em",
            color: "rgba(245,241,232,0.55)",
            fontWeight: 500,
          }}
        >
          {meta.label} {meta.cadence && "· Monthly"}
          {inTrial && " · Trial"}
        </div>
        <div className="mt-2 flex items-end justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <div
                className="font-serif"
                style={{
                  fontSize: 48,
                  fontWeight: 500,
                  letterSpacing: "-0.026em",
                  fontVariationSettings: "'opsz' 72",
                  lineHeight: 1,
                }}
              >
                {meta.price}
              </div>
              {meta.cadence && (
                <div
                  className="font-serif italic"
                  style={{
                    fontSize: 18,
                    color: "rgba(245,241,232,0.55)",
                  }}
                >
                  {meta.cadence}
                </div>
              )}
            </div>
            <div
              className="mt-2 text-[12.5px] tracking-[-0.005em]"
              style={{ color: "rgba(245,241,232,0.7)" }}
            >
              {meta.tagline}
            </div>
            {inTrial && (
              <div
                className="mt-1.5 text-[12px] tracking-[-0.005em]"
                style={{ color: "rgba(169,194,173,0.9)" }}
              >
                Trial ends in {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"}. Add a card to keep {meta.label}.
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hasSubscription ? (
              <>
                <UpgradeButton
                  plan={currentKey === "studio" ? "venue" : "studio"}
                  variant="onDarkGhost"
                  size="sm"
                >
                  Change plan
                </UpgradeButton>
                <PortalButton variant="onDark" size="sm">
                  Manage billing
                </PortalButton>
              </>
            ) : (
              <UpgradeButton
                plan={currentKey === "free" ? "studio" : currentKey}
                variant="onDark"
                size="sm"
                iconRight="arrow-up-right"
              >
                {currentKey === "free" ? "Start 14-day trial" : "Add a card"}
              </UpgradeButton>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="text-[12.5px] font-medium tracking-[-0.005em] text-muted">
          Usage This Month
        </div>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          <UsageCard label="Displays" value={displayText} />
          <UsageCard
            label="Storage"
            value={`${formatBytes(totalBytes)} / ${storageLimitGb} GB`}
            bar={Math.min(1, totalBytes / storageLimitBytes)}
          />
          <UsageCard
            label="Team"
            value={`${members.length} seat${members.length === 1 ? "" : "s"}`}
          />
        </div>
      </section>

      <section
        className="flex items-start justify-between border-t border-line"
        style={{ paddingTop: 20 }}
      >
        <div>
          <div className="text-[13px] font-medium tracking-[-0.005em] text-ink">
            Next invoice
          </div>
          <div className="mt-0.5 text-[12px] tracking-[-0.005em] text-muted">
            {hasSubscription
              ? "Billed on your next cycle."
              : inTrial
                ? "Billed when the trial ends."
                : "Nothing billed on the Free plan."}
          </div>
        </div>
        <div
          className="font-serif text-right"
          style={{
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "-0.018em",
            fontVariationSettings: "'opsz' 48",
            color: "#0E1410",
          }}
        >
          {hasSubscription ? nextInvoiceText(ws) : "—"}
        </div>
      </section>
    </div>
  );
}

function UsageCard({
  label,
  value,
  bar,
}: {
  label: string;
  value: string;
  bar?: number;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-[4px] border border-line bg-surface"
      style={{ padding: 16 }}
    >
      <div className="text-[11px] tracking-[-0.005em] text-muted">{label}</div>
      <div
        className="font-serif text-ink"
        style={{
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: "-0.02em",
          fontVariationSettings: "'opsz' 48",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {bar != null && (
        <div
          className="rounded-full overflow-hidden"
          style={{ height: 4, background: "#EEE9DB" }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.round(bar * 100)}%`,
              background: bar > 0.9 ? "#8B3A2F" : "#3B5A41",
            }}
          />
        </div>
      )}
    </div>
  );
}

function nextInvoiceText(ws: Workspace): string {
  // Placeholder: next month from trial end or today.
  const base = ws.trialEndsAt ?? Date.now() + 30 * 24 * 60 * 60 * 1000;
  const d = new Date(base);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
