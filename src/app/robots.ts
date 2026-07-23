import type { MetadataRoute } from "next";

const SITE_URL = "https://novalyte.io";

/**
 * robots.txt — public marketing only.
 *
 * Backend portals, auth, APIs, ads landers, investor surfaces, and account
 * dashboards are disallowed so they do not appear in Google.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/auth/",
          "/ads/",
          "/ads",
          "/journal/preview/",
          "/clinic/",
          "/clinic",
          "/investor/",
          "/investor",
          "/workforce/professional/",
          "/workforce/professional",
          "/workforce/employer/",
          "/workforce/employer",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
