import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { InvestorGateScreen } from "@/components/investor/gate-screen";
import { INVESTOR_GATE_COOKIE, verifyGateToken } from "@/lib/investor/gate";

export const metadata = { title: "Access" };

export default async function InvestorGatePage() {
  const cookieStore = await cookies();
  if (verifyGateToken(cookieStore.get(INVESTOR_GATE_COOKIE)?.value)) {
    redirect("/investor");
  }
  return <InvestorGateScreen />;
}
