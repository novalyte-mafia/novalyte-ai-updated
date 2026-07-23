import Link from "next/link";
import { CampaignAdsShell } from "@/components/campaign/campaign-shell";
import { buildDirectoryUrl } from "@/lib/campaigns/directory-url";
import { INDEXABLE_ROBOTS } from "@/lib/seo-robots";

export const metadata = {
  title: "Novalyte AI campaign pages",
  description:
    "Focused patient-acquisition landing pages for Novalyte AI care navigation campaigns.",
  robots: INDEXABLE_ROBOTS,
  alternates: { canonical: "https://ads.novalyte.io/" },
};

const EXAMPLES = [
  { href: "/trt/phoenix-az", label: "TRT · Phoenix, AZ" },
  { href: "/longevity/beverly-hills-ca", label: "Longevity · Beverly Hills, CA" },
  { href: "/sexual-health/palo-alto-ca", label: "Sexual health · Palo Alto, CA" },
];

export default function AdsIndexPage() {
  const directoryUrl = buildDirectoryUrl();

  return (
    <CampaignAdsShell variant="hub" directoryUrl={directoryUrl} showAssessmentCta={false}>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Novalyte AI</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Campaign landing pages</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This host serves focused treatment and location campaigns. Each page includes an
          informational assessment and a path to explore verified clinics — Novalyte AI does not
          provide medical care.
        </p>
        <ul className="mt-8 space-y-2 text-left text-sm">
          {EXAMPLES.map((ex) => (
            <li key={ex.href}>
              <Link href={ex.href} className="font-medium text-teal-700 hover:underline">
                {ex.label}
              </Link>
              <span className="ml-2 text-muted-foreground">{ex.href}</span>
            </li>
          ))}
        </ul>
        <a
          href={directoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-block text-sm font-medium text-teal-700 hover:underline"
        >
          Find clinics on Novalyte
        </a>
      </div>
    </CampaignAdsShell>
  );
}
