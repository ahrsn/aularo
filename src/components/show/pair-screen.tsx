import { Wordmark } from "@/components/ui/wordmark";

/**
 * Full-bleed pair screen shown on the kiosk display until claimed.
 * The code is split by a middle dot for readability.
 */
export function PairScreen({
  code,
  expiresInSec,
  screenId,
}: {
  code: string;
  expiresInSec: number;
  screenId: string;
}) {
  const mm = Math.floor(expiresInSec / 60);
  const ss = String(expiresInSec % 60).padStart(2, "0");
  const firstHalf = code.slice(0, Math.ceil(code.length / 2));
  const secondHalf = code.slice(Math.ceil(code.length / 2));

  return (
    <div
      className="relative h-screen w-screen overflow-hidden text-ink"
      style={{ background: "#F5F1E8" }}
    >
      <div className="absolute" style={{ top: 36, left: 40 }}>
        <Wordmark size={22} color="#0E1410" />
      </div>

      <div
        className="absolute flex items-center gap-[10px] text-[13px] tracking-[-0.005em] text-muted"
        style={{ top: 36, right: 40 }}
      >
        <span
          className="inline-block rounded-full"
          style={{
            width: 8,
            height: 8,
            background: "#22C55E",
            boxShadow: "0 0 0 3px rgba(34,197,94,0.18)",
          }}
        />
        Online · Waiting to pair
      </div>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ padding: "0 40px" }}
      >
        <div
          className="font-sans text-[13px] uppercase tracking-[0.14em] text-muted"
          style={{ marginBottom: 28, fontWeight: 500 }}
        >
          This screen is ready
        </div>

        <div
          className="font-serif"
          style={{
            fontSize: 28,
            fontWeight: 400,
            letterSpacing: "-0.018em",
            color: "#3A433B",
            marginBottom: 22,
            fontVariationSettings: "'opsz' 48",
          }}
        >
          Sign in at{" "}
          <span
            className="font-mono text-ink"
            style={{
              fontSize: 24,
              letterSpacing: "0.02em",
              padding: "3px 10px",
              background: "rgba(25,35,26,0.06)",
              borderRadius: 4,
            }}
          >
            clarra.show/app
          </span>{" "}
          on your laptop
        </div>

        <div
          className="font-serif text-muted"
          style={{
            fontSize: 20,
            fontWeight: 400,
            letterSpacing: "-0.015em",
            marginBottom: 56,
            fontVariationSettings: "'opsz' 48",
          }}
        >
          and enter this code.
        </div>

        <div className="flex items-center gap-5">
          <div
            className="font-mono"
            style={{
              fontSize: 168,
              fontWeight: 400,
              letterSpacing: "0.01em",
              lineHeight: 0.95,
            }}
          >
            {firstHalf}
          </div>
          <div
            className="rounded-[2px]"
            style={{ width: 18, height: 3, background: "#D4CFC0" }}
          />
          <div
            className="font-mono"
            style={{
              fontSize: 168,
              fontWeight: 400,
              letterSpacing: "0.01em",
              lineHeight: 0.95,
            }}
          >
            {secondHalf}
          </div>
        </div>

        <div
          className="text-[13px] tracking-[-0.005em] text-muted-2"
          style={{ marginTop: 64 }}
        >
          Code expires in {mm}:{ss} · This screen will refresh on pair
        </div>
      </div>

      <div
        className="absolute font-mono uppercase text-muted-2"
        style={{
          bottom: 36,
          left: 40,
          fontSize: 11,
          letterSpacing: "0.06em",
        }}
      >
        Screen ID · {screenId.slice(0, 12).toUpperCase()}
      </div>
    </div>
  );
}
