import { describe, expect, it, beforeEach, afterEach } from "vitest";

import {
  createGateToken,
  isValidAccessCode,
  verifyGateToken,
} from "@/lib/investor/gate";

describe("investor gate", () => {
  const originalCode = process.env.INVESTOR_ACCESS_CODE;
  const originalSecret = process.env.INVESTOR_GATE_SECRET;

  beforeEach(() => {
    process.env.INVESTOR_ACCESS_CODE = "1750-44";
    process.env.INVESTOR_GATE_SECRET = "test-gate-secret";
  });

  afterEach(() => {
    if (originalCode === undefined) delete process.env.INVESTOR_ACCESS_CODE;
    else process.env.INVESTOR_ACCESS_CODE = originalCode;
    if (originalSecret === undefined) delete process.env.INVESTOR_GATE_SECRET;
    else process.env.INVESTOR_GATE_SECRET = originalSecret;
  });

  it("accepts the configured access code", () => {
    expect(isValidAccessCode("1750-44")).toBe(true);
    expect(isValidAccessCode(" 1750-44 ")).toBe(true);
  });

  it("rejects wrong-length and wrong-value codes", () => {
    expect(isValidAccessCode("0000-00")).toBe(false);
    expect(isValidAccessCode("1750-4")).toBe(false);
    expect(isValidAccessCode("")).toBe(false);
  });

  it("creates a verifiable gate token", () => {
    const token = createGateToken();
    expect(verifyGateToken(token)).toBe(true);
  });

  it("rejects missing or tampered tokens", () => {
    expect(verifyGateToken(undefined)).toBe(false);
    expect(verifyGateToken("")).toBe(false);
    expect(verifyGateToken("a.b.c")).toBe(false);
    const token = createGateToken();
    const parts = token.split(".");
    parts[2] = "tampered";
    expect(verifyGateToken(parts.join("."))).toBe(false);
  });

  it("invalidates tokens when the access code rotates", () => {
    const token = createGateToken();
    expect(verifyGateToken(token)).toBe(true);
    process.env.INVESTOR_ACCESS_CODE = "9999-99";
    expect(verifyGateToken(token)).toBe(false);
  });
});
