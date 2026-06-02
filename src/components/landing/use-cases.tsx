import { Eyebrow } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { SITE_NAME } from "@/lib/site";

/* eslint-disable @next/next/no-img-element */

type Case = {
  tag: string;
  title: string;
  body: string;
  scene: { label: string; caption: string; image: string };
  bullets: string[];
  stat: string;
  sub: string;
  quote: string;
  by: string;
  byRole: string;
};

const cases: Case[] = [
  {
    tag: "Galleries & Museums",
    title: "Wall labels that keep up with the wall",
    body: "When a loan arrives, when a piece moves, when hours shift for a private event, one change updates every screen.",
    scene: {
      label: "ATRIUM · NORTH",
      caption: "“Works on Paper, 1962–1974” opens Friday at 6.",
      image:
        "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1400&q=70",
    },
    bullets: [
      "Portrait and video wall layouts",
      "Private-event hours, automated",
      "Audit trail for every label change",
    ],
    stat: "14s",
    sub: "average label update",
    quote: "The first tool where the screens are never the thing that breaks.",
    by: "Mira Okafor",
    byRole: "Director of Events, Lakeside Hall",
  },
  {
    tag: "Hotels & Lobbies",
    title: "A quiet welcome, room by room",
    body: "Spa hours in the lobby. Agendas by the mezzanine. The chef's menu beside the maitre d'.",
    scene: {
      label: "LOBBY · EAST",
      caption: "Welcome to the Fairmont. Concierge open until 11.",
      image:
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=70",
    },
    bullets: [
      "Per-room scheduling and overrides",
      "Quiet hours for overnight lobbies",
      `Brand-safe templates, no ${SITE_NAME} mark`,
    ],
    stat: "8 displays",
    sub: "per property, average",
    quote: "Guests notice the screens only because they say the right thing.",
    by: "Henrik Valle",
    byRole: "Programming Lead, Atrium North",
  },
  {
    tag: "Events & Conferences",
    title: "A program that keeps itself",
    body: `Reception at six. Gala loop at eight. Thank-you card at midnight. ${SITE_NAME} remembers so you don't.`,
    scene: {
      label: "FOYER · EAST",
      caption: "Dr. Kemi Adebayo, Keynote at 9:30 am, Grand Hall.",
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=70",
    },
    bullets: [
      "Run-of-show timers, per room",
      "Sponsor rotations without duplicates",
      "Producer and venue-staff roles",
    ],
    stat: "47 events",
    sub: "on one fall plan",
    quote: "I schedule a week on Monday morning. Then I forget about it.",
    by: "Sana Levi",
    byRole: "Producer, Kastner + Co",
  },
];

function SceneFrame({
  label,
  caption,
  image,
}: {
  label: string;
  caption: string;
  image: string;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ aspectRatio: "16/10", background: "#19231A" }}
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[var(--ease-settle)] group-hover:scale-[1.025]"
        style={{ filter: "saturate(0.78) contrast(1.04)" }}
      />
      {/* Cinematic grade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,20,16,0.08) 0%, rgba(14,20,16,0.18) 40%, rgba(14,20,16,0.72) 100%)",
        }}
      />
      {/* Inner border recess — gives a screen-bezel feeling */}
      <div
        className="pointer-events-none absolute rounded-none"
        style={{
          inset: 10,
          border: "1px solid rgba(245,241,232,0.14)",
          boxShadow: "inset 0 0 0 1px rgba(14,20,16,0.4)",
        }}
      />
      {/* Location badge */}
      <div
        className="absolute font-mono text-paper"
        style={{
          left: 14,
          top: 14,
          fontSize: 9.5,
          opacity: 0.65,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      {/* Caption */}
      <div
        className="absolute font-serif text-paper"
        style={{
          left: 14,
          right: 14,
          bottom: 14,
          fontSize: 14.5,
          lineHeight: 1.32,
          letterSpacing: "-0.016em",
          fontVariationSettings: "'opsz' 18",
          maxWidth: "88%",
          textShadow: "0 1px 16px rgba(0,0,0,0.45)",
        }}
      >
        {caption}
      </div>
    </div>
  );
}

