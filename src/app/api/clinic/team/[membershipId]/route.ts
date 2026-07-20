import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveMemberships,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  try {
    const user = await requireVerifiedUser(request);
    const { membershipId } = await params;
    const admin = getSupabaseAdmin();

    const { data: target, error: targetError } = await admin
      .from("organization_memberships")
      .select("id, organization_id, user_id, role, status")
      .eq("id", membershipId)
      .maybeSingle();
    if (targetError) throw targetError;
    if (!target || target.status !== "active") {
      return NextResponse.json({ error: "Membership not found." }, { status: 404 });
    }

    const memberships = await getActiveMemberships(user.id);
    const actorMembership = memberships.find((m) => m.organization_id === target.organization_id);
    if (!actorMembership || !["owner", "admin"].includes(actorMembership.role)) {
      return NextResponse.json({ error: "You do not have permission to revoke memberships." }, { status: 403 });
    }

    if (target.role === "owner") {
      return NextResponse.json({ error: "Organization owners cannot be revoked via the portal." }, { status: 400 });
    }

    if (target.user_id === user.id && actorMembership.role !== "owner") {
      return NextResponse.json({ error: "You cannot revoke your own membership." }, { status: 400 });
    }

    const { error: updateError } = await admin
      .from("organization_memberships")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("id", membershipId);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, membershipId });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Clinic team revoke failed", error);
    return NextResponse.json({ error: "Unable to revoke team member." }, { status: 500 });
  }
}
