import type { Metadata } from "next";
import { JournalView } from "@/components/views/journal-view";
import { getJournalCategories, getJournalRecords } from "@/lib/journal/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Novalyte Journal — Men's Health Education",
  description:
    "The Novalyte Journal publishes educational material on men's health treatments, clinic operations, workforce trends, and the broader healthcare ecosystem.",
  alternates: { canonical: "/journal" },
  openGraph: {
    title: "Novalyte Journal — Men's Health Education",
    description:
      "Educational content for the men's health economy: treatments, clinic operations, and workforce trends.",
    url: "/journal",
    type: "website",
  },
};

export default async function JournalPage() {
  const [records, categories] = await Promise.all([
    getJournalRecords(),
    getJournalCategories(),
  ]);
  return (
    <JournalView
      articles={records.map((r) => r.article)}
      categories={categories}
    />
  );
}
