import type { ClinicT } from "@/lib/types";
import type { ListingStatus } from "@/lib/directory/listing-status";
import {
  auditDirectoryClinics,
  sanitizePreviewClinic,
} from "@/lib/directory/validate-clinic";

/**
 * Fictional preview clinic directory dataset.
 *
 * All rows are demo/preview profiles for UI demonstration while founding clinics
 * complete verification. Never claimable, never verified, never real partners.
 */

export type PreviewClinic = ClinicT & {
  listingStatus: ListingStatus;
  latitude: number | null;
  longitude: number | null;
  dataSource: "public_web" | "demo";
  sourceUrl: string | null;
  lastReviewedAt: string | null;
  financingAvailable: boolean | null;
  inPersonAvailable: boolean | null;
  sameDayConsultations: boolean | null;
};

type PreviewSeed = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  zip: string;
  address: string;
  phone: string;
  specialties: string;
  providerTypes: string;
  logoColor: string;
  telehealth: boolean;
  inPerson: boolean;
  onSiteLab: boolean;
  financing: boolean;
  insurance: boolean;
  hsa: boolean;
  sameDay: boolean;
  hours: string;
  lat: number;
  lng: number;
  languages?: string;
  overview: string;
  tagline: string;
  providerName: string;
  providerCredentials: string;
  providerRole: string;
};

function treatmentRows(clinicId: string, specialties: string, careFormat: string): ClinicT["treatments"] {
  return specialties.split(",").map((name, i) => ({
    id: `${clinicId}-tx-${i + 1}`,
    clinicId,
    name: name.trim(),
    category: name.trim(),
    description:
      "Informational specialty listing for directory preview. Care decisions are made by licensed providers at real clinics after verification.",
    concerns: null,
    priceRange: "Discussed during consultation",
    labRequired: /testosterone|hormone|weight|longevity|glp/i.test(name),
    consultRequired: true,
    careFormat,
  }));
}

function buildPreviewClinic(seed: PreviewSeed): PreviewClinic {
  const careFormat = seed.telehealth && seed.inPerson ? "Hybrid" : seed.telehealth ? "Telehealth" : "In-person";
  const disclaimer =
    " This is a fictional preview profile created to demonstrate the Novalyte directory experience. It does not represent an active clinic partnership.";

  return {
    id: seed.id,
    name: seed.name,
    slug: seed.slug,
    tagline: seed.tagline,
    overview: `${seed.overview}${disclaimer}`,
    logoColor: seed.logoColor,
    city: seed.city,
    state: seed.state,
    zip: seed.zip,
    serviceArea: `${seed.city} and surrounding metro`,
    specialties: seed.specialties,
    capabilities: [
      seed.onSiteLab ? "On-site Lab/Phlebotomy" : null,
      seed.financing ? "Financing available" : null,
      seed.telehealth ? "Telehealth" : null,
    ]
      .filter(Boolean)
      .join(", "),
    telehealth: seed.telehealth,
    providerTypes: seed.providerTypes,
    phone: seed.phone,
    email: null,
    website: null,
    bookingUrl: null,
    hours: seed.hours,
    verified: false,
    verificationStatus: "demo",
    acceptingNewPatients: true,
    claimStatus: "not_claimable",
    listingStatus: "demo",
    profileCompleteness: 88,
    initialConsultPrice: null,
    membershipPrice: null,
    insuranceAccepted: seed.insurance,
    hsaFsaAccepted: seed.hsa,
    earliestAvailability: seed.sameDay ? "Same-week consultation windows (preview)" : "Within 1–2 weeks (preview)",
    statesServed: seed.state,
    languages: seed.languages ?? "English",
    accessibility: "Wheelchair accessible waiting area",
    pricingStatus: "consult",
    whatToExpect:
      "Preview itinerary only: online intake, clinician consultation discussion, optional laboratory review, and a care-plan conversation. Not a real booking flow.",
    latitude: seed.lat,
    longitude: seed.lng,
    dataSource: "demo",
    sourceUrl: null,
    lastReviewedAt: "2026-07-23",
    financingAvailable: seed.financing,
    inPersonAvailable: seed.inPerson,
    sameDayConsultations: seed.sameDay,
    locations: [
      {
        id: `${seed.id}-loc-1`,
        clinicId: seed.id,
        name: "Primary location",
        address: seed.address,
        phone: seed.phone,
        hours: seed.hours,
        parking: "Street and nearby garage options",
        transit: "Transit access varies by location",
        accessibility: "Wheelchair accessible waiting area",
        onSiteLab: seed.onSiteLab,
        phlebotomy: seed.onSiteLab,
        earliestAppt: seed.sameDay ? "Same-week windows (preview)" : "Within 1–2 weeks (preview)",
      },
    ],
    providers: [
      {
        id: `${seed.id}-prov-1`,
        clinicId: seed.id,
        name: seed.providerName,
        credentials: seed.providerCredentials,
        role: seed.providerRole,
        specialties: seed.specialties.split(",")[0]?.trim() ?? "Men's Health",
        yearsExperience: 10,
        bio: "Fictional provider profile for directory preview only. Not a real clinician listing.",
        languages: seed.languages ?? "English",
        telehealth: seed.telehealth,
        avatarUrl: null,
      },
    ],
    treatments: treatmentRows(seed.id, seed.specialties, careFormat),
    reviews: [],
  };
}

