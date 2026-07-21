import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { Section, SectionHeading } from "@/components/investor/section";
import { MetricBadge } from "@/components/investor/metric-badge";
import { StatusPill } from "@/components/investor/status-pill";
import { guardApprovedInvestor } from "@/lib/investor/guard";
import { logInvestorEvent } from "@/lib/investor/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { investorContent } from "@/lib/investor/content";
import type { MetricStatus } from "@/lib/investor/config";

export const metadata: Metadata = { title: "Traction", robots: { index: false } };

type MetricRow = {
  id: string;
  label: string;
  value_numeric: number | null;
  value_text: string | null;
  unit: string | null;
  period_label: string | null;
  source: string | null;
  status: MetricStatus;
  last_updated_at: string;
};

export default async function TractionPage() {
  const { user, profile, isFounder } = await guardApprovedInvestor();

  await logInvestorEvent({
    userId: user.id,
    eventType: "traction_viewed",
    section: "traction",
  });

  const { data } = await getSupabaseAdmin()
    .from("investor_metrics")
    .select(
      "id, label, value_numeric, value_text, unit, period_label, source, status, last_updated_at",
    )
    .in("visibility", ["public", "approved_investors"])
    .order("last_updated_at", { ascending: false });

  const metrics = (data as MetricRow[] | null) ?? [];
  const displayName = (profile.full_name as string) || user.email || undefined;

  return (
    <WorkspaceShell isFounder={isFounder} displayName={displayName}>
      <Section tone="default" className="!py-0">
        <SectionHeading
          eyebrow="Traction"
          title="Operating progress"
          description="Novalyte AI is early-stage. We report qualitative progress and only publish quantitative metrics with an explicit status label. Nothing here is audited."
        />
      </Section>

      {metrics.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-stone-600">{metric.label}</p>
                <MetricBadge status={metric.status} />
              </div>
              <p className="mt-2 text-2xl font-semibold text-stone-900">
                {metric.value_text ??
                  (metric.value_numeric !== null
                    ? `${metric.value_numeric.toLocaleString()}${metric.unit ? ` ${metric.unit}` : ""}`
                    : "—")}
              </p>
              {metric.period_label ? (
                <p className="mt-1 text-xs text-stone-500">{metric.period_label}</p>
              ) : null}
              {metric.source ? (
                <p className="mt-2 text-xs text-stone-400">Source: {metric.source}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-8">
          <p className="text-sm font-medium text-stone-800">
            Quantitative metrics are pending founder validation.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            We deliberately avoid publishing unverified numbers. Qualitative
            product progress is shown below; validated metrics will appear here as
            they are confirmed.
          </p>
        </div>
      )}

      <div className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
          Product progress
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {investorContent.productModules.map((module) => (
            <div
              key={module.key}
              className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-stone-900">{module.label}</p>
                {module.notes ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{module.notes}</p>
                ) : null}
              </div>
              <StatusPill status={module.status} />
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}
