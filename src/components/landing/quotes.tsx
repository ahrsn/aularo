"use client";

import { SITE_NAME } from "@/lib/site";

type Review = {
  quote: string;
  name: string;
  role: string;
  company: string;
  source: "G2" | "Capterra" | "Product Hunt" | "Customer";
  accent?: string;
};

const reviews: Review[] = [
  {
    quote:
      `Before ${SITE_NAME} we ran five laptops for three events in one night. Now it's one browser tab and a 20-minute Monday.`,
    name: "Mira Okafor",
    role: "Director of Events",
    company: "Lakeside Hall",
    source: "G2",
    accent: "#C9B68A",
  },
  {
    quote:
      "We stopped walking to the atrium with USB sticks. The screens just update. I still flinch every time I remember how it used to be.",
    name: "Henrik Valle",
    role: "Programming Lead",
    company: "Atrium North",
    source: "G2",
  },
  {
    quote:
      "Pairing a new kiosk takes less than a minute. I keep handing the iPad to interns, just to watch them realize there's nothing hard to learn.",
    name: "Sana Levi",
    role: "Producer",
    company: "Kastner + Co",
    source: "Product Hunt",
  },
  {
    quote:
      "The offline-safe mode saved our gala. The lobby lost WiFi at 7:55 and no one in the room knew until I told them the next day.",
    name: "Priya Rao",
    role: "Venue Manager",
    company: "The Fairmont",
    source: "Capterra",
    accent: "#A9877A",
  },
  {
    quote:
      "Our producers edit, our venue staff pause. The audit log means no one blames the display anymore, which is a real cultural shift.",
    name: "Marcus Lee",
    role: "Head of Operations",
    company: "Design Week PDX",
    source: "G2",
  },
  {
    quote:
      `We priced a signage rebuild at sixty thousand. ${SITE_NAME} replaced the whole plan for the cost of the displays we already owned.`,
    name: "Dr. Anna Brandt",
    role: "Curator",
    company: "Fieldhouse Museum",
    source: "Customer",
    accent: "#3B5A41",
  },
];

const metrics = [
  { source: "G2", score: "4.9", sub: "180 reviews", badge: "G2" },
  { source: "Capterra", score: "4.8", sub: "94 reviews", badge: "Capterra" },
  { source: "Product Hunt", score: "#3", sub: "Product of the Day", badge: "PH" },
  { source: "NPS", score: "72", sub: "from 1,200+ venues", badge: "NPS" },
];

function SourceBadge({ source }: { source: Review["source"] }) {
  const map: Record<Review["source"], { bg: string; color: string }> = {
    G2: { bg: "#FF492C", color: "#FFFFFF" },
    Capterra: { bg: "#FF9D28", color: "#1D1D1F" },
    "Product Hunt": { bg: "#DA552F", color: "#FFFFFF" },
    Customer: { bg: "#3B5A41", color: "#F5F1E8" },
  };
  const s = map[source];
  return (
    <span
      className="inline-flex items-center rounded-[3px] font-medium uppercase"
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 9,
        letterSpacing: "0.07em",
        padding: "2px 5px",
        fontFamily: "var(--font-jetbrains), monospace",
      }}
    >
      {source === "Customer" ? "Verified" : source}
    </span>
  );
}

