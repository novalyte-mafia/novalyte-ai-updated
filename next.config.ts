import type { NextConfig } from "next";

const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const posthogAssetsHost = process.env.NEXT_PUBLIC_POSTHOG_ASSETS_HOST;

// Allow journal media served from Supabase Storage (object + render URLs).
const supabaseHostname = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const supabaseRemotePatterns = [
  { protocol: "https" as const, hostname: "*.supabase.co", pathname: "/storage/v1/**" },
  ...(supabaseHostname && !supabaseHostname.endsWith(".supabase.co")
    ? [{ protocol: "https" as const, hostname: supabaseHostname, pathname: "/storage/v1/**" }]
    : []),
];

const privateNoIndexSources = [
  "/auth/:path*",
  "/workforce/professional/dashboard/:path*",
  "/workforce/professional/settings/:path*",
  "/workforce/professional/onboarding/:path*",
  "/workforce/professional/account-status/:path*",
  "/workforce/professional/verification-pending/:path*",
  "/workforce/professional/forgot-password/:path*",
  "/workforce/professional/reset-password/:path*",
  "/workforce/professional/sign-in/:path*",
  "/workforce/professional/sign-up/:path*",
  "/workforce/employer/dashboard/:path*",
  "/workforce/employer/onboarding/:path*",
  "/workforce/employer/sign-in/:path*",
];

const noIndexHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  allowedDevOrigins: ["*.space-z.ai", "*.z.ai"],
  images: {
    remotePatterns: supabaseRemotePatterns,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.novalyte.io" }],
        destination: "https://novalyte.io/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Signed draft previews must never be cached or indexed.
        source: "/journal/preview/:token*",
        headers: noIndexHeaders,
      },
      ...privateNoIndexSources.map((source) => ({
        source,
        headers: noIndexHeaders,
      })),
    ];
  },
  async rewrites() {
    if (!posthogHost || !posthogAssetsHost) return [];
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${posthogAssetsHost}/static/:path*`,
      },
      {
        source: "/ingest/array/:path*",
        destination: `${posthogAssetsHost}/array/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
