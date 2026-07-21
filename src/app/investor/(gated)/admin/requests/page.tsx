import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { SectionHeading } from "@/components/investor/section";
import { RequestActions } from "@/components/investor/admin-actions";
import { guardFounderAdmin } from "@/lib/investor/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Access Requests", robots: { index: false } };

type RequestRow = {
  id: string;
  full_name: string;
  work_email: string;
  firm: string | null;
  investor_type: string;
  reason_for_interest: string;
  status: string;
  created_at: string;
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  denied: "bg-stone-200 text-stone-700",
  withdrawn: "bg-stone-200 text-stone-700",
};

export default async function AdminRequestsPage() {
  const founder = await guardFounderAdmin();

  const { data } = await getSupabaseAdmin()
    .from("investor_access_requests")
    .select(
      "id, full_name, work_email, firm, investor_type, reason_for_interest, status, created_at",
    )
    .order("created_at", { ascending: false });

  const requests = (data as RequestRow[] | null) ?? [];
  const pending = requests.filter((r) => r.status === "pending");

  return (
    <WorkspaceShell isFounder displayName={founder.email ?? "Founder"}>
      <SectionHeading
        eyebrow="Admin"
        title="Access requests"
        description={`${pending.length} pending · ${requests.length} total. Approving creates a Supabase invite and grants data-room access.`}
      />

      <div className="mt-8 space-y-4">
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-muted-foreground">
            No access requests yet.
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-stone-900">
                      {req.full_name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                        statusStyles[req.status] ?? "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-stone-600">
                    {req.work_email}
                    {req.firm ? ` · ${req.firm}` : ""} ·{" "}
                    <span className="capitalize">{req.investor_type.replace(/_/g, " ")}</span>
                  </p>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    {req.reason_for_interest}
                  </p>
                  <p className="mt-2 text-xs text-stone-400">
                    {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>
                {req.status === "pending" ? (
                  <RequestActions requestId={req.id} />
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </WorkspaceShell>
  );
}
