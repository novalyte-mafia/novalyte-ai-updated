import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveMemberships,
  requireOrgRole,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

const jobSchema = z.object({
  organizationId: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  employmentType: z.enum(["full-time", "part-time", "contract", "per-diem"]),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  remote: z.boolean().optional().default(false),
  description: z.string().trim().min(20).max(10000),
  requiredLicenses: z.string().max(500).optional().nullable(),
  requiredExperience: z.string().max(500).optional().nullable(),
  treatmentSpecialties: z.string().max(500).optional().nullable(),
  compMin: z.number().int().optional().nullable(),
  compMax: z.number().int().optional().nullable(),
  schedule: z.string().max(500).optional().nullable(),
  applicationRequirements: z.string().max(2000).optional().nullable(),
  status: z.enum(["open", "closed", "draft"]).optional().default("open"),
});

export async function GET(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const memberships = await getActiveMemberships(user.id);
    if (!memberships.length) return NextResponse.json({ jobs: [] });

    const orgIds = memberships.map((m) => m.organization_id);
    const { data, error } = await getSupabaseAdmin()
      .from("JobPosting")
      .select("*")
      .in("organization_id", orgIds)
      .order("createdAt", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ jobs: data ?? [] });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: "Unable to load jobs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const parsed = jobSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid job payload.", issues: parsed.error.flatten() }, { status: 400 });
    }

    await requireOrgRole(user.id, parsed.data.organizationId, ["owner", "admin", "recruiter"]);
    const admin = getSupabaseAdmin();
    const { data: org } = await admin
      .from("employer_organizations")
      .select("public_name, legal_name")
      .eq("id", parsed.data.organizationId)
      .maybeSingle();

    const { data, error } = await admin
      .from("JobPosting")
      .insert({
        organization_id: parsed.data.organizationId,
        created_by: user.id,
        clinicName: org?.public_name || org?.legal_name || "Organization",
        title: parsed.data.title,
        employmentType: parsed.data.employmentType,
        city: parsed.data.city,
        state: parsed.data.state,
        remote: parsed.data.remote,
        description: parsed.data.description,
        requiredLicenses: parsed.data.requiredLicenses ?? null,
        requiredExperience: parsed.data.requiredExperience ?? null,
        treatmentSpecialties: parsed.data.treatmentSpecialties ?? null,
        compMin: parsed.data.compMin ?? null,
        compMax: parsed.data.compMax ?? null,
        schedule: parsed.data.schedule ?? null,
        applicationRequirements: parsed.data.applicationRequirements ?? null,
        status: parsed.data.status,
        published_at: parsed.data.status === "open" ? new Date().toISOString() : null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, job: data });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Employer job create failed", error);
    return NextResponse.json({ error: "Unable to create job." }, { status: 500 });
  }
}
