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
  | "single" // single-choice (auto-advance)
  | "multi" // multi-select (Continue button)
  | "text" // short text
  | "contact-name" // first + last name
  | "contact-email" // email + phone
  | "contact-location" // zip + state
  | "consent"; // consent checkboxes

export type Question = {
  id: string;
  type: QuestionType;
  title: string;
  desc?: string;
  required?: boolean;
  options?: { value: string; label: string; desc?: string; icon?: string }[];
  placeholder?: string;
  /** which stage this question belongs to */
  stage?: string;
  /** contextual "why we ask" microcopy for the left panel */
  whyWeAsk?: string;
  /** scoring signal weight for readiness classification */
  signal?: "timeline" | "selfpay" | "experience" | "consent" | "contact";
  /** conditional: only show if this predicate matches answers */
  showIf?: (answers: Record<string, string | string[] | Record<string, unknown>>) => boolean;
};

export type Stage = {
  id: string;
  label: string;
};

export type AssessmentConfig = {
  slug: string;
  treatmentLabel: string;
  shortLabel: string;
  heroImage: string;
  heroImageAlt: string;
  description: string;
  /** intro screen copy */
  intro: {
    eyebrow: string;
    headline: string;
    supporting: string;
    estimatedTime: string;
    whatHappensNext: string;
  };
  /** context panel microcopy */
  context: {
    privacyNote: string;
    stageDescriptions: Record<string, string>;
  };
  stages: Stage[];
  questions: Question[];
  /** result messaging templates */
  results: {
    readyTitle: string;
    readyDesc: string;
    researchingTitle: string;
    researchingDesc: string;
    insuranceTitle: string;
    insuranceDesc: string;
  };
};

/* ── Shared stages ───────────────────────────────────────────── */
const STAGES: Stage[] = [
  { id: "info", label: "Your Information" },
  { id: "goals", label: "Your Goals" },
  { id: "experience", label: "Your Experience" },
  { id: "preferences", label: "Care Preferences" },
  { id: "timing", label: "Timing & Readiness" },
  { id: "review", label: "Review" },
];

/* ── Shared question blocks ──────────────────────────────────── */

const TIMELINE_Q: Question = {
  id: "timeline",
  type: "single",
  stage: "timing",
  title: "How soon would you like to speak with a provider?",
  desc: "This helps us show clinics that match your timing.",
  whyWeAsk: "Understanding your timeline helps us prioritize clinics with matching availability and avoid showing options that don't fit your schedule.",
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
  stage: "preferences",
  title: "Which type of care would you prefer?",
  whyWeAsk: "Your care format preference helps us filter clinics by whether they offer telehealth, in-person visits, or both.",
  required: true,
  options: [
    { value: "telehealth", label: "Telehealth (remote)" },
    { value: "in-person", label: "In-person care" },
    { value: "either", label: "Either — open to both" },
  ],
};

const TRAVEL_Q: Question = {
  id: "travel_distance",
  type: "single",
  stage: "preferences",
  title: "How far would you be willing to travel for in-person care?",
  whyWeAsk: "This helps us surface clinics within a realistic distance of your location.",
  required: false,
  showIf: (a) => (a["care_format"] as string) !== "telehealth",
  options: [
    { value: "under-10", label: "Less than 10 miles" },
    { value: "10-25", label: "10–25 miles" },
    { value: "25-50", label: "25–50 miles" },
    { value: "telehealth-only", label: "Telehealth only" },
  ],
};

const SELFPAY_Q: Question = {
  id: "self_pay",
  type: "single",
  stage: "timing",
  title: "Are you open to discussing self-pay care?",
  desc: "Many specialized men's-health clinics use self-pay models. This helps us show options that match your preferences.",
  whyWeAsk: "Many specialized men's-health clinics use self-pay models. This helps us avoid showing options that may not match your preferences.",
  required: true,
  signal: "selfpay",
  options: [
    { value: "yes", label: "Yes" },
    { value: "possibly", label: "Possibly, depending on cost" },
    { value: "insurance-only", label: "Insurance-covered options only" },
    { value: "not-sure", label: "I need more information" },
  ],
};

