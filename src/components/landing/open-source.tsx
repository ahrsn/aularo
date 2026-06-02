import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/label";
import {
  SITE_NAME,
  GITHUB_URL,
  HAS_PUBLIC_REPO,
} from "@/lib/site";

const editions = [
  {
    key: "community",
    kicker: "Community Edition",
    title: "Self-host it",
    price: "Free",
    cadence: "forever · open source",
    blurb: `Run ${SITE_NAME} on your own infrastructure. Every feature unlocked, no seat limits, nothing held back.`,
    points: [
      "Every feature — no plan gates",
      "Your database, your storage, your data",
      "AGPLv3 — read it, fork it, extend it",
      "Community support",
    ],
  },
  {
    key: "cloud",
    kicker: `${SITE_NAME} Cloud`,
    title: "Let us run it",
    price: "From $0",
    cadence: "managed · hosted",
    blurb:
      "The same software, fully managed. We handle hosting, updates, scaling, and backups — you focus on the screens.",
    points: [
      "Zero ops — we host and keep it current",
      "Plan tiers that grow with you",
      "Priority support",
      "Pair your first display in minutes",
    ],
  },
] as const;

export function OpenSource() {
  return (
    <section id="open-source" className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        <div className="mx-auto mb-12 max-w-[680px] text-center md:mb-14">
          <Eyebrow className="mb-[12px]">Open source</Eyebrow>
          <h2
            className="font-serif text-ink"
            style={{
              fontSize: "clamp(30px, 4.4vw, 50px)",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              fontWeight: 500,
              margin: 0,
              fontVariationSettings: "'opsz' 72",
              textWrap: "balance",
            }}
          >
            The screens stay yours,{" "}
            <em style={{ fontStyle: "italic", color: "#3B5A41" }}>
              whichever way you run it.
            </em>
          </h2>
          <p
            className="mx-auto mt-4 font-serif text-muted"
            style={{
              fontSize: 17,
              lineHeight: 1.55,
              maxWidth: 560,
              fontVariationSettings: "'opsz' 18",
              textWrap: "pretty",
            }}
          >
            {SITE_NAME} is open core. The whole product is open source under
            AGPLv3 — host it yourself for free, or let us run the managed cloud.
            Same software either way. No lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {editions.map((e) => {
            const dark = e.key === "cloud";
            return (
              <div
                key={e.key}
                className="flex flex-col gap-5 rounded-[6px] border p-7 transition-colors duration-quiet md:p-9"
                style={{
                  background: dark ? "#19231A" : "var(--surface)",
                  color: dark ? "#F5F1E8" : "var(--ink)",
                  borderColor: dark ? "#19231A" : "var(--line)",
                  boxShadow: dark
                    ? "0 24px 50px -18px rgba(25,35,26,0.35)"
                    : undefined,
                }}
              >
                <div>
                  <div
                    className="text-eyebrow"
                    style={{ color: dark ? "#A9C2AD" : "var(--moss)" }}
                  >
                    {e.kicker}
                  </div>
                  <div
                    className="mt-3 flex items-baseline gap-2 font-serif"
                    style={{
                      fontSize: 30,
                      fontWeight: 500,
                      letterSpacing: "-0.026em",
                      fontVariationSettings: "'opsz' 48",
                    }}
                  >
                    {e.title}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      className="font-serif"
                      style={{
                        fontSize: 26,
                        fontWeight: 500,
                        letterSpacing: "-0.03em",
                        fontVariationSettings: "'opsz' 48",
                      }}
                    >
                      {e.price}
                    </span>
                    <span
                      className="text-[12.5px] tracking-[-0.005em]"
                      style={{
                        color: dark ? "rgba(245,241,232,0.6)" : "var(--muted)",
                      }}
                    >
                      {e.cadence}
                    </span>
                  </div>
                </div>

                <p
                  className="text-[14px] leading-[1.55] tracking-[-0.005em]"
                  style={{
                    color: dark ? "rgba(245,241,232,0.75)" : "var(--muted)",
                    textWrap: "pretty",
                  }}
                >
                  {e.blurb}
                </p>

                <ul className="m-0 flex flex-1 list-none flex-col gap-[10px] p-0">
                  {e.points.map((p) => (
                    <li
                      key={p}
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
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-1">
                  {dark ? (
                    <Link href="/signup" className="block w-full sm:inline-block sm:w-auto">
                      <Button
                        variant="onDark"
                        size="md"
                        iconRight="arrow-right"
                        className="w-full justify-center sm:w-auto"
                      >
                        Start free
                      </Button>
                    </Link>
                  ) : HAS_PUBLIC_REPO ? (
                    <Link
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full sm:inline-block sm:w-auto"
                    >
                      <Button
                        variant="ghost"
                        size="md"
                        icon="github-logo"
                        className="w-full justify-center sm:w-auto"
                      >
                        View on GitHub
                      </Button>
                    </Link>
                  ) : (
                    <span
                      className="inline-flex items-center gap-[8px] rounded-[8px] border border-line bg-paper px-[14px] py-[9px] text-[13px] font-medium tracking-[-0.005em] text-muted"
                      title="The public repository is on its way."
                    >
                      <Icon name="git-branch" size={14} className="text-moss" />
                      Source opening soon
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
