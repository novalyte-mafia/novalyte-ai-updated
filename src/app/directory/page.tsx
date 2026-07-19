import type { Metadata } from "next";
import { PlatformRoute } from "@/components/site/platform-route";
import { canonicalPath } from "@/lib/site-config";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Verified Men's Health Clinic Directory",
  description:
    "Search reviewed men's-health clinics by location, treatment focus, and care format. Only approved public profiles appear.",
  alternates: { canonical: canonicalPath("/directory") },
  openGraph: {
    title: "Verified Men's Health Clinic Directory | Novalyte AI",
    description:
      "Search approved public clinic profiles by location and men's-health service.",
    url: canonicalPath("/directory"),
  },
};

export default function DirectoryPage() {
  return <PlatformRoute view="directory" />;
}
