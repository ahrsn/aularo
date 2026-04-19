import { Eyebrow } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";

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
      caption: "\u201CWorks on Paper, 1962\u20131974\u201D opens Friday at 6.",
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
      "Brand-safe templates, no Clarra mark",
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
    body: "Reception at six. Gala loop at eight. Thank-you card at midnight. Clarra remembers so you don't.",
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
      className="relative overflow-hidden rounded-[2px] border border-line"
      style={{ aspectRatio: "16/10", background: "#19231A" }}
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: "saturate(0.82) contrast(1.02)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,20,16,0.1) 0%, rgba(14,20,16,0.2) 45%, rgba(14,20,16,0.68) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute rounded-[1px] border"
        style={{ inset: 12, borderColor: "rgba(245,241,232,0.2)" }}
      />
      <div
        className="absolute font-mono text-paper"
        style={{
          left: 16,
          top: 16,
          fontSize: 10,
          opacity: 0.7,
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </div>
      <div
        className="absolute font-serif text-paper"
        style={{
          left: 16,
          right: 16,
          bottom: 16,
          fontSize: 15,
          lineHeight: 1.3,
          letterSpacing: "-0.015em",
          fontVariationSettings: "'opsz' 18",
          maxWidth: "88%",
          textShadow: "0 1px 12px rgba(0,0,0,0.35)",
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
      className="border-b border-t border-line bg-surface px-5 py-14 md:px-8 md:py-20"
    >
      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        <div className="mb-10 max-w-[780px] md:mb-12">
          <Eyebrow className="mb-[10px]">Use Cases</Eyebrow>
          <h2
            className="font-serif text-[32px] leading-[1.1] md:text-[44px] md:leading-[1.08]"
            style={{
              letterSpacing: "-0.028em",
              fontWeight: 400,
              color: "#0E1410",
              margin: 0,
              fontVariationSettings: "'opsz' 72",
              textWrap: "balance",
            }}
          >
            Built for the places where a screen is part of the room,{" "}
            <em style={{ fontStyle: "italic", color: "#3B5A41" }}>
              not the reason for it.
            </em>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => {
            const num = String(i + 1).padStart(2, "0");
            return (
              <article
                key={c.tag}
                className="flex flex-col overflow-hidden rounded-[4px] border border-line"
                style={{ background: "#FBF8F0" }}
              >
                <SceneFrame {...c.scene} />

                <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
                  <div
                    className="flex items-center gap-[10px]"
                    style={{ fontFamily: "var(--font-geist), sans-serif" }}
                  >
                    <span
                      className="font-mono text-muted-2"
                      style={{ fontSize: 11, letterSpacing: "0.12em" }}
                    >
                      {num}
                    </span>
                    <span
                      aria-hidden
                      style={{
                        width: 14,
                        height: 1,
                        background: "var(--line)",
                      }}
                    />
                    <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-moss">
                      {c.tag}
                    </span>
                  </div>

                  <h3
                    className="font-serif text-[22px] leading-[1.2]"
                    style={{
                      letterSpacing: "-0.02em",
                      fontWeight: 500,
                      color: "#0E1410",
                      margin: 0,
                      fontVariationSettings: "'opsz' 48",
                      textWrap: "balance",
                    }}
                  >
                    {c.title}
                  </h3>

                  <p
                    className="text-muted"
                    style={{
                      fontSize: 14,
                      lineHeight: 1.55,
                      letterSpacing: "-0.005em",
                      margin: 0,
                      textWrap: "pretty",
                    }}
                  >
                    {c.body}
                  </p>

                  <ul className="m-0 flex list-none flex-col gap-[8px] p-0">
                    {c.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-[10px] text-[13px] tracking-[-0.005em] text-ink"
                        style={{ textWrap: "pretty", lineHeight: 1.45 }}
                      >
                        <Icon
                          name="check"
                          size={14}
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

                  <div
                    className="mt-auto flex items-baseline gap-[8px] border-t border-line pt-4"
                  >
                    <div
                      className="font-serif"
                      style={{
                        fontSize: 22,
                        fontWeight: 500,
                        color: "#3B5A41",
                        letterSpacing: "-0.022em",
                        fontVariationSettings: "'opsz' 48",
                        lineHeight: 1,
                      }}
                    >
                      {c.stat}
                    </div>
                    <div className="text-[12px] tracking-[-0.005em] text-muted">
                      {c.sub}
                    </div>
                  </div>

                  <figure
                    className="m-0 flex items-start gap-[10px] rounded-[2px] border-l"
                    style={{
                      borderColor: "#3B5A41",
                      padding: "4px 0 4px 12px",
                    }}
                  >
                    <div className="flex-1">
                      <blockquote
                        className="m-0 font-serif italic"
                        style={{
                          fontSize: 13.5,
                          lineHeight: 1.45,
                          letterSpacing: "-0.008em",
                          color: "#0E1410",
                          textWrap: "pretty",
                          fontVariationSettings: "'opsz' 18",
                        }}
                      >
                        &ldquo;{c.quote}&rdquo;
                      </blockquote>
                      <figcaption
                        className="mt-[6px] text-[11.5px] tracking-[-0.005em] text-muted"
                      >
                        <span className="text-ink" style={{ fontWeight: 500 }}>
                          {c.by}
                        </span>
                        <span> · {c.byRole}</span>
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
