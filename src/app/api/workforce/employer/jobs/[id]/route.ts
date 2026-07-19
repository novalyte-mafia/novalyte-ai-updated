import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  requireOrgRole,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

const patchSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  employmentType: z.enum(["full-time", "part-time", "contract", "per-diem"]).optional(),
  city: z.string().trim().min(1).max(120).optional(),
  state: z.string().trim().min(1).max(120).optional(),
  remote: z.boolean().optional(),
  description: z.string().trim().min(20).max(10000).optional(),
  status: z.enum(["open", "closed", "draft"]).optional(),
  requiredLicenses: z.string().max(500).optional().nullable(),
  requiredExperience: z.string().max(500).optional().nullable(),
  treatmentSpecialties: z.string().max(500).optional().nullable(),
  compMin: z.number().int().optional().nullable(),
  compMax: z.number().int().optional().nullable(),
  schedule: z.string().max(500).optional().nullable(),
  applicationRequirements: z.string().max(2000).optional().nullable(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireVerifiedUser(request);
    const { id } = await params;
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid job update." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: job, error: jobError } = await admin
      .from("JobPosting")
      .select("id, organization_id, status")
      .eq("id", id)
      .maybeSingle();
    if (jobError) throw jobError;
    if (!job?.organization_id) return NextResponse.json({ error: "Job not found." }, { status: 404 });

    await requireOrgRole(user.id, job.organization_id, ["owner", "admin", "recruiter"]);

    const updates: Record<string, unknown> = {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    };
    if (parsed.data.status === "open" && job.status !== "open") {
      updates.published_at = new Date().toISOString();
    }

    const { data, error } = await admin.from("JobPosting").update(updates).eq("id", id).select("*").single();
    if (error) throw error;
    return NextResponse.json({ ok: true, job: data });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: "Unable to update job." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireVerifiedUser(_request);
    const { id } = await params;
    const admin = getSupabaseAdmin();
    const { data: job } = await admin
      .from("JobPosting")
      .select("id, organization_id")
      .eq("id", id)
      .maybeSingle();
    if (!job?.organization_id) return NextResponse.json({ error: "Job not found." }, { status: 404 });
    await requireOrgRole(user.id, job.organization_id, ["owner", "admin", "recruiter"]);

    const { error } = await admin.from("JobPosting").update({ status: "closed", updatedAt: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: "Unable to close job." }, { status: 500 });
  }
}
