import type { Metadata } from "next";
import { PlatformRoute } from "@/components/site/platform-route";
import { canonicalPath } from "@/lib/site-config";
import { INDEXABLE_ROBOTS } from "@/lib/seo-robots";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Men's Health Workforce and Career Marketplace",
  description:
    "Discover men's-health career opportunities and approved professional profiles for specialized healthcare teams.",
  alternates: { canonical: canonicalPath("/workforce") },
  robots: INDEXABLE_ROBOTS,
  openGraph: {
    title: "Men's Health Workforce | Novalyte AI",
    description:
      "Connect specialized healthcare professionals with men's-health organizations.",
    url: canonicalPath("/workforce"),
  },
};

export default function WorkforcePage() {
  return <PlatformRoute view="workforce" />;
}
