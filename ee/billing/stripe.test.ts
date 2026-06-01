import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { planFromPriceId } from "./stripe";

describe("planFromPriceId", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.STRIPE_PRICE_STUDIO;
    delete process.env.STRIPE_PRICE_VENUE;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws when both price env vars are unset", () => {
    expect(() => planFromPriceId("price_123")).toThrow(/both unset/);
  });

  it("returns studio for a matching studio price id", () => {
    process.env.STRIPE_PRICE_STUDIO = "price_studio";
    expect(planFromPriceId("price_studio")).toBe("studio");
  });

  it("returns venue for a matching venue price id", () => {
    process.env.STRIPE_PRICE_VENUE = "price_venue";
    expect(planFromPriceId("price_venue")).toBe("venue");
  });

  it("returns null for an unknown price id when at least one env is set", () => {
    process.env.STRIPE_PRICE_STUDIO = "price_studio";
    expect(planFromPriceId("price_unknown")).toBeNull();
  });

  it("returns null for null/undefined price id when at least one env is set", () => {
    process.env.STRIPE_PRICE_STUDIO = "price_studio";
    expect(planFromPriceId(null)).toBeNull();
    expect(planFromPriceId(undefined)).toBeNull();
  });

  it("returns null for empty string even when env is set", () => {
    process.env.STRIPE_PRICE_STUDIO = "price_studio";
    expect(planFromPriceId("")).toBeNull();
  });

  it("does not match empty env values as a wildcard", () => {
    // Only STUDIO set to empty string — simulates STRIPE_PRICE_STUDIO="" in .env.
    // Because "" is falsy, PRICE_IDS.studio() returns null, so an attacker
    // sending priceId:"" must NOT match.
    process.env.STRIPE_PRICE_STUDIO = "";
    process.env.STRIPE_PRICE_VENUE = "price_venue";
    expect(planFromPriceId("")).toBeNull();
  });
});