const BUDGET_Q: Question = {
  id: "budget",
  type: "single",
  stage: "timing",
  title: "Which monthly price range would you be comfortable discussing?",
  desc: "Optional. This helps surface clinics that fit your preferences.",
  whyWeAsk: "This helps us surface clinics that fit your preferences. It does not affect medical suitability.",
  required: false,
  options: [
    { value: "under-100", label: "Under $100" },
    { value: "100-199", label: "$100–$199" },
    { value: "200-299", label: "$200–$299" },
    { value: "300-plus", label: "$300+" },
    { value: "not-sure", label: "I need pricing information first" },
  ],
};

const CONTACT_NAME_Q: Question = {
  id: "contact_name",
  type: "contact-name",
  stage: "info",
  title: "Let's save your assessment",
  desc: "We'll use this information to save your progress, prepare your results, and help connect you with relevant clinics. You are not required to book treatment.",
  whyWeAsk: "We collect your name to personalize your experience and save your assessment progress securely.",
  required: true,
  signal: "contact",
};

const CONTACT_EMAIL_Q: Question = {
  id: "contact_email",
  type: "contact-email",
  stage: "info",
  title: "How can we reach you?",
  desc: "We use this to share your results and support your care navigation. We do not share your information without consent.",
  whyWeAsk: "Your email and phone allow us to send your personalized results and connect you with clinics if you choose to proceed.",
  required: true,
  signal: "contact",
};

const CONTACT_LOCATION_Q: Question = {
  id: "contact_location",
  type: "contact-location",
  stage: "info",
  title: "Where are you located?",
  desc: "Your location helps us surface clinics in your area or licensed for telehealth in your state.",
  whyWeAsk: "Your ZIP code and state help us match you with nearby clinics and verify telehealth licensure in your state.",
  required: true,
  signal: "contact",
};

const CONSENT_Q: Question = {
  id: "consent",
  type: "consent",
  stage: "review",
  title: "Review and consent",
  desc: "Please review your responses and provide consent to complete your assessment.",
  whyWeAsk: "Consent ensures you understand how your information will be used and agree to be contacted about your consultation request.",
  required: true,
  signal: "consent",
};

const AGE_Q: Question = {
  id: "age_range",
  type: "single",
  stage: "goals",
  title: "What is your age range?",
  whyWeAsk: "Age helps providers understand general health context. It does not determine treatment eligibility.",
  required: true,
  options: [
    { value: "18-29", label: "18–29" },
    { value: "30-39", label: "30–39" },
    { value: "40-49", label: "40–49" },
    { value: "50-59", label: "50–59" },
    { value: "60-plus", label: "60+" },
  ],
};


/* ── Helper to build assessment configs with shared defaults ─── */
function buildConfig(
  base: Omit<AssessmentConfig, "stages" | "intro" | "context">,
  intro: AssessmentConfig["intro"],
  contextNotes?: Partial<AssessmentConfig["context"]["stageDescriptions"]>,
): AssessmentConfig {
  return {
    ...base,
    stages: STAGES,
    intro,
    context: {
      privacyNote: "Your responses are stored securely. Novalyte AI does not diagnose medical conditions or determine medical eligibility. A licensed provider determines whether any treatment is appropriate.",
      stageDescriptions: {
        info: "We collect basic contact information to save your progress and connect you with relevant clinics.",
        goals: "Understanding your goals helps us personalize your results and educational recommendations.",
        experience: "Your prior experience helps us route you to the right level of care and prepare relevant questions for your provider.",
        preferences: "Care preferences help us filter clinics by format, location, and specialty.",
        timing: "Timing and financial preferences help us match you with clinics that fit your schedule and budget.",
        review: "Review your responses and provide consent to complete your assessment.",
        ...contextNotes,
      },
    },
  };
}

/* ── Treatment-specific assessments ──────────────────────────── */

