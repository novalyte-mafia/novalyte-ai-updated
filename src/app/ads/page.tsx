import Link from "next/link";
import { CampaignAdsShell } from "@/components/campaign/campaign-shell";
import { INDEXABLE_ROBOTS } from "@/lib/seo-robots";

export const metadata = {
  title: "Novalyte AI campaign landers",
  description:
    "Patient-acquisition landing pages for Novalyte AI care navigation campaigns.",
  robots: INDEXABLE_ROBOTS,
  alternates: { canonical: "https://ads.novalyte.io/" },
};

const EXAMPLES = [
  { href: "/trt/phoenix-az", label: "TRT · Phoenix, AZ" },
  { href: "/longevity/beverly-hills-ca", label: "Longevity · Beverly Hills, CA" },
  { href: "/sexual-health/palo-alto-ca", label: "Sexual health · Palo Alto, CA" },
];

export default function AdsIndexPage() {
  return (
    <CampaignAdsShell>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-foreground">Novalyte AI campaign pages</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Paid landers use treatment × location URLs on this host, for example{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/trt/phoenix-az</code>.
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
        <Link
          href="https://novalyte.io"
          className="mt-10 inline-block text-sm font-medium text-teal-700 hover:underline"
        >
          Go to novalyte.io
        </Link>
      </div>
    </CampaignAdsShell>
  );
}
