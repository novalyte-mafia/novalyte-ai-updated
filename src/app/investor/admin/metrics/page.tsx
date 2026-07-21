import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { SectionHeading } from "@/components/investor/section";
import { MetricForm } from "@/components/investor/metric-form";
import { MetricBadge } from "@/components/investor/metric-badge";
import { guardFounderAdmin } from "@/lib/investor/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { MetricStatus } from "@/lib/investor/config";

export const metadata: Metadata = { title: "Metrics", robots: { index: false } };

type MetricRow = {
  id: string;
  key: string;
  label: string;
  value_text: string | null;
  value_numeric: number | null;
  unit: string | null;
  status: MetricStatus;
  visibility: string;
};

export default async function AdminMetricsPage() {
  const founder = await guardFounderAdmin();

  const { data } = await getSupabaseAdmin()
    .from("investor_metrics")
    .select("id, key, label, value_text, value_numeric, unit, status, visibility")
    .order("last_updated_at", { ascending: false });

  const metrics = (data as MetricRow[] | null) ?? [];

  return (
    <WorkspaceShell isFounder displayName={founder.email ?? "Founder"}>
      <SectionHeading
        eyebrow="Admin"
        title="Metrics"
        description="Add or update metrics. Every metric carries an explicit status label so nothing appears as an unqualified fact."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <MetricForm />
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
            Current metrics ({metrics.length})
          </h2>
          {metrics.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-sm text-muted-foreground">
              No metrics yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {metrics.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{m.label}</p>
                    <p className="text-xs text-stone-500">
                      {m.value_text ??
                        (m.value_numeric !== null ? `${m.value_numeric}${m.unit ? ` ${m.unit}` : ""}` : "—")}{" "}
                      · {m.visibility.replace(/_/g, " ")}
                    </p>
                  </div>
                  <MetricBadge status={m.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