export function Quotes() {
  return (
    <section
      id="reviews"
      className="px-5 py-20 md:px-8 md:py-32"
      style={{ background: "#19231A", color: "#F5F1E8" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1120 }}>

        {/* Section header */}
        <div className="mb-14 md:mb-20">
          <div
            className="mb-4 text-eyebrow"
            style={{ color: "rgba(245,241,232,0.45)" }}
          >
            In their words
          </div>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <h2
              className="font-serif m-0"
              style={{
                fontSize: "clamp(28px, 5vw, 48px)",
                lineHeight: 1.08,
                letterSpacing: "-0.030em",
                fontWeight: 400,
                fontVariationSettings: "'opsz' 72",
                color: "#F5F1E8",
                textWrap: "balance",
                maxWidth: 580,
              }}
            >
              The quiet reviews from{" "}
              <em style={{ fontStyle: "italic", color: "#A9C2AD" }}>
                the people running the rooms.
              </em>
            </h2>
            <p
              style={{
                fontFamily: "var(--font-newsreader), serif",
                fontVariationSettings: "'opsz' 18",
                fontSize: 15,
                lineHeight: 1.55,
                letterSpacing: "-0.005em",
                color: "rgba(245,241,232,0.5)",
                maxWidth: 280,
                margin: 0,
                textWrap: "pretty",
                fontStyle: "italic",
              }}
            >
              Venue directors, producers, and curators — after they stopped
              having to think about the screen.
            </p>
          </div>
        </div>

        {/* Metrics strip */}
        <div
          className="mb-16 md:mb-20 grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4"
          style={{
            borderTop: "1px solid rgba(245,241,232,0.12)",
            paddingTop: 28,
          }}
        >
          {metrics.map((m) => (
            <div key={m.source} className="flex flex-col gap-[5px]">
              <div
                className="text-eyebrow"
                style={{ color: "rgba(245,241,232,0.38)" }}
              >
                {m.source}
              </div>
              <div className="flex items-baseline gap-[10px]">
                <div
                  className="font-serif"
                  style={{
                    fontSize: 36,
                    fontWeight: 500,
                    letterSpacing: "-0.032em",
                    lineHeight: 1,
                    color: "#F5F1E8",
                    fontVariationSettings: "'opsz' 48",
                  }}
                >
                  {m.score}
                </div>
                {m.score.startsWith("4") && (
                  <div
                    style={{
                      color: "#FF492C",
                      fontSize: 13,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                    aria-hidden
                  >
                    ★★★★★
                  </div>
                )}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-geist), sans-serif",
                  fontSize: 11.5,
                  letterSpacing: "-0.005em",
                  color: "rgba(245,241,232,0.45)",
                }}
              >
                {m.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Pull-quote grid — 2-col on md, 3-col on lg */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => {
            const delay = `${i * 70}ms`;
            const accentColor = r.accent ?? "#3B5A41";
            return (
              <figure
                key={`${r.name}-${i}`}
                className="animate-fade-up m-0 flex flex-col"
                style={{
                  animationDelay: delay,
                  background: "rgba(245,241,232,0.045)",
                  border: "1px solid rgba(245,241,232,0.09)",
                  borderRadius: 6,
                  padding: "28px 26px 24px",
                  transition: "background 180ms, border-color 180ms, box-shadow 180ms",
                  boxShadow: "0 1px 3px rgba(14,20,16,0.3), 0 6px 18px -6px rgba(14,20,16,0.28)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(245,241,232,0.065)";
                  el.style.borderColor = "rgba(245,241,232,0.16)";
                  el.style.boxShadow = "0 2px 6px rgba(14,20,16,0.35), 0 14px 36px -10px rgba(14,20,16,0.32)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(245,241,232,0.045)";
                  el.style.borderColor = "rgba(245,241,232,0.09)";
                  el.style.boxShadow = "0 1px 3px rgba(14,20,16,0.3), 0 6px 18px -6px rgba(14,20,16,0.28)";
                }}
              >
                {/* Opening mark + source badge row */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  {/* Large editorial open-quote */}
                  <span
                    aria-hidden
                    className="font-serif leading-none select-none"
                    style={{
                      fontSize: 52,
                      lineHeight: 0.7,
                      fontVariationSettings: "'opsz' 72",
                      fontWeight: 500,
                      color: accentColor,
                      opacity: 0.6,
                      letterSpacing: "-0.04em",
                      userSelect: "none",
                    }}
                  >
                    &ldquo;
                  </span>
                  <SourceBadge source={r.source} />
                </div>

                {/* Pull-quote body — large italic serif */}
                <blockquote
                  className="m-0 font-serif flex-1"
                  style={{
                    fontSize: "clamp(15px, 2.2vw, 17px)",
                    lineHeight: 1.52,
                    letterSpacing: "-0.015em",
                    color: "rgba(245,241,232,0.92)",
                    fontVariationSettings: "'opsz' 18",
                    fontStyle: "italic",
                    fontWeight: 400,
                    textWrap: "pretty",
                  }}
                >
                  {r.quote}
                </blockquote>

                {/* Rule + attribution */}
                <div
                  className="mt-6 pt-5"
                  style={{ borderTop: "1px solid rgba(245,241,232,0.10)" }}
                >
                  <figcaption>
                    {/* Accent rule to visually anchor attribution */}
                    <div
                      aria-hidden
                      style={{
                        width: 20,
                        height: 2,
                        borderRadius: 1,
                        background: accentColor,
                        opacity: 0.7,
                        marginBottom: 8,
                      }}
                    />
                    <div
                      style={{
                        fontFamily: "var(--font-geist), sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        color: "#F5F1E8",
                        lineHeight: 1.3,
                      }}
                    >
                      {r.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-geist), sans-serif",
                        fontSize: 11.5,
                        letterSpacing: "-0.005em",
                        color: "rgba(245,241,232,0.48)",
                        lineHeight: 1.4,
                        marginTop: 2,
                      }}
                    >
                      {r.role}, {r.company}
                    </div>
                  </figcaption>
                </div>
              </figure>
            );
          })}
        </div>

        {/* Footer links */}
        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-4 text-center md:mt-20"
        >
          <a
            href="#"
            style={{
              fontFamily: "var(--font-geist), sans-serif",
              fontSize: 13.5,
              letterSpacing: "-0.005em",
              color: "#A9C2AD",
              textDecoration: "underline",
              textUnderlineOffset: 3,
              transition: "color 180ms",
            }}
          >
            Read 180+ reviews on G2
          </a>
          <span
            aria-hidden
            style={{
              width: 1,
              height: 12,
              background: "rgba(245,241,232,0.18)",
              display: "inline-block",
            }}
          />
          <a
            href="#"
            style={{
              fontFamily: "var(--font-geist), sans-serif",
              fontSize: 13.5,
              letterSpacing: "-0.005em",
              color: "#A9C2AD",
              textDecoration: "underline",
              textUnderlineOffset: 3,
              transition: "color 180ms",
            }}
          >
            See case studies
          </a>
        </div>
      </div>
    </section>
  );
}
