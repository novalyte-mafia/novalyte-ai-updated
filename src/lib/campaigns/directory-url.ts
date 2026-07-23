/**
 * Shared directory handoff URLs for campaign landers.
 * Uses the real directory filter contract from directory-view.tsx.
 */

export const MAIN_SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://novalyte.io";

/** Params the directory actually restores when `view=directory` is present. */
export type DirectoryFilterParams = {
  q?: string;
  location?: string;
  state?: string;
  city?: string;
  treatment?: string;
  format?: string;
  provider?: string;
  distance?: string;
  availability?: string;
  language?: string;
  sort?: string;
};

export type BuildDirectoryUrlInput = DirectoryFilterParams & {
  baseUrl?: string;
  treatmentSlug?: string | null;
  citySlug?: string | null;
  stateSlug?: string | null;
  stateAbbreviation?: string | null;
};

/** Campaign service / vertical slug → directory search query + optional specialty label. */
const TREATMENT_DIRECTORY_MAP: Record<string, { q: string; treatment?: string }> = {
  trt: { q: "testosterone", treatment: "Testosterone Replacement Therapy" },
  "testosterone-replacement-therapy": {
    q: "testosterone",
    treatment: "Testosterone Replacement Therapy",
  },
  "sexual-health": { q: "sexual health", treatment: "Erectile Dysfunction Care" },
  "erectile-dysfunction": { q: "erectile dysfunction", treatment: "Erectile Dysfunction Care" },
  longevity: { q: "longevity", treatment: "Longevity Medicine" },
  "longevity-medicine": { q: "longevity", treatment: "Longevity Medicine" },
  "weight-loss": { q: "weight loss", treatment: "Medical Weight Loss" },
  "weight-management": { q: "weight loss", treatment: "Medical Weight Loss" },
  "medical-weight-loss": { q: "weight loss", treatment: "Medical Weight Loss" },
  "glp-1": { q: "GLP-1", treatment: "GLP-1 Programs" },
  peptides: { q: "peptide", treatment: "Peptide Therapy" },
  "peptide-therapy": { q: "peptide", treatment: "Peptide Therapy" },
  "hair-restoration": { q: "hair restoration", treatment: "Hair Restoration" },
  telehealth: { q: "telehealth" },
};

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

const STATE_CODES = new Set(Object.values(STATE_SLUG_TO_CODE));

export function mainSitePath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${MAIN_SITE_ORIGIN}${normalized}`;
}

export function titleCaseFromSlug(slug: string | null | undefined): string | undefined {
  if (!slug) return undefined;
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Parse `phoenix-az` → { city: "Phoenix", state: "AZ" }. */
export function parseLocationSlug(locationSlug: string | null | undefined): {
  city?: string;
  state?: string;
} {
  if (!locationSlug) return {};
  const parts = locationSlug.trim().toLowerCase().split("-").filter(Boolean);
  if (parts.length < 2) {
    return { city: titleCaseFromSlug(locationSlug) };
  }
  const maybeState = parts[parts.length - 1]?.toUpperCase();
  if (maybeState && STATE_CODES.has(maybeState) && maybeState.length === 2) {
    const city = titleCaseFromSlug(parts.slice(0, -1).join("-"));
    return { city, state: maybeState };
  }
  return { city: titleCaseFromSlug(locationSlug) };
}

export function resolveStateCode(input: {
  state?: string | null;
  stateSlug?: string | null;
  stateAbbreviation?: string | null;
}): string | undefined {
  const abbr = input.stateAbbreviation?.trim().toUpperCase();
  if (abbr && abbr.length === 2) return abbr;

  const state = input.state?.trim();
  if (state) {
    if (state.length === 2) return state.toUpperCase();
    const fromSlug = STATE_SLUG_TO_CODE[state.toLowerCase().replace(/\s+/g, "-")];
    if (fromSlug) return fromSlug;
    return state;
  }

  const slug = input.stateSlug?.trim().toLowerCase();
  if (!slug) return undefined;
  if (STATE_SLUG_TO_CODE[slug]) return STATE_SLUG_TO_CODE[slug];
  if (slug.length === 2) return slug.toUpperCase();
  return undefined;
}

export function treatmentDirectoryHints(treatmentSlug: string | null | undefined): {
  q?: string;
  treatment?: string;
} {
  if (!treatmentSlug) return {};
  const key = treatmentSlug.trim().toLowerCase();
  return TREATMENT_DIRECTORY_MAP[key] ?? { q: key.replace(/-/g, " ") };
}

/**
 * Build an absolute Novalyte directory URL with supported filters only.
 * Always sets `view=directory` so the directory restores query params.
 */
export function buildDirectoryUrl(input: BuildDirectoryUrlInput = {}): string {
  const base = (input.baseUrl ?? `${MAIN_SITE_ORIGIN}/directory`).replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("view", "directory");

  const fromLocation = parseLocationSlug(input.citySlug);
  const treatmentHints = treatmentDirectoryHints(input.treatmentSlug);

  const state =
    resolveStateCode({
      state: input.state,
      stateSlug: input.stateSlug,
      stateAbbreviation: input.stateAbbreviation ?? fromLocation.state,
    }) ?? fromLocation.state;

  const city = input.city?.trim() || fromLocation.city;
  const q = input.q?.trim() || treatmentHints.q;
  const treatment = input.treatment?.trim() || treatmentHints.treatment;

  const values: Record<string, string | undefined> = {
    q,
    location: input.location,
    state,
    city,
    treatment,
    format: input.format,
    provider: input.provider,
    distance: input.distance,
    availability: input.availability,
    language: input.language,
    sort: input.sort,
  };

  for (const [key, value] of Object.entries(values)) {
    if (!value || value === "all" || value === "relevance") continue;
    params.set(key, value);
  }

  return `${base}?${params.toString()}`;
}

export function clinicProfileUrl(clinic: {
  state?: string | null;
  city?: string | null;
  slug?: string | null;
}): string {
  const state = clinic.state?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const city = clinic.city?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (state && city && clinic.slug) {
    return mainSitePath(`/directory/${state}/${city}/${clinic.slug}`);
  }
  return buildDirectoryUrl();
}
