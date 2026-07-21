import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { SectionHeading } from "@/components/investor/section";
import { InvestorActions } from "@/components/investor/admin-actions";
import { guardFounderAdmin } from "@/lib/investor/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Investors", robots: { index: false } };

type ProfileRow = {
  user_id: string;
  full_name: string;
  work_email: string;
  firm: string | null;
  stage: string;
  access_status: string;
  terms_accepted_at: string | null;
  created_at: string;
};

export default async function AdminInvestorsPage() {
  const founder = await guardFounderAdmin();

  const { data } = await getSupabaseAdmin()
    .from("investor_profiles")
    .select(
      "user_id, full_name, work_email, firm, stage, access_status, terms_accepted_at, created_at",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const profiles = (data as ProfileRow[] | null) ?? [];

  return (
    <WorkspaceShell isFounder displayName={founder.email ?? "Founder"}>
      <SectionHeading
        eyebrow="Admin"
        title="Investors"
        description={`${profiles.length} approved investor${profiles.length === 1 ? "" : "s"}.`}
      />

      <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Investor</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Terms</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No investors yet.
                </td>
              </tr>
            ) : (
              profiles.map((p) => (
                <tr key={p.user_id} className="border-b border-stone-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">{p.full_name}</p>
                    <p className="text-xs text-stone-500">
                      {p.work_email}
                      {p.firm ? ` · ${p.firm}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 capitalize text-stone-700">
                    {p.stage.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    {p.terms_accepted_at ? "Accepted" : "Pending"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                        p.access_status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.access_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <InvestorActions
                      userId={p.user_id}
                      revoked={p.access_status === "revoked"}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </WorkspaceShell>
  );
}