export const ASSESSMENTS: Record<string, AssessmentConfig> = {
  "testosterone-replacement-therapy": buildConfig({
    slug: "testosterone-replacement-therapy",
    treatmentLabel: "Testosterone Replacement Therapy",
    shortLabel: "TRT",
    heroImage: "/images/treatments/trt-1.jpg",
    heroImageAlt: "Clinician reviewing laboratory blood test results with a male patient",
    description: "An informational assessment to help you explore whether TRT is worth discussing with a licensed provider.",
    questions: [
      CONTACT_NAME_Q,
      CONTACT_EMAIL_Q,
      CONTACT_LOCATION_Q,
      AGE_Q,
      {
        id: "goal",
        type: "multi",
        stage: "goals",
        title: "What would you most like to improve?",
        desc: "Choose the area that matters most right now. You can select more than one.",
        whyWeAsk: "Your goals help us personalize educational content and match you with clinics that specialize in your areas of interest.",
        required: true,
        options: [
          { value: "energy", label: "Energy and motivation" },
          { value: "sexual", label: "Sexual health" },
          { value: "strength", label: "Strength and muscle development" },
          { value: "mood", label: "Mood and focus" },
          { value: "recovery", label: "Recovery" },
          { value: "general-hormone", label: "General hormone health" },
        ],
      },
      {
        id: "duration",
        type: "single",
        stage: "goals",
        title: "How long have you noticed these concerns?",
        whyWeAsk: "Duration helps providers understand the context of your concerns. It does not determine eligibility.",
        required: true,
        options: [
          { value: "under-3m", label: "Less than 3 months" },
          { value: "3-6m", label: "3–6 months" },
          { value: "6-12m", label: "6–12 months" },
          { value: "over-1y", label: "More than 1 year" },
        ],
      },
      {
        id: "recent_labs",
        type: "single",
        stage: "experience",
        title: "Have you completed hormone or testosterone lab work recently?",
        whyWeAsk: "Prior lab work helps a provider understand your starting point. If you have recent labs, a provider can review them during your consultation.",
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
        stage: "experience",
        title: "Have you discussed these concerns with a licensed provider?",
        whyWeAsk: "Knowing whether you've discussed this before helps us prepare the right context for your consultation.",
        required: true,
        signal: "experience",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "scheduled", label: "I have an appointment scheduled" },
        ],
      },
      {
        id: "current_use",
        type: "single",
        stage: "experience",
        title: "Have you previously used testosterone therapy?",
        whyWeAsk: "Prior treatment experience helps a provider understand your history and plan appropriately.",
        required: true,
        options: [
          { value: "yes-current", label: "Yes, currently" },
          { value: "yes-past", label: "Yes, previously" },
          { value: "no", label: "No" },
        ],
      },
      CARE_FORMAT_Q,
      TRAVEL_Q,
      TIMELINE_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You appear ready to explore a TRT consultation.",
      readyDesc: "Based on your responses, we can now show clinics that match your treatment interest, location, timing, and care preferences.",
      researchingTitle: "Thanks for exploring — take your time.",
      researchingDesc: "When you're ready to speak with a provider, Novalyte AI can connect you with clinics matching your preferences.",
      insuranceTitle: "Coverage and pricing vary by clinic.",
      insuranceDesc: "Review cost and insurance resources before deciding which care options fit your situation.",
    },
  }, {
    eyebrow: "PERSONALIZED MEN'S HEALTH ASSESSMENT",
    headline: "Let's understand what you're looking for",
    supporting: "Answer a few short questions about your goals, preferences, timeline, and consultation readiness. Your responses help Novalyte AI organize relevant educational resources and potential clinic matches.",
    estimatedTime: "Approximately 2–3 minutes",
    whatHappensNext: "You'll receive a personalized summary, relevant educational guidance, and potential clinic matches based on your location and preferences.",
  }, {
    goals: "Understanding your energy, performance, and hormone goals helps us personalize your TRT educational content and clinic matches.",
    experience: "Your lab history and prior treatment experience help us route you to providers who can build on your existing context.",
  }),

  "erectile-dysfunction": buildConfig({
    slug: "erectile-dysfunction",
    treatmentLabel: "Erectile Dysfunction Care",
    shortLabel: "ED Care",
    heroImage: "/images/patients/consultation-v2.png",
    heroImageAlt: "Private, discreet consultation between a patient and healthcare provider",
    description: "A discreet, informational assessment to help you explore ED care options with a licensed provider.",
    questions: [
      CONTACT_NAME_Q,
      CONTACT_EMAIL_Q,
      CONTACT_LOCATION_Q,
      AGE_Q,
      {
        id: "primary_concern",
        type: "single",
        stage: "goals",
        title: "What is your primary concern?",
        whyWeAsk: "Understanding your primary concern helps us route you to the right type of provider and educational resources.",
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
        stage: "goals",
        title: "How long has this been a concern?",
        whyWeAsk: "Duration helps providers understand the context. It does not determine eligibility.",
        required: true,
        options: [
          { value: "under-3m", label: "Less than 3 months" },
          { value: "3-6m", label: "3–6 months" },
          { value: "6-12m", label: "6–12 months" },
          { value: "over-1y", label: "More than 1 year" },
        ],
      },
      {
        id: "prior_treatment",
        type: "single",
        stage: "experience",
        title: "Have you previously tried any treatment for this concern?",
        whyWeAsk: "Prior treatment experience helps a provider understand what has or hasn't worked for you.",
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
        stage: "experience",
        title: "Have you discussed this with a licensed provider before?",
        whyWeAsk: "Knowing whether this is a new conversation helps us prepare the right context.",
        required: true,
        signal: "experience",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      CARE_FORMAT_Q,
      TRAVEL_Q,
      TIMELINE_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a confidential consultation.",
      readyDesc: "We can now connect you with clinics experienced in discreet, professional ED care.",
      researchingTitle: "Thanks for exploring your options.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with a licensed provider for a confidential consultation.",
      insuranceTitle: "Coverage and pricing vary by clinic.",
      insuranceDesc: "Review cost and insurance resources before deciding which care options fit your situation.",
    },
  }, {
    eyebrow: "PERSONALIZED MEN'S HEALTH ASSESSMENT",
    headline: "Let's understand what you're looking for",
    supporting: "Answer a few short questions about your goals, preferences, timeline, and consultation readiness. Your responses help Novalyte AI organize relevant educational resources and potential clinic matches.",
    estimatedTime: "Approximately 2–3 minutes",
    whatHappensNext: "You'll receive a personalized summary, relevant educational guidance, and potential clinic matches based on your location and preferences.",
  }, {
    goals: "Understanding your concerns helps us route you to providers who offer discreet, confidential care.",
    preferences: "Your privacy preferences help us match you with clinics that offer telehealth or private in-person care.",
  }),

  "medical-weight-loss": buildConfig({
    slug: "medical-weight-loss",
    treatmentLabel: "Medical Weight Loss",
    shortLabel: "Weight Loss",
    heroImage: "/images/treatments/weight-1.jpg",
    heroImageAlt: "Clinician-guided weight management consultation with a patient",
    description: "An informational assessment to help you explore medically supervised weight loss options.",
    questions: [
      CONTACT_NAME_Q,
      CONTACT_EMAIL_Q,
      CONTACT_LOCATION_Q,
      AGE_Q,
      {
        id: "goal",
        type: "single",
        stage: "goals",
        title: "What is your primary weight-loss goal?",
        whyWeAsk: "Your goal helps us match you with programs designed for your specific targets.",
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
        stage: "experience",
        title: "Have you tried medical or structured weight loss before?",
        whyWeAsk: "Prior experience helps a provider understand what approaches you've already tried.",
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
        stage: "experience",
        title: "Are you interested in medication-assisted programs if a provider recommends one?",
        whyWeAsk: "This helps us match you with clinics that offer the type of program you're open to.",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "maybe", label: "Possibly" },
          { value: "no", label: "I prefer non-medication approaches" },
        ],
      },
      CARE_FORMAT_Q,
      TRAVEL_Q,
      TIMELINE_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a medical weight loss consultation.",
      readyDesc: "We can now show clinics offering supervised weight loss programs matching your goals and preferences.",
      researchingTitle: "Thanks for exploring medical weight loss.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with clinics offering supervised programs.",
      insuranceTitle: "Coverage and pricing vary by clinic.",
      insuranceDesc: "Review cost and insurance resources before deciding which care options fit your situation.",
    },
  }, {
    eyebrow: "PERSONALIZED MEN'S HEALTH ASSESSMENT",
    headline: "Let's understand what you're looking for",
    supporting: "Answer a few short questions about your goals, preferences, timeline, and consultation readiness. Your responses help Novalyte AI organize relevant educational resources and potential clinic matches.",
    estimatedTime: "Approximately 2–3 minutes",
    whatHappensNext: "You'll receive a personalized summary, relevant educational guidance, and potential clinic matches based on your location and preferences.",
  }),

  "glp-1": buildConfig({
    slug: "glp-1",
    treatmentLabel: "GLP-1 Programs",
    shortLabel: "GLP-1",
    heroImage: "/images/treatments/weight-2.jpg",
    heroImageAlt: "Clinician reviewing a structured treatment program with a patient",
    description: "An informational assessment to help you explore GLP-1 medication programs with a licensed provider.",
    questions: [
      CONTACT_NAME_Q,
      CONTACT_EMAIL_Q,
      CONTACT_LOCATION_Q,
      AGE_Q,
      {
        id: "interest",
        type: "single",
        stage: "goals",
        title: "What is your interest level in GLP-1 care?",
        whyWeAsk: "Your interest level helps us tailor educational content and match you with appropriate providers.",
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
        stage: "experience",
        title: "Have you previously used a GLP-1 medication?",
        whyWeAsk: "Prior experience helps a provider understand your history with this class of medication.",
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
        stage: "experience",
        title: "Have you discussed GLP-1 medications with a provider before?",
        whyWeAsk: "Knowing whether you've discussed this before helps us prepare the right context for your consultation.",
        required: true,
        signal: "experience",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "labs_willingness",
        type: "single",
        stage: "experience",
        title: "Are you willing to complete provider-requested lab work if recommended?",
        whyWeAsk: "GLP-1 programs typically require lab monitoring. Understanding your willingness helps us match you with programs that fit.",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "maybe", label: "Possibly" },
          { value: "no", label: "I'd prefer to discuss first" },
        ],
      },
      CARE_FORMAT_Q,
      TRAVEL_Q,
      TIMELINE_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a GLP-1 program consultation.",
      readyDesc: "We can connect you with clinics offering GLP-1 programs. A licensed provider determines whether medication is appropriate for you.",
      researchingTitle: "Thanks for exploring GLP-1 programs.",
      researchingDesc: "When you're ready, a licensed provider can determine if a GLP-1 program is appropriate for your health profile.",
      insuranceTitle: "Coverage and pricing vary by clinic.",
      insuranceDesc: "Review cost and insurance resources before deciding which care options fit your situation.",
    },
  }, {
    eyebrow: "PERSONALIZED MEN'S HEALTH ASSESSMENT",
    headline: "Let's understand what you're looking for",
    supporting: "Answer a few short questions about your goals, preferences, timeline, and consultation readiness. Your responses help Novalyte AI organize relevant educational resources and potential clinic matches.",
    estimatedTime: "Approximately 2–3 minutes",
    whatHappensNext: "You'll receive a personalized summary, relevant educational guidance, and potential clinic matches based on your location and preferences.",
  }),

  "peptide-therapy": buildConfig({
    slug: "peptide-therapy",
    treatmentLabel: "Peptide Therapy",
    shortLabel: "Peptides",
    heroImage: "/images/marketplace/inject-3.jpg",
    heroImageAlt: "Clinical consultation in a modern wellness setting",
    description: "An informational assessment to help you explore peptide therapy with a knowledgeable provider.",
    questions: [
      CONTACT_NAME_Q,
      CONTACT_EMAIL_Q,
      CONTACT_LOCATION_Q,
      AGE_Q,
      {
        id: "goal",
        type: "multi",
        stage: "goals",
        title: "What are your goals?",
        desc: "Select all that apply.",
        whyWeAsk: "Your goals help us match you with providers who have experience in your areas of interest.",
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
        stage: "experience",
        title: "Have you previously used peptide therapy?",
        whyWeAsk: "Prior experience helps a provider understand your history and plan appropriately.",
        required: true,
        signal: "experience",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "understanding",
        type: "single",
        stage: "experience",
        title: "Do you understand that peptide therapy is an evolving area of medicine?",
        whyWeAsk: "Setting expectations about this evolving field helps ensure you can have an informed conversation with a provider.",
        required: true,
        options: [
          { value: "yes", label: "Yes, I understand" },
          { value: "learning", label: "I'm still learning" },
        ],
      },
      CARE_FORMAT_Q,
      TRAVEL_Q,
      TIMELINE_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a peptide therapy consultation.",
      readyDesc: "We can connect you with providers experienced in peptide protocols who can discuss evidence, risks, and monitoring.",
      researchingTitle: "Thanks for exploring peptide therapy.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with a provider who can discuss this evolving area responsibly.",
      insuranceTitle: "Coverage and pricing vary by clinic.",
      insuranceDesc: "Review cost and insurance resources before deciding which care options fit your situation.",
    },
  }, {
    eyebrow: "PERSONALIZED MEN'S HEALTH ASSESSMENT",
    headline: "Let's understand what you're looking for",
    supporting: "Answer a few short questions about your goals, preferences, timeline, and consultation readiness. Your responses help Novalyte AI organize relevant educational resources and potential clinic matches.",
    estimatedTime: "Approximately 2–3 minutes",
    whatHappensNext: "You'll receive a personalized summary, relevant educational guidance, and potential clinic matches based on your location and preferences.",
  }),

  "hair-restoration": buildConfig({
    slug: "hair-restoration",
    treatmentLabel: "Hair Restoration",
    shortLabel: "Hair",
    heroImage: "/images/treatments/hair-1.jpg",
    heroImageAlt: "Hair and scalp health consultation with a clinician",
    description: "An informational assessment to help you explore hair restoration options with a licensed provider.",
    questions: [
      CONTACT_NAME_Q,
      CONTACT_EMAIL_Q,
      CONTACT_LOCATION_Q,
      AGE_Q,
      {
        id: "concern",
        type: "single",
        stage: "goals",
        title: "What is your primary hair concern?",
        whyWeAsk: "Understanding your concern helps us match you with the right type of hair restoration provider.",
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
        stage: "goals",
        title: "How long has this been a concern?",
        whyWeAsk: "Duration helps providers understand the stage and potential treatment options.",
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
        stage: "experience",
        title: "Have you tried any hair restoration approaches before?",
        desc: "Select all that apply.",
        whyWeAsk: "Prior treatments help a provider understand what has or hasn't worked for you.",
        required: false,
        signal: "experience",
        options: [
          { value: "topical", label: "Topical treatments (minoxidil)" },
          { value: "oral", label: "Oral medications" },
          { value: "procedural", label: "Procedural (transplant, PRP)" },
          { value: "none", label: "None" },
        ],
      },
      CARE_FORMAT_Q,
      TRAVEL_Q,
      TIMELINE_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a hair restoration consultation.",
      readyDesc: "We can connect you with clinics offering medical, topical, and procedural hair restoration options.",
      researchingTitle: "Thanks for exploring hair restoration.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with a provider to discuss your options.",
      insuranceTitle: "Coverage and pricing vary by clinic.",
      insuranceDesc: "Most hair restoration treatments are considered cosmetic. Review costs with the clinic during your consultation.",
    },
  }, {
    eyebrow: "PERSONALIZED MEN'S HEALTH ASSESSMENT",
    headline: "Let's understand what you're looking for",
    supporting: "Answer a few short questions about your goals, preferences, timeline, and consultation readiness. Your responses help Novalyte AI organize relevant educational resources and potential clinic matches.",
    estimatedTime: "Approximately 2–3 minutes",
    whatHappensNext: "You'll receive a personalized summary, relevant educational guidance, and potential clinic matches based on your location and preferences.",
  }),

  "hormone-optimization": buildConfig({
    slug: "hormone-optimization",
    treatmentLabel: "Hormone Optimization",
    shortLabel: "Hormones",
    heroImage: "/images/treatments/trt-2.jpg",
    heroImageAlt: "Clinician reviewing biomarker and hormone data with a patient",
    description: "An informational assessment to help you explore hormone optimization with a knowledgeable provider.",
    questions: [
      CONTACT_NAME_Q,
      CONTACT_EMAIL_Q,
      CONTACT_LOCATION_Q,
      AGE_Q,
      {
        id: "goal",
        type: "multi",
        stage: "goals",
        title: "What are your primary goals?",
        desc: "Select all that apply.",
        whyWeAsk: "Your goals help us match you with providers who offer comprehensive hormone evaluation.",
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
        stage: "experience",
        title: "Do you have existing hormone lab work?",
        whyWeAsk: "Prior lab work helps a provider understand your starting point.",
        required: true,
        signal: "experience",
        options: [
          { value: "yes-recent", label: "Yes, within 6 months" },
          { value: "yes-older", label: "Yes, over 6 months ago" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "prior_treatment",
        type: "single",
        stage: "experience",
        title: "Have you previously tried hormone-related treatment?",
        whyWeAsk: "Prior treatment experience helps a provider understand your history.",
        required: true,
        signal: "experience",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      CARE_FORMAT_Q,
      TRAVEL_Q,
      TIMELINE_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a hormone optimization consultation.",
      readyDesc: "We can connect you with providers who offer comprehensive hormone evaluation and individualized protocols.",
      researchingTitle: "Thanks for exploring hormone optimization.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with a provider for a comprehensive evaluation.",
      insuranceTitle: "Coverage and pricing vary by clinic.",
      insuranceDesc: "Review cost and insurance resources before deciding which care options fit your situation.",
    },
  }, {
    eyebrow: "PERSONALIZED MEN'S HEALTH ASSESSMENT",
    headline: "Let's understand what you're looking for",
    supporting: "Answer a few short questions about your goals, preferences, timeline, and consultation readiness. Your responses help Novalyte AI organize relevant educational resources and potential clinic matches.",
    estimatedTime: "Approximately 2–3 minutes",
    whatHappensNext: "You'll receive a personalized summary, relevant educational guidance, and potential clinic matches based on your location and preferences.",
  }),

  "longevity-medicine": buildConfig({
    slug: "longevity-medicine",
    treatmentLabel: "Longevity & Preventive Health",
    shortLabel: "Longevity",
    heroImage: "/images/treatments/preventive-3.jpg",
    heroImageAlt: "Healthy mature man focused on preventive health and longevity",
    description: "An informational assessment to help you explore longevity and preventive health options.",
    questions: [
      CONTACT_NAME_Q,
      CONTACT_EMAIL_Q,
      CONTACT_LOCATION_Q,
      AGE_Q,
      {
        id: "goals",
        type: "multi",
        stage: "goals",
        title: "What are your primary health goals?",
        desc: "Select all that apply.",
        whyWeAsk: "Your goals help us match you with providers who focus on your areas of interest.",
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
        stage: "experience",
        title: "Are you up to date on routine preventive screenings?",
        whyWeAsk: "Screening history helps a provider understand your preventive care baseline.",
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
        stage: "experience",
        title: "Are you interested in advanced biomarker testing?",
        whyWeAsk: "Interest in advanced testing helps us match you with providers who offer comprehensive diagnostics.",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "maybe", label: "Possibly" },
          { value: "no", label: "No" },
        ],
      },
      CARE_FORMAT_Q,
      TRAVEL_Q,
      TIMELINE_Q,
      SELFPAY_Q,
      BUDGET_Q,
      CONSENT_Q,
    ],
    results: {
      readyTitle: "You're ready to explore a longevity consultation.",
      readyDesc: "We can connect you with providers offering comprehensive longevity assessments and personalized prevention plans.",
      researchingTitle: "Thanks for exploring longevity medicine.",
      researchingDesc: "When you're ready, Novalyte AI can connect you with a provider for a comprehensive assessment.",
      insuranceTitle: "Coverage and pricing vary by clinic.",
      insuranceDesc: "Advanced testing is often self-pay. Review costs with the clinic during your consultation.",
    },
  }, {
    eyebrow: "PERSONALIZED MEN'S HEALTH ASSESSMENT",
    headline: "Let's understand what you're looking for",
    supporting: "Answer a few short questions about your goals, preferences, timeline, and consultation readiness. Your responses help Novalyte AI organize relevant educational resources and potential clinic matches.",
    estimatedTime: "Approximately 2–3 minutes",
    whatHappensNext: "You'll receive a personalized summary, relevant educational guidance, and potential clinic matches based on your location and preferences.",
  }),
};

/** List of all assessment slugs for iteration. */
export const ASSESSMENT_SLUGS = Object.keys(ASSESSMENTS);

/** Get an assessment config by slug. */
export function getAssessment(slug: string): AssessmentConfig | undefined {
  return ASSESSMENTS[slug];
}
