"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/label";

type Tier = {
  name: string;
  priceMonthly: number | null;
  priceAnnual: number | null;
  priceLabel?: string;
  cadence: string;
  desc: string;
  features: string[];
  cta: string;
  href: string;
  primary?: boolean;
  badge?: string;
  fuds: string;
};

const tiers: Tier[] = [
  {
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    priceLabel: "$0",
    cadence: "forever, one display",
    desc: "For a single display, or while you evaluate.",
    features: [
      "1 display",
      "3 slideshows",
      "Clarra watermark on-screen",
      "Email support",
    ],
    cta: "Start free",
    href: "/signup",
    fuds: "Free forever · no upgrade nags",
  },
  {
    name: "Studio",
    priceMonthly: 19,
    priceAnnual: 15,
    cadence: "per display / month",
    desc: "For galleries, hotels, and small venues.",
    features: [
      "Up to 5 displays",
      "Unlimited slideshows",
      "Public preview links",
      "Google Drive + Dropbox sync",
      "No Clarra branding",
      "Email support",
    ],
    cta: "Start 14-day trial",
    href: "/signup",
    primary: true,
    badge: "MOST POPULAR",
    fuds: "14 days free · cancel anytime",
  },
  {
    name: "Venue",
    priceMonthly: 29,
    priceAnnual: 23,
    cadence: "per display / month",
    desc: "For organizations running simultaneous events.",
    features: [
      "Unlimited displays",
      "Scheduling + automations",
      "Team roles & seats",
      "Insights + priority sync",
      "100 GB storage",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    href: "/signup",
    fuds: "14 days free · cancel anytime",
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div>
            <Eyebrow className="mb-[10px]">Pricing</Eyebrow>
            <h2
              className="font-serif text-[32px] leading-[1.1] md:text-[44px] md:leading-[1.08]"
              style={{
                letterSpacing: "-0.028em",
                fontWeight: 400,
                color: "#0E1410",
                margin: 0,
                maxWidth: 620,
                fontVariationSettings: "'opsz' 72",
                textWrap: "balance",
              }}
            >
              Priced per display, not per seat.
            </h2>
          </div>
          <div
            className="inline-flex items-center rounded-[10px] border border-line bg-surface"
            style={{ padding: 3 }}
            role="tablist"
            aria-label="Billing cadence"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!annual}
              onClick={() => setAnnual(false)}
              className="rounded-[8px] px-3 py-1 text-[12.5px] font-medium tracking-[-0.005em] transition-colors"
              style={{
                background: !annual ? "#19231A" : "transparent",
                color: !annual ? "#F5F1E8" : "var(--muted)",
                cursor: "pointer",
                border: "none",
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={annual}
              onClick={() => setAnnual(true)}
              className="rounded-[8px] px-3 py-1 text-[12.5px] font-medium tracking-[-0.005em] transition-colors"
              style={{
                background: annual ? "#19231A" : "transparent",
                color: annual ? "#F5F1E8" : "var(--muted)",
                cursor: "pointer",
                border: "none",
              }}
            >
              Annual · save 20%
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((t) => {
            const dark = !!t.primary;
            const price =
              t.priceLabel ?? `$${annual ? t.priceAnnual : t.priceMonthly}`;
            const cadence =
              t.priceMonthly === 0
                ? t.cadence
                : annual
                  ? "per display / month, billed yearly"
                  : t.cadence;
            return (
              <div
                key={t.name}
                className="relative flex flex-col gap-4 rounded-[4px] border"
                style={{
                  background: dark ? "#19231A" : "#FBF8F0",
                  color: dark ? "#F5F1E8" : "#0E1410",
                  borderColor: dark ? "#19231A" : "var(--line)",
                  padding: "28px 28px 24px",
                }}
              >
                {t.badge && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      top: -12,
                      background: "#3B5A41",
                      color: "#F5F1E8",
                      padding: "4px 14px",
                      fontSize: 10.5,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      whiteSpace: "nowrap",
                      fontFamily: "var(--font-geist), sans-serif",
                      boxShadow: "0 6px 16px -8px rgba(25,35,26,0.5)",
                    }}
                  >
                    {t.badge}
                  </div>
                )}
                <div>
                  <div
                    className="mb-1 font-serif"
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      letterSpacing: "-0.02em",
                      fontVariationSettings: "'opsz' 48",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    className="text-[13px] tracking-[-0.005em]"
                    style={{
                      color: dark ? "rgba(245,241,232,0.65)" : "var(--muted)",
                      textWrap: "pretty",
                    }}
                  >
                    {t.desc}
                  </div>
                </div>
                <div
                  className="flex items-baseline gap-2"
                  style={{
                    paddingBottom: 16,
                    borderBottom: dark
                      ? "1px solid rgba(245,241,232,0.15)"
                      : "1px solid var(--line)",
                  }}
                >
                  <div
                    className="font-serif"
                    style={{
                      fontSize: 44,
                      fontWeight: 500,
                      letterSpacing: "-0.032em",
                      lineHeight: 1,
                      fontVariationSettings: "'opsz' 72",
                    }}
                  >
                    {price}
                  </div>
                  <div
                    className="text-[12.5px] tracking-[-0.005em]"
                    style={{
                      color: dark ? "rgba(245,241,232,0.6)" : "var(--muted)",
                    }}
                  >
                    {cadence}
                  </div>
                </div>
                <ul className="m-0 flex flex-1 list-none flex-col gap-[10px] p-0">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-[10px] text-[13.5px] tracking-[-0.005em]"
                      style={{ textWrap: "pretty" }}
                    >
                      <Icon
                        name="check"
                        size={15}
                        style={{
                          color: dark ? "#A9C2AD" : "#3B5A41",
                          marginTop: 3,
                          flexShrink: 0,
                        }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-[10px]">
                  <Link href={t.href} className="w-full">
                    <Button
                      variant={dark ? "onDark" : "ghost"}
                      size="md"
                      className="w-full justify-center"
                    >
                      {t.cta}
                    </Button>
                  </Link>
                  <div
                    className="text-center text-[11.5px] tracking-[-0.005em]"
                    style={{
                      color: dark
                        ? "rgba(245,241,232,0.55)"
                        : "var(--muted-2, #6B7268)",
                    }}
                  >
                    {t.fuds}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
