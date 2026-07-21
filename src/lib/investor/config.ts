export const INVESTOR_HOSTS = new Set([
  "investor.novalyte.io",
  "investor.localhost",
  "investor.local",
]);

export const INVESTOR_BASE_PATH = "/investor";

export function investorPath(path = ""): string {
  const cleaned = path.replace(/^\/+/, "");
  if (!cleaned) return INVESTOR_BASE_PATH;
  return `${INVESTOR_BASE_PATH}/${cleaned}`;
}

export function investorSiteUrl(path = "/"): string {
  const base =
    process.env.NEXT_PUBLIC_INVESTOR_SITE_URL?.trim() || "https://investor.novalyte.io";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized === "/" ? "/" : normalized, base).toString();
}

export type MetricStatus =
  | "Actual"
  | "Estimated"
  | "Projected"
  | "Target"
  | "Under development"
  | "Planned"
  | "Founder-provided"
  | "Pending validation";

export const METRIC_STATUS_LABELS: Record<MetricStatus, string> = {
  Actual: "Actual",
  Estimated: "Estimated",
  Projected: "Projected",
  Target: "Target",
  "Under development": "Under development",
  Planned: "Planned",
  "Founder-provided": "Founder-provided",
  "Pending validation": "Pending validation",
};

export type NavItem = { label: string; href: string };

export const PUBLIC_NAV: NavItem[] = [
  { label: "Overview", href: "/investor" },
  { label: "Company", href: "/investor/company" },
  { label: "Market", href: "/investor/market" },
  { label: "Product", href: "/investor/product" },
  { label: "Technology", href: "/investor/technology" },
  { label: "Business Model", href: "/investor/business-model" },
  { label: "Go-to-Market", href: "/investor/gtm" },
  { label: "Roadmap", href: "/investor/roadmap" },
  { label: "Investment", href: "/investor/investment" },
  { label: "Contact", href: "/investor/contact" },
];

export const PROTECTED_NAV: NavItem[] = [
  { label: "Workspace", href: "/investor/workspace" },
  { label: "Traction", href: "/investor/traction" },
  { label: "Financials", href: "/investor/financials" },
  { label: "Data Room", href: "/investor/data-room" },
  { label: "Updates", href: "/investor/updates" },
  { label: "Meet", href: "/investor/meet" },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Requests", href: "/investor/admin/requests" },
  { label: "Investors", href: "/investor/admin/investors" },
  { label: "Documents", href: "/investor/admin/documents" },
  { label: "Metrics", href: "/investor/admin/metrics" },
  { label: "Fundraising", href: "/investor/admin/fundraising" },
  { label: "Activity", href: "/investor/admin/activity" },
];
