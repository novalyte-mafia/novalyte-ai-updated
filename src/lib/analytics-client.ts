"use client";

import posthog from "posthog-js";
import {
  detectBotClient,
  internalAnalyticsProperties,
  isInternalBrowser,
} from "@/lib/analytics-classification";

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

export type Attribution = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  landing_path?: string | null;
  landing_url?: string | null;
  landing_at?: string | null;
  referrer?: string | null;
  referrer_domain?: string | null;
  device_type?: string | null;
};

function detectDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia("(max-width: 767px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 1023px)").matches) return "tablet";
  return "desktop";
}

/**
 * First-party marketing attribution for form conversion decisions.
 * Persists even when analytics cookies are declined — operational
 * conversion context (UTM/referrer/landing/device), not third-party tracking.
 */
export function persistAttribution(attribution: Attribution): void {
  if (typeof window === "undefined") return;
  try {
    const existing = storedAttribution();
    const merged = Object.fromEntries(
      Object.entries({ ...existing, ...attribution }).filter(
        ([, value]) => value !== null && value !== undefined && value !== "",
      ),
    ) as Attribution;
    if (!merged.landing_at) merged.landing_at = new Date().toISOString();
    if (!merged.device_type) merged.device_type = detectDeviceType();
    const serialized = JSON.stringify(merged);
    window.localStorage.setItem(ATTRIBUTION_KEY, serialized);
    document.cookie = `${ATTRIBUTION_KEY}=${encodeURIComponent(serialized)}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`;
  } catch {
    // Attribution must never break page rendering or form submission.
  }
}

/** Capture landing UTMs / external referrer / device on every visit (consent-independent). */
export function captureLandingAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const referrer = document.referrer || null;
  const referrerDomain = (() => {
    if (!referrer) return null;
    try {
      return new URL(referrer).hostname;
    } catch {
      return null;
    }
  })();
  const sameSiteReferrer = Boolean(
    referrerDomain && /(^|\.)novalyte\.io$/i.test(referrerDomain),
  );
  const started = window.sessionStorage.getItem("novalyte-session-started");
  const patch: Attribution = {
    device_type: detectDeviceType(),
    utm_source: url.searchParams.get("utm_source"),
    utm_medium: url.searchParams.get("utm_medium"),
    utm_campaign: url.searchParams.get("utm_campaign"),
    utm_content: url.searchParams.get("utm_content"),
    utm_term: url.searchParams.get("utm_term"),
  };
  if (!started) {
    patch.landing_path = url.pathname;
    patch.landing_url = `${url.origin}${url.pathname}`;
    patch.landing_at = new Date().toISOString();
    if (referrer && !sameSiteReferrer) {
      patch.referrer = referrer;
      patch.referrer_domain = referrerDomain;
    }
    window.sessionStorage.setItem("novalyte-session-started", "1");
  } else {
    const existing = storedAttribution();
    if (referrer && !sameSiteReferrer && !existing.referrer_domain) {
      patch.referrer = referrer;
      patch.referrer_domain = referrerDomain;
    }
  }
  persistAttribution(patch);
  return { ...storedAttribution(), ...patch };
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

export function getStoredAttribution(): Attribution {
  return storedAttribution();
}

