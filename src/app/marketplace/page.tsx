import type { Metadata } from "next";
import { PlatformRoute } from "@/components/site/platform-route";
import { canonicalPath } from "@/lib/site-config";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Men's Health Clinic Marketplace",
  description:
    "Explore approved healthcare technology, equipment, and operational services for men's-health clinics.",
  alternates: { canonical: canonicalPath("/marketplace") },
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
