import type { Metadata } from "next";
import { Lora } from "next/font/google";
import { NOINDEX_ROBOTS } from "@/lib/seo-robots";

const investorSerif = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-investor-serif",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Novalyte AI — Investor Portal",
    template: "%s · Novalyte AI Investors",
  },
  description:
    "Confidential Novalyte AI investor portal. Invitation and access code required.",
  robots: NOINDEX_ROBOTS,
};

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={investorSerif.variable}>{children}</div>;
}
