import { Eyebrow } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { AnimateIn } from "@/components/ui/animate-in";
import { SITE_NAME } from "@/lib/site";

const beats = [
  {
    label: "06:12",
    line: "The USB stick is lost. Again.",
  },
  {
    label: "06:34",
    line: "The lobby TV is stuck on a screensaver.",
  },
  {
    label: "06:47",
    line: "Your producer texts about the ballroom monitor.",
  },
  {
    label: "06:53",
    line: "The sponsor logo is on the wrong wall.",
  },
];

export function PAS() {
  return (
    <section
      className="relative border-b border-line px-5 py-20 md:px-8 md:py-32"
      style={{ background: "var(--surface)" }}
    >
      {/* Subtle ambient depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: 320,
          background:
            "radial-gradient(70% 60% at 65% 0%, rgba(59,90,65,0.06) 0%, rgba(245,241,232,0) 70%)",
        }}
      />

      <div className="relative mx-auto" style={{ maxWidth: 1120 }}>
        <div className="grid grid-cols-1 gap-14 md:gap-20 lg:grid-cols-[1fr_1.15fr] lg:items-start">

          {/* ── Left: Problem copy ── */}
          <AnimateIn>
            <Eyebrow className="mb-4">The problem</Eyebrow>

            <h2
              className="font-serif"
              style={{
                fontSize: "clamp(30px, 5vw, 48px)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                fontWeight: 500,
                fontVariationSettings: "'opsz' 72",
                color: "#0E1410",
                margin: "0 0 24px",
                textWrap: "balance",
              }}
            >
              Four screens. Three events.{" "}
              <em style={{ fontStyle: "italic", color: "#3B5A41", fontWeight: 500 }}>
                Two people who can touch them.
              </em>
            </h2>

            <p
              className="font-serif text-muted"
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                letterSpacing: "-0.008em",
                margin: "0 0 18px",
                fontVariationSettings: "'opsz' 18",
                maxWidth: 480,
                textWrap: "pretty",
              }}
            >
              You walk between rooms with a flash drive. You reboot the mezzanine
              TV, again. The gala starts in forty minutes and nothing on the east
              wall is right.
            </p>

            <p
              className="text-muted"
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                letterSpacing: "-0.005em",
                margin: "0 0 32px",
                maxWidth: 480,
                textWrap: "pretty",
              }}
            >
              Every venue we talked to had the same Sunday night routine: copying
              files onto sticks, labeling them with tape, praying the stick still
              works on Monday.
            </p>

            {/* Quiet supporting stat */}
            <div
              className="inline-flex items-center gap-3 rounded-[4px] border border-line bg-paper"
              style={{ padding: "10px 16px" }}
            >
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(59,90,65,0.12)" }}
              >
                <Icon name="warning" size={13} style={{ color: "#3B5A41" }} />
              </div>
              <span
                className="font-mono text-muted"
                style={{ fontSize: 11.5, letterSpacing: "0.02em" }}
              >
                Avg. 47 min lost per event night to screen wrangling
              </span>
            </div>
          </AnimateIn>

          {/* ── Right: Timeline card ── */}
          <AnimateIn delay={100}>
            <div
              className="rounded-[6px] border border-line overflow-hidden shadow-tinted-md"
              style={{ background: "#F5F1E8" }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between border-b border-line"
                style={{ padding: "13px 20px" }}
              >
                <div
                  className="font-mono uppercase text-muted-2"
                  style={{ fontSize: 10.5, letterSpacing: "0.10em" }}
                >
                  Opening night / timeline
                </div>
                <div
                  className="font-mono text-moss"
                  style={{ fontSize: 10.5, letterSpacing: "0.06em" }}
                >
                  without {SITE_NAME}
                </div>
              </div>

              {/* Beat rows */}
              {beats.map((b, i) => (
                <div
                  key={b.label}
                  className="group flex items-center gap-5 transition-colors duration-200"
                  style={{
                    padding: "17px 20px",
                    borderBottom:
                      i < beats.length - 1
                        ? "1px solid var(--line)"
                        : "none",
                  }}
                >
                  {/* Time stamp */}
                  <div
                    className="font-mono text-muted-2 flex-shrink-0"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      width: 42,
                    }}
                  >
                    {b.label}
                  </div>

                  {/* Hairline separator */}
                  <div
                    aria-hidden
                    style={{
                      width: 1,
                      height: 28,
                      background: "var(--line)",
                      flexShrink: 0,
                    }}
                  />

                  {/* Entry text */}
                  <div
                    className="font-serif"
                    style={{
                      fontSize: 16.5,
                      lineHeight: 1.35,
                      letterSpacing: "-0.012em",
                      color: "#0E1410",
                      fontVariationSettings: "'opsz' 18",
                    }}
                  >
                    {b.line}
                  </div>
                </div>
              ))}

              {/* Resolution footer — dark */}
              <div
                className="flex items-start gap-4 border-t border-line"
                style={{
                  padding: "20px 20px",
                  background: "#19231A",
                  color: "#F5F1E8",
                }}
              >
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full mt-[2px]"
                  style={{ background: "#3B5A41" }}
                >
                  <Icon name="check" size={13} style={{ color: "#F5F1E8" }} />
                </div>
                <div>
                  <div
                    className="font-mono uppercase"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.10em",
                      color: "rgba(245,241,232,0.45)",
                      marginBottom: 6,
                    }}
                  >
                    with {SITE_NAME}
                  </div>
                  <div
                    className="font-serif"
                    style={{
                      fontSize: 17,
                      lineHeight: 1.4,
                      letterSpacing: "-0.015em",
                      fontVariationSettings: "'opsz' 18",
                      color: "#F5F1E8",
                    }}
                  >
                    One change, every screen catches up{" "}
                    <em style={{ fontStyle: "italic", color: "rgba(245,241,232,0.70)" }}>
                      in under fifteen seconds.
                    </em>
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>

        </div>
      </div>
    </section>
  );
}
