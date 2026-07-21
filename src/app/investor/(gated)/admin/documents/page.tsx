import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { SectionHeading } from "@/components/investor/section";
import { DocumentUploadForm } from "@/components/investor/document-upload-form";
import { guardFounderAdmin } from "@/lib/investor/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Documents", robots: { index: false } };

type DocRow = {
  id: string;
  title: string;
  category: string;
  visibility: string;
  updated_at: string;
};

export default async function AdminDocumentsPage() {
  const founder = await guardFounderAdmin();

  const { data } = await getSupabaseAdmin()
    .from("investor_documents")
    .select("id, title, category, visibility, updated_at")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const docs = (data as DocRow[] | null) ?? [];

  return (
    <WorkspaceShell isFounder displayName={founder.email ?? "Founder"}>
      <SectionHeading
        eyebrow="Admin"
        title="Data room documents"
        description="Upload confidential documents. Files are stored in a private bucket and served only via short-lived signed URLs to approved investors."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <DocumentUploadForm />

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
            Published documents ({docs.length})
          </h2>
          {docs.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-sm text-muted-foreground">
              No documents uploaded yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{doc.title}</p>
                    <p className="text-xs text-stone-500">{doc.category}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {doc.visibility.replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
