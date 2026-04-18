import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { Workspace } from "@/lib/schema";
import { TRIAL_DURATION_MS } from "@/lib/schema";
import { LogoAvatar } from "./logo-avatar";
import { BrandColorsInline } from "./brand-colors-inline";

export function IdentityHeader({
  workspace,
  canEdit,
}: {
  workspace: Workspace;
  canEdit: boolean;
}) {
  const { name, slug, logoUrl, plan, trialEndsAt, brand } = workspace;
  const initial = (name ?? "W").trim().charAt(0).toUpperCase() || "W";
  const now = Date.now();
  const msLeft = trialEndsAt - now;
  const trialDaysLeft =
    msLeft > 0 && msLeft <= TRIAL_DURATION_MS
      ? Math.ceil(msLeft / (24 * 60 * 60 * 1000))
      : null;

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const badgeText =
    trialDaysLeft != null && plan !== "free"
      ? `${planLabel} · ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left`
      : planLabel;

  const accent = brand?.accent ?? "#3B5A41";
  const background = brand?.background ?? "#F5F1E8";

  return (
    <section
      className="flex items-start gap-5 rounded-[4px] border border-line bg-surface"
      style={{ padding: "22px 22px" }}
    >
      <LogoAvatar
        initialLogoUrl={logoUrl}
        initial={initial}
        accent={accent}
        background={background}
        canEdit={canEdit}
      />
      <div className="min-w-0 flex-1">
        <div
          className="font-serif text-ink"
          style={{
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: "-0.022em",
            fontVariationSettings: "'opsz' 48",
            lineHeight: 1.1,
          }}
        >
          {name}
        </div>
        <div
          className="mt-0.5 font-mono text-muted"
          style={{ fontSize: 12.5, letterSpacing: "-0.005em" }}
        >
          {slug ? `clarra.show/${slug}` : "No public URL yet"}
        </div>
        <div className="mt-3">
          <BrandColorsInline
            canEdit={canEdit}
            initialAccent={accent}
            initialBackground={background}
          />
        </div>
      </div>
      <Link
        href="/app/settings/billing"
        className="inline-flex shrink-0 items-center gap-[6px] rounded-[10px] px-[10px] py-[5px] text-[12px] font-medium tracking-[-0.005em] transition-colors"
        style={{
          background: "#E8EDE6",
          color: "#3B5A41",
          border: "1px solid rgba(59,90,65,0.2)",
        }}
      >
        {badgeText}
        <Icon name="arrow-up-right" size={12} />
      </Link>
    </section>
  );
}
