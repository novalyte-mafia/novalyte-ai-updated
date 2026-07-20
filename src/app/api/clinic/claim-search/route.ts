import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

/**
 * Search unclaimed clinics for in-portal claim (service-role after membership check).
 * GET /api/clinic/claim-search?q=
 */
export async function GET(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const admin = getSupabaseAdmin();
    const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
      return NextResponse.json({ clinics: [] });
    }

    const { data: memberships, error: memErr } = await admin
      .from("organization_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1);
    if (memErr) throw memErr;
    if (!memberships?.length) {
      return NextResponse.json({ error: "Organization membership required." }, { status: 403 });
    }

    const { data, error } = await admin
      .from("Clinic")
      .select("id, name, city, state, slug, claimStatus")
      .is("organization_id", null)
      .ilike("name", `%${q}%`)
      .order("name")
      .limit(20);
    if (error) throw error;

    const clinics = (data ?? []).filter((c) => c.claimStatus !== "claimed");
    return NextResponse.json({ clinics });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Clinic claim search failed", error);
    return NextResponse.json({ error: "Unable to search clinics." }, { status: 500 });
  }
}
