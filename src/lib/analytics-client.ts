"use client";

import posthog from "posthog-js";

const CONSENT_KEY = "novalyte-cookie-consent";
let posthogInitialized = false;

export function ensurePostHogInitialized(): boolean {
  if (posthogInitialized) return true;

  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const posthogUiHost = process.env.NEXT_PUBLIC_POSTHOG_UI_HOST;
  if (!projectToken || !posthogUiHost || typeof window === "undefined") return false;

  posthog.init(projectToken, {
    api_host: "/ingest",
    ui_host: posthogUiHost,
    defaults: "2026-05-30",
    capture_exceptions: true,
    capture_pageview: "history_change",
    autocapture: true,
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
  properties: Record<string, string | number | boolean | null> = {}
): void {
  if (!hasAnalyticsConsent() || !ensurePostHogInitialized()) return;
  if (posthog.has_opted_out_capturing()) {
    posthog.set_config({ persistence: "localStorage+cookie" });
    posthog.opt_in_capturing();
  }
  posthog.capture(event, properties);
}

export function identifyAnalyticsUser(
  userId: string,
  properties: { email?: string; role?: string }
): void {
  if (!hasAnalyticsConsent() || !ensurePostHogInitialized()) return;
  posthog.identify(userId, properties);
}
