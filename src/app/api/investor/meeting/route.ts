import { NextResponse } from "next/server";
import { z } from "zod";

import {
  requireApprovedInvestor,
  investorAuthErrorResponse,
  logInvestorEvent,
} from "@/lib/investor/auth";
import { meetingRequestSchema } from "@/lib/investor/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { recordFormSubmissionAndNotify } from "@/lib/form-notifications";
import { captureServerEvent } from "@/lib/posthog-server";

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

    await recordFormSubmissionAndNotify({
      request,
      formType: "investor_meeting_request",
      sourceTable: "investor_meeting_requests",
      sourceRecordId: data.id,
      contactName: parsed.name,
      contactEmail: parsed.email,
      organization: parsed.firm || null,
      safeMetadata: {
        inquiry_type: parsed.inquiryType,
        preferred_date: parsed.preferredDate,
        timezone: parsed.timezone,
        check_size_range: parsed.checkSizeRange,
      },
      userId: user.id,
    }).catch((notificationError) =>
      console.error("investor meeting notification failed", notificationError),
    );

    await captureServerEvent({
      distinctId: data.id,
      event: "investor_meeting_requested",
      properties: {
        inquiry_type: parsed.inquiryType,
        has_preferred_date: Boolean(parsed.preferredDate),
      },
    }).catch(() => undefined);

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
