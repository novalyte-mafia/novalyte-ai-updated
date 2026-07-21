import "server-only";
import { redirect } from "next/navigation";

import {
  InvestorAuthError,
  requireApprovedInvestor,
  hasInvestorAccountType,
} from "@/lib/investor/auth";
import { investorPath } from "@/lib/investor/config";

export async function guardApprovedInvestor() {
  try {
    const { user, profile } = await requireApprovedInvestor();
    return {
      user,
      profile,
      isFounder: hasInvestorAccountType(user, "founder_admin"),
    };
  } catch (error) {
    if (error instanceof InvestorAuthError) {
      if (error.statusCode === 401) redirect(investorPath("sign-in"));
      redirect(investorPath("contact?intent=access"));
    }
    throw error;
  }
}
