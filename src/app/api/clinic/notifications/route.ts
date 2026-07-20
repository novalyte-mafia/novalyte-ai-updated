import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveMemberships,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

export async function GET(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);

    const memberships = await getActiveMemberships(user.id);
    if (!memberships.length) {
      return NextResponse.json({ notifications: [] });
    }

    const orgIds = organizationId
      ? memberships.some((m) => m.organization_id === organizationId)
        ? [organizationId]
        : []
      : memberships.map((m) => m.organization_id);

    const admin = getSupabaseAdmin();
    let query = admin
      .from("portal_notifications")
      .select("id, organization_id, user_id, type, title, body, payload, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (orgIds.length === 1) {
      query = query.or(`user_id.eq.${user.id},organization_id.eq.${orgIds[0]}`);
    } else if (orgIds.length > 1) {
      query = query.or(
        `user_id.eq.${user.id},organization_id.in.(${orgIds.join(",")})`,
      );
    } else {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ notifications: data ?? [] });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Clinic notifications failed", error);
    return NextResponse.json({ error: "Unable to load notifications." }, { status: 500 });
  }
}
