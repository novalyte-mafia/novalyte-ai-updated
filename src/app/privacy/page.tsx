import type { Metadata } from "next";
import { LegalPageShell } from "@/components/site/legal-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how Novalyte AI collects, uses, and protects personal information across the patient, clinic, and workforce experiences.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Novalyte AI",
    description:
      "Read how Novalyte AI collects, uses, and protects personal information across the patient, clinic, and workforce experiences.",
    type: "website",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return <LegalPageShell view="privacy" />;
}
