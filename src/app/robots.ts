import type { MetadataRoute } from "next";
import { headers } from "next/headers";

const MARKETING_URL = "https://novalyte.io";
const ADS_URL = "https://ads.novalyte.io";

const ADS_HOSTS = new Set(["ads.novalyte.io", "ads.localhost", "ads.local"]);

const BACKEND_DISALLOW = [
  "/api/",
  "/admin/",
  "/auth/",
  "/journal/preview/",
  "/clinic/",
  "/clinic",
  "/investor/",
  "/investor",
  "/workforce/professional/",
  "/workforce/professional",
  "/workforce/employer/",
  "/workforce/employer",
];

/**
 * Public marketing (novalyte.io) and landing host (ads.novalyte.io) are crawlable.
 * Backend portals stay disallowed.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const isAdsHost = ADS_HOSTS.has(host);

  if (isAdsHost) {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: BACKEND_DISALLOW,
        },
      ],
      sitemap: `${ADS_URL}/sitemap.xml`,
      host: ADS_URL,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: BACKEND_DISALLOW,
      },
    ],
    sitemap: `${MARKETING_URL}/sitemap.xml`,
    host: MARKETING_URL,
  };
}
