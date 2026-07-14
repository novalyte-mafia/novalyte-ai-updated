// Shared types for Novalyte AI views (serializable shapes from Prisma)

export type ClinicT = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  overview: string;
  logoColor: string;
  city: string;
  state: string;
  zip: string;
  serviceArea: string | null;
  specialties: string;
  capabilities: string | null;
  telehealth: boolean;
  providerTypes: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: string | null;
  verified: boolean;
  verificationStatus: string;
};

export type ProfessionalT = {
  id: string;
  name: string;
  title: string;
  city: string;
  state: string;
  remote: boolean;
  licenses: string | null;
  licensedStates: string | null;
  certifications: string | null;
  specialties: string | null;
  yearsExperience: number;
  availability: string;
  employmentPref: string;
  bio: string | null;
  verified: boolean;
};

export type JobPostingT = {
  id: string;
  clinicName: string;
  title: string;
  employmentType: string;
  city: string;
  state: string;
  remote: boolean;
  requiredLicenses: string | null;
  requiredExperience: string | null;
  treatmentSpecialties: string | null;
  compMin: number | null;
  compMax: number | null;
  schedule: string | null;
  description: string;
  applicationRequirements: string | null;
  status: string;
};

export type MarketplaceListingT = {
  id: string;
  vendorName: string;
  title: string;
  slug: string;
  category: string;
  listingType: string;
  description: string;
  pricingModel: string | null;
  priceNote: string | null;
  availability: string;
  imageColor: string;
  verified: boolean;
  reviewStatus: string;
};

export type ArticleT = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  medicalReviewer: string | null;
  readingTime: number;
  publishedAt: string;
  updatedAt: string;
  references: string | null;
  relatedTreatment: string | null;
};
