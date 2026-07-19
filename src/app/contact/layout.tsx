import type { Metadata } from "next";
import { canonicalPath } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact Novalyte AI",
  description:
    "Contact Novalyte AI about patient navigation, clinic listings, healthcare workforce, marketplace participation, partnerships, or privacy.",
  alternates: { canonical: canonicalPath("/contact") },
  openGraph: {
    title: "Contact Novalyte AI",
    description:
      "Get help or contact the Novalyte AI team about the healthcare platform.",
    url: canonicalPath("/contact"),
  },
};

export default function ContactLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
