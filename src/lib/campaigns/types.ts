import type { ClinicT } from "@/lib/types";

export type PageHost = "organic" | "ads";

export type IndexingPolicy =
  | "index_follow"
  | "noindex_follow"
  | "noindex_nofollow"
  | "draft_inaccessible";

export type CampaignAnswerIntent =
  | "cost"
  | "provider-search"
  | "insurance"
  | "telehealth"
  | "eligibility"
  | "consultation"
  | "testing"
  | "treatment-process"
  | "comparison";

export type CampaignAnswerCardItem = {
  id?: string;
  question?: string;
  answer?: string;
  title?: string;
  description?: string;
  label?: string;
  intent?: CampaignAnswerIntent | string;
  relatedKeyword?: string;
  ctaLabel?: string;
  ctaType?: "assessment" | "directory" | "resource";
  resourceUrl?: string;
  lastReviewed?: string;
  /** Only `approved` (or omitted) cards render publicly. */
  status?: "draft" | "review" | "approved";
};

export type CampaignCostFactorItem = {
  title?: string;
  description?: string;
  label?: string;
};

export type CampaignPageBlock = {
  type: string;
  title?: string;
  items?: CampaignAnswerCardItem[];
  props?: Record<string, unknown>;
};

export type CampaignFormConfig = {
  assessment_slug?: string;
  mode?: "full" | "short";
  [key: string]: unknown;
};

export type CampaignHero = {
  headline?: string;
  subheadline?: string;
  eyebrow?: string;
  image?: string;
};

export type CsPageRow = {
  id: string;
  campaign_id: string | null;
  template_version_id: string | null;
  page_type: string | null;
  host: PageHost;
  slug: string;
  path: string;
  service_slug: string | null;
  state_slug: string | null;
  city_slug: string | null;
  geo_id: string | null;
  vertical_id: string | null;
  status: string;
  indexing_policy: IndexingPolicy;
  public_title: string | null;
  internal_title: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  hero: CampaignHero;
  cta_primary: string | null;
  cta_secondary: string | null;
  form_config: CampaignFormConfig;
  routing_config: Record<string, unknown>;
  related_article_id: string | null;
  current_version: number;
  published_at: string | null;
  assessment_template_id: string | null;
  assessment_version_id: string | null;
  assessment_placement: string[] | null;
  assessment_status: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicCampaignPage = {
  page: CsPageRow;
  blocks: CampaignPageBlock[];
  formConfig: CampaignFormConfig;
  routingConfig: Record<string, unknown>;
  clinics: ClinicT[];
  assessmentSlug: string;
  assessmentMode: "full" | "short";
  assessmentPlacement: string[];
  prefill: {
    state?: string;
    city?: string;
    zip?: string;
  };
};
