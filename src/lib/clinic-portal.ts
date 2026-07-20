export type ClinicPortalNavKey =
  | "dashboard"
  | "leads"
  | "profile"
  | "directory"
  | "workforce"
  | "marketplace"
  | "analytics"
  | "team"
  | "messages"
  | "billing"
  | "settings";

export const CLINIC_PORTAL_NAV: Array<{ key: ClinicPortalNavKey; label: string; href: string }> = [
  { key: "dashboard", label: "Dashboard", href: "/clinic/dashboard" },
  { key: "leads", label: "Leads", href: "/clinic/leads" },
  { key: "profile", label: "Profile", href: "/clinic/profile" },
  { key: "directory", label: "Directory", href: "/clinic/directory" },
  { key: "workforce", label: "Workforce", href: "/clinic/workforce" },
  { key: "marketplace", label: "Marketplace", href: "/clinic/marketplace" },
  { key: "analytics", label: "Analytics", href: "/clinic/analytics" },
  { key: "team", label: "Team", href: "/clinic/team" },
  { key: "messages", label: "Messages", href: "/clinic/messages" },
  { key: "billing", label: "Billing", href: "/clinic/billing" },
  { key: "settings", label: "Settings", href: "/clinic/settings" },
];

export function clinicPortalNavItems(active: ClinicPortalNavKey) {
  return CLINIC_PORTAL_NAV.map((item) => ({
    label: item.label,
    href: item.href,
    active: item.key === active,
  }));
}

export const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://novalyte.io";

export const PORTAL_SITE_URL =
  process.env.NEXT_PUBLIC_PORTAL_SITE_URL?.replace(/\/$/, "") || "https://portal.novalyte.io";
