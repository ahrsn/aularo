import { describe, expect, it } from "vitest";
import {
  SlideSchema,
  SlideshowSchema,
  DisplaySchema,
  WorkspaceSchema,
  WorkspacePlanSchema,
  ShortCodeSchema,
  WorkspaceSlugSchema,
} from "./schema";

describe("WorkspacePlanSchema", () => {
  it("accepts the three known plans", () => {
    expect(WorkspacePlanSchema.parse("free")).toBe("free");
    expect(WorkspacePlanSchema.parse("studio")).toBe("studio");
    expect(WorkspacePlanSchema.parse("venue")).toBe("venue");
  });

  it("rejects attacker-tampered plan strings", () => {
    // This is the exact attack surface the webhook's price-based lookup
    // exists to defend: metadata carrying unknown plan values.
    expect(WorkspacePlanSchema.safeParse("enterprise").success).toBe(false);
    expect(WorkspacePlanSchema.safeParse("venue_unlimited").success).toBe(false);
    expect(WorkspacePlanSchema.safeParse("").success).toBe(false);
    expect(WorkspacePlanSchema.safeParse(undefined).success).toBe(false);
    expect(WorkspacePlanSchema.safeParse(null).success).toBe(false);
  });
});

describe("ShortCodeSchema", () => {
  it("accepts 4-12 uppercase alnum", () => {
    expect(ShortCodeSchema.safeParse("AB12").success).toBe(true);
    expect(ShortCodeSchema.safeParse("ABCDEFGH1234").success).toBe(true);
  });

  it("rejects lowercase, symbols, too short, too long", () => {
    expect(ShortCodeSchema.safeParse("ab12").success).toBe(false);
    expect(ShortCodeSchema.safeParse("ABC").success).toBe(false);
    expect(ShortCodeSchema.safeParse("ABCDEFGH12345").success).toBe(false);
    expect(ShortCodeSchema.safeParse("AB-12").success).toBe(false);
  });
});

describe("WorkspaceSlugSchema", () => {
  it("accepts lowercase-kebab", () => {
    expect(WorkspaceSlugSchema.safeParse("chaos-digital").success).toBe(true);
    expect(WorkspaceSlugSchema.safeParse("abc").success).toBe(true);
  });

  it("rejects uppercase, dots, underscores, too short", () => {
    expect(WorkspaceSlugSchema.safeParse("Chaos").success).toBe(false);
    expect(WorkspaceSlugSchema.safeParse("chaos_digital").success).toBe(false);
    expect(WorkspaceSlugSchema.safeParse("ab").success).toBe(false);
    expect(WorkspaceSlugSchema.safeParse("chaos.digital").success).toBe(false);
  });
});

describe("SlideSchema", () => {
  it("round-trips a minimal slide", () => {
    const input = { id: "s1", kind: "quote" };
    const parsed = SlideSchema.parse(input);
    expect(parsed.id).toBe("s1");
    expect(parsed.kind).toBe("quote");
    expect(parsed.data).toEqual({});
  });

  it("preserves kind-specific data payloads", () => {
    const parsed = SlideSchema.parse({
      id: "s1",
      kind: "photo",
      data: { caption: "x", imageUrl: "https://r2/x.jpg" },
    });
    expect(parsed.data.caption).toBe("x");
  });

  it("enforces the durationMs range", () => {
    expect(SlideSchema.safeParse({ id: "s", kind: "quote", durationMs: 500 }).success).toBe(false);
    expect(SlideSchema.safeParse({ id: "s", kind: "quote", durationMs: 121_000 }).success).toBe(false);
    expect(SlideSchema.safeParse({ id: "s", kind: "quote", durationMs: 5000 }).success).toBe(true);
  });
});

describe("SlideshowSchema round-trip", () => {
  it("is idempotent under double-parse", () => {
    const a = SlideshowSchema.parse({
      id: "sh1",
      name: "Opening",
      slides: [{ id: "s1", kind: "quote" }],
    });
    const b = SlideshowSchema.parse(a);
    expect(b).toEqual(a);
  });

  it("defaults publicSlug and submissionSlug to null", () => {
    const a = SlideshowSchema.parse({ id: "sh1", name: "x" });
    expect(a.publicSlug).toBeNull();
    expect(a.submissionSlug).toBeNull();
  });
});

describe("DisplaySchema", () => {
  it("defaults status to offline", () => {
    const d = DisplaySchema.parse({ id: "d", name: "Kiosk" });
    expect(d.status).toBe("offline");
  });

  it("rejects unknown display statuses", () => {
    const r = DisplaySchema.safeParse({
      id: "d",
      name: "Kiosk",
      status: "ready",
    });
    expect(r.success).toBe(false);
  });
});

describe("WorkspaceSchema", () => {
  it("defaults plan to free and displayLimit to 1", () => {
    const w = WorkspaceSchema.parse({
      id: "ws1",
      name: "Chaos",
      ownerUid: "uid1",
    });
    expect(w.plan).toBe("free");
    expect(w.displayLimit).toBe(1);
  });

  it("rejects negative displayLimit", () => {
    expect(
      WorkspaceSchema.safeParse({
        id: "ws1",
        name: "Chaos",
        ownerUid: "uid1",
        displayLimit: -1,
      }).success,
    ).toBe(false);
  });
});
