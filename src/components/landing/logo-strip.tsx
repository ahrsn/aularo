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
    <section className="border-b border-t border-line px-5 py-10 md:px-8">
      <div
        className="mx-auto flex flex-col gap-6"
        style={{ maxWidth: 1120 }}
      >
        <div className="text-label text-center">
          Running in galleries, lobbies, and venues everywhere
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:justify-between">
          {logos.map((l) => (
            <div
              key={l.name}
              className="text-ink"
              style={{
                fontFamily: l.family,
                fontWeight: l.weight,
                fontSize: 18,
                opacity: 0.72,
                letterSpacing: l.track ?? "-0.01em",
                fontStyle: l.italic ? "italic" : "normal",
                fontVariationSettings: l.family.includes("newsreader")
                  ? "'opsz' 48"
                  : undefined,
              }}
            >
              {l.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
