import type { Metadata } from "next";
import { PlatformRoute } from "@/components/site/platform-route";
import { canonicalPath } from "@/lib/site-config";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Men's Health Care Navigation for Patients",
  description:
    "Explore men's-health treatment options, start a private assessment, and find verified care options through Novalyte AI.",
  alternates: { canonical: canonicalPath("/patients") },
  openGraph: {
    title: "Men's Health Care Navigation for Patients | Novalyte AI",
    description:
      "Understand care options, start an assessment, and find verified men's-health clinics.",
    url: canonicalPath("/patients"),
  },
};

export default function PatientsPage() {
  return <PlatformRoute view="patients" />;
}