/** Payload for form APIs + headers so the server can persist attribution reliably. */
export function getFormAttributionPayload(): {
  headers: Record<string, string>;
  fields: Record<string, string | null>;
} {
  const attr = storedAttribution();
  const device = attr.device_type || detectDeviceType();
  let anonymousId: string | null = null;
  try {
    if (posthogInitialized && !posthog.has_opted_out_capturing()) {
      anonymousId = posthog.get_distinct_id?.() ?? null;
    }
  } catch {
    anonymousId = null;
  }

  const fields = {
    utm_source: attr.utm_source ?? null,
    utm_medium: attr.utm_medium ?? null,
    utm_campaign: attr.utm_campaign ?? null,
    utm_content: attr.utm_content ?? null,
    utm_term: attr.utm_term ?? null,
    landing_path: attr.landing_path ?? null,
    landing_url: attr.landing_url ?? null,
    landing_at: attr.landing_at ?? null,
    referrer: attr.referrer ?? null,
    referrer_domain: attr.referrer_domain ?? null,
    device_type: device,
    source_page: typeof window !== "undefined" ? window.location.href : null,
    anonymous_id: anonymousId,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-source-page": fields.source_page || "",
    "x-device-type": device,
  };
  if (fields.utm_source) headers["x-utm-source"] = fields.utm_source;
  if (fields.utm_medium) headers["x-utm-medium"] = fields.utm_medium;
  if (fields.utm_campaign) headers["x-utm-campaign"] = fields.utm_campaign;
  if (fields.utm_content) headers["x-utm-content"] = fields.utm_content;
  if (fields.utm_term) headers["x-utm-term"] = fields.utm_term;
  if (fields.referrer_domain) headers["x-referrer-domain"] = fields.referrer_domain;
  if (fields.landing_path) headers["x-landing-path"] = fields.landing_path;
  if (fields.landing_at) headers["x-landing-at"] = fields.landing_at;
  if (anonymousId) headers["x-anonymous-id"] = anonymousId;

  return { headers, fields };
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
    // Single pageview path — AnalyticsManager must NOT also emit page_view to PostHog.
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
  // Avoid double pageviews: PostHog already emits $pageview via history_change.
  if (event === "page_view" || event === "page_viewed") {
    registerInternalSuperProperties();
    // Still push GA/dataLayer once for SPA navigations handled by AnalyticsManager.
    const safeGa = sanitizeAnalyticsProperties({
      ...storedAttribution(),
      ...internalAnalyticsProperties(),
      ...properties,
      is_bot: detectBotClient(),
    });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "novalyte_page_context", ...safeGa });
    return;
  }
  const safeProperties = sanitizeAnalyticsProperties({
    ...storedAttribution(),
    ...internalAnalyticsProperties(),
    ...properties,
    is_bot: detectBotClient(),
  });
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...safeProperties });
  window.gtag?.("event", event, {
    ...safeProperties,
    traffic_type: safeProperties.is_internal ? "internal" : "external",
    is_internal: safeProperties.is_internal ? "true" : "false",
  });
  if (!ensurePostHogInitialized()) return;
  if (posthog.has_opted_out_capturing()) {
    posthog.set_config({ persistence: "localStorage+cookie" });
    posthog.opt_in_capturing();
  }
  registerInternalSuperProperties();
  posthog.capture(event, safeProperties);
}

export function registerInternalSuperProperties(): void {
  if (!ensurePostHogInitialized()) return;
  try {
    posthog.register(internalAnalyticsProperties());
    if (isInternalBrowser()) {
      const email = process.env.NEXT_PUBLIC_FOUNDER_ANALYTICS_EMAIL;
      // Only set person props when we know this browser is registered internal —
      // do not invent an identity for anonymous externals.
      if (email) {
        posthog.people?.set?.({
          is_internal: true,
          role: "founder",
        });
      }
    }
  } catch {
    // never break the site for analytics
  }
}

/** After an approved form submit, stitch anonymous browser → stable contact id. */
export function identifyFormSubmitter(input: {
  contactId: string;
  email?: string | null;
  name?: string | null;
  organization?: string | null;
  formType?: string | null;
  isTest?: boolean;
}): void {
  if (!hasAnalyticsConsent() || !ensurePostHogInitialized()) return;
  try {
    const props = {
      email: input.isTest ? undefined : input.email || undefined,
      name: input.isTest ? undefined : input.name || undefined,
      organization: input.isTest ? undefined : input.organization || undefined,
      latest_form_type: input.formType || undefined,
      is_internal: isInternalBrowser(),
      is_test: Boolean(input.isTest),
      traffic_classification: input.isTest
        ? "test"
        : isInternalBrowser()
          ? "internal"
          : "external",
    };
    posthog.identify(input.contactId, props);
    registerInternalSuperProperties();
  } catch {
    // ignore
  }
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
