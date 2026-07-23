"use client";

import { captureSafeEvent } from "@/lib/analytics-client";

export type CampaignAnalyticsContext = {
  campaign_id?: string | null;
  campaign_slug?: string | null;
  treatment_slug?: string | null;
  city?: string | null;
  state?: string | null;
  landing_page_url?: string | null;
  assessment_id?: string | null;
  directory_destination?: string | null;
  primary_search_intent?: string | null;
};

function sanitizeContext(ctx: CampaignAnalyticsContext = {}) {
  return Object.fromEntries(
    Object.entries(ctx).filter(([, v]) => v !== null && v !== undefined && v !== ""),
  );
}

/** Fire a non-PHI campaign funnel event. Never pass assessment answers. */
export function trackCampaignEvent(
  event:
    | "campaign_page_viewed"
    | "campaign_primary_cta_clicked"
    | "campaign_find_clinics_clicked"
    | "campaign_directory_opened"
    | "campaign_answer_expanded"
    | "campaign_answer_viewed"
    | "campaign_contextual_cta_clicked"
    | "campaign_resource_clicked"
    | "campaign_scroll_depth_reached"
    | "campaign_exit_detected",
  ctx: CampaignAnalyticsContext = {},
  extra: Record<string, string | number | boolean | null | undefined> = {},
) {
  captureSafeEvent(event, {
    ...sanitizeContext(ctx),
    ...sanitizeContext(extra),
  });
}
