import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignLandingPage } from "@/components/campaign/landing-page";
import { CampaignOrganicShell } from "@/components/campaign/campaign-shell";
import { campaignMetadata } from "@/lib/campaigns/metadata";
import { getPublishedPageByPath } from "@/lib/campaigns/public-pages";
import { listPublishedClinics } from "@/lib/public-clinics";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ service: string; state: string; city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service, state, city } = await params;
  const data = await getPublishedPageByPath(`/find/${service}/${state}/${city}`);
  if (!data) return { title: "Not found", robots: { index: false, follow: false } };
  return campaignMetadata(data);
}

export default async function FindServiceLocationPage({ params }: PageProps) {
  const { service, state, city } = await params;
  const path = `/find/${service}/${state}/${city}`;
  const [data, fallbackClinics] = await Promise.all([
    getPublishedPageByPath(path),
    listPublishedClinics(),
  ]);

  if (!data) notFound();

  return (
    <CampaignOrganicShell>
      <CampaignLandingPage data={data} fallbackClinics={fallbackClinics} />
    </CampaignOrganicShell>
  );
}
