import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveMemberships,
  requireVerifiedUser,
  WorkforceAuthError,
  type OrgMembership,
} from "@/lib/workforce/auth";
import { canWriteLeads } from "@/lib/clinic/capabilities";

export type ClinicTenantContext = {
  userId: string;
  memberships: OrgMembership[];
  organizationIds: string[];
  clinics: Array<{ id: string; organization_id: string | null; name?: string }>;
  clinicIds: string[];
  activeMembership: OrgMembership | null;
  activeOrganizationId: string | null;
};

export async function resolveClinicTenant(
  request: Request,
  options?: { organizationId?: string | null; requireWriteLeads?: boolean },
): Promise<ClinicTenantContext> {
  const user = await requireVerifiedUser(request);
  const memberships = await getActiveMemberships(user.id);
  const organizationIds = memberships.map((m) => m.organization_id);

  const requestedOrgId = options?.organizationId ?? new URL(request.url).searchParams.get("organizationId");
  const activeOrganizationId =
    requestedOrgId && organizationIds.includes(requestedOrgId)
      ? requestedOrgId
      : organizationIds[0] ?? null;

  const activeMembership =
    memberships.find((m) => m.organization_id === activeOrganizationId) ?? memberships[0] ?? null;

  if (options?.requireWriteLeads && activeMembership && !canWriteLeads(activeMembership)) {
    throw new WorkforceAuthError("You have read-only access to leads.", 403);
  }

  const admin = getSupabaseAdmin();
  const scopedOrgIds = activeOrganizationId ? [activeOrganizationId] : organizationIds;
  let clinics: ClinicTenantContext["clinics"] = [];

  if (scopedOrgIds.length) {
    const { data, error } = await admin
      .from("Clinic")
      .select("id, organization_id, name")
      .in("organization_id", scopedOrgIds);
    if (error) throw error;
    clinics = data ?? [];
  }

  return {
    userId: user.id,
    memberships,
    organizationIds,
    clinics,
    clinicIds: clinics.map((c) => c.id),
    activeMembership,
    activeOrganizationId,
  };
}

export async function assertClinicInTenant(
  clinicId: string,
  organizationIds: string[],
): Promise<{ id: string; organization_id: string }> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("Clinic")
    .select("id, organization_id")
    .eq("id", clinicId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.organization_id || !organizationIds.includes(data.organization_id)) {
    throw new WorkforceAuthError("Clinic not found in your organization.", 404);
  }
  return data as { id: string; organization_id: string };
}
