import "server-only";

import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ClinicT } from "@/lib/types";
import type {
  CampaignFormConfig,
  CampaignPageBlock,
  CsPageRow,
  PublicCampaignPage,
} from "@/lib/campaigns/types";

export const CAMPAIGN_PAGES_TAG = "campaign-pages";
export const CAMPAIGN_CACHE_SECONDS = 300;

/** CS vertical slug → public assessment engine slug. */
const VERTICAL_ASSESSMENT_MAP: Record<string, string> = {
  trt: "testosterone-replacement-therapy",
  "sexual-health": "erectile-dysfunction",
  "weight-management": "medical-weight-loss",
  "weight-loss": "medical-weight-loss",
  longevity: "longevity-medicine",
  "glp-1": "glp-1",
  peptides: "peptide-therapy",
  "hair-restoration": "hair-restoration",
  telehealth: "testosterone-replacement-therapy",
  "primary-care": "hormone-optimization",
};

type PageVersionRow = {
  blocks: CampaignPageBlock[] | null;
};

type PageClinicRow = {
  clinic_id: string;
  is_primary: boolean;
  weight: number;
};

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return `/${trimmed}`;
  return trimmed.replace(/\/+$/, "") || "/";
}

function resolveAssessmentSlug(
  formConfig: CampaignFormConfig,
  serviceSlug: string | null,
): string {
  const fromConfig =
    typeof formConfig.assessment_slug === "string"
      ? formConfig.assessment_slug.trim()
      : "";
  if (fromConfig) return fromConfig;
  if (serviceSlug && VERTICAL_ASSESSMENT_MAP[serviceSlug]) {
    return VERTICAL_ASSESSMENT_MAP[serviceSlug];
  }
  return "hormone-optimization";
}

function resolveAssessmentMode(formConfig: CampaignFormConfig): "full" | "short" {
  return formConfig.mode === "short" ? "short" : "full";
}

const STATE_SLUG_TO_CODE: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new-hampshire": "NH",
  "new-jersey": "NJ",
  "new-mexico": "NM",
  "new-york": "NY",
  "north-carolina": "NC",
  "north-dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode-island": "RI",
  "south-carolina": "SC",
  "south-dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west-virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district-of-columbia": "DC",
};

function stateCodeFromSlug(stateSlug: string | null): string | undefined {
  if (!stateSlug) return undefined;
  const normalized = stateSlug.trim().toLowerCase();
  if (STATE_SLUG_TO_CODE[normalized]) return STATE_SLUG_TO_CODE[normalized];
  if (normalized.length === 2) return normalized.toUpperCase();
  return undefined;
}

function titleCaseSlug(slug: string | null): string | undefined {
  if (!slug) return undefined;
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function loadPublishedClinicIds(): Promise<Set<string>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("prospect_directory_profiles")
    .select("publicClinicId")
    .eq("listingStatus", "published")
    .eq("verificationStatus", "verified")
    .eq("publicationStatus", "published")
    .not("permissionSourceCallId", "is", null)
    .not("permissionGrantedAt", "is", null)
    .not("approvedAt", "is", null)
    .not("publishedAt", "is", null);

  if (error) {
    if (error.code !== "PGRST204") {
      console.error("campaign pages: clinic gate lookup failed", { code: error.code });
    }
    return new Set();
  }

  return new Set(
    (data ?? [])
      .map((row) => row.publicClinicId as string | null)
      .filter((id): id is string => Boolean(id)),
  );
}

async function loadClinicsForPage(pageId: string): Promise<ClinicT[]> {
  const supabase = getSupabaseAdmin();
  const publishedIds = await loadPublishedClinicIds();
  if (publishedIds.size === 0) return [];

  const { data: links, error: linkError } = await supabase
    .from("cs_page_clinics")
    .select("clinic_id, is_primary, weight")
    .eq("page_id", pageId)
    .order("is_primary", { ascending: false })
    .order("weight", { ascending: false });

  if (linkError) {
    if (linkError.code !== "PGRST204") {
      console.error("campaign pages: clinic links lookup failed", { code: linkError.code });
    }
    return [];
  }

  const clinicIds = ((links ?? []) as PageClinicRow[])
    .map((row) => row.clinic_id)
    .filter((id) => publishedIds.has(id));

  if (clinicIds.length === 0) return [];

  const { data, error } = await supabase
    .from("Clinic")
    .select(
      "*, locations:ClinicLocation(*), providers:ClinicProvider(*), treatments:ClinicTreatment(*), reviews:ClinicReview(*)",
    )
    .in("id", clinicIds)
    .is("deletedAt", null);

  if (error) {
    console.error("campaign pages: clinic projection failed", { code: error.code });
    return [];
  }

  const byId = new Map((data ?? []).map((c) => [c.id as string, c as ClinicT]));
  return clinicIds
    .map((id) => byId.get(id))
    .filter((c): c is ClinicT => Boolean(c));
}

