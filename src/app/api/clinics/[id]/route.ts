import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  requireOrgRole,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireVerifiedUser(req);
    const { id } = await params;
    const body = await req.json();
    const admin = getSupabaseAdmin();

    const { data: clinic, error: clinicError } = await admin
      .from("Clinic")
      .select("id, organization_id")
      .eq("id", id)
      .maybeSingle();
    if (clinicError) throw clinicError;
    if (!clinic?.organization_id) {
      return NextResponse.json({ error: "Clinic is not linked to an approved organization." }, { status: 403 });
    }

    await requireOrgRole(user.id, clinic.organization_id, ["owner", "admin"]);

    const { data: updatedClinic, error: updateError } = await admin
      .from("Clinic")
      .update({
        name: body.name,
        tagline: body.tagline ?? "",
        overview: body.overview,
        phone: body.phone ?? "",
        email: body.email ?? "",
        website: body.website ?? "",
        hours: body.hours ?? "",
        acceptingNewPatients: !!body.acceptingNewPatients,
        initialConsultPrice:
          body.initialConsultPrice !== undefined && body.initialConsultPrice !== null
            ? Number(body.initialConsultPrice)
            : null,
        membershipPrice:
          body.membershipPrice !== undefined && body.membershipPrice !== null
            ? Number(body.membershipPrice)
            : null,
        insuranceAccepted: !!body.insuranceAccepted,
        hsaFsaAccepted: !!body.hsaFsaAccepted,
        earliestAvailability: body.earliestAvailability ?? "",
        statesServed: body.statesServed ?? "",
        languages: body.languages ?? "English",
        accessibility: body.accessibility ?? "Wheelchair accessible",
        pricingStatus: body.pricingStatus ?? "Full Pricing Published",
        whatToExpect: body.whatToExpect ?? "",
        profileCompleteness: Number(body.profileCompleteness) || 80,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, clinic: updatedClinic });
  } catch (e) {
    const authResponse = workforceAuthErrorResponse(e);
    if (authResponse) return authResponse;
    console.error("Clinic update error", e);
    return NextResponse.json({ error: "Failed to update clinic profile" }, { status: 500 });
  }
}
