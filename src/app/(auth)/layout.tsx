import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui/wordmark";

/* On-dark tokens tuned for the forest aside */
const ONDARK = {
  text: "#F5F1E8",
  muted: "rgba(245,241,232,0.70)",
  accent: "#B8D0BC",
  dot: "#7FB089",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[45fr_55fr]">
      {/* Left — brand canvas (persists across auth page navigations) */}
      <aside
        className="clarra-auth-aside relative flex flex-col overflow-hidden"
        style={{ color: ONDARK.text, minHeight: 240 }}
      >
        <div aria-hidden className="clarra-auth-bg" />
        <div aria-hidden className="clarra-auth-wash" />

        {/* Wordmark */}
        <div className="relative flex items-center px-6 pt-6 md:px-10 md:pt-10">
          <Link
            href="/"
            className="animate-fade-up inline-block"
            aria-label="Clarra home"
            style={{ color: ONDARK.text }}
          >
            <Wordmark size={26} />
          </Link>
        </div>

        {/* Brand block — centered */}
        <div className="relative flex flex-1 items-center px-6 py-14 md:px-14 lg:px-16">
          <div className="max-w-[580px]">
            <p
              className="animate-fade-up"
              style={{
                color: ONDARK.muted,
                fontFamily: "var(--font-mono), monospace",
                fontSize: 10.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                marginBottom: 22,
              }}
            >
              <span
                className="mr-[10px] inline-block rounded-full align-middle"
                style={{
                  width: 6,
                  height: 6,
                  background: ONDARK.dot,
                  boxShadow: "0 0 0 4px rgba(127,176,137,0.18)",
                }}
              />
              A slideshow platform for venues
            </p>
            <h1
              className="animate-fade-up font-serif"
              style={{
                fontSize: "clamp(36px, 5vw, 64px)",
                lineHeight: 1.04,
                letterSpacing: "-0.034em",
                fontWeight: 400,
                fontVariationSettings: "'opsz' 72",
                textWrap: "balance",
                color: ONDARK.text,
                animationDelay: "80ms",
              }}
            >
              <span className="lg:hidden">Every screen, one quiet tab.</span>
              <span className="hidden lg:inline">
                Every screen in the building,{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: ONDARK.accent,
                  }}
                >
                  run from one quiet tab.
                </em>
              </span>
            </h1>
            <p
              className="animate-fade-up mt-6 font-serif"
              style={{
                color: ONDARK.muted,
                fontSize: 17,
                lineHeight: 1.55,
                letterSpacing: "-0.005em",
                maxWidth: 460,
                fontVariationSettings: "'opsz' 18",
                animationDelay: "160ms",
              }}
            >
              The quiet screen on the wall, managed from one calm place. Pair
              any browser. Schedule run-of-show. Sync from Drive or Dropbox.
            </p>
          </div>
        </div>
      </aside>

      {/* Right — form panel (page-specific children) */}
      <section className="relative flex items-center justify-center border-t border-line bg-surface px-6 py-12 md:px-10 lg:border-l lg:border-t-0">
        {children}
      </section>
    </div>
  );
}
