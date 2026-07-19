import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { JournalCategoryView } from "@/components/views/journal-category-view";
import { getJournalCategories, getJournalRecords } from "@/lib/journal/data";
import { categorySlug } from "@/lib/journal/mapping";

export const revalidate = 300;

type PageProps = { params: Promise<{ slug: string }> };

async function resolveCategory(rawSlug: string) {
  const decoded = decodeURIComponent(rawSlug);
  const normalized = categorySlug(decoded);
  if (!normalized) notFound();

  const categories = await getJournalCategories();
  const match = categories.find((c) => c.slug === normalized);
  if (!match) notFound();

  // Legacy links used the encoded category name ("Weight%20Management").
  if (decoded !== normalized) {
    redirect(`/journal/category/${match.slug}`);
  }
  return match;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await resolveCategory(slug);
  const title = `${category.name} Articles`;
  const description = `Educational articles on ${category.name.toLowerCase()} from the Novalyte Journal.`;
  return {
    title,
    description,
    alternates: { canonical: `/journal/category/${category.slug}` },
    openGraph: {
      title: `${title} | Novalyte Journal`,
      description,
      url: `/journal/category/${category.slug}`,
      type: "website",
    },
  };
}

export default async function JournalCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [category, records] = await Promise.all([
    resolveCategory(slug),
    getJournalRecords(),
  ]);
  const categories = await getJournalCategories();
  return (
    <JournalCategoryView
      category={category.name}
      articles={records.map((r) => r.article)}
      categories={categories}
    />
  );
}
