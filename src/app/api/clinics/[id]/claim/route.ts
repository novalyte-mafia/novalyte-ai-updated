import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  requireOrgRole,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";
import { recordFormSubmissionAndNotify } from "@/lib/form-notifications";

const schema = z.object({
  organizationId: z.string().uuid(),
  authorized: z.literal(true),
  dmFirstName: z.string().trim().min(1).max(80).optional(),
  dmLastName: z.string().trim().min(1).max(80).optional(),
  dmEmail: z.string().email().optional(),
  dmPhone: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireVerifiedUser(req);
    const { id: clinicId } = await params;
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid claim request." }, { status: 400 });
    }

    await requireOrgRole(user.id, parsed.data.organizationId, ["owner", "admin"]);
    const admin = getSupabaseAdmin();

    const { data: clinic, error: clinicError } = await admin
      .from("Clinic")
      .select("id, claimStatus, organization_id")
      .eq("id", clinicId)
      .maybeSingle();
    if (clinicError) throw clinicError;
    if (!clinic) return NextResponse.json({ error: "Clinic not found." }, { status: 404 });
    if (clinic.organization_id || clinic.claimStatus === "claimed") {
      return NextResponse.json({ error: "This clinic is not available to claim." }, { status: 409 });
    }

    const { data: existing } = await admin
      .from("clinic_claims")
      .select("id, status")
      .eq("clinic_id", clinicId)
      .eq("organization_id", parsed.data.organizationId)
      .in("status", ["submitted", "under_review", "approved"])
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "A claim already exists for this clinic.", claimId: existing.id }, { status: 409 });
    }

    const { data: claim, error: claimError } = await admin
      .from("clinic_claims")
      .insert({
        clinic_id: clinicId,
        organization_id: parsed.data.organizationId,
        claimant_user_id: user.id,
        status: "submitted",
        authorized: true,
        evidence: {
          dmFirstName: parsed.data.dmFirstName ?? null,
          dmLastName: parsed.data.dmLastName ?? null,
          dmEmail: parsed.data.dmEmail ?? user.email ?? null,
          dmPhone: parsed.data.dmPhone ?? null,
          notes: parsed.data.notes ?? null,
        },
      })
      .select("id, status")
      .single();
    if (claimError || !claim) throw claimError ?? new Error("Unable to submit claim.");

    await recordFormSubmissionAndNotify({
      request: req,
      formType: "clinic_claim",
      sourceTable: "clinic_claims",
      sourceRecordId: claim.id,
      userId: user.id,
      contactName: [parsed.data.dmFirstName, parsed.data.dmLastName].filter(Boolean).join(" ") || null,
      contactEmail: parsed.data.dmEmail ?? user.email ?? null,
      contactPhone: parsed.data.dmPhone ?? null,
      organization: parsed.data.organizationId,
      safeMetadata: { clinic_id: clinicId, organization_id: parsed.data.organizationId },
    });

    // Never mark Clinic as claimed here — admin approval only.
    return NextResponse.json({
      ok: true,
      claimId: claim.id,
      status: claim.status,
      message: "Claim submitted for Novalyte review.",
    });
  } catch (e) {
    const authResponse = workforceAuthErrorResponse(e);
    if (authResponse) return authResponse;
    console.error("Clinic claim error", e);
    return NextResponse.json({ error: "Failed to submit clinic claim" }, { status: 500 });
  }
}
