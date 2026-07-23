import Link from "next/link";
import { CampaignAdsShell } from "@/components/campaign/campaign-shell";
import { INDEXABLE_ROBOTS } from "@/lib/seo-robots";

export const metadata = {
  title: "Novalyte care landing pages",
  description:
    "Find men's-health care navigation and clinic discovery landers from Novalyte AI.",
  robots: INDEXABLE_ROBOTS,
  alternates: { canonical: "https://ads.novalyte.io/ads" },
};

export default function AdsIndexPage() {
  return (
    <CampaignAdsShell>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-foreground">Novalyte campaign pages</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Paid campaign landing pages are published at individual URLs such as{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/ads/your-campaign-slug</code>.
        </p>
        <Link
          href="https://novalyte.io"
          className="mt-8 inline-block text-sm font-medium text-teal-700 hover:underline"
        >
          Go to novalyte.io
        </Link>
      </div>
    </CampaignAdsShell>
  );
}
