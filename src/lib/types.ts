// Shared types for Novalyte AI views (serializable shapes from Prisma)

export type ClinicLocationT = {
  id: string;
  clinicId: string;
  name: string;
  address: string;
  phone: string | null;
  hours: string | null;
  parking: string | null;
  transit: string | null;
  accessibility: string | null;
  onSiteLab: boolean;
  phlebotomy: boolean;
  earliestAppt: string | null;
};

export type ClinicProviderT = {
  id: string;
  clinicId: string;
  name: string;
  credentials: string;
  role: string;
  specialties: string | null;
  yearsExperience: number;
  bio: string | null;
  languages: string | null;
  telehealth: boolean;
  avatarUrl: string | null;
};

export type ClinicTreatmentT = {
  id: string;
  clinicId: string;
  name: string;
  category: string;
  description: string | null;
  concerns: string | null;
  priceRange: string | null;
  labRequired: boolean;
  consultRequired: boolean;
  careFormat: string | null;
};

export type ClinicReviewT = {
  id: string;
  clinicId: string;
  rating: number;
  author: string;
  content: string;
  category: string | null;
  verifiedPatient: boolean;
  response: string | null;
  createdAt: string;
};

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
  bookingUrl?: string | null;
  hours: string | null;
  verified: boolean;
  verificationStatus: string;

  // Directory classification (demo | unclaimed | claimed | verified)
  listingStatus?: string;
  latitude?: number | null;
  longitude?: number | null;
  dataSource?: string | null;
  sourceUrl?: string | null;
  lastReviewedAt?: string | null;
  financingAvailable?: boolean | null;
  inPersonAvailable?: boolean | null;
  sameDayConsultations?: boolean | null;

  // New discovery & ownership fields
  acceptingNewPatients: boolean;
  claimStatus: string;
  profileCompleteness: number;
  initialConsultPrice: number | null;
  membershipPrice: number | null;
  insuranceAccepted: boolean;
  hsaFsaAccepted: boolean;
  earliestAvailability: string | null;
  statesServed: string | null;
  languages: string;
  accessibility: string;
  pricingStatus: string;
  whatToExpect: string | null;

  // Relational data arrays
  locations: ClinicLocationT[];
  providers: ClinicProviderT[];
  treatments: ClinicTreatmentT[];
  reviews: ClinicReviewT[];
  updatedAt?: string | Date;
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
  createdAt?: string;
};

export type MarketplaceListingT = {
  id: string;
  vendorId: string;
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

export type VendorT = {
  id: string;
  name: string;
  slug: string;
  overview: string | null;
  website: string | null;
  verified: boolean;
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
