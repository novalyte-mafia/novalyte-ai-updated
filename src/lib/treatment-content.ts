/**
 * Novalyte AI — Treatment Education Content
 *
 * Rich, educational content for each treatment category's dedicated page.
 * All content is educational and does NOT constitute medical advice.
 */

export type TreatmentContent = {
  slug: string;
  label: string;
  shortLabel: string;
  heroImage: string;
  heroImageAlt: string;
  tagline: string;
  overview: string;
  whoMayConsider: string[];
  commonGoals: string[];
  consultationInvolves: string[];
  possibleTesting: string[];
  potentialBenefits: string;
  risksLimitations: string[];
  questionsToAsk: string[];
  faqs: { question: string; answer: string }[];
  references: { label: string; source: string }[];
};

export const TREATMENT_CONTENT: Record<string, TreatmentContent> = {
  "testosterone-replacement-therapy": {
    slug: "testosterone-replacement-therapy",
    label: "Testosterone Replacement Therapy",
    shortLabel: "TRT",
    heroImage: "/images/treatments/trt-1.jpg",
    heroImageAlt: "Clinician reviewing laboratory blood test results with a male patient",
    tagline: "Understanding TRT as a clinically supervised treatment option",
    overview:
      "Testosterone replacement therapy (TRT) is a medical approach used when a licensed healthcare provider confirms clinically low testosterone through laboratory testing, alongside symptoms that may be related. TRT is not a lifestyle enhancement — it is a monitored treatment that, when appropriate, aims to restore testosterone to a clinically agreed range. A licensed provider determines whether TRT is suitable based on an individual's lab results, medical history, and overall health.",
    whoMayConsider: [
      "Adult men with lab-confirmed low testosterone",
      "Men experiencing symptoms that may correlate with low testosterone",
      "Those who have discussed concerns with a licensed provider",
      "Individuals open to ongoing lab monitoring",
    ],
    commonGoals: [
      "Improved energy levels",
      "Improved motivation and mood",
      "Support for muscle mass and strength",
      "Support for sexual health",
      "Better recovery",
    ],
    consultationInvolves: [
      "Review of your medical history and symptoms",
      "Physical examination if indicated",
      "Laboratory testing of testosterone and related markers",
      "Discussion of potential benefits, risks, and alternatives",
      "Ongoing monitoring if treatment is initiated",
    ],
    possibleTesting: [
      "Total and free testosterone levels",
      "Luteinizing hormone (LH) and follicle-stimulating hormone (FSH)",
      "Complete blood count (CBC)",
      "Lipid panel",
      "Prostate-specific antigen (PSA) where appropriate",
    ],
    potentialBenefits:
      "When clinically appropriate and monitored, TRT may help address symptoms associated with low testosterone. Benefits vary by individual and depend on whether low testosterone is the underlying cause. A licensed provider can discuss realistic expectations based on your specific situation.",
    risksLimitations: [
      "TRT is not appropriate for everyone — clinical eligibility is determined by a licensed provider",
      "Potential side effects require monitoring",
      "Treatment does not guarantee specific outcomes",
      "Ongoing lab work and provider follow-up are required",
      "TRT is not a substitute for healthy lifestyle habits",
    ],
    questionsToAsk: [
      "What do my lab results indicate about my testosterone levels?",
      "What are the potential benefits and risks of TRT for my situation?",
      "How will treatment be monitored?",
      "What lifestyle factors may support my outcomes?",
      "What are the alternatives if TRT is not appropriate for me?",
    ],
    faqs: [
      { question: "Can I start TRT without lab work?", answer: "No. Responsible TRT requires laboratory testing to confirm whether testosterone levels are clinically low and to monitor treatment safety. A licensed provider will not initiate TRT without appropriate labs." },
      { question: "How long does it take to notice changes?", answer: "Timelines vary by individual. Some changes may be noticed within weeks, while others may take months. A licensed provider can set realistic expectations based on your situation." },
      { question: "Is TRT covered by insurance?", answer: "Coverage varies by plan and depends on whether the treatment is deemed medically necessary. Many men's health clinics operate on direct-pay models. Discuss costs with the clinic during your consultation." },
      { question: "Will I need to stay on TRT long-term?", answer: "That depends on the underlying cause and your provider's recommendation. Some individuals use TRT long-term with monitoring; others may discontinue if the underlying cause is addressed. This is a clinical decision made with your provider." },
    ],
    references: [
      { label: "Endocrine Society Clinical Practice Guidelines", source: "Endocrine Society (for general reference)" },
      { label: "Testosterone Therapy in Men with Androgen Deficiency", source: "American Urological Association (for general reference)" },
      { label: "Hypogonadism information", source: "NIH/MedlinePlus (for general reference)" },
    ],
  },

  "hormone-optimization": {
    slug: "hormone-optimization",
    label: "Hormone Optimization",
    shortLabel: "Hormones",
    heroImage: "/images/treatments/trt-2.jpg",
    heroImageAlt: "Clinician reviewing biomarker and hormone data with a patient",
    tagline: "A comprehensive approach to hormone health",
    overview:
      "Hormone optimization refers to evaluating and, where clinically appropriate, adjusting hormone levels beyond testosterone alone. This may include thyroid hormones, growth hormone markers, and other endocrine factors. It typically involves comprehensive laboratory work and individualized protocols developed by a licensed provider.",
    whoMayConsider: [
      "Men with symptoms that may relate to hormonal imbalance",
      "Those interested in comprehensive endocrine evaluation",
      "Individuals with persistent energy, mood, or body composition concerns",
    ],
    commonGoals: ["Balanced energy", "Improved mood", "Better sleep", "Optimized body composition", "General wellness"],
    consultationInvolves: [
      "Comprehensive hormone panel review",
      "Medical history and symptom assessment",
      "Discussion of treatment options if indicated",
      "Ongoing monitoring",
    ],
    possibleTesting: ["Testosterone (total and free)", "Thyroid panel (TSH, T3, T4)", "Cortisol", "Insulin-like growth factor (IGF-1)", "Estrogen markers"],
    potentialBenefits: "When clinically appropriate, hormone optimization may help address symptoms related to imbalances. Benefits depend on the specific hormones involved and individual health factors. A licensed provider determines appropriate interventions.",
    risksLimitations: [
      "Hormone optimization is not appropriate for everyone",
      "Requires comprehensive lab work and clinical oversight",
      "Treatment is individualized — there is no one-size-fits-all protocol",
      "Ongoing monitoring is essential",
    ],
    questionsToAsk: ["Which hormones are being evaluated?", "What does an optimized range mean for me?", "What monitoring is involved?", "What are the risks of hormone intervention?"],
    faqs: [
      { question: "Is hormone optimization the same as TRT?", answer: "No. While TRT focuses specifically on testosterone, hormone optimization is a broader approach that may evaluate multiple hormones. TRT may be one component of a hormone optimization plan." },
      { question: "How is hormone optimization monitored?", answer: "Through regular laboratory testing and clinical follow-up. A licensed provider adjusts protocols based on lab results, symptoms, and overall health." },
    ],
    references: [
      { label: "Endocrine Society Guidelines", source: "Endocrine Society (for general reference)" },
      { label: "Male Hypogonadism", source: "Mayo Clinic (for general reference)" },
    ],
  },

  "erectile-dysfunction": {
    slug: "erectile-dysfunction",
    label: "Erectile Dysfunction Care",
    shortLabel: "ED Care",
    heroImage: "/images/patients/consultation-v2.png",
    heroImageAlt: "Discreet private consultation between a mature male patient and a clinician",
    tagline: "Discreet, professional care for erectile concerns",
    overview:
      "Erectile dysfunction (ED) care addresses persistent difficulty achieving or maintaining an erection. Licensed providers evaluate underlying causes — which may be vascular, hormonal, psychological, or a combination — before recommending appropriate options. Care is provided in a private, respectful, and confidential manner.",
    whoMayConsider: [
      "Men experiencing persistent erectile difficulties",
      "Those who have not discussed concerns with a provider before",
      "Individuals seeking discreet, professional evaluation",
    ],
    commonGoals: ["Improved erectile function", "Restored confidence", "Understanding underlying causes", "Better sexual health"],
    consultationInvolves: [
      "Private, confidential discussion of concerns",
      "Medical history review",
      "Physical examination if indicated",
      "Laboratory testing to identify potential causes",
      "Discussion of treatment options",
    ],
    possibleTesting: ["Testosterone levels", "Blood glucose / HbA1c", "Lipid panel", "Cardiovascular assessment", "Thyroid function"],
    potentialBenefits: "When the underlying cause is identified, appropriate treatment may help improve erectile function. Benefits depend on the cause and individual health factors. A licensed provider determines appropriate options.",
    risksLimitations: [
      "ED can be a sign of underlying cardiovascular or metabolic conditions — a full evaluation is important",
      "Treatment options vary and are determined by a licensed provider",
      "No treatment guarantees specific outcomes",
    ],
    questionsToAsk: ["What might be contributing to my symptoms?", "What evaluation is recommended?", "What options might be appropriate for me?", "Are there lifestyle factors that may help?"],
    faqs: [
      { question: "Is the consultation confidential?", answer: "Yes. All consultations are confidential and conducted in a private setting. Telehealth options are available for those who prefer additional privacy." },
      { question: "Are ED treatments safe?", answer: "When prescribed by a licensed provider after appropriate evaluation, ED treatments can be safe. However, they are not appropriate for everyone. Your provider will discuss potential risks and interactions with any other medications." },
    ],
    references: [
      { label: "Erectile Dysfunction Guideline", source: "American Urological Association (for general reference)" },
      { label: "Erectile Dysfunction", source: "NIH/MedlinePlus (for general reference)" },
    ],
  },

  "medical-weight-loss": {
    slug: "medical-weight-loss",
    label: "Medical Weight Loss",
    shortLabel: "Weight Loss",
    heroImage: "/images/treatments/weight-1.jpg",
    heroImageAlt: "Clinician-guided weight management consultation with a patient",
    tagline: "Clinically supervised weight management",
    overview:
      "Medical weight loss combines nutrition guidance, behavioral support, activity recommendations, and — when clinically appropriate — medication, all under the supervision of a licensed healthcare provider. Programs are individualized based on health history, goals, and metabolic factors.",
    whoMayConsider: [
      "Individuals who have struggled to lose weight with lifestyle alone",
      "Those with weight-related health concerns",
      "People seeking a supervised, structured approach",
      "Those open to regular check-ins and monitoring",
    ],
    commonGoals: ["Sustainable weight loss", "Improved metabolic health", "Better body composition", "Healthier lifestyle habits"],
    consultationInvolves: [
      "Review of medical history and current health",
      "Discussion of weight-loss goals and timeline",
      "Assessment of metabolic factors",
      "Development of an individualized plan",
      "Regular follow-up and progress monitoring",
    ],
    possibleTesting: ["Body composition analysis", "Metabolic panel", "Thyroid function", "Blood glucose / HbA1c", "Lipid panel"],
    potentialBenefits: "When followed under clinical supervision, medical weight loss programs may support sustainable weight loss and improved metabolic health. Results vary by individual and depend on adherence to the program.",
    risksLimitations: [
      "Weight loss is a gradual process — rapid loss is not the goal",
      "Success requires ongoing commitment to lifestyle changes",
      "Medication, if prescribed, may have side effects",
      "Individual results vary significantly",
    ],
    questionsToAsk: ["What does a supervised program include?", "Is medication an option for me?", "How is progress monitored?", "What support is provided between visits?"],
    faqs: [
      { question: "Do I have to take medication?", answer: "No. Medication is one tool that may be considered, but many programs focus on nutrition, behavior, and activity. A licensed provider will discuss whether medication is appropriate for your situation." },
      { question: "How much weight can I expect to lose?", answer: "Results vary widely. A realistic, sustainable rate is typically 1-2 pounds per week, but this depends on many factors. Your provider can help set realistic expectations." },
    ],
    references: [
      { label: "Adult Overweight and Obesity Treatment", source: "CDC (for general reference)" },
      { label: "Weight Management", source: "NIH/NIDDK (for general reference)" },
    ],
  },

  "glp-1": {
    slug: "glp-1",
    label: "GLP-1 Programs",
    shortLabel: "GLP-1",
    heroImage: "/images/treatments/weight-2.jpg",
    heroImageAlt: "Clinician reviewing a structured treatment program with a patient",
    tagline: "Understanding GLP-1 medications in medical weight loss",
    overview:
      "GLP-1 receptor agonists are a class of medications that some providers consider as part of a broader medical weight loss program for individuals who meet clinical criteria. These medications work by affecting appetite and metabolic regulation. A licensed provider determines whether a GLP-1 medication is appropriate based on individual health factors.",
    whoMayConsider: [
      "Individuals who meet clinical criteria for GLP-1 therapy",
      "Those enrolled in a supervised medical weight loss program",
      "People open to ongoing monitoring and lab work",
    ],
    commonGoals: ["Support for weight loss", "Improved metabolic health", "Appetite regulation"],
    consultationInvolves: [
      "Full medical history and health assessment",
      "Discussion of whether GLP-1 is clinically appropriate",
      "Review of potential benefits, risks, and alternatives",
      "Ongoing monitoring if prescribed",
    ],
    possibleTesting: ["Body mass index (BMI) assessment", "Blood glucose / HbA1c", "Kidney function", "Thyroid function", "Lipid panel"],
    potentialBenefits: "When clinically appropriate and monitored, GLP-1 medications may support weight loss as part of a comprehensive program. A licensed provider determines whether this option is suitable and monitors outcomes.",
    risksLimitations: [
      "GLP-1 medications are not appropriate for everyone",
      "Potential side effects require monitoring",
      "Medication must be combined with lifestyle changes for best results",
      "A provider determines eligibility — not all patients qualify",
    ],
    questionsToAsk: ["Am I a candidate based on my health history?", "What are the benefits and risks?", "What monitoring is required?", "What happens if I stop the medication?"],
    faqs: [
      { question: "Will I definitely get a prescription?", answer: "No. A licensed provider determines whether a GLP-1 medication is clinically appropriate based on your health history, lab results, and individual factors. A prescription is never guaranteed." },
      { question: "Are GLP-1 medications safe long-term?", answer: "GLP-1 medications have been studied and are used under medical supervision. Your provider will discuss the current evidence, potential risks, and appropriate monitoring for your situation." },
    ],
    references: [
      { label: "GLP-1 Receptor Agonists", source: "American Diabetes Association (for general reference)" },
      { label: "Prescription Medications to Treat Overweight and Obesity", source: "NIDDK (for general reference)" },
    ],
  },

  "peptide-therapy": {
    slug: "peptide-therapy",
    label: "Peptide Therapy",
    shortLabel: "Peptides",
    heroImage: "/images/marketplace/inject-3.jpg",
    heroImageAlt: "Clinical consultation in a modern wellness setting",
    tagline: "An evolving area of medicine — approach with informed caution",
    overview:
      "Peptide therapy is an emerging area of medicine that uses specific peptide compounds for various health goals. Because the field is evolving, patients should seek providers who ground recommendations in available evidence, monitor outcomes, and are transparent about what is and isn't yet well-established. Not all peptide protocols have the same level of evidence.",
    whoMayConsider: [
      "Individuals with specific recovery or wellness goals",
      "Those working with a provider experienced in peptide protocols",
      "People who understand this is an evolving field",
    ],
    commonGoals: ["Recovery support", "Performance optimization", "Sleep improvement", "General wellness"],
    consultationInvolves: [
      "Discussion of goals and interest in peptide therapy",
      "Review of available evidence for specific protocols",
      "Assessment of whether peptides are appropriate",
      "Discussion of risks, monitoring, and alternatives",
    ],
    possibleTesting: ["Baseline labs", "Ongoing monitoring depending on protocol"],
    potentialBenefits: "Some peptide protocols may offer benefits for specific goals, though evidence varies. A knowledgeable provider can discuss what is well-supported versus experimental and help set realistic expectations.",
    risksLimitations: [
      "This is an evolving field — not all protocols are well-established",
      "Quality and sourcing of peptides matter significantly",
      "Long-term safety data may be limited for some compounds",
      "Patients should be cautious of overpromising marketing",
    ],
    questionsToAsk: ["What evidence supports this approach?", "How will outcomes be monitored?", "What are the known risks?", "Is this protocol well-established or experimental?"],
    faqs: [
      { question: "Are peptides approved medications?", answer: "Some peptides are approved medications for specific conditions, while others are used in off-label or investigational contexts. Your provider can explain the status of any specific peptide being discussed." },
      { question: "How do I know if a peptide protocol is legitimate?", answer: "Work with a licensed provider who is transparent about evidence, uses quality-compounded products when appropriate, monitors outcomes, and does not make exaggerated claims. Be cautious of any protocol promising dramatic results." },
    ],
    references: [
      { label: "Peptide Drug Development", source: "FDA (for general reference)" },
      { label: "Peptide Therapeutics", source: "Peer-reviewed literature (for general reference)" },
    ],
  },

  "hair-restoration": {
    slug: "hair-restoration",
    label: "Hair Restoration",
    shortLabel: "Hair",
    heroImage: "/images/treatments/hair-1.jpg",
    heroImageAlt: "Hair and scalp health consultation with a clinician",
    tagline: "Options for addressing hair loss",
    overview:
      "Hair restoration for men may include medical treatments, topical solutions, and procedural options. A licensed provider can evaluate the pattern and likely causes of hair loss before recommending an appropriate path. Early evaluation often provides more options.",
    whoMayConsider: [
      "Men experiencing thinning hair or receding hairline",
      "Those who want to slow progression of hair loss",
      "Individuals interested in procedural options",
    ],
    commonGoals: ["Slow hair loss progression", "Improve hair density", "Restore hairline", "Understand treatment options"],
    consultationInvolves: [
      "Assessment of hair loss pattern and causes",
      "Discussion of treatment options (medical, topical, procedural)",
      "Review of realistic expectations",
      "Development of a treatment plan if appropriate",
    ],
    possibleTesting: ["Scalp examination", "Possible lab work to rule out underlying causes"],
    potentialBenefits: "Depending on the type and stage of hair loss, various treatments may help slow loss or improve density. Results vary and a provider can set realistic expectations.",
    risksLimitations: [
      "Results vary by individual and treatment type",
      "Treatment is often ongoing — stopping may reverse progress",
      "Not all treatments work for everyone",
      "Procedural options have their own considerations",
    ],
    questionsToAsk: ["What type of hair loss do I have?", "Which options are appropriate for me?", "What results are realistic?", "How long until I see results?"],
    faqs: [
      { question: "Can hair loss be reversed?", answer: "It depends on the cause and stage. Some treatments can slow loss and, in some cases, improve density. A provider can assess your specific situation and set realistic expectations." },
      { question: "Are hair treatments covered by insurance?", answer: "Most hair restoration treatments are considered cosmetic and are not covered by insurance. Discuss costs with the clinic during your consultation." },
    ],
    references: [
      { label: "Androgenetic Alopecia", source: "American Academy of Dermatology (for general reference)" },
      { label: "Hair Loss", source: "NIH/MedlinePlus (for general reference)" },
    ],
  },

  "longevity-medicine": {
    slug: "longevity-medicine",
    label: "Longevity Medicine",
    shortLabel: "Longevity",
    heroImage: "/images/treatments/preventive-3.jpg",
    heroImageAlt: "Healthy mature man focused on preventive health and longevity",
    tagline: "Optimizing healthspan through preventive and diagnostic care",
    overview:
      "Longevity medicine is an emerging field focused on healthspan — the portion of life lived in good health. It draws on preventive care, advanced diagnostics, biomarker evaluation, and lifestyle intervention. Because the field is evolving, patients should evaluate claims critically and seek providers who ground recommendations in evidence.",
    whoMayConsider: [
      "Individuals focused on long-term preventive health",
      "Those interested in advanced biomarker testing",
      "People with family health history concerns",
    ],
    commonGoals: ["Extended healthspan", "Preventive screening", "Optimized biomarkers", "Healthy aging"],
    consultationInvolves: [
      "Comprehensive health assessment",
      "Advanced diagnostic and biomarker testing",
      "Discussion of preventive interventions",
      "Development of a personalized plan",
    ],
    possibleTesting: ["Comprehensive blood panel", "Inflammatory markers", "Hormone panel", "Cardiovascular risk markers", "Metabolic health markers"],
    potentialBenefits: "Longevity medicine may help identify risk factors early and support preventive interventions. However, the field is evolving and not all interventions have strong long-term evidence. A provider can distinguish well-supported approaches from experimental ones.",
    risksLimitations: [
      "The field is emerging — some interventions lack long-term evidence",
      "Advanced testing may identify findings of uncertain significance",
      "Be cautious of exaggerated anti-aging claims",
      "Focus on evidence-based approaches",
    ],
    questionsToAsk: ["What diagnostics are recommended?", "How are interventions personalized?", "What outcomes are tracked?", "Which approaches are well-supported versus experimental?"],
    faqs: [
      { question: "Is longevity medicine the same as anti-aging?", answer: "Not exactly. Longevity medicine focuses on healthspan and evidence-based preventive care, while 'anti-aging' is often used in marketing with less scientific backing. Look for providers who focus on measurable health outcomes." },
    ],
    references: [
      { label: "Healthy Aging", source: "NIH/NIA (for general reference)" },
      { label: "Preventive Care Guidelines", source: "USPSTF (for general reference)" },
    ],
  },

  "performance-recovery": {
    slug: "performance-recovery",
    label: "Performance & Recovery",
    shortLabel: "Performance",
    heroImage: "/images/treatments/perf-1.jpg",
    heroImageAlt: "Athlete in a recovery and performance assessment with a healthcare professional",
    tagline: "Clinical support for athletic performance and recovery",
    overview:
      "Performance and recovery services support athletic goals through clinical evaluation, recovery technology, and structured protocols. These services are often provided alongside primary men's health care and may include IV therapy, recovery modalities, and performance assessment.",
    whoMayConsider: ["Athletes seeking recovery support", "Individuals with performance goals", "Those experiencing overtraining or slow recovery"],
    commonGoals: ["Faster recovery", "Improved performance", "Injury prevention", "Better training outcomes"],
    consultationInvolves: ["Performance assessment", "Recovery evaluation", "Discussion of protocols and technology", "Development of a plan"],
    possibleTesting: ["Baseline fitness assessment", "Recovery metrics", "Nutritional assessment"],
    potentialBenefits: "Performance and recovery protocols may support athletic goals when combined with proper training and nutrition. A provider can recommend appropriate interventions.",
    risksLimitations: ["Results depend on overall training and lifestyle", "Not a substitute for proper coaching", "Individual responses vary"],
    questionsToAsk: ["What protocols are offered?", "How is safety maintained?", "What outcomes are tracked?"],
    faqs: [
      { question: "Is this only for competitive athletes?", answer: "No. Performance and recovery services can benefit anyone with fitness goals, from recreational athletes to those recovering from intense training." },
    ],
    references: [{ label: "Exercise and Physical Activity", source: "ACSM (for general reference)" }],
  },

  "preventive-mens-health": {
    slug: "preventive-mens-health",
    label: "Preventive Men's Health",
    shortLabel: "Preventive",
    heroImage: "/images/treatments/preventive-2.jpg",
    heroImageAlt: "Routine preventive checkup with blood pressure and wellness consultation",
    tagline: "Proactive health maintenance and screening",
    overview:
      "Preventive men's health focuses on screening, risk assessment, and early intervention to maintain long-term health. This includes routine evaluations, age-appropriate screenings, and lifestyle counseling to reduce future health risks.",
    whoMayConsider: ["Adults seeking routine preventive care", "Those overdue for screenings", "Individuals with family health history concerns"],
    commonGoals: ["Stay healthy", "Catch issues early", "Understand personal health risks", "Build sustainable habits"],
    consultationInvolves: ["Comprehensive health review", "Age-appropriate screenings", "Risk assessment", "Lifestyle counseling"],
    possibleTesting: ["Blood pressure", "Cholesterol panel", "Blood glucose", "Cancer screenings per guidelines", "Cardiovascular risk assessment"],
    potentialBenefits: "Preventive care can identify risk factors early when they're most manageable. Regular screening is one of the most impactful things you can do for long-term health.",
    risksLimitations: ["Screening has limitations — not all conditions are detectable", "Some findings require follow-up", "Preventive care is ongoing, not one-time"],
    questionsToAsk: ["What screenings are appropriate for my age?", "What risk factors should I address?", "How often should I follow up?"],
    faqs: [
      { question: "How often should I get a checkup?", answer: "Frequency depends on your age, health status, and risk factors. Your provider can recommend an appropriate schedule for you." },
    ],
    references: [{ label: "Clinical Preventive Services", source: "USPSTF (for general reference)" }],
  },

  "telehealth-services": {
    slug: "telehealth-services",
    label: "Telehealth Services",
    shortLabel: "Telehealth",
    heroImage: "/images/treatments/telehealth-new-1.jpg",
    heroImageAlt: "Male patient speaking with a clinician through a laptop in a private home setting",
    tagline: "Remote access to licensed men's health care",
    overview:
      "Telehealth enables men's health consultations and follow-ups to occur remotely, subject to provider licensure in the patient's state. It can expand access to specialized care, particularly for those in areas with limited local options or who prefer the convenience and privacy of remote visits.",
    whoMayConsider: ["Those with limited local access to men's health providers", "People who prefer remote care", "Individuals seeking follow-up convenience"],
    commonGoals: ["Access to specialized care", "Convenience", "Privacy", "Regular follow-up"],
    consultationInvolves: ["Video or phone consultation", "Review of history and concerns", "Lab orders if needed", "Treatment planning"],
    possibleTesting: ["Labs ordered through local facilities", "Home test kits where available"],
    potentialBenefits: "Telehealth can improve access to care and make regular follow-up more convenient. Some care may require in-person visits.",
    risksLimitations: ["Provider must be licensed in your state", "Some care requires in-person visits", "Not suitable for all conditions"],
    questionsToAsk: ["Is the provider licensed in my state?", "What can be addressed via telehealth?", "What requires an in-person visit?"],
    faqs: [
      { question: "Can I get prescriptions via telehealth?", answer: "Yes, when clinically appropriate and when the provider is licensed in your state. Some medications may require in-person evaluation first." },
    ],
    references: [{ label: "Telehealth Guidance", source: "HHS (for general reference)" }],
  },

  "sexual-wellness": {
    slug: "sexual-wellness",
    label: "Sexual Wellness",
    shortLabel: "Wellness",
    heroImage: "/images/pillars/workforce-hub.jpg",
    heroImageAlt: "Discreet, confidential provider-patient discussion",
    tagline: "Comprehensive, confidential sexual health care",
    overview:
      "Sexual wellness care addresses a range of concerns holistically, often combining evaluation, education, and treatment options tailored to the individual. Care is provided in a confidential, respectful setting.",
    whoMayConsider: ["Men with sexual health concerns", "Those seeking holistic evaluation", "Individuals preferring confidential care"],
    commonGoals: ["Improved sexual health", "Better confidence", "Understanding concerns", "Holistic evaluation"],
    consultationInvolves: ["Confidential discussion", "Medical history", "Physical exam if indicated", "Lab testing", "Treatment planning"],
    possibleTesting: ["Hormone panel", "Cardiovascular assessment", "Metabolic panel"],
    potentialBenefits: "A holistic approach can identify contributing factors and appropriate interventions. A licensed provider determines suitable options.",
    risksLimitations: ["Treatment depends on underlying causes", "Requires open communication with provider", "Individual results vary"],
    questionsToAsk: ["What evaluation is recommended?", "What options might be appropriate?", "How is privacy maintained?"],
    faqs: [
      { question: "Is the consultation confidential?", answer: "Yes. All consultations are confidential and conducted in a private, respectful setting." },
    ],
    references: [{ label: "Sexual Health", source: "ASHA (for general reference)" }],
  },
};

export function getTreatmentContent(slug: string): TreatmentContent | undefined {
  return TREATMENT_CONTENT[slug];
}
