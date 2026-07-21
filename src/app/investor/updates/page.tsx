import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { SectionHeading } from "@/components/investor/section";
import { guardApprovedInvestor } from "@/lib/investor/guard";
import { logInvestorEvent } from "@/lib/investor/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Updates", robots: { index: false } };

type UpdateRow = {
  id: string;
  title: string;
  summary: string;
  body_markdown: string;
  published_at: string | null;
};

export default async function UpdatesPage() {
  const { user, profile, isFounder } = await guardApprovedInvestor();

  await logInvestorEvent({
    userId: user.id,
    eventType: "updates_viewed",
    section: "updates",
  });

  const { data } = await getSupabaseAdmin()
    .from("investor_updates")
    .select("id, title, summary, body_markdown, published_at")
    .in("visibility", ["public", "approved_investors"])
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  const updates = (data as UpdateRow[] | null) ?? [];
  const displayName = (profile.full_name as string) || user.email || undefined;

  return (
    <WorkspaceShell isFounder={isFounder} displayName={displayName}>
      <SectionHeading
        eyebrow="Updates"
        title="Founder updates"
        description="Progress notes and updates from the founder for approved investors."
      />

      {updates.length > 0 ? (
        <div className="mt-8 space-y-5">
          {updates.map((update) => (
            <article
              key={update.id}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              {update.published_at ? (
                <time className="text-xs font-medium uppercase tracking-wider text-teal-700">
                  {new Date(update.published_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              ) : null}
              <h2 className="mt-1 text-lg font-semibold text-stone-900">
                {update.title}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{update.summary}</p>
              {update.body_markdown ? (
                <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-700">
                  {update.body_markdown}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-stone-800">No updates yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Founder updates will appear here. You will be notified when a new
            update is published.
          </p>
        </div>
      )}
    </WorkspaceShell>
  );
}
