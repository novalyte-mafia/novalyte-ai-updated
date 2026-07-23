import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { accessRequestSchema } from "@/lib/investor/schemas";
import { logInvestorEvent } from "@/lib/investor/auth";
import { recordFormSubmissionAndNotify } from "@/lib/form-notifications";
import { captureServerEvent } from "@/lib/posthog-server";

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = accessRequestSchema.parse(body);

    const ip = clientIp(request);
    const salt = process.env.CONTACT_RATE_LIMIT_SECRET || "novalyte_investor_salt";
    const ipHash = crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);

    const admin = getSupabaseAdmin();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("investor_access_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", oneHourAgo)
      .ilike("work_email", parsed.workEmail);

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Too many requests from this email. Please try again later." },
        { status: 429 },
      );
    }

    const { data, error } = await admin
      .from("investor_access_requests")
      .insert({
        full_name: parsed.fullName,
        work_email: parsed.workEmail.toLowerCase(),
        firm: parsed.firm || null,
        role_title: parsed.roleTitle || null,
        investor_type: parsed.investorType,
        check_size_range: parsed.checkSizeRange || null,
        investment_stage_preference: parsed.investmentStagePreference || null,
        portfolio_companies: parsed.portfolioCompanies || null,
        linkedin_url: parsed.linkedinUrl || null,
        website: parsed.website || null,
        reason_for_interest: parsed.reasonForInterest,
        discovery_source: parsed.discoverySource || null,
        message: parsed.message || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "An open access request already exists for this email." },
          { status: 409 },
        );
      }
      console.error("investor access request insert failed", error);
      return NextResponse.json({ error: "Unable to submit request." }, { status: 500 });
    }

    await logInvestorEvent({
      eventType: "access_request_submitted",
      metadata: { requestId: data.id, ipHash },
    });

    await recordFormSubmissionAndNotify({
      request,
      formType: "investor_access_request",
      sourceTable: "investor_access_requests",
      sourceRecordId: data.id,
      contactName: parsed.fullName,
      contactEmail: parsed.workEmail,
      organization: parsed.firm || null,
      safeMetadata: {
        investor_type: parsed.investorType,
        role_title: parsed.roleTitle,
        check_size_range: parsed.checkSizeRange,
        discovery_source: parsed.discoverySource,
      },
    }).catch((notificationError) =>
      console.error("investor access request notification failed", notificationError),
    );

    await captureServerEvent({
      distinctId: data.id,
      event: "investor_access_requested",
      properties: {
        investor_type: parsed.investorType,
        discovery_source: parsed.discoverySource ?? null,
        has_firm: Boolean(parsed.firm),
      },
    }).catch(() => undefined);

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request.", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("investor access request error", error);
    return NextResponse.json({ error: "Unable to submit request." }, { status: 500 });
  }
}