const SEEDS: PreviewSeed[] = [
  {
    id: "preview-01",
    name: "Cascade Point Men's Health",
    slug: "cascade-point-mens-health-san-francisco",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    address: "450 Mission St, Suite 210, San Francisco, CA 94105",
    phone: "(555) 010-2101",
    specialties: "Testosterone Replacement Therapy, Hormone Optimization, Preventive Men's Health",
    providerTypes: "Physician, Nurse Practitioner",
    logoColor: "teal",
    telehealth: true,
    inPerson: true,
    onSiteLab: true,
    financing: true,
    insurance: false,
    hsa: true,
    sameDay: true,
    hours: "Mon–Fri 8am–6pm PT",
    lat: 37.7897,
    lng: -122.397,
    languages: "English, Spanish",
    tagline: "Hormone-focused men's care in downtown San Francisco",
    overview:
      "Cascade Point Men's Health is a fictional hybrid clinic showcasing testosterone evaluation, hormone optimization education, and preventive men's health navigation for Bay Area visitors exploring the directory.",
    providerName: "Morgan Ellis",
    providerCredentials: "MD",
    providerRole: "Medical Director",
  },
  {
    id: "preview-02",
    name: "Marina Vitality Collective",
    slug: "marina-vitality-collective-san-francisco",
    city: "San Francisco",
    state: "CA",
    zip: "94123",
    address: "2150 Chestnut St, San Francisco, CA 94123",
    phone: "(555) 010-2102",
    specialties: "Sexual Wellness, Erectile Dysfunction, Telehealth Consultations",
    providerTypes: "Physician, Physician Assistant",
    logoColor: "sky",
    telehealth: true,
    inPerson: true,
    onSiteLab: false,
    financing: true,
    insurance: false,
    hsa: true,
    sameDay: false,
    hours: "Tue–Sat 10am–6pm PT",
    lat: 37.8005,
    lng: -122.437,
    languages: "English",
    tagline: "Discreet sexual wellness education and consult pathways",
    overview:
      "Marina Vitality Collective is a fictional Marina District practice used to demonstrate sexual wellness and erectile dysfunction specialty filters with telehealth-capable care formats.",
    providerName: "Riley Chen",
    providerCredentials: "MD",
    providerRole: "Sexual Wellness",
  },
  {
    id: "preview-03",
    name: "Redwood Span Longevity",
    slug: "redwood-span-longevity-redwood-city",
    city: "Redwood City",
    state: "CA",
    zip: "94063",
    address: "900 Middlefield Rd, Redwood City, CA 94063",
    phone: "(555) 010-2103",
    specialties: "Longevity Medicine, Hormone Optimization, Preventive Men's Health",
    providerTypes: "Physician, Nurse Practitioner",
    logoColor: "emerald",
    telehealth: true,
    inPerson: true,
    onSiteLab: true,
    financing: false,
    insurance: false,
    hsa: true,
    sameDay: false,
    hours: "Mon–Thu 9am–5pm PT",
    lat: 37.4852,
    lng: -122.2364,
    languages: "English",
    tagline: "Peninsula longevity and preventive planning preview",
    overview:
      "Redwood Span Longevity is a fictional Redwood City clinic highlighting longevity medicine, hormone education, and preventive men's health for Peninsula searchers.",
    providerName: "Avery Kim",
    providerCredentials: "MD",
    providerRole: "Longevity Medicine",
  },
  {
    id: "preview-04",
    name: "Bayshore Concierge Men's Care",
    slug: "bayshore-concierge-mens-care-palo-alto",
    city: "Palo Alto",
    state: "CA",
    zip: "94301",
    address: "530 Lytton Ave, Palo Alto, CA 94301",
    phone: "(555) 010-2104",
    specialties: "Concierge Men's Health, Preventive Men's Health, Men's Primary Care",
    providerTypes: "Physician",
    logoColor: "violet",
    telehealth: true,
    inPerson: true,
    onSiteLab: false,
    financing: false,
    insurance: true,
    hsa: true,
    sameDay: true,
    hours: "Mon–Fri 8am–5pm PT",
    lat: 37.4451,
    lng: -122.1608,
    languages: "English, Mandarin",
    tagline: "Concierge-style men's primary and preventive care preview",
    overview:
      "Bayshore Concierge Men's Care is a fictional Palo Alto listing that demonstrates concierge men's health and preventive primary-care positioning in the directory.",
    providerName: "Jordan Hale",
    providerCredentials: "MD",
    providerRole: "Concierge Physician",
  },
  {
    id: "preview-05",
    name: "Wilshire Metabolic Studio",
    slug: "wilshire-metabolic-studio-los-angeles",
    city: "Los Angeles",
    state: "CA",
    zip: "90036",
    address: "5757 Wilshire Blvd, Los Angeles, CA 90036",
    phone: "(555) 010-2105",
    specialties: "Medical Weight Loss, GLP-1 Programs, Preventive Men's Health",
    providerTypes: "Physician, Nurse Practitioner",
    logoColor: "amber",
    telehealth: true,
    inPerson: true,
    onSiteLab: true,
    financing: true,
    insurance: false,
    hsa: true,
    sameDay: false,
    hours: "Mon–Sat 9am–6pm PT",
    lat: 34.0621,
    lng: -118.3507,
    languages: "English, Spanish",
    tagline: "Metabolic and GLP-1 education pathways in Mid-Wilshire",
    overview:
      "Wilshire Metabolic Studio is a fictional Los Angeles clinic for medical weight loss and GLP-1 program discovery without implying real partnerships or outcomes.",
    providerName: "Casey Morales",
    providerCredentials: "MD",
    providerRole: "Metabolic Health",
  },
  {
    id: "preview-06",
    name: "Pacific Crest Recovery",
    slug: "pacific-crest-recovery-los-angeles",
    city: "Los Angeles",
    state: "CA",
    zip: "90025",
    address: "11601 Wilshire Blvd, Los Angeles, CA 90025",
    phone: "(555) 010-2106",
    specialties: "Sports Recovery, Performance Medicine, Hair Restoration",
    providerTypes: "Physician, Physician Assistant",
    logoColor: "rose",
    telehealth: false,
    inPerson: true,
    onSiteLab: false,
    financing: true,
    insurance: false,
    hsa: false,
    sameDay: false,
    hours: "Tue–Fri 10am–7pm PT, Sat 9am–1pm PT",
    lat: 34.0491,
    lng: -118.448,
    languages: "English",
    tagline: "Westside sports recovery and hair restoration preview",
    overview:
      "Pacific Crest Recovery is a fictional in-person West LA listing used to show sports recovery, performance medicine, and hair restoration specialty filters.",
    providerName: "Drew Nakamura",
    providerCredentials: "DO",
    providerRole: "Performance & Recovery",
  },
  {
    id: "preview-07",
    name: "Sonoran Peak Men's Clinic",
    slug: "sonoran-peak-mens-clinic-phoenix",
    city: "Phoenix",
    state: "AZ",
    zip: "85004",
    address: "1 E Washington St, Suite 400, Phoenix, AZ 85004",
    phone: "(555) 010-2107",
    specialties: "Testosterone Replacement Therapy, Erectile Dysfunction, Telehealth Consultations",
    providerTypes: "Physician, Nurse Practitioner",
    logoColor: "orange",
    telehealth: true,
    inPerson: true,
    onSiteLab: true,
    financing: true,
    insurance: false,
    hsa: true,
    sameDay: true,
    hours: "Mon–Fri 7:30am–5:30pm MST",
    lat: 33.4484,
    lng: -112.074,
    languages: "English, Spanish",
    tagline: "Downtown Phoenix TRT and men's specialty preview",
    overview:
      "Sonoran Peak Men's Clinic is a fictional Phoenix listing for testosterone care navigation and erectile dysfunction education with hybrid visit formats.",
    providerName: "Parker Ruiz",
    providerCredentials: "MD",
    providerRole: "Men's Health",
  },
  {
    id: "preview-08",
    name: "Camelback Longevity Atelier",
    slug: "camelback-longevity-atelier-scottsdale",
    city: "Scottsdale",
    state: "AZ",
    zip: "85251",
    address: "7373 E Scottsdale Mall, Scottsdale, AZ 85251",
    phone: "(555) 010-2108",
    specialties: "Longevity Medicine, Peptide Therapy, Hormone Optimization",
    providerTypes: "Physician, Nurse Practitioner",
    logoColor: "teal",
    telehealth: true,
    inPerson: true,
    onSiteLab: false,
    financing: true,
    insurance: false,
    hsa: true,
    sameDay: false,
    hours: "Mon–Thu 9am–5pm MST",
    lat: 33.4942,
    lng: -111.9261,
    languages: "English",
    tagline: "Scottsdale longevity and peptide education preview",
    overview:
      "Camelback Longevity Atelier is a fictional Scottsdale profile demonstrating longevity medicine and peptide-related specialty browsing in the Southwest market.",
    providerName: "Quinn Adler",
    providerCredentials: "MD",
    providerRole: "Longevity Medicine",
  },
  {
    id: "preview-09",
    name: "Front Range Athletic Medicine",
    slug: "front-range-athletic-medicine-denver",
    city: "Denver",
    state: "CO",
    zip: "80202",
    address: "1600 Wynkoop St, Denver, CO 80202",
    phone: "(555) 010-2109",
    specialties: "Sports Recovery, Performance Medicine, Preventive Men's Health",
    providerTypes: "Physician, Physician Assistant",
    logoColor: "sky",
    telehealth: true,
    inPerson: true,
    onSiteLab: false,
    financing: false,
    insurance: true,
    hsa: true,
    sameDay: true,
    hours: "Mon–Fri 8am–6pm MT",
    lat: 39.753,
    lng: -105.0007,
    languages: "English",
    tagline: "Denver sports recovery and performance preview",
    overview:
      "Front Range Athletic Medicine is a fictional Denver clinic for sports recovery and performance medicine filters, including hybrid consultation formats.",
    providerName: "Blair Soto",
    providerCredentials: "MD",
    providerRole: "Sports Medicine",
  },
  {
    id: "preview-10",
    name: "Lady Bird Men's Clinic",
    slug: "lady-bird-mens-clinic-austin",
    city: "Austin",
    state: "TX",
    zip: "78701",
    address: "301 Congress Ave, Austin, TX 78701",
    phone: "(555) 010-2110",
    specialties: "Erectile Dysfunction, Sexual Wellness, Testosterone Replacement Therapy",
    providerTypes: "Physician, Nurse Practitioner",
    logoColor: "emerald",
    telehealth: true,
    inPerson: true,
    onSiteLab: false,
    financing: true,
    insurance: false,
    hsa: true,
    sameDay: false,
    hours: "Tue–Sat 9am–6pm CT",
    lat: 30.2655,
    lng: -97.7426,
    languages: "English, Spanish",
    tagline: "Austin sexual wellness and hormone navigation preview",
    overview:
      "Lady Bird Men's Clinic is a fictional downtown Austin listing that demonstrates sexual wellness, ED, and TRT specialty discovery for Texas visitors.",
    providerName: "Reese Donovan",
    providerCredentials: "MD",
    providerRole: "Sexual Wellness",
  },
  {
    id: "preview-11",
    name: "Trinity Trail TeleHealth",
    slug: "trinity-trail-telehealth-dallas",
    city: "Dallas",
    state: "TX",
    zip: "75201",
    address: "2100 McKinney Ave, Dallas, TX 75201",
    phone: "(555) 010-2111",
    specialties: "Telehealth Consultations, Testosterone Replacement Therapy, Hormone Optimization",
    providerTypes: "Physician, Nurse Practitioner",
    logoColor: "violet",
    telehealth: true,
    inPerson: false,
    onSiteLab: false,
    financing: true,
    insurance: false,
    hsa: true,
    sameDay: true,
    hours: "Mon–Fri 7am–7pm CT",
    lat: 32.7874,
    lng: -96.7983,
    languages: "English, Spanish",
    tagline: "Dallas telehealth-first hormone care preview",
    overview:
      "Trinity Trail TeleHealth is a fictional Dallas telehealth-first clinic used to exercise care-format filters for virtual testosterone and hormone education visits.",
    providerName: "Alex Rivera",
    providerCredentials: "NP",
    providerRole: "Telehealth Clinician",
  },
  {
    id: "preview-12",
    name: "Willamette Men's Wellness",
    slug: "willamette-mens-wellness-portland",
    city: "Portland",
    state: "OR",
    zip: "97205",
    address: "1120 NW Couch St, Portland, OR 97205",
    phone: "(555) 010-2112",
    specialties: "Hormone Optimization, Preventive Men's Health, Men's Primary Care",
    providerTypes: "Physician, Nurse Practitioner",
    logoColor: "teal",
    telehealth: true,
    inPerson: true,
    onSiteLab: true,
    financing: false,
    insurance: true,
    hsa: true,
    sameDay: false,
    hours: "Mon–Fri 9am–5pm PT",
    lat: 45.5235,
    lng: -122.6833,
    languages: "English",
    tagline: "Pearl District hormone and preventive men's care preview",
    overview:
      "Willamette Men's Wellness is a fictional Portland clinic demonstrating hormone optimization and men's primary-care browsing for Pacific Northwest markets.",
    providerName: "Skyler Boone",
    providerCredentials: "MD",
    providerRole: "Men's Primary Care",
  },
  {
    id: "preview-13",
    name: "Hudson Harbor Longevity",
    slug: "hudson-harbor-longevity-new-york",
    city: "New York",
    state: "NY",
    zip: "10014",
    address: "75 Ninth Ave, New York, NY 10014",
    phone: "(555) 010-2113",
    specialties: "Longevity Medicine, Preventive Men's Health, Peptide Therapy",
    providerTypes: "Physician, Nurse Practitioner",
    logoColor: "sky",
    telehealth: true,
    inPerson: true,
    onSiteLab: true,
    financing: true,
    insurance: false,
    hsa: true,
    sameDay: false,
    hours: "Mon–Fri 8am–6pm ET",
    lat: 40.7421,
    lng: -74.0055,
    languages: "English",
    tagline: "Manhattan longevity and preventive planning preview",
    overview:
      "Hudson Harbor Longevity is a fictional New York City listing for longevity medicine and preventive men's health with hybrid care formats.",
    providerName: "Taylor Brooks",
    providerCredentials: "MD",
    providerRole: "Longevity Medicine",
  },
  {
    id: "preview-14",
    name: "Biscayne Men's Care",
    slug: "biscayne-mens-care-miami",
    city: "Miami",
    state: "FL",
    zip: "33131",
    address: "1001 Brickell Bay Dr, Miami, FL 33131",
    phone: "(555) 010-2114",
    specialties: "Sexual Wellness, Erectile Dysfunction, Hair Restoration",
    providerTypes: "Physician, Physician Assistant",
    logoColor: "amber",
    telehealth: true,
    inPerson: true,
    onSiteLab: false,
    financing: true,
    insurance: false,
    hsa: false,
    sameDay: true,
    hours: "Mon–Sat 10am–7pm ET",
    lat: 25.7617,
    lng: -80.1918,
    languages: "English, Spanish",
    tagline: "Brickell sexual wellness and hair restoration preview",
    overview:
      "Biscayne Men's Care is a fictional Miami listing showcasing sexual wellness, erectile dysfunction, and hair restoration specialties for South Florida visitors.",
    providerName: "Jamie Ortiz",
    providerCredentials: "MD",
    providerRole: "Sexual Wellness",
  },
  {
    id: "preview-15",
    name: "Ala Moana Men's Health",
    slug: "ala-moana-mens-health-honolulu",
    city: "Honolulu",
    state: "HI",
    zip: "96814",
    address: "1450 Ala Moana Blvd, Honolulu, HI 96814",
    phone: "(555) 010-2115",
    specialties: "Men's Primary Care, Preventive Men's Health, Telehealth Consultations",
    providerTypes: "Physician, Nurse Practitioner",
    logoColor: "emerald",
    telehealth: true,
    inPerson: true,
    onSiteLab: false,
    financing: false,
    insurance: true,
    hsa: true,
    sameDay: false,
    hours: "Mon–Fri 8am–4pm HST",
    lat: 21.291,
    lng: -157.843,
    languages: "English",
    tagline: "Honolulu men's primary and preventive care preview",
    overview:
      "Ala Moana Men's Health is a fictional Honolulu clinic used to demonstrate island-market coverage for men's primary care and preventive health filters.",
    providerName: "Kai Nakamura",
    providerCredentials: "MD",
    providerRole: "Men's Primary Care",
  },
  {
    id: "preview-16",
    name: "Lakeshore Hormone Collective",
    slug: "lakeshore-hormone-collective-chicago",
    city: "Chicago",
    state: "IL",
    zip: "60611",
    address: "875 N Michigan Ave, Chicago, IL 60611",
    phone: "(555) 010-2116",
    specialties: "Medical Weight Loss, GLP-1 Programs, Hormone Optimization",
    providerTypes: "Physician, Nurse Practitioner",
    logoColor: "rose",
    telehealth: true,
    inPerson: true,
    onSiteLab: true,
    financing: true,
    insurance: false,
    hsa: true,
    sameDay: false,
    hours: "Mon–Fri 8am–5:30pm CT",
    lat: 41.8986,
    lng: -87.6243,
    languages: "English, Spanish",
    tagline: "Magnificent Mile metabolic and hormone preview",
    overview:
      "Lakeshore Hormone Collective is a fictional Chicago listing for medical weight loss, GLP-1 education, and hormone optimization browsing in the Midwest.",
    providerName: "Harper Singh",
    providerCredentials: "MD",
    providerRole: "Metabolic Health",
  },
];

