import type { ArticleContent, ArticleBlock } from "@/lib/article-content";

function tocFromBlocks(blocks: ArticleBlock[]): { id: string; title: string }[] {
  return blocks
    .filter((b): b is Extract<ArticleBlock, { type: "heading" }> => b.type === "heading" && b.level === 2)
    .map((b) => ({ id: b.id, title: b.text }));
}

const IMG = "/images/articles/mens-health-pillar";
const ASSESS_TRT = "/?view=assessment&params=%7B%22slug%22%3A%22testosterone-replacement-therapy%22%7D";
const ASSESS_ED = "/?view=assessment&params=%7B%22slug%22%3A%22erectile-dysfunction%22%7D";
const DIRECTORY = "/directory?view=directory";

const body: ArticleBlock[] = [
  {
    type: "callout",
    tone: "info",
    text: "What this guide covers: common symptoms men search privately (fatigue, low libido, erectile difficulties, brain fog, belly fat, and related concerns); why symptoms alone do not establish a diagnosis; how testosterone testing is typically approached; how care settings differ; how to compare men's health clinics; and how to take a private, informational next step on Novalyte AI. This is educational content from a technology platform—not a diagnosis, prescription, or guarantee of outcomes.",
  },
  {
    type: "cta",
    variant: "assessment",
    title: "Start privately, at your own pace",
    body: "Use Novalyte's informational men's health assessment to organize concerns before talking with a licensed clinician. It does not diagnose low testosterone, ED, or any medical condition.",
    primaryLabel: "Take the Private Men's Health Assessment",
    primaryHref: ASSESS_TRT,
    secondaryLabel: "Explore Men's Health Clinics",
    secondaryHref: DIRECTORY,
  },
  {
    type: "heading",
    level: 2,
    id: "why-men-search-privately",
    text: "Why more men are privately searching testosterone, ED, fatigue, and men's health clinics",
  },
  {
    type: "paragraph",
    text: "Many men begin researching men's health long before they book an appointment. Search histories often include phrases about low energy, reduced libido, weak erections after 40, unexplained belly fat, brain fog, poorer gym recovery, or questions about testosterone levels. That private research is understandable: sexual and hormonal concerns can feel sensitive, and men may want language and context before speaking with a clinician.",
  },
  {
    type: "paragraph",
    text: "Online information can help with orientation—but it can also oversimplify. Fatigue, erectile dysfunction (ED), low libido, mood changes, and weight gain can overlap with sleep apnea, metabolic disease, medication effects, cardiovascular factors, thyroid disorders, depression or anxiety, stress, alcohol use, aging, and hormonal conditions. A clinic visit is one path among several; primary care, urology, endocrinology, and specialist men's health practices may all play a role depending on the situation.",
  },
  {
    type: "paragraph",
    text: "Novalyte AI is a care-discovery and technology platform. It helps people learn, compare publicly listed clinic information, and prepare for conversations with licensed clinicians. Novalyte does not diagnose conditions, prescribe medications, operate a pharmacy, or guarantee treatment results. For a broader overview of how digital tools change access without replacing clinicians, see [how healthcare technology is changing men's health access](/journal/healthcare-technology-mens-health-access).",
  },
  {
    type: "paragraph",
    text: "Privacy-conscious research does not replace clinical evaluation. Screenshots of lab ranges, influencer anecdotes, and clinic advertisements can create false certainty. A careful clinician will ask about timing of blood draws, recent illness, shift work, anabolic steroid or opioid exposure, and goals around fertility before recommending any therapy. Men comparing options should also ask how a clinic handles abnormal results that fall outside its usual protocol—for example newly discovered severe anemia, markedly elevated hematocrit, or symptoms suggesting sleep apnea.",
  },
  {
    type: "paragraph",
    text: "If you are preparing for a visit, write down your top three concerns, a medication list, and questions about monitoring. That preparation improves the conversation whether you start with primary care, a men's health clinic, endocrinology, or urology. Novalyte's role is to help you organize that journey—not to decide treatment for you.",
  },
  {
    type: "heading",
    level: 2,
    id: "symptoms-men-often-search",
    text: "The symptoms men often search before looking for a clinic",
  },
  {
    type: "paragraph",
    text: "Symptom searches are common entry points into men's health content. The items below are frequently researched together—but clustering does not prove a single cause. Use the list as a vocabulary aid for a clinical conversation, not as a self-checklist that confirms low testosterone.",
  },
  {
    type: "image",
    src: `${IMG}/symptom-overview.jpg`,
    alt: "Editorial illustration representing common men's health symptom themes including energy, libido, mood, body composition, and sleep",
    caption: "Symptoms often researched together can still have many different medical and lifestyle explanations.",
    aspect: "wide",
  },
  {
    type: "list",
    items: [
      "Fatigue or low daytime energy that does not match sleep opportunity",
      "Low libido or reduced interest in sex",
      "Erectile difficulties, weaker erections, or inconsistent erectile quality—especially questions about weak erections after 40",
      "Brain fog, reduced focus, or mental fatigue",
      "Mood changes, irritability, or reduced motivation",
      "Increased belly fat or unexplained weight gain",
      "Reduced muscle mass or difficulty building or maintaining muscle",
      "Poorer workout recovery",
      "Sleep problems, snoring concerns, or unrefreshing sleep",
      "Questions about \"normal testosterone levels in males\" or whether to visit a men's health clinic near them",
    ],
  },
  {
    type: "callout",
    tone: "warning",
    text: "Seek urgent or emergency care for chest pain, sudden neurologic symptoms, suicidal thoughts, priapism lasting more than four hours, sudden vision loss, severe allergic reactions, or other emergency warning signs. Online research and informational assessments are not emergency services.",
  },
  {
    type: "heading",
    level: 2,
    id: "could-this-be-low-testosterone",
    text: "Could these symptoms indicate low testosterone?",
  },
  {
    type: "paragraph",
    text: "Low testosterone (clinically discussed as hypogonadism when confirmed) can be associated with sexual symptoms, reduced energy, mood changes, and body-composition shifts in some men. Professional guidelines emphasize that diagnosis rests on compatible symptoms plus appropriately timed, repeated laboratory evaluation—and clinical judgment—not on a single afternoon blood draw or an online quiz.",
  },
  {
    type: "paragraph",
    text: "The same symptoms can appear with obstructive sleep apnea, obesity and insulin resistance, type 2 diabetes, depression, chronic stress, opioid or glucocorticoid medications, pituitary disorders, thyroid disease, alcohol excess, and other conditions. Treating an underlying driver may change how a man feels—sometimes without testosterone therapy.",
  },
  {
    type: "pullquote",
    text: "Symptoms are signals, not a diagnosis.",
  },
  {
    type: "paragraph",
    text: "If you are comparing educational options, Novalyte's [Testosterone Replacement Therapy overview](/journal/understanding-trt-overview) explains evaluation pathways at a high level. That article, like this one, is educational and does not recommend TRT for every symptomatic reader.",
  },
  {
    type: "heading",
    level: 2,
    id: "understanding-testosterone-testing",
    text: "Understanding testosterone testing",
  },
  {
    type: "paragraph",
    text: "Laboratory evaluation is typically more nuanced than a single number labeled \"low.\" Clinicians may consider total testosterone, free or calculated free testosterone when sex-hormone-binding globulin (SHBG) is altered (for example with obesity or aging), morning sampling when levels are often higher, and repeat testing on a separate day before committing to a long-term plan. Age, symptoms, medications, and coexisting illness all matter.",
  },
  {
    type: "image",
    src: `${IMG}/lab-testing.jpg`,
    alt: "Calm laboratory setting representing morning testosterone blood testing and clinical evaluation",
    caption: "Laboratory reference ranges vary by assay and laboratory. Results require clinician interpretation in clinical context.",
    aspect: "wide",
  },
  {
    type: "list",
    ordered: true,
    items: [
      "Total testosterone — often the first screening measure; morning samples are commonly preferred.",
      "Repeat confirmation — guideline-oriented evaluation usually avoids diagnosing persistent deficiency from one isolated value.",
      "Free testosterone or SHBG-informed interpretation — especially when total levels are borderline or binding proteins are altered.",
      "Additional labs when indicated — such as LH, FSH, prolactin, or metabolic markers, based on clinical suspicion.",
      "Clinical context — symptoms, exam findings when performed, fertility goals, and reversible contributors.",
    ],
  },
  {
    type: "callout",
    tone: "tip",
    text: "There is no single universal cutoff that every laboratory and guideline uses in identical wording. Do not self-interpret a result against an internet chart as a definitive diagnosis. Ask your clinician how your values were timed, which assay was used, and whether repeat testing is needed.",
  },
  {
    type: "heading",
    level: 2,
    id: "erectile-dysfunction-after-40",
    text: "Erectile dysfunction after 40",
  },
  {
    type: "paragraph",
    text: "Erectile dysfunction becomes more common with age, but \"common\" is not the same as \"inevitable\" or \"only hormonal.\" Vascular disease, diabetes and metabolic syndrome, medications (including some blood-pressure and psychiatric medicines), neurologic conditions, pelvic surgery or radiation, psychological factors, relationship stress, alcohol and tobacco use, and hormonal factors can each contribute—alone or together.",
  },
  {
    type: "image",
    src: `${IMG}/ed-cardiovascular.jpg`,
    alt: "Abstract educational illustration connecting heart health pathways with men's sexual health education",
    caption: "ED can sometimes prompt a broader conversation about cardiometabolic health. That does not mean every man with ED has heart disease—or low testosterone.",
    aspect: "wide",
  },
  {
    type: "paragraph",
    text: "Because erectile difficulties can share risk factors with cardiovascular disease, some clinical frameworks treat new or progressive ED as a reason to review blood pressure, lipids, glycemic status, smoking, and overall risk—not only sexual performance. Men often ask whether they should see a urologist for ED, start with primary care, or use an online men's health clinic. The better question is usually: who can take a careful history, review medications, order or interpret appropriate testing, and escalate when needed?",
  },
  {
    type: "callout",
    tone: "warning",
    text: "ED medications and hormone therapies are prescription treatments with contraindications (for example, nitrate medications with certain erectile agents). Do not obtain prescription drugs from unverified sources. Discuss safety with a licensed clinician.",
  },
  {
    type: "paragraph",
    text: "For educational orientation only, you can also review Novalyte's informational [erectile dysfunction assessment](/?view=assessment&params=%7B%22slug%22%3A%22erectile-dysfunction%22%7D)—it does not diagnose ED or authorize treatment.",
  },
  {
    type: "heading",
    level: 2,
    id: "which-clinician-to-see",
    text: "Men's health clinic, primary-care clinician, endocrinologist, or urologist?",
  },
  {
    type: "paragraph",
    text: "No single clinician type is universally \"best.\" Access, symptoms, complexity, fertility goals, and local expertise matter. The comparison below is educational, not a ranking.",
  },
  {
    type: "table",
    headers: [
      "Care setting",
      "Common reasons men visit",
      "Typical evaluation focus",
      "When referral may occur",
      "Telehealth notes",
      "Useful questions",
    ],
    rows: [
      [
        "Primary care",
        "Fatigue, weight change, metabolic screening, medication review, first ED discussion",
        "Broad history, vitals, labs, preventive care",
        "Complex endocrine, surgical, or specialized sexual-medicine needs",
        "Often available; exam limits vary",
        "What reversible causes should we rule out first?",
      ],
      [
        "Men's health clinic",
        "Hormone concerns, sexual health, body-composition goals, coordinated men's services",
        "Varies widely by clinic model and clinician credentials",
        "When findings exceed clinic scope or require hospital-based care",
        "Common in cash-pay and hybrid models",
        "Who is the licensed clinician of record, and what monitoring is included?",
      ],
      [
        "Endocrinology",
        "Confirmed or complex hypogonadism, pituitary issues, multi-hormone disorders",
        "Hormone axes, specialized endocrine testing",
        "From primary care or men's clinics for complexity",
        "Varies by practice",
        "Do my labs suggest primary vs secondary hypogonadism?",
      ],
      [
        "Urology / sexual medicine",
        "ED, Peyronie's, prostate concerns, infertility evaluation pathways",
        "Genitourinary and sexual-function evaluation",
        "When surgical or advanced sexual-medicine options are considered",
        "Some follow-ups may be remote; exams often in person",
        "Could vascular, neurologic, or anatomic factors be involved?",
      ],
    ],
  },
  {
    type: "cta",
    variant: "custom",
    title: "Understand which care category may fit your concerns",
    body: "An informational assessment can help you organize symptoms and questions before you choose where to seek care. It is not a diagnosis and does not verify any clinic.",
    primaryLabel: "Take the Private Assessment",
    primaryHref: ASSESS_TRT,
    secondaryLabel: "Browse Clinic Directory",
    secondaryHref: DIRECTORY,
  },
  {
    type: "heading",
    level: 2,
    id: "trt-clinic-vs-online",
    text: "TRT clinic versus online men's health clinic",
  },
  {
    type: "paragraph",
    text: "Men comparing a local TRT clinic near them with an online men's health clinic often weigh convenience against examination, laboratory coordination, and continuity. Neither model is automatically superior. Quality depends on clinician licensure in your state, transparent prescribing policies, monitoring, and clear escalation pathways—not on whether the first visit happened on a video call.",
  },
  {
    type: "image",
    src: `${IMG}/telehealth-vs-inperson.jpg`,
    alt: "Side-by-side editorial visual comparing home telehealth consultation and in-person clinic conversation",
    caption: "Telehealth can expand access when clinicians are appropriately licensed; in-person care remains important when examination or procedures are needed.",
    aspect: "wide",
  },
  {
    type: "table",
    headers: ["Factor", "What to compare (either model)"],
    rows: [
      ["Convenience", "Scheduling speed, travel time, after-hours messaging"],
      ["Physical examination", "Whether and when an exam is required or offered"],
      ["Laboratory coordination", "Which labs, who interprets them, how results are shared"],
      ["Follow-up", "Visit frequency, who adjusts therapy, after-hours coverage"],
      ["Provider credentials", "Name, license, specialty, state medical-board verification"],
      ["Continuity", "Same clinician vs rotating coverage"],
      ["Privacy", "HIPAA practices, data handling, discreet shipping if used"],
      ["Pricing transparency", "Consult, labs, medication, supplies, membership fees"],
      ["Emergency guidance", "Clear instructions for urgent symptoms"],
      ["Prescription policies", "No guaranteed prescriptions; clinical criteria disclosed"],
      ["Ongoing monitoring", "Hematocrit, symptom review, and other guideline-aligned checks as indicated"],
    ],
  },
  {
    type: "paragraph",
    text: "For operational and compliance context around remote care, see [building a compliant telehealth men's health practice](/journal/compliant-telehealth-mens-health). Patients should still verify the specific clinicians and clinics they consider.",
  },
  {
    type: "cta",
    variant: "directory",
    title: "Search clinic profiles carefully",
    body: "Directory listings may include publicly sourced or claimed profiles. Only clinics that completed Novalyte verification display a verified badge. Unclaimed and demo profiles are labeled accordingly.",
    primaryLabel: "Explore Men's Health Clinics",
    primaryHref: DIRECTORY,
  },
  {
    type: "heading",
    level: 2,
    id: "what-evaluation-may-include",
    text: "What a men's health clinic evaluation may include",
  },
  {
    type: "paragraph",
    text: "Services vary. A thoughtful evaluation may include health history, symptom timeline, medication and supplement review, vital signs, relevant laboratory testing, sleep and lifestyle screening, sexual-health history, fertility goals, and a follow-up plan. Some visits are telehealth-first; others emphasize in-person assessment. Ask what is included before you pay membership fees.",
  },
  {
    type: "paragraph",
    text: "Ask whether the clinician of record is clearly identified, how after-hours concerns are handled, and whether therapy decisions are made only after confirmatory labs. Membership packages can be convenient, but opaque bundles make it hard to compare true TRT cost against a transparent fee-for-service model. Request a written list of what happens at week 0, month 1–3, and ongoing follow-up.",
  },
  {
    type: "paragraph",
    text: "Men with fertility goals, complex endocrine histories, significant cardiovascular disease, or unexplained neurologic symptoms may need specialty pathways beyond a standard men's health intake. A trustworthy clinic will say when a case is outside its scope rather than stretching a protocol to retain a customer.",
  },
  {
    type: "list",
    items: [
      "Detailed history of energy, mood, sexual function, training, sleep, and weight change",
      "Medication, opioid, steroid, and supplement review",
      "Cardiometabolic risk factors and family history when relevant",
      "Laboratory testing selected for the clinical question—not a one-size panel sold as a diagnosis",
      "Discussion of fertility plans before any therapy that may suppress spermatogenesis",
      "Documented follow-up and monitoring expectations",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "trt-cost-insurance-formats",
    text: "TRT cost, insurance, and treatment formats",
  },
  {
    type: "paragraph",
    text: "\"How much does TRT cost?\" has no single national answer. Pricing depends on consultation structure, laboratory frequency, medication and supplies, membership models, insurance benefits versus cash-pay, geography, and whether compounding or brand formulations are used. Be wary of advertisements that promise a fixed monthly price without disclosing labs, shipping, or follow-up fees.",
  },
  {
    type: "paragraph",
    text: "Insurance coverage, when available, often depends on documented diagnosis codes, prior authorization rules, and preferred pharmacy networks. Cash-pay clinics may still require patients to pay separately for laboratory draws performed at third-party sites. Always clarify which fees are refundable if labs do not support therapy, and whether you can obtain your raw results for a second opinion.",
  },
  {
    type: "paragraph",
    text: "Treatment formats should be explained in plain language: how often injections occur if used, how topical products should be applied to reduce transfer risk, and what procedural steps pellets require. Dosing is individualized and is not provided in this article. If a seller offers testosterone without a clinician relationship, that is not appropriate medical care.",
  },
  {
    type: "list",
    items: [
      "Initial consultation and any required examinations",
      "Baseline and follow-up laboratory testing",
      "Medication cost and administration supplies",
      "Follow-up visits or messaging fees",
      "Membership or program fees, if applicable",
      "Insurance cost-sharing versus cash-pay packaging",
    ],
  },
  {
    type: "paragraph",
    text: "Clinician-directed approaches may include injections, topical gels or creams, patches, pellets, or other regulated formulations depending on availability and suitability. This article does not provide dosing instructions. Delivery methods differ in convenience, monitoring needs, transfer risk (for gels), and procedural requirements (for pellets). Shared decision-making with a licensed clinician is essential. See also the educational comparison notes in [TRT: a complete guide for men](/journal/understanding-trt-overview).",
  },
  {
    type: "heading",
    level: 2,
    id: "safety-questions-men-ask",
    text: "Safety questions men commonly ask",
  },
  {
    type: "paragraph",
    text: "Safety questions deserve careful, individualized answers—not internet reassurance or fear marketing. Topics men frequently raise include fertility, acne, hair changes, sleep apnea, blood-count monitoring, prostate-related monitoring, cardiovascular considerations, long-term follow-up, and what happens if therapy is stopped. Guidelines and product labeling discuss risks and monitoring; your personal risk profile may differ.",
  },
  {
    type: "list",
    items: [
      "Fertility — exogenous testosterone can suppress sperm production; men who want children should discuss alternatives and specialist referral before starting.",
      "Hematocrit / blood count — monitoring may be needed because therapy can raise red-cell mass in some patients.",
      "Prostate-related monitoring — age-appropriate screening and symptom review per clinician judgment and guidelines; this is not a substitute for urologic care when indicated.",
      "Sleep apnea — untreated apnea can worsen symptoms and overall risk; screening questions matter.",
      "Cardiovascular considerations — discuss personal history and risk factors; avoid clinics that dismiss monitoring.",
      "Stopping treatment — plans for dose changes or discontinuation should be clinician-directed.",
    ],
  },
  {
    type: "callout",
    tone: "info",
    text: "This section cannot determine whether TRT is safe for you long term. \"Is TRT safe long term?\" is a personalized clinical question. Product labeling, comorbidities, monitoring adherence, and clinician judgment all matter.",
  },
  {
    type: "heading",
    level: 2,
    id: "weight-belly-fat-metabolic-health",
    text: "Weight gain, belly fat, hormones, and metabolic health",
  },
  {
    type: "paragraph",
    text: "Belly fat and low testosterone searches often appear together. Body composition, sleep, nutrition, insulin resistance, diabetes risk, stress, physical activity, medications, aging, and hormonal conditions can interact. Weight gain does not automatically prove low testosterone—and low testosterone does not automatically explain every change in waist size.",
  },
  {
    type: "paragraph",
    text: "Some men explore medical weight-management options, including clinician-supervised GLP-1 medicines, as part of metabolic care. Those therapies have indications, contraindications, and side effects and must be prescribed by licensed clinicians. For educational context only, see [GLP-1 medications and medical weight loss](/journal/glp-1-medical-weight-loss). A future Novalyte guide will focus specifically on men's metabolic health and weight-management clinics; that page is not published yet, so it is not linked here.",
  },
  {
    type: "heading",
    level: 2,
    id: "how-to-choose-a-mens-health-clinic",
    text: "How to choose a men's health clinic",
  },
  {
    type: "image",
    src: `${IMG}/clinic-checklist.jpg`,
    alt: "Adult man reviewing notes while comparing men's health clinic options at home",
    caption: "A practical checklist beats marketing claims when comparing clinics.",
    aspect: "wide",
  },
  {
    type: "list",
    ordered: true,
    items: [
      "Confirm appropriate clinician credentials and state licensure",
      "Ask for transparent pricing that includes labs and follow-up",
      "Understand the laboratory process and who interprets results",
      "Confirm ongoing monitoring expectations before starting therapy",
      "Review privacy practices and how health data is handled",
      "Ask about follow-up availability and escalation pathways",
      "Prefer evidence-aware communication over guaranteed outcomes",
      "Avoid clinics that promise prescriptions before evaluation",
      "Verify location, contact information, and telehealth service-area rules",
      "Remember: Novalyte \"verified\" status applies only after the clinic completes Novalyte's verification process",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "confidential-next-step",
    text: "Your confidential next step",
  },
  {
    type: "paragraph",
    text: "If you want a private way to organize concerns before contacting a clinic, use Novalyte's informational assessment. Answers help surface educational categories and directory filters. The tool will not declare that you have low testosterone, ED, or any diagnosis. Afterward, you can explore related education, treatment-category pages, and clinic listings—including claimed or verified profiles where available.",
  },
  {
    type: "cta",
    variant: "assessment",
    title: "Take a private next step",
    body: "Educational assessment → relevant guides → directory exploration. You stay in control of if and when you contact a clinician.",
    primaryLabel: "Take the Private Assessment",
    primaryHref: ASSESS_TRT,
    secondaryLabel: "Explore the Directory",
    secondaryHref: DIRECTORY,
  },
  {
    type: "paragraph",
    text: "Related reading on Novalyte Journal: [TRT overview](/journal/understanding-trt-overview), [GLP-1 and medical weight loss](/journal/glp-1-medical-weight-loss), [healthcare technology and men's health access](/journal/healthcare-technology-mens-health-access), and the [Journal hub](/journal).",
  },
  {
    type: "callout",
    tone: "warning",
    text: "Educational disclaimer: Novalyte AI provides technology and information to help people discover care options. It is not a medical provider, does not practice medicine, and does not form a clinician–patient relationship through this article or its assessments.",
  },
];

export const lowTestosteroneEdFatiguePillarArticle: ArticleContent & {
  editorialStatus: "published";
  medicalReviewStatus: "medical_review_required";
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
    noIndex: boolean;
  };
} = {
  slug: "low-testosterone-ed-fatigue-weight-gain-mens-health-clinic",
  title: "Low Testosterone, ED, Fatigue & Weight Gain in Men: When to See a Men's Health Clinic",
  excerpt:
    "Fatigue, low libido, erectile difficulties, brain fog, and unexplained weight gain can have many possible causes. This guide explains low-testosterone evaluation, ED, clinic options, treatment questions, and how to take a private next step.",
  category: "Testosterone",
  tags: [
    "low testosterone symptoms in men",
    "men's health clinic",
    "erectile dysfunction",
    "TRT cost",
    "online men's health clinic",
    "belly fat and low testosterone",
    "testosterone testing",
    "telehealth",
  ],
  author: {
    name: "Novalyte Editorial Team",
    role: "Editorial",
    bio: "Novalyte editorial contributors write educational men's-health explainers for patients researching care options. Articles are reviewed under Novalyte's editorial workflow and are not a substitute for clinical advice.",
  },
  medicalReviewer: null,
  publishedAt: "2026-07-23T12:00:00.000Z",
  updatedAt: "2026-07-23T12:00:00.000Z",
  readingTime: 20,
  heroImage: `${IMG}/hero-consultation.jpg`,
  heroImageAlt: "Adult man speaking thoughtfully with a clinician in a bright modern men's health consultation room",
  heroImageCaption: "Educational illustration of a clinic conversation. Individual care decisions require a licensed clinician.",
  tableOfContents: tocFromBlocks(body),
  body,
  references: [
    {
      label: "1",
      source: "Bhasin S, et al. Testosterone Therapy in Men With Hypogonadism: An Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab. Endocrine Society.",
      url: "https://www.endocrine.org/clinical-practice-guidelines/testosterone-therapy",
    },
    {
      label: "2",
      source: "American Urological Association. Evaluation and Management of Testosterone Deficiency (guideline resources).",
      url: "https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline",
    },
    {
      label: "3",
      source: "American Urological Association. Erectile Dysfunction guideline resources.",
      url: "https://www.auanet.org/guidelines-and-quality/guidelines/erectile-dysfunction-(ed)-guideline",
    },
    {
      label: "4",
      source: "MedlinePlus. Testosterone. U.S. National Library of Medicine.",
      url: "https://medlineplus.gov/testosterone.html",
    },
    {
      label: "5",
      source: "National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK). Sexual and Urologic Problems of Diabetes.",
      url: "https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/sexual-urologic-problems",
    },
    {
      label: "6",
      source: "U.S. Food and Drug Administration. Testosterone Information (safety communications and labeling resources).",
      url: "https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/testosterone-information",
    },
    {
      label: "7",
      source: "Centers for Disease Control and Prevention. Heart Disease risk factors (cardiometabolic context for men's health discussions).",
      url: "https://www.cdc.gov/heart-disease/risk-factors/index.html",
    },
  ],
  faqs: [
    {
      question: "What are the first signs of low testosterone in men?",
      answer:
        "Men often notice changes in sexual desire, erectile quality, energy, mood, or body composition. Similar symptoms have many non-hormonal causes. Signs alone do not confirm low testosterone; clinicians typically combine symptoms with appropriately timed laboratory evaluation.",
    },
    {
      question: "What is considered a normal testosterone level?",
      answer:
        "Reference ranges vary by laboratory and assay. Guidelines discuss diagnosing deficiency using clinical findings plus confirmatory morning testing rather than a single universal number copied from the internet. Ask your clinician how your result was interpreted.",
    },
    {
      question: "Can low testosterone cause erectile dysfunction?",
      answer:
        "Hormonal factors can contribute to erectile difficulties in some men, but ED frequently involves vascular, metabolic, medication-related, neurologic, or psychological factors. Evaluation should consider the broader picture.",
    },
    {
      question: "Is TRT safe long term?",
      answer:
        "Safety depends on indication, comorbidities, product choice, monitoring, and clinician oversight. This is an individualized question—not a yes/no internet answer. Discuss benefits, risks, and monitoring with a licensed clinician.",
    },
    {
      question: "How much does TRT cost per month?",
      answer:
        "Monthly cost varies widely based on consults, labs, medication, supplies, membership fees, and insurance versus cash-pay. Request an itemized estimate rather than relying on advertised headline prices.",
    },
    {
      question: "Does insurance cover testosterone therapy?",
      answer:
        "Coverage varies by plan, diagnosis documentation, and pharmacy benefits. Some men use cash-pay clinic packages. Confirm benefits with your insurer and the clinic's billing team.",
    },
    {
      question: "What is the difference between an online TRT clinic and an in-person clinic?",
      answer:
        "Online models emphasize remote visits and logistics; in-person clinics may offer examinations and procedures on site. Quality hinges on licensure, evaluation quality, monitoring, and transparency—not the video screen alone.",
    },
    {
      question: "Can TRT affect fertility?",
      answer:
        "Exogenous testosterone can suppress sperm production. Men planning children should discuss fertility-preserving strategies and specialist referral before starting therapy.",
    },
    {
      question: "Can TRT cause hair loss?",
      answer:
        "Some men notice hair changes while on therapy, especially with a predisposition to androgenetic alopecia. Individual responses differ; discuss concerns with your clinician.",
    },
    {
      question: "Can low testosterone cause belly fat?",
      answer:
        "Body composition and hormones can interact, but belly fat also relates to sleep, nutrition, activity, insulin resistance, medications, and aging. Weight change alone does not diagnose low testosterone.",
    },
    {
      question: "Should I see a urologist or men's health clinic for ED?",
      answer:
        "Either may be appropriate depending on history, complexity, and access. Primary care is also a reasonable starting point for many men. Choose a licensed clinician who can evaluate causes and refer when needed.",
    },
    {
      question: "Can ED treatment be obtained through telehealth?",
      answer:
        "When clinically appropriate and legally permitted, telehealth clinicians may evaluate and prescribe. Legitimate care still requires proper assessment, counseling about contraindications, and follow-up—not guaranteed prescriptions from unverified sellers.",
    },
  ],
  relatedTreatment: "testosterone-replacement-therapy",
  editorialStatus: "published",
  /** Public page is indexable; clinician medical review is still outstanding — do not display a “Medically Reviewed” badge. */
  medicalReviewStatus: "medical_review_required",
  seo: {
    title: "Low Testosterone and ED Symptoms in Men | Novalyte",
    description:
      "Fatigue, low libido, brain fog, belly fat, or weak erections? Learn what these symptoms may mean, how testing works, and how to choose a men's health clinic.",
    canonicalUrl: "https://novalyte.io/journal/low-testosterone-ed-fatigue-weight-gain-mens-health-clinic",
    noIndex: false,
  },
};

export const PILLAR_CONTENT_CLUSTER_ROADMAP: {
  title: string;
  plannedSlug: string;
  status: "planned";
}[] = [
  { title: "Low Testosterone Symptoms in Men: What to Know Before Seeking Treatment", plannedSlug: "low-testosterone-symptoms-men", status: "planned" },
  { title: "Normal Testosterone Levels by Age: Why One Number Is Not the Whole Story", plannedSlug: "testosterone-levels-men", status: "planned" },
  { title: "TRT Cost: Consultations, Labs, Medication, and Monitoring", plannedSlug: "trt-cost", status: "planned" },
  { title: "TRT Clinic vs Online TRT: How to Compare Care Models", plannedSlug: "trt-clinic-vs-online-trt", status: "planned" },
  { title: "Erectile Dysfunction After 40: Causes, Evaluation, and Treatment Conversations", plannedSlug: "erectile-dysfunction-treatment", status: "planned" },
  { title: "Testosterone Injections vs Creams vs Pellets", plannedSlug: "testosterone-injections-vs-creams-vs-pellets", status: "planned" },
  { title: "Can Low Testosterone Cause Weight Gain?", plannedSlug: "can-low-testosterone-cause-weight-gain", status: "planned" },
  { title: "How to Choose a Men's Health Clinic Near You", plannedSlug: "mens-health-clinic", status: "planned" },
  { title: "Men's Weight-Loss Clinics and Metabolic Health", plannedSlug: "mens-weight-loss-clinic", status: "planned" },
  { title: "Does TRT Affect Fertility?", plannedSlug: "does-trt-affect-fertility", status: "planned" },
];
