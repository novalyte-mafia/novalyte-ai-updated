import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveClinicTenant } from "@/lib/clinic/tenant";
import { workforceAuthErrorResponse } from "@/lib/workforce/auth";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  dueAt: z.string().datetime().optional().nullable(),
  assignmentId: z.string().uuid().optional().nullable(),
  clinicId: z.string().min(1).optional(),
  assignedToUserId: z.string().uuid().optional().nullable(),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "done", "cancelled"]).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(4000).optional().nullable(),
  dueAt: z.string().datetime().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request);
    if (!tenant.clinicIds.length) return NextResponse.json({ tasks: [] });

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "open";
    const assignmentId = url.searchParams.get("assignmentId");
    const slaOnly = url.searchParams.get("sla") === "1";

    const admin = getSupabaseAdmin();
    let query = admin
      .from("clinic_tasks")
      .select("*")
      .in("clinic_id", tenant.clinicIds)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(100);

    if (status !== "all") query = query.eq("status", status);
    if (assignmentId) query = query.eq("assignment_id", assignmentId);
    if (slaOnly) {
      query = query.eq("status", "open").lte("due_at", new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ tasks: data ?? [] });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic tasks list failed", error);
    return NextResponse.json({ error: "Unable to load tasks." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request, { requireWriteLeads: true });
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid task." }, { status: 400 });
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
      .from("clinic_tasks")
      .insert({
        organization_id: organizationId,
        clinic_id: clinicId,
        assignment_id: parsed.data.assignmentId ?? null,
        lead_id: leadId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        due_at: parsed.data.dueAt ?? null,
        assigned_to_user_id: parsed.data.assignedToUserId ?? null,
        created_by_user_id: tenant.userId,
        status: "open",
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ task: data }, { status: 201 });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic tasks create failed", error);
    return NextResponse.json({ error: "Unable to create task." }, { status: 500 });
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
      .from("clinic_tasks")
      .select("id, organization_id")
      .eq("id", parsed.data.id)
      .maybeSingle();
    if (
      !existing?.organization_id ||
      !tenant.organizationIds.includes(existing.organization_id)
    ) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.status) {
      updates.status = parsed.data.status;
      updates.completed_at =
        parsed.data.status === "done" ? new Date().toISOString() : null;
    }
    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.description !== undefined) updates.description = parsed.data.description;
    if (parsed.data.dueAt !== undefined) updates.due_at = parsed.data.dueAt;

    const { data, error } = await admin
      .from("clinic_tasks")
      .update(updates)
      .eq("id", parsed.data.id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ task: data });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic tasks patch failed", error);
    return NextResponse.json({ error: "Unable to update task." }, { status: 500 });
  }
}
