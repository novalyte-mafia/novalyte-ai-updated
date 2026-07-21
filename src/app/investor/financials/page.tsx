import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { SectionHeading } from "@/components/investor/section";
import { guardApprovedInvestor } from "@/lib/investor/guard";
import { logInvestorEvent } from "@/lib/investor/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Financials", robots: { index: false } };

type Scenario = {
  id: string;
  name: string;
  scenario_type: string;
  assumptions_markdown: string;
};

export default async function FinancialsPage() {
  const { user, profile, isFounder } = await guardApprovedInvestor();

  await logInvestorEvent({
    userId: user.id,
    eventType: "financials_viewed",
    section: "financials",
  });

  const { data } = await getSupabaseAdmin()
    .from("investor_financial_scenarios")
    .select("id, name, scenario_type, assumptions_markdown")
    .eq("status", "published")
    .order("scenario_type", { ascending: true });

  const scenarios = (data as Scenario[] | null) ?? [];
  const displayName = (profile.full_name as string) || user.email || undefined;

  return (
    <WorkspaceShell isFounder={isFounder} displayName={displayName}>
      <SectionHeading
        eyebrow="Financials"
        title="Financial scenarios"
        description="Financials render only from founder-published scenarios. No figures are invented or seeded. Every scenario is a projection, not a guarantee."
      />

      {scenarios.length > 0 ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium capitalize text-sky-900">
                {scenario.scenario_type}
              </span>
              <h2 className="mt-3 text-base font-semibold text-stone-900">
                {scenario.name}
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {scenario.assumptions_markdown || "Assumptions to be provided."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-stone-800">
            Financial model pending publication
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            The financial model — revenue scenarios, assumptions, and projections
            — is prepared and shared directly during investor conversations. It
            will appear here once published. Reach out to discuss current
            assumptions.
          </p>
        </div>
      )}
    </WorkspaceShell>
  );
}
