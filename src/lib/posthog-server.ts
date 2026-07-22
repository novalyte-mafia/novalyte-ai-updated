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

function safeProperties(properties: ServerEvent["properties"] = {}) {
  return Object.fromEntries(Object.entries(properties).filter(([key]) => SAFE_PROPERTIES.has(key)));
}

export async function captureServerEvent(event: ServerEvent): Promise<void> {
  const properties = {
    ...safeProperties(event.properties),
    // Stamp production server conversions so HogQL can include them without $host/$current_url.
    environment:
      process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"
        ? "production"
        : "development",
    capture_source: "server",
  };
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
