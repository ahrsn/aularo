import { describe, expect, it } from "vitest";
import {
  PLAN_LIMITS,
  PlanError,
  assertCan,
  assertSlideshowLimit,
  assertStorageRoom,
  can,
  displayLimitFor,
} from "./plan";

describe("can / assertCan", () => {
  it("free has no capabilities", () => {
    expect(can("free", "preview_links")).toBe(false);
    expect(can("free", "drive_sync")).toBe(false);
    expect(can("free", "team")).toBe(false);
  });

  it("studio unlocks preview and cloud sync but not team features", () => {
    expect(can("studio", "preview_links")).toBe(true);
    expect(can("studio", "drive_sync")).toBe(true);
    expect(can("studio", "team")).toBe(false);
    expect(can("studio", "scheduling")).toBe(false);
  });

  it("venue unlocks everything", () => {
    expect(can("venue", "preview_links")).toBe(true);
    expect(can("venue", "team")).toBe(true);
    expect(can("venue", "scheduling")).toBe(true);
    expect(can("venue", "insights")).toBe(true);
  });

  it("assertCan throws PLAN_REQUIRED with the minimum plan", () => {
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
  it("matches PLAN_LIMITS for free and studio", () => {
    expect(displayLimitFor("free")).toBe(PLAN_LIMITS.free.displays);
    expect(displayLimitFor("studio")).toBe(PLAN_LIMITS.studio.displays);
  });

  it("returns a finite sentinel for venue (Infinity is not storable)", () => {
    const v = displayLimitFor("venue");
    expect(Number.isFinite(v)).toBe(true);
    expect(v).toBeGreaterThan(1000);
  });
});

describe("assertSlideshowLimit", () => {
  it("allows up to the limit minus one", () => {
    expect(() => assertSlideshowLimit("free", 2)).not.toThrow();
  });

  it("throws PLAN_LIMIT at the limit", () => {
    expect(() => assertSlideshowLimit("free", 3)).toThrow(PlanError);
  });
});

describe("assertStorageRoom", () => {
  it("allows writes that fit within the cap", () => {
    expect(() => assertStorageRoom("free", 0, 1024)).not.toThrow();
  });

  it("throws STORAGE_LIMIT when the incoming write would exceed the cap", () => {
    const cap = PLAN_LIMITS.free.storageBytes;
    expect(() => assertStorageRoom("free", cap, 1)).toThrow(PlanError);
  });
});
