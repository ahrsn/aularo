import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  process.env.NEXT_PUBLIC_EDITION = "cloud";
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_EDITION;
  vi.resetModules();
});

describe("can / assertCan", () => {
  it("free has no capabilities", async () => {
    const { can } = await import("./plan");
    expect(can("free", "preview_links")).toBe(false);
    expect(can("free", "drive_sync")).toBe(false);
    expect(can("free", "team")).toBe(false);
  });

  it("studio unlocks preview and cloud sync but not team features", async () => {
    const { can } = await import("./plan");
    expect(can("studio", "preview_links")).toBe(true);
    expect(can("studio", "drive_sync")).toBe(true);
    expect(can("studio", "team")).toBe(false);
    expect(can("studio", "scheduling")).toBe(false);
  });

  it("venue unlocks everything", async () => {
    const { can } = await import("./plan");
    expect(can("venue", "preview_links")).toBe(true);
    expect(can("venue", "team")).toBe(true);
    expect(can("venue", "scheduling")).toBe(true);
    expect(can("venue", "insights")).toBe(true);
  });

  it("assertCan throws PLAN_REQUIRED with the minimum plan", async () => {
    const { PlanError, assertCan } = await import("./plan");
    try {
      assertCan("free", "team");
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(PlanError);
      const pe = e as PlanError;
      expect(pe.code).toBe("PLAN_REQUIRED");
      expect(pe.required).toBe("venue");
    }
  });
});

describe("displayLimitFor", () => {
  it("matches PLAN_LIMITS for free and studio", async () => {
    const { PLAN_LIMITS, displayLimitFor } = await import("./plan");
    expect(displayLimitFor("free")).toBe(PLAN_LIMITS.free.displays);
    expect(displayLimitFor("studio")).toBe(PLAN_LIMITS.studio.displays);
  });

  it("returns a finite sentinel for venue (Infinity is not storable)", async () => {
    const { displayLimitFor } = await import("./plan");
    const v = displayLimitFor("venue");
    expect(Number.isFinite(v)).toBe(true);
    expect(v).toBeGreaterThan(1000);
  });
});

describe("assertSlideshowLimit", () => {
  it("allows up to the limit minus one", async () => {
    const { assertSlideshowLimit } = await import("./plan");
    expect(() => assertSlideshowLimit("free", 2)).not.toThrow();
  });

  it("throws PLAN_LIMIT at the limit", async () => {
    const { PlanError, assertSlideshowLimit } = await import("./plan");
    expect(() => assertSlideshowLimit("free", 3)).toThrow(PlanError);
  });
});

describe("assertStorageRoom", () => {
  it("allows writes that fit within the cap", async () => {
    const { assertStorageRoom } = await import("./plan");
    expect(() => assertStorageRoom("free", 0, 1024)).not.toThrow();
  });

  it("throws STORAGE_LIMIT when the incoming write would exceed the cap", async () => {
    const { PLAN_LIMITS, PlanError, assertStorageRoom } = await import("./plan");
    const cap = PLAN_LIMITS.free.storageBytes;
    expect(() => assertStorageRoom("free", cap, 1)).toThrow(PlanError);
  });
});
