/**
 * Mapping between Supabase "Article" rows (JournalArticleV1 columns) and the
 * `ArticleContent` shape consumed by the production Journal renderer.
 *
 * Only rows with valid structured content (`bodyJson` + `authorJson` + hero)
 * are considered renderable; legacy rows that predate the structured schema
 * are skipped so the Journal keeps serving the hardcoded articles until the
 * parity import lands.
 */

import { z } from "zod";
import {
  articleBlockSchema,
  journalAuthorSchema,
  journalReviewerSchema,
  normalizeJournalSlug,
  type JournalArticleBlock,
} from "@/lib/journal-article-v1";
import type { ArticleContent } from "@/lib/article-content";

/** Columns the journal data layer selects from public."Article". */
export const JOURNAL_ARTICLE_COLUMNS = [
  "id",
  "slug",
  "title",
  "excerpt",
  "category",
  "status",
  "publishedAt",
  "updatedAt",
  "readingTime",
  "relatedTreatment",
  "tags",
  "bodyJson",
  "tableOfContents",
  "faqsJson",
  "referencesJson",
  "authorJson",
  "medicalReviewerJson",
  "seoTitle",
  "seoDescription",
  "canonicalUrl",
  "seoNoIndex",
  "heroImageUrl",
  "heroImageAlt",
  "heroImageCaption",
  "heroImageAspect",
].join(",");

const structuredRowSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().nullable(),
  category: z.string().min(1),
  status: z.string(),
  publishedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  readingTime: z.number().int().positive().nullable(),
  relatedTreatment: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  bodyJson: z.array(articleBlockSchema).min(1),
  tableOfContents: z
    .array(z.object({ id: z.string().min(1), title: z.string().min(1) }))
    .nullable()
    .optional(),
  faqsJson: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .nullable()
    .optional(),
  referencesJson: z
    .array(z.object({
      label: z.string().min(1),
      source: z.string().min(1),
      url: z.string().url().nullable().optional(),
    }))
    .nullable()
    .optional(),
  authorJson: journalAuthorSchema,
  medicalReviewerJson: journalReviewerSchema.nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  seoNoIndex: z.boolean().nullable().optional(),
  heroImageUrl: z.string().min(1),
  heroImageAlt: z.string().min(1),
  heroImageCaption: z.string().nullable().optional(),
  heroImageAspect: z.enum(["wide", "standard"]).nullable().optional(),
});

export type JournalSeoInfo = {
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
};

export type JournalRecord = {
  /** Supabase row id, or null when the record comes from the hardcoded registry. */
  id: string | null;
  source: "supabase" | "hardcoded";
  status: string;
  article: ArticleContent;
  seo: JournalSeoInfo;
};

function tocFromBlocks(blocks: JournalArticleBlock[]): { id: string; title: string }[] {
  return blocks
    .filter(
      (b): b is Extract<JournalArticleBlock, { type: "heading" }> =>
        b.type === "heading" && b.level === 2,
    )
    .map((b) => ({ id: b.id, title: b.text }));
}

/**
 * Convert a Supabase row to a renderable JournalRecord.
 * Returns null when the row lacks valid structured content.
 */
export function mapRowToJournalRecord(row: unknown): JournalRecord | null {
  const parsed = structuredRowSchema.safeParse(row);
  if (!parsed.success) return null;
  const r = parsed.data;

  const publishedAt = r.publishedAt ?? r.updatedAt ?? new Date().toISOString();
  const updatedAt = r.updatedAt ?? publishedAt;

  const article: ArticleContent = {
    slug: normalizeJournalSlug(r.slug),
    title: r.title,
    excerpt: r.excerpt ?? "",
    category: r.category,
    tags: r.tags ?? [],
    author: r.authorJson,
    medicalReviewer: r.medicalReviewerJson ?? null,
    publishedAt,
    updatedAt,
    readingTime: r.readingTime ?? 5,
    heroImage: r.heroImageUrl,
    heroImageAlt: r.heroImageAlt,
    heroImageCaption: r.heroImageCaption ?? undefined,
    tableOfContents:
      r.tableOfContents && r.tableOfContents.length > 0
        ? r.tableOfContents
        : tocFromBlocks(r.bodyJson),
    body: r.bodyJson,
    references: r.referencesJson ?? [],
    faqs: r.faqsJson ?? [],
    relatedTreatment: r.relatedTreatment ?? null,
  };

  return {
    id: r.id,
    source: "supabase",
    status: r.status,
    article,
    seo: {
      title: r.seoTitle ?? null,
      description: r.seoDescription ?? null,
      canonicalUrl: r.canonicalUrl ?? null,
      noIndex: r.seoNoIndex ?? false,
    },
  };
}

export function wrapHardcodedArticle(article: ArticleContent): JournalRecord {
  return {
    id: null,
    source: "hardcoded",
    status: "published",
    article,
    seo: { title: null, description: null, canonicalUrl: null, noIndex: false },
  };
}

/** Stable slug for a category name, e.g. "Weight Management" -> "weight-management". */
export function categorySlug(category: string): string {
  return normalizeJournalSlug(category);
}
