import { redirect } from "next/navigation";
import { AppShell } from "@/components/site/app-shell";
import { normalizeJournalSlug } from "@/lib/journal-article-v1";
import { getPublicPlatformData } from "@/lib/platform-data";

export const revalidate = 300;

/**
 * Journal moved to real routes. Preserve legacy view-router query links
 * (`/?view=journal-article&params={"slug":...}`) with server-side redirects.
 */
function journalRedirectPath(searchParams: Record<string, string | string[] | undefined>): string | null {
  const view = typeof searchParams.view === "string" ? searchParams.view : null;
  if (!view || !view.startsWith("journal")) return null;

  let slug: string | undefined;
  const rawParams = typeof searchParams.params === "string" ? searchParams.params : undefined;
  if (rawParams) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawParams));
      if (typeof parsed?.slug === "string") slug = parsed.slug;
    } catch {
      // Malformed params payload — fall through to the journal index.
    }
  }

  if (view === "journal-article" && slug) {
    const normalized = normalizeJournalSlug(slug);
    if (normalized) return `/journal/${normalized}`;
  }
  if (view === "journal-category" && slug) {
    const normalized = normalizeJournalSlug(slug);
    if (normalized) return `/journal/category/${normalized}`;
  }
  return "/journal";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const journalPath = journalRedirectPath(resolvedSearchParams);
  if (journalPath) redirect(journalPath);

  const data = await getPublicPlatformData();
  return <AppShell data={data} />;
}
