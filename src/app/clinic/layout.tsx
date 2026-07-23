import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo-robots";
import { ClinicAuthGate } from "./clinic-auth-gate";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
  title: "Clinic Portal",
};

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return <ClinicAuthGate>{children}</ClinicAuthGate>;
}
