import { Eyebrow } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { AnimateIn } from "@/components/ui/animate-in";

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
      className="border-b border-line px-5 py-16 md:px-8 md:py-24"
      style={{ background: "#FBF8F0" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        <div className="grid grid-cols-1 gap-10 md:gap-16 lg:grid-cols-[1fr_1.1fr]">
          <AnimateIn>
            <Eyebrow className="mb-[12px]">The Problem</Eyebrow>
            <h2
              className="font-serif text-[32px] leading-[1.1] md:text-[44px] md:leading-[1.08]"
              style={{
                letterSpacing: "-0.028em",
                fontWeight: 400,
                color: "#0E1410",
                margin: "0 0 22px",
                fontVariationSettings: "'opsz' 72",
                textWrap: "balance",
              }}
            >
              Four screens. Three events.{" "}
              <em style={{ fontStyle: "italic", color: "#3B5A41" }}>
                Two people who can touch them.
              </em>
            </h2>
            <p
              className="font-serif text-muted"
              style={{
                fontSize: 18,
                lineHeight: 1.55,
                letterSpacing: "-0.005em",
                margin: "0 0 20px",
                fontVariationSettings: "'opsz' 18",
                maxWidth: 460,
                textWrap: "pretty",
              }}
            >
              You walk between rooms with a flash drive. You reboot the
              mezzanine TV, again. The gala starts in forty minutes and nothing
              on the east wall is right.
            </p>
            <p
              className="text-muted"
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                letterSpacing: "-0.005em",
                margin: 0,
                maxWidth: 460,
                textWrap: "pretty",
              }}
            >
              Every venue we talked to had the same Sunday night routine:
              copying files onto sticks, labeling them with tape, praying the
              stick still works on Monday.
            </p>
          </AnimateIn>

          <AnimateIn delay={80}>
            <div
              className="rounded-[4px] border border-line overflow-hidden"
              style={{ background: "#F5F1E8" }}
            >
              <div
                className="flex items-center justify-between border-b border-line"
                style={{ padding: "14px 18px" }}
              >
                <div
                  className="font-mono uppercase text-muted-2"
                  style={{ fontSize: 11, letterSpacing: "0.08em" }}
                >
                  Opening Night / Timeline
                </div>
                <div
                  className="font-mono text-moss"
                  style={{ fontSize: 11, letterSpacing: "0.04em" }}
                >
                  without Clarra
                </div>
              </div>
              {beats.map((b, i) => (
                <div
                  key={b.label}
                  className="flex items-center gap-4"
                  style={{
                    padding: "16px 18px",
                    borderBottom:
                      i < beats.length - 1 ? "1px solid var(--line)" : "none",
                  }}
                >
                  <div
                    className="font-mono text-muted-2"
                    style={{
                      fontSize: 11.5,
                      letterSpacing: "0.04em",
                      width: 44,
                      flexShrink: 0,
                    }}
                  >
                    {b.label}
                  </div>
                  <div
                    className="font-serif"
                    style={{
                      fontSize: 17,
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
              <div
                className="flex items-center gap-4 border-t border-line"
                style={{
                  padding: "18px 18px",
                  background: "#19231A",
                  color: "#F5F1E8",
                }}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: "#3B5A41", flexShrink: 0 }}
                >
                  <Icon name="check" size={14} style={{ color: "#F5F1E8" }} />
                </div>
                <div
                  className="font-serif"
                  style={{
                    fontSize: 16.5,
                    lineHeight: 1.35,
                    letterSpacing: "-0.012em",
                    fontVariationSettings: "'opsz' 18",
                  }}
                >
                  With Clarra: one change, every screen catches up in under
                  fifteen seconds.
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
