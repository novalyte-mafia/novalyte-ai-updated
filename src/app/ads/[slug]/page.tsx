import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignLandingPage } from "@/components/campaign/landing-page";
import { CampaignAdsShell } from "@/components/campaign/campaign-shell";
import { campaignMetadata } from "@/lib/campaigns/metadata";
import { getPublishedPageByAdsSlug } from "@/lib/campaigns/public-pages";
import { listPublishedClinics } from "@/lib/public-clinics";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedPageByAdsSlug(slug);
  if (!data) return { title: "Not found", robots: { index: false, follow: false } };
  return campaignMetadata(data);
}

export default async function AdsCampaignPage({ params }: PageProps) {
  const { slug } = await params;
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
