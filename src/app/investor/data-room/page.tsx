import type { Metadata } from "next";
import { FileText, Download, FolderOpen } from "lucide-react";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { guardApprovedInvestor } from "@/lib/investor/guard";
import { logInvestorEvent } from "@/lib/investor/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { investorPath } from "@/lib/investor/config";

export const metadata: Metadata = { title: "Data Room", robots: { index: false } };

type DocRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  featured: boolean;
  updated_at: string;
  investor_document_versions?:
    | { upload_status: string }
    | { upload_status: string }[]
    | null;
};

export default async function DataRoomPage() {
  const { user, profile, isFounder } = await guardApprovedInvestor();

  await logInvestorEvent({
    userId: user.id,
    eventType: "data_room_viewed",
    section: "data_room",
  });

  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("investor_documents")
    .select(
      "id, title, description, category, featured, updated_at, investor_document_versions!investor_documents_current_version_fk(upload_status)",
    )
    .is("deleted_at", null)
    .in("visibility", ["approved_investors", "specific_investors"])
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });

  const docs = ((data as DocRow[] | null) ?? []).filter((doc) => {
    const version = Array.isArray(doc.investor_document_versions)
      ? doc.investor_document_versions[0]
      : doc.investor_document_versions;
    return version?.upload_status === "approved";
  });

  const categories = Array.from(new Set(docs.map((d) => d.category)));
  const displayName = (profile.full_name as string) || user.email || undefined;

  return (
    <WorkspaceShell isFounder={isFounder} displayName={displayName}>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-investor-serif)] text-3xl font-semibold text-stone-900">
          Data room
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Confidential documents. Access is logged, links are time-limited, and
          nothing here may be copied or redistributed.
        </p>
      </div>

      {docs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <FolderOpen className="mx-auto h-10 w-10 text-stone-400" />
          <h2 className="mt-4 text-base font-semibold text-stone-800">
            No documents published yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The founder has not yet published data-room documents. You will be
            notified when materials become available.
          </p>
          {isFounder ? (
            <a
              href={investorPath("admin/documents")}
              className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline"
            >
              Upload documents in admin →
            </a>
          ) : null}
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                {category}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {docs
                  .filter((d) => d.category === category)
                  .map((doc) => (
                    <a
                      key={doc.id}
                      href={`/api/investor/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-teal-300"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <FileText className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-stone-900">
                            {doc.title}
                          </span>
                          {doc.featured ? (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                              Featured
                            </span>
                          ) : null}
                        </span>
                        {doc.description ? (
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {doc.description}
                          </span>
                        ) : null}
                      </span>
                      <Download className="h-4 w-4 shrink-0 text-stone-400 transition group-hover:text-teal-700" />
                    </a>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}
