import { Icon } from "@/components/ui/icon";
import { Wordmark } from "@/components/ui/wordmark";
import { DASHBOARD_DISPLAY_URL } from "@/lib/site";

/**
 * Miniature dashboard still used inside the hero. Every pixel intentional —
 * do not refactor into real components; it should read as a frozen screenshot.
 */
export function ProductStill() {
  const nav = [
    { icon: "images", label: "Slideshows", sel: true },
    { icon: "monitor", label: "Displays" },
    { icon: "calendar-blank", label: "Schedule" },
    { icon: "folder-simple", label: "Media" },
    { icon: "chart-line", label: "Insights" },
  ];

  const events = [
    { name: "Design Week '26", meta: "Oct 21 — 26", sel: true },
    { name: "Vendor Summit", meta: "Nov 12 — 14" },
    { name: "Winter Gala", meta: "Dec 18" },
  ];

  const playingNow = [
    {
      label: "Reception",
      room: "Atrium, Lakeside Hall",
      bg: "linear-gradient(135deg,#2A3A2C 0%,#19231A 70%)",
      fg: "#F5F1E8",
    },
    {
      label: "Gala",
      room: "Grand Ballroom",
      bg: "linear-gradient(135deg,#3B5A41 0%,#19231A 80%)",
      fg: "#F5F1E8",
    },
    {
      label: "Village",
      room: "Foyer East",
      bg: "#EEE9DB",
      fg: "#19231A",
    },
    {
      label: "Check-in",
      room: "Registration desk",
      bg: "linear-gradient(135deg,#4A5A4C 0%,#2A3A2C 80%)",
      fg: "#F5F1E8",
    },
  ];

  const rows = [
    {
      title: "Speaker reception — welcome loop",
      slides: "14 slides",
      display: "Atrium, Lakeside Hall",
      status: "Live",
      statusColor: "#3B5A41",
      updated: "2 min ago",
      by: "by Mira",
      thumb: "linear-gradient(135deg,#2A3A2C 0%,#19231A 70%)",
    },
    {
      title: "Friday gala — room program",
      slides: "22 slides",
      display: "Grand Ballroom",
      status: "Live",
      statusColor: "#3B5A41",
      updated: "14 min ago",
      by: "by Mira",
      thumb: "linear-gradient(135deg,#3B5A41 0%,#19231A 80%)",
    },
    {
      title: "Vendor village — rotating map",
      slides: "8 slides",
      display: "Foyer East",
      status: "Live",
      statusColor: "#3B5A41",
      updated: "1 hr ago",
      by: "by Jules",
      thumb: "#EEE9DB",
      thumbDark: false,
    },
    {
      title: "Check-in kiosk — rotating hellos",
      slides: "6 slides",
      display: "Registration desk",
      status: "Live",
      statusColor: "#3B5A41",
      updated: "3 hr ago",
      by: "by Jules",
      thumb: "linear-gradient(135deg,#4A5A4C 0%,#2A3A2C 80%)",
    },
    {
      title: "Sunday keynote — open slate",
      slides: "6 slides",
      display: "Not assigned",
      displayMuted: true,
      status: "Draft",
      statusColor: "#9AA099",
      updated: "Yesterday",
      by: "by Henrik",
      thumb: "linear-gradient(135deg,#5A4A3A 0%,#2A2318 80%)",
    },
    {
      title: "Thank-you card, end of night",
      slides: "4 slides",
      display: "Scheduled · 23:00",
      status: "Paused",
      statusColor: "#B8923A",
      updated: "2 days ago",
      by: "by Mira",
      thumb: "linear-gradient(135deg,#3B2A2C 0%,#1A1410 80%)",
    },
  ];

  return (
    <div
      className="w-full overflow-hidden rounded-[6px] border border-line bg-paper"
      style={{
        boxShadow:
          "0 24px 60px -20px rgba(25,35,26,0.22), 0 6px 14px -6px rgba(25,35,26,0.06)",
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-[6px] border-b border-line"
        style={{ height: 30, background: "#EEE9DB", padding: "0 12px" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="rounded-full"
            style={{ width: 9, height: 9, background: "#D4CFC0" }}
          />
        ))}
        <div
          className="flex-1 text-center font-mono"
          style={{
            fontSize: 10.5,
            color: "#9AA099",
            letterSpacing: "0.02em",
          }}
        >
          {DASHBOARD_DISPLAY_URL} / app / library
        </div>
      </div>

      {/* Top toolbar */}
      <div
        className="flex items-center justify-between border-b border-line"
        style={{ padding: "0 14px", height: 36 }}
      >
        <div className="flex items-center gap-[6px]" style={{ fontSize: 11 }}>
          <span className="text-muted">Lakeside Hall</span>
          <span className="text-muted-2">/</span>
          <span className="text-ink" style={{ fontWeight: 500 }}>
            Slideshows
          </span>
        </div>
        <div className="flex gap-[6px]">
          <div
            className="inline-flex items-center gap-[4px] rounded-[3px] border border-line px-2 py-[3px] text-ink"
            style={{ fontSize: 10.5 }}
          >
            <Icon name="upload" size={10} />
            Import
          </div>
          <div
            className="inline-flex items-center gap-[4px] rounded-[3px] px-2 py-[3px]"
            style={{
              fontSize: 10.5,
              background: "#19231A",
              color: "#F5F1E8",
            }}
          >
            <Icon name="plus" size={10} />
            New Slideshow
          </div>
        </div>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "152px 1fr 178px", minHeight: 440 }}
      >
        {/* Sidebar */}
        <div
          className="flex flex-col border-r border-line"
          style={{ padding: "12px 8px" }}
        >
          <div style={{ padding: "2px 8px 12px" }}>
            <Wordmark size={13} color="#0E1410" />
          </div>
          {nav.map((it) => (
            <div
              key={it.label}
              className="my-[1px] flex items-center gap-2 rounded-[3px] px-2 py-[5px]"
              style={{
                fontSize: 11,
                color: it.sel ? "#3B5A41" : "#0E1410",
                background: it.sel ? "#E8EDE6" : "transparent",
              }}
            >
              <Icon
                name={it.icon}
                size={11}
                style={{ color: it.sel ? "#3B5A41" : "#6B7268" }}
              />
              {it.label}
            </div>
          ))}
          <div className="mt-[16px] px-2">
            <div
              className="mb-[6px] uppercase text-muted-2"
              style={{ fontSize: 9, letterSpacing: "0.08em" }}
            >
              Events
            </div>
            {events.map((e) => (
              <div
                key={e.name}
                style={{
                  padding: "4px 0",
                  borderLeft: e.sel ? "2px solid #3B5A41" : "2px solid transparent",
                  paddingLeft: 6,
                  marginLeft: -8,
                }}
              >
                <div
                  className="flex items-center gap-[5px]"
                  style={{
                    fontSize: 10.5,
                    color: e.sel ? "#0E1410" : "#6B7268",
                    fontWeight: e.sel ? 500 : 400,
                  }}
                >
                  {e.sel && (
                    <span
                      className="rounded-full"
                      style={{ width: 4, height: 4, background: "#3B5A41" }}
                    />
                  )}
                  {e.name}
                </div>
                <div
                  className="text-muted-2"
                  style={{ fontSize: 9, paddingLeft: e.sel ? 9 : 0 }}
                >
                  {e.meta}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto" style={{ padding: "8px 6px 0" }}>
            <div
              className="flex items-center gap-2 border-t border-line"
              style={{ paddingTop: 10, fontSize: 10.5, color: "#6B7268" }}
            >
              <Icon name="gear" size={11} />
              Settings
            </div>
            <div
              className="mt-[8px] flex items-center gap-[6px]"
              style={{ fontSize: 10 }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  background: "#3B5A41",
                  color: "#F5F1E8",
                  fontSize: 8,
                  fontWeight: 600,
                }}
              >
                MO
              </span>
              <div>
                <div className="text-ink" style={{ fontSize: 10 }}>
                  Mira Okafor
                </div>
                <div className="text-muted-2" style={{ fontSize: 8.5 }}>
                  Lakeside Hall
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ padding: "12px 14px" }}>
          {/* Playing now card */}
          <div
            className="rounded-[4px] border border-line"
            style={{ background: "#FBF8F0", padding: "9px 10px" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[6px]">
                <span
                  className="rounded-full"
                  style={{ width: 5, height: 5, background: "#3B5A41" }}
                />
                <span
                  className="font-serif"
                  style={{ fontSize: 11.5, fontWeight: 500 }}
                >
                  Playing Now
                </span>
                <span className="text-muted-2" style={{ fontSize: 10 }}>
                  4 slideshows · 4 rooms
                </span>
              </div>
              <span
                className="text-muted"
                style={{ fontSize: 9.5, textDecoration: "underline" }}
              >
                View All Displays
              </span>
            </div>
            <div
              className="mt-[8px] grid"
              style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}
            >
              {playingNow.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center gap-[6px] rounded-[3px] border border-line bg-paper"
                  style={{ padding: 4 }}
                >
                  <div
                    className="flex items-center justify-center rounded-[2px] font-serif"
                    style={{
                      width: 36,
                      height: 22,
                      background: p.bg,
                      color: p.fg,
                      fontSize: 7.5,
                      fontVariationSettings: "'opsz' 72",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      className="truncate text-ink"
                      style={{ fontSize: 10, fontWeight: 500 }}
                    >
                      {p.label}
                    </div>
                    <div
                      className="flex items-center gap-[3px] truncate text-muted-2"
                      style={{ fontSize: 8.5 }}
                    >
                      <Icon name="monitor" size={8} />
                      {p.room}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event header */}
          <div
            className="flex items-end justify-between"
            style={{ padding: "16px 0 10px" }}
          >
            <div>
              <div
                className="uppercase text-muted-2"
                style={{ fontSize: 8.5, letterSpacing: "0.1em" }}
              >
                Event
              </div>
              <div
                className="font-serif"
                style={{
                  fontSize: 20,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                  marginTop: 2,
                }}
              >
                Design Week &rsquo;26
              </div>
              <div className="text-muted" style={{ fontSize: 9.5, marginTop: 2 }}>
                Oct 21 — 26 · day 3 of 6
              </div>
            </div>
            <div className="flex gap-[2px]">
              {["All", "Playing", "Drafts", "Paused"].map((f, i) => (
                <span
                  key={f}
                  className="rounded-[3px] px-2 py-[3px]"
                  style={{
                    fontSize: 10,
                    background: i === 0 ? "#19231A" : "transparent",
                    color: i === 0 ? "#F5F1E8" : "#0E1410",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-[3px] border border-line">
            <div
              className="grid border-b border-line uppercase text-muted-2"
              style={{
                gridTemplateColumns: "1.6fr 1fr 0.6fr 0.7fr",
                padding: "5px 8px",
                fontSize: 8.5,
                letterSpacing: "0.08em",
                background: "#FBF8F0",
              }}
            >
              <div>Slideshow</div>
              <div>Display</div>
              <div>Status</div>
              <div>Updated</div>
            </div>
            {rows.map((r, i) => (
              <div
                key={r.title}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "1.6fr 1fr 0.6fr 0.7fr",
                  padding: "6px 8px",
                  fontSize: 10,
                  borderBottom:
                    i === rows.length - 1 ? "none" : "1px solid #EEE9DB",
                }}
              >
                <div className="flex items-center gap-[8px]">
                  <div
                    className="rounded-[2px]"
                    style={{
                      width: 28,
                      height: 18,
                      background: r.thumb,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div className="truncate text-ink" style={{ fontWeight: 500 }}>
                      {r.title}
                    </div>
                    <div className="text-muted-2" style={{ fontSize: 8.5 }}>
                      {r.slides}
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center gap-[4px] truncate"
                  style={{
                    color: r.displayMuted ? "#B8B5AB" : "#6B7268",
                    fontSize: 9.5,
                  }}
                >
                  <Icon name="monitor" size={9} />
                  {r.display}
                </div>
                <div
                  className="flex items-center gap-[4px]"
                  style={{ fontSize: 9.5, color: "#0E1410" }}
                >
                  <span
                    className="rounded-full"
                    style={{ width: 5, height: 5, background: r.statusColor }}
                  />
                  {r.status}
                </div>
                <div style={{ fontSize: 9.5 }}>
                  <div className="text-ink">{r.updated}</div>
                  <div className="text-muted-2" style={{ fontSize: 8.5 }}>
                    {r.by}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div
          className="border-l border-line"
          style={{ padding: "12px 10px", background: "#FBF8F0" }}
        >
          <div
            className="uppercase text-muted-2"
            style={{ fontSize: 8.5, letterSpacing: "0.1em" }}
          >
            Your Events
          </div>
          <div className="mt-[6px] flex flex-col gap-[6px]">
            {events.map((e) => (
              <div
                key={e.name}
                className="rounded-[3px]"
                style={{
                  padding: "5px 7px",
                  background: e.sel ? "#FFFFFF" : "transparent",
                  border: e.sel ? "1px solid #EEE9DB" : "1px solid transparent",
                }}
              >
                <div
                  className="flex items-center gap-[5px]"
                  style={{
                    fontSize: 10.5,
                    fontWeight: e.sel ? 500 : 400,
                    color: e.sel ? "#0E1410" : "#6B7268",
                  }}
                >
                  {e.sel && (
                    <span
                      className="rounded-full"
                      style={{ width: 4, height: 4, background: "#3B5A41" }}
                    />
                  )}
                  {e.name}
                </div>
                <div className="text-muted-2" style={{ fontSize: 9 }}>
                  {e.meta}
                  {e.sel && " · day 3 of 6"}
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-[14px] uppercase text-muted-2"
            style={{ fontSize: 8.5, letterSpacing: "0.1em" }}
          >
            This Event
          </div>
          <div className="mt-[6px] flex flex-col gap-[5px]">
            {[
              { k: "Playing", v: "4" },
              { k: "In Draft", v: "1" },
              { k: "Paused", v: "1" },
              { k: "Avg Sync to Displays", v: "11s" },
            ].map((s) => (
              <div
                key={s.k}
                className="flex items-center justify-between"
                style={{ fontSize: 10 }}
              >
                <span className="text-muted">{s.k}</span>
                <span
                  className="font-serif text-ink"
                  style={{ fontSize: 13, letterSpacing: "-0.01em" }}
                >
                  {s.v}
                </span>
              </div>
            ))}
          </div>

          {/* Tonight's hand-off */}
          <div
            className="mt-[14px] rounded-[3px]"
            style={{
              background: "#19231A",
              color: "#F5F1E8",
              padding: "9px 10px",
            }}
          >
            <div
              className="uppercase"
              style={{
                fontSize: 8,
                letterSpacing: "0.1em",
                color: "#9AA099",
              }}
            >
              Tonight&rsquo;s Hand-Off
            </div>
            <div
              className="font-serif"
              style={{
                fontSize: 11.5,
                lineHeight: 1.3,
                marginTop: 4,
                letterSpacing: "-0.005em",
              }}
            >
              Gala program swaps in at 19:00. Thank-you card at 23:00.
            </div>
            <div
              className="mt-[8px] inline-flex items-center gap-[4px] rounded-[3px]"
              style={{
                background: "rgba(245,241,232,0.08)",
                padding: "4px 7px",
                fontSize: 9.5,
                border: "1px solid rgba(245,241,232,0.12)",
              }}
            >
              <Icon name="eye" size={9} />
              Preview Tonight
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
