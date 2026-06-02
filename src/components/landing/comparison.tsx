import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/label";
import { SITE_NAME } from "@/lib/site";

type Cell = "yes" | "no" | "partial" | string;

const cols = [
  { key: "aularo", name: SITE_NAME, sub: "what you want" },
  { key: "usb", name: "USB + YouTube", sub: "what most venues use" },
  { key: "screencloud", name: "ScreenCloud", sub: "built for retail" },
  { key: "yodeck", name: "Yodeck", sub: "Raspberry Pi boxes" },
];

const rows: Array<{
  label: string;
  note?: string;
  cells: Record<string, Cell>;
}> = [
  {
    label: "Runs on Any Browser",
    note: "No dongles, no boxes, no installs",
    cells: { aularo: "yes", usb: "no", screencloud: "no", yodeck: "no" },
  },
  {
    label: "One Edit Updates Every Screen",
    note: "Under 15 seconds",
    cells: { aularo: "yes", usb: "no", screencloud: "partial", yodeck: "partial" },
  },
  {
    label: "Schedule Across Multiple Events",
    note: "Not just day-parts",
    cells: { aularo: "yes", usb: "no", screencloud: "no", yodeck: "no" },
  },
  {
    label: "Keeps Playing if the Internet Drops",
    cells: { aularo: "yes", usb: "yes", screencloud: "partial", yodeck: "yes" },
  },
  {
    label: "SOC 2, SSO, Audit Log",
    note: "Included, not an upsell",
    cells: { aularo: "yes", usb: "no", screencloud: "partial", yodeck: "no" },
  },
  {
    label: "Priced per Display, Not per Seat",
    cells: { aularo: "yes", usb: "yes", screencloud: "no", yodeck: "yes" },
  },
];

function CellMark({ value }: { value: Cell }) {
  if (value === "yes") {
    return (
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ background: "#3B5A41" }}
      >
        <Icon name="check" size={14} style={{ color: "#F5F1E8" }} />
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full border"
        style={{ borderColor: "var(--line)", background: "#F5F1E8" }}
      >
        <Icon name="minus" size={14} style={{ color: "#6B7268" }} />
      </div>
    );
  }
  if (value === "no") {
    return (
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full border"
        style={{ borderColor: "var(--line)", background: "transparent" }}
      >
        <Icon name="x" size={12} style={{ color: "#A9877A" }} />
      </div>
    );
  }
  return <span className="text-[13px] text-muted">{value}</span>;
}

export function Comparison() {
  return (
    <section id="comparison" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto" style={{ maxWidth: 1120 }}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-10">
          <div>
            <Eyebrow className="mb-[10px]">Compared</Eyebrow>
            <h2
              className="font-serif text-[32px] leading-[1.1] md:text-[44px] md:leading-[1.08]"
              style={{
                letterSpacing: "-0.028em",
                fontWeight: 400,
                color: "#0E1410",
                margin: 0,
                maxWidth: 680,
                fontVariationSettings: "'opsz' 72",
                textWrap: "balance",
              }}
            >
              Most signage tools were built for drive-throughs.{" "}
              <em style={{ fontStyle: "italic", color: "#3B5A41" }}>
                {SITE_NAME} was built for the room.
              </em>
            </h2>
          </div>
          <div
            className="text-[13px] text-muted"
            style={{ maxWidth: 280, textWrap: "pretty" }}
          >
            What you get out of the box, not after three add-ons and a quote.
          </div>
        </div>

        <div
          className="-mx-5 overflow-x-auto md:mx-0"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
        <div
          className="mx-5 overflow-hidden rounded-[4px] border border-line md:mx-0"
          style={{ background: "#FBF8F0", minWidth: 720 }}
        >
          <div
            className="grid items-end"
            style={{
              gridTemplateColumns: "1.4fr repeat(4, 1fr)",
              borderBottom: "1px solid var(--line)",
              padding: "22px 24px",
              background: "#F5F1E8",
            }}
          >
            <div />
            {cols.map((c) => {
              const primary = c.key === "aularo";
              return (
                <div key={c.key} className="text-center">
                  <div
                    className="font-serif"
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: primary ? "#3B5A41" : "#0E1410",
                      letterSpacing: "-0.015em",
                      fontVariationSettings: "'opsz' 48",
                      fontStyle: primary ? "italic" : "normal",
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    className="mt-[4px] text-[11.5px] tracking-[-0.005em] text-muted-2"
                    style={{ textWrap: "pretty" }}
                  >
                    {c.sub}
                  </div>
                </div>
              );
            })}
          </div>

          {rows.map((row, i) => (
            <div
              key={row.label}
              className="grid items-center"
              style={{
                gridTemplateColumns: "1.4fr repeat(4, 1fr)",
                padding: "22px 24px",
                borderBottom:
                  i < rows.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <div>
                <div
                  className="font-serif"
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    color: "#0E1410",
                    letterSpacing: "-0.014em",
                    fontVariationSettings: "'opsz' 48",
                  }}
                >
                  {row.label}
                </div>
                {row.note && (
                  <div
                    className="mt-[4px] text-[12.5px] text-muted"
                    style={{
                      letterSpacing: "-0.005em",
                      textWrap: "pretty",
                    }}
                  >
                    {row.note}
                  </div>
                )}
              </div>
              {cols.map((c) => (
                <div key={c.key} className="flex justify-center">
                  <CellMark value={row.cells[c.key]} />
                </div>
              ))}
            </div>
          ))}
        </div>
        </div>

        <div
          className="mt-3 px-5 text-center text-[12px] text-muted-2 md:mt-4 md:px-0"
          style={{ letterSpacing: "-0.005em" }}
        >
          <span className="md:hidden">Swipe to compare. </span>
          Based on public docs as of April 2026. Venues differ. Trials are
          free.
        </div>
      </div>
    </section>
  );
}
