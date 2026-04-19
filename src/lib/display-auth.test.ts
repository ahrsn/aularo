import { describe, expect, it } from "vitest";
import {
  newDisplayAuthSecret,
  signHeartbeat,
  verifyHeartbeat,
} from "./display-auth";

describe("display-auth", () => {
  const secret = newDisplayAuthSecret();
  const ws = "ws1";
  const disp = "d1";

  it("generates a 64-hex-char secret (32 random bytes)", () => {
    const a = newDisplayAuthSecret();
    const b = newDisplayAuthSecret();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
  });

  it("verify accepts a correctly signed heartbeat", () => {
    const ts = Date.now();
    const sig = signHeartbeat(secret, ws, disp, ts);
    expect(verifyHeartbeat({ secret, workspaceId: ws, displayId: disp, ts, sig })).toBe(true);
  });

  it("verify rejects a tampered signature", () => {
    const ts = Date.now();
    const good = signHeartbeat(secret, ws, disp, ts);
    const tampered = good.slice(0, -2) + (good.endsWith("ff") ? "00" : "ff");
    expect(
      verifyHeartbeat({ secret, workspaceId: ws, displayId: disp, ts, sig: tampered }),
    ).toBe(false);
  });

  it("verify rejects a mismatched displayId", () => {
    const ts = Date.now();
    const sig = signHeartbeat(secret, ws, disp, ts);
    expect(
      verifyHeartbeat({ secret, workspaceId: ws, displayId: "d2", ts, sig }),
    ).toBe(false);
  });

  it("verify rejects a mismatched workspaceId", () => {
    const ts = Date.now();
    const sig = signHeartbeat(secret, ws, disp, ts);
    expect(
      verifyHeartbeat({ secret, workspaceId: "ws2", displayId: disp, ts, sig }),
    ).toBe(false);
  });

  it("verify rejects timestamps outside the ±5 min window", () => {
    const now = 1_000_000_000_000;
    const staleTs = now - 6 * 60_000;
    const sig = signHeartbeat(secret, ws, disp, staleTs);
    expect(
      verifyHeartbeat({
        secret,
        workspaceId: ws,
        displayId: disp,
        ts: staleTs,
        sig,
        nowMs: now,
      }),
    ).toBe(false);
  });

  it("verify rejects the same sig replayed with a future ts", () => {
    const now = 1_000_000_000_000;
    const ts = now;
    const sig = signHeartbeat(secret, ws, disp, ts);
    // Attacker replays the captured sig with a shifted timestamp — binding
    // through the signed payload means the shifted ts won't verify.
    expect(
      verifyHeartbeat({
        secret,
        workspaceId: ws,
        displayId: disp,
        ts: ts + 1000,
        sig,
        nowMs: now,
      }),
    ).toBe(false);
  });

  it("verify rejects malformed hex signatures without throwing", () => {
    const ts = Date.now();
    expect(() =>
      verifyHeartbeat({
        secret,
        workspaceId: ws,
        displayId: disp,
        ts,
        sig: "not-hex",
      }),
    ).not.toThrow();
  });
});