export function UseCases() {
  return (
    <section
      id="use-cases"
      className="relative border-b border-t border-line bg-surface px-5 py-20 md:px-8 md:py-28"
    >
      {/* Subtle ambient depth behind the section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--line-strong)", opacity: 0.5 }}
      />

      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        {/* Section header — generous breathing room */}
        <div className="mb-14 max-w-[720px] md:mb-16">
          <Eyebrow className="mb-3 text-moss">Use cases</Eyebrow>
          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(30px, 4.8vw, 52px)",
              lineHeight: 1.08,
              letterSpacing: "-0.032em",
              fontWeight: 500,
              color: "#0E1410",
              margin: "0 0 18px",
              fontVariationSettings: "'opsz' 72",
              textWrap: "balance",
            }}
          >
            Built for the places where a screen is part of the room,{" "}
            <em style={{ fontStyle: "italic", color: "#3B5A41" }}>
              not the reason for it.
            </em>
          </h2>
          <p
            className="font-sans text-muted"
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              letterSpacing: "-0.005em",
              maxWidth: 540,
              textWrap: "pretty",
            }}
          >
            Three venues, three different rhythms — one system that stays out of the way.
          </p>
        </div>

        {/* Card grid — asymmetric first card spans full width on md */}
        <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
          {cases.map((c, i) => {
            const num = String(i + 1).padStart(2, "0");
            const isFeature = i === 0;

            return (
              <article
                key={c.tag}
                className={[
                  "group relative flex flex-col overflow-hidden rounded-[3px] border border-line shadow-tinted-sm",
                  "transition-[border-color,box-shadow,transform] duration-[200ms] ease-[var(--ease-quiet)]",
                  "hover:-translate-y-[2px] hover:border-line-strong hover:shadow-tinted-md",
                  "animate-fade-up",
                  isFeature ? "lg:col-span-1" : "",
                ].join(" ")}
                style={{
                  background: "#FBF8F0",
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <SceneFrame {...c.scene} />

                {/* Bottom edge hairline reflection */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{ background: "rgba(251,248,240,0.8)" }}
                />

                <div className="flex flex-1 flex-col gap-5 p-6 md:p-7">
                  {/* Tag row */}
                  <div className="flex items-center gap-[10px]">
                    <span
                      className="font-mono text-muted-2"
                      style={{ fontSize: 10.5, letterSpacing: "0.14em" }}
                    >
                      {num}
                    </span>
                    <span
                      aria-hidden
                      style={{
                        width: 16,
                        height: 1,
                        background: "var(--line-strong)",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="font-mono text-moss"
                      style={{
                        fontSize: 10.5,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontWeight: 500,
                      }}
                    >
                      {c.tag}
                    </span>
                  </div>

                  {/* Heading */}
                  <h3
                    className="font-serif"
                    style={{
                      fontSize: 21,
                      lineHeight: 1.22,
                      letterSpacing: "-0.022em",
                      fontWeight: 500,
                      color: "#0E1410",
                      margin: 0,
                      fontVariationSettings: "'opsz' 48",
                      textWrap: "balance",
                    }}
                  >
                    {c.title}
                  </h3>

                  {/* Body */}
                  <p
                    className="text-muted"
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.58,
                      letterSpacing: "-0.005em",
                      margin: 0,
                      textWrap: "pretty",
                    }}
                  >
                    {c.body}
                  </p>

                  {/* Bullets */}
                  <ul className="m-0 flex list-none flex-col gap-[7px] p-0">
                    {c.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-[10px] text-[13px] text-ink"
                        style={{
                          letterSpacing: "-0.005em",
                          lineHeight: 1.45,
                          textWrap: "pretty",
                        }}
                      >
                        <Icon
                          name="check"
                          size={13}
                          style={{
                            color: "#3B5A41",
                            marginTop: 3,
                            flexShrink: 0,
                          }}
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Stat */}
                  <div
                    className="rule-letterpress mt-auto flex items-baseline gap-[8px] pt-5"
                  >
                    <div
                      className="font-serif"
                      style={{
                        fontSize: 24,
                        fontWeight: 500,
                        color: "#3B5A41",
                        letterSpacing: "-0.024em",
                        fontVariationSettings: "'opsz' 48",
                        lineHeight: 1,
                      }}
                    >
                      {c.stat}
                    </div>
                    <div
                      className="text-muted"
                      style={{ fontSize: 12, letterSpacing: "-0.005em" }}
                    >
                      {c.sub}
                    </div>
                  </div>

                  {/* Quote */}
                  <figure
                    className="m-0 flex items-start gap-0"
                    style={{
                      borderLeft: "2px solid #3B5A41",
                      paddingLeft: 14,
                      paddingTop: 2,
                      paddingBottom: 2,
                    }}
                  >
                    <div className="flex-1">
                      <blockquote
                        className="m-0 font-serif italic"
                        style={{
                          fontSize: 13,
                          lineHeight: 1.5,
                          letterSpacing: "-0.008em",
                          color: "#0E1410",
                          textWrap: "pretty",
                          fontVariationSettings: "'opsz' 18",
                        }}
                      >
                        &ldquo;{c.quote}&rdquo;
                      </blockquote>
                      <figcaption
                        className="mt-[7px]"
                        style={{ fontSize: 11.5, letterSpacing: "-0.005em" }}
                      >
                        <span className="text-ink" style={{ fontWeight: 500 }}>
                          {c.by}
                        </span>
                        <span className="text-muted"> &middot; {c.byRole}</span>
                      </figcaption>
                    </div>
                  </figure>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
