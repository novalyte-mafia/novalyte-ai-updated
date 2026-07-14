/**
 * Novalyte AI — Assessment Configuration Engine
 *
 * Configuration-driven assessment logic. Each treatment category defines
 * its own question set. New assessments can be added without rebuilding
 * the assessment component.
 *
 * IMPORTANT: All assessments are informational and educational. They do
 * NOT provide a medical diagnosis, medical eligibility, or guarantee
 * treatment approval.
 */

export type QuestionType =
  | "single" // single-choice (radio)
  | "multi" // multi-select (checkbox)
  | "text" // short text
  | "contact" // contact info capture (name, email, phone, zip, state)
  | "consent"; // consent checkboxes

export type Question = {
  id: string;
  type: QuestionType;
  title: string;
  desc?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  /** scoring signal weight for readiness classification */
  signal?: "timeline" | "selfpay" | "experience" | "consent" | "contact";
};

export type AssessmentConfig = {
  slug: string;
  treatmentLabel: string;
  shortLabel: string;
  heroImage: string;
  heroImageAlt: string;
  description: string;
  questions: Question[];
  /** result messaging templates */
  results: {
    readyTitle: string;
    readyDesc: string;
    researchingTitle: string;
    researchingDesc: string;
  };
};

/* ── Shared question blocks ──────────────────────────────────── */

const TIMELINE_Q: Question = {
  id: "timeline",
  type: "single",
  title: "When would you ideally like to begin speaking with a provider?",
  desc: "This helps us show clinics that match your timing.",
  required: true,
  signal: "timeline",
  options: [
    { value: "within-7-days", label: "Within 7 days" },
    { value: "within-2-weeks", label: "Within 2 weeks" },
    { value: "within-30-days", label: "Within 30 days" },
    { value: "within-3-months", label: "Within 1–3 months" },
    { value: "researching", label: "I am only researching" },
  ],
};

const CARE_FORMAT_Q: Question = {
  id: "care_format",
  type: "single",
  title: "Are you open to telehealth, in-person care, or either?",
  required: true,
  options: [
    { value: "in-person", label: "In-person care" },
    { value: "telehealth", label: "Telehealth (remote)" },
    { value: "either", label: "Either — open to both" },
  ],
};

const SELFPAY_Q: Question = {
  id: "self_pay",
  type: "single",
  title: "Some men's health services may not be fully covered by insurance. Are you open to discussing self-pay options with a clinic?",
  desc: "This helps us show clinics and care options that better match your preferences. It does not determine whether treatment is medically appropriate.",
  required: true,
  signal: "selfpay",
  options: [
    { value: "yes", label: "Yes" },
    { value: "possibly", label: "Possibly, depending on cost" },
    { value: "insurance-only", label: "I need insurance-covered options only" },
    { value: "not-sure", label: "I am not sure" },
  ],
};

const BUDGET_Q: Question = {
  id: "budget",
  type: "single",
  title: "What monthly budget range would you be comfortable discussing?",
  desc: "Optional. This helps surface clinics that fit your preferences. It does not affect medical suitability.",
  required: false,
  options: [
    { value: "under-100", label: "Under $100" },
    { value: "100-199", label: "$100–$199" },
    { value: "200-299", label: "$200–$299" },
    { value: "300-plus", label: "$300+" },
    { value: "not-sure", label: "Not sure yet" },
  ],
};

const CONTACT_Q: Question = {
  id: "contact",
  type: "contact",
  title: "Where should we send your results?",
  desc: "We use this only to share your informational results and support your care navigation. We do not provide medical advice.",
  required: true,
  signal: "contact",
};

const CONSENT_Q: Question = {
  id: "consent",
  type: "consent",
  title: "Consent to be contacted",
  desc: "Please review and accept the following. You can opt out at any time.",
  required: true,
  signal: "consent",
};

const AGE_Q: Question = {
  id: "age_range",
  type: "single",
  title: "What is your age range?",
  required: true,
  options: [
    { value: "18-29", label: "18–29" },
    { value: "30-39", label: "30–39" },
    { value: "40-49", label: "40–49" },
    { value: "50-59", label: "50–59" },
    { value: "60-plus", label: "60+" },
  ],
};

