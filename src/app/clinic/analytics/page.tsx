"use client";

import Link from "next/link";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { LineChart, Loader2 } from "lucide-react";

export default function ClinicAnalyticsPage() {
  const { loading, status, contextLabel } = useClinicPortalSession({ requireActive: true });

  const unreadLeads = status?.unreadLeadCount ?? 0;
  const hasLeadMetrics = typeof status?.unreadLeadCount === "number";

  return (
    <ClinicPortalShell active="analytics" contextLabel={contextLabel}>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <LineChart className="h-5 w-5 text-teal-700" /> Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real metrics only — no placeholder numbers.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : hasLeadMetrics ? (
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Unread / pending leads
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">{unreadLeads}</p>
              <Link href="/clinic/leads" className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
                View lead inbox →
              </Link>
            </div>
            <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
              Directory views, conversion rates, and marketplace metrics are not available yet. Metrics collecting /
              unavailable.
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Metrics collecting / unavailable. Lead assignment counts will appear here once your clinic receives
            opportunities.
          </div>
        )}
      </div>
    </ClinicPortalShell>
  );
}
