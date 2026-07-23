import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignLandingPage } from "@/components/campaign/landing-page";
import { CampaignAdsShell } from "@/components/campaign/campaign-shell";
import { campaignMetadata } from "@/lib/campaigns/metadata";
import { adsCanonicalUrl, getPublishedPageByAdsSlug } from "@/lib/campaigns/public-pages";
import { buildDirectoryUrl, parseLocationSlug } from "@/lib/campaigns/directory-url";
import { listPublishedClinics } from "@/lib/public-clinics";
import { NOINDEX_ROBOTS } from "@/lib/seo-robots";

export const revalidate = 300;

type PageProps = {
  /** Named `treatment` to match ads/[treatment]/[location] first-segment convention. */
  params: Promise<{ treatment: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { treatment: slug } = await params;
  if (slug.includes("/")) {
    return { title: "Not found", robots: NOINDEX_ROBOTS };
  }
  const data = await getPublishedPageByAdsSlug(slug);
  if (!data) return { title: "Not found", robots: NOINDEX_ROBOTS };
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

export default async function AdsLegacySlugPage({ params }: PageProps) {
  const { treatment: slug } = await params;
  if (slug.includes("/")) notFound();

  const [data, fallbackClinics] = await Promise.all([
    getPublishedPageByAdsSlug(slug),
    listPublishedClinics(),
  ]);

  if (!data) notFound();

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
