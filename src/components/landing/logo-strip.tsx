const logos = [
  { name: "Lakeside Hall", family: "var(--font-newsreader), serif", weight: 500, italic: false },
  { name: "ATRIUM / NORTH", family: "var(--font-geist), sans-serif", weight: 500, track: "0.18em" },
  { name: "Fieldhouse", family: "var(--font-newsreader), serif", weight: 400, italic: true },
  { name: "KASTNER+CO", family: "var(--font-geist), sans-serif", weight: 600, track: "0.02em" },
  { name: "The Fairmont", family: "var(--font-newsreader), serif", weight: 500, italic: false },
  { name: "Design Week", family: "var(--font-geist), sans-serif", weight: 500, track: "-0.01em" },
];

export function LogoStrip() {
  return (
    <section className="border-b border-t border-line px-5 py-12 md:px-8">
      <div className="mx-auto flex flex-col gap-8" style={{ maxWidth: 1120 }}>
        <p className="text-eyebrow text-muted-2 text-center">
          Running in galleries, lobbies, and venues everywhere
        </p>
        <div className="flex flex-wrap items-baseline justify-center gap-x-10 gap-y-6 md:justify-between">
          {logos.map((l) => (
            <span
              key={l.name}
              className="text-ink transition-opacity duration-quiet hover:opacity-100"
              style={{
                fontFamily: l.family,
                fontWeight: l.weight,
                fontSize: 17,
                opacity: 0.48,
                letterSpacing: l.track ?? "-0.01em",
                fontStyle: l.italic ? "italic" : "normal",
                fontVariationSettings: l.family.includes("newsreader")
                  ? "'opsz' 48"
                  : undefined,
              }}
            >
              {l.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
