import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ARTICLES } from "@/lib/article-content";
import {
  JOURNAL_ARTICLE_COLUMNS,
  categorySlug,
  mapRowToJournalRecord,
  wrapHardcodedArticle,
  type JournalRecord,
} from "@/lib/journal/mapping";
import { normalizeJournalSlug } from "@/lib/journal-article-v1";

/** Cache tags the dashboard can invalidate via POST /api/journal/revalidate. */
export const JOURNAL_ARTICLES_TAG = "journal-articles";
export const JOURNAL_REDIRECTS_TAG = "journal-redirects";
export const JOURNAL_CACHE_SECONDS = 300;

/**
 * Data source switch for the cutover:
 * - "merge" (default): Supabase structured articles override hardcoded ones by
 *   slug; hardcoded articles remain until the parity import replaces them.
 * - "supabase": Supabase only, falling back to hardcoded when Supabase is
 *   empty or unreachable (never renders an empty Journal by accident).
 * - "hardcoded": ignore Supabase entirely (emergency rollback).
 */
function journalSource(): "merge" | "supabase" | "hardcoded" {
  const value = process.env.JOURNAL_SOURCE?.trim().toLowerCase();
  if (value === "supabase" || value === "hardcoded") return value;
  return "merge";
}

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

async function fetchSupabaseRecords(): Promise<JournalRecord[]> {
  // Anon client: RLS restricts reads to published + publishedAt <= now()
  // + not deleted, so no additional visibility filter can leak drafts.
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("Article")
    .select(JOURNAL_ARTICLE_COLUMNS)
    .order("publishedAt", { ascending: false });

  if (error) throw new Error(`Journal fetch failed: ${error.message}`);

  const records: JournalRecord[] = [];
  for (const row of data ?? []) {
    const record = mapRowToJournalRecord(row);
    if (record) {
      records.push(record);
    }
  }
  return records;
}

async function loadJournalRecords(): Promise<JournalRecord[]> {
  const hardcoded = ARTICLES.map(wrapHardcodedArticle);
  const source = journalSource();

  if (source === "hardcoded" || !supabaseConfigured()) {
    return hardcoded;
  }

  let supabaseRecords: JournalRecord[] = [];
  try {
    supabaseRecords = await fetchSupabaseRecords();
  } catch (error) {
    console.error("[journal] Supabase read failed; serving hardcoded articles", error);
    return hardcoded;
  }

  if (source === "supabase") {
    return supabaseRecords.length > 0 ? supabaseRecords : hardcoded;
  }

  // merge: Supabase wins on slug collisions; hardcoded fills the rest.
  const supabaseSlugs = new Set(supabaseRecords.map((r) => r.article.slug));
  const merged = [
    ...supabaseRecords,
    ...hardcoded.filter((r) => !supabaseSlugs.has(r.article.slug)),
  ];
  merged.sort(
    (a, b) =>
      new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime(),
  );
  return merged;
}

/** All publicly visible journal records, newest first. */
export const getJournalRecords = unstable_cache(
  loadJournalRecords,
  ["journal-records"],
  { tags: [JOURNAL_ARTICLES_TAG], revalidate: JOURNAL_CACHE_SECONDS },
);

export async function getJournalRecordBySlug(slug: string): Promise<JournalRecord | null> {
  const normalized = normalizeJournalSlug(slug);
  const records = await getJournalRecords();
  return records.find((r) => r.article.slug === normalized) ?? null;
}

export type JournalCategory = { name: string; slug: string };

export async function getJournalCategories(): Promise<JournalCategory[]> {
  const records = await getJournalRecords();
  const names = Array.from(new Set(records.map((r) => r.article.category))).sort();
  return names.map((name) => ({ name, slug: categorySlug(name) }));
}

/**
 * Resolve a legacy/renamed slug through article_slug_redirects.
 * Returns the current slug of the (publicly visible) target article.
 */
export const getJournalRedirectTarget = unstable_cache(
  async (fromSlug: string): Promise<string | null> => {
    if (!supabaseConfigured()) return null;
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("article_slug_redirects")
        .select("from_slug, is_active, article:Article(slug)")
        .eq("from_slug", normalizeJournalSlug(fromSlug))
        .eq("is_active", true)
        .maybeSingle();
      if (error || !data) return null;
      const target = Array.isArray(data.article) ? data.article[0] : data.article;
      const slug = (target as { slug?: string } | null)?.slug;
      return slug ? normalizeJournalSlug(slug) : null;
    } catch (error) {
      console.error("[journal] redirect lookup failed", error);
      return null;
    }
  },
  ["journal-redirect-target"],
  { tags: [JOURNAL_REDIRECTS_TAG, JOURNAL_ARTICLES_TAG], revalidate: JOURNAL_CACHE_SECONDS },
);

/**
 * Privileged fetch for exact preview: any workflow status, drafts included.
 * Service-role only - never expose the result without a verified preview token.
 * Never cached.
 */
export async function getJournalPreviewRecord(articleId: string): Promise<JournalRecord | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("Article")
    .select(JOURNAL_ARTICLE_COLUMNS)
    .eq("id", articleId)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) {
    console.error("[journal] preview fetch failed", error);
    return null;
  }
  if (!data) return null;
  return mapRowToJournalRecord(data);
}
