import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo-robots";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
  title: "Authentication",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
