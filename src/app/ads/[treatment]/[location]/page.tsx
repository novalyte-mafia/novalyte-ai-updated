import type { Metadata } from "next";
import Link from "next/link";
import { CampaignLandingPage } from "@/components/campaign/landing-page";
import { CampaignAdsShell } from "@/components/campaign/campaign-shell";
import { campaignMetadata } from "@/lib/campaigns/metadata";
import {
  adsCanonicalUrl,
  getPublishedPageByTreatmentLocation,
} from "@/lib/campaigns/public-pages";
import { buildDirectoryUrl, parseLocationSlug } from "@/lib/campaigns/directory-url";
import { listPublishedClinics } from "@/lib/public-clinics";
import { NOINDEX_ROBOTS } from "@/lib/seo-robots";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ treatment: string; location: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { treatment, location } = await params;
  const data = await getPublishedPageByTreatmentLocation(treatment, location);
  if (!data) {
    return {
      title: "Campaign unavailable | Novalyte AI",
      robots: NOINDEX_ROBOTS,
    };
  }
  const meta = campaignMetadata(data);
  const canonical = adsCanonicalUrl(data.page.path);
  return {
    ...meta,
    robots: meta.robots ?? NOINDEX_ROBOTS,
    alternates: {
      ...meta.alternates,
      canonical: data.page.canonical_url || canonical,
    },
    openGraph: {
      ...meta.openGraph,
      url: data.page.canonical_url || canonical,
    },
  };
}

function CampaignUnavailable({ treatment, location }: { treatment: string; location: string }) {
  const directoryUrl = buildDirectoryUrl({
    treatmentSlug: treatment,
    citySlug: location,
  });

  return (
    <CampaignAdsShell variant="hub" directoryUrl={directoryUrl} showAssessmentCta={false}>
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Novalyte AI</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          This campaign is unavailable
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page for{" "}
          <span className="font-medium text-foreground">
            {treatment.replace(/-/g, " ")} · {location.replace(/-/g, " ")}
          </span>{" "}
          is paused, expired, not published yet, or does not exist.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800"
          >
            Campaign home
          </Link>
          <a
            href={directoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
          >
            Browse the directory
          </a>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          Novalyte AI is a healthcare technology platform and facilitator — not a medical provider.
        </p>
      </div>
    </CampaignAdsShell>
  );
}

export default async function AdsTreatmentLocationPage({ params, searchParams }: PageProps) {
  const { treatment, location } = await params;
  const query = searchParams ? await searchParams : {};
  void query.campaign;

  const [data, fallbackClinics] = await Promise.all([
    getPublishedPageByTreatmentLocation(treatment, location),
    listPublishedClinics(),
  ]);

  if (!data) {
    return <CampaignUnavailable treatment={treatment} location={location} />;
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
