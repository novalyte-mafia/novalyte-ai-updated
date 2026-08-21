import { NextResponse } from "next/server";
import { resolveClinicTenant } from "@/lib/clinic/tenant";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { workforceAuthErrorResponse } from "@/lib/workforce/auth";

/**
 * Patient Center: lifecycle views from lead assignments + assessment summaries.
 * No clinical decision claims — informational summaries only.
 */
export async function GET(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request);
    if (!tenant.clinicIds.length) {
      return NextResponse.json({ patients: [], followUpsDue: 0 });
    }

    const url = new URL(request.url);
    const assignmentId = url.searchParams.get("assignmentId");
    const admin = getSupabaseAdmin();

    let query = admin
      .from("lead_assignments")
      .select(
        `
        id,
        status,
        delivered_at,
        viewed_at,
        responded_at,
        clinic_id,
        clinic_notes,
        patient_leads (
          id,
          first_name,
          last_name,
          email,
          phone,
          city,
          state,
          treatment_interest,
          symptoms,
          concerns,
          assessment_payload,
          preferred_contact,
          telehealth_preference,
          created_at
        )
      `,
      )
      .in("clinic_id", tenant.clinicIds)
      .order("delivered_at", { ascending: false })
      .limit(100);

    if (assignmentId) query = query.eq("id", assignmentId);

    const { data, error } = await query;
    if (error) throw error;

    const patients = (data ?? []).map((row) => {
      const lead = Array.isArray(row.patient_leads) ? row.patient_leads[0] : row.patient_leads;
      const payload =
        lead && typeof lead.assessment_payload === "object" && lead.assessment_payload
          ? (lead.assessment_payload as Record<string, unknown>)
          : null;
      return {
        assignmentId: row.id,
        status: row.status,
        deliveredAt: row.delivered_at,
        clinicId: row.clinic_id,
        clinicNotes: row.clinic_notes,
        patient: lead
          ? {
              id: lead.id,
              firstName: lead.first_name,
              lastName: lead.last_name,
              email: lead.email,
              phone: lead.phone,
              city: lead.city,
              state: lead.state,
              treatmentInterest: lead.treatment_interest,
              preferredContact: lead.preferred_contact,
              telehealthPreference: lead.telehealth_preference,
              interestsSummary: [
                lead.treatment_interest,
                lead.symptoms ? "Has symptom notes" : null,
                lead.concerns ? "Has concerns" : null,
              ]
                .filter(Boolean)
                .join(" · "),
              assessmentHighlights: payload
                ? {
                    treatmentInterest:
                      payload.treatmentInterest ?? payload.treatment_interest ?? lead.treatment_interest,
                    locationState: payload.locationState ?? lead.state,
                    telehealthPref: payload.telehealthPref ?? lead.telehealth_preference,
                  }
                : null,
              disclaimer:
                "Assessment summary for clinic follow-up only — not a diagnosis or clinical decision.",
            }
          : null,
      };
    });

    const { count: followUpsDue } = await admin
      .from("clinic_tasks")
      .select("id", { count: "exact", head: true })
      .in("clinic_id", tenant.clinicIds)
      .eq("status", "open")
      .lte("due_at", new Date().toISOString());

    const { count: upcomingAppointments } = await admin
      .from("clinic_appointments")
      .select("id", { count: "exact", head: true })
      .in("clinic_id", tenant.clinicIds)
      .eq("status", "scheduled")
      .gte("starts_at", new Date().toISOString());

    return NextResponse.json({
      patients,
      followUpsDue: followUpsDue ?? 0,
      upcomingAppointments: upcomingAppointments ?? 0,
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic patients failed", error);
    return NextResponse.json({ error: "Unable to load patients." }, { status: 500 });
  }
}
