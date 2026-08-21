"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { toast } from "sonner";
import { Download, LineChart, Loader2, Sparkles } from "lucide-react";

type Analytics = {
  summary: { totalLeads: number; booked: number; conversionRate: number; contacted: number };
  bySource: Array<{ source: string; count: number }>;
  byInterest: Array<{ interest: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  byGeo: Array<{ state: string; count: number }>;
  trend: Array<{ date: string; count: number }>;
  campaignNote: string;
};

export default function ClinicAnalyticsPage() {
  const { authHeaders, contextLabel, allowedNavKeys, loading: sessionLoading } =
    useClinicPortalSession({ requireActive: true });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Analytics | null>(null);
  const [digest, setDigest] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!authHeaders) return;
      setLoading(true);
      const res = await fetch("/api/clinic/analytics", { headers: authHeaders });
      const payload = await res.json().catch(() => null);
      if (res.ok) setData(payload);
      else toast.error(payload?.error || "Unable to load analytics.");
      setLoading(false);
    }
    load();
  }, [authHeaders]);

  async function exportCsv() {
    if (!authHeaders) return;
    const res = await fetch("/api/clinic/analytics?format=csv", { headers: authHeaders });
    if (!res.ok) {
      toast.error("Export failed.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clinic-leads-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function weeklyDigest() {
    if (!authHeaders) return;
    const res = await fetch("/api/clinic/ai-assist", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ mode: "weekly_digest" }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(payload.error || "Unable to generate digest.");
      return;
    }
    setDigest(`${payload.summary}\n\n${payload.disclaimer}`);
  }

  const maxTrend = Math.max(1, ...(data?.trend.map((t) => t.count) ?? [1]));

  return (
    <ClinicPortalShell active="analytics" contextLabel={contextLabel} allowedNavKeys={allowedNavKeys}>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold">
              <LineChart className="h-5 w-5 text-teal-700" /> Analytics
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real lead metrics only — no vanity revenue numbers.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={weeklyDigest}>
              <Sparkles className="mr-1.5 h-4 w-4" /> Weekly digest
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-1.5 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {sessionLoading || loading || !data ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics...
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total leads", value: data.summary.totalLeads },
                { label: "Contacted+", value: data.summary.contacted },
                { label: "Booked", value: data.summary.booked },
                { label: "Book rate %", value: data.summary.conversionRate },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tabular-nums">{kpi.value}</p>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border p-5">
              <h2 className="text-sm font-semibold">Deliveries over time</h2>
              <div className="mt-4 flex h-28 items-end gap-0.5">
                {data.trend.length ? (
                  data.trend.map((point) => (
                    <div
                      key={point.date}
                      className="flex-1 rounded-t bg-teal-600/80"
                      style={{ height: `${Math.max(4, (point.count / maxTrend) * 100)}%` }}
                      title={`${point.date}: ${point.count}`}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No trend data yet.</p>
                )}
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                { title: "By source", rows: data.bySource.map((r) => [r.source, r.count] as const) },
                {
                  title: "By treatment interest",
                  rows: data.byInterest.map((r) => [r.interest, r.count] as const),
                },
                { title: "By state (approx)", rows: data.byGeo.map((r) => [r.state, r.count] as const) },
              ].map((block) => (
                <section key={block.title} className="rounded-2xl border p-5">
                  <h2 className="text-sm font-semibold">{block.title}</h2>
                  <ul className="mt-3 space-y-1 text-sm">
                    {block.rows.length ? (
                      block.rows.map(([label, count]) => (
                        <li key={label} className="flex justify-between gap-3">
                          <span className="truncate text-muted-foreground">{label}</span>
                          <span className="tabular-nums font-medium">{count}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No data</li>
                    )}
                  </ul>
                </section>
              ))}
            </div>

            {digest ? (
              <section className="rounded-2xl border border-teal-100 bg-teal-50/40 p-5 text-sm whitespace-pre-wrap">
                {digest}
              </section>
            ) : null}

            <p className="text-xs text-muted-foreground">
              {data.campaignNote}{" "}
              <Link href="/clinic/leads" className="text-teal-700 hover:underline">
                Open lead pipeline →
              </Link>
            </p>
          </>
        )}
      </div>
    </ClinicPortalShell>
  );
}
