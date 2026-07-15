import { db } from "@/lib/db";
import { AppShell, type PlatformData } from "@/components/site/app-shell";

export const dynamic = "force-dynamic";

async function getData(): Promise<PlatformData> {
  const [clinics, professionals, jobs, listings, articles, vendors] = await Promise.all([
    db.clinic.findMany({
      where: { deletedAt: null },
      orderBy: { verified: "desc" },
      include: {
        locations: true,
        providers: true,
        treatments: true,
        reviews: true,
      }
    }),
    db.professional.findMany({ orderBy: { verified: "desc" } }),
    db.jobPosting.findMany({ where: { status: "open" }, orderBy: { createdAt: "desc" } }),
    db.marketplaceListing.findMany({ where: { reviewStatus: "approved" }, orderBy: { verified: "desc" } }),
    db.article.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" } }),
    db.vendor.findMany({ orderBy: { verified: "desc" } }),
  ]);

  return {
    clinics: clinics.map((c) => ({
      ...c,
      capabilities: c.capabilities ?? "",
      providerTypes: c.providerTypes ?? "",
      locations: c.locations,
      providers: c.providers,
      treatments: c.treatments,
      reviews: c.reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString()
      }))
    })),
    professionals: professionals.map((p) => ({ ...p, licenses: p.licenses ?? "", licensedStates: p.licensedStates ?? "", certifications: p.certifications ?? "", specialties: p.specialties ?? "", bio: p.bio ?? "" })),
    jobs: jobs.map((j) => ({ ...j, requiredLicenses: j.requiredLicenses ?? "", requiredExperience: j.requiredExperience ?? "", treatmentSpecialties: j.treatmentSpecialties ?? "", schedule: j.schedule ?? "", description: j.description ?? "", applicationRequirements: j.applicationRequirements ?? "" })),
    listings: listings.map((l) => ({ ...l, vendorId: l.vendorId, pricingModel: l.pricingModel ?? "", priceNote: l.priceNote ?? "" })),
    articles: articles.map((a) => ({ ...a, references: a.references ?? "", relatedTreatment: a.relatedTreatment ?? "", content: a.content ?? "", excerpt: a.excerpt ?? "" })),
    vendors: vendors.map((v) => ({ ...v, overview: v.overview ?? "", website: v.website ?? "" })),
  };
}

export default async function Home() {
  const data = await getData();
  return <AppShell data={data} />;
}
