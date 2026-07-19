import type { Metadata } from "next";
import { AlertTriangle, Eye } from "lucide-react";
import { ArticleView } from "@/components/views/article-view";
import { getJournalPreviewRecord, getJournalRecords } from "@/lib/journal/data";
import { verifyJournalPreviewToken } from "@/lib/journal/preview-token";

// Never cache or index previews: drafts are rendered with privileged access
// and only a valid short-lived signed token may see them.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Article preview",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

type PageProps = { params: Promise<{ token: string }> };

function PreviewError({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

export default async function JournalPreviewPage({ params }: PageProps) {
  const { token } = await params;
  const verification = verifyJournalPreviewToken(decodeURIComponent(token));

  if (!verification.ok) {
    const detail =
      verification.reason === "expired"
        ? "This preview link has expired. Generate a fresh preview link from the Content Studio."
        : verification.reason === "unconfigured"
          ? "Preview links are not configured on this environment (missing JOURNAL_PREVIEW_SECRET)."
          : "This preview link is invalid. Generate a new preview link from the Content Studio.";
    return <PreviewError title="Preview unavailable" detail={detail} />;
  }

  const record = await getJournalPreviewRecord(verification.articleId);
  if (!record) {
    return (
      <PreviewError
        title="Nothing to preview"
        detail="The article was not found, was deleted, or does not have structured content yet. Save the draft in the Content Studio and try again."
      />
    );
  }

  const published = await getJournalRecords();

  return (
    <div>
      <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm text-amber-900 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Eye className="h-4 w-4" /> Preview
          </span>
          <span>
            Status: <strong className="font-medium">{record.status}</strong>
          </span>
          <span className="text-amber-800/80">
            Not public. Link expires {verification.expiresAt.toLocaleString("en-US")}.
          </span>
        </div>
      </div>
      <ArticleView
        article={record.article}
        allArticles={published.map((r) => r.article)}
      />
    </div>
  );
}
