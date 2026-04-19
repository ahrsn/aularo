import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/wordmark";

const cols: Array<{ title: string; items: string[] }> = [
  { title: "Product", items: ["Features", "Pricing", "Changelog", "Status"] },
  { title: "Use Cases", items: ["Galleries", "Hotels", "Events", "Kiosks"] },
  { title: "Company", items: ["About", "Customers", "Writing", "Careers"] },
  { title: "Support", items: ["Docs", "clarra.show", "Contact", "Security"] },
];

export function CTAFooter() {
  return (
    <section style={{ background: "#19231A", color: "#F5F1E8" }}>
      <div
        className="mx-auto px-5 pb-10 pt-16 md:px-8 md:pt-24"
        style={{ maxWidth: 1120 }}
      >
        <div
          className="grid grid-cols-1 items-end gap-10 pb-12 md:gap-12 md:pb-[72px] lg:grid-cols-[1.2fr_1fr]"
          style={{
            borderBottom: "1px solid rgba(245,241,232,0.15)",
          }}
        >
          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(34px, 5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.032em",
              fontWeight: 400,
              color: "#F5F1E8",
              margin: 0,
              maxWidth: 640,
              fontVariationSettings: "'opsz' 72",
              textWrap: "balance",
            }}
          >
            Start with one display.{" "}
            <em style={{ fontStyle: "italic", color: "#A9C2AD" }}>
              Free, and as long as you like.
            </em>
          </h2>
          <div>
            <div className="mb-4 flex flex-col gap-[10px] sm:flex-row">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  variant="onDark"
                  size="lg"
                  iconRight="arrow-right"
                  className="w-full justify-center sm:w-auto"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Button
                variant="onDarkGhost"
                size="lg"
                className="w-full justify-center sm:w-auto"
              >
                Book a Walkthrough
              </Button>
            </div>
            <div
              className="text-[12.5px] tracking-[-0.005em]"
              style={{ color: "rgba(245,241,232,0.55)" }}
            >
              No credit card. Upgrade when you&rsquo;re ready.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 py-10 md:py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-[14px]">
              <Wordmark size={22} color="#F5F1E8" />
            </div>
            <div
              className="font-serif italic"
              style={{
                fontSize: 15,
                lineHeight: 1.5,
                color: "rgba(245,241,232,0.6)",
                maxWidth: 280,
                fontVariationSettings: "'opsz' 18",
              }}
            >
              Slideshow software for the screen in the corner of the room.
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div
                className="mb-[14px] uppercase"
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  color: "rgba(245,241,232,0.5)",
                }}
              >
                {c.title}
              </div>
              <div className="flex flex-col gap-[9px]">
                {c.items.map((i) => (
                  <a
                    key={i}
                    href="#"
                    className="text-[13.5px] tracking-[-0.005em] text-paper no-underline"
                  >
                    {i}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-between pt-6"
          style={{
            borderTop: "1px solid rgba(245,241,232,0.15)",
            fontSize: 12.5,
            color: "rgba(245,241,232,0.5)",
            letterSpacing: "-0.005em",
          }}
        >
          <div>© Clarra · Raleigh, NC.</div>
          <div className="flex items-center gap-5">
            <a href="#" className="text-inherit no-underline">
              Privacy
            </a>
            <a href="#" className="text-inherit no-underline">
              Terms
            </a>
            <a href="#" className="text-inherit no-underline">
              SOC 2
            </a>
            <a
              href="https://chaosdigital.net"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
              style={{ color: "rgba(245,241,232,0.5)" }}
            >
              Built by Chaos Digital
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
