import type { MetadataRoute } from "next";
import { getJournalCategories, getJournalRecords } from "@/lib/journal/data";
import { listPublishedClinics } from "@/lib/public-clinics";
import { canonicalPath } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let clinicRoutes: MetadataRoute.Sitemap = [];
  try {
    const clinics = await listPublishedClinics();
    clinicRoutes = clinics
      .filter((clinic) => clinic.slug && clinic.state && clinic.city)
      .map((clinic) => ({
        url: canonicalPath(
          `/directory/${segment(clinic.state)}/${segment(clinic.city)}/${clinic.slug}`,
        ),
        lastModified: clinic.updatedAt ? new Date(clinic.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch (e) {
    console.error("Failed to fetch clinics for sitemap", e);
  }

  const mainRoutes: MetadataRoute.Sitemap = [
    { url: canonicalPath("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: canonicalPath("/patients"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalPath("/clinics"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalPath("/clinics/apply"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: canonicalPath("/directory"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: canonicalPath("/workforce"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: canonicalPath("/marketplace"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: canonicalPath("/journal"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: canonicalPath("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: canonicalPath("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: canonicalPath("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: canonicalPath("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: canonicalPath("/medical-disclaimer"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: canonicalPath("/accessibility"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let articleRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const [records, categories] = await Promise.all([
      getJournalRecords(),
      getJournalCategories(),
    ]);
    articleRoutes = records
      .filter((r) => !r.seo.noIndex)
      .map((r) => ({
        url: canonicalPath(`/journal/${r.article.slug}`),
        lastModified: new Date(r.article.updatedAt),
        changeFrequency: "monthly",
        priority: 0.8,
      }));
    categoryRoutes = categories.map((c) => ({
      url: canonicalPath(`/journal/category/${c.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Failed to build journal sitemap entries", e);
  }

  return [...mainRoutes, ...articleRoutes, ...categoryRoutes, ...clinicRoutes];
}

function segment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
