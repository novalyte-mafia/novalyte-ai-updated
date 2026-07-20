"use client";

import { WorkspaceShell } from "@/components/site/workspace-shell";
import { clinicPortalNavItems, type ClinicPortalNavKey, PUBLIC_SITE_URL } from "@/lib/clinic-portal";

export function ClinicPortalShell({
  active,
  contextLabel,
  children,
}: {
  active: ClinicPortalNavKey;
  contextLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell
      role="clinic"
      contextLabel={contextLabel}
      navItems={clinicPortalNavItems(active)}
      signOutRedirect="/clinic/sign-in"
      publicSiteUrl={PUBLIC_SITE_URL}
    >
      {children}
    </WorkspaceShell>
  );
}
