import type { Metadata } from "next";
import { PlatformRoute } from "@/components/site/platform-route";
import { canonicalPath } from "@/lib/site-config";
import { INDEXABLE_ROBOTS } from "@/lib/seo-robots";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Directory and Growth Infrastructure for Men's Health Clinics",
  description:
    "Learn how clinics can apply for a reviewed Novalyte AI directory profile and access connected workforce and operational workflows.",
  alternates: { canonical: canonicalPath("/clinics") },
  robots: INDEXABLE_ROBOTS,
  openGraph: {
    title: "For Men's Health Clinics | Novalyte AI",
    description:
      "Apply for a reviewed public profile and connect clinic discovery with operational workflows.",
    url: canonicalPath("/clinics"),
  },
};

export default function ClinicsPage() {
  return <PlatformRoute view="clinics" />;
}
