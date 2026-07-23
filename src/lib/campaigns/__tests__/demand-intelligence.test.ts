import { describe, expect, it } from "vitest";
import {
  canPublishFromDemandOpportunity,
  type DemandCampaignOpportunity,
} from "@/lib/campaigns/demand-intelligence";

function base(overrides: Partial<DemandCampaignOpportunity> = {}): DemandCampaignOpportunity {
  return {
    id: "opp-1",
    query: "trt clinics phoenix",
    treatmentSlug: "trt",
    contentStatus: "approved",
    complianceStatus: "cleared",
    publicationStatus: "ready_to_publish",
    suggestedAssessmentSlug: "testosterone-replacement-therapy",
    lastReviewed: "2026-07-23",
    createdAt: "2026-07-23T00:00:00.000Z",
    updatedAt: "2026-07-23T00:00:00.000Z",
    ...overrides,
  };
}

describe("demand-intelligence publish gate", () => {
  it("allows publish only when review gates pass", () => {
    expect(canPublishFromDemandOpportunity(base())).toBe(true);
    expect(canPublishFromDemandOpportunity(base({ contentStatus: "drafted" }))).toBe(false);
    expect(canPublishFromDemandOpportunity(base({ complianceStatus: "flagged" }))).toBe(false);
    expect(canPublishFromDemandOpportunity(base({ lastReviewed: null }))).toBe(false);
  });
});
