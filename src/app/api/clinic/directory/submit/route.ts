import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveMemberships,
  requireOrgRole,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";
import { recordFormSubmissionAndNotify } from "@/lib/form-notifications";

const submitSchema = z.object({
  clinicId: z.string().min(1),
  organizationId: z.string().uuid().optional(),
  note: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const parsed = submitSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid submit payload.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const memberships = await getActiveMemberships(user.id);
    if (!memberships.length) {
      return NextResponse.json({ error: "No organization membership found." }, { status: 403 });
    }

    const admin = getSupabaseAdmin();
    const { data: clinic, error: clinicError } = await admin
      .from("Clinic")
      .select("id, name, organization_id, claimStatus, verificationStatus")
      .eq("id", parsed.data.clinicId)
      .maybeSingle();
    if (clinicError) throw clinicError;
    if (!clinic?.organization_id) {
      return NextResponse.json({ error: "Clinic not found or not linked to your organization." }, { status: 404 });
    }

    await requireOrgRole(user.id, clinic.organization_id, ["owner", "admin"]);

    const reviewNote =
      parsed.data.note?.trim() ||
      `Directory profile submitted for review by portal user ${user.email ?? user.id}.`;

    const { error: updateError } = await admin
      .from("Clinic")
      .update({
        verificationStatus: "under_review",
        verificationNotes: reviewNote,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", clinic.id);
    if (updateError) throw updateError;

    const { data: notification, error: notifyError } = await admin
      .from("portal_notifications")
      .insert({
        organization_id: clinic.organization_id,
        user_id: user.id,
        type: "directory_review_request",
        title: "Directory listing submitted for review",
        body: `${clinic.name} was submitted for Novalyte review. Publication requires admin approval.`,
        payload: {
          clinicId: clinic.id,
          claimStatus: clinic.claimStatus,
          previousVerificationStatus: clinic.verificationStatus,
        },
      })
      .select("id")
      .single();
    if (notifyError || !notification) throw notifyError ?? new Error("Unable to create review notification.");

    await recordFormSubmissionAndNotify({
      request,
      formType: "directory_listing",
      sourceTable: "portal_notifications",
      sourceRecordId: notification.id,
      userId: user.id,
      contactEmail: user.email ?? null,
      organization: clinic.name,
      safeMetadata: {
        clinic_id: clinic.id,
        organization_id: clinic.organization_id,
        previous_verification_status: clinic.verificationStatus,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Submitted for review. A Novalyte admin will review before publication.",
      clinicId: clinic.id,
      verificationStatus: "under_review",
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Directory submit failed", error);
    return NextResponse.json({ error: "Unable to submit directory listing for review." }, { status: 500 });
  }
}