async function fetchPublishedPageByPath(path: string): Promise<PublicCampaignPage | null> {
  const normalized = normalizePath(path);
  const supabase = getSupabaseAdmin();

  const { data: page, error } = await supabase
    .from("cs_pages")
    .select("*")
    .eq("path", normalized)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    if (error.code !== "PGRST204") {
      console.error("campaign pages: page lookup failed", { path: normalized, code: error.code });
    }
    return null;
  }
  if (!page) return null;

  const pageRow = page as CsPageRow;

  const { data: version } = await supabase
    .from("cs_page_versions")
    .select("blocks")
    .eq("page_id", pageRow.id)
    .eq("version", pageRow.current_version)
    .maybeSingle();

  const formConfig = (pageRow.form_config ?? {}) as CampaignFormConfig;
  const clinics = await loadClinicsForPage(pageRow.id);

  return {
    page: pageRow,
    blocks: Array.isArray((version as PageVersionRow | null)?.blocks)
      ? ((version as PageVersionRow).blocks ?? [])
      : [],
    formConfig,
    routingConfig: pageRow.routing_config ?? {},
    clinics,
    assessmentSlug: resolveAssessmentSlug(formConfig, pageRow.service_slug),
    assessmentMode: resolveAssessmentMode(formConfig),
    assessmentPlacement: pageRow.assessment_placement?.length
      ? pageRow.assessment_placement
      : ["below_hero"],
    prefill: {
      state: stateCodeFromSlug(pageRow.state_slug),
      city: titleCaseSlug(pageRow.city_slug),
    },
  };
}

const cachedPageByPath = unstable_cache(
  async (path: string) => fetchPublishedPageByPath(path),
  ["campaign-page-by-path"],
  { revalidate: CAMPAIGN_CACHE_SECONDS, tags: [CAMPAIGN_PAGES_TAG] },
);

export async function getPublishedPageByPath(path: string): Promise<PublicCampaignPage | null> {
  return cachedPageByPath(normalizePath(path));
}

export async function getPublishedPageByAdsSlug(slug: string): Promise<PublicCampaignPage | null> {
  const normalizedSlug = slug.trim().toLowerCase().replace(/^\/+/, "");
  // Support both legacy flat slugs and hierarchical treatment/location.
  return getPublishedPageByPath(`/ads/${normalizedSlug}`);
}

/** Hierarchical ads lookup: /ads/{treatment}/{location} */
export async function getPublishedPageByTreatmentLocation(
  treatment: string,
  location: string,
): Promise<PublicCampaignPage | null> {
  const t = treatment.trim().toLowerCase();
  const loc = location.trim().toLowerCase();
  if (!t || !loc) return null;
  return getPublishedPageByPath(`/ads/${t}/${loc}`);
}

/** Public browser path on ads.novalyte.io (no /ads prefix). */
export function adsPublicPath(internalPath: string): string {
  const normalized = normalizePath(internalPath);
  if (normalized === "/ads") return "/";
  if (normalized.startsWith("/ads/")) return normalized.slice(4) || "/";
  return normalized;
}

export function adsCanonicalUrl(internalPath: string): string {
  const publicPath = adsPublicPath(internalPath);
  return `https://ads.novalyte.io${publicPath === "/" ? "" : publicPath}`;
}

async function fetchIndexableOrganicPaths(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cs_pages")
    .select("path, updated_at")
    .eq("host", "organic")
    .eq("status", "published")
    .eq("indexing_policy", "index_follow")
    .order("updated_at", { ascending: false });

  if (error) {
    if (error.code !== "PGRST204") {
      console.error("campaign pages: indexable paths failed", { code: error.code });
    }
    return [];
  }

  return (data ?? []).map((row) => row.path as string).filter(Boolean);
}

async function fetchIndexableAdsPaths(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cs_pages")
    .select("path, updated_at")
    .eq("host", "ads")
    .eq("status", "published")
    .eq("indexing_policy", "index_follow")
    .order("updated_at", { ascending: false });

  if (error) {
    if (error.code !== "PGRST204") {
      console.error("campaign pages: indexable ads paths failed", { code: error.code });
    }
    return [];
  }

  return (data ?? []).map((row) => row.path as string).filter(Boolean);
}

const cachedIndexablePaths = unstable_cache(
  fetchIndexableOrganicPaths,
  ["campaign-indexable-paths"],
  { revalidate: CAMPAIGN_CACHE_SECONDS, tags: [CAMPAIGN_PAGES_TAG] },
);

const cachedIndexableAdsPaths = unstable_cache(
  fetchIndexableAdsPaths,
  ["campaign-indexable-ads-paths"],
  { revalidate: CAMPAIGN_CACHE_SECONDS, tags: [CAMPAIGN_PAGES_TAG] },
);

export async function listIndexableOrganicPaths(): Promise<string[]> {
  return cachedIndexablePaths();
}

export async function listIndexableAdsPaths(): Promise<string[]> {
  return cachedIndexableAdsPaths();
}

export function verticalToAssessmentSlug(verticalSlug: string): string {
  return VERTICAL_ASSESSMENT_MAP[verticalSlug] ?? "hormone-optimization";
}
