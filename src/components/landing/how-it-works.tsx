import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/label";
import { AnimateIn } from "@/components/ui/animate-in";

const steps = [
  {
    n: "01",
    title: "Compose the loop",
    body: "Drag slides in. Set transitions. Schedule when it should play. Clarra treats each slideshow like a short piece of writing — a few things, in order, well-paced.",
    icon: "stack",
  },
  {
    n: "02",
    title: "Pair the screen",
    body: "Open clarra.show/screen on any browser — a cheap TV, a kiosk PC, a borrowed laptop. Enter the code. The screen knows what to show and when.",
    icon: "monitor",
  },
  {
    n: "03",
    title: "Change your mind from anywhere",
    body: "Swap slides between rooms. Pause the atrium and unpause the foyer. Clarra keeps a record of who changed what, quietly, in the background.",
    icon: "arrows-clockwise",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        <AnimateIn>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow className="mb-[10px]">How it works</Eyebrow>
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
                Three movements. An afternoon&rsquo;s work, at most.
              </h2>
            </div>
            <a
              href="#"
              className="text-[13.5px] tracking-[-0.005em] text-moss underline underline-offset-[3px]"
            >
              Read the full guide
            </a>
          </div>
        </AnimateIn>

        <AnimateIn delay={80}>
          <div className="grid grid-cols-1 overflow-hidden rounded-[4px] border border-line bg-surface md:grid-cols-3">
            {steps.map((s, i) => {
              const notLast = i < 2;
              return (
                <div
                  key={s.n}
                  className={`flex flex-col gap-[14px] px-6 py-8 md:px-7 ${notLast ? "border-b border-line md:border-b-0 md:border-r" : ""}`}
                  style={{
                    minHeight: 240,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="font-mono text-muted-2"
                      style={{ fontSize: 11.5, letterSpacing: "0.08em" }}
                    >
                      {s.n}
                    </div>
                    <Icon name={s.icon} size={20} />
                  </div>
                  <div
                    className="font-serif"
                    style={{
                      fontSize: 22,
                      lineHeight: 1.22,
                      letterSpacing: "-0.018em",
                      fontWeight: 500,
                      color: "#0E1410",
                      fontVariationSettings: "'opsz' 48",
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    className="text-[14px] text-muted"
                    style={{
                      lineHeight: 1.55,
                      letterSpacing: "-0.005em",
                      textWrap: "pretty",
                    }}
                  >
                    {s.body}
                  </div>
                </div>
              );
            })}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
