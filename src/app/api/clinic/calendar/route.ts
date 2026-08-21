import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveClinicTenant } from "@/lib/clinic/tenant";
import { workforceAuthErrorResponse } from "@/lib/workforce/auth";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(4000).optional().nullable(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional().nullable(),
  assignmentId: z.string().uuid().optional().nullable(),
  clinicId: z.string().min(1).optional(),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).optional(),
  title: z.string().min(1).max(200).optional(),
  notes: z.string().max(4000).optional().nullable(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request);
    if (!tenant.clinicIds.length) return NextResponse.json({ appointments: [], tasks: [] });

    const url = new URL(request.url);
    const from = url.searchParams.get("from") || new Date().toISOString();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 30);
    const to = url.searchParams.get("to") || toDate.toISOString();

    const admin = getSupabaseAdmin();
    const [appts, tasks] = await Promise.all([
      admin
        .from("clinic_appointments")
        .select("*")
        .in("clinic_id", tenant.clinicIds)
        .gte("starts_at", from)
        .lte("starts_at", to)
        .order("starts_at", { ascending: true })
        .limit(100),
      admin
        .from("clinic_tasks")
        .select("*")
        .in("clinic_id", tenant.clinicIds)
        .eq("status", "open")
        .order("due_at", { ascending: true })
        .limit(50),
    ]);

    if (appts.error) throw appts.error;
    if (tasks.error) throw tasks.error;

    return NextResponse.json({
      appointments: appts.data ?? [],
      tasks: tasks.data ?? [],
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic calendar failed", error);
    return NextResponse.json({ error: "Unable to load calendar." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request, { requireWriteLeads: true });
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid appointment." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    let organizationId = tenant.activeOrganizationId;
    let clinicId = parsed.data.clinicId || tenant.clinicIds[0];
    let leadId: string | null = null;

    if (parsed.data.assignmentId) {
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
      organizationId = assignment.organization_id;
      clinicId = assignment.clinic_id;
      leadId = assignment.lead_id;
    }

    if (!organizationId || !clinicId) {
      return NextResponse.json({ error: "No clinic context." }, { status: 400 });
    }

    const { data, error } = await admin
      .from("clinic_appointments")
      .insert({
        organization_id: organizationId,
        clinic_id: clinicId,
        assignment_id: parsed.data.assignmentId ?? null,
        lead_id: leadId,
        title: parsed.data.title,
        notes: parsed.data.notes ?? null,
        starts_at: parsed.data.startsAt,
        ends_at: parsed.data.endsAt ?? null,
        created_by_user_id: tenant.userId,
        status: "scheduled",
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ appointment: data }, { status: 201 });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic appointment create failed", error);
    return NextResponse.json({ error: "Unable to create appointment." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request, { requireWriteLeads: true });
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: existing } = await admin
      .from("clinic_appointments")
      .select("id, organization_id")
      .eq("id", parsed.data.id)
      .maybeSingle();
    if (
      !existing?.organization_id ||
      !tenant.organizationIds.includes(existing.organization_id)
    ) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.status) updates.status = parsed.data.status;
    if (parsed.data.title) updates.title = parsed.data.title;
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
    if (parsed.data.startsAt) updates.starts_at = parsed.data.startsAt;
    if (parsed.data.endsAt !== undefined) updates.ends_at = parsed.data.endsAt;

    const { data, error } = await admin
      .from("clinic_appointments")
      .update(updates)
      .eq("id", parsed.data.id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ appointment: data });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic appointment patch failed", error);
    return NextResponse.json({ error: "Unable to update appointment." }, { status: 500 });
  }
}
