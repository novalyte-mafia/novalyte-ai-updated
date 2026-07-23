import type { Metadata } from "next";
import { getJournalRecordBySlug, getJournalRecords, getJournalRedirectTarget } from "@/lib/journal/data";
import { normalizeJournalSlug } from "@/lib/journal-article-v1";
import { INDEXABLE_ROBOTS } from "@/lib/seo-robots";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { ArticleView } from "@/components/views/article-view";

export const revalidate = 300;

type PageProps = { params: Promise<{ slug: string }> };

async function resolveRecord(rawSlug: string) {
  const slug = normalizeJournalSlug(decodeURIComponent(rawSlug));
  if (!slug) notFound();
  if (slug !== decodeURIComponent(rawSlug)) {
    redirect(`/journal/${slug}`);
  }

  const record = await getJournalRecordBySlug(slug);
  if (record) return record;

  const target = await getJournalRedirectTarget(slug);
  if (target && target !== slug) {
    permanentRedirect(`/journal/${target}`);
  }
  notFound();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = await resolveRecord(slug);
  const { article, seo } = record;

  const title = seo.title ?? article.title;
  const description = seo.description ?? article.excerpt;
  const canonical = seo.canonicalUrl ?? `/journal/${article.slug}`;

  return {
    // absolute avoids "| Novalyte Journal" stacking on SEO titles that already brand Novalyte
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: seo.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : INDEXABLE_ROBOTS,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      section: article.category,
      tags: article.tags,
      images: [{ url: article.heroImage, alt: article.heroImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.heroImage],
    },
  };
}

export default async function JournalArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [record, records] = await Promise.all([resolveRecord(slug), getJournalRecords()]);
  return (
    <ArticleView
      article={record.article}
      allArticles={records.map((r) => r.article)}
    />
  );
}
