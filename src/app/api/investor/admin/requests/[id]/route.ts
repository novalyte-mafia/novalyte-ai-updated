import { NextResponse } from "next/server";
import { z } from "zod";

import {
  requireFounderAdmin,
  investorAuthErrorResponse,
  logInvestorEvent,
} from "@/lib/investor/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { investorSiteUrl } from "@/lib/investor/config";

const schema = z.object({
  action: z.enum(["approve", "deny"]),
  notes: z.string().max(2000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const founder = await requireFounderAdmin();
    const { id } = await params;
    const { action, notes } = schema.parse(await request.json());

    const admin = getSupabaseAdmin();
    const { data: req, error: reqError } = await admin
      .from("investor_access_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (reqError || !req) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    if (action === "deny") {
      await admin
        .from("investor_access_requests")
        .update({
          status: "denied",
          reviewed_by: founder.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      await logInvestorEvent({
        userId: founder.id,
        eventType: "access_request_denied",
        metadata: { requestId: id },
      });
      return NextResponse.json({ ok: true, status: "denied" });
    }

    // approve: invite or find auth user, grant role, create profile
    const email = String(req.work_email).toLowerCase();
    let userId: string | null = null;

    const { data: invited, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: investorSiteUrl("/investor/sign-in"),
      });

    if (invited?.user) {
      userId = invited.user.id;
    } else if (inviteError) {
      // Likely already registered — look up existing user by listing.
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users.find(
        (u) => u.email?.toLowerCase() === email,
      );
      if (existing) userId = existing.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unable to create or locate the investor account." },
        { status: 500 },
      );
    }

    await admin.rpc("grant_account_type", {
      p_user_id: userId,
      p_type: "investor_approved",
    });

    await admin.from("investor_profiles").upsert(
      {
        user_id: userId,
        access_request_id: id,
        full_name: req.full_name,
        work_email: email,
        firm: req.firm,
        role_title: req.role_title,
        investor_type: req.investor_type,
        stage: "access_approved",
        check_size_range: req.check_size_range,
        linkedin_url: req.linkedin_url,
        website: req.website,
        access_status: "approved",
      },
      { onConflict: "user_id" },
    );

    await admin
      .from("investor_access_requests")
      .update({
        status: "approved",
        reviewed_by: founder.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    await admin.from("investor_invitations").insert({
      access_request_id: id,
      email,
      token_hash: `supabase-invite-${userId}`,
      invited_by: founder.id,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      accepted_user_id: userId,
    });

    await logInvestorEvent({
      userId: founder.id,
      eventType: "access_request_approved",
      metadata: { requestId: id, investorUserId: userId },
    });

    return NextResponse.json({ ok: true, status: "approved" });
  } catch (error) {
    const authResponse = investorAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    console.error("admin request action error", error);
    return NextResponse.json({ error: "Unable to process request." }, { status: 500 });
  }
}
