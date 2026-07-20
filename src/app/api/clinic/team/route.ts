import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveMemberships,
  requireOrgRole,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

export async function GET(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");

    const memberships = await getActiveMemberships(user.id);
    if (!memberships.length) {
      return NextResponse.json({ members: [], invitations: [] });
    }

    const orgId =
      organizationId && memberships.some((m) => m.organization_id === organizationId)
        ? organizationId
        : memberships[0].organization_id;

    await requireOrgRole(user.id, orgId, ["owner", "admin", "recruiter", "viewer"]);

    const admin = getSupabaseAdmin();
    const { data: members, error: membersError } = await admin
      .from("organization_memberships")
      .select("id, organization_id, user_id, role, status, created_at")
      .eq("organization_id", orgId)
      .eq("status", "active")
      .order("created_at", { ascending: true });
    if (membersError) throw membersError;

    const userIds = (members ?? []).map((m) => m.user_id);
    let profiles: Record<string, { email?: string; first_name?: string | null; last_name?: string | null }> = {};
    if (userIds.length) {
      const { data: profileRows } = await admin
        .from("profiles")
        .select("id, email, first_name, last_name")
        .in("id", userIds);
      profiles = Object.fromEntries((profileRows ?? []).map((p) => [p.id, p]));
    }

    const enriched = (members ?? []).map((m) => ({
      ...m,
      email: profiles[m.user_id]?.email ?? null,
      fullName: [profiles[m.user_id]?.first_name, profiles[m.user_id]?.last_name]
        .filter(Boolean)
        .join(" ") || null,
    }));

    const { data: invitations, error: inviteError } = await admin
      .from("portal_invitations")
      .select("id, email, role, status, expires_at, created_at, invited_by")
      .eq("organization_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (inviteError) throw inviteError;

    return NextResponse.json({
      organizationId: orgId,
      members: enriched,
      invitations: invitations ?? [],
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Clinic team list failed", error);
    return NextResponse.json({ error: "Unable to load team members." }, { status: 500 });
  }
}
