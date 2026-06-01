import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Edition behavior of the entitlement seam. `EDITION` is read at module-eval
 * time from NEXT_PUBLIC_EDITION, so each case sets the env and re-imports
 * plan.ts with a fresh module registry. Vitest isolates test files, so this
 * does not affect the cloud-default assertions in plan.test.ts.
 */
describe("plan.ts — community edition", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_EDITION = "community";
  });
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_EDITION;
    vi.resetModules();
  });

  it("grants every capability regardless of plan", async () => {
    const { can } = await import("./plan");
    expect(can("free", "automations")).toBe(true);
    expect(can("free", "team")).toBe(true);
    expect(can("free", "no_watermark")).toBe(true);
  });

  it("never throws from feature or limit gates", async () => {
    const { assertCan, assertSlideshowLimit, assertStorageRoom } =
      await import("./plan");
    expect(() => assertCan("free", "scheduling")).not.toThrow();
    expect(() => assertSlideshowLimit("free", 100_000)).not.toThrow();
    expect(() =>
      assertStorageRoom("free", Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
    ).not.toThrow();
  });

  it("lifts the display limit", async () => {
    const { displayLimitFor } = await import("./plan");
    expect(displayLimitFor("free")).toBe(9999);
  });
});

describe("plan.ts — cloud edition", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_EDITION = "cloud";
  });
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_EDITION;
    vi.resetModules();
  });

  it("still enforces tier gates", async () => {
    const { can, assertCan, assertSlideshowLimit } = await import("./plan");
    expect(can("free", "automations")).toBe(false);
    expect(() => assertCan("free", "team")).toThrow(/venue plan/);
    expect(() => assertSlideshowLimit("free", 3)).toThrow();
  });
});
