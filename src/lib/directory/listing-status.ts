/**
 * Clinic directory listing classification helpers.
 *
 * listingStatus rules:
 * - demo: fictional preview only; never claimable; never verified
 * - unclaimed: publicly sourced; not verified by the clinic via Novalyte
 * - claimed: ownership confirmed; may still await clinical review
 * - verified: listingStatus verified AND verificationStatus approved
 */

export type ListingStatus = "demo" | "unclaimed" | "claimed" | "verified";

export type DirectoryClinicExtras = {
  listingStatus: ListingStatus;
  latitude?: number | null;
  longitude?: number | null;
  dataSource?: "public_web" | "demo" | "novalyte" | null;
  sourceUrl?: string | null;
  lastReviewedAt?: string | null;
  financingAvailable?: boolean | null;
  inPersonAvailable?: boolean | null;
  sameDayConsultations?: boolean | null;
  bookingUrl?: string | null;
};

export function resolveListingStatus(input: {
  listingStatus?: string | null;
  claimStatus?: string | null;
  verified?: boolean | null;
  verificationStatus?: string | null;
}): ListingStatus {
  if (input.listingStatus === "demo") return "demo";
  if (input.listingStatus === "verified") return "verified";
  if (input.listingStatus === "claimed") return "claimed";
  if (input.listingStatus === "unclaimed") return "unclaimed";

  if (input.verified && (input.verificationStatus === "approved" || input.verificationStatus === "verified")) {
    return "verified";
  }
  if (input.claimStatus === "claimed") return "claimed";
  if (input.claimStatus === "not_claimable") return "demo";
  return "unclaimed";
}

export function isGenuinelyVerified(clinic: {
  listingStatus?: string | null;
  verified?: boolean | null;
  verificationStatus?: string | null;
}): boolean {
  return (
    resolveListingStatus(clinic) === "verified" &&
    Boolean(clinic.verified) &&
    (clinic.verificationStatus === "approved" || clinic.verificationStatus === "verified")
  );
}

export function isClaimable(clinic: {
  listingStatus?: string | null;
  claimStatus?: string | null;
}): boolean {
  const status = resolveListingStatus(clinic);
  return status === "unclaimed" && clinic.claimStatus !== "not_claimable";
}

export function directorySortRank(clinic: {
  listingStatus?: string | null;
  claimStatus?: string | null;
  verified?: boolean | null;
  verificationStatus?: string | null;
  profileCompleteness?: number | null;
}): number {
  const status = resolveListingStatus(clinic);
  const completeness = clinic.profileCompleteness ?? 0;
  if (status === "verified") return 4000 + completeness;
  if (status === "claimed") return 3000 + completeness;
  if (status === "unclaimed") return 2000 + completeness;
  return 1000 + completeness; // demo after complete unclaimed when sorting relevance
}

export const SEARCH_ALIASES: Record<string, string[]> = {
  trt: ["testosterone", "testosterone therapy", "testosterone replacement", "hormone optimization"],
  ed: ["erectile dysfunction", "erectile", "sexual wellness"],
  glp1: ["glp-1", "glp1", "medical weight loss", "weight loss", "semaglutide", "tirzepatide"],
  "weight management": ["medical weight loss", "weight loss", "glp-1"],
  "hormone therapy": ["hormone optimization", "testosterone", "trt"],
  telehealth: ["telehealth", "virtual", "remote"],
  longevity: ["longevity", "healthspan", "preventive"],
  "hair restoration": ["hair restoration", "hair loss"],
  "sexual wellness": ["sexual wellness", "erectile dysfunction", "ed"],
  "preventive care": ["preventive", "primary care", "men's primary care"],
};

export function expandSearchTerms(raw: string): string[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const terms = new Set<string>([q]);
  for (const [alias, expansions] of Object.entries(SEARCH_ALIASES)) {
    if (q === alias || q.includes(alias) || alias.includes(q)) {
      expansions.forEach((t) => terms.add(t));
      terms.add(alias);
    }
    for (const exp of expansions) {
      if (q === exp || q.includes(exp) || exp.includes(q)) {
        terms.add(alias);
        expansions.forEach((t) => terms.add(t));
      }
    }
  }
  return [...terms];
}
