import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/article-content";

const SITE_URL = "https://novalyte.ai";

/**
 * Next.js sitemap.
 *
 * The Novalyte AI platform uses a Zustand view-router on a single `/` route,
 * with hash fragments expressing the active view (`#journal`, `#journal/{slug}`,
 * `#journal/category/{name}`). We expose these URLs to crawlers so the
 * structured data and canonical URLs are discoverable.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Main app routes (single-page, hash-fragmented)
  const mainRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/#journal`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/#directory`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/#marketplace`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/#workforce`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/#patients`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/#clinics`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/#about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Journal article routes
  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/#journal/${a.slug}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Journal category routes
  const categories = Array.from(new Set(ARTICLES.map((a) => a.category)));
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/#journal/category/${encodeURIComponent(c)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Legal / informational routes
  const legalRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/#privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/#terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/#medical-disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/#accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/#cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [...mainRoutes, ...articleRoutes, ...categoryRoutes, ...legalRoutes];
}
