import { NextResponse } from "next/server";
import { z } from "zod";

import {
  requireFounderAdmin,
  investorAuthErrorResponse,
  logInvestorEvent,
} from "@/lib/investor/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["revoke", "restore"]),
});

export async function POST(request: Request) {
  try {
    const founder = await requireFounderAdmin();
    const { userId, action } = schema.parse(await request.json());
    const admin = getSupabaseAdmin();

    if (action === "revoke") {
      await admin.rpc("revoke_account_type", {
        p_user_id: userId,
        p_type: "investor_approved",
      });
      await admin
        .from("investor_profiles")
        .update({ access_status: "revoked", updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    } else {
      await admin.rpc("grant_account_type", {
        p_user_id: userId,
        p_type: "investor_approved",
      });
      await admin
        .from("investor_profiles")
        .update({ access_status: "approved", updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    }

    await logInvestorEvent({
      userId: founder.id,
      eventType: action === "revoke" ? "investor_revoked" : "investor_restored",
      metadata: { investorUserId: userId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const authResponse = investorAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    console.error("admin revoke error", error);
    return NextResponse.json({ error: "Unable to update investor." }, { status: 500 });
  }
}
