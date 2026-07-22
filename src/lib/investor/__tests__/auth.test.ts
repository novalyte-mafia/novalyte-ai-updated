import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";

import { hasInvestorAccountType } from "@/lib/investor/auth";

function userWithTypes(types: string[]): User {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    app_metadata: { account_types: types },
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;
}

describe("hasInvestorAccountType", () => {
  it("returns true when the role is present", () => {
    const user = userWithTypes(["investor_approved", "advisor"]);
    expect(hasInvestorAccountType(user, "investor_approved")).toBe(true);
    expect(hasInvestorAccountType(user, "founder_admin")).toBe(false);
  });

  it("returns false when account_types is missing or not an array", () => {
    const bare = {
      id: "x",
      app_metadata: {},
      user_metadata: { account_types: ["founder_admin"] },
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
    expect(hasInvestorAccountType(bare, "founder_admin")).toBe(false);
  });
});
