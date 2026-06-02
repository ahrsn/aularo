import Link from "next/link";
import { ProductStill } from "@/components/landing/product-still";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { OPEN_SOURCE_HREF, SITE_NAME } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-10 pt-12 md:px-8 md:pb-10 md:pt-[76px]">
      {/* Ambient depth backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0"
        style={{
          top: 340,
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
          top: 400,
          bottom: 0,
          background:
            "radial-gradient(40% 30% at 30% 60%, rgba(238,233,219,0.7) 0%, rgba(245,241,232,0) 70%), radial-gradient(35% 28% at 72% 55%, rgba(25,35,26,0.10) 0%, rgba(245,241,232,0) 70%)",
        }}
      />

      <div className="relative mx-auto text-center" style={{ maxWidth: 1120 }}>
        {/* Open-core eyebrow */}
        <Link
          href={OPEN_SOURCE_HREF}
          className="animate-fade-up group inline-flex max-w-[94vw] flex-wrap items-center justify-center gap-x-[10px] gap-y-1 rounded-[18px] border border-line bg-surface shadow-tinted-sm transition-colors duration-quiet hover:border-line-strong"
          style={{ padding: "6px 14px 6px 12px" }}
        >
          <span
            className="relative flex items-center justify-center"
            style={{ width: 7, height: 7 }}
          >
            <span
              className="absolute rounded-full"
              style={{ width: 7, height: 7, background: "#3B5A41", animation: "aularo-live-pulse 2.4s ease-out infinite" }}
            />
            <span
              className="relative rounded-full"
              style={{ width: 7, height: 7, background: "#3B5A41" }}
            />
          </span>
          <span className="text-eyebrow text-moss">Open source</span>
          <span aria-hidden style={{ width: 1, height: 11, background: "var(--line-strong)" }} />
          <span className="text-[12.5px] tracking-[-0.005em] text-muted">
            Self-host free, or use our cloud
          </span>
          <Icon
            name="arrow-right"
            size={12}
            className="text-muted-2 transition-transform duration-quiet group-hover:translate-x-[2px]"
          />
        </Link>

        <h1
          className="animate-fade-up text-display-xl mx-auto"
          style={{
            color: "#0E1410",
            margin: "26px auto 22px",
            maxWidth: 980,
            animationDelay: "80ms",
          }}
        >
          Every screen in the building,{" "}
          <br className="hidden sm:block" />
          <em style={{ fontStyle: "italic", fontWeight: 500, color: "#3B5A41" }}>
            run from one quiet tab.
          </em>
        </h1>

        <p
          className="animate-fade-up mx-auto font-serif text-muted"
          style={{
            fontSize: 19,
            lineHeight: 1.5,
            maxWidth: 652,
            margin: "0 auto 30px",
            fontVariationSettings: "'opsz' 18",
            letterSpacing: "-0.005em",
            textWrap: "pretty",
            animationDelay: "160ms",
          }}
        >
          Schedule a week of programming in twenty minutes. No USB sticks, no
          reboots, no walking to the lobby TV. One change updates every display
          in under fifteen seconds — open source, so the screens stay yours.
        </p>

        <div
          className="animate-fade-up flex flex-col items-stretch justify-center gap-[10px] sm:flex-row sm:items-center"
          style={{ marginBottom: 22, animationDelay: "240ms" }}
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              iconRight="arrow-right"
              className="w-full justify-center sm:w-auto"
            >
              Start free
            </Button>
          </Link>
          <Link href={OPEN_SOURCE_HREF} className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="lg"
              icon="terminal-window"
              className="w-full justify-center sm:w-auto"
            >
              Self-host it
            </Button>
          </Link>
        </div>

        <div
          className="animate-fade-up mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12.5px] tracking-[-0.005em] text-muted"
          style={{ maxWidth: 700, marginBottom: 44, animationDelay: "320ms" }}
        >
          <div className="flex items-center gap-[10px]">
            <div className="flex -space-x-[6px]">
              {["M", "H", "A", "K"].map((ch, i) => (
                <div
                  key={ch}
                  className="flex h-6 w-6 items-center justify-center rounded-full border font-serif"
                  style={{
                    background: ["#3B5A41", "#6B7268", "#19231A", "#A9877A"][i],
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
              <strong style={{ fontWeight: 500 }}>1,200+ venues</strong> run{" "}
              {SITE_NAME} today
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
              style={{ color: "#FF492C", fontSize: 15, letterSpacing: "-0.02em", lineHeight: 1 }}
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
        <div
          className="animate-fade-up relative mx-auto"
          style={{ maxWidth: 1120, animationDelay: "420ms" }}
        >
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

          <div
            className="relative overflow-hidden rounded-[8px] border border-line bg-paper"
            style={{
              filter:
                "drop-shadow(0 40px 60px rgba(25,35,26,0.22)) drop-shadow(0 14px 24px rgba(25,35,26,0.10))",
            }}
          >
            <ProductStill />
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
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[8px]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(25,35,26,0.06)" }}
            />
          </div>

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
          className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-x-[14px] gap-y-2 text-[12.5px] tracking-[-0.005em] text-muted"
          style={{ maxWidth: 640 }}
        >
          <Icon name="check" size={14} /> Open source &amp; self-hostable · Works
          on any browser · No vendor lock-in
        </div>
      </div>
    </section>
  );
}
