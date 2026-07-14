import type { MetadataRoute } from "next";

const SITE_URL = "https://novalyte.ai";

/**
 * robots.txt configuration.
 *
 * Allows all crawlers to access the site and points them to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
