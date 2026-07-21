import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Lora } from "next/font/google";

import { InvestorGateScreen } from "@/components/investor/gate-screen";
import { INVESTOR_GATE_COOKIE, verifyGateToken } from "@/lib/investor/gate";

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
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default async function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const unlocked = verifyGateToken(cookieStore.get(INVESTOR_GATE_COOKIE)?.value);

  return (
    <div className={investorSerif.variable}>
      {unlocked ? children : <InvestorGateScreen />}
    </div>
  );
}