/* ── Treatment-specific assessments ──────────────────────────── */

export const ASSESSMENTS: Record<string, AssessmentConfig> = {
  "testosterone-replacement-therapy": {
    slug: "testosterone-replacement-therapy",
    treatmentLabel: "Testosterone Replacement Therapy",
    shortLabel: "TRT",
    heroImage: "/images/treatments/weight-3.png",
    heroImageAlt: "Clinician reviewing treatment options with a male patient",
    description: "An informational assessment to help you explore whether TRT is worth discussing with a licensed provider.",
    questions: [
      AGE_Q,
      {
        id: "goal",
        type: "multi",
        title: "What would you most like to improve?",
        desc: "Select all that apply.",
        required: true,
        options: [
          { value: "energy", label: "Energy" },
          { value: "motivation", label: "Motivation" },
          { value: "strength", label: "Strength" },
          { value: "muscle", label: "Muscle mass" },
          { value: "sexual", label: "Sexual health" },
          { value: "mood", label: "Mood" },
          { value: "recovery", label: "Recovery" },
          { value: "wellness", label: "General wellness" },
        ],
      },
      {
        id: "duration",
        type: "single",
        title: "How long have you experienced these concerns?",
        required: true,
        options: [
          { value: "under-3m", label: "Less than 3 months" },
          { value: "3-6m", label: "3–6 months" },
          { value: "6-12m", label: "6–12 months" },
          { value: "over-1y", label: "Over a year" },
        ],
      },
      {
        id: "recent_labs",
        type: "single",
        title: "Have you had testosterone or hormone lab work completed recently?",
        required: true,
        signal: "experience",
        options: [
          { value: "yes-recent", label: "Yes, within the last 6 months" },
          { value: "yes-older", label: "Yes, but over 6 months ago" },
          { value: "no", label: "No" },
          { value: "not-sure", label: "Not sure" },
        ],
      },
      {
        id: "prior_discussion",
        type: "single",
        title: "Have you previously discussed testosterone treatment with a licensed provider?",
        required: true,
        signal: "experience",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "current_use",
        type: "single",
        title: "Are you currently using testosterone, hormone therapy, or related medication?",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      TIMELINE_Q,
      CARE_FORMAT_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONTACT_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You appear ready to explore a TRT consultation.",
      readyDesc: "Based on your responses, we can now show clinics that match your treatment interest, location, timing, and care preferences.",
      researchingTitle: "Thanks for exploring — take your time.",
      researchingDesc: "When you're ready to speak with a provider, Novalyte AI can connect you with clinics matching your preferences.",
    },
  },

  "erectile-dysfunction": {
    slug: "erectile-dysfunction",
    treatmentLabel: "Erectile Dysfunction Care",
    shortLabel: "ED Care",
    heroImage: "/images/hero/hero-1.jpg",
    heroImageAlt: "Private consultation between a patient and healthcare provider",
    description: "A discreet, informational assessment to help you explore ED care options with a licensed provider.",
    questions: [
      AGE_Q,
      {
        id: "primary_concern",
        type: "single",
        title: "What is your primary concern?",
        required: true,
        options: [
          { value: "difficulty", label: "Difficulty achieving or maintaining erections" },
          { value: "consistency", label: "Inconsistent results" },
          { value: "confidence", label: "Confidence-related concerns" },
          { value: "general", label: "General sexual health" },
        ],
      },
      {
        id: "duration",
        type: "single",
        title: "How long has this been a concern?",
        required: true,
        options: [
          { value: "under-3m", label: "Less than 3 months" },
          { value: "3-6m", label: "3–6 months" },
          { value: "6-12m", label: "6–12 months" },
          { value: "over-1y", label: "Over a year" },
        ],
      },
      {
        id: "prior_treatment",
        type: "single",
        title: "Have you previously tried any treatment for this concern?",
        required: true,
        signal: "experience",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "prior_provider",
        type: "single",
        title: "Have you discussed this with a licensed provider before?",
        required: true,
        signal: "experience",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "privacy_pref",
        type: "single",
        title: "Do you have a preference for telehealth or in-person care for this concern?",
        required: true,
        options: [
          { value: "telehealth", label: "I prefer telehealth for privacy" },
          { value: "in-person", label: "I prefer in-person care" },
          { value: "either", label: "I am open to either" },
        ],
      },
      TIMELINE_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONTACT_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a confidential consultation.",
      readyDesc: "We can now connect you with clinics experienced in discreet, professional ED care.",
      researchingTitle: "Thanks for exploring your options.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with a licensed provider for a confidential consultation.",
    },
  },

  "medical-weight-loss": {
    slug: "medical-weight-loss",
    treatmentLabel: "Medical Weight Loss",
    shortLabel: "Weight Loss",
    heroImage: "/images/treatments/weight-1.jpg",
    heroImageAlt: "Clinician-guided weight management consultation",
    description: "An informational assessment to help you explore medically supervised weight loss options.",
    questions: [
      AGE_Q,
      {
        id: "goal",
        type: "single",
        title: "What is your primary weight-loss goal?",
        required: true,
        options: [
          { value: "lose-10", label: "Lose up to 10 lbs" },
          { value: "lose-25", label: "Lose 10–25 lbs" },
          { value: "lose-50", label: "Lose 25–50 lbs" },
          { value: "lose-50-plus", label: "Lose 50+ lbs" },
          { value: "maintain", label: "Maintain and optimize" },
        ],
      },
      {
        id: "previous_attempts",
        type: "single",
        title: "Have you tried medical or structured weight loss before?",
        required: true,
        signal: "experience",
        options: [
          { value: "yes-medical", label: "Yes, with medical support" },
          { value: "yes-self", label: "Yes, on my own" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "medication_interest",
        type: "single",
        title: "Are you interested in medication-assisted programs if a provider recommends one?",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "maybe", label: "Possibly" },
          { value: "no", label: "I prefer non-medication approaches" },
        ],
      },
      {
        id: "structured_program",
        type: "single",
        title: "Are you ready to follow a structured program with regular check-ins?",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "maybe", label: "Possibly" },
          { value: "no", label: "Not sure yet" },
        ],
      },
      TIMELINE_Q,
      CARE_FORMAT_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONTACT_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a medical weight loss consultation.",
      readyDesc: "We can now show clinics offering supervised weight loss programs matching your goals and preferences.",
      researchingTitle: "Thanks for exploring medical weight loss.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with clinics offering supervised programs.",
    },
  },

  "glp-1": {
    slug: "glp-1",
    treatmentLabel: "GLP-1 Programs",
    shortLabel: "GLP-1",
    heroImage: "/images/treatments/weight-2.jpg",
    heroImageAlt: "Health tracking and metabolic health consultation",
    description: "An informational assessment to help you explore GLP-1 medication programs with a licensed provider.",
    questions: [
      AGE_Q,
      {
        id: "interest",
        type: "single",
        title: "What is your interest level in GLP-1 care?",
        required: true,
        options: [
          { value: "very-interested", label: "Very interested" },
          { value: "exploring", label: "Exploring options" },
          { value: "curious", label: "Just curious" },
        ],
      },
      {
        id: "previous_use",
        type: "single",
        title: "Have you previously used a GLP-1 medication?",
        required: true,
        signal: "experience",
        options: [
          { value: "yes-current", label: "Yes, currently" },
          { value: "yes-past", label: "Yes, in the past" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "prior_provider",
        type: "single",
        title: "Have you discussed GLP-1 medications with a provider before?",
        required: true,
        signal: "experience",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "outcome",
        type: "single",
        title: "What outcome are you hoping for?",
        required: true,
        options: [
          { value: "weight-loss", label: "Weight loss" },
          { value: "metabolic", label: "Metabolic health" },
          { value: "both", label: "Both" },
        ],
      },
      {
        id: "labs_willingness",
        type: "single",
        title: "Are you willing to complete provider-requested lab work if recommended?",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "maybe", label: "Possibly" },
          { value: "no", label: "I'd prefer to discuss first" },
        ],
      },
      TIMELINE_Q,
      CARE_FORMAT_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONTACT_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a GLP-1 program consultation.",
      readyDesc: "We can connect you with clinics offering GLP-1 programs. A licensed provider determines whether medication is appropriate for you.",
      researchingTitle: "Thanks for exploring GLP-1 programs.",
      researchingDesc: "When you're ready, a licensed provider can determine if a GLP-1 program is appropriate for your health profile.",
    },
  },

  "peptide-therapy": {
    slug: "peptide-therapy",
    treatmentLabel: "Peptide Therapy",
    shortLabel: "Peptides",
    heroImage: "/images/marketplace/inject-3.jpg",
    heroImageAlt: "Clinical consultation in a wellness setting",
    description: "An informational assessment to help you explore peptide therapy with a knowledgeable provider.",
    questions: [
      AGE_Q,
      {
        id: "goal",
        type: "multi",
        title: "What are your goals?",
        required: true,
        options: [
          { value: "recovery", label: "Recovery" },
          { value: "performance", label: "Performance" },
          { value: "longevity", label: "Longevity" },
          { value: "sleep", label: "Sleep" },
          { value: "wellness", label: "General wellness" },
        ],
      },
      {
        id: "previous_use",
        type: "single",
        title: "Have you previously used peptide therapy?",
        required: true,
        signal: "experience",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "current_provider",
        type: "single",
        title: "Do you currently have a provider who discusses peptides with you?",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "understanding",
        type: "single",
        title: "Do you understand that peptide therapy is an evolving area of medicine?",
        required: true,
        options: [
          { value: "yes", label: "Yes, I understand" },
          { value: "learning", label: "I'm still learning" },
        ],
      },
      TIMELINE_Q,
      CARE_FORMAT_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONTACT_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a peptide therapy consultation.",
      readyDesc: "We can connect you with providers experienced in peptide protocols who can discuss evidence, risks, and monitoring.",
      researchingTitle: "Thanks for exploring peptide therapy.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with a provider who can discuss this evolving area responsibly.",
    },
  },

  "hair-restoration": {
    slug: "hair-restoration",
    treatmentLabel: "Hair Restoration",
    shortLabel: "Hair",
    heroImage: "/images/treatments/hair-1.jpg",
    heroImageAlt: "Hair and scalp health consultation",
    description: "An informational assessment to help you explore hair restoration options with a licensed provider.",
    questions: [
      AGE_Q,
      {
        id: "concern",
        type: "single",
        title: "What is your primary hair concern?",
        required: true,
        options: [
          { value: "thinning", label: "Thinning hair" },
          { value: "receding", label: "Receding hairline" },
          { value: "patchy", label: "Patchy areas" },
          { value: "general", label: "General hair health" },
        ],
      },
      {
        id: "duration",
        type: "single",
        title: "How long has this been a concern?",
        required: true,
        options: [
          { value: "under-6m", label: "Less than 6 months" },
          { value: "6-12m", label: "6–12 months" },
          { value: "1-3y", label: "1–3 years" },
          { value: "over-3y", label: "Over 3 years" },
        ],
      },
      {
        id: "previous_treatments",
        type: "multi",
        title: "Have you tried any hair restoration approaches before?",
        desc: "Select all that apply.",
        required: false,
        signal: "experience",
        options: [
          { value: "topical", label: "Topical treatments (minoxidil)" },
          { value: "oral", label: "Oral medications" },
          { value: "procedural", label: "Procedural (transplant, PRP)" },
          { value: "none", label: "None" },
        ],
      },
      {
        id: "approach_interest",
        type: "single",
        title: "What type of approach interests you most?",
        required: true,
        options: [
          { value: "medical", label: "Medical (medication-based)" },
          { value: "topical", label: "Topical" },
          { value: "procedural", label: "Procedural" },
          { value: "guidance", label: "General guidance first" },
        ],
      },
      TIMELINE_Q,
      CARE_FORMAT_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONTACT_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a hair restoration consultation.",
      readyDesc: "We can connect you with clinics offering medical, topical, and procedural hair restoration options.",
      researchingTitle: "Thanks for exploring hair restoration.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with a provider to discuss your options.",
    },
  },

  "hormone-optimization": {
    slug: "hormone-optimization",
    treatmentLabel: "Hormone Optimization",
    shortLabel: "Hormones",
    heroImage: "/images/hero/hero-3.jpg",
    heroImageAlt: "Patient consultation about hormone health",
    description: "An informational assessment to help you explore hormone optimization with a knowledgeable provider.",
    questions: [
      AGE_Q,
      {
        id: "goal",
        type: "multi",
        title: "What are your primary goals?",
        required: true,
        options: [
          { value: "energy", label: "Energy" },
          { value: "mood", label: "Mood" },
          { value: "body-comp", label: "Body composition" },
          { value: "sleep", label: "Sleep" },
          { value: "libido", label: "Libido" },
          { value: "general", label: "General wellness" },
        ],
      },
      {
        id: "existing_labs",
        type: "single",
        title: "Do you have existing hormone lab work?",
        required: true,
        signal: "experience",
        options: [
          { value: "yes-recent", label: "Yes, within 6 months" },
          { value: "yes-older", label: "Yes, over 6 months ago" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "current_meds",
        type: "single",
        title: "Are you currently on any hormone-related medications?",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "prior_treatment",
        type: "single",
        title: "Have you previously tried hormone-related treatment?",
        required: true,
        signal: "experience",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      TIMELINE_Q,
      CARE_FORMAT_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONTACT_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a hormone optimization consultation.",
      readyDesc: "We can connect you with providers who offer comprehensive hormone evaluation and individualized protocols.",
      researchingTitle: "Thanks for exploring hormone optimization.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with a provider for a comprehensive evaluation.",
    },
  },

  "longevity-medicine": {
    slug: "longevity-medicine",
    treatmentLabel: "Longevity & Preventive Health",
    shortLabel: "Longevity",
    heroImage: "/images/hero/hero-6.jpg",
    heroImageAlt: "Healthy mature man focused on preventive health",
    description: "An informational assessment to help you explore longevity and preventive health options.",
    questions: [
      AGE_Q,
      {
        id: "goals",
        type: "multi",
        title: "What are your primary health goals?",
        required: true,
        options: [
          { value: "healthspan", label: "Healthspan" },
          { value: "biomarkers", label: "Biomarker optimization" },
          { value: "prevention", label: "Preventive screening" },
          { value: "performance", label: "Performance" },
          { value: "longevity", label: "Longevity" },
        ],
      },
      {
        id: "screenings",
        type: "single",
        title: "Are you up to date on routine preventive screenings?",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "partial", label: "Partially" },
          { value: "no", label: "No" },
          { value: "not-sure", label: "Not sure" },
        ],
      },
      {
        id: "biomarker_interest",
        type: "single",
        title: "Are you interested in advanced biomarker testing?",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "maybe", label: "Possibly" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "lifestyle",
        type: "single",
        title: "How would you describe your current lifestyle?",
        required: true,
        options: [
          { value: "active", label: "Very active" },
          { value: "moderate", label: "Moderately active" },
          { value: "improving", label: "Working on it" },
          { value: "sedentary", label: "Mostly sedentary" },
        ],
      },
      TIMELINE_Q,
      CARE_FORMAT_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONTACT_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a longevity consultation.",
      readyDesc: "We can connect you with providers offering comprehensive longevity assessments and personalized prevention plans.",
      researchingTitle: "Thanks for exploring longevity medicine.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with a provider for a comprehensive assessment.",
    },
  },
};

/** List of all assessment slugs for iteration. */
export const ASSESSMENT_SLUGS = Object.keys(ASSESSMENTS);

/** Get an assessment config by slug. */
export function getAssessment(slug: string): AssessmentConfig | undefined {
  return ASSESSMENTS[slug];
}
