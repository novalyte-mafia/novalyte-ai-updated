import { parseLocationSlug, titleCaseFromSlug } from "@/lib/campaigns/directory-url";

const TREATMENT_LABELS: Record<string, string> = {
  trt: "TRT",
  "sexual-health": "sexual health",
  longevity: "longevity",
  "weight-loss": "weight loss",
  "weight-management": "weight loss",
  "glp-1": "GLP-1",
  peptides: "peptides",
  "peptide-therapy": "peptides",
  "hair-restoration": "hair restoration",
};

export function treatmentDisplayLabel(slug: string | null | undefined): string {
  if (!slug) return "care";
  return TREATMENT_LABELS[slug] ?? slug.replace(/-/g, " ");
}

export function locationDisplayLabel(input: {
  citySlug?: string | null;
  city?: string | null;
  stateSlug?: string | null;
  state?: string | null;
}): string {
  if (input.city && input.state) return `${input.city}, ${input.state}`;
  if (input.citySlug) {
    const parsed = parseLocationSlug(input.citySlug);
    if (parsed.city && parsed.state) return `${parsed.city}, ${parsed.state}`;
    if (parsed.city) return parsed.city;
  }
  return titleCaseFromSlug(input.stateSlug) ?? "your area";
}

export function quickAnswersHeading(treatmentSlug: string | null, locationLabel: string): string {
  const treatment = treatmentDisplayLabel(treatmentSlug);
  return `Quick answers about ${treatment} in ${locationLabel}`;
}
