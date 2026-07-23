import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo-robots";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
  title: "Professional Portal",
};

export default function ProfessionalWorkforceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
