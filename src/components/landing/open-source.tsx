import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/label";
import { SITE_NAME, GITHUB_URL, HAS_PUBLIC_REPO } from "@/lib/site";

export function OpenSource() {
  return (
    <section id="open-source" className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto" style={{ maxWidth: 940 }}>
        {/* Editorial statement */}
        <div className="mx-auto max-w-[680px] text-center">
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
              maxWidth: 540,
              fontVariationSettings: "'opsz' 18",
              textWrap: "pretty",
            }}
          >
            {SITE_NAME} is open core. The whole product is open source under
            AGPLv3 — host it yourself for free, or let us run the managed cloud.
            Same software either way. No lock-in.
          </p>
        </div>

        {/* Two paths — editorial columns split by a hairline, not pricing cards */}
        <div className="mx-auto mt-14 max-w-[760px] md:mt-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-0">
            {/* Self-host */}
            <div className="md:pr-12">
              <div className="text-eyebrow text-moss">Self-host</div>
              <h3
                className="mt-3 font-serif text-ink"
                style={{
                  fontSize: 23,
                  fontWeight: 500,
                  letterSpacing: "-0.022em",
                  fontVariationSettings: "'opsz' 48",
                }}
              >
                Run it yourself, free.
              </h3>
              <p
                className="mt-2 text-[14px] leading-[1.6] tracking-[-0.005em] text-muted"
                style={{ textWrap: "pretty" }}
              >
                Every feature unlocked on your own infrastructure — your
                database, your storage, your data. AGPLv3: read it, fork it,
                extend it.
              </p>
              {HAS_PUBLIC_REPO ? (
                <Link
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-4 inline-flex items-center gap-[7px] text-[13.5px] font-medium tracking-[-0.005em] text-ink transition-colors duration-quiet hover:text-moss"
                >
                  <Icon name="github-logo" size={15} className="text-moss" />
                  View the source
                  <Icon
                    name="arrow-right"
                    size={13}
                    className="text-muted-2 transition-transform duration-quiet group-hover:translate-x-[2px]"
                  />
                </Link>
              ) : (
                <div className="mt-4 inline-flex items-center gap-[7px] text-[13px] tracking-[-0.005em] text-muted-2">
                  <Icon name="git-branch" size={14} className="text-moss" />
                  Public source opening soon
                </div>
              )}
            </div>

            {/* Managed cloud */}
            <div
              className="border-t border-line pt-10 md:border-l md:border-t-0 md:pl-12 md:pt-0"
            >
              <div className="text-eyebrow text-moss">Managed cloud</div>
              <h3
                className="mt-3 font-serif text-ink"
                style={{
                  fontSize: 23,
                  fontWeight: 500,
                  letterSpacing: "-0.022em",
                  fontVariationSettings: "'opsz' 48",
                }}
              >
                Or let us run it.
              </h3>
              <p
                className="mt-2 text-[14px] leading-[1.6] tracking-[-0.005em] text-muted"
                style={{ textWrap: "pretty" }}
              >
                The same software, fully hosted. We handle updates, scaling, and
                backups — you focus on the screens. Start free, grow when you
                need to.
              </p>
              <Link
                href="/signup"
                className="group mt-4 inline-flex items-center gap-[7px] text-[13.5px] font-medium tracking-[-0.005em] text-ink transition-colors duration-quiet hover:text-moss"
              >
                Start free
                <Icon
                  name="arrow-right"
                  size={13}
                  className="text-muted-2 transition-transform duration-quiet group-hover:translate-x-[2px]"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
