import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveClinicTenant } from "@/lib/clinic/tenant";
import { workforceAuthErrorResponse } from "@/lib/workforce/auth";

const createSchema = z.object({
  assignmentId: z.string().uuid(),
  body: z.string().min(1).max(8000),
});

export async function GET(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request);
    const assignmentId = new URL(request.url).searchParams.get("assignmentId");
    if (!assignmentId) {
      return NextResponse.json({ error: "assignmentId is required." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: assignment } = await admin
      .from("lead_assignments")
      .select("id, organization_id, clinic_id")
      .eq("id", assignmentId)
      .maybeSingle();
    if (
      !assignment?.organization_id ||
      !tenant.organizationIds.includes(assignment.organization_id)
    ) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const { data, error } = await admin
      .from("clinic_lead_notes")
      .select("id, body, author_user_id, created_at, updated_at")
      .eq("assignment_id", assignmentId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ notes: data ?? [] });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic notes list failed", error);
    return NextResponse.json({ error: "Unable to load notes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request, { requireWriteLeads: true });
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid note." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: assignment } = await admin
      .from("lead_assignments")
      .select("id, organization_id, clinic_id, lead_id")
      .eq("id", parsed.data.assignmentId)
      .maybeSingle();
    if (
      !assignment?.organization_id ||
      !tenant.organizationIds.includes(assignment.organization_id)
    ) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const { data, error } = await admin
      .from("clinic_lead_notes")
      .insert({
        organization_id: assignment.organization_id,
        clinic_id: assignment.clinic_id,
        assignment_id: assignment.id,
        lead_id: assignment.lead_id,
        author_user_id: tenant.userId,
        body: parsed.data.body,
      })
      .select("id, body, author_user_id, created_at")
      .single();
    if (error) throw error;

    await admin.from("lead_events").insert({
      lead_id: assignment.lead_id,
      assignment_id: assignment.id,
      actor: tenant.userId,
      action: "note_added",
      payload: { noteId: data.id },
    });

    return NextResponse.json({ note: data }, { status: 201 });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic notes create failed", error);
    return NextResponse.json({ error: "Unable to create note." }, { status: 500 });
  }
}
