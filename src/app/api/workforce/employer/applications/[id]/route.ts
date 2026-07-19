import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  requireOrgRole,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

const schema = z.object({
  status: z.enum(["submitted", "reviewed", "interview", "offered", "hired", "rejected"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireVerifiedUser(request);
    const { id } = await params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid application status." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: application, error } = await admin
      .from("JobApplication")
      .select("id, organization_id")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!application?.organization_id) {
      return NextResponse.json({ error: "Application not found or not organization-owned." }, { status: 404 });
    }

    await requireOrgRole(user.id, application.organization_id, ["owner", "admin", "recruiter"]);

    const { data, error: updateError } = await admin
      .from("JobApplication")
      .update({ status: parsed.data.status })
      .eq("id", id)
      .select("id, status")
      .single();
    if (updateError) throw updateError;
    return NextResponse.json({ ok: true, application: data });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: "Unable to update application." }, { status: 500 });
  }
}
