import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import {
  listIndexableAdsPaths,
  listIndexableOrganicPaths,
} from "@/lib/campaigns/public-pages";
import { getJournalCategories, getJournalRecords } from "@/lib/journal/data";
import { listPublishedClinics } from "@/lib/public-clinics";
import { canonicalPath } from "@/lib/site-config";

const ADS_HOST = "https://ads.novalyte.io";
const ADS_HOSTS = new Set(["ads.novalyte.io", "ads.localhost", "ads.local"]);

function adsUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${ADS_HOST}${normalized.replace(/\/+$/, "") || ""}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const host = (await headers()).get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const isAdsHost = ADS_HOSTS.has(host);

  // ads.novalyte.io sitemap: landing pages only
  if (isAdsHost) {
    let adsRoutes: MetadataRoute.Sitemap = [
      { url: adsUrl("/ads"), lastModified: now, changeFrequency: "daily", priority: 1 },
    ];
    try {
      const paths = await listIndexableAdsPaths();
      adsRoutes = [
        ...adsRoutes,
        ...paths.map((path) => ({
          url: adsUrl(path),
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.9,
        })),
      ];
    } catch (e) {
      console.error("Failed to build ads sitemap entries", e);
    }
    return adsRoutes;
  }

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
    { url: canonicalPath("/patients"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: canonicalPath("/clinics"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: canonicalPath("/clinics/apply"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: canonicalPath("/directory"), lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: canonicalPath("/workforce"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: canonicalPath("/marketplace"), lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: canonicalPath("/journal"), lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: canonicalPath("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: canonicalPath("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
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

  let campaignRoutes: MetadataRoute.Sitemap = [];
  try {
    const paths = await listIndexableOrganicPaths();
    campaignRoutes = paths.map((path) => ({
      url: canonicalPath(path),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    }));
  } catch (e) {
    console.error("Failed to build campaign sitemap entries", e);
  }

  // Also list ads.novalyte.io landers from the marketing sitemap for discovery.
  let adsHostRoutes: MetadataRoute.Sitemap = [
    { url: adsUrl("/ads"), lastModified: now, changeFrequency: "daily", priority: 0.85 },
  ];
  try {
    const adsPaths = await listIndexableAdsPaths();
    adsHostRoutes = [
      ...adsHostRoutes,
      ...adsPaths.map((path) => ({
        url: adsUrl(path),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      })),
    ];
  } catch (e) {
    console.error("Failed to build ads host sitemap entries", e);
  }

  return [
    ...mainRoutes,
    ...articleRoutes,
    ...categoryRoutes,
    ...clinicRoutes,
    ...campaignRoutes,
    ...adsHostRoutes,
  ];
}

function segment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
