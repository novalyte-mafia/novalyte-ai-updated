import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/site/app-shell";
import { AnalyticsEvent } from "@/components/site/analytics-event";
import { getPublicPlatformData } from "@/lib/platform-data";
import { listPublishedClinics } from "@/lib/public-clinics";
import { canonicalPath } from "@/lib/site-config";
import { breadcrumbJsonLd, medicalClinicJsonLd } from "@/lib/seo";

type ClinicProfileParams = {
  state: string;
  city: string;
  slug: string;
};

function segment(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getPublishedClinic(slug: string) {
  const clinics = await listPublishedClinics();
  return clinics.find((clinic) => clinic.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ClinicProfileParams>;
}): Promise<Metadata> {
  const resolved = await params;
  const clinic = await getPublishedClinic(resolved.slug);
  if (!clinic) {
    return {
      title: "Clinic profile not found",
      robots: { index: false, follow: false },
    };
  }

  const canonical = canonicalPath(
    `/directory/${segment(clinic.state)}/${segment(clinic.city)}/${clinic.slug}`,
  );
  const description =
    clinic.overview?.trim() ||
    `Review public information for ${clinic.name}, a men's-health clinic in ${clinic.city}, ${clinic.state}.`;
  const isDemo =
    clinic.listingStatus === "demo" || clinic.verificationStatus === "demo";

  return {
    title: isDemo ? `${clinic.name} (Preview Profile)` : clinic.name,
    description: isDemo
      ? "Fictional preview profile for the Novalyte AI clinic directory. Does not represent an active clinic partnership."
      : description,
    alternates: { canonical },
    robots: isDemo ? { index: false, follow: false } : undefined,
    openGraph: {
      title: isDemo
        ? `${clinic.name} (Preview) | Novalyte AI`
        : `${clinic.name} | Novalyte AI`,
      description: isDemo
        ? "Fictional preview profile for directory demonstration only."
        : description,
      type: "website",
      url: canonical,
    },
  };
}

export default async function ClinicProfilePage({
  params,
}: {
  params: Promise<ClinicProfileParams>;
}) {
  const resolved = await params;
  const clinic = await getPublishedClinic(resolved.slug);

  if (
    !clinic ||
    segment(clinic.state) !== resolved.state ||
    segment(clinic.city) !== resolved.city
  ) {
    notFound();
  }

  const data = await getPublicPlatformData();
  const canonical = canonicalPath(
    `/directory/${resolved.state}/${resolved.city}/${resolved.slug}`,
  );
  const jsonLd: Array<Record<string, unknown>> = [
    breadcrumbJsonLd([
      { label: "Home", url: canonicalPath("/") },
      { label: "Clinic Directory", url: canonicalPath("/directory") },
      { label: clinic.name, url: canonical },
    ]),
  ];

  if (clinic.listingStatus !== "demo" && clinic.verificationStatus !== "demo") {
    jsonLd.push(
      medicalClinicJsonLd({
        name: clinic.name,
        description: clinic.overview,
        url: canonical,
        phone: clinic.phone,
        city: clinic.city,
        state: clinic.state,
        zip: clinic.zip,
        website: clinic.website,
      }),
    );
  }

  return (
    <>
      <AnalyticsEvent
        name="clinic_profile_viewed"
        properties={{
          clinic_id: clinic.id,
          clinic_slug: clinic.slug,
          state: clinic.state,
          city: clinic.city,
          listing_status: clinic.listingStatus ?? clinic.claimStatus ?? "unclaimed",
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AppShell
        data={data}
        initialView="clinic-profile"
        initialParams={{ id: clinic.id }}
      />
    </>
  );
}
