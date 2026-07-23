import type { Metadata } from "next";
import { PlatformRoute } from "@/components/site/platform-route";
import { canonicalPath } from "@/lib/site-config";
import { INDEXABLE_ROBOTS } from "@/lib/seo-robots";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Men's Health Clinic Marketplace",
  description:
    "Explore approved healthcare technology, equipment, and operational services for men's-health clinics.",
  alternates: { canonical: canonicalPath("/marketplace") },
  robots: INDEXABLE_ROBOTS,
  openGraph: {
    title: "Men's Health Clinic Marketplace | Novalyte AI",
    description:
      "Approved products and operational services for men's-health organizations.",
    url: canonicalPath("/marketplace"),
  },
};

export default function MarketplacePage() {
  return <PlatformRoute view="marketplace" />;
}
