import type { Metadata } from "next";
import { INDEXABLE_ROBOTS } from "@/lib/seo-robots";

/** Landing pages on ads.novalyte.io / /ads must be crawlable. */
export const metadata: Metadata = {
  robots: INDEXABLE_ROBOTS,
  title: {
    default: "Novalyte Care Navigation",
    template: "%s | Novalyte",
  },
};

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
