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
      "Before Clarra we ran five laptops for three events in one night. Now it's one browser tab and a 20-minute Monday.",
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
      "We priced a signage rebuild at sixty thousand. Clarra replaced the whole plan for the cost of the displays we already owned.",
    name: "Dr. Anna Brandt",
    role: "Curator",
    company: "Fieldhouse Museum",
    source: "Customer",
    accent: "#3B5A41",
  },
];

const metrics = [
  { source: "G2", score: "4.9", sub: "180 reviews", badge: "G2" },
  {
    source: "Capterra",
    score: "4.8",
    sub: "94 reviews",
    badge: "Capterra",
  },
  {
    source: "Product Hunt",
    score: "#3",
    sub: "Product of the Day",
    badge: "PH",
  },
  { source: "NPS", score: "72", sub: "from 1,200+ venues", badge: "NPS" },
];

function SourceTag({ source }: { source: Review["source"] }) {
  const map: Record<Review["source"], { bg: string; color: string }> = {
    G2: { bg: "#FF492C", color: "#FFFFFF" },
    Capterra: { bg: "#FF9D28", color: "#1D1D1F" },
    "Product Hunt": { bg: "#DA552F", color: "#FFFFFF" },
    Customer: { bg: "#3B5A41", color: "#F5F1E8" },
  };
  const s = map[source];
  return (
    <span
      className="inline-flex items-center rounded-[4px] font-medium uppercase"
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 9.5,
        letterSpacing: "0.06em",
        padding: "2px 6px",
        fontFamily: "var(--font-geist), sans-serif",
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
      className="px-5 py-16 md:px-8 md:py-24"
      style={{ background: "#19231A", color: "#F5F1E8" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
          <div className="max-w-[640px]">
            <div
              className="mb-[10px] font-sans text-[11px] font-medium uppercase tracking-[0.08em]"
              style={{ color: "rgba(245,241,232,0.55)" }}
            >
              Reviews
            </div>
            <h2
              className="font-serif text-[32px] leading-[1.1] md:text-[44px] md:leading-[1.08]"
              style={{
                letterSpacing: "-0.028em",
                fontWeight: 400,
                color: "#F5F1E8",
                margin: 0,
                fontVariationSettings: "'opsz' 72",
                textWrap: "balance",
              }}
            >
              The quiet reviews from{" "}
              <em style={{ fontStyle: "italic", color: "#A9C2AD" }}>
                the people running the rooms.
              </em>
            </h2>
          </div>
          <div
            className="text-[13px] italic"
            style={{
              color: "rgba(245,241,232,0.55)",
              maxWidth: 280,
              textWrap: "pretty",
              fontFamily: "var(--font-newsreader), serif",
              fontVariationSettings: "'opsz' 18",
            }}
          >
            What venue directors, producers, and curators actually say when
            they stop having to think about the screen.
          </div>
        </div>

        <div
          className="mb-8 grid grid-cols-2 gap-x-6 gap-y-5 rounded-[4px] md:mb-12 md:grid-cols-4 md:gap-x-10"
          style={{
            borderTop: "1px solid rgba(245,241,232,0.15)",
            borderBottom: "1px solid rgba(245,241,232,0.15)",
            padding: "22px 0",
          }}
        >
          {metrics.map((m) => (
            <div
              key={m.source}
              className="flex flex-col gap-[4px]"
            >
              <div
                className="text-[10.5px] font-medium uppercase"
                style={{
                  letterSpacing: "0.1em",
                  color: "rgba(245,241,232,0.5)",
                  fontFamily: "var(--font-geist), sans-serif",
                }}
              >
                {m.source}
              </div>
              <div
                className="flex items-baseline gap-[8px]"
              >
                <div
                  className="font-serif"
                  style={{
                    fontSize: 32,
                    fontWeight: 500,
                    letterSpacing: "-0.028em",
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
                className="text-[11.5px] tracking-[-0.005em]"
                style={{ color: "rgba(245,241,232,0.55)" }}
              >
                {m.sub}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <figure
              key={`${r.name}-${i}`}
              className="m-0 flex flex-col gap-4 rounded-[4px]"
              style={{
                background: "rgba(245,241,232,0.04)",
                border: "1px solid rgba(245,241,232,0.1)",
                padding: "20px 20px 18px",
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  style={{
                    color: "#FF492C",
                    fontSize: 14,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                  aria-label="5 stars"
                >
                  <span aria-hidden>★★★★★</span>
                </div>
                <SourceTag source={r.source} />
              </div>

              <blockquote
                className="m-0 font-serif"
                style={{
                  fontSize: 15.5,
                  lineHeight: 1.5,
                  letterSpacing: "-0.012em",
                  color: "#F5F1E8",
                  fontVariationSettings: "'opsz' 18",
                  textWrap: "pretty",
                }}
              >
                &ldquo;{r.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-auto flex items-center gap-[10px] pt-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full font-serif"
                  style={{
                    background: r.accent ?? "#3B5A41",
                    color: "#F5F1E8",
                    fontSize: 12.5,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    flexShrink: 0,
                  }}
                >
                  {r.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[12.5px]"
                    style={{
                      fontWeight: 500,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {r.name}
                  </div>
                  <div
                    className="text-[11.5px]"
                    style={{
                      color: "rgba(245,241,232,0.55)",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {r.role}, {r.company}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-center md:mt-14">
          <a
            href="#"
            className="text-[13.5px] tracking-[-0.005em] underline underline-offset-[3px]"
            style={{ color: "#A9C2AD" }}
          >
            Read 180+ reviews on G2
          </a>
          <span
            aria-hidden
            style={{
              width: 1,
              height: 12,
              background: "rgba(245,241,232,0.2)",
            }}
          />
          <a
            href="#"
            className="text-[13.5px] tracking-[-0.005em] underline underline-offset-[3px]"
            style={{ color: "#A9C2AD" }}
          >
            See case studies
          </a>
        </div>
      </div>
    </section>
  );
}
