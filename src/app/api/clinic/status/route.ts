import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveMemberships,
  hasAccountType,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

export async function GET(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const memberships = await getActiveMemberships(user.id);
    const admin = getSupabaseAdmin();
    const url = new URL(request.url);
    const requestedOrgId = url.searchParams.get("organizationId");

    const activeOrgId =
      requestedOrgId && memberships.some((m) => m.organization_id === requestedOrgId)
        ? requestedOrgId
        : memberships[0]?.organization_id ?? null;

    let organization: {
      id: string;
      legal_name: string;
      public_name: string | null;
      verification_status: string;
      lifecycle_status: string;
    } | null = null;

    let organizations: Array<{
      id: string;
      legal_name: string;
      public_name: string | null;
      verification_status: string;
      lifecycle_status: string;
      role: string;
    }> = [];

    if (memberships.length) {
      const orgIdsAll = memberships.map((m) => m.organization_id);
      const orgsRes = await admin
        .from("employer_organizations")
        .select("id, legal_name, public_name, verification_status, lifecycle_status")
        .in("id", orgIdsAll);
      if (orgsRes.error) throw orgsRes.error;
      const byId = Object.fromEntries((orgsRes.data ?? []).map((o) => [o.id, o]));
      organizations = memberships
        .map((m) => {
          const org = byId[m.organization_id];
          if (!org) return null;
          return { ...org, role: m.role };
        })
        .filter((o): o is NonNullable<typeof o> => !!o);
    }

    if (activeOrgId) {
      const found = organizations.find((o) => o.id === activeOrgId);
      if (found) {
        const { role: _role, ...orgFields } = found;
        organization = orgFields;
      } else {
        const result = await admin
          .from("employer_organizations")
          .select("id, legal_name, public_name, verification_status, lifecycle_status")
          .eq("id", activeOrgId)
          .maybeSingle();
        if (result.error) throw result.error;
        organization = result.data;
      }
    }

    const orgIds = activeOrgId ? [activeOrgId] : memberships.map((m) => m.organization_id);
    let clinics: Array<{
      id: string;
      name: string;
      slug: string | null;
      city: string | null;
      state: string | null;
      claimStatus: string | null;
      verificationStatus: string | null;
      publicationStatus: string | null;
      publishedAt: string | null;
      logoUrl: string | null;
      organization_id: string | null;
    }> = [];

    if (orgIds.length) {
      const clinicsRes = await admin
        .from("Clinic")
        .select("id, name, slug, city, state, claimStatus, verificationStatus, logoUrl, organization_id")
        .in("organization_id", orgIds)
        .order("name");
      if (clinicsRes.error) throw clinicsRes.error;
      const baseClinics = clinicsRes.data ?? [];
      clinics = baseClinics.map((c) => ({
        ...c,
        publicationStatus: null as string | null,
        publishedAt: null as string | null,
      }));

      if (clinics.length) {
        const { data: publications } = await admin
          .from("prospect_directory_profiles")
          .select("publicClinicId, publicationStatus, publishedAt, listingStatus")
          .in(
            "publicClinicId",
            clinics.map((c) => c.id),
          );
        const pubByClinic = Object.fromEntries(
          (publications ?? []).map((p) => [p.publicClinicId, p]),
        );
        clinics = clinics.map((c) => ({
          ...c,
          publicationStatus: pubByClinic[c.id]?.publicationStatus ?? null,
          publishedAt: pubByClinic[c.id]?.publishedAt ?? null,
        }));
      }
    }

    const unreadRes = clinics.length
      ? await admin
          .from("lead_assignments")
          .select("id", { count: "exact", head: true })
          .in(
            "clinic_id",
            clinics.map((c) => c.id),
          )
          .in("status", ["delivered", "pending"])
      : { count: 0, error: null };
    if (unreadRes.error) throw unreadRes.error;

    const status = !memberships.length
      ? "onboarding_required"
      : !clinics.length
        ? "claim_required"
        : "active";

    return NextResponse.json({
      status,
      hasEmployerClaim: hasAccountType(user, "employer"),
      memberships,
      organizations,
      organization,
      clinics,
      unreadLeadCount: unreadRes.count ?? 0,
      redirectTo:
        status === "onboarding_required"
          ? "/clinic/onboarding"
          : status === "claim_required"
            ? "/clinic/onboarding"
            : "/clinic/dashboard",
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Clinic portal status failed", error);
    return NextResponse.json({ error: "Unable to resolve clinic portal status." }, { status: 500 });
  }
}
