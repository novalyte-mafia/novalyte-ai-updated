import type { Metadata } from "next";
import { LegalPageShell } from "@/components/site/legal-page-shell";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "Learn how Novalyte AI approaches accessibility for patients, clinics, and workforce users.",
  alternates: { canonical: "/accessibility" },
  openGraph: {
    title: "Accessibility Statement | Novalyte AI",
    description:
      "Learn how Novalyte AI approaches accessibility for patients, clinics, and workforce users.",
    type: "website",
    url: "/accessibility",
  },
};

export default function AccessibilityPage() {
  return <LegalPageShell view="accessibility" />;
}
