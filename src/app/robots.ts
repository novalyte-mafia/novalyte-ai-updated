import type { MetadataRoute } from "next";

const SITE_URL = "https://novalyte.io";

/**
 * robots.txt configuration.
 *
 * Public marketing, Journal, and approved directory pages are crawlable.
 * Authentication, previews, APIs, and private account areas are excluded.
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
          "/journal/preview/",
          "/workforce/professional/dashboard",
          "/workforce/professional/settings",
          "/workforce/professional/onboarding",
          "/workforce/professional/account-status",
          "/workforce/professional/verification-pending",
          "/workforce/professional/forgot-password",
          "/workforce/professional/reset-password",
          "/workforce/professional/sign-in",
          "/workforce/professional/sign-up",
          "/workforce/employer/dashboard",
          "/workforce/employer/onboarding",
          "/workforce/employer/sign-in",
          "/clinic/",
          "/clinic",
          "/investor",
          "/investor/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
