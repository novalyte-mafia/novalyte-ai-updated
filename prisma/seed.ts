// Novalyte AI — Development seed fixtures
// IMPORTANT: This data is clearly-marked, development-only sample data.
// None of these clinics, professionals, vendors, or metrics represent real entities.
// Replace before production launch.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function csv(...items: (string | undefined)[]): string {
  return items.filter(Boolean).join(",");
}

async function main() {
  console.log("🌱 Seeding Novalyte AI development fixtures...");

  // ── Clinics ──────────────────────────────────────────────
  const clinics = [
    {
      name: "Meridian Men's Health",
      slug: "meridian-mens-health",
      tagline: "Evidence-based optimization for modern men",
      overview:
        "Meridian Men's Health is a physician-led clinic focused on hormone optimization, metabolic health, and longevity medicine. Care is delivered through structured intake, lab-guided protocols, and ongoing provider support.",
      logoColor: "teal",
      city: "Austin",
      state: "TX",
      zip: "78701",
      serviceArea: "Greater Austin & telehealth across TX",
      specialties: csv("Testosterone Replacement Therapy", "Hormone Optimization", "Longevity Medicine", "Medical Weight Loss"),
      capabilities: csv("On-site phlebotomy", "Body composition analysis", "Telehealth", "Lab coordination"),
      telehealth: true,
      providerTypes: csv("Physician", "Nurse Practitioner"),
      phone: "(512) 555-0142",
      email: "care@meridianmenshealth.example",
      website: "https://example.com",
      hours: "Mon–Fri 8am–6pm, Sat 9am–1pm",
      verified: true,
      verificationStatus: "verified",
    },
    {
      name: "Summit Vitality Clinic",
      slug: "summit-vitality-clinic",
      tagline: "Performance, recovery, and preventive care",
      overview:
        "Summit Vitality Clinic combines preventive men's health with performance and recovery programs. Services include IV therapy, peptide protocols, and recovery technology alongside primary men's health care.",
      logoColor: "emerald",
      city: "Denver",
      state: "CO",
      zip: "80202",
      serviceArea: "Front Range & telehealth across CO",
      specialties: csv("Peptide Therapy", "Performance & Recovery", "Preventive Men's Health", "TRT"),
      capabilities: csv("Recovery suite", "Telehealth", "On-site phlebotomy"),
      telehealth: true,
      providerTypes: csv("Physician", "Physician Assistant"),
      phone: "(303) 555-0188",
      email: "hello@summitvitality.example",
      website: "https://example.com",
      hours: "Mon–Fri 7am–5pm",
      verified: true,
      verificationStatus: "verified",
    },
    {
      name: "Northpoint Wellness Collective",
      slug: "northpoint-wellness-collective",
      tagline: "Integrated men's health and sexual wellness",
      overview:
        "Northpoint Wellness offers integrated care across sexual wellness, hair restoration, and hormone health, with a coordinated team approach and structured consultation pathways.",
      logoColor: "blue",
      city: "Seattle",
      state: "WA",
      zip: "98101",
      serviceArea: "Puget Sound region",
      specialties: csv("Sexual Wellness", "Hair Restoration", "Erectile Dysfunction", "Hormone Optimization"),
      capabilities: csv("Telehealth", "In-person consults"),
      telehealth: true,
      providerTypes: csv("Physician", "Nurse Practitioner", "Medical Assistant"),
      phone: "(206) 555-0119",
      email: "intake@northpointwellness.example",
      website: "https://example.com",
      hours: "Mon–Sat 9am–6pm",
      verified: false,
      verificationStatus: "under_review",
    },
    {
      name: "Cardinal Health Partners",
      slug: "cardinal-health-partners",
      tagline: "Weight management and metabolic care",
      overview:
        "Cardinal Health Partners specializes in medical weight loss and GLP-1 programs, with dietitian-supported protocols and continuous progress monitoring.",
      logoColor: "amber",
      city: "Charlotte",
      state: "NC",
      zip: "28202",
      serviceArea: "Charlotte metro",
      specialties: csv("Medical Weight Loss", "GLP-1 Programs"),
      capabilities: csv("On-site phlebotomy", "Body composition analysis"),
      telehealth: false,
      providerTypes: csv("Physician", "Registered Nurse", "Medical Assistant"),
      phone: "(704) 555-0173",
      email: "info@cardinalhp.example",
      website: "https://example.com",
      hours: "Mon–Fri 8am–5pm",
      verified: true,
      verificationStatus: "verified",
    },
    {
      name: "Pacific Longevity Institute",
      slug: "pacific-longevity-institute",
      tagline: "Advanced longevity and preventive medicine",
      overview:
        "Pacific Longevity Institute delivers comprehensive longevity assessments, advanced diagnostics, and personalized prevention plans for men seeking long-term healthspan.",
      logoColor: "violet",
      city: "San Diego",
      state: "CA",
      zip: "92101",
      serviceArea: "Southern CA & nationwide telehealth",
      specialties: csv("Longevity Medicine", "Preventive Men's Health", "Hormone Optimization", "Peptide Therapy"),
      capabilities: csv("Advanced diagnostics", "Telehealth", "Body composition analysis"),
      telehealth: true,
      providerTypes: csv("Physician", "Physician Assistant", "Medical Director"),
      phone: "(619) 555-0150",
      email: "concierge@pacificlongevity.example",
      website: "https://example.com",
      hours: "Mon–Fri 9am–6pm",
      verified: false,
      verificationStatus: "pending",
    },
    {
      name: "Harbor Men's Clinic",
      slug: "harbor-mens-clinic",
      tagline: "Accessible men's health, close to home",
      overview:
        "Harbor Men's Clinic provides accessible primary men's health services including testosterone therapy, erectile dysfunction care, and preventive screening.",
      logoColor: "teal",
      city: "Tampa",
      state: "FL",
      zip: "33602",
      serviceArea: "Tampa Bay area",
      specialties: csv("TRT", "Erectile Dysfunction", "Preventive Men's Health"),
      capabilities: csv("In-person consults", "On-site phlebotomy"),
      telehealth: true,
      providerTypes: csv("Nurse Practitioner", "Medical Assistant"),
      phone: "(813) 555-0166",
      email: "team@harbormens.example",
      website: "https://example.com",
      hours: "Mon–Fri 8am–6pm, Sat 10am–2pm",
      verified: true,
      verificationStatus: "verified",
    },
  ];

  for (const c of clinics) {
    await db.clinic.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // ── Professionals ─────────────────────────────────────────
  const professionals = [
    {
      name: "Dr. Alan Pierce",
      title: "Physician",
      city: "Austin",
      state: "TX",
      remote: true,
      licenses: csv("MD"),
      licensedStates: csv("TX", "FL", "CO"),
      certifications: csv("ABFM", "A4M"),
      specialties: csv("TRT", "Hormone Optimization", "Longevity"),
      yearsExperience: 12,
      availability: "open",
      employmentPref: "full-time",
      bio: "Board-certified physician with over a decade in men's health and longevity medicine.",
      verified: true,
    },
    {
      name: "Sarah Whitfield, NP",
      title: "Nurse Practitioner",
      city: "Denver",
      state: "CO",
      remote: true,
      licenses: csv("NP"),
      licensedStates: csv("CO", "AZ", "TX"),
      certifications: csv("AANP"),
      specialties: csv("TRT", "Medical Weight Loss", "GLP-1"),
      yearsExperience: 7,
      availability: "open",
      employmentPref: "contract",
      bio: "Nurse practitioner focused on hormone health and metabolic medicine across multi-state telehealth.",
      verified: true,
    },
    {
      name: "Marcus Lee, PA-C",
      title: "Physician Assistant",
      city: "Seattle",
      state: "WA",
      remote: false,
      licenses: csv("PA-C"),
      licensedStates: csv("WA", "OR"),
      certifications: csv("NCCPA"),
      specialties: csv("Sexual Wellness", "Hair Restoration"),
      yearsExperience: 5,
      availability: "limited",
      employmentPref: "part-time",
      bio: "Physician assistant specializing in sexual wellness and aesthetic men's health services.",
      verified: false,
    },
    {
      name: "Dana Brooks, RN",
      title: "Registered Nurse",
      city: "Charlotte",
      state: "NC",
      remote: false,
      licenses: csv("RN"),
      licensedStates: csv("NC", "SC"),
      certifications: csv("BLS", "Phlebotomy"),
      specialties: csv("Medical Weight Loss", "Phlebotomy"),
      yearsExperience: 9,
      availability: "open",
      employmentPref: "full-time",
      bio: "Registered nurse with experience in weight management clinics and infusion protocols.",
      verified: true,
    },
    {
      name: "Dr. Priya Nair",
      title: "Medical Director",
      city: "San Diego",
      state: "CA",
      remote: true,
      licenses: csv("MD"),
      licensedStates: csv("CA", "NV", "AZ"),
      certifications: csv("ABIM", "A4M"),
      specialties: csv("Longevity", "Peptide Therapy", "Preventive"),
      yearsExperience: 15,
      availability: "limited",
      employmentPref: "contract",
      bio: "Medical director with extensive experience overseeing multi-state telehealth men's health programs.",
      verified: true,
    },
    {
      name: "James Okafor",
      title: "Patient Coordinator",
      city: "Tampa",
      state: "FL",
      remote: true,
      licenses: csv("—"),
      licensedStates: csv("FL"),
      certifications: csv("CHAA"),
      specialties: csv("Patient Conversion", "Intake"),
      yearsExperience: 4,
      availability: "open",
      employmentPref: "full-time",
      bio: "Patient coordinator focused on intake conversion and care navigation.",
      verified: false,
    },
    {
      name: "Elena Vasquez, MA",
      title: "Medical Assistant",
      city: "Austin",
      state: "TX",
      remote: false,
      licenses: csv("CMA"),
      licensedStates: csv("TX"),
      certifications: csv("CMA", "Phlebotomy"),
      specialties: csv("Phlebotomy", "Clinical Support"),
      yearsExperience: 3,
      availability: "open",
      employmentPref: "part-time",
      bio: "Certified medical assistant supporting clinical workflows and on-site phlebotomy.",
      verified: false,
    },
    {
      name: "Robert Chen",
      title: "Revenue Cycle Specialist",
      city: "Denver",
      state: "CO",
      remote: true,
      licenses: csv("—"),
      licensedStates: csv("CO"),
      certifications: csv("CRCR"),
      specialties: csv("Billing", "Credentialing"),
      yearsExperience: 11,
      availability: "open",
      employmentPref: "contract",
      bio: "Revenue cycle and credentialing specialist supporting independent men's health clinics.",
      verified: true,
    },
  ];

  for (const p of professionals) {
    await db.professional.create({ data: p }).catch(() => {});
  }

  // ── Job postings ──────────────────────────────────────────
  const jobs = [
    {
      clinicName: "Meridian Men's Health",
      title: "Nurse Practitioner — Telehealth",
      employmentType: "full-time",
      city: "Austin",
      state: "TX",
      remote: true,
      requiredLicenses: csv("NP"),
      requiredExperience: "2+ years men's health or endocrinology",
      treatmentSpecialties: csv("TRT", "Hormone Optimization", "Weight Loss"),
      compMin: 120000,
      compMax: 145000,
      schedule: "Mon–Fri, flexible telehealth blocks",
      description:
        "Lead telehealth consults for hormone optimization and metabolic care. Collaborate with medical director on protocol-driven treatment plans.",
      applicationRequirements: csv("Resume", "Active NP license", "Malpractice proof"),
    },
    {
      clinicName: "Summit Vitality Clinic",
      title: "Medical Assistant — Phlebotomy",
      employmentType: "full-time",
      city: "Denver",
      state: "CO",
      remote: false,
      requiredLicenses: csv("CMA", "Phlebotomy"),
      requiredExperience: "1+ year clinical",
      treatmentSpecialties: csv("Phlebotomy", "Recovery"),
      compMin: 48000,
      compMax: 58000,
      schedule: "Mon–Fri 7am–3pm",
      description:
        "Support clinical operations including phlebotomy, vitals, and recovery suite setup. Strong patient-facing communication required.",
      applicationRequirements: csv("Resume", "CMA certification"),
    },
    {
      clinicName: "Pacific Longevity Institute",
      title: "Medical Director (Contract)",
      employmentType: "contract",
      city: "San Diego",
      state: "CA",
      remote: true,
      requiredLicenses: csv("MD"),
      requiredExperience: "5+ years, multi-state telehealth oversight",
      treatmentSpecialties: csv("Longevity", "Peptide Therapy"),
      compMin: 180000,
      compMax: 220000,
      schedule: "Part-time oversight, ~10 hrs/week",
      description:
        "Provide medical direction across multi-state telehealth operations, oversee protocols, and support credentialing compliance.",
      applicationRequirements: csv("Resume", "MD license", "Board certification"),
    },
    {
      clinicName: "Harbor Men's Clinic",
      title: "Patient Coordinator",
      employmentType: "full-time",
      city: "Tampa",
      state: "FL",
      remote: false,
      requiredLicenses: csv("—"),
      requiredExperience: "2+ years patient-facing",
      treatmentSpecialties: csv("Intake"),
      compMin: 42000,
      compMax: 52000,
      schedule: "Mon–Fri 8am–5pm",
      description:
        "Manage intake calls, schedule consults, and guide patients from inquiry through consultation. Drive conversion through structured follow-up.",
      applicationRequirements: csv("Resume", "References"),
    },
    {
      clinicName: "Cardinal Health Partners",
      title: "Registered Nurse — Weight Management",
      employmentType: "part-time",
      city: "Charlotte",
      state: "NC",
      remote: false,
      requiredLicenses: csv("RN"),
      requiredExperience: "3+ years clinical",
      treatmentSpecialties: csv("Medical Weight Loss", "GLP-1"),
      compMin: 38,
      compMax: 45,
      schedule: "3 days/week",
      description:
        "Support GLP-1 and medical weight loss programs, including injections, progress monitoring, and patient education.",
      applicationRequirements: csv("Resume", "Active RN license"),
    },
  ];

  for (const j of jobs) {
    await db.jobPosting.create({ data: j }).catch(() => {});
  }

  // ── Vendors + marketplace listings ────────────────────────
  const vendorDefs = [
    { name: "Helix Diagnostics", slug: "helix-diagnostics", overview: "Reference laboratory services for men's health panels.", website: "https://example.com", verified: true },
    { name: "Apex Medical Supply", slug: "apex-medical-supply", overview: "Injection supplies, phlebotomy consumables, and clinical disposables.", verified: true },
    { name: "Nova Recovery Systems", slug: "nova-recovery-systems", overview: "Recovery and performance technology for men's health clinics.", verified: false },
    { name: "Clearpath Compliance", slug: "clearpath-compliance", overview: "Credentialing, compliance, and operational consulting.", verified: true },
    { name: "Cadence Clinic Software", slug: "cadence-clinic-software", overview: "Clinic management and patient engagement software.", verified: true },
  ];
  const vendorMap: Record<string, string> = {};
  for (const v of vendorDefs) {
    const created = await db.vendor.upsert({
      where: { slug: v.slug },
      update: {},
      create: v,
    });
    vendorMap[v.slug] = created.id;
  }

  const listings = [
    { vendorSlug: "helix-diagnostics", vendorName: "Helix Diagnostics", title: "Comprehensive Men's Health Lab Panel", slug: "mens-health-lab-panel", category: "Laboratory Services", listingType: "service", description: "Full hormone, metabolic, and lipid panel with rapid turnaround and clinician-friendly reporting.", pricingModel: "per-test", priceNote: "From $89/panel", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "apex-medical-supply", vendorName: "Apex Medical Supply", title: "Injection Supply Kit (100 ct)", slug: "injection-supply-kit", category: "Injection Supplies", listingType: "product", description: "Pre-assembled injection kits including syringes, sharps container, and prep materials.", pricingModel: "one-time", priceNote: "$120/case", availability: "in-stock", imageColor: "emerald", verified: true, reviewStatus: "approved" },
    { vendorSlug: "nova-recovery-systems", vendorName: "Nova Recovery Systems", title: "Body Composition Analyzer", slug: "body-composition-analyzer", category: "Body-Composition Systems", listingType: "product", description: "Medical-grade bioimpedance body composition system for tracking patient progress.", pricingModel: "quote", priceNote: "Request quote", availability: "made-to-order", imageColor: "blue", verified: false, reviewStatus: "pending" },
    { vendorSlug: "nova-recovery-systems", vendorName: "Nova Recovery Systems", title: "Red-Light Therapy Panel", slug: "red-light-therapy-panel", category: "Recovery Technology", listingType: "product", description: "Clinical red-light therapy panel designed for recovery and performance protocols.", pricingModel: "one-time", priceNote: "$2,400/unit", availability: "in-stock", imageColor: "amber", verified: false, reviewStatus: "pending" },
    { vendorSlug: "clearpath-compliance", vendorName: "Clearpath Compliance", title: "Credentialing & Compliance Support", slug: "credentialing-compliance-support", category: "Credentialing Services", listingType: "service", description: "End-to-end provider credentialing, license verification, and compliance program development.", pricingModel: "subscription", priceNote: "From $1,200/mo", availability: "in-stock", imageColor: "violet", verified: true, reviewStatus: "approved" },
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "Clinic Management Platform", slug: "clinic-management-platform", category: "Clinic Software", listingType: "software", description: "All-in-one platform for scheduling, intake, charting, and patient engagement.", pricingModel: "subscription", priceNote: "From $399/mo", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "helix-diagnostics", vendorName: "Helix Diagnostics", title: "Telehealth Lab Coordination Service", slug: "telehealth-lab-coordination", category: "Laboratory Services", listingType: "service", description: "Coordinate at-home and partner-lab draws for telehealth patients nationwide.", pricingModel: "per-test", priceNote: "From $25/draw", availability: "in-stock", imageColor: "emerald", verified: true, reviewStatus: "approved" },
    { vendorSlug: "clearpath-compliance", vendorName: "Clearpath Compliance", title: "Billing & Revenue Cycle Services", slug: "billing-revenue-cycle", category: "Billing Services", listingType: "service", description: "Full-service medical billing and revenue cycle management tailored to men's health practices.", pricingModel: "percentage", priceNote: "3–5% of collections", availability: "in-stock", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "apex-medical-supply", vendorName: "Apex Medical Supply", title: "Phlebotomy Consumables Bundle", slug: "phlebotomy-consumables-bundle", category: "Phlebotomy Supplies", listingType: "product", description: "Monthly bundle of tubes, needles, and collection supplies for high-volume clinics.", pricingModel: "subscription", priceNote: "$180/mo", availability: "in-stock", imageColor: "amber", verified: true, reviewStatus: "approved" },
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "Patient Engagement Suite", slug: "patient-engagement-suite", category: "Patient Engagement Tools", listingType: "software", description: "Automated outreach, re-engagement, and educational content delivery for men's health patients.", pricingModel: "subscription", priceNote: "From $199/mo", availability: "in-stock", imageColor: "violet", verified: true, reviewStatus: "approved" },
  ];

  for (const l of listings) {
    const { vendorSlug, ...data } = l;
    await db.marketplaceListing.upsert({
      where: { slug: l.slug },
      update: {},
      create: { ...data, vendorId: vendorMap[vendorSlug] },
    });
  }

  // ── Articles ──────────────────────────────────────────────
  const articles = [
    {
      title: "Understanding Testosterone Replacement Therapy: A Patient Overview",
      slug: "understanding-trt-overview",
      category: "Testosterone",
      excerpt: "An educational overview of testosterone replacement therapy, how it's typically approached, and what to discuss with a licensed provider.",
      content: "Testosterone replacement therapy (TRT) is a treatment approach used when a licensed healthcare provider confirms clinically low testosterone. This article is educational and does not constitute medical advice.\n\nMen's testosterone levels naturally change with age. When levels fall below a clinical threshold and symptoms are present, providers may evaluate whether TRT is appropriate. Evaluation typically includes a medical history, physical exam, and laboratory testing.\n\nCommon reasons a provider may discuss TRT include persistent fatigue, low libido, and changes in mood — but only when supported by lab findings. Treatment, if recommended, is closely monitored through follow-up labs and symptom tracking.\n\nQuestions to ask a provider:\n- What do my lab results indicate?\n- What are the potential benefits and risks for me?\n- How will treatment be monitored?\n- What lifestyle factors may support outcomes?\n\nNovalyte AI does not diagnose or prescribe. All clinical decisions are made by licensed healthcare professionals.",
      author: "Novalyte Editorial Team",
      medicalReviewer: "Novalyte Medical Review (placeholder — requires licensed reviewer)",
      readingTime: 6,
      references: csv("Educational summary — not a clinical reference"),
      relatedTreatment: "Testosterone Replacement Therapy",
    },
    {
      title: "GLP-1 Medications and Medical Weight Loss: What to Know",
      slug: "glp-1-medical-weight-loss",
      category: "Weight Management",
      excerpt: "An informational look at how GLP-1 medications fit into medically supervised weight loss programs.",
      content: "GLP-1 receptor agonists are a class of medications that some providers consider as part of a broader medical weight loss program. This article is informational only.\n\nMedical weight loss typically combines nutrition guidance, behavioral support, activity recommendations, and — when clinically appropriate — medication. A licensed provider determines whether medication is suitable based on individual health factors.\n\nIf medication is prescribed, ongoing monitoring is standard. Patients should discuss benefits, risks, costs, and alternatives with their provider.\n\nNovalyte AI is a technology platform and does not prescribe medication. Consult a licensed healthcare professional for personal medical decisions.",
      author: "Novalyte Editorial Team",
      medicalReviewer: "Novalyte Medical Review (placeholder — requires licensed reviewer)",
      readingTime: 5,
      references: csv("Educational summary"),
      relatedTreatment: "Medical Weight Loss",
    },
    {
      title: "The State of Men's Health Clinic Operations",
      slug: "state-of-mens-health-clinic-operations",
      category: "Clinic Operations",
      excerpt: "Why fragmented systems limit clinic growth, and how connected infrastructure changes the economics.",
      content: "Men's health clinics increasingly operate across disconnected systems: marketing tools, intake forms, EHRs, staffing agencies, and equipment vendors. This fragmentation creates hidden costs.\n\nConnected infrastructure coordinates demand generation, intake, workforce, and sourcing — reducing operational drag and supporting scalable growth.\n\nThis article reflects Novalyte AI's perspective on industry operations and is not clinical advice.",
      author: "Novalyte Strategy Team",
      medicalReviewer: null,
      readingTime: 7,
      references: csv("Industry observation"),
      relatedTreatment: null,
    },
    {
      title: "Recruiting Specialized Talent in Men's Health",
      slug: "recruiting-specialized-talent-mens-health",
      category: "Workforce",
      excerpt: "Why hiring nurse practitioners, medical directors, and coordinators for men's health is uniquely difficult — and how to approach it.",
      content: "Men's health clinics need specialized talent: experienced NPs, medical directors for telehealth oversight, phlebotomists, and patient coordinators who can convert inquiries into consults.\n\nGeneral healthcare job boards rarely surface candidates with men's health-specific experience. Specialized marketplaces that filter by licensure, state, and specialty improve match quality.\n\nClinics remain responsible for background checks, credential verification, and hiring decisions.",
      author: "Novalyte Workforce Team",
      medicalReviewer: null,
      readingTime: 5,
      references: csv("Industry observation"),
      relatedTreatment: null,
    },
    {
      title: "Longevity Medicine: Separating Science from Hype",
      slug: "longevity-medicine-science-vs-hype",
      category: "Longevity",
      excerpt: "A grounded look at what longevity medicine includes today, and how to evaluate claims critically.",
      content: "Longevity medicine is an emerging field focused on healthspan — the portion of life lived in good health. It draws on preventive care, advanced diagnostics, and lifestyle intervention.\n\nBecause the field is emerging, claims can outpace evidence. Patients should look for providers who ground recommendations in lab data, monitor outcomes, and avoid overpromising.\n\nNovalyte AI does not endorse specific longevity protocols. Consult a licensed provider for personal guidance.",
      author: "Novalyte Editorial Team",
      medicalReviewer: "Novalyte Medical Review (placeholder — requires licensed reviewer)",
      readingTime: 8,
      references: csv("Educational summary"),
      relatedTreatment: "Longevity Medicine",
    },
    {
      title: "Building a Compliant Telehealth Men's Health Practice",
      slug: "compliant-telehealth-mens-health",
      category: "Healthcare Technology",
      excerpt: "Operational and structural considerations for delivering men's health care across state lines.",
      content: "Multi-state telehealth requires attention to licensure, medical direction, and clinical workflows. This article outlines operational considerations, not legal advice.\n\nClinics should confirm licensure in each state of operation, establish medical direction appropriate to their model, and maintain documentation. Legal counsel is recommended.\n\nNovalyte AI is a technology facilitator and does not provide legal or medical guidance.",
      author: "Novalyte Strategy Team",
      medicalReviewer: null,
      readingTime: 6,
      references: csv("Operational overview"),
      relatedTreatment: null,
    },
  ];

  for (const a of articles) {
    await db.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: a,
    });
  }

  console.log("✅ Seed complete.");
  console.log(`   Clinics: ${await db.clinic.count()}`);
  console.log(`   Professionals: ${await db.professional.count()}`);
  console.log(`   Jobs: ${await db.jobPosting.count()}`);
  console.log(`   Vendors: ${await db.vendor.count()}`);
  console.log(`   Listings: ${await db.marketplaceListing.count()}`);
  console.log(`   Articles: ${await db.article.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
