import type { Metadata } from "next";
import type { IndexingPolicy, PublicCampaignPage } from "@/lib/campaigns/types";

export function campaignRobots(indexingPolicy: IndexingPolicy): Metadata["robots"] {
  switch (indexingPolicy) {
    case "index_follow":
      return { index: true, follow: true };
    case "noindex_follow":
      return { index: false, follow: true };
    case "noindex_nofollow":
      return { index: false, follow: false };
    default:
      return { index: false, follow: false };
  }
}

export function campaignMetadata(data: PublicCampaignPage): Metadata {
  const { page } = data;
  const title = page.seo_title ?? page.public_title ?? "Find care";
  const description =
    page.seo_description ??
    (page.hero?.subheadline as string | undefined) ??
    "Informational care navigation from Novalyte AI.";
  const canonical = page.canonical_url ?? page.path;

  return {
    title,
    description,
    alternates: { canonical },
    robots: campaignRobots(page.indexing_policy),
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
    },
  };
}
