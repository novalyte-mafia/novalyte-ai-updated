import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { INVESTOR_GATE_COOKIE, verifyGateToken } from "@/lib/investor/gate";

/**
 * Access-code gate for every investor route.
 *
 * Uses a redirect (not conditional rendering) so that page payloads are never
 * generated or streamed for visitors without a valid gate cookie — layouts and
 * pages render in parallel in Next.js, so conditional rendering alone leaks
 * page content in the RSC flight data.
 */
export default async function GatedInvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (!verifyGateToken(cookieStore.get(INVESTOR_GATE_COOKIE)?.value)) {
    redirect("/investor/gate");
  }
  return <>{children}</>;
}
