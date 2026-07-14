// Shared constants and helpers for Novalyte AI

export const TREATMENT_VERTICALS = [
  { slug: "testosterone-replacement-therapy", label: "Testosterone Replacement Therapy", short: "TRT" },
  { slug: "hormone-optimization", label: "Hormone Optimization", short: "Hormones" },
  { slug: "erectile-dysfunction", label: "Erectile Dysfunction Care", short: "ED Care" },
  { slug: "medical-weight-loss", label: "Medical Weight Loss", short: "Weight Loss" },
  { slug: "glp-1", label: "GLP-1 Programs", short: "GLP-1" },
  { slug: "peptide-therapy", label: "Peptide Therapy", short: "Peptides" },
  { slug: "hair-restoration", label: "Hair Restoration", short: "Hair" },
  { slug: "sexual-wellness", label: "Sexual Wellness", short: "Wellness" },
  { slug: "longevity-medicine", label: "Longevity Medicine", short: "Longevity" },
  { slug: "performance-recovery", label: "Performance & Recovery", short: "Performance" },
  { slug: "preventive-mens-health", label: "Preventive Men's Health", short: "Preventive" },
  { slug: "telehealth-services", label: "Telehealth Services", short: "Telehealth" },
] as const;

export const PILLARS = [
  {
    key: "acquisition",
    label: "Patient Acquisition",
    cta: "Explore Patient Acquisition",
    icon: "Megaphone",
    description:
      "Help clinics identify, educate, capture, and route high-intent patients through data-driven campaigns, educational content, assessments, landing pages, and structured intake workflows.",
    view: "patients" as const,
  },
  {
    key: "directory",
    label: "Verified Clinic Directory",
    cta: "Browse the Directory",
    icon: "Building2",
    description:
      "Help patients discover trustworthy men's health clinics by location, treatment specialty, telehealth availability, provider expertise, and clinic capabilities.",
    view: "directory" as const,
  },
  {
    key: "workforce",
    label: "Workforce Hub",
    cta: "Explore Workforce",
    icon: "Users",
    description:
      "Connect clinics with qualified physicians, nurse practitioners, physician assistants, registered nurses, medical assistants, phlebotomists, medical directors, coordinators, and operational professionals.",
    view: "workforce" as const,
  },
  {
    key: "marketplace",
    label: "Services Marketplace",
    cta: "Browse the Marketplace",
    icon: "Package",
    description:
      "Help clinics discover equipment, technology, vendors, laboratory services, billing providers, compliance support, marketing services, staffing partners, and operational tools.",
    view: "marketplace" as const,
  },
] as const;

export const MARKETPLACE_CATEGORIES = [
  "Laboratory Services",
  "Diagnostic Equipment",
  "Injection Supplies",
  "Phlebotomy Supplies",
  "Medical Furniture",
  "Body-Composition Systems",
  "Recovery Technology",
  "Telehealth Tools",
  "Clinic Software",
  "Billing Services",
  "Credentialing Services",
  "Compliance Support",
  "Marketing Services",
  "Staffing Services",
  "Patient Engagement Tools",
  "Clinic Expansion Services",
] as const;

export const PROFESSIONAL_TITLES = [
  "Physician",
  "Nurse Practitioner",
  "Physician Assistant",
  "Registered Nurse",
  "Medical Assistant",
  "Phlebotomist",
  "Medical Director",
  "Patient Coordinator",
  "Revenue Cycle Specialist",
] as const;

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
] as const;

export function splitCsv(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function colorClasses(color: string): { bg: string; text: string; ring: string; soft: string } {
  const map: Record<string, { bg: string; text: string; ring: string; soft: string }> = {
    teal: { bg: "bg-teal-600", text: "text-teal-700", ring: "ring-teal-200", soft: "bg-teal-50" },
    emerald: { bg: "bg-emerald-600", text: "text-emerald-700", ring: "ring-emerald-200", soft: "bg-emerald-50" },
    blue: { bg: "bg-sky-600", text: "text-sky-700", ring: "ring-sky-200", soft: "bg-sky-50" },
    amber: { bg: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-200", soft: "bg-amber-50" },
    violet: { bg: "bg-violet-600", text: "text-violet-700", ring: "ring-violet-200", soft: "bg-violet-50" },
  };
  return map[color] ?? map.teal;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
