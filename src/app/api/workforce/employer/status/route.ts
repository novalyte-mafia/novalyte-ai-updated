import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveMemberships,
  hasAccountType,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

type EmployerOrganization = {
  id: string;
  legal_name: string;
  public_name: string | null;
  verification_status: string;
  lifecycle_status: string;
  slug: string | null;
};

export async function GET(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const memberships = await getActiveMemberships(user.id);
    const admin = getSupabaseAdmin();

    let organization: EmployerOrganization | null = null;
    if (memberships[0]) {
      const result = await admin
        .from("employer_organizations")
        .select("id, legal_name, public_name, verification_status, lifecycle_status, slug")
        .eq("id", memberships[0].organization_id)
        .maybeSingle();
      if (result.error) throw result.error;
      organization = (result.data as EmployerOrganization | null) ?? null;
    }

    const verification = organization?.verification_status;
    const status = !memberships.length
      ? "onboarding_required"
      : verification === "verified"
        ? "active"
        : verification === "rejected"
          ? "rejected"
          : "pending_review";

    return NextResponse.json({
      status,
      hasEmployerClaim: hasAccountType(user, "employer"),
      memberships,
      organization,
      redirectTo:
        status === "onboarding_required"
          ? "/workforce/employer/onboarding"
          : "/workforce/employer/dashboard",
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Employer status failed", error);
    return NextResponse.json({ error: "Unable to resolve employer status." }, { status: 500 });
  }
}
