import type { Metadata } from "next";
import { PlatformRoute } from "@/components/site/platform-route";
import { canonicalPath } from "@/lib/site-config";
import { INDEXABLE_ROBOTS } from "@/lib/seo-robots";

export const revalidate = 300;

const TITLE = "Men's Health Clinic Directory";
const DESCRIPTION =
  "Search and compare men's health clinics by location, treatment focus, care format, telehealth availability, and publicly available clinic information.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: canonicalPath("/directory") },
  robots: INDEXABLE_ROBOTS,
  openGraph: {
    title: `${TITLE} | Novalyte AI`,
    description: DESCRIPTION,
    url: canonicalPath("/directory"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Novalyte AI`,
    description: DESCRIPTION,
  },
};

export default function DirectoryPage() {
  return <PlatformRoute view="directory" />;
}
