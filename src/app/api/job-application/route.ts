import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { captureServerEvent } from "@/lib/posthog-server";
import { recordFormSubmissionAndNotify } from "@/lib/form-notifications";
import {
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

const schema = z.object({
  jobPostingId: z.string().min(2),
  coverNote: z.string().max(4000).optional().nullable(),
  consentVersion: z.string().min(1).default("v1"),
});

export async function POST(req: Request) {
  try {
    const user = await requireVerifiedUser(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const [{ data: profile, error: profileError }, { data: job, error: jobError }] = await Promise.all([
      admin
        .from("workforce_professional_profiles")
        .select("id, name, email, phone, review_status, onboarding_completed_at")
        .eq("userId", user.id)
        .maybeSingle(),
      admin
        .from("JobPosting")
        .select("id, status, title, clinicName, organization_id")
        .eq("id", parsed.data.jobPostingId)
        .maybeSingle(),
    ]);

    if (profileError || jobError) throw profileError ?? jobError;
    if (!profile?.onboarding_completed_at) {
      return NextResponse.json({ error: "Complete professional onboarding before applying." }, { status: 403 });
    }
    if (!job || job.status !== "open") {
      return NextResponse.json({ error: "This job is not open for applications." }, { status: 400 });
    }

    const { data: existing } = await admin
      .from("JobApplication")
      .select("id")
      .eq("jobPostingId", parsed.data.jobPostingId)
      .eq("workforce_profile_id", profile.id)
      .is("withdrawn_at", null)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "You already applied to this job.", id: existing.id }, { status: 409 });
    }

    const now = new Date().toISOString();
    const { data: record, error: insertError } = await admin
      .from("JobApplication")
      .insert({
        jobPostingId: parsed.data.jobPostingId,
        applicant_user_id: user.id,
        workforce_profile_id: profile.id,
        organization_id: job.organization_id ?? null,
        applicantName: profile.name,
        applicantEmail: profile.email ?? user.email,
        applicantPhone: profile.phone ?? null,
        coverNote: parsed.data.coverNote ?? null,
        status: "submitted",
        consent_version: parsed.data.consentVersion,
        consented_at: now,
        application_snapshot: {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          review_status: profile.review_status,
          job_title: job.title,
          employer_name: job.clinicName,
        },
      })
      .select("id")
      .single();
    if (insertError || !record) throw insertError ?? new Error("Unable to create application.");

    await recordFormSubmissionAndNotify({
      request: req,
      formType: "job_application",
      sourceTable: "JobApplication",
      sourceRecordId: record.id,
      contactName: profile.name,
      contactEmail: profile.email ?? user.email ?? null,
      contactPhone: profile.phone ?? null,
      organization: job.clinicName,
      safeMetadata: {
        job_posting_id: parsed.data.jobPostingId,
        job_title: job.title,
        workforce_profile_id: profile.id,
        has_cover_note: Boolean(parsed.data.coverNote),
      },
      userId: user.id,
    }).catch((error) => console.error("job application notification failed", error));

    await captureServerEvent({
      distinctId: user.id,
      event: "job_application_submitted",
      properties: {
        job_posting_id: parsed.data.jobPostingId,
        workforce_profile_id: profile.id,
        has_cover_note: !!parsed.data.coverNote,
      },
    });

    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    const authResponse = workforceAuthErrorResponse(e);
    if (authResponse) return authResponse;
    console.error("job application error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
