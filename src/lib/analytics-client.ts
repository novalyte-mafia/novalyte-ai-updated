"use client";

import posthog from "posthog-js";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_KEY = "novalyte-cookie-consent";
const ATTRIBUTION_KEY = "novalyte-attribution";
const SENSITIVE_PROPERTY =
  /(answer|assessment|symptom|diagnos|medical|medication|condition|message|content|password|token|secret|email|phone|address|first_name|last_name|full_name)/i;
let posthogInitialized = false;

type AnalyticsPrimitive = string | number | boolean | null;
type AnalyticsProperties = Record<string, AnalyticsPrimitive | undefined>;

type Attribution = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  landing_path?: string | null;
  referrer_domain?: string | null;
};

export function persistAttribution(attribution: Attribution): void {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(
      window.localStorage.getItem(ATTRIBUTION_KEY) ?? "{}",
    ) as Attribution;
    const merged = Object.fromEntries(
      Object.entries({ ...existing, ...attribution }).filter(
        ([, value]) => value !== null && value !== undefined && value !== "",
      ),
    ) as Attribution;
    const serialized = JSON.stringify(merged);
    window.localStorage.setItem(ATTRIBUTION_KEY, serialized);
    document.cookie = `${ATTRIBUTION_KEY}=${encodeURIComponent(serialized)}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`;
  } catch {
    // Attribution must never break page rendering or form submission.
  }
}

function storedAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(
      window.localStorage.getItem(ATTRIBUTION_KEY) ?? "{}",
    ) as Attribution;
  } catch {
    return {};
  }
}

export function ensurePostHogInitialized(): boolean {
  if (posthogInitialized) return true;

  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const posthogUiHost = process.env.NEXT_PUBLIC_POSTHOG_UI_HOST;
  if (!projectToken || !posthogUiHost || typeof window === "undefined") return false;

  posthog.init(projectToken, {
    api_host: "/ingest",
    ui_host: posthogUiHost,
    defaults: "2026-05-30",
    // Explicit events only — autocapture can leak medical/PII-adjacent DOM text.
    capture_exceptions: false,
    capture_pageview: "history_change",
    autocapture: false,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "*",
    },
    persistence: "localStorage+cookie",
    debug: process.env.NODE_ENV === "development",
  });
  posthogInitialized = true;
  return true;
}

export function isPostHogInitialized(): boolean {
  return posthogInitialized;
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return JSON.parse(window.localStorage.getItem(CONSENT_KEY) ?? "null")?.analytics === true;
  } catch {
    return false;
  }
}

export function captureAnalyticsEvent(
  event: string,
  properties: AnalyticsProperties = {},
): void {
  if (!hasAnalyticsConsent() || typeof window === "undefined") return;
  const safeProperties = sanitizeAnalyticsProperties({
    ...storedAttribution(),
    ...properties,
  });
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...safeProperties });
  window.gtag?.("event", event, safeProperties);
  if (!ensurePostHogInitialized()) return;
  if (posthog.has_opted_out_capturing()) {
    posthog.set_config({ persistence: "localStorage+cookie" });
    posthog.opt_in_capturing();
  }
  posthog.capture(event, safeProperties);
}

export const captureSafeEvent = captureAnalyticsEvent;

export function identifyAnalyticsUser(
  userId: string,
  properties: { role?: string },
): void {
  if (!hasAnalyticsConsent() || !ensurePostHogInitialized()) return;
  posthog.identify(userId, { role: properties.role });
}

function sanitizeAnalyticsProperties(
  properties: AnalyticsProperties,
): Record<string, AnalyticsPrimitive> {
  const output: Record<string, AnalyticsPrimitive> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined || SENSITIVE_PROPERTY.test(key)) continue;
    output[key] =
      typeof value === "string" && value.length > 200
        ? value.slice(0, 200)
        : value;
  }
  return output;
}
