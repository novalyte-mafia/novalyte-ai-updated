import { describe, expect, it } from "vitest";
import {
  assignmentVisibleToOrgs,
  canAccessBilling,
  canManageTeam,
  canWriteLeads,
  clinicVisibleToOrgs,
  navKeysForMembership,
  parseCapabilities,
} from "@/lib/clinic/capabilities";

describe("clinic tenant isolation helpers", () => {
  it("blocks assignments from other organizations", () => {
    expect(assignmentVisibleToOrgs("org-a", ["org-a", "org-b"])).toBe(true);
    expect(assignmentVisibleToOrgs("org-c", ["org-a", "org-b"])).toBe(false);
    expect(assignmentVisibleToOrgs(null, ["org-a"])).toBe(false);
  });

  it("blocks clinics not linked to caller orgs", () => {
    expect(clinicVisibleToOrgs("org-a", ["org-a"])).toBe(true);
    expect(clinicVisibleToOrgs("org-b", ["org-a"])).toBe(false);
    expect(clinicVisibleToOrgs(null, ["org-a"])).toBe(false);
  });
});

describe("portal capabilities", () => {
  it("parses boolean capability flags", () => {
    expect(parseCapabilities({ marketplace: true, leads_readonly: false })).toEqual({
      marketplace: true,
      leads_readonly: false,
    });
    expect(parseCapabilities({ marketplace: "yes" as unknown as boolean })).toEqual({});
  });

  it("enforces leads_readonly and viewer write rules", () => {
    expect(canWriteLeads({ role: "admin", portal_capabilities: {} })).toBe(true);
    expect(canWriteLeads({ role: "viewer", portal_capabilities: {} })).toBe(false);
    expect(canWriteLeads({ role: "admin", portal_capabilities: { leads_readonly: true } })).toBe(false);
  });

  it("limits team and billing to owner/admin", () => {
    expect(canManageTeam({ role: "owner", portal_capabilities: {} })).toBe(true);
    expect(canManageTeam({ role: "recruiter", portal_capabilities: {} })).toBe(false);
    expect(canAccessBilling({ role: "admin", portal_capabilities: {} })).toBe(true);
    expect(canAccessBilling({ role: "viewer", portal_capabilities: {} })).toBe(false);
  });

  it("filters nav by role defaults and capability disables", () => {
    const ownerNav = navKeysForMembership({ role: "owner", portal_capabilities: {} });
    expect(ownerNav).toContain("billing");
    expect(ownerNav).toContain("patients");

    const viewerNav = navKeysForMembership({ role: "viewer", portal_capabilities: {} });
    expect(viewerNav).not.toContain("team");
    expect(viewerNav).not.toContain("billing");
    expect(viewerNav).toContain("leads");

    const noMarketplace = navKeysForMembership({
      role: "admin",
      portal_capabilities: { marketplace: false },
    });
    expect(noMarketplace).not.toContain("marketplace");
  });
});
