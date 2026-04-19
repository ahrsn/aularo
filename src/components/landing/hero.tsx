import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-10 pt-12 md:px-8 md:pb-10 md:pt-[72px]">
      {/* Ambient depth backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0"
        style={{
          top: 320,
          bottom: 0,
          background:
            "radial-gradient(60% 50% at 50% 38%, rgba(59,90,65,0.18) 0%, rgba(59,90,65,0.08) 35%, rgba(245,241,232,0) 70%)",
          filter: "blur(8px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0"
        style={{
          top: 380,
          bottom: 0,
          background:
            "radial-gradient(40% 30% at 30% 60%, rgba(238,233,219,0.7) 0%, rgba(245,241,232,0) 70%), radial-gradient(35% 28% at 72% 55%, rgba(25,35,26,0.10) 0%, rgba(245,241,232,0) 70%)",
        }}
      />

      <div
        className="relative mx-auto text-center"
        style={{ maxWidth: 1120 }}
      >
        <div
          className="animate-fade-up inline-flex items-center gap-[10px] rounded-[10px] border border-line bg-surface"
          style={{ padding: "5px 12px 5px 10px" }}
        >
          <span
            className="rounded-full"
            style={{ width: 6, height: 6, background: "#3B5A41" }}
          />
          <span
            className="text-[12.5px] tracking-[-0.005em] text-ink"
            style={{ fontFamily: "var(--font-geist), sans-serif" }}
          >
            New · Multi-Event Scheduling
          </span>
          <span className="text-[12.5px] text-muted">Learn More</span>
        </div>

        <h1
          className="animate-fade-up mx-auto font-serif"
          style={{
            fontSize: "clamp(48px, 7vw, 88px)",
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            fontWeight: 400,
            color: "#0E1410",
            margin: "28px auto 22px",
            maxWidth: 960,
            fontVariationSettings: "'opsz' 72",
            textWrap: "balance",
            animationDelay: "80ms",
          }}
        >
          Every screen in the building,
          <br />
          <em
            style={{
              fontStyle: "italic",
              fontWeight: 400,
              color: "#3B5A41",
            }}
          >
            run from one quiet tab.
          </em>
        </h1>

        <p
          className="animate-fade-up mx-auto font-serif text-muted"
          style={{
            fontSize: 19,
            lineHeight: 1.5,
            maxWidth: 640,
            margin: "0 auto 28px",
            fontVariationSettings: "'opsz' 18",
            letterSpacing: "-0.005em",
            textWrap: "pretty",
            animationDelay: "160ms",
          }}
        >
          Schedule a week of programming in twenty minutes. No USB sticks, no
          reboots, no walking to the lobby TV. One change updates every display
          in under fifteen seconds.
        </p>

        <div className="animate-fade-up flex flex-col items-stretch justify-center gap-[10px] sm:flex-row sm:items-center" style={{ marginBottom: 20, animationDelay: "240ms" }}>
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              iconRight="arrow-right"
              className="w-full justify-center sm:w-auto"
            >
              Start Free Trial
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="lg"
            icon="play"
            className="w-full justify-center sm:w-auto"
          >
            Watch a Loop
          </Button>
        </div>

        <div
          className="animate-fade-up mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12.5px] tracking-[-0.005em] text-muted"
          style={{ maxWidth: 700, marginBottom: 40, animationDelay: "320ms" }}
        >
          <div className="flex items-center gap-[10px]">
            <div className="flex -space-x-[6px]">
              {["M", "H", "A", "K"].map((ch, i) => (
                <div
                  key={ch}
                  className="flex h-6 w-6 items-center justify-center rounded-full border font-serif"
                  style={{
                    background: [
                      "#3B5A41",
                      "#6B7268",
                      "#19231A",
                      "#A9877A",
                    ][i],
                    color: "#F5F1E8",
                    borderColor: "#F5F1E8",
                    fontSize: 10.5,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    zIndex: 4 - i,
                  }}
                >
                  {ch}
                </div>
              ))}
            </div>
            <span className="text-ink">
              <strong style={{ fontWeight: 500 }}>1,200+ venues</strong> run
              Clarra today
            </span>
          </div>
          <div
            aria-hidden
            className="hidden h-4 md:block"
            style={{ width: 1, background: "var(--line)" }}
          />
          <div className="flex items-center gap-[10px]">
            <div
              className="flex h-[22px] w-[22px] items-center justify-center rounded-full font-bold"
              style={{
                background: "#FF492C",
                color: "#FFFFFF",
                fontSize: 10,
                letterSpacing: "-0.02em",
                fontFamily: "var(--font-geist), sans-serif",
              }}
              aria-label="G2"
            >
              G2
            </div>
            <div
              className="flex items-center"
              style={{
                color: "#FF492C",
                fontSize: 15,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
              aria-label="5 out of 5 stars"
            >
              <span aria-hidden>★★★★★</span>
            </div>
            <span className="text-ink">
              <strong style={{ fontWeight: 500 }}>4.9</strong>
              <span className="text-muted"> · 180 reviews</span>
            </span>
          </div>
        </div>

        {/* Product still with depth stage */}
        <div className="animate-fade-up relative mx-auto" style={{ maxWidth: 1120, animationDelay: "420ms" }}>
          {/* Soft halo behind the frame */}
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              inset: "-40px -60px 20px",
              background:
                "radial-gradient(closest-side, rgba(25,35,26,0.18), rgba(25,35,26,0) 70%)",
              filter: "blur(20px)",
            }}
          />
          {/* Layered back-card for depth */}
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-[8px] border border-line"
            style={{
              inset: "10px 22px -14px",
              background: "#F0EBDD",
              transform: "translateY(14px) scale(0.985)",
              opacity: 0.7,
              boxShadow: "0 30px 50px -30px rgba(25,35,26,0.20)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-[7px] border border-line"
            style={{
              inset: "4px 10px -6px",
              background: "#F8F4E8",
              transform: "translateY(6px) scale(0.992)",
              opacity: 0.85,
            }}
          />

          {/* The actual frame */}
          <div
            className="relative overflow-hidden rounded-[8px] border border-line bg-paper"
            style={{
              filter:
                "drop-shadow(0 40px 60px rgba(25,35,26,0.22)) drop-shadow(0 14px 24px rgba(25,35,26,0.10))",
            }}
          >
            <Image
              src="/hero-screenshot-v2.png"
              alt="Clarra dashboard — Slideshows view for Design Week '26"
              width={1791}
              height={1128}
              priority
              className="block h-auto w-full"
              sizes="(min-width: 1120px) 1080px, 92vw"
            />
            {/* Subtle top sheen */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0"
              style={{
                height: 80,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)",
                mixBlendMode: "soft-light",
              }}
            />
            {/* Inner ring for crispness */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[8px]"
              style={{
                boxShadow: "inset 0 0 0 1px rgba(25,35,26,0.06)",
              }}
            />
          </div>

          {/* Floor reflection / fade */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10"
            style={{
              bottom: -40,
              height: 60,
              background:
                "radial-gradient(60% 100% at 50% 0%, rgba(25,35,26,0.18) 0%, rgba(25,35,26,0) 75%)",
              filter: "blur(6px)",
            }}
          />
        </div>

        <div
          className="mx-auto mt-12 flex items-center justify-center gap-[14px] text-[12.5px] tracking-[-0.005em] text-muted"
          style={{ maxWidth: 600 }}
        >
          <Icon name="check" size={14} /> Free for one display · Works on any
          browser · Cancel anytime
        </div>
      </div>
    </section>
  );
}
