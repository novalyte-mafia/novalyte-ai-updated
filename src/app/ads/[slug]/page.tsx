import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignLandingPage } from "@/components/campaign/landing-page";
import { CampaignAdsShell } from "@/components/campaign/campaign-shell";
import { campaignMetadata } from "@/lib/campaigns/metadata";
import { adsCanonicalUrl, getPublishedPageByAdsSlug } from "@/lib/campaigns/public-pages";
import { listPublishedClinics } from "@/lib/public-clinics";
import { NOINDEX_ROBOTS } from "@/lib/seo-robots";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Hierarchical landers are handled by /ads/[treatment]/[location]
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

export default async function AdsCampaignPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug.includes("/")) notFound();

  const [data, fallbackClinics] = await Promise.all([
    getPublishedPageByAdsSlug(slug),
    listPublishedClinics(),
  ]);

  if (!data) notFound();

  return (
    <CampaignAdsShell>
      <CampaignLandingPage data={data} fallbackClinics={fallbackClinics} />
    </CampaignAdsShell>
  );
}
