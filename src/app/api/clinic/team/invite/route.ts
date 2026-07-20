import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveMemberships,
  requireOrgRole,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

const inviteSchema = z.object({
  organizationId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "recruiter", "viewer"]),
});

export async function POST(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const parsed = inviteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid invite payload.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const memberships = await getActiveMemberships(user.id);
    if (!memberships.some((m) => m.organization_id === parsed.data.organizationId)) {
      return NextResponse.json({ error: "Organization not found." }, { status: 404 });
    }

    await requireOrgRole(user.id, parsed.data.organizationId, ["owner", "admin"]);

    const admin = getSupabaseAdmin();
    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await admin
      .from("portal_invitations")
      .insert({
        organization_id: parsed.data.organizationId,
        email: parsed.data.email.toLowerCase().trim(),
        role: parsed.data.role,
        token,
        status: "pending",
        invited_by: user.id,
        expires_at: expiresAt,
      })
      .select("id, email, role, status, expires_at, created_at")
      .single();
    if (error) throw error;

    await admin.from("portal_notifications").insert({
      organization_id: parsed.data.organizationId,
      user_id: user.id,
      type: "team_invite_sent",
      title: "Team invitation sent",
      body: `Invitation sent to ${parsed.data.email} as ${parsed.data.role}.`,
      payload: { invitationId: data.id, email: parsed.data.email, role: parsed.data.role },
    });

    return NextResponse.json({ ok: true, invitation: data });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Clinic team invite failed", error);
    return NextResponse.json({ error: "Unable to send team invitation." }, { status: 500 });
  }
}
