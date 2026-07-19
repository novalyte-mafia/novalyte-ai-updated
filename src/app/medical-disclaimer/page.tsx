import type { Metadata } from "next";
import { LegalPageShell } from "@/components/site/legal-page-shell";

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description:
    "Novalyte AI provides educational information and care-navigation tools. It does not provide medical advice, diagnosis, or treatment.",
  alternates: { canonical: "/medical-disclaimer" },
  openGraph: {
    title: "Medical Disclaimer | Novalyte AI",
    description:
      "Novalyte AI provides educational information and care-navigation tools. It does not provide medical advice, diagnosis, or treatment.",
    type: "website",
    url: "/medical-disclaimer",
  },
};

export default function MedicalDisclaimerPage() {
  return <LegalPageShell view="medical-disclaimer" />;
}
