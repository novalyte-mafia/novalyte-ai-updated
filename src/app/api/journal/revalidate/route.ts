import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { JOURNAL_ARTICLES_TAG, JOURNAL_REDIRECTS_TAG } from "@/lib/journal/data";
import { categorySlug } from "@/lib/journal/mapping";
import { normalizeJournalSlug } from "@/lib/journal-article-v1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cache invalidation hook for the dashboard's publish/unpublish/schedule/
 * archive APIs (see the dashboard's requestJournalRevalidation helper).
 *
 * POST /api/journal/revalidate
 * Authorization: Bearer <JOURNAL_REVALIDATE_SECRET>
 * Body: { "slugs"?: string[], "categories"?: string[], "all"?: boolean }
 */

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.JOURNAL_REVALIDATE_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!provided) return false;
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(secret, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { slugs?: unknown; categories?: unknown; all?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body is fine; treat as a full refresh.
  }

  const slugs = Array.isArray(body.slugs)
    ? body.slugs.filter((s): s is string => typeof s === "string").map(normalizeJournalSlug)
    : [];
  const categories = Array.isArray(body.categories)
    ? body.categories.filter((c): c is string => typeof c === "string").map(categorySlug)
    : [];
  const all = body.all === true || (slugs.length === 0 && categories.length === 0);

  // Data-layer caches (list, lookups, redirects).
  revalidateTag(JOURNAL_ARTICLES_TAG, "max");
  revalidateTag(JOURNAL_REDIRECTS_TAG, "max");

  const paths = new Set<string>(["/journal", "/sitemap.xml"]);
  for (const slug of slugs) {
    if (slug) paths.add(`/journal/${slug}`);
  }
  for (const slug of categories) {
    if (slug) paths.add(`/journal/category/${slug}`);
  }
  if (all) {
    // Invalidate every page under /journal (list, articles, categories).
    revalidatePath("/journal", "layout");
  }
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    revalidated: true,
    tags: [JOURNAL_ARTICLES_TAG, JOURNAL_REDIRECTS_TAG],
    paths: Array.from(paths),
    all,
    now: new Date().toISOString(),
  });
}
