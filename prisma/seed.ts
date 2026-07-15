import { db } from "../src/lib/db";

function csv(...items: (string | undefined)[]): string {
  return items.filter(Boolean).join(",");
}

async function main() {
  console.log("🌱 Seeding Novalyte AI development fixtures...");

  // ── Clinics ──────────────────────────────────────────────
  // Clear existing clinics to prevent primary key or relation issues during development
  await db.clinic.deleteMany();
  console.log("Cleared old clinics.");

  const clinics = [
    {
      name: "Meridian Men's Health",
      slug: "meridian-mens-health",
      tagline: "Evidence-based optimization for modern men",
      overview: "Meridian Men's Health is a physician-led clinic focused on hormone optimization, metabolic health, and longevity medicine. Care is delivered through structured intake, lab-guided protocols, and ongoing provider support.",
      logoColor: "teal",
      city: "Austin",
      state: "TX",
      zip: "78701",
      serviceArea: "Greater Austin & telehealth across TX",
      specialties: csv("Testosterone Replacement Therapy", "Hormone Optimization", "Longevity Medicine", "Medical Weight Loss"),
      capabilities: csv("On-site phlebotomy", "Body composition analysis", "Telehealth", "Lab coordination", "Online scheduling", "Secure patient portal"),
      telehealth: true,
      providerTypes: csv("Physician", "Nurse Practitioner"),
      phone: "(512) 555-0142",
      email: "care@meridianmenshealth.example",
      website: "https://example.com",
      hours: "Mon–Fri 8am–6pm, Sat 9am–1pm",
      verified: true,
      verificationStatus: "verified",
      // Extended fields:
      acceptingNewPatients: true,
      claimStatus: "claimed",
      profileCompleteness: 90,
      initialConsultPrice: 150,
      membershipPrice: 99,
      insuranceAccepted: false,
      hsaFsaAccepted: true,
      earliestAvailability: "Next day",
      statesServed: "TX, FL, CO",
      languages: "English, Spanish",
      accessibility: "Fully accessible",
      pricingStatus: "Full Pricing Published",
      whatToExpect: "Initial consultation, Intake form submission, Comprehensive lab panel, Medical review & protocol design, In-clinic or home delivery setup",
      locations: [
        { name: "Downtown Austin Office", address: "100 Congress Ave, Austin, TX 78701", phone: "(512) 555-0142", hours: "Mon–Fri 8am–6pm, Sat 9am–1pm", parking: "Garage validation available", transit: "Bus lines 1, 2, 7, 10", accessibility: "Wheelchair accessible ramps and elevators", onSiteLab: true, phlebotomy: true, earliestAppt: "Next day" },
        { name: "Dallas North Metro Office", address: "5400 Legacy Dr, Plano, TX 75024", phone: "(469) 555-0211", hours: "Mon–Fri 9am–5pm", parking: "On-site open parking", transit: "Plano park & ride nearby", accessibility: "Ground level entrance", onSiteLab: false, phlebotomy: true, earliestAppt: "3 days" }
      ],
      providers: [
        { name: "Dr. Alan Pierce", credentials: "MD", role: "Medical Director", specialties: "TRT, Hormone Optimization, Longevity", yearsExperience: 12, bio: "Board-certified physician with over a decade in men's health and longevity medicine.", languages: "English, Spanish", telehealth: true, avatarUrl: null },
        { name: "Sarah Whitfield, NP", credentials: "NP", role: "Nurse Practitioner", specialties: "TRT, Medical Weight Loss, GLP-1", yearsExperience: 7, bio: "Nurse practitioner focused on hormone health and metabolic medicine across multi-state telehealth.", languages: "English", telehealth: true, avatarUrl: null }
      ],
      treatments: [
        { name: "Testosterone Replacement Therapy (TRT)", category: "Hormone Optimization", description: "Evidence-based TRT via injections or topical gels. Includes lab tests, provider follow-ups, and home medication shipping.", concerns: "Low libido, Low energy, Muscle loss, Brain fog", priceRange: "$100 - $200 / month", labRequired: true, consultRequired: true, careFormat: "hybrid" },
        { name: "Medical Weight Loss & GLP-1", category: "Weight Management", description: "Medically supervised weight management using Semaglutide or Tirzepatide, paired with metabolic monitoring.", concerns: "Weight gain, Slow metabolism, Insulin resistance", priceRange: "$249 - $399 / month", labRequired: true, consultRequired: true, careFormat: "telehealth" },
        { name: "Hormone Evaluation", category: "Diagnostics", description: "Comprehensive lab panel testing total & free testosterone, estradiol, SHBG, thyroid profile, and blood counts.", concerns: "General wellness, Fatigue, Poor sleep", priceRange: "$150 / panel", labRequired: true, consultRequired: true, careFormat: "in-person" }
      ],
      reviews: [
        { rating: 5, author: "John D.", content: "Great clinic. Professional staff and quick turnaround on labs. Highly recommend for TRT.", category: "Testosterone", verifiedPatient: true, response: "Thank you for the feedback, John! We are glad to support you." },
        { rating: 4, author: "Mark R.", content: "Very happy with the telehealth options. The NP was extremely thorough.", category: "Telehealth", verifiedPatient: true, response: null }
      ]
    },
    {
      name: "Summit Vitality Clinic",
      slug: "summit-vitality-clinic",
      tagline: "Performance, recovery, and preventive care",
      overview: "Summit Vitality Clinic combines preventive men's health with performance and recovery programs. Services include IV therapy, peptide protocols, and recovery technology alongside primary men's health care.",
      logoColor: "emerald",
      city: "Denver",
      state: "CO",
      zip: "80202",
      serviceArea: "Front Range & telehealth across CO",
      specialties: csv("Peptide Therapy", "Performance & Recovery", "Preventive Men's Health", "TRT"),
      capabilities: csv("Recovery suite", "Telehealth", "On-site phlebotomy", "Imaging access", "Secure messaging"),
      telehealth: true,
      providerTypes: csv("Physician", "Physician Assistant"),
      phone: "(303) 555-0188",
      email: "hello@summitvitality.example",
      website: "https://example.com",
      hours: "Mon–Fri 7am–5pm",
      verified: true,
      verificationStatus: "verified",
      // Extended fields:
      acceptingNewPatients: true,
      claimStatus: "claimed",
      profileCompleteness: 85,
      initialConsultPrice: 100,
      membershipPrice: 120,
      insuranceAccepted: false,
      hsaFsaAccepted: true,
      earliestAvailability: "2 days",
      statesServed: "CO, AZ, UT",
      languages: "English",
      accessibility: "Wheelchair accessible",
      pricingStatus: "Partial Pricing Published",
      whatToExpect: "Initial consultation, Recovery suite tour, Personalized peptide/TRT setup, Weekly recovery tracking",
      locations: [
        { name: "Denver LoDo Office", address: "1600 Wynkoop St, Denver, CO 80202", phone: "(303) 555-0188", hours: "Mon–Fri 7am–5pm", parking: "Valet parking available", transit: "Union Station bus/rail terminal", accessibility: "Elevator access", onSiteLab: true, phlebotomy: true, earliestAppt: "2 days" }
      ],
      providers: [
        { name: "Dr. Alan Pierce", credentials: "MD", role: "Consulting Physician", specialties: "Preventive Care, Hormones", yearsExperience: 12, bio: "Collaborates on medical oversight for performance protocols.", languages: "English, Spanish", telehealth: true, avatarUrl: null },
        { name: "Marcus Lee, PA-C", credentials: "PA-C", role: "Physician Assistant", specialties: "Peptide Therapy, Performance", yearsExperience: 5, bio: "Physician assistant specializing in sexual wellness and aesthetic men's health services.", languages: "English", telehealth: false, avatarUrl: null }
      ],
      treatments: [
        { name: "Peptide Therapy Protocols", category: "Peptide Therapy", description: "Custom peptide formulations (Sermorelin, Ipamorelin) for muscle recovery, tissue repair, and healthspan support.", concerns: "Poor recovery, Muscle loss, Aging", priceRange: "$150 - $300 / month", labRequired: true, consultRequired: true, careFormat: "hybrid" },
        { name: "Performance & Recovery Infusions", category: "IV Therapy", description: "Amino acid and hydration IV therapy optimized for athletes and recovery.", concerns: "Fatigue, Dehydration, Low energy", priceRange: "$99 / session", labRequired: false, consultRequired: true, careFormat: "in-person" }
      ],
      reviews: [
        { rating: 5, author: "David S.", content: "The recovery suite is unmatched. Helped my recovery time significantly.", category: "Performance", verifiedPatient: true, response: "Glad we could help you reach your goals, David!" }
      ]
    },
    {
      name: "Northpoint Wellness Collective",
      slug: "northpoint-wellness-collective",
      tagline: "Integrated men's health and sexual wellness",
      overview: "Northpoint Wellness offers integrated care across sexual wellness, hair restoration, and hormone health, with a coordinated team approach and structured consultation pathways.",
      logoColor: "blue",
      city: "Seattle",
      state: "WA",
      zip: "98101",
      serviceArea: "Puget Sound region",
      specialties: csv("Sexual Wellness", "Hair Restoration", "Erectile Dysfunction", "Hormone Optimization"),
      capabilities: csv("Telehealth", "In-person consults", "Online scheduling"),
      telehealth: true,
      providerTypes: csv("Physician", "Nurse Practitioner", "Medical Assistant"),
      phone: "(206) 555-0119",
      email: "intake@northpointwellness.example",
      website: "https://example.com",
      hours: "Mon–Sat 9am–6pm",
      verified: false,
      verificationStatus: "under_review",
      // Extended fields:
      acceptingNewPatients: true,
      claimStatus: "unclaimed",
      profileCompleteness: 60,
      initialConsultPrice: 175,
      membershipPrice: null,
      insuranceAccepted: true,
      hsaFsaAccepted: true,
      earliestAvailability: "Same day",
      statesServed: "WA, OR",
      languages: "English, French",
      accessibility: "Elevator access",
      pricingStatus: "Consultation Pricing Available",
      whatToExpect: "Intake form, Confidential consultation, Custom compound selection",
      locations: [
        { name: "Downtown Seattle Clinic", address: "1201 3rd Ave, Seattle, WA 98101", phone: "(206) 555-0119", hours: "Mon–Sat 9am–6pm", parking: "Garage parking, no validation", transit: "University Street Station LRT", accessibility: "Elevators available", onSiteLab: false, phlebotomy: false, earliestAppt: "Same day" }
      ],
      providers: [
        { name: "Marcus Lee, PA-C", credentials: "PA-C", role: "Physician Assistant", specialties: "Sexual Wellness, Aesthetics", yearsExperience: 5, bio: "Physician assistant specializing in sexual wellness and aesthetic men's health services.", languages: "English", telehealth: true, avatarUrl: null }
      ],
      treatments: [
        { name: "Erectile Dysfunction Care", category: "Sexual Health", description: "Personalized medical management for erectile dysfunction, including tailored sublingual medications.", concerns: "Erectile difficulties", priceRange: "$50 - $150 / month", labRequired: false, consultRequired: true, careFormat: "telehealth" },
        { name: "Hair Restoration Treatment", category: "Aesthetics", description: "Topical and oral combinations of Finasteride/Minoxidil to target male pattern baldness.", concerns: "Hair loss", priceRange: "$99 - $199 / month", labRequired: false, consultRequired: true, careFormat: "telehealth" }
      ],
      reviews: [
        { rating: 5, author: "Chris T.", content: "Highly discreet and professional. Vance was the best provider.", category: "Sexual Wellness", verifiedPatient: true, response: null }
      ]
    },
    {
      name: "Cardinal Health Partners",
      slug: "cardinal-health-partners",
      tagline: "Weight management and metabolic care",
      overview: "Cardinal Health Partners specializes in medical weight loss and GLP-1 programs, with dietitian-supported protocols and continuous progress monitoring.",
      logoColor: "amber",
      city: "Charlotte",
      state: "NC",
      zip: "28202",
      serviceArea: "Charlotte metro",
      specialties: csv("Medical Weight Loss", "GLP-1 Programs"),
      capabilities: csv("On-site phlebotomy", "Body composition analysis", "Prescription delivery", "Secure patient portal", "Online scheduling"),
      telehealth: false,
      providerTypes: csv("Physician", "Registered Nurse", "Medical Assistant"),
      phone: "(704) 555-0173",
      email: "info@cardinalhp.example",
      website: "https://example.com",
      hours: "Mon–Fri 8am–5pm",
      verified: true,
      verificationStatus: "verified",
      // Extended fields:
      acceptingNewPatients: true,
      claimStatus: "claimed",
      profileCompleteness: 95,
      initialConsultPrice: 0,
      membershipPrice: 249,
      insuranceAccepted: false,
      hsaFsaAccepted: true,
      earliestAvailability: "3 days",
      statesServed: "NC, SC, GA",
      languages: "English",
      accessibility: "Ramp and wide doors",
      pricingStatus: "Full Pricing Published",
      whatToExpect: "Free initial assessment, Body composition analysis, GLP-1 self-injection training, Weekly checkins, Monthly nutrition consultation",
      locations: [
        { name: "Uptown Charlotte Clinic", address: "201 S Tryon St, Charlotte, NC 28202", phone: "(704) 555-0173", hours: "Mon–Fri 8am–5pm", parking: "Street parking and validations available", transit: "LNX light rail stop", accessibility: "Ramps and wide entryways", onSiteLab: true, phlebotomy: true, earliestAppt: "3 days" }
      ],
      providers: [
        { name: "Dana Brooks, RN", credentials: "RN", role: "Registered Nurse", specialties: "Weight Management, Phlebotomy", yearsExperience: 9, bio: "Registered nurse with experience in weight management clinics and infusion protocols.", languages: "English", telehealth: false, avatarUrl: null }
      ],
      treatments: [
        { name: "GLP-1 Medical Weight Loss Program", category: "Weight Management", description: "Comprehensive weight management protocol utilizing compounded Semaglutide or Tirzepatide. Includes nurse injections or home delivery training.", concerns: "Weight gain, Insulin resistance", priceRange: "$249 - $349 / month", labRequired: true, consultRequired: true, careFormat: "in-person" },
        { name: "Body Composition Analysis", category: "Diagnostics", description: "Advanced segment bioelectrical impedance analysis to track fat, lean muscle mass, and water distribution.", concerns: "Weight gain", priceRange: "$49 / scan", labRequired: false, consultRequired: false, careFormat: "in-person" }
      ],
      reviews: [
        { rating: 5, author: "James L.", content: "Down 30 pounds in 4 months. The dietitian and RN support makes a huge difference.", category: "Weight Loss", verifiedPatient: true, response: "We are thrilled for you, James! Keep up the great work." }
      ]
    },
    {
      name: "Pacific Longevity Institute",
      slug: "pacific-longevity-institute",
      tagline: "Advanced longevity and preventive medicine",
      overview: "Pacific Longevity Institute delivers comprehensive longevity assessments, advanced diagnostics, and personalized prevention plans for men seeking long-term healthspan.",
      logoColor: "violet",
      city: "San Diego",
      state: "CA",
      zip: "92101",
      serviceArea: "Southern CA & nationwide telehealth",
      specialties: csv("Longevity Medicine", "Preventive Men's Health", "Hormone Optimization", "Peptide Therapy"),
      capabilities: csv("Advanced diagnostics", "Telehealth", "Body composition analysis", "Imaging access", "Secure patient portal"),
      telehealth: true,
      providerTypes: csv("Physician", "Physician Assistant", "Medical Director"),
      phone: "(619) 555-0150",
      email: "concierge@pacificlongevity.example",
      website: "https://example.com",
      hours: "Mon–Fri 9am–6pm",
      verified: false,
      verificationStatus: "pending",
      // Extended fields:
      acceptingNewPatients: true,
      claimStatus: "claimed",
      profileCompleteness: 88,
      initialConsultPrice: 350,
      membershipPrice: 300,
      insuranceAccepted: false,
      hsaFsaAccepted: false,
      earliestAvailability: "5 days",
      statesServed: "CA, NV, AZ, OR, WA",
      languages: "English, Mandarin",
      accessibility: "Fully accessible",
      pricingStatus: "Full Pricing Published",
      whatToExpect: "Comprehensive biomarker panel, DEXA scan, Advanced longevity consultation, healthspan plan implementation, continuous remote monitoring",
      locations: [
        { name: "La Jolla Flagship Facility", address: "4225 Executive Dr, La Jolla, CA 92037", phone: "(619) 555-0150", hours: "Mon–Fri 9am–6pm", parking: "Complimentary valet parking", transit: "UCSD Blue Line Trolley stop", accessibility: "Full ADA compliance", onSiteLab: true, phlebotomy: true, earliestAppt: "5 days" }
      ],
      providers: [
        { name: "Dr. Priya Nair", credentials: "MD", role: "Medical Director", specialties: "Longevity, Peptide Therapy, Hormones", yearsExperience: 15, bio: "Medical director with extensive experience overseeing multi-state telehealth men's health programs.", languages: "English, Mandarin", telehealth: true, avatarUrl: null }
      ],
      treatments: [
        { name: "Longevity & Healthspan Assessment", category: "Longevity", description: "Comprehensive clinical analysis tracking biological age, VO2 max estimation, lipid panels, inflammation markers, and DEXA scans.", concerns: "Preventive health, Cognitive health, General wellness", priceRange: "$350 / session", labRequired: true, consultRequired: true, careFormat: "hybrid" },
        { name: "Advanced Biomarker Screenings", category: "Diagnostics", description: "Testing for metabolic markers, cardiovascular inflammation, full hormone cascade, and micronutrient status.", concerns: "Fatigue, Brain fog, Risk screening", priceRange: "$499 / panel", labRequired: true, consultRequired: true, careFormat: "hybrid" }
      ],
      reviews: [
        { rating: 5, author: "Richard M.", content: "Incredibly thorough. They look at biomarkers that other doctors ignore.", category: "Longevity", verifiedPatient: true, response: "Thank you, Richard. Our goal is to extend healthspan." }
      ]
    },
    {
      name: "Harbor Men's Clinic",
      slug: "harbor-mens-clinic",
      tagline: "Accessible men's health, close to home",
      overview: "Harbor Men's Clinic provides accessible primary men's health services including testosterone therapy, erectile dysfunction care, and preventive screening.",
      logoColor: "teal",
      city: "Tampa",
      state: "FL",
      zip: "33602",
      serviceArea: "Tampa Bay area",
      specialties: csv("TRT", "Erectile Dysfunction", "Preventive Men's Health"),
      capabilities: csv("In-person consults", "On-site phlebotomy", "Prescription delivery", "Secure messaging"),
      telehealth: true,
      providerTypes: csv("Nurse Practitioner", "Medical Assistant"),
      phone: "(813) 555-0166",
      email: "team@harbormens.example",
      website: "https://example.com",
      hours: "Mon–Fri 8am–6pm, Sat 10am–2pm",
      verified: true,
      verificationStatus: "verified",
      // Extended fields:
      acceptingNewPatients: true,
      claimStatus: "unclaimed",
      profileCompleteness: 70,
      initialConsultPrice: 49,
      membershipPrice: 89,
      insuranceAccepted: true,
      hsaFsaAccepted: true,
      earliestAvailability: "Same day",
      statesServed: "FL, GA",
      languages: "English, Spanish",
      accessibility: "Wheelchair accessible",
      pricingStatus: "Full Pricing Published",
      whatToExpect: "Initial consult with provider, Rapid lab testing on-site, Custom protocol selection, Free prescription shipping",
      locations: [
        { name: "Tampa Bay Main Office", address: "401 E Jackson St, Tampa, FL 33602", phone: "(813) 555-0166", hours: "Mon–Fri 8am–6pm, Sat 10am–2pm", parking: "Garage parking, fee applies", transit: "TECO Line Streetcar", accessibility: "Wheelchair accessible", onSiteLab: true, phlebotomy: true, earliestAppt: "Same day" }
      ],
      providers: [
        { name: "Elena Vasquez, MA", credentials: "CMA", role: "Medical Assistant", specialties: "Phlebotomy, Patient Support", yearsExperience: 3, bio: "Certified medical assistant supporting clinical workflows and on-site phlebotomy.", languages: "English, Spanish", telehealth: false, avatarUrl: null }
      ],
      treatments: [
        { name: "Low-Testosterone Protocol (TRT)", category: "Hormone Optimization", description: "Affordable, provider-led testosterone replacement therapy. In-office injections or home shipping.", concerns: "Low testosterone, Low energy, Muscle loss", priceRange: "$89 / month", labRequired: true, consultRequired: true, careFormat: "hybrid" },
        { name: "Erectile Dysfunction Medication", category: "Sexual Health", description: "Sildenafil or Tadalafil prescriptions with quick telehealth screening and discreet packaging.", concerns: "Erectile difficulties", priceRange: "$39 / month", labRequired: false, consultRequired: true, careFormat: "telehealth" }
      ],
      reviews: [
        { rating: 4, author: "Will G.", content: "Fast service and very affordable consult fee. Highly recommended.", category: "Hormones", verifiedPatient: true, response: null }
      ]
    }
  ];

  for (const c of clinics) {
    const { locations, providers, treatments, reviews, ...clinicData } = c;
    await db.clinic.create({
      data: {
        ...clinicData,
        locations: { create: locations },
        providers: { create: providers },
        treatments: { create: treatments },
        reviews: { create: reviews }
      }
    });
  }
  console.log(`Successfully seeded ${clinics.length} clinics with relational details.`);

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
    // ── Men's health specialty roles (retained) ──────────────
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
      title: "Medical Director — Longevity and Telehealth",
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
      title: "Patient Coordinator — Men's Health",
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
      title: "Registered Nurse — Medical Weight Management",
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
    // ── Broader healthcare roles ─────────────────────────────
    {
      clinicName: "Riverside Outpatient Center",
      title: "Registered Nurse — Outpatient Care",
      employmentType: "full-time",
      city: "Phoenix",
      state: "AZ",
      remote: false,
      requiredLicenses: csv("RN"),
      requiredExperience: "2+ years outpatient or ambulatory",
      treatmentSpecialties: csv("Primary Care", "Outpatient"),
      compMin: 75000,
      compMax: 95000,
      schedule: "Mon–Fri 8am–5pm",
      description: "Provide direct patient care in a busy outpatient setting. Triage, vitals, patient education, and care coordination.",
      applicationRequirements: csv("Resume", "Active RN license", "BLS"),
    },
    {
      clinicName: "TeleCare Health Network",
      title: "Nurse Practitioner — Telehealth",
      employmentType: "full-time",
      city: "Remote",
      state: "CA",
      remote: true,
      requiredLicenses: csv("NP"),
      requiredExperience: "3+ years, multi-state telehealth preferred",
      treatmentSpecialties: csv("Telehealth", "Primary Care"),
      compMin: 115000,
      compMax: 140000,
      schedule: "Flexible, 40 hrs/week",
      description: "Conduct virtual primary care and urgent care visits across multiple states. Collaborate with care coordination team.",
      applicationRequirements: csv("Resume", "NP license", "Multi-state licensure"),
    },
    {
      clinicName: "Summit Vitality Clinic",
      title: "Medical Assistant — TRT Clinic",
      employmentType: "full-time",
      city: "Denver",
      state: "CO",
      remote: false,
      requiredLicenses: csv("CMA"),
      requiredExperience: "1+ year clinical, men's health preferred",
      treatmentSpecialties: csv("TRT", "Phlebotomy"),
      compMin: 45000,
      compMax: 55000,
      schedule: "Mon–Fri 7am–4pm",
      description: "Room patients, draw labs, assist providers, and manage clinical workflow in a TRT-focused practice.",
      applicationRequirements: csv("Resume", "CMA certification"),
    },
    {
      clinicName: "Gateway Medical Group",
      title: "Patient Intake Coordinator",
      employmentType: "full-time",
      city: "Nashville",
      state: "TN",
      remote: false,
      requiredLicenses: csv("—"),
      requiredExperience: "1+ year healthcare admin",
      treatmentSpecialties: csv("Patient Access", "Scheduling"),
      compMin: 40000,
      compMax: 48000,
      schedule: "Mon–Fri 8am–5pm",
      description: "Greet patients, verify insurance, collect copays, schedule appointments, and manage intake documentation.",
      applicationRequirements: csv("Resume", "References"),
    },
    {
      clinicName: "Evergreen Practice Management",
      title: "Practice Operations Manager",
      employmentType: "full-time",
      city: "Seattle",
      state: "WA",
      remote: false,
      requiredLicenses: csv("—"),
      requiredExperience: "5+ years healthcare operations",
      treatmentSpecialties: csv("Operations", "Management"),
      compMin: 85000,
      compMax: 110000,
      schedule: "Mon–Fri, some evenings",
      description: "Oversee daily operations of a multi-provider practice. Manage staff, workflows, budgets, and patient experience metrics.",
      applicationRequirements: csv("Resume", "Cover letter", "References"),
    },
    {
      clinicName: "Mindful Health Behavioral",
      title: "Behavioral Health Therapist",
      employmentType: "full-time",
      city: "Portland",
      state: "OR",
      remote: true,
      requiredLicenses: csv("LCSW", "LPC"),
      requiredExperience: "3+ years clinical therapy",
      treatmentSpecialties: csv("Behavioral Health", "Therapy"),
      compMin: 80000,
      compMax: 100000,
      schedule: "Flexible, 35 hrs/week",
      description: "Provide individual and group therapy via telehealth. Collaborative care model with integrated primary care team.",
      applicationRequirements: csv("Resume", "License", "Malpractice proof"),
    },
    {
      clinicName: "Apex Rehabilitation Center",
      title: "Physical Therapist",
      employmentType: "full-time",
      city: "Chicago",
      state: "IL",
      remote: false,
      requiredLicenses: csv("DPT"),
      requiredExperience: "2+ years outpatient ortho",
      treatmentSpecialties: csv("Rehabilitation", "Orthopedics"),
      compMin: 82000,
      compMax: 102000,
      schedule: "Mon–Sat, rotating",
      description: "Evaluate and treat patients with orthopedic and sports injuries. Develop personalized treatment plans and progress documentation.",
      applicationRequirements: csv("Resume", "PT license", "CPR certification"),
    },
    {
      clinicName: "Precision Imaging Partners",
      title: "Radiologic Technologist",
      employmentType: "full-time",
      city: "Houston",
      state: "TX",
      remote: false,
      requiredLicenses: csv("ARRT"),
      requiredExperience: "2+ years diagnostic imaging",
      treatmentSpecialties: csv("Imaging", "Radiology"),
      compMin: 65000,
      compMax: 80000,
      schedule: "Mon–Fri, rotating on-call",
      description: "Perform diagnostic X-ray and fluoroscopy procedures. Ensure image quality, patient safety, and equipment maintenance.",
      applicationRequirements: csv("Resume", "ARRT certification", "BLS"),
    },
    {
      clinicName: "LabCorp Reference Diagnostics",
      title: "Laboratory Technician",
      employmentType: "full-time",
      city: "Atlanta",
      state: "GA",
      remote: false,
      requiredLicenses: csv("MLT", "ASCP"),
      requiredExperience: "1+ year clinical lab",
      treatmentSpecialties: csv("Laboratory", "Diagnostics"),
      compMin: 48000,
      compMax: 60000,
      schedule: "Tue–Sat 6am–2:30pm",
      description: "Process specimens, run analyzers, perform quality control, and maintain laboratory documentation in a high-volume reference lab.",
      applicationRequirements: csv("Resume", "MLT certification"),
    },
    {
      clinicName: "Apex Revenue Solutions",
      title: "Revenue Cycle Specialist",
      employmentType: "full-time",
      city: "Dallas",
      state: "TX",
      remote: true,
      requiredLicenses: csv("—"),
      requiredExperience: "3+ years medical billing and RCM",
      treatmentSpecialties: csv("Revenue Cycle", "Billing"),
      compMin: 55000,
      compMax: 70000,
      schedule: "Mon–Fri remote",
      description: "Manage end-to-end revenue cycle including claim submission, denial management, appeals, and patient billing support.",
      applicationRequirements: csv("Resume", "References"),
    },
    {
      clinicName: "Apex Revenue Solutions",
      title: "Medical Coder",
      employmentType: "contract",
      city: "Remote",
      state: "FL",
      remote: true,
      requiredLicenses: csv("CPC"),
      requiredExperience: "2+ years coding, E/M and procedure",
      treatmentSpecialties: csv("Revenue Cycle", "Coding"),
      compMin: 28,
      compMax: 35,
      schedule: "Flexible, 30+ hrs/week",
      description: "Review clinical documentation and assign accurate ICD-10, CPT, and HCPCS codes for a multi-specialty organization.",
      applicationRequirements: csv("Resume", "CPC certification"),
    },
    {
      clinicName: "Gateway Medical Group",
      title: "Prior Authorization Specialist",
      employmentType: "full-time",
      city: "Nashville",
      state: "TN",
      remote: false,
      requiredLicenses: csv("—"),
      requiredExperience: "2+ years insurance authorization",
      treatmentSpecialties: csv("Revenue Cycle", "Insurance"),
      compMin: 42000,
      compMax: 52000,
      schedule: "Mon–Fri 8am–5pm",
      description: "Submit and track prior authorization requests, appeal denials, and coordinate with clinical staff on medical necessity documentation.",
      applicationRequirements: csv("Resume", "References"),
    },
    {
      clinicName: "Evergreen Practice Management",
      title: "Clinic Administrator",
      employmentType: "full-time",
      city: "Seattle",
      state: "WA",
      remote: false,
      requiredLicenses: csv("—"),
      requiredExperience: "7+ years healthcare administration",
      treatmentSpecialties: csv("Operations", "Administration"),
      compMin: 95000,
      compMax: 130000,
      schedule: "Mon–Fri, on-call rotation",
      description: "Lead all administrative functions for a multi-location practice. Strategic planning, financial management, compliance, and team development.",
      applicationRequirements: csv("Resume", "Cover letter", "References"),
    },
    {
      clinicName: "Pacific Longevity Institute",
      title: "Medical Director — Contract",
      employmentType: "contract",
      city: "San Diego",
      state: "CA",
      remote: true,
      requiredLicenses: csv("MD"),
      requiredExperience: "5+ years clinical leadership",
      treatmentSpecialties: csv("Longevity", "Telehealth"),
      compMin: 200,
      compMax: 250,
      schedule: "Part-time, 8–12 hrs/week",
      description: "Provide medical oversight for a longevity and telehealth practice. Review protocols, supervise advanced practice providers, and ensure compliance.",
      applicationRequirements: csv("Resume", "MD license", "Board certification"),
    },
    {
      clinicName: "HealthTech Solutions Inc",
      title: "Healthcare Customer Success Manager",
      employmentType: "full-time",
      city: "Remote",
      state: "NY",
      remote: true,
      requiredLicenses: csv("—"),
      requiredExperience: "3+ years SaaS or healthcare tech",
      treatmentSpecialties: csv("Healthcare Technology"),
      compMin: 75000,
      compMax: 95000,
      schedule: "Mon–Fri remote",
      description: "Onboard and support healthcare organizations using our platform. Drive adoption, manage escalations, and identify expansion opportunities.",
      applicationRequirements: csv("Resume", "Cover letter"),
    },
    {
      clinicName: "HealthTech Solutions Inc",
      title: "Healthcare Data Analyst",
      employmentType: "full-time",
      city: "Remote",
      state: "MA",
      remote: true,
      requiredLicenses: csv("—"),
      requiredExperience: "3+ years data analytics, SQL, healthcare data",
      treatmentSpecialties: csv("Healthcare Technology", "Analytics"),
      compMin: 85000,
      compMax: 110000,
      schedule: "Mon–Fri remote",
      description: "Analyze healthcare utilization, patient outcomes, and operational data. Build dashboards and models to support clinical and business decisions.",
      applicationRequirements: csv("Resume", "Portfolio"),
    },
    {
      clinicName: "TeleCare Health Network",
      title: "Remote Scheduling Coordinator",
      employmentType: "part-time",
      city: "Remote",
      state: "TX",
      remote: true,
      requiredLicenses: csv("—"),
      requiredExperience: "1+ year scheduling or admin",
      treatmentSpecialties: csv("Scheduling", "Patient Access"),
      compMin: 18,
      compMax: 22,
      schedule: "20 hrs/week, flexible",
      description: "Manage patient scheduling across a multi-state telehealth network. Coordinate provider availability, confirm appointments, and reduce no-shows.",
      applicationRequirements: csv("Resume"),
    },
    {
      clinicName: "Riverside Outpatient Center",
      title: "Temporary Patient Support Specialist",
      employmentType: "per-diem",
      city: "Phoenix",
      state: "AZ",
      remote: false,
      requiredLicenses: csv("—"),
      requiredExperience: "1+ year patient-facing",
      treatmentSpecialties: csv("Patient Support", "Front Office"),
      compMin: 20,
      compMax: 25,
      schedule: "Per-diem, variable",
      description: "Provide temporary front-office and patient support coverage. Check-in, registration, wayfinding, and general patient assistance.",
      applicationRequirements: csv("Resume", "References"),
    },
    {
      clinicName: "Northstar Urgent Care",
      title: "Patient Access Representative",
      employmentType: "full-time",
      city: "Minneapolis",
      state: "MN",
      remote: false,
      requiredLicenses: csv("—"),
      requiredExperience: "1+ year healthcare front desk",
      treatmentSpecialties: csv("Patient Access", "Urgent Care"),
      compMin: 38000,
      compMax: 46000,
      schedule: "Rotating shifts including weekends",
      description: "Register patients, verify insurance, collect payments, and coordinate urgent care flow. Fast-paced environment requiring strong multitasking.",
      applicationRequirements: csv("Resume", "References"),
    },
    {
      clinicName: "Meridian Men's Health",
      title: "Nurse Practitioner — Hormone Care",
      employmentType: "full-time",
      city: "Austin",
      state: "TX",
      remote: false,
      requiredLicenses: csv("NP"),
      requiredExperience: "2+ years hormone or endocrine",
      treatmentSpecialties: csv("Hormone Optimization", "TRT"),
      compMin: 110000,
      compMax: 135000,
      schedule: "Mon–Fri 9am–6pm",
      description: "Evaluate and treat patients seeking hormone optimization. Lab review, protocol development, and ongoing monitoring in a direct-pay model.",
      applicationRequirements: csv("Resume", "NP license", "Malpractice proof"),
    },
    {
      clinicName: "Harbor Men's Clinic",
      title: "Patient Intake Specialist — Sexual Wellness",
      employmentType: "part-time",
      city: "Tampa",
      state: "FL",
      remote: false,
      requiredLicenses: csv("—"),
      requiredExperience: "1+ year healthcare admin",
      treatmentSpecialties: csv("Sexual Wellness", "Intake"),
      compMin: 18,
      compMax: 22,
      schedule: "20 hrs/week",
      description: "Manage confidential patient intake for a sexual wellness practice. Schedule, verify information, and ensure privacy and discretion.",
      applicationRequirements: csv("Resume", "References"),
    },
  ];

  for (const j of jobs) {
    await db.jobPosting.create({ data: j }).catch(() => {});
  }


  // ── Vendors + marketplace listings ────────────────────────
  const vendorDefs = [
    { name: "Helix Diagnostics", slug: "helix-diagnostics", overview: "National reference laboratory services, diagnostics, and testing solutions.", website: "https://helix-diagnostics.com", verified: true },
    { name: "Apex Medical Supply", slug: "apex-medical-supply", overview: "Medical office supplies, phlebotomy consumables, clinical tools, and PPE.", website: "https://apexmedical.com", verified: true },
    { name: "Nova Recovery Systems", slug: "nova-recovery-systems", overview: "Recovery, body composition, and performance equipment for medical centers.", website: "https://novarecovery.com", verified: true },
    { name: "Clearpath Compliance", slug: "clearpath-compliance", overview: "Credentialing, billing, prior authorization, and operational compliance consulting.", website: "https://clearpathcompliance.com", verified: true },
    { name: "Cadence Clinic Software", slug: "cadence-clinic-software", overview: "All-in-one EHR, virtual clinics, patient onboarding, and booking tools.", website: "https://cadencesoftware.com", verified: true },
    { name: "MediSolutions", slug: "medisolutions", overview: "Clinical exam room accessories, medical furniture, and diagnostic instruments.", website: "https://medisolutions.com", verified: true },
    { name: "CareApparel Co.", slug: "careapparel-co", overview: "Premium medical scrubs, clinical lab coats, protective gowns, and clinic badges.", website: "https://careapparel.com", verified: true },
    { name: "Beacon Patient Growth", slug: "beacon-patient-growth", overview: "Healthcare-specific SEO, website design, and paid campaign management.", website: "https://beaconpatientgrowth.com", verified: true },
    { name: "CoreStaff Healthcare", slug: "corestaff-healthcare", overview: "Medical staff placements, np matching, and locum tenens recruitment.", website: "https://corestaffhealthcare.com", verified: true }
  ];
  const vendorMap: Record<string, string> = {};
  for (const v of vendorDefs) {
    const created = await db.vendor.upsert({
      where: { slug: v.slug },
      update: { overview: v.overview, website: v.website, verified: v.verified },
      create: v,
    });
    vendorMap[v.slug] = created.id;
  }

  const listings = [
    // 1. Clinical Supplies
    { vendorSlug: "apex-medical-supply", vendorName: "Apex Medical Supply", title: "Injection Supply Kit (100 ct)", slug: "injection-supply-kit", category: "Clinical Supplies", listingType: "product", description: "Pre-assembled injection kits including syringes, needles, sharps container, and prep materials.", pricingModel: "one-time", priceNote: "$120/case", availability: "in-stock", imageColor: "emerald", verified: true, reviewStatus: "approved" },
    { vendorSlug: "apex-medical-supply", vendorName: "Apex Medical Supply", title: "Sterile Nitrile Gloves (1000 ct)", slug: "sterile-nitrile-gloves", category: "Clinical Supplies", listingType: "product", description: "Medical-grade powder-free nitrile examination gloves with textured fingertips for grip.", pricingModel: "one-time", priceNote: "$85/case", availability: "in-stock", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "apex-medical-supply", vendorName: "Apex Medical Supply", title: "Disposable Procedure Face Masks", slug: "disposable-procedure-face-masks", category: "Clinical Supplies", listingType: "product", description: "3-ply disposable earloop masks, fluid-resistant, breathable (500 ct box).", pricingModel: "one-time", priceNote: "$45/box", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "apex-medical-supply", vendorName: "Apex Medical Supply", title: "Antiseptic Prep Pads Bundle (2000 ct)", slug: "antiseptic-prep-pads", category: "Clinical Supplies", listingType: "product", description: "Alcohol and antiseptic prep pads for medical cleanings and blood draws.", pricingModel: "one-time", priceNote: "$35/box", availability: "in-stock", imageColor: "sky", verified: true, reviewStatus: "approved" },
    { vendorSlug: "apex-medical-supply", vendorName: "Apex Medical Supply", title: "Phlebotomy Blood Draw Tubes (100 ct)", slug: "blood-draw-tubes", category: "Clinical Supplies", listingType: "product", description: "Standard vacuum collection tubes, EDTA, SST, and sodium citrate variants.", pricingModel: "one-time", priceNote: "$65/pack", availability: "in-stock", imageColor: "indigo", verified: true, reviewStatus: "approved" },

    // 2. Laboratory and Diagnostics
    { vendorSlug: "helix-diagnostics", vendorName: "Helix Diagnostics", title: "Reference Lab Panel Setup Service", slug: "reference-lab-setup", category: "Laboratory and Diagnostics", listingType: "service", description: "Integrate clinical testing panels with rapid turnaround, customized result portal, and EHR feeds.", pricingModel: "quote", priceNote: "Request quote", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "helix-diagnostics", vendorName: "Helix Diagnostics", title: "Rapid Diagnostic Test Kits (50 ct)", slug: "rapid-diagnostic-test-kits", category: "Laboratory and Diagnostics", listingType: "product", description: "Point-of-care rapid testing kits for common respiratory, metabolic, and infectious panels.", pricingModel: "one-time", priceNote: "$299/kit", availability: "in-stock", imageColor: "emerald", verified: true, reviewStatus: "approved" },
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Clinical Centrifuge System", slug: "clinical-centrifuge-system", category: "Laboratory and Diagnostics", listingType: "product", description: "Digital benchtop centrifuge with rotor options for standard blood draw and serum tubes.", pricingModel: "quote", priceNote: "Request quote", availability: "made-to-order", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "helix-diagnostics", vendorName: "Helix Diagnostics", title: "Urinalysis Reagent Strips (100 ct)", slug: "urinalysis-reagent-strips", category: "Laboratory and Diagnostics", listingType: "product", description: "10-parameter urinalysis testing strips for clinical screening and diagnostic aids.", pricingModel: "one-time", priceNote: "$25/bottle", availability: "in-stock", imageColor: "violet", verified: true, reviewStatus: "approved" },
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Medical Lab Blood Draw Chair", slug: "blood-draw-chair", category: "Laboratory and Diagnostics", listingType: "product", description: "Ergonomic blood drawing chair with dual adjustable armrests and cleanable vinyl upholstery.", pricingModel: "one-time", priceNote: "$550/unit", availability: "in-stock", imageColor: "amber", verified: true, reviewStatus: "approved" },

    // 3. Medical Equipment
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Advanced Diagnostic Ultrasound Scanner", slug: "diagnostic-ultrasound-scanner", category: "Medical Equipment", listingType: "product", description: "High-resolution diagnostic ultrasound system with linear and convex probes for clinical diagnostics.", pricingModel: "quote", priceNote: "Request quote", availability: "made-to-order", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Clinical 12-Lead ECG/EKG Machine", slug: "clinical-ecg-ekg-machine", category: "Medical Equipment", listingType: "product", description: "Interpretive 12-lead electrocardiograph with digital display and internal thermal printer.", pricingModel: "quote", priceNote: "Request quote", availability: "made-to-order", imageColor: "indigo", verified: true, reviewStatus: "approved" },
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Multi-Parameter Patient Vital Signs Monitor", slug: "vital-signs-monitor", category: "Medical Equipment", listingType: "product", description: "Monitors blood pressure, SpO2, pulse rate, temperature, and respiration parameters.", pricingModel: "one-time", priceNote: "$1,250/unit", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Medical Grade Vaccine & Lab Refrigerator", slug: "lab-refrigerator", category: "Medical Equipment", listingType: "product", description: "Strict temperature-controlled refrigeration unit for biological samples and therapeutics.", pricingModel: "quote", priceNote: "Request quote", availability: "made-to-order", imageColor: "emerald", verified: true, reviewStatus: "approved" },
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Automated External Defibrillator (AED)", slug: "automated-external-defibrillator", category: "Medical Equipment", listingType: "product", description: "Public-access bilingual AED kit with battery, pads, carrying case, and wall cabinet.", pricingModel: "one-time", priceNote: "$1,800/unit", availability: "in-stock", imageColor: "sky", verified: true, reviewStatus: "approved" },

    // 4. Exam Room and Facility
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Adjustable Power Examination Table", slug: "power-examination-table", category: "Exam Room and Facility", listingType: "product", description: "Motorized height and back adjustable patient examination table with built-in paper roll holder.", pricingModel: "quote", priceNote: "Request quote", availability: "made-to-order", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Stainless Steel Clinical Utility Cart", slug: "utility-cart", category: "Exam Room and Facility", listingType: "product", description: "Heavy-duty stainless steel mobile cart with drawers, rails, and locking wheels.", pricingModel: "one-time", priceNote: "$220/unit", availability: "in-stock", imageColor: "violet", verified: true, reviewStatus: "approved" },
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "LED Clinical Examination Task Light", slug: "examination-light", category: "Exam Room and Facility", listingType: "product", description: "Flexible goose-neck mobile task light with shadow-free cold-light LED beam.", pricingModel: "one-time", priceNote: "$380/unit", availability: "in-stock", imageColor: "amber", verified: true, reviewStatus: "approved" },
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Step-On Biohazard Waste Bin (10 Gal)", slug: "biohazard-waste-bin", category: "Exam Room and Facility", listingType: "product", description: "Hands-free step-on biohazard waste bin with tight lid seal and red warning markings.", pricingModel: "one-time", priceNote: "$75/unit", availability: "in-stock", imageColor: "rose", verified: true, reviewStatus: "approved" },
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Mobile Patient Privacy Screen (3-Panel)", slug: "patient-privacy-screen", category: "Exam Room and Facility", listingType: "product", description: "Folding mobile divider screen with flame-resistant panels and locking casters.", pricingModel: "one-time", priceNote: "$140/unit", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },

    // 5. Telehealth Technology
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "Enterprise Telehealth Hardware Kit", slug: "telehealth-hardware-kit", category: "Telehealth Technology", listingType: "product", description: "Remote patient monitoring kit including blood pressure cuff, scale, and hub system.", pricingModel: "quote", priceNote: "Request quote", availability: "in-stock", imageColor: "indigo", verified: true, reviewStatus: "approved" },
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "High-Definition Medical Webcam", slug: "medical-webcam", category: "Telehealth Technology", listingType: "product", description: "4K video clinic webcam with close-up macro capture capabilities and built-in ring light.", pricingModel: "one-time", priceNote: "$120/unit", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "Cellular Remote Monitoring Patient Scale", slug: "cellular-monitoring-scale", category: "Telehealth Technology", listingType: "product", description: "Weight scale with built-in cellular card for direct-to-cloud patient weight logs.", pricingModel: "one-time", priceNote: "$95/unit", availability: "in-stock", imageColor: "emerald", verified: true, reviewStatus: "approved" },
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "Bluetooth Digital Medical Stethoscope", slug: "bluetooth-digital-stethoscope", category: "Telehealth Technology", listingType: "product", description: "Digital stethoscope with amplification and wireless streaming for telehealth auscultations.", pricingModel: "one-time", priceNote: "$349/unit", availability: "in-stock", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "medisolutions", vendorName: "MediSolutions", title: "Mobile Telemedicine Cart System", slug: "telemedicine-cart", category: "Telehealth Technology", listingType: "product", description: "Integrated cart with display mount, camera assembly, locking drawer, and power bank.", pricingModel: "quote", priceNote: "Request quote", availability: "made-to-order", imageColor: "violet", verified: true, reviewStatus: "approved" },

    // 6. Healthcare Software
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "Cadence EHR & Practice Management", slug: "ehr-practice-management", category: "Healthcare Software", listingType: "software", description: "All-in-one patient scheduler, charting, telehealth rooms, and integrated clinic billing.", pricingModel: "subscription", priceNote: "From $399/mo", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "Automated Patient Outreach Suite", slug: "patient-outreach-suite", category: "Healthcare Software", listingType: "software", description: "Automated email and SMS campaign tool for treatment check-ins and review collections.", pricingModel: "subscription", priceNote: "From $199/mo", availability: "in-stock", imageColor: "emerald", verified: true, reviewStatus: "approved" },
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "Virtual Telehealth Clinic Rooms", slug: "virtual-clinic-rooms", category: "Healthcare Software", listingType: "software", description: "HIPAA-compliant encrypted video rooms with screen sharing and clinical chat integration.", pricingModel: "subscription", priceNote: "From $149/mo", availability: "in-stock", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "Consent Forms & Digital Intake Hub", slug: "consent-forms-intake", category: "Healthcare Software", listingType: "software", description: "Customizable clinical questionnaires, electronic signature consent, and intake logs.", pricingModel: "subscription", priceNote: "From $99/mo", availability: "in-stock", imageColor: "violet", verified: true, reviewStatus: "approved" },
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "AI Clinical Charting Coordinator", slug: "ai-charting-coordinator", category: "Healthcare Software", listingType: "software", description: "AI scribe and clinical note summarizer that auto-generates charts from consult audios.", pricingModel: "subscription", priceNote: "From $249/mo", availability: "in-stock", imageColor: "amber", verified: true, reviewStatus: "approved" },

    // 7. Staffing and Workforce Services
    { vendorSlug: "corestaff-healthcare", vendorName: "CoreStaff Healthcare", title: "Nurse Practitioner Placement Agency", slug: "np-placement-agency", category: "Staffing and Workforce Services", listingType: "service", description: "Recruitment and placement of licensed nurse practitioners specializing in longevity and wellness.", pricingModel: "quote", priceNote: "Custom pricing", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "corestaff-healthcare", vendorName: "CoreStaff Healthcare", title: "Medical Director Oversight Network", slug: "medical-director-network", category: "Staffing and Workforce Services", listingType: "service", description: "Match with state-licensed medical directors to provide oversight, protocols, and chart reviews.", pricingModel: "quote", priceNote: "Custom pricing", availability: "in-stock", imageColor: "emerald", verified: true, reviewStatus: "approved" },
    { vendorSlug: "corestaff-healthcare", vendorName: "CoreStaff Healthcare", title: "Healthcare Recruitment & Sourcing Plan", slug: "recruitment-sourcing-plan", category: "Staffing and Workforce Services", listingType: "service", description: "Monthly sourcing retainer surfacing certified clinical candidates tailored to your openings.", pricingModel: "subscription", priceNote: "From $800/mo", availability: "in-stock", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "corestaff-healthcare", vendorName: "CoreStaff Healthcare", title: "Clinic Shift Management & Float Pool", slug: "shift-management-float", category: "Staffing and Workforce Services", listingType: "service", description: "Coordination of temporary staffing covers, float pools, and clinical support staff.", pricingModel: "quote", priceNote: "Custom pricing", availability: "in-stock", imageColor: "violet", verified: true, reviewStatus: "approved" },
    { vendorSlug: "corestaff-healthcare", vendorName: "CoreStaff Healthcare", title: "Locum Tenens Physician Placement", slug: "locum-tenens-placement", category: "Staffing and Workforce Services", listingType: "service", description: "Temporary and coverage placement services for board-certified clinical practitioners.", pricingModel: "quote", priceNote: "Custom pricing", availability: "in-stock", imageColor: "amber", verified: true, reviewStatus: "approved" },

    // 8. Billing and Revenue Cycle
    { vendorSlug: "clearpath-compliance", vendorName: "Clearpath Compliance", title: "Revenue Cycle Management (RCM) Services", slug: "rcm-billing-services", category: "Billing and Revenue Cycle", listingType: "service", description: "Full-service clinical billing management, electronic claims submissions, and collections.", pricingModel: "percentage", priceNote: "3-5% of collections", availability: "in-stock", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "clearpath-compliance", vendorName: "Clearpath Compliance", title: "Clinic Billing & Fee Optimization Audit", slug: "billing-optimization-audit", category: "Billing and Revenue Cycle", listingType: "service", description: "One-time comprehensive audit of codes, charge captures, and pricing models to improve margins.", pricingModel: "one-time", priceNote: "$1,500/audit", availability: "in-stock", imageColor: "violet", verified: true, reviewStatus: "approved" },
    { vendorSlug: "clearpath-compliance", vendorName: "Clearpath Compliance", title: "Prior Authorization Management Support", slug: "prior-auth-management", category: "Billing and Revenue Cycle", listingType: "service", description: "Outsourced handling of prior authorizations to reduce diagnostic and therapy denials.", pricingModel: "subscription", priceNote: "From $500/mo", availability: "in-stock", imageColor: "emerald", verified: true, reviewStatus: "approved" },
    { vendorSlug: "cadence-clinic-software", vendorName: "Cadence Clinic Software", title: "Medical Billing & Claim Software Feed", slug: "billing-software-feed", category: "Billing and Revenue Cycle", listingType: "software", description: "Real-time clearinghouse clearing software integration with automatic eligibility checks.", pricingModel: "subscription", priceNote: "From $180/mo", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "clearpath-compliance", vendorName: "Clearpath Compliance", title: "Denied Claims Recovery & Audit", slug: "denied-claims-recovery", category: "Billing and Revenue Cycle", listingType: "service", description: "Performance-backed recovery of outstanding denied insurance claims and appeals.", pricingModel: "percentage", priceNote: "10% of recovery", availability: "in-stock", imageColor: "amber", verified: true, reviewStatus: "approved" },

    // 9. Credentialing and Compliance
    { vendorSlug: "clearpath-compliance", vendorName: "Clearpath Compliance", title: "Provider Credentialing Setup Service", slug: "provider-credentialing-setup", category: "Credentialing and Compliance", listingType: "service", description: "Insurance network enrollment, CAQH registration, and verification for clinical staff.", pricingModel: "one-time", priceNote: "$150/provider", availability: "in-stock", imageColor: "violet", verified: true, reviewStatus: "approved" },
    { vendorSlug: "clearpath-compliance", vendorName: "Clearpath Compliance", title: "HIPAA Compliance Training & Portal", slug: "hipaa-compliance-portal", category: "Credentialing and Compliance", listingType: "software", description: "Annual compliance training, risk audits, security policies, and tracking sheets.", pricingModel: "subscription", priceNote: "From $99/mo", availability: "in-stock", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "clearpath-compliance", vendorName: "Clearpath Compliance", title: "OSHA Clinical Safety Audit Program", slug: "osha-safety-audit", category: "Credentialing and Compliance", listingType: "service", description: "On-site and remote audits of facility compliance, sharps disposal, and safety plans.", pricingModel: "one-time", priceNote: "$1,200/audit", availability: "in-stock", imageColor: "rose", verified: true, reviewStatus: "approved" },
    { vendorSlug: "clearpath-compliance", vendorName: "Clearpath Compliance", title: "CLIA Waived Lab Compliance Support", slug: "clia-compliance-support", category: "Credentialing and Compliance", listingType: "service", description: "Licensing and quality assurance program setup for in-clinic point-of-care diagnostics.", pricingModel: "quote", priceNote: "Request quote", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "clearpath-compliance", vendorName: "Clearpath Compliance", title: "Multi-State License Expansion Program", slug: "license-expansion-program", category: "Credentialing and Compliance", listingType: "service", description: "Facilitate cross-licensure and business setup for multi-state telemedicine expansion.", pricingModel: "quote", priceNote: "Request quote", availability: "in-stock", imageColor: "emerald", verified: true, reviewStatus: "approved" },

    // 10. Marketing and Patient Growth
    { vendorSlug: "beacon-patient-growth", vendorName: "Beacon Patient Growth", title: "Local Patient Acquisition SEO Campaign", slug: "local-patient-acquisition-seo", category: "Marketing and Patient Growth", listingType: "service", description: "Optimization of maps, citations, and local search visibility for outpatient clinics.", pricingModel: "subscription", priceNote: "From $1,200/mo", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "beacon-patient-growth", vendorName: "Beacon Patient Growth", title: "High-Converting Clinic Website Design", slug: "clinic-website-design", category: "Marketing and Patient Growth", listingType: "service", description: "Mobile-responsive, accessibility-optimized design built to convert medical consults.", pricingModel: "one-time", priceNote: "$3,500/site", availability: "in-stock", imageColor: "emerald", verified: true, reviewStatus: "approved" },
    { vendorSlug: "beacon-patient-growth", vendorName: "Beacon Patient Growth", title: "Men's Health Patient Growth Playbook", slug: "patient-growth-playbook", category: "Marketing and Patient Growth", listingType: "product", description: "Best-practice guide covering pricing strategies, consult scripting, and re-engagements.", pricingModel: "one-time", priceNote: "$150/copy", availability: "in-stock", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "beacon-patient-growth", vendorName: "Beacon Patient Growth", title: "Reputation & Verified Review Manager", slug: "reputation-review-manager", category: "Marketing and Patient Growth", listingType: "software", description: "Frictionless SMS/email reviewer tool that routes clinical reviews directly to listing profiles.", pricingModel: "subscription", priceNote: "From $89/mo", availability: "in-stock", imageColor: "violet", verified: true, reviewStatus: "approved" },
    { vendorSlug: "beacon-patient-growth", vendorName: "Beacon Patient Growth", title: "Healthcare Paid Ads Campaign Setup", slug: "paid-ads-campaign-setup", category: "Marketing and Patient Growth", listingType: "service", description: "AdWords and social campaign setup including ad creatives and landing page tests.", pricingModel: "quote", priceNote: "Request quote", availability: "in-stock", imageColor: "amber", verified: true, reviewStatus: "approved" },

    // 11. Wellness and Recovery
    { vendorSlug: "nova-recovery-systems", vendorName: "Nova Recovery Systems", title: "Clinical Red-Light Therapy Panel", slug: "clinical-red-light-panel", category: "Wellness and Recovery", listingType: "product", description: "Medical-grade photobiomodulation panel designed for clinic treatment and recovery rooms.", pricingModel: "one-time", priceNote: "$2,400/unit", availability: "in-stock", imageColor: "amber", verified: true, reviewStatus: "approved" },
    { vendorSlug: "nova-recovery-systems", vendorName: "Nova Recovery Systems", title: "Bioimpedance Body Composition Scale", slug: "body-composition-scale", category: "Wellness and Recovery", listingType: "product", description: "Clinical-grade body metrics scale tracking hydration, fat, and lean mass percentages.", pricingModel: "quote", priceNote: "Request quote", availability: "in-stock", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "nova-recovery-systems", vendorName: "Nova Recovery Systems", title: "Medical-Grade Compression Sleeves Case", slug: "compression-sleeves-case", category: "Wellness and Recovery", listingType: "product", description: "Clinic bundle containing sequential pneumatic compression sleeves for patient recovery.", pricingModel: "one-time", priceNote: "$350/case", availability: "in-stock", imageColor: "indigo", verified: true, reviewStatus: "approved" },
    { vendorSlug: "nova-recovery-systems", vendorName: "Nova Recovery Systems", title: "Whole-Body Cryotherapy Chamber Setup", slug: "cryotherapy-chamber-setup", category: "Wellness and Recovery", listingType: "product", description: "Clinical cryotherapy unit with nitrogen delivery lines, software controls, and enclosure.", pricingModel: "quote", priceNote: "Request quote", availability: "made-to-order", imageColor: "sky", verified: true, reviewStatus: "approved" },
    { vendorSlug: "nova-recovery-systems", vendorName: "Nova Recovery Systems", title: "Targeted Muscle Recovery Stimulator", slug: "muscle-recovery-stimulator", category: "Wellness and Recovery", listingType: "product", description: "Advanced clinical EMS/TENS device with medical cables, electrodes, and custom protocols.", pricingModel: "one-time", priceNote: "$499/unit", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },

    // 12. Apparel and Staff Essentials
    { vendorSlug: "careapparel-co", vendorName: "CareApparel Co.", title: "Unisex Medical Scrubs Set (Pack of 5)", slug: "unisex-scrubs-set", category: "Apparel and Staff Essentials", listingType: "product", description: "Antimicrobial, wrinkle-resistant scrubs with pockets for clinical essentials (5 sets).", pricingModel: "one-time", priceNote: "$110/pack", availability: "in-stock", imageColor: "teal", verified: true, reviewStatus: "approved" },
    { vendorSlug: "careapparel-co", vendorName: "CareApparel Co.", title: "Premium Clinical Lab Coats (Pack of 5)", slug: "premium-lab-coats", category: "Apparel and Staff Essentials", listingType: "product", description: "Stain-resistant, breathable clinical lab coats with multi-pocket designs (5 coats).", pricingModel: "one-time", priceNote: "$95/pack", availability: "in-stock", imageColor: "emerald", verified: true, reviewStatus: "approved" },
    { vendorSlug: "careapparel-co", vendorName: "CareApparel Co.", title: "Medical Non-Slip Support Clogs", slug: "support-clogs", category: "Apparel and Staff Essentials", listingType: "product", description: "Shock-absorbing, liquid-resistant clogs designed for long clinic shift comfort.", pricingModel: "one-time", priceNote: "$60/pair", availability: "in-stock", imageColor: "blue", verified: true, reviewStatus: "approved" },
    { vendorSlug: "careapparel-co", vendorName: "CareApparel Co.", title: "Customized Embroidered Name Badges", slug: "customized-name-badges", category: "Apparel and Staff Essentials", listingType: "product", description: "Magnetic, acrylic clinical name badges with company logo and staff titles (50 ct).", pricingModel: "one-time", priceNote: "$75/pack", availability: "in-stock", imageColor: "violet", verified: true, reviewStatus: "approved" },
    { vendorSlug: "careapparel-co", vendorName: "CareApparel Co.", title: "Clinical Disposable Lab Gowns (100 ct)", slug: "disposable-lab-gowns", category: "Apparel and Staff Essentials", listingType: "product", description: "Fluid-resistant, disposable medical protective gowns with elastic wrist cuffs.", pricingModel: "one-time", priceNote: "$130/box", availability: "in-stock", imageColor: "rose", verified: true, reviewStatus: "approved" }
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
