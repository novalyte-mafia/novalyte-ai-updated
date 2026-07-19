import type { Metadata } from "next";
import { canonicalPath } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Apply for a Novalyte AI Clinic Profile",
  description:
    "Submit your clinic for review before it can receive a public Novalyte AI directory profile.",
  alternates: { canonical: canonicalPath("/clinics/apply") },
  openGraph: {
    title: "Apply for a Clinic Profile | Novalyte AI",
    description:
      "Start the reviewed clinic-listing application. Submissions are not published automatically.",
    url: canonicalPath("/clinics/apply"),
  },
};

export default function ClinicApplicationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
