import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/label";
import { AnimateIn } from "@/components/ui/animate-in";

const features = [
  {
    icon: "calendar-blank",
    title: "Multi-Event Scheduling",
    body: "Plan what plays, where, and when — across weeks of overlapping events.",
  },
  {
    icon: "users-three",
    title: "Team Roles",
    body: "Producers edit, venue staff pause. Every change is logged.",
  },
  {
    icon: "arrows-clockwise",
    title: "Instant Sync",
    body: "Edits arrive on every paired display in under 15 seconds.",
  },
  {
    icon: "wifi-slash",
    title: "Offline Safe",
    body: "A display that loses its connection keeps playing the last loop.",
  },
  {
    icon: "monitor-play",
    title: "Any Screen, Any Browser",
    body: "Pair with a short code. No hardware to buy, no app to install.",
  },
  {
    icon: "cloud-check",
    title: "Drive + Dropbox Sync",
    body: "Drop files in Google Drive or Dropbox. Clarra picks them up on the screen.",
  },
  {
    icon: "clock-countdown",
    title: "Run-of-Show Timers",
    body: "Countdown to the next session, the next break, the next bow.",
  },
  {
    icon: "shield-check",
    title: "SOC 2, SSO, Audit Log",
    body: "Enterprise requirements treated as table stakes, not add-ons.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        <AnimateIn>
          <div className="mb-10 md:mb-12">
            <Eyebrow className="mb-[10px]">Product</Eyebrow>
            <h2
              className="font-serif text-[32px] leading-[1.1] md:text-[44px] md:leading-[1.08]"
              style={{
                letterSpacing: "-0.028em",
                fontWeight: 400,
                color: "#0E1410",
                margin: 0,
                maxWidth: 720,
                fontVariationSettings: "'opsz' 72",
                textWrap: "balance",
              }}
            >
              Everything you need, nothing you don&rsquo;t.
            </h2>
          </div>
        </AnimateIn>
        <AnimateIn delay={60}>
          <div className="grid grid-cols-2 border-l border-t border-line md:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-3 border-b border-r border-line"
                style={{
                  padding: "24px 22px 28px",
                  minHeight: 180,
                }}
              >
                <Icon name={f.icon} size={20} />
                <div
                  className="text-[15px] font-semibold text-ink"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {f.title}
                </div>
                <div
                  className="text-[13px] text-muted"
                  style={{
                    lineHeight: 1.5,
                    letterSpacing: "-0.005em",
                    textWrap: "pretty",
                  }}
                >
                  {f.body}
                </div>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
