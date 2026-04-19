import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  decryptDriveTokens,
  decryptDropboxTokens,
  decryptToken,
  encryptDriveTokens,
  encryptDropboxTokens,
  encryptToken,
  isEncrypted,
} from "./token-crypto";

const TEST_KEY_32B = "0123456789abcdef0123456789abcdef";

describe("token-crypto", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.TOKEN_ENCRYPTION_KEY = TEST_KEY_32B;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("round-trips a short token", () => {
    const ct = encryptToken("secret");
    expect(ct).not.toContain("secret");
    expect(isEncrypted(ct)).toBe(true);
    expect(decryptToken(ct)).toBe("secret");
  });

  it("round-trips a long token (refresh token size)", () => {
    const plaintext = "a".repeat(4000);
    expect(decryptToken(encryptToken(plaintext))).toBe(plaintext);
  });

  it("produces different ciphertexts for the same plaintext (IV randomness)", () => {
    const a = encryptToken("same");
    const b = encryptToken("same");
    expect(a).not.toBe(b);
  });

  it("rejects tampered ciphertext", () => {
    const ct = encryptToken("secret");
    const parts = ct.split(".");
    parts[3] = Buffer.from("tampered").toString("base64");
    expect(() => decryptToken(parts.join("."))).toThrow();
  });

  it("rejects wrong-version payloads", () => {
    expect(() => decryptToken("v0.aaa.bbb.ccc")).toThrow(/format/);
  });

  it("throws when TOKEN_ENCRYPTION_KEY is missing", () => {
    delete process.env.TOKEN_ENCRYPTION_KEY;
    expect(() => encryptToken("x")).toThrow(/missing/);
  });

  it("envelope helpers preserve non-secret metadata", () => {
    const drive = {
      access_token: "at-xyz",
      refresh_token: "rt-abc",
      scope: "https://www.googleapis.com/auth/drive.readonly",
      token_type: "Bearer",
      expiry_date: 123456789,
    };
    const enc = encryptDriveTokens(drive);
    expect(enc.scope).toBe(drive.scope);
    expect(enc.token_type).toBe("Bearer");
    expect(enc.expiry_date).toBe(123456789);
    expect(enc.access_token).not.toBe(drive.access_token);
    const dec = decryptDriveTokens(enc);
    expect(dec.access_token).toBe("at-xyz");
    expect(dec.refresh_token).toBe("rt-abc");
  });

  it("drive decryption passes through plaintext for backward compat", () => {
    // Simulates an existing doc with plaintext tokens written before
    // this module shipped.
    const legacy = { access_token: "legacy-at", refresh_token: "legacy-rt" };
    const dec = decryptDriveTokens(legacy);
    expect(dec.access_token).toBe("legacy-at");
    expect(dec.refresh_token).toBe("legacy-rt");
  });

  it("dropbox envelope handles null refresh token", () => {
    const enc = encryptDropboxTokens({
      access_token: "at",
      refresh_token: null,
    });
    expect(enc.refresh_token).toBeNull();
    const dec = decryptDropboxTokens(enc);
    expect(dec.access_token).toBe("at");
    expect(dec.refresh_token).toBeNull();
  });
});
