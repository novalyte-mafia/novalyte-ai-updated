import "server-only";

import { db } from "@/lib/db";
import { listPublishedClinics } from "@/lib/public-clinics";
import { listPublicProfessionals } from "@/lib/workforce/public-talent";
import type {
  ArticleT,
  ClinicT,
  JobPostingT,
  MarketplaceListingT,
  ProfessionalT,
  VendorT,
} from "@/lib/types";

export type PlatformData = {
  clinics: ClinicT[];
  professionals: ProfessionalT[];
  jobs: JobPostingT[];
  listings: MarketplaceListingT[];
  articles: ArticleT[];
  vendors: VendorT[];
};

/**
 * Loads only records that are intentionally public.
 *
 * Prospect-clinic tables are never queried here. Legacy Clinic rows must be
 * verified and tied to an approved claim before they are sent to the browser.
 * The dedicated directory publication projection will replace this legacy
 * filter as approved profiles are created.
 */
export async function getPublicPlatformData(): Promise<PlatformData> {
  const [
    clinics,
    registryProfessionals,
    legacyProfessionals,
    jobs,
    listings,
    articles,
    vendors,
  ] = await Promise.all([
    listPublishedClinics(),
    listPublicProfessionals(),
    db.professional.findMany({
      where: { verified: true },
      orderBy: { verified: "desc" },
    }),
    db.jobPosting.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
    }),
    db.marketplaceListing.findMany({
      where: { reviewStatus: "approved" },
      orderBy: { verified: "desc" },
    }),
    db.article.findMany({
      where: {
        status: "published",
        deletedAt: null,
        seoNoIndex: false,
      },
      orderBy: { publishedAt: "desc" },
    }),
    db.vendor.findMany({
      where: { verified: true },
      orderBy: { verified: "desc" },
    }),
  ]);

  const professionals = registryProfessionals.length
    ? registryProfessionals
    : legacyProfessionals.map((professional: ProfessionalT) => ({
        ...professional,
        licenses: professional.licenses ?? "",
        licensedStates: professional.licensedStates ?? "",
        certifications: professional.certifications ?? "",
        specialties: professional.specialties ?? "",
        bio: professional.bio ?? "",
      }));

  return {
    clinics: clinics.map((clinic: ClinicT) => ({
      ...clinic,
      capabilities: clinic.capabilities ?? "",
      providerTypes: clinic.providerTypes ?? "",
      locations: clinic.locations,
      providers: clinic.providers,
      treatments: clinic.treatments,
      reviews: (clinic.reviews ?? []).map((review) => ({
        ...review,
        createdAt:
          typeof review.createdAt === "object" &&
          review.createdAt !== null &&
          "toISOString" in review.createdAt
            ? (review.createdAt as Date).toISOString()
            : String(review.createdAt),
      })),
    })),
    professionals,
    jobs: jobs.map((job: JobPostingT) => ({
      ...job,
      requiredLicenses: job.requiredLicenses ?? "",
      requiredExperience: job.requiredExperience ?? "",
      treatmentSpecialties: job.treatmentSpecialties ?? "",
      schedule: job.schedule ?? "",
      description: job.description ?? "",
      applicationRequirements: job.applicationRequirements ?? "",
    })),
    listings: listings.map((listing: MarketplaceListingT) => ({
      ...listing,
      pricingModel: listing.pricingModel ?? "",
      priceNote: listing.priceNote ?? "",
    })),
    articles: articles.map((article: ArticleT) => ({
      ...article,
      references: article.references ?? "",
      relatedTreatment: article.relatedTreatment ?? "",
      content: article.content ?? "",
      excerpt: article.excerpt ?? "",
    })),
    vendors: vendors.map((vendor: VendorT) => ({
      ...vendor,
      overview: vendor.overview ?? "",
      website: vendor.website ?? "",
    })),
  };
}
