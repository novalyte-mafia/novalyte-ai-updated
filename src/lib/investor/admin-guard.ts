import "server-only";
import { redirect } from "next/navigation";

import { InvestorAuthError, requireFounderAdmin } from "@/lib/investor/auth";
import { investorPath } from "@/lib/investor/config";

export async function guardFounderAdmin() {
  try {
    return await requireFounderAdmin();
  } catch (error) {
    if (error instanceof InvestorAuthError) {
      if (error.statusCode === 401) redirect(investorPath("sign-in"));
      redirect(investorPath("workspace"));
    }
    throw error;
  }
}
