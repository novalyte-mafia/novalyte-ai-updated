import { NextResponse } from "next/server";
import { z } from "zod";

import {
  requireApprovedInvestor,
  investorAuthErrorResponse,
  logInvestorEvent,
} from "@/lib/investor/auth";
import { meetingRequestSchema } from "@/lib/investor/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { user, profile } = await requireApprovedInvestor();
    const parsed = meetingRequestSchema.parse(await request.json());

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("investor_meeting_requests")
      .insert({
        user_id: user.id,
        name: parsed.name,
        firm: parsed.firm || null,
        email: parsed.email.toLowerCase(),
        preferred_date: parsed.preferredDate || null,
        timezone: parsed.timezone || null,
        check_size_range: parsed.checkSizeRange || null,
        investment_thesis: parsed.investmentThesis || null,
        topics: parsed.topics || null,
        message: parsed.message,
        inquiry_type: parsed.inquiryType,
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("meeting request insert failed", error);
      return NextResponse.json({ error: "Unable to submit request." }, { status: 500 });
    }

    await logInvestorEvent({
      userId: user.id,
      profileId: (profile.id as string) ?? null,
      eventType: "meeting_requested",
      section: "meet",
      metadata: { requestId: data.id, inquiryType: parsed.inquiryType },
    });

    const notifyEmail =
      process.env.INVESTOR_NOTIFY_EMAIL?.trim() || "founder@novalyte.io";
    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from:
              process.env.CONTACT_NOTIFICATION_FROM_EMAIL?.trim() ||
              "Novalyte AI <no-reply@novalyte.io>",
            to: [notifyEmail],
            subject: `Investor meeting request: ${parsed.name}`,
            text: [
              `Investor meeting request`,
              `Name: ${parsed.name}`,
              `Firm: ${parsed.firm || "—"}`,
              `Email: ${parsed.email}`,
              `Preferred: ${parsed.preferredDate || "—"} ${parsed.timezone || ""}`,
              `Type: ${parsed.inquiryType}`,
              `Message: ${parsed.message}`,
            ].join("\n"),
          }),
        });
        await admin.from("investor_notification_deliveries").insert({
          channel: "email",
          recipient: notifyEmail,
          event_type: "meeting_request",
          payload: { requestId: data.id },
          status: res.ok ? "sent" : "failed",
          error: res.ok ? null : await res.text(),
        });
      } catch (notifyError) {
        console.error("meeting notify failed", notifyError);
      }
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    const authResponse = investorAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    console.error("meeting request error", error);
    return NextResponse.json({ error: "Unable to submit request." }, { status: 500 });
  }
}
