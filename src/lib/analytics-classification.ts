/**
 * Client-safe analytics classification helpers (no Node crypto).
 * Mirror of dashboard classification for browser instrumentation.
 */

export type TrafficClassification =
  | "external"
  | "internal"
  | "test"
  | "bot"
  | "unknown";

const INTERNAL_DEVICE_ID_KEY = "novalyte_internal_device_id";
const INTERNAL_DEVICE_TOKEN_KEY = "novalyte_internal_device_token";
const INTERNAL_DEVICE_LABEL_KEY = "novalyte_internal_device_label";

const COOKIE_DOMAIN = ".novalyte.io";

function isNovalyteHost(): boolean {
  if (typeof window === "undefined") return false;
  return /(^|\.)novalyte\.io$/i.test(window.location.hostname);
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return match.slice(name.length + 1);
  }
}

function writeCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 400) {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  const base = `${name}=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax; Secure`;
  document.cookie = isNovalyteHost() ? `${base}; Domain=${COOKIE_DOMAIN}` : base;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  const base = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
  document.cookie = isNovalyteHost() ? `${base}; Domain=${COOKIE_DOMAIN}` : base;
}

export function getInternalDeviceRegistration(): {
  deviceId: string | null;
  token: string | null;
  label: string | null;
} {
  if (typeof window === "undefined") {
    return { deviceId: null, token: null, label: null };
  }
  const deviceId =
    readCookie(INTERNAL_DEVICE_ID_KEY) ||
    window.localStorage.getItem(INTERNAL_DEVICE_ID_KEY);
  const token =
    readCookie(INTERNAL_DEVICE_TOKEN_KEY) ||
    window.localStorage.getItem(INTERNAL_DEVICE_TOKEN_KEY);
  const label =
    readCookie(INTERNAL_DEVICE_LABEL_KEY) ||
    window.localStorage.getItem(INTERNAL_DEVICE_LABEL_KEY);
  return {
    deviceId: deviceId || null,
    token: token || null,
    label: label || null,
  };
}

export function persistInternalDeviceRegistration(input: {
  deviceId: string;
  token: string;
  label: string;
}): void {
  if (typeof window === "undefined") return;
  writeCookie(INTERNAL_DEVICE_ID_KEY, input.deviceId);
  writeCookie(INTERNAL_DEVICE_TOKEN_KEY, input.token);
  writeCookie(INTERNAL_DEVICE_LABEL_KEY, input.label);
  window.localStorage.setItem(INTERNAL_DEVICE_ID_KEY, input.deviceId);
  window.localStorage.setItem(INTERNAL_DEVICE_TOKEN_KEY, input.token);
  window.localStorage.setItem(INTERNAL_DEVICE_LABEL_KEY, input.label);
}

export function clearInternalDeviceRegistration(): void {
  if (typeof window === "undefined") return;
  clearCookie(INTERNAL_DEVICE_ID_KEY);
  clearCookie(INTERNAL_DEVICE_TOKEN_KEY);
  clearCookie(INTERNAL_DEVICE_LABEL_KEY);
  window.localStorage.removeItem(INTERNAL_DEVICE_ID_KEY);
  window.localStorage.removeItem(INTERNAL_DEVICE_TOKEN_KEY);
  window.localStorage.removeItem(INTERNAL_DEVICE_LABEL_KEY);
}

export function isInternalBrowser(): boolean {
  return Boolean(getInternalDeviceRegistration().deviceId);
}

export function internalAnalyticsProperties(): Record<string, string | boolean | null> {
  const reg = getInternalDeviceRegistration();
  if (!reg.deviceId) {
    return {
      is_internal: false,
      traffic_classification: "external",
    };
  }
  return {
    is_internal: true,
    traffic_classification: "internal",
    internal_user_role: "founder",
    internal_device_id: reg.deviceId,
    environment:
      typeof window !== "undefined" && /localhost|127\.0\.0\.1/.test(window.location.hostname)
        ? "development"
        : "production",
  };
}

export function detectBotClient(): boolean {
  if (typeof navigator === "undefined") return false;
  return /(bot|crawler|spider|headless|playwright|puppeteer)/i.test(navigator.userAgent);
}

export function shortVisitorLabelClient(distinctId: string): string {
  let hash = 0;
  for (let i = 0; i < distinctId.length; i += 1) {
    hash = (hash << 5) - hash + distinctId.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(4, "0").slice(0, 4);
  return `Anonymous Visitor ${hex}`;
}
