import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo-robots";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
  title: "Employer Portal",
};

export default function EmployerWorkforceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
