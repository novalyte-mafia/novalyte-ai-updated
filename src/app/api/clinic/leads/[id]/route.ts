import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveMemberships,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

const patchSchema = z.object({
  status: z.enum(["viewed", "accepted", "contacted", "declined", "booked"]).optional(),
  clinicNotes: z.string().max(4000).optional(),
});

async function assertAssignmentAccess(userId: string, assignmentId: string) {
  const memberships = await getActiveMemberships(userId);
  const orgIds = memberships.map((m) => m.organization_id);
  if (!orgIds.length) return null;

  const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("lead_assignments")
      .select("id, clinic_id, organization_id, status, lead_id")
      .eq("id", assignmentId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    if (!data.organization_id || !orgIds.includes(data.organization_id)) return null;
    return data as {
      id: string;
      clinic_id: string;
      organization_id: string;
      status: string;
      lead_id: string;
    };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireVerifiedUser(_request);
    const { id } = await params;
    const assignment = await assertAssignmentAccess(user.id, id);
    if (!assignment) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
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
        patient_leads (*)
      `,
      )
      .eq("id", id)
      .single();
    if (error) throw error;

    if (assignment.status === "delivered" || assignment.status === "pending") {
      await admin
        .from("lead_assignments")
        .update({
          status: "viewed",
          viewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      await admin.from("lead_events").insert({
        lead_id: assignment.lead_id,
        assignment_id: id,
        actor: user.id,
        action: "viewed",
      });
    }

    const lead = Array.isArray(data.patient_leads) ? data.patient_leads[0] : data.patient_leads;
    return NextResponse.json({
      assignmentId: data.id,
      assignmentStatus: data.status === "delivered" || data.status === "pending" ? "viewed" : data.status,
      matchScore: data.match_score,
      explanation: data.explanation,
      clinicNotes: data.clinic_notes,
      deliveredAt: data.delivered_at,
      viewedAt: data.viewed_at ?? new Date().toISOString(),
      respondedAt: data.responded_at,
      clinicId: data.clinic_id,
      lead,
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Clinic lead detail failed", error);
    return NextResponse.json({ error: "Unable to load lead." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireVerifiedUser(request);
    const { id } = await params;
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update." }, { status: 400 });
    }

    const assignment = await assertAssignmentAccess(user.id, id);
    if (!assignment) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const admin = getSupabaseAdmin();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.status) {
      updates.status = parsed.data.status;
      updates.responded_at = new Date().toISOString();
      if (parsed.data.status === "viewed") {
        updates.viewed_at = new Date().toISOString();
      }
    }
    if (parsed.data.clinicNotes !== undefined) {
      updates.clinic_notes = parsed.data.clinicNotes;
    }

    const { data, error } = await admin
      .from("lead_assignments")
      .update(updates)
      .eq("id", id)
      .select("id, status, clinic_notes, viewed_at, responded_at")
      .single();
    if (error) throw error;

    await admin.from("lead_events").insert({
      lead_id: assignment.lead_id,
      assignment_id: id,
      actor: user.id,
      action: parsed.data.status ? `status_${parsed.data.status}` : "notes_updated",
      payload: parsed.data,
    });

    if (parsed.data.status && assignment.organization_id) {
      await admin.from("clinic_lead_stage_history").insert({
        organization_id: assignment.organization_id,
        clinic_id: assignment.clinic_id,
        assignment_id: id,
        lead_id: assignment.lead_id,
        from_status: assignment.status,
        to_status: parsed.data.status,
        changed_by_user_id: user.id,
      });
    }

    if (parsed.data.status === "booked") {
      await admin
        .from("patient_leads")
        .update({ status: "booked", updated_at: new Date().toISOString() })
        .eq("id", assignment.lead_id);
    }

    return NextResponse.json({ ok: true, assignment: data });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Clinic lead patch failed", error);
    return NextResponse.json({ error: "Unable to update lead." }, { status: 500 });
  }
}
