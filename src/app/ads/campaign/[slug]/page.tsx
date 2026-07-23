import type { Metadata } from "next";
import Link from "next/link";
import { CampaignLandingPage } from "@/components/campaign/landing-page";
import { CampaignAdsShell } from "@/components/campaign/campaign-shell";
import { campaignMetadata } from "@/lib/campaigns/metadata";
import {
  adsCanonicalUrl,
  getPublishedPageByCampaignSlug,
} from "@/lib/campaigns/public-pages";
import { buildDirectoryUrl, parseLocationSlug } from "@/lib/campaigns/directory-url";
import { listPublishedClinics } from "@/lib/public-clinics";
import { NOINDEX_ROBOTS } from "@/lib/seo-robots";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedPageByCampaignSlug(slug);
  if (!data) {
    return {
      title: "Campaign unavailable | Novalyte AI",
      robots: NOINDEX_ROBOTS,
    };
  }
  const meta = campaignMetadata(data);
  const canonical = data.page.canonical_url || adsCanonicalUrl(data.page.path);
  return {
    ...meta,
    robots: meta.robots ?? NOINDEX_ROBOTS,
    alternates: {
      ...meta.alternates,
      canonical,
    },
    openGraph: {
      ...meta.openGraph,
      url: canonical,
    },
  };
}

export default async function AdsNamedCampaignPage({ params }: PageProps) {
  const { slug } = await params;
  const [data, fallbackClinics] = await Promise.all([
    getPublishedPageByCampaignSlug(slug),
    listPublishedClinics(),
  ]);

  if (!data) {
    const directoryUrl = buildDirectoryUrl();
    return (
      <CampaignAdsShell variant="hub" directoryUrl={directoryUrl} showAssessmentCta={false}>
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold text-foreground">This campaign is unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The campaign <span className="font-medium text-foreground">{slug}</span> is paused,
            expired, not published, or does not exist.
          </p>
          <Link href="/" className="mt-8 inline-block text-sm font-medium text-teal-700 hover:underline">
            Campaign home
          </Link>
        </div>
      </CampaignAdsShell>
    );
  }

  const directoryUrl = buildDirectoryUrl({
    treatmentSlug: data.page.service_slug,
    citySlug: data.page.city_slug,
    stateSlug: data.page.state_slug,
    state: data.prefill.state,
    city: data.prefill.city,
  });
  const parsed = parseLocationSlug(data.page.city_slug);

  return (
    <CampaignAdsShell
      variant="campaign"
      directoryUrl={directoryUrl}
      analytics={{
        campaign_id: data.page.campaign_id,
        campaign_slug: data.page.slug,
        treatment_slug: data.page.service_slug,
        city: data.prefill.city ?? parsed.city,
        state: data.prefill.state ?? parsed.state,
        landing_page_url: data.page.path,
        assessment_id: data.assessmentSlug,
        directory_destination: directoryUrl,
      }}
    >
      <CampaignLandingPage data={data} fallbackClinics={fallbackClinics} />
    </CampaignAdsShell>
  );
}
