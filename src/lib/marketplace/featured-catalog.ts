import { IMAGES, getMarketplaceImage } from "@/lib/images";
import type { MarketplaceListingT } from "@/lib/types";

/**
 * Curated featured SKUs for the public marketplace.
 * Quote-first B2B catalog — not a consumer checkout aisle.
 */
export type FeaturedSku = {
  slug: string;
  rank: number;
  headline: string;
  summary: string;
  specs: string[];
  packSize: string;
  moq: string;
  leadTime: string;
  guidePrice: string;
  image: string;
  audience: string;
};

export const FEATURED_CATALOG: FeaturedSku[] = [
  {
    slug: "injection-supply-kit",
    rank: 1,
    headline: "Injection Supply Kit (100 ct)",
    summary:
      "Clinic-ready tray kits: syringes, needles, alcohol prep, gauze, and a sharps container sized for outpatient injection rooms.",
    specs: ["100 procedure kits / case", "Sharps container included", "Latex-free components", "Lot-coded packaging"],
    packSize: "1 case (100 kits)",
    moq: "1 case",
    leadTime: "2–4 business days",
    guidePrice: "Guide · from $120/case",
    image: IMAGES.marketplace.injection[0],
    audience: "TRT · peptide · wellness injection programs",
  },
  {
    slug: "sterile-nitrile-gloves",
    rank: 2,
    headline: "Sterile Nitrile Gloves (1000 ct)",
    summary:
      "Powder-free medical exam gloves with textured fingertips. Standard clinic case pack for high-throughput rooms.",
    specs: ["1000 gloves / case", "Powder-free nitrile", "Textured grip", "Sizes S–XL available on quote"],
    packSize: "10 boxes × 100",
    moq: "1 case",
    leadTime: "1–3 business days",
    guidePrice: "Guide · from $85/case",
    image: IMAGES.marketplace.injection[1],
    audience: "All clinic types",
  },
  {
    slug: "blood-draw-tubes",
    rank: 3,
    headline: "Phlebotomy Blood Draw Tubes (100 ct)",
    summary:
      "Vacuum collection tubes in common clinic mixes (EDTA, SST, citrate) for in-house draws and outbound lab routes.",
    specs: ["100 tubes / pack", "EDTA · SST · citrate variants", "Standard draw volumes", "Compatible with most centrifuges"],
    packSize: "100-tube pack",
    moq: "2 packs",
    leadTime: "2–5 business days",
    guidePrice: "Guide · from $65/pack",
    image: IMAGES.marketplace.lab[0],
    audience: "Labs · men’s health · longevity clinics",
  },
  {
    slug: "reference-lab-setup",
    rank: 4,
    headline: "Reference Lab Panel Setup",
    summary:
      "Onboard hormone, metabolic, and wellness panels with result portal access and optional EHR feed configuration.",
    specs: ["Custom panel menu", "Result portal for staff", "Optional EHR / CSV feeds", "Account manager onboarding"],
    packSize: "Service engagement",
    moq: "1 clinic location",
    leadTime: "5–10 business days to go-live",
    guidePrice: "Custom quote",
    image: IMAGES.marketplace.lab[1],
    audience: "Clinics launching or expanding lab menus",
  },
  {
    slug: "rapid-diagnostic-test-kits",
    rank: 5,
    headline: "Rapid Diagnostic Test Kits (50 ct)",
    summary:
      "Point-of-care kits for common screening panels used in outpatient wellness and men’s health workflows.",
    specs: ["50 tests / kit", "CLIA-waived class targets (confirm locally)", "Room-temp storage", "Result guide included"],
    packSize: "50-test kit",
    moq: "1 kit",
    leadTime: "3–6 business days",
    guidePrice: "Guide · from $299/kit",
    image: IMAGES.marketplace.lab[2],
    audience: "POC screening programs",
  },
  {
    slug: "power-examination-table",
    rank: 6,
    headline: "Adjustable Power Examination Table",
    summary:
      "Motorized height and back adjustment with paper-roll holder — standard fit for consult and procedure rooms.",
    specs: ["Power height + back", "Paper roll holder", "Cleanable upholstery", "Weight capacity on quote"],
    packSize: "1 unit + freight",
    moq: "1 unit",
    leadTime: "2–4 weeks (freight)",
    guidePrice: "Custom quote · freight separate",
    image: IMAGES.marketplace.equipment[0],
    audience: "New builds · room refreshes",
  },
  {
    slug: "vital-signs-monitor",
    rank: 7,
    headline: "Multi-Parameter Vital Signs Monitor",
    summary:
      "BP, SpO2, pulse, temperature, and respiration on a clinic cart-friendly unit for intake and recovery rooms.",
    specs: ["NIBP · SpO2 · pulse · temp · resp", "Cart / counter mount options", "Rechargeable power", "Clinic warranty options"],
    packSize: "1 unit",
    moq: "1 unit",
    leadTime: "5–10 business days",
    guidePrice: "Guide · from $1,250/unit",
    image: IMAGES.marketplace.equipment[0],
    audience: "Intake · recovery · procedure bays",
  },
  {
    slug: "ehr-practice-management",
    rank: 8,
    headline: "Clinic EHR & Practice Management",
    summary:
      "Scheduling, charting, telehealth rooms, and billing workflows sized for independent men’s health and wellness clinics.",
    specs: ["Scheduler + charting", "Telehealth rooms", "Billing workflows", "Onboarding + training included"],
    packSize: "Per location subscription",
    moq: "1 location",
    leadTime: "1–2 weeks implementation",
    guidePrice: "Guide · from $399/mo",
    image: IMAGES.marketplace.software[0],
    audience: "Independent clinics · multi-provider groups",
  },
  {
    slug: "rcm-billing-services",
    rank: 9,
    headline: "Revenue Cycle Management (RCM)",
    summary:
      "Claims, follow-up, and collections support for clinics that want billing off their front desk without hiring a full RCM team.",
    specs: ["Claims submission", "Denial follow-up", "Monthly reporting", "Dedicated billing contact"],
    packSize: "Monthly service",
    moq: "1 clinic TIN",
    leadTime: "7–14 days to first claim cycle",
    guidePrice: "Guide · 3–5% of collections",
    image: IMAGES.marketplace.software[0],
    audience: "Fee-for-service + hybrid cash clinics",
  },
  {
    slug: "clinical-red-light-panel",
    rank: 10,
    headline: "Clinical Red-Light Therapy Panel",
    summary:
      "Treatment-room photobiomodulation panel for recovery and wellness add-on protocols (device selection guided on quote).",
    specs: ["Clinic treatment panel", "Mount / stand options", "Session timer guidance", "Staff training notes"],
    packSize: "1 panel",
    moq: "1 unit",
    leadTime: "1–3 weeks",
    guidePrice: "Guide · from $2,400/unit",
    image: IMAGES.marketplace.recovery[0],
    audience: "Recovery · longevity · cash-pay add-ons",
  },
  {
    slug: "provider-credentialing-setup",
    rank: 11,
    headline: "Provider Credentialing Setup",
    summary:
      "CAQH, payer enrollment, and verification support so new clinicians can see patients without stalling on paperwork.",
    specs: ["CAQH profile support", "Payer enrollment packets", "Status tracking", "Per-provider pricing"],
    packSize: "Per provider",
    moq: "1 provider",
    leadTime: "2–8 weeks (payer-dependent)",
    guidePrice: "Guide · from $150/provider",
    image: IMAGES.marketplace.software[1],
    audience: "New hires · multi-state expansion",
  },
  {
    slug: "local-patient-acquisition-seo",
    rank: 12,
    headline: "Local Patient Acquisition SEO",
    summary:
      "Maps, citations, and local search work aimed at outpatient clinics that need consistent consult demand.",
    specs: ["Google Business Profile", "Citation cleanup", "Local landing pages", "Monthly reporting"],
    packSize: "Monthly retainer",
    moq: "1 market / location",
    leadTime: "Kickoff in 5 business days",
    guidePrice: "Guide · from $1,200/mo",
    image: IMAGES.marketplace.software[0],
    audience: "Clinics investing in patient demand",
  },
];

const bySlug = new Map(FEATURED_CATALOG.map((item) => [item.slug, item]));

export function getFeaturedSku(slug: string): FeaturedSku | undefined {
  return bySlug.get(slug);
}

export function isFeaturedListing(listing: Pick<MarketplaceListingT, "slug">): boolean {
  return bySlug.has(listing.slug);
}

export function listFeaturedFromCatalog(listings: MarketplaceListingT[]): Array<MarketplaceListingT & { featured: FeaturedSku }> {
  const byListingSlug = new Map(listings.map((l) => [l.slug, l]));
  return FEATURED_CATALOG.map((featured) => {
    const listing = byListingSlug.get(featured.slug);
    if (!listing) return null;
    return { ...listing, featured };
  }).filter((row): row is MarketplaceListingT & { featured: FeaturedSku } => Boolean(row));
}

export function featuredImageFor(listing: Pick<MarketplaceListingT, "slug" | "category" | "title">, fallbackIndex = 0): string {
  const featured = bySlug.get(listing.slug);
  if (featured) return featured.image;
  return getMarketplaceImage(listing.category, fallbackIndex, `${listing.slug} ${listing.title ?? ""}`);
}
