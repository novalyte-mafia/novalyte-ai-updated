import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  requireOrgRole,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireVerifiedUser(request);
    const { id } = await params;
    const admin = getSupabaseAdmin();

    const { data: job, error: jobError } = await admin
      .from("JobPosting")
      .select("id, organization_id, title")
      .eq("id", id)
      .maybeSingle();
    if (jobError) throw jobError;
    if (!job?.organization_id) return NextResponse.json({ error: "Job not found." }, { status: 404 });

    await requireOrgRole(user.id, job.organization_id, ["owner", "admin", "recruiter", "viewer"]);

    const { data, error } = await admin
      .from("JobApplication")
      .select("id, status, applicantName, coverNote, createdAt, workforce_profile_id, application_snapshot")
      .eq("jobPostingId", id)
      .is("withdrawn_at", null)
      .order("createdAt", { ascending: false });
    if (error) throw error;

    // Redact emails/phones from employer list responses; snapshot may contain them for server use only.
    const applicants = (data ?? []).map((row) => ({
      id: row.id,
      status: row.status,
      applicantName: row.applicantName,
      coverNote: row.coverNote,
      createdAt: row.createdAt,
      workforceProfileId: row.workforce_profile_id,
      title: (row.application_snapshot as { job_title?: string } | null)?.job_title ?? job.title,
    }));

    return NextResponse.json({ job, applicants });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: "Unable to load applicants." }, { status: 500 });
  }
}
