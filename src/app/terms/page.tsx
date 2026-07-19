import type { Metadata } from "next";
import { LegalPageShell } from "@/components/site/legal-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the terms that govern use of Novalyte AI websites, directory tools, and related services.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | Novalyte AI",
    description:
      "Review the terms that govern use of Novalyte AI websites, directory tools, and related services.",
    type: "website",
    url: "/terms",
  },
};

export default function TermsPage() {
  return <LegalPageShell view="terms" />;
}
