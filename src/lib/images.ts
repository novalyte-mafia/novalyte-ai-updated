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
    consultation: "/images/patients/consultation-v2.png",
    clinicScene: "/images/pillars/clinic-directory.jpg",
    patientCare: "/images/hero/hero-5.png",
    providerPatient: "/images/patients/consultation-v2.png",
    ecosystem: "/images/pillars/workforce-hub.jpg",
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
      "/images/pillars/clinic-directory.jpg",
      "/images/clinics/clinic-2.jpg",
      "/images/clinics/clinic-4.jpg",
      "/images/pillars/patient-acquisition.jpg",
      "/images/pillars/workforce-hub.jpg",
      "/images/pillars/services-marketplace.jpg",
    ],
    interior: [
      "/images/clinics/clinic-2.jpg",
      "/images/clinics/clinic-4.jpg",
      "/images/clinics/clinic-5.jpg",
    ],
    reception: [
      "/images/pillars/clinic-directory.jpg",
      "/images/clinics/clinic-2.jpg",
      "/images/clinics/clinic-4.jpg",
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

  // Marketplace product images by category keyword (photoreal first)
  marketplace: {
    lab: [
      "/images/marketplace/blood-tubes.jpg",
      "/images/marketplace/lab-2.jpg",
      "/images/marketplace/lab-1.jpg",
      "/images/marketplace/lab-3.jpg",
      "/images/marketplace/lab-4.jpg",
    ],
    injection: [
      "/images/marketplace/injection-kit.jpg",
      "/images/marketplace/gloves-nitrile.jpg",
      "/images/marketplace/inject-1.jpg",
      "/images/marketplace/inject-2.jpg",
      "/images/marketplace/inject-3.jpg",
      "/images/marketplace/inject-4.jpg",
    ],
    equipment: [
      "/images/marketplace/medical-equipment.jpg",
      "/images/pillars/services-marketplace.jpg",
      "/images/marketplace/lab-1.jpg",
      "/images/marketplace/product-4.jpg",
    ],
    software: [
      "/images/marketplace/clinic-software.jpg",
      "/images/marketplace/product-5.jpg",
      "/images/marketplace/product-3.jpg",
    ],
    apparel: [
      "/images/marketplace/clinic-apparel.jpg",
      "/images/treatments/preventive-3.jpg",
      "/images/marketplace/product-6.jpg",
    ],
    recovery: [
      "/images/marketplace/recovery-3.jpg",
      "/images/marketplace/recovery-2.png",
      "/images/marketplace/recovery-4.jpg",
      "/images/marketplace/recovery-1.jpg",
    ],
    general: [
      "/images/marketplace/gloves-nitrile.jpg",
      "/images/marketplace/injection-kit.jpg",
      "/images/marketplace/medical-equipment.jpg",
      "/images/marketplace/clinic-software.jpg",
      "/images/marketplace/blood-tubes.jpg",
      "/images/marketplace/clinic-apparel.jpg",
      "/images/pillars/services-marketplace.jpg",
      "/images/marketplace/product-2.jpg",
      "/images/marketplace/product-4.jpg",
      "/images/marketplace/product-5.jpg",
      "/images/marketplace/product-6.jpg",
    ],
    suppliers: [
      "/images/marketplace/suppliers/storefront.jpg",
      "/images/marketplace/suppliers/warehouse.jpg",
      "/images/marketplace/suppliers/office.jpg",
      "/images/pillars/services-marketplace.jpg",
      "/images/clinics/clinic-2.jpg",
      "/images/clinics/clinic-4.jpg",
    ],
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
    "testosterone-replacement-therapy": "/images/articles/trt-consultation.jpg",
    "hormone-optimization": "/images/articles/longevity-consultation.jpg",
    "erectile-dysfunction": "/images/treatments/ed-1.jpg",
    "medical-weight-loss": "/images/articles/glp1-consultation.jpg",
    "glp-1": "/images/treatments/preventive-3.jpg",
    "peptide-therapy": "/images/pillars/services-marketplace.jpg",
    "hair-restoration": "/images/treatments/hair-restoration-new.jpg",
    "sexual-wellness": "/images/articles/trt-consultation.jpg",
    "longevity-medicine": "/images/articles/longevity-consultation.jpg",
    "performance-recovery": "/images/treatments/perf-3.jpg",
    "preventive-mens-health": "/images/treatments/preventive-3.jpg",
    "telehealth-services": "/images/articles/telehealth-practice.jpg",
  },

  // Patient journey imagery
  patients: {
    hero: "/images/patients/patient-hero.jpg",
    journey: "/images/pillars/patient-acquisition.jpg",
    assessment: "/images/hero/hero-5.png",
    consultation: "/images/patients/consultation-v2.png",
    telehealth: "/images/treatments/telehealth-2.jpg",
  },

  // Clinic marketing page
  clinicMarketing: {
    team: "/images/professionals/pro-5.jpg",
    operations: "/images/clinics/clinic-2.jpg",
    intake: "/images/pillars/patient-acquisition.jpg",
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
 * Get a marketplace product image by category (and optional slug for variety).
 */
export function getMarketplaceImage(category: string, index = 0, slug = ""): string {
  const cat = category.toLowerCase();
  const key = `${slug} ${cat}`.toLowerCase();
  let pool: readonly string[];
  if (key.includes("glove") || key.includes("ppe") || key.includes("gown")) pool = IMAGES.marketplace.injection;
  else if (key.includes("scrub") || key.includes("coat") || key.includes("clog") || key.includes("apparel") || key.includes("uniform")) {
    pool = IMAGES.marketplace.apparel;
  } else if (key.includes("ehr") || key.includes("software") || key.includes("platform") || key.includes("saas") || key.includes("billing") || key.includes("crm")) {
    pool = IMAGES.marketplace.software;
  } else if (key.includes("equip") || key.includes("monitor") || key.includes("ultrasound") || key.includes("device") || key.includes("chair") || key.includes("table")) {
    pool = IMAGES.marketplace.equipment;
  } else if (cat.includes("lab") || cat.includes("diagnost") || key.includes("tube") || key.includes("phlebotomy")) {
    pool = IMAGES.marketplace.lab;
  } else if (cat.includes("injection") || cat.includes("clinical") || cat.includes("supply") || key.includes("syringe") || key.includes("needle")) {
    pool = IMAGES.marketplace.injection;
  } else if (cat.includes("recovery") || cat.includes("body-composition") || cat.includes("wellness")) {
    pool = IMAGES.marketplace.recovery;
  } else {
    pool = IMAGES.marketplace.general;
  }
  const hash = (slug || category).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[(hash + index) % pool.length];
}

/**
 * Deterministic supplier / storefront image for marketplace vendor cards.
 */
export function getSupplierImage(nameOrSlug: string, index = 0): string {
  const imgs = IMAGES.marketplace.suppliers;
  const hash = nameOrSlug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return imgs[(hash + index) % imgs.length];
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
