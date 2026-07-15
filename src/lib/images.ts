/**
 * Novalyte AI — Centralized image asset registry
 *
 * All imagery references go through this file so production photography
 * can replace development assets in one place.
 *
 * Development images are sourced from legally-usable public libraries
 * (Unsplash/Pexels via ZAI image search). Replace with licensed
 * production photography before launch.
 *
 * Fallback chain for clinics/products without uploaded images:
 *   1. User-uploaded primary photo
 *   2. User-uploaded logo
 *   3. Category-specific placeholder (from this registry)
 *   4. Branded Novalyte AI initials fallback (rendered in component)
 */

export const IMAGES = {
  hero: {
    consultation: "/images/hero/hero-1.jpg",
    clinicScene: "/images/hero/hero-2.jpg",
    patientCare: "/images/hero/hero-3.jpg",
    providerPatient: "/images/hero/hero-4.jpg",
    ecosystem: "/images/hero/hero-6.jpg",
  },

  // Original Novalyte AI pillar photography, generated for the marketing surface.
  pillars: {
    acquisition: "/images/pillars/patient-acquisition.jpg",
    directory: "/images/pillars/clinic-directory.jpg",
    workforce: "/images/pillars/workforce-hub.jpg",
    marketplace: "/images/pillars/services-marketplace.jpg",
  },

  // Clinic directory + profile images
  clinics: {
    exterior: [
      "/images/clinics/clinic-1.jpg",
      "/images/clinics/clinic-2.jpg",
      "/images/clinics/clinic-3.jpg",
      "/images/clinics/clinic-4.jpg",
      "/images/clinics/clinic-5.jpg",
      "/images/clinics/clinic-6.jpg",
    ],
    interior: [
      "/images/clinics/clinic-2.jpg",
      "/images/clinics/clinic-4.jpg",
      "/images/clinics/clinic-5.jpg",
    ],
    reception: [
      "/images/clinics/clinic-1.jpg",
      "/images/clinics/clinic-3.jpg",
      "/images/clinics/clinic-6.jpg",
    ],
  },

  // Professional headshots (deterministic by index)
  professionals: [
    "/images/professionals/pro-1.jpg",
    "/images/professionals/pro-2.jpg",
    "/images/professionals/pro-3.jpg",
    "/images/professionals/pro-4.jpg",
    "/images/professionals/pro-5.jpg",
    "/images/professionals/pro-6.jpg",
    "/images/professionals/pro-7.jpg",
    "/images/professionals/pro-8.jpg",
  ],

  // Marketplace product images by category keyword
  marketplace: {
    lab: ["/images/marketplace/lab-1.jpg", "/images/marketplace/lab-2.jpg", "/images/marketplace/lab-3.jpg", "/images/marketplace/lab-4.jpg"],
    injection: ["/images/marketplace/inject-1.jpg", "/images/marketplace/inject-2.jpg", "/images/marketplace/inject-3.jpg", "/images/marketplace/inject-4.jpg"],
    recovery: ["/images/marketplace/recovery-1.jpg", "/images/marketplace/recovery-2.png", "/images/marketplace/recovery-3.jpg", "/images/marketplace/recovery-4.jpg"],
    general: ["/images/marketplace/product-1.jpg", "/images/marketplace/product-2.jpg", "/images/marketplace/product-3.jpg", "/images/marketplace/product-4.jpg", "/images/marketplace/product-5.jpg", "/images/marketplace/product-6.jpg"],
  },

  // Article hero images
  articles: [
    "/images/articles/article-1.jpg",
    "/images/articles/article-2.png",
    "/images/articles/article-3.jpg",
    "/images/articles/article-4.jpg",
    "/images/articles/article-5.jpg",
    "/images/articles/article-6.jpg",
  ],

  // Treatment vertical imagery — each category has its own relevant image
  treatments: {
    "testosterone-replacement-therapy": "/images/treatments/trt-1.jpg",
    "hormone-optimization": "/images/treatments/trt-2.jpg",
    "erectile-dysfunction": "/images/hero/hero-1.jpg",
    "medical-weight-loss": "/images/treatments/weight-1.jpg",
    "glp-1": "/images/treatments/weight-2.jpg",
    "peptide-therapy": "/images/marketplace/inject-3.jpg",
    "hair-restoration": "/images/treatments/hair-1.jpg",
    "sexual-wellness": "/images/hero/hero-2.jpg",
    "longevity-medicine": "/images/treatments/preventive-3.jpg",
    "performance-recovery": "/images/treatments/perf-1.jpg",
    "preventive-mens-health": "/images/treatments/preventive-2.jpg",
    "telehealth-services": "/images/treatments/telehealth-new-1.jpg",
  },

  // Patient journey imagery
  patients: {
    hero: "/images/patients/patient-hero.jpg",
    journey: "/images/hero/hero-1.jpg",
    assessment: "/images/hero/hero-3.jpg",
    consultation: "/images/hero/hero-4.jpg",
    telehealth: "/images/treatments/telehealth-2.jpg",
  },

  // Clinic marketing page
  clinicMarketing: {
    team: "/images/professionals/pro-5.jpg",
    operations: "/images/clinics/clinic-2.jpg",
    intake: "/images/hero/hero-3.jpg",
  },
} as const;

/**
 * Get a clinic image deterministically by clinic slug (for demo fallback).
 * In production, clinics upload their own images.
 */
export function getClinicImage(slug: string, index = 0): string {
  const imgs = IMAGES.clinics.exterior;
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return imgs[(hash + index) % imgs.length];
}

export function getClinicGallery(slug: string): string[] {
  const ext = IMAGES.clinics.exterior;
  const int = IMAGES.clinics.interior;
  const rec = IMAGES.clinics.reception;
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return [
    ext[hash % ext.length],
    int[hash % int.length],
    rec[hash % rec.length],
    ext[(hash + 1) % ext.length],
    int[(hash + 1) % int.length],
  ];
}

/**
 * Get a professional headshot deterministically by name.
 */
export function getProfessionalImage(name: string): string {
  const imgs = IMAGES.professionals;
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return imgs[hash % imgs.length];
}

/**
 * Get a marketplace product image by category.
 */
export function getMarketplaceImage(category: string, index = 0): string {
  const cat = category.toLowerCase();
  let pool: readonly string[];
  if (cat.includes("lab")) pool = IMAGES.marketplace.lab;
  else if (cat.includes("injection") || cat.includes("phlebotomy")) pool = IMAGES.marketplace.injection;
  else if (cat.includes("recovery") || cat.includes("body-composition")) pool = IMAGES.marketplace.recovery;
  else pool = IMAGES.marketplace.general;
  return pool[index % pool.length];
}

/**
 * Get an article hero image deterministically by slug.
 */
export function getArticleImage(slug: string): string {
  const imgs = IMAGES.articles;
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return imgs[hash % imgs.length];
}

/**
 * Alt text templates for accessibility.
 */
export const ALT_TEXT = {
  heroConsultation: "Healthcare professional reviewing treatment options with a male patient in a modern clinic",
  patientHero: "Adult male patient reviewing care options with a healthcare professional in a modern men's health clinic",
  heroClinic: "Modern men's health clinic interior with consultation area",
  heroPatient: "Male patient during a consultation at a men's health clinic",
  clinicExterior: "Exterior view of a modern men's health clinic",
  clinicInterior: "Consultation room interior at a men's health clinic",
  clinicReception: "Reception and waiting area of a modern healthcare clinic",
  professional: "Healthcare professional portrait",
  product: "Marketplace product image for men's health clinic equipment",
  article: "Editorial image accompanying a men's health journal article",
};
