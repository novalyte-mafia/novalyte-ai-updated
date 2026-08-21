export type ClinicPortalNavKey =
  | "dashboard"
  | "leads"
  | "patients"
  | "calendar"
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
  { key: "dashboard", label: "Home", href: "/clinic/dashboard" },
  { key: "leads", label: "Leads", href: "/clinic/leads" },
  { key: "patients", label: "Patients", href: "/clinic/patients" },
  { key: "calendar", label: "Calendar", href: "/clinic/calendar" },
  { key: "profile", label: "Profile", href: "/clinic/profile" },
  { key: "directory", label: "Directory", href: "/clinic/directory" },
  { key: "workforce", label: "Workforce", href: "/clinic/workforce" },
  { key: "marketplace", label: "Marketplace", href: "/clinic/marketplace" },
  { key: "analytics", label: "Analytics", href: "/clinic/analytics" },
  { key: "team", label: "Team", href: "/clinic/team" },
  { key: "messages", label: "Notifications", href: "/clinic/messages" },
  { key: "billing", label: "Billing", href: "/clinic/billing" },
  { key: "settings", label: "Settings", href: "/clinic/settings" },
];

export function clinicPortalNavItems(
  active: ClinicPortalNavKey,
  allowedKeys?: ClinicPortalNavKey[],
) {
  const items = allowedKeys
    ? CLINIC_PORTAL_NAV.filter((item) => allowedKeys.includes(item.key))
    : CLINIC_PORTAL_NAV;
  return items.map((item) => ({
    label: item.label,
    href: item.href,
    active: item.key === active,
  }));
}

export const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://novalyte.io";

export const PORTAL_SITE_URL =
  process.env.NEXT_PUBLIC_PORTAL_SITE_URL?.replace(/\/$/, "") || "https://portal.novalyte.io";

export const CLINIC_PUBLIC_AUTH_PATHS = new Set([
  "/clinic/sign-in",
  "/clinic/forgot-password",
  "/clinic/reset-password",
]);
