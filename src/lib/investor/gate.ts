import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const INVESTOR_GATE_COOKIE = "novalyte_investor_gate";
const GATE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function accessCode(): string {
  return process.env.INVESTOR_ACCESS_CODE?.trim() || "1750-44";
}

function gateSecret(): string {
  return (
    process.env.INVESTOR_GATE_SECRET?.trim() ||
    process.env.CONTACT_RATE_LIMIT_SECRET?.trim() ||
    "novalyte-investor-gate-dev-secret"
  );
}

function sign(value: string): string {
  return createHmac("sha256", gateSecret()).update(value).digest("base64url");
}

/** Constant-time compare of the submitted code against the configured code. */
export function isValidAccessCode(submitted: string): boolean {
  const expected = accessCode();
  const a = Buffer.from(submitted.trim());
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Token embeds the code hash so rotating INVESTOR_ACCESS_CODE invalidates old cookies. */
export function createGateToken(): string {
  const body = `gate.${sign(accessCode())}`;
  return `${body}.${sign(body)}`;
}

export function verifyGateToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const body = `${parts[0]}.${parts[1]}`;
  const expectedSig = sign(body);
  const provided = Buffer.from(parts[2]);
  const expected = Buffer.from(expectedSig);
  if (provided.length !== expected.length) return false;
  if (!timingSafeEqual(provided, expected)) return false;
  // Ensure the embedded code hash matches the current access code.
  return parts[1] === sign(accessCode());
}

export const GATE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: GATE_MAX_AGE,
};
