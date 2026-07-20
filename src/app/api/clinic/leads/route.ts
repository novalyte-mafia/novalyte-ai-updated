import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveMemberships,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

async function clinicsForUser(userId: string) {
  const memberships = await getActiveMemberships(userId);
  const orgIds = memberships.map((m) => m.organization_id);
  if (!orgIds.length) return { memberships, clinics: [] as Array<{ id: string; organization_id: string | null }> };

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("Clinic")
    .select("id, organization_id")
    .in("organization_id", orgIds);
  if (error) throw error;
  return { memberships, clinics: data ?? [] };
}

export async function GET(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const { clinics } = await clinicsForUser(user.id);
    if (!clinics.length) {
      return NextResponse.json({ leads: [], unreadCount: 0 });
    }

    const clinicIds = clinics.map((c) => c.id);
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const admin = getSupabaseAdmin();

    let query = admin
      .from("lead_assignments")
      .select(
        `
        id,
        status,
        match_score,
        explanation,
        clinic_notes,
        delivered_at,
        viewed_at,
        responded_at,
        clinic_id,
        patient_leads (
          id,
          first_name,
          last_name,
          email,
          phone,
          city,
          state,
          treatment_interest,
          preferred_contact,
          best_time,
          qualification_score,
          urgency_score,
          status,
          source,
          campaign_source,
          verified_at,
          created_at,
          assessment_payload
        )
      `,
      )
      .in("clinic_id", clinicIds)
      .order("delivered_at", { ascending: false })
      .limit(100);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    const leads = (data ?? []).map((row) => {
      const lead = Array.isArray(row.patient_leads) ? row.patient_leads[0] : row.patient_leads;
      return {
        assignmentId: row.id,
        assignmentStatus: row.status,
        matchScore: row.match_score,
        explanation: row.explanation,
        clinicNotes: row.clinic_notes,
        deliveredAt: row.delivered_at,
        viewedAt: row.viewed_at,
        respondedAt: row.responded_at,
        clinicId: row.clinic_id,
        lead,
      };
    });

    const unreadCount = leads.filter((l) => l.assignmentStatus === "delivered" || l.assignmentStatus === "pending").length;

    return NextResponse.json({ leads, unreadCount });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Clinic leads list failed", error);
    return NextResponse.json({ error: "Unable to load leads." }, { status: 500 });
  }
}
