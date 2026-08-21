import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveClinicTenant } from "@/lib/clinic/tenant";
import { workforceAuthErrorResponse } from "@/lib/workforce/auth";

const schema = z.object({
  assignmentId: z.string().uuid().optional(),
  mode: z.enum(["lead_summary", "suggested_followups", "weekly_digest"]).default("lead_summary"),
});

/**
 * Informational AI assist only — same medical disclaimer posture as the public site.
 * Uses heuristic summaries when GLM/OpenAI is unavailable; never clinical advice.
 */
export async function POST(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request);
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const disclaimer =
      "Informational only — not medical advice, diagnosis, or a clinical decision. Clinic staff remain responsible for patient care.";

    const admin = getSupabaseAdmin();

    if (parsed.data.mode === "weekly_digest") {
      const { count: unread } = await admin
        .from("lead_assignments")
        .select("id", { count: "exact", head: true })
        .in("clinic_id", tenant.clinicIds.length ? tenant.clinicIds : ["__none__"])
        .in("status", ["delivered", "pending"]);
      const { count: openTasks } = await admin
        .from("clinic_tasks")
        .select("id", { count: "exact", head: true })
        .in("clinic_id", tenant.clinicIds.length ? tenant.clinicIds : ["__none__"])
        .eq("status", "open");

      return NextResponse.json({
        mode: "weekly_digest",
        disclaimer,
        summary: `This week: ${unread ?? 0} unread lead(s) and ${openTasks ?? 0} open follow-up task(s). Prioritize speed-to-lead on unread deliveries, then clear overdue tasks.`,
        suggestions: [
          "Clear unread leads in the pipeline (delivered → viewed → accepted).",
          "Schedule follow-ups for accepted leads still waiting on contact.",
          "Confirm directory publication status if inbound volume is low.",
        ],
      });
    }

    if (!parsed.data.assignmentId) {
      return NextResponse.json({ error: "assignmentId required for this mode." }, { status: 400 });
    }

    const { data: assignment } = await admin
      .from("lead_assignments")
      .select(
        `
        id,
        status,
        organization_id,
        explanation,
        clinic_notes,
        patient_leads (
          first_name,
          last_name,
          treatment_interest,
          preferred_contact,
          best_time,
          city,
          state,
          symptoms,
          concerns
        )
      `,
      )
      .eq("id", parsed.data.assignmentId)
      .maybeSingle();

    if (
      !assignment?.organization_id ||
      !tenant.organizationIds.includes(assignment.organization_id)
    ) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const lead = Array.isArray(assignment.patient_leads)
      ? assignment.patient_leads[0]
      : assignment.patient_leads;

    const name = `${lead?.first_name ?? ""} ${lead?.last_name ?? ""}`.trim() || "Patient";
    const interest = lead?.treatment_interest || "general wellness";
    const contact = lead?.preferred_contact || "phone/email";
    const when = lead?.best_time || "their preferred window";

    const summary = `${name} is interested in ${interest}${
      lead?.city || lead?.state
        ? ` (${[lead?.city, lead?.state].filter(Boolean).join(", ")})`
        : ""
    }. Current pipeline status: ${assignment.status}. Prefer contact via ${contact} around ${when}.`;

    const suggestions = [
      `Reach out via ${contact} within one business day referencing ${interest}.`,
      "Confirm telehealth vs in-clinic preference before booking.",
      "Log a follow-up task if the patient does not respond within 48 hours.",
    ];

    if (parsed.data.mode === "suggested_followups") {
      return NextResponse.json({ mode: "suggested_followups", disclaimer, suggestions, summary });
    }

    return NextResponse.json({
      mode: "lead_summary",
      disclaimer,
      summary,
      suggestions,
      whyMatched: assignment.explanation,
      clinicNotes: assignment.clinic_notes,
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic ai assist failed", error);
    return NextResponse.json({ error: "Unable to generate assist summary." }, { status: 500 });
  }
}
