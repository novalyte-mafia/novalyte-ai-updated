import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { SectionHeading } from "@/components/investor/section";
import { UpdateForm, TermsForm } from "@/components/investor/publish-forms";
import { guardFounderAdmin } from "@/lib/investor/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Fundraising", robots: { index: false } };

type TermsRow = {
  version: string;
  title: string;
  body_markdown: string;
  published_at: string | null;
};

export default async function AdminFundraisingPage() {
  const founder = await guardFounderAdmin();

  const { data } = await getSupabaseAdmin()
    .from("investor_terms_versions")
    .select("version, title, body_markdown, published_at")
    .order("created_at", { ascending: false })
    .limit(1);

  const latestTerms = (data as TermsRow[] | null)?.[0];

  return (
    <WorkspaceShell isFounder displayName={founder.email ?? "Founder"}>
      <SectionHeading
        eyebrow="Admin"
        title="Updates & terms"
        description="Post founder updates and publish the confidentiality / access terms investors accept before opening the data room."
      />

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Specific fundraising round terms (raise, instrument, valuation) are shared
        privately with investors and are intentionally not published on the
        portal. Manage those conversations under Investors and Meet.
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <UpdateForm />
        <TermsForm
          defaultVersion={latestTerms?.version}
          defaultTitle={latestTerms?.title}
          defaultBody={latestTerms?.body_markdown}
        />
      </div>

      {latestTerms ? (
        <p className="mt-4 text-xs text-stone-500">
          Latest terms: {latestTerms.version} —{" "}
          {latestTerms.published_at ? "published" : "draft"}
        </p>
      ) : null}
    </WorkspaceShell>
  );
}
