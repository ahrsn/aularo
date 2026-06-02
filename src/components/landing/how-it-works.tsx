import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/label";
import { AnimateIn } from "@/components/ui/animate-in";
import { SCREEN_DISPLAY_URL, SITE_NAME } from "@/lib/site";

const steps = [
  {
    n: "01",
    title: "Compose the loop",
    body: `Drag slides in. Set transitions. Schedule when it should play. ${SITE_NAME} treats each slideshow like a short piece of writing — a few things, in order, well-paced.`,
    icon: "stack",
  },
  {
    n: "02",
    title: "Pair the screen",
    body: `Open ${SCREEN_DISPLAY_URL} on any browser — a cheap TV, a kiosk PC, a borrowed laptop. Enter the code. The screen knows what to show and when.`,
    icon: "monitor",
  },
  {
    n: "03",
    title: "Change your mind from anywhere",
    body: `Swap slides between rooms. Pause the atrium and unpause the foyer. ${SITE_NAME} keeps a record of who changed what, quietly, in the background.`,
    icon: "arrows-clockwise",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative px-5 py-20 md:px-8 md:py-28">
      {/* Ambient backdrop matching the hero depth treatment */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0"
        style={{
          top: 0,
          bottom: 0,
          background:
            "radial-gradient(70% 40% at 50% 20%, rgba(59,90,65,0.07) 0%, rgba(245,241,232,0) 65%)",
        }}
      />

      <div className="relative mx-auto" style={{ maxWidth: 1120 }}>
        {/* Section header */}
        <AnimateIn>
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-16">
            <div style={{ maxWidth: 640 }}>
              <Eyebrow className="mb-3 text-moss">How It Works</Eyebrow>
              <h2
                className="font-serif"
                style={{
                  fontSize: "clamp(28px, 4.5vw, 48px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.03em",
                  fontWeight: 500,
                  color: "#0E1410",
                  margin: 0,
                  fontVariationSettings: "'opsz' 72",
                  textWrap: "balance",
                }}
              >
                Three movements.{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    fontWeight: 500,
                    color: "#3B5A41",
                  }}
                >
                  An afternoon&rsquo;s work,
                </em>{" "}
                at most.
              </h2>
            </div>
            <a
              href="#"
              className="flex items-center gap-[6px] text-[13px] tracking-[-0.005em] text-moss underline underline-offset-[3px] transition-opacity duration-quiet hover:opacity-70"
              style={{ whiteSpace: "nowrap" }}
            >
              Read the full guide
              <Icon name="arrow-right" size={12} />
            </a>
          </div>
        </AnimateIn>

        {/* Steps — editorial numbered timeline */}
        <div className="flex flex-col gap-0">
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1;
            return (
              <AnimateIn key={s.n} delay={80 + i * 80}>
                <div className="group relative">
                  {/* Vertical connector line between steps */}
                  {!isLast && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute hidden md:block"
                      style={{
                        left: 27,
                        top: 60,
                        bottom: -1,
                        width: 1,
                        background:
                          "linear-gradient(180deg, var(--line-strong) 0%, var(--line) 60%, rgba(227,223,211,0) 100%)",
                      }}
                    />
                  )}

                  <div
                    className="relative flex flex-col gap-6 rounded-[6px] border border-line bg-surface px-6 py-7 transition-shadow duration-quiet hover:shadow-tinted-md md:flex-row md:items-start md:gap-8 md:px-8 md:py-8"
                    style={{
                      marginBottom: isLast ? 0 : 12,
                    }}
                  >
                    {/* Inner highlight on hover */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[6px] opacity-0 transition-opacity duration-quiet group-hover:opacity-100"
                      style={{
                        boxShadow: "inset 0 0 0 1px rgba(59,90,65,0.10)",
                      }}
                    />

                    {/* Step number + icon column */}
                    <div className="flex shrink-0 items-center gap-4 md:flex-col md:items-center md:gap-2">
                      {/* Number badge */}
                      <div
                        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-line bg-paper shadow-tinted-sm"
                        style={{
                          boxShadow:
                            "0 1px 2px rgba(25,35,26,0.06), 0 2px 6px rgba(25,35,26,0.05), inset 0 1px 0 rgba(255,255,255,0.7)",
                        }}
                      >
                        <span
                          className="font-mono text-muted"
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.05em",
                            lineHeight: 1,
                          }}
                        >
                          {s.n}
                        </span>
                      </div>

                      {/* Icon — desktop only, below number */}
                      <div
                        className="hidden text-muted-2 transition-colors duration-quiet group-hover:text-moss md:flex"
                        aria-hidden
                      >
                        <Icon name={s.icon} size={18} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
                      {/* Mobile: icon inline with title */}
                      <div className="flex items-center gap-3 md:block">
                        <span
                          className="text-muted-2 transition-colors duration-quiet group-hover:text-moss md:hidden"
                          aria-hidden
                        >
                          <Icon name={s.icon} size={16} />
                        </span>
                        <h3
                          className="font-serif"
                          style={{
                            fontSize: 22,
                            lineHeight: 1.2,
                            letterSpacing: "-0.02em",
                            fontWeight: 500,
                            color: "#0E1410",
                            margin: 0,
                            fontVariationSettings: "'opsz' 48",
                          }}
                        >
                          {s.title}
                        </h3>
                      </div>

                      <p
                        className="font-sans text-muted"
                        style={{
                          fontSize: 14.5,
                          lineHeight: 1.58,
                          letterSpacing: "-0.005em",
                          textWrap: "pretty",
                          margin: 0,
                          maxWidth: 620,
                        }}
                      >
                        {s.body}
                      </p>
                    </div>

                    {/* Step indicator — far right, desktop only */}
                    <div
                      className="hidden shrink-0 self-center md:block"
                      aria-hidden
                    >
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-paper opacity-0 transition-opacity duration-quiet group-hover:opacity-100"
                        style={{
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
                        }}
                      >
                        <Icon name="arrow-right" size={12} className="text-moss" />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            );
          })}
        </div>

        {/* Bottom rule + reassurance */}
        <AnimateIn delay={340}>
          <div
            className="rule-letterpress mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-7 text-[12.5px] tracking-[-0.005em] text-muted"
          >
            <span className="flex items-center gap-[7px]">
              <Icon name="check-circle" size={13} className="text-moss" />
              No app to install — any browser
            </span>
            <span
              aria-hidden
              className="hidden h-3 md:inline-block"
              style={{ width: 1, background: "var(--line-strong)" }}
            />
            <span className="flex items-center gap-[7px]">
              <Icon name="check-circle" size={13} className="text-moss" />
              Live in under five minutes
            </span>
            <span
              aria-hidden
              className="hidden h-3 md:inline-block"
              style={{ width: 1, background: "var(--line-strong)" }}
            />
            <span className="flex items-center gap-[7px]">
              <Icon name="check-circle" size={13} className="text-moss" />
              Changes reach screens in &lt;15 seconds
            </span>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
