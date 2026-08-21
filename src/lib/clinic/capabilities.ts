/**
 * Clinic portal capability + role helpers.
 * Roles live on organization_memberships.role.
 * Optional flags live on organization_memberships.portal_capabilities jsonb.
 */

import type { ClinicPortalNavKey } from "@/lib/clinic-portal";
import type { OrgMembership } from "@/lib/workforce/auth";

export type PortalCapability =
  | "leads"
  | "leads_readonly"
  | "profile"
  | "directory"
  | "workforce"
  | "marketplace"
  | "analytics"
  | "team"
  | "billing"
  | "patients"
  | "calendar"
  | "ai_assist";

export type PortalRole = OrgMembership["role"];

/** Default access when portal_capabilities is empty — role-based. */
const ROLE_DEFAULT_NAV: Record<PortalRole, ClinicPortalNavKey[]> = {
  owner: [
    "dashboard",
    "leads",
    "patients",
    "calendar",
    "profile",
    "directory",
    "workforce",
    "marketplace",
    "analytics",
    "team",
    "messages",
    "billing",
    "settings",
  ],
  admin: [
    "dashboard",
    "leads",
    "patients",
    "calendar",
    "profile",
    "directory",
    "workforce",
    "marketplace",
    "analytics",
    "team",
    "messages",
    "billing",
    "settings",
  ],
  recruiter: [
    "dashboard",
    "leads",
    "patients",
    "calendar",
    "profile",
    "directory",
    "workforce",
    "marketplace",
    "analytics",
    "messages",
    "settings",
  ],
  viewer: ["dashboard", "leads", "patients", "calendar", "directory", "analytics", "messages", "settings"],
};

const NAV_CAPABILITY: Partial<Record<ClinicPortalNavKey, PortalCapability>> = {
  leads: "leads",
  patients: "patients",
  calendar: "calendar",
  profile: "profile",
  directory: "directory",
  workforce: "workforce",
  marketplace: "marketplace",
  analytics: "analytics",
  team: "team",
  billing: "billing",
};

export function parseCapabilities(raw: Record<string, unknown> | null | undefined): Record<string, boolean> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "boolean") out[key] = value;
  }
  return out;
}

export function capabilityEnabled(
  caps: Record<string, boolean>,
  key: PortalCapability,
  fallback = true,
): boolean {
  if (Object.prototype.hasOwnProperty.call(caps, key)) {
    return caps[key] === true;
  }
  return fallback;
}

export function canWriteLeads(membership: Pick<OrgMembership, "role" | "portal_capabilities">): boolean {
  const caps = parseCapabilities(membership.portal_capabilities);
  if (capabilityEnabled(caps, "leads_readonly", false)) return false;
  if (membership.role === "viewer") return false;
  return capabilityEnabled(caps, "leads", true);
}

export function canManageTeam(membership: Pick<OrgMembership, "role" | "portal_capabilities">): boolean {
  const caps = parseCapabilities(membership.portal_capabilities);
  if (!["owner", "admin"].includes(membership.role)) return false;
  return capabilityEnabled(caps, "team", true);
}

export function canAccessBilling(membership: Pick<OrgMembership, "role" | "portal_capabilities">): boolean {
  const caps = parseCapabilities(membership.portal_capabilities);
  if (!["owner", "admin"].includes(membership.role)) return false;
  return capabilityEnabled(caps, "billing", true);
}

export function navKeysForMembership(
  membership: Pick<OrgMembership, "role" | "portal_capabilities">,
): ClinicPortalNavKey[] {
  const role = membership.role in ROLE_DEFAULT_NAV ? membership.role : ("viewer" as PortalRole);
  const defaults = ROLE_DEFAULT_NAV[role];
  const caps = parseCapabilities(membership.portal_capabilities);

  return defaults.filter((key) => {
    const required = NAV_CAPABILITY[key];
    if (!required) return true;
    return capabilityEnabled(caps, required, true);
  });
}

/** Pure tenant isolation: assignment org must be in the caller's org set. */
export function assignmentVisibleToOrgs(
  assignmentOrganizationId: string | null | undefined,
  allowedOrganizationIds: string[],
): boolean {
  if (!assignmentOrganizationId) return false;
  return allowedOrganizationIds.includes(assignmentOrganizationId);
}

/** Pure tenant isolation: clinic must belong to an allowed org. */
export function clinicVisibleToOrgs(
  clinicOrganizationId: string | null | undefined,
  allowedOrganizationIds: string[],
): boolean {
  if (!clinicOrganizationId) return false;
  return allowedOrganizationIds.includes(clinicOrganizationId);
}