/** Canonical set of fictional preview clinics shown in the public directory. */
export const PREVIEW_DEMO_CLINICS: PreviewClinic[] = SEEDS.map(buildPreviewClinic);

/** No confirmed unclaimed public-source rows in this seed. */
export const PREVIEW_UNCLAIMED_CLINICS: PreviewClinic[] = [];

export const PREVIEW_UNCLAIMED_CANDIDATES: PreviewClinic[] = PREVIEW_UNCLAIMED_CLINICS;

export const PREVIEW_DIRECTORY_CLINICS: PreviewClinic[] = PREVIEW_DEMO_CLINICS.map((clinic) =>
  sanitizePreviewClinic(clinic),
);

export const PREVIEW_CONFIRMED_UNCLAIMED_CLINICS: PreviewClinic[] =
  PREVIEW_DIRECTORY_CLINICS.filter((c) => c.listingStatus === "unclaimed");

export const PREVIEW_EFFECTIVE_DEMO_CLINICS: PreviewClinic[] =
  PREVIEW_DIRECTORY_CLINICS.filter((c) => c.listingStatus === "demo");

if (typeof process !== "undefined") {
  auditDirectoryClinics(PREVIEW_DIRECTORY_CLINICS);
}

export function getPreviewClinicBySlug(slug: string): PreviewClinic | undefined {
  return PREVIEW_DIRECTORY_CLINICS.find((c) => c.slug === slug);
}

export function getPreviewClinicById(id: string): PreviewClinic | undefined {
  return PREVIEW_DIRECTORY_CLINICS.find((c) => c.id === id);
}
