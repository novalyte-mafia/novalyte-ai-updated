/**
 * Journal engagement helpers — soft assessment nudges + interlinking.
 * Copy stays educational: assessments are informational, never diagnostic.
 */

import { ASSESSMENTS } from "@/lib/assessment-config";

const TREATMENT_TO_ASSESSMENT: Record<string, string> = {
  "testosterone replacement therapy": "testosterone-replacement-therapy",
  testosterone: "testosterone-replacement-therapy",
  trt: "testosterone-replacement-therapy",
  "medical weight loss": "medical-weight-loss",
  "weight loss": "medical-weight-loss",
  "glp-1": "glp-1",
  glp1: "glp-1",
  "longevity medicine": "longevity-medicine",
  longevity: "longevity-medicine",
  "erectile dysfunction": "erectile-dysfunction",
  ed: "erectile-dysfunction",
  "peptide therapy": "peptide-therapy",
  peptides: "peptide-therapy",
  "hair restoration": "hair-restoration",
  "hormone optimization": "hormone-optimization",
};

/** Prefer category/tag signals when relatedTreatment is missing or free-text. */
const CATEGORY_TO_ASSESSMENT: Record<string, string> = {
  Testosterone: "testosterone-replacement-therapy",
  "Weight Management": "medical-weight-loss",
  Longevity: "longevity-medicine",
  "Healthcare Technology": "testosterone-replacement-therapy",
};

export function resolveAssessmentSlug(input?: {
  relatedTreatment?: string | null;
  category?: string | null;
  tags?: string[] | null;
  slug?: string | null;
}): string {
  const related = input?.relatedTreatment?.trim().toLowerCase();
  if (related && TREATMENT_TO_ASSESSMENT[related]) {
    return TREATMENT_TO_ASSESSMENT[related];
  }
  if (related) {
    const kebab = related.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (kebab in ASSESSMENTS) return kebab;
  }

  const slug = input?.slug ?? "";
  if (slug.includes("trt") || slug.includes("testosterone")) {
    return "testosterone-replacement-therapy";
  }
  if (slug.includes("glp") || slug.includes("weight")) return "medical-weight-loss";
  if (slug.includes("longevity")) return "longevity-medicine";
  if (slug.includes("telehealth") || slug.includes("clinic-operations")) {
    return "testosterone-replacement-therapy";
  }

  for (const tag of input?.tags ?? []) {
    const mapped = TREATMENT_TO_ASSESSMENT[tag.trim().toLowerCase()];
    if (mapped) return mapped;
  }

  const fromCategory = input?.category
    ? CATEGORY_TO_ASSESSMENT[input.category]
    : undefined;
  if (fromCategory) return fromCategory;

  return "testosterone-replacement-therapy";
}

export function assessmentHref(assessmentSlug: string): string {
  const params = encodeURIComponent(JSON.stringify({ slug: assessmentSlug }));
  return `/?view=assessment&params=${params}`;
}

/** Editorial peer links for hardcoded journal posts (SEO interlinking). */
export const ARTICLE_PEER_LINKS: Record<
  string,
  { slug: string; label: string }[]
> = {
  "understanding-trt-overview": [
    {
      slug: "longevity-medicine-science-vs-hype",
      label: "longevity medicine — science vs. hype",
    },
    {
      slug: "glp-1-medical-weight-loss",
      label: "GLP-1 medications and medical weight loss",
    },
    {
      slug: "healthcare-technology-mens-health-access",
      label: "how men find and access care online",
    },
  ],
  "glp-1-medical-weight-loss": [
    {
      slug: "understanding-trt-overview",
      label: "testosterone replacement therapy overview",
    },
    {
      slug: "longevity-medicine-science-vs-hype",
      label: "longevity medicine — science vs. hype",
    },
  ],
  "longevity-medicine-science-vs-hype": [
    {
      slug: "understanding-trt-overview",
      label: "testosterone replacement therapy overview",
    },
    {
      slug: "glp-1-medical-weight-loss",
      label: "GLP-1 and medical weight loss",
    },
    {
      slug: "healthcare-technology-mens-health-access",
      label: "healthcare technology and access",
    },
  ],
  "healthcare-technology-mens-health-access": [
    {
      slug: "understanding-trt-overview",
      label: "TRT: a complete guide for men",
    },
    {
      slug: "compliant-telehealth-mens-health",
      label: "building a compliant telehealth practice",
    },
    {
      slug: "state-of-mens-health-clinic-operations",
      label: "the state of men's health clinic operations",
    },
  ],
  "state-of-mens-health-clinic-operations": [
    {
      slug: "compliant-telehealth-mens-health",
      label: "compliant telehealth for men's health",
    },
    {
      slug: "recruiting-specialized-talent-mens-health",
      label: "recruiting specialized men's health talent",
    },
  ],
  "recruiting-specialized-talent-mens-health": [
    {
      slug: "state-of-mens-health-clinic-operations",
      label: "clinic operations in men's health",
    },
    {
      slug: "compliant-telehealth-mens-health",
      label: "telehealth practice considerations",
    },
  ],
  "compliant-telehealth-mens-health": [
    {
      slug: "state-of-mens-health-clinic-operations",
      label: "men's health clinic operations",
    },
    {
      slug: "healthcare-technology-mens-health-access",
      label: "how technology changes access to care",
    },
  ],
};

export function softAssessmentCopy(assessmentSlug: string): {
  title: string;
  body: string;
  cta: string;
} {
  const config = ASSESSMENTS[assessmentSlug];
  const topic = config?.shortLabel ?? config?.treatmentLabel ?? "men's health";
  return {
    title: "Want a quicker read on next steps?",
    body: `If this topic feels relevant, a short informational assessment can help you organize questions for a licensed clinician. It takes a few minutes, covers ${topic}, and is not a diagnosis.`,
    cta: "Start the short assessment",
  };
}
