import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { extractIp, stepWindow } from "./rate-limit";

describe("stepWindow", () => {
  const rule = { limit: 3, windowMs: 1000 };

  it("allows the first request in a fresh window", () => {
    const { next, result } = stepWindow(1000, undefined, rule);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(next.count).toBe(1);
    expect(next.windowStart).toBe(1000);
  });

  it("increments count within the same window", () => {
    let prior = { windowStart: 1000, count: 1 };
    for (let i = 2; i <= 3; i++) {
      const step = stepWindow(1000 + i * 10, prior, rule);
      expect(step.result.allowed).toBe(true);
      expect(step.next.count).toBe(i);
      prior = step.next;
    }
  });

  it("denies the (limit+1)-th request inside the window", () => {
    const prior = { windowStart: 1000, count: 3 };
    const { result, next } = stepWindow(1100, prior, rule);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    // On denial we don't increment the stored count past the cap.
    expect(next.count).toBe(3);
  });

  it("opens a new window once the prior window has elapsed", () => {
    const prior = { windowStart: 1000, count: 3 };
    const { result, next } = stepWindow(2000, prior, rule);
    expect(result.allowed).toBe(true);
    expect(next.windowStart).toBe(2000);
    expect(next.count).toBe(1);
  });

  it("retryAfterMs is bounded by window length", () => {
    const prior = { windowStart: 1000, count: 3 };
    const { result } = stepWindow(1100, prior, rule);
    expect(result.retryAfterMs).toBeLessThanOrEqual(1000);
    expect(result.retryAfterMs).toBe(900);
  });
});

describe("extractIp", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.VERCEL;
    delete process.env.TRUST_FORWARDED_FOR;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns 'untrusted' when XFF is not trusted", () => {
    // No env gate set — don't trust the header.
    expect(extractIp((n) => (n === "x-forwarded-for" ? "1.2.3.4" : null))).toBe(
      "untrusted",
    );
  });

  it("reads XFF when VERCEL=1", () => {
    process.env.VERCEL = "1";
    expect(extractIp((n) => (n === "x-forwarded-for" ? "1.2.3.4" : null))).toBe(
      "1.2.3.4",
    );
  });

  it("takes the first address from an XFF chain", () => {
    process.env.VERCEL = "1";
    expect(
      extractIp((n) => (n === "x-forwarded-for" ? "1.2.3.4, 10.0.0.1" : null)),
    ).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when XFF is absent", () => {
    process.env.VERCEL = "1";
    expect(extractIp((n) => (n === "x-real-ip" ? "5.6.7.8" : null))).toBe(
      "5.6.7.8",
    );
  });

  it("honors TRUST_FORWARDED_FOR=1 as a non-Vercel opt-in", () => {
    process.env.TRUST_FORWARDED_FOR = "1";
    expect(extractIp((n) => (n === "x-forwarded-for" ? "9.9.9.9" : null))).toBe(
      "9.9.9.9",
    );
  });
});
