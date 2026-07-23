/**
 * Demand Intelligence → Campaign Studio handoff types.
 * Prepared for a future DI workflow. Do not auto-publish from these drafts.
 */

export type DemandTrendDirection = "rising" | "stable" | "declining" | "unknown";

export type DemandSearchIntent =
  | "cost"
  | "provider-search"
  | "insurance"
  | "telehealth"
  | "eligibility"
  | "consultation"
  | "testing"
  | "treatment-process"
  | "comparison"
  | "informational"
  | "transactional"
  | "navigational";

export type DemandContentStatus = "detected" | "drafted" | "in_review" | "approved" | "rejected";
export type DemandComplianceStatus = "unchecked" | "flagged" | "cleared";
export type DemandPublicationStatus = "not_ready" | "ready_to_publish" | "published" | "paused" | "archived";

/**
 * Internal opportunity record. Volume/CPC/competition must never render on public pages.
 */
export type DemandCampaignOpportunity = {
  id: string;
  query: string;
  keywordCluster?: string;
  treatmentSlug: string;
  city?: string;
  state?: string;
  stateAbbreviation?: string;
  zipCode?: string;
  /** Internal only — never show on ads landers. */
  searchVolume?: number | null;
  /** Internal only — never show on ads landers. */
  cpc?: number | null;
  /** Internal only — never show on ads landers. */
  competition?: number | null;
  trendDirection?: DemandTrendDirection;
  searchIntent?: DemandSearchIntent;
  risingLocation?: boolean;
  suggestedCampaignSlug?: string;
  suggestedPath?: string;
  suggestedHeroHeading?: string;
  suggestedEyebrow?: string;
  suggestedShortAnswerQuestions?: string[];
  suggestedAssessmentSlug?: string;
  suggestedDirectoryFilters?: Record<string, string>;
  contentStatus: DemandContentStatus;
  complianceStatus: DemandComplianceStatus;
  publicationStatus: DemandPublicationStatus;
  lastReviewed?: string | null;
  reviewedByAdminId?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/** Gate before a DI opportunity may become a published cs_pages row. */
export function canPublishFromDemandOpportunity(opp: DemandCampaignOpportunity): boolean {
  return (
    opp.contentStatus === "approved" &&
    opp.complianceStatus === "cleared" &&
    opp.publicationStatus === "ready_to_publish" &&
    Boolean(opp.suggestedAssessmentSlug || opp.suggestedPath) &&
    Boolean(opp.lastReviewed)
  );
}
