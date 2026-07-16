import "server-only";

import { PostHog } from "posthog-node";

type ServerEvent = {
  distinctId: string;
  event: string;
  properties?: Record<string, string | number | boolean | null>;
};

const SAFE_PROPERTIES = new Set([
  "source_page", "utm_source", "utm_medium", "utm_campaign", "sender_type", "inquiry_category",
  "routing_team", "priority", "review_status", "specialty_count", "employment_history_count",
  "education_count", "license_count", "job_posting_id", "has_cover_note", "listing_id", "quantity",
  "has_org", "clinic_id", "has_preferred_time", "confirmation_type", "role", "view",
]);

const DEFAULT_ALERT_EVENTS = new Set([
  "assessment_submitted", "clinic_application_submitted", "professional_onboarding_completed",
  "job_application_submitted", "consultation_requested", "contact_submitted", "quote_requested",
]);
const slackLastSent = new Map<string, number>();

function safeProperties(properties: ServerEvent["properties"] = {}) {
  return Object.fromEntries(Object.entries(properties).filter(([key]) => SAFE_PROPERTIES.has(key)));
}

async function maybeNotifySlack(event: ServerEvent, properties: Record<string, unknown>) {
  const webhook = process.env.SLACK_ANALYTICS_WEBHOOK_URL?.trim();
  if (!webhook) return;
  const configured = new Set((process.env.SLACK_ANALYTICS_ALERT_EVENTS ?? "").split(",").map((item) => item.trim()).filter(Boolean));
  if (!(configured.size ? configured : DEFAULT_ALERT_EVENTS).has(event.event)) return;
  const cooldownMs = Math.max(0, Number(process.env.SLACK_ANALYTICS_COOLDOWN_SECONDS ?? 300)) * 1000;
  const now = Date.now();
  if (now - (slackLastSent.get(event.event) ?? 0) < cooldownMs) return;
  slackLastSent.set(event.event, now);
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: `Novalyte website alert: ${event.event}\n${Object.entries(properties).map(([key, value]) => `${key}: ${String(value)}`).join(" · ")}` }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Slack returned ${response.status}`);
}

export async function captureServerEvent(event: ServerEvent): Promise<void> {
  const properties = safeProperties(event.properties);
  await maybeNotifySlack(event, properties).catch((error) => console.error("Analytics Slack alert failed", error));
  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!projectToken || !host) return;

  const client = new PostHog(projectToken, { host, flushAt: 1, flushInterval: 0 });
  try {
    client.capture({ ...event, properties });
    await client.shutdown();
  } catch (error) {
    console.error("PostHog server event failed", error);
    await client.shutdown().catch(() => undefined);
  }
}
