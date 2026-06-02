import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/label";
import { AnimateIn } from "@/components/ui/animate-in";
import { SITE_NAME } from "@/lib/site";

// ─── Feature data ────────────────────────────────────────────────────────────

const primaryFeatures = [
  {
    icon: "calendar-blank",
    title: "Multi-event scheduling",
    body: "Plan what plays, where, and when — across weeks of overlapping events. Drag to rearrange. Conflicts surface before they reach the screen.",
    wide: true,
  },
  {
    icon: "arrows-clockwise",
    title: "Instant sync",
    body: "Edits arrive on every paired display in under 15 seconds.",
    wide: false,
  },
];

const secondaryFeatures = [
  {
    icon: "wifi-slash",
    title: "Offline safe",
    body: "A display that loses its connection keeps playing the last loop — no frozen screen, no blank wall.",
  },
  {
    icon: "monitor-play",
    title: "Any screen, any browser",
    body: "Pair with a short code. No hardware to buy, no app to install.",
  },
  {
    icon: "cloud-check",
    title: "Drive + Dropbox sync",
    body: `Drop files in Google Drive or Dropbox. ${SITE_NAME} picks them up on the screen.`,
  },
];

const tertiaryFeatures = [
  {
    icon: "users-three",
    title: "Team roles",
    body: "Producers edit, venue staff pause. Every change is logged.",
  },
  {
    icon: "clock-countdown",
    title: "Run-of-show timers",
    body: "Countdown to the next session, the next break, the next bow.",
  },
  {
    icon: "shield-check",
    title: "SOC 2, SSO, audit log",
    body: "Enterprise requirements treated as table stakes, not add-ons.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PrimaryCard({
  icon,
  title,
  body,
  wide,
  delay,
}: {
  icon: string;
  title: string;
  body: string;
  wide: boolean;
  delay: number;
}) {
  return (
    <AnimateIn delay={delay}>
      <div
        className={[
          "group relative flex flex-col gap-5 rounded-[10px] border border-line bg-surface",
          "transition-all duration-[200ms] ease-[var(--ease-quiet)]",
          "hover:-translate-y-[2px] hover:border-line-strong hover:shadow-tinted-md",
          wide ? "md:col-span-2" : "md:col-span-1",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ padding: "28px 28px 32px" }}
      >
        {/* Icon pill */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-line bg-paper shadow-tinted-sm"
        >
          <Icon name={icon} size={18} className="text-moss" />
        </div>

        <div className="flex flex-col gap-2">
          <div
            className="font-serif text-ink"
            style={{
              fontSize: 19,
              lineHeight: 1.2,
              letterSpacing: "-0.022em",
              fontWeight: 500,
              fontVariationSettings: "'opsz' 48",
            }}
          >
            {title}
          </div>
          <div
            className="font-sans text-muted"
            style={{
              fontSize: 14,
              lineHeight: 1.55,
              letterSpacing: "-0.005em",
              textWrap: "pretty",
            }}
          >
            {body}
          </div>
        </div>

        {/* Hairline inset glow on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[10px] opacity-0 transition-opacity duration-[200ms] group-hover:opacity-100"
          style={{ boxShadow: "inset 0 0 0 1px rgba(59,90,65,0.08)" }}
        />
      </div>
    </AnimateIn>
  );
}

function SecondaryCard({
  icon,
  title,
  body,
  delay,
}: {
  icon: string;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <AnimateIn delay={delay}>
      <div
        className={[
          "group relative flex flex-col gap-4 rounded-[8px] border border-line",
          "transition-all duration-[200ms] ease-[var(--ease-quiet)]",
          "hover:-translate-y-[2px] hover:border-line-strong hover:shadow-tinted-sm",
        ].join(" ")}
        style={{ padding: "22px 22px 26px" }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-line bg-surface shadow-tinted-sm"
        >
          <Icon name={icon} size={16} className="text-moss" />
        </div>

        <div className="flex flex-col gap-[6px]">
          <div
            className="font-serif text-ink"
            style={{
              fontSize: 16,
              lineHeight: 1.25,
              letterSpacing: "-0.018em",
              fontWeight: 500,
              fontVariationSettings: "'opsz' 48",
            }}
          >
            {title}
          </div>
          <div
            className="font-sans text-muted"
            style={{
              fontSize: 13,
              lineHeight: 1.55,
              letterSpacing: "-0.005em",
              textWrap: "pretty",
            }}
          >
            {body}
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}

function TertiaryRow({
  icon,
  title,
  body,
  delay,
}: {
  icon: string;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <AnimateIn delay={delay}>
      <div
        className={[
          "group flex items-start gap-4 border-b border-line py-5",
          "transition-colors duration-[200ms] ease-[var(--ease-quiet)]",
          "last:border-b-0",
        ].join(" ")}
      >
        <div
          className="mt-[2px] flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[6px] border border-line bg-surface shadow-tinted-sm"
        >
          <Icon name={icon} size={14} className="text-moss" />
        </div>
        <div className="flex flex-col gap-[3px]">
          <div
            className="font-serif text-ink"
            style={{
              fontSize: 15,
              lineHeight: 1.3,
              letterSpacing: "-0.015em",
              fontWeight: 500,
              fontVariationSettings: "'opsz' 48",
            }}
          >
            {title}
          </div>
          <div
            className="font-sans text-muted"
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              letterSpacing: "-0.005em",
              textWrap: "pretty",
            }}
          >
            {body}
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function Features() {
  return (
    <section id="features" className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        {/* Header */}
        <AnimateIn>
          <div className="mb-12 md:mb-16">
            <Eyebrow className="mb-3 text-moss">Product</Eyebrow>
            <h2
              className="font-serif text-ink"
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                lineHeight: 1.08,
                letterSpacing: "-0.032em",
                fontWeight: 500,
                fontVariationSettings: "'opsz' 72",
                textWrap: "balance",
                maxWidth: 680,
                margin: 0,
              }}
            >
              Everything you need, nothing you don&rsquo;t.
            </h2>
            <p
              className="mt-4 font-sans text-muted"
              style={{
                fontSize: 16,
                lineHeight: 1.55,
                letterSpacing: "-0.005em",
                maxWidth: 520,
                textWrap: "pretty",
              }}
            >
              Built for the realities of live events — not the fantasy of a quiet Tuesday morning.
            </p>
          </div>
        </AnimateIn>

        {/* Bento row 1 — primary 2-up: wide + narrow */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {primaryFeatures.map((f, i) => (
            <PrimaryCard key={f.title} {...f} delay={80 + i * 60} />
          ))}
        </div>

        {/* Bento row 2 — three equal secondary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {secondaryFeatures.map((f, i) => (
            <SecondaryCard key={f.title} {...f} delay={200 + i * 60} />
          ))}
        </div>

        {/* Divider */}
        <AnimateIn delay={360}>
          <div
            className="rule-letterpress mb-8"
            style={{ marginLeft: 0, marginRight: 0 }}
          />
        </AnimateIn>

        {/* Row 3 — tertiary list strip with a stat callout */}
        <div className="grid grid-cols-1 gap-x-16 md:grid-cols-[1fr_auto]">
          <div>
            {tertiaryFeatures.map((f, i) => (
              <TertiaryRow key={f.title} {...f} delay={380 + i * 60} />
            ))}
          </div>

          {/* Stat callout — typographic accent, right-aligned on md+ */}
          <AnimateIn delay={500}>
            <div
              className="mt-8 flex flex-col justify-center md:mt-0 md:items-end md:text-right"
              style={{ minWidth: 180 }}
            >
              <div
                className="font-serif text-ink"
                style={{
                  fontSize: "clamp(40px, 6vw, 64px)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  fontWeight: 500,
                  fontVariationSettings: "'opsz' 72",
                }}
              >
                &lt;15s
              </div>
              <div
                className="mt-2 font-mono text-muted"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  lineHeight: 1.4,
                  maxWidth: 160,
                }}
              >
                Update reaches every display
              </div>
              <div
                aria-hidden
                className="mt-4 hidden h-px w-full md:block"
                style={{ background: "var(--line)" }}
              />
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
