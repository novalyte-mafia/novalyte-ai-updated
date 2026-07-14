import { TREATMENT_VERTICALS } from "@/lib/constants";

export type TreatmentInfo = {
  slug: string;
  label: string;
  short: string;
  explanation: string;
  reasons: string[];
  providerType: string;
  questions: string[];
};

export const TREATMENT_INFO: Record<string, TreatmentInfo> = {
  "testosterone-replacement-therapy": {
    slug: "testosterone-replacement-therapy",
    label: "Testosterone Replacement Therapy",
    short: "TRT",
    explanation:
      "Testosterone replacement therapy (TRT) is an approach providers may consider when lab-confirmed low testosterone is accompanied by symptoms. Treatment, if appropriate, is monitored with follow-up labs.",
    reasons: ["Persistent fatigue", "Low libido", "Changes in mood", "Decreased muscle mass"],
    providerType: "Physician or Nurse Practitioner",
    questions: [
      "What do my lab results indicate?",
      "What are the potential benefits and risks for me?",
      "How will treatment be monitored?",
      "What lifestyle factors may support outcomes?",
    ],
  },
  "hormone-optimization": {
    slug: "hormone-optimization",
    label: "Hormone Optimization",
    short: "Hormones",
    explanation:
      "Hormone optimization refers to evaluating and, where clinically appropriate, adjusting hormone levels beyond testosterone. It typically involves comprehensive lab work and individualized protocols.",
    reasons: ["Persistent low energy", "Mood or sleep changes", "Difficulty with body composition", "General wellness goals"],
    providerType: "Physician or endocrinology-trained provider",
    questions: [
      "Which hormones are being evaluated?",
      "What does an optimized range mean for me?",
      "What monitoring is involved?",
    ],
  },
  "erectile-dysfunction": {
    slug: "erectile-dysfunction",
    label: "Erectile Dysfunction Care",
    short: "ED Care",
    explanation:
      "Erectile dysfunction care addresses persistent difficulty with erections. Providers evaluate underlying causes — which may be vascular, hormonal, or psychological — before recommending options.",
    reasons: ["Difficulty achieving or maintaining erections", "Reduced confidence", "Relationship concerns"],
    providerType: "Physician or Nurse Practitioner",
    questions: [
      "What might be contributing to my symptoms?",
      "What evaluation is recommended?",
      "What options might be appropriate for me?",
    ],
  },
  "medical-weight-loss": {
    slug: "medical-weight-loss",
    label: "Medical Weight Loss",
    short: "Weight Loss",
    explanation:
      "Medical weight loss combines nutrition guidance, behavioral support, activity recommendations, and — when clinically appropriate — medication, under provider supervision.",
    reasons: ["Difficulty losing weight with lifestyle alone", "Weight-related health concerns", "Desire for supervised approach"],
    providerType: "Physician, Nurse Practitioner, or Registered Nurse with dietitian support",
    questions: [
      "What does a supervised program include?",
      "Is medication an option for me?",
      "How is progress monitored?",
    ],
  },
  "glp-1": {
    slug: "glp-1",
    label: "GLP-1 Programs",
    short: "GLP-1",
    explanation:
      "GLP-1 receptor agonists are a class of medications some providers consider within a broader medical weight loss program, based on individual health factors and ongoing monitoring.",
    reasons: ["BMI in a qualifying range", "Weight-related metabolic concerns", "Need for adjunctive support"],
    providerType: "Physician or Nurse Practitioner",
    questions: [
      "Am I a candidate based on my health history?",
      "What are the benefits and risks?",
      "What monitoring is required?",
    ],
  },
  "peptide-therapy": {
    slug: "peptide-therapy",
    label: "Peptide Therapy",
    short: "Peptides",
    explanation:
      "Peptide therapy is an emerging area using specific peptide compounds. Because the field is evolving, patients should seek providers who ground recommendations in evidence and monitor outcomes.",
    reasons: ["Recovery goals", "Interest in emerging protocols", "General wellness"],
    providerType: "Physician with experience in peptide protocols",
    questions: [
      "What evidence supports this approach?",
      "How will outcomes be monitored?",
      "What are the known risks?",
    ],
  },
  "hair-restoration": {
    slug: "hair-restoration",
    label: "Hair Restoration",
    short: "Hair",
    explanation:
      "Hair restoration for men may include medical, topical, and procedural options. A provider can evaluate the pattern and causes of hair loss before recommending a path.",
    reasons: ["Thinning hair", "Receding hairline", "Desire to slow progression"],
    providerType: "Physician or specialized provider",
    questions: [
      "What type of hair loss do I have?",
      "Which options are appropriate for me?",
      "What results are realistic?",
    ],
  },
  "sexual-wellness": {
    slug: "sexual-wellness",
    label: "Sexual Wellness",
    short: "Wellness",
    explanation:
      "Sexual wellness care addresses a range of concerns holistically, often combining evaluation, education, and treatment options tailored to the individual.",
    reasons: ["Sexual health concerns", "Desire for holistic evaluation", "Performance-related questions"],
    providerType: "Physician or Nurse Practitioner",
    questions: ["What evaluation is recommended?", "What options might be appropriate?", "How is privacy maintained?"],
  },
  "longevity-medicine": {
    slug: "longevity-medicine",
    label: "Longevity Medicine",
    short: "Longevity",
    explanation:
      "Longevity medicine focuses on healthspan — the portion of life lived in good health — through preventive care, advanced diagnostics, and lifestyle intervention. Claims should be evaluated critically.",
    reasons: ["Preventive health goals", "Interest in advanced diagnostics", "Healthspan focus"],
    providerType: "Physician with longevity/functional medicine training",
    questions: ["What diagnostics are recommended?", "How are interventions personalized?", "What outcomes are tracked?"],
  },
  "performance-recovery": {
    slug: "performance-recovery",
    label: "Performance & Recovery",
    short: "Performance",
    explanation:
      "Performance and recovery services support athletic goals through recovery technology, IV therapy, and structured protocols, often alongside primary men's health care.",
    reasons: ["Athletic recovery goals", "Fatigue or overtraining", "Performance optimization"],
    providerType: "Physician or supervised clinical team",
    questions: ["What protocols are offered?", "How is safety maintained?", "What outcomes are tracked?"],
  },
  "preventive-mens-health": {
    slug: "preventive-mens-health",
    label: "Preventive Men's Health",
    short: "Preventive",
    explanation:
      "Preventive men's health focuses on screening, risk assessment, and early intervention to maintain long-term health through routine evaluation.",
    reasons: ["Routine preventive care", "Age-related screening", "Family health history concerns"],
    providerType: "Physician or Nurse Practitioner",
    questions: ["What screenings are appropriate for my age?", "What risk factors should I address?", "How often should I follow up?"],
  },
  "telehealth-services": {
    slug: "telehealth-services",
    label: "Telehealth Services",
    short: "Telehealth",
    explanation:
      "Telehealth enables men's health consults and follow-ups remotely, subject to provider licensure in the patient's state. It can expand access to specialized care.",
    reasons: ["Limited local access", "Preference for remote care", "Follow-up convenience"],
    providerType: "Licensed provider in your state",
    questions: ["Is the provider licensed in my state?", "What can be addressed via telehealth?", "What requires an in-person visit?"],
  },
};

export const TREATMENT_LIST = TREATMENT_VERTICALS.map((t) => TREATMENT_INFO[t.slug]).filter(Boolean);
