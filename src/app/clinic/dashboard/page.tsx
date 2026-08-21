"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  Inbox,
  Loader2,
  Store,
  Users,
} from "lucide-react";

type HomePayload = {
  kpis: {
    leadsToday: number;
    leadsMonth: number;
    unreadLeads: number;
    openJobs: number;
    teamCount: number;
    directoryStatus: string;
    pendingTasks: number;
  };
  charts: {
    trend: Array<{ date: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    bySource: Array<{ source: string; count: number }>;
  };
  activity: Array<{ id: string; kind: string; title: string; at: string; href: string }>;
  deferred: { revenueInfluenced: string; campaignRoi: string };
};

export default function ClinicDashboardPage() {
  const { loading, contextLabel, authHeaders, allowedNavKeys } = useClinicPortalSession({
    requireActive: true,
  });
  const [home, setHome] = useState<HomePayload | null>(null);
  const [homeLoading, setHomeLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!authHeaders) return;
      setHomeLoading(true);
      const res = await fetch("/api/clinic/home", { headers: authHeaders });
      const payload = await res.json().catch(() => null);
      if (res.ok) setHome(payload);
      setHomeLoading(false);
    }
    load();
  }, [authHeaders]);

  if (loading) {
    return (
      <ClinicPortalShell active="dashboard" allowedNavKeys={allowedNavKeys}>
        <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading clinic portal...
        </div>
      </ClinicPortalShell>
    );
  }

  const kpis = home?.kpis;
  const maxTrend = Math.max(1, ...(home?.charts.trend.map((t) => t.count) ?? [1]));

  return (
    <ClinicPortalShell active="dashboard" contextLabel={contextLabel} allowedNavKeys={allowedNavKeys}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Clinic home</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{contextLabel ?? "Clinic"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live lead and ops metrics for your organization — no fabricated revenue numbers.
          </p>
        </div>

        {(kpis?.unreadLeads ?? 0) > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
            <Bell className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1 text-sm">
              <strong>
                {kpis?.unreadLeads} new lead{(kpis?.unreadLeads ?? 0) === 1 ? "" : "s"}
              </strong>{" "}
              ready in your inbox.
            </div>
            <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" asChild>
              <Link href="/clinic/leads">Open leads</Link>
            </Button>
          </div>
        )}

        {homeLoading || !home ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading KPIs...
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[
                { label: "Leads today", value: kpis!.leadsToday },
                { label: "Leads this month", value: kpis!.leadsMonth },
                { label: "Unread leads", value: kpis!.unreadLeads },
                { label: "Open jobs", value: kpis!.openJobs },
                { label: "Team", value: kpis!.teamCount },
                { label: "Open tasks", value: kpis!.pendingTasks },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border bg-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tabular-nums">{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <section className="rounded-2xl border p-5 lg:col-span-2">
                <h2 className="text-sm font-semibold">Lead deliveries · last 30 days</h2>
                <div className="mt-4 flex h-32 items-end gap-1">
                  {home.charts.trend.map((point) => (
                    <div
                      key={point.date}
                      className="flex-1 rounded-t bg-teal-600/80"
                      style={{ height: `${Math.max(4, (point.count / maxTrend) * 100)}%` }}
                      title={`${point.date}: ${point.count}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Directory status: {kpis!.directoryStatus}
                </p>
              </section>

              <section className="space-y-3 rounded-2xl border p-5">
                <h2 className="text-sm font-semibold">Funnel / sources</h2>
                {(home.charts.byStatus.length ? home.charts.byStatus : [{ status: "none", count: 0 }]).map(
                  (row) => (
                    <div key={row.status} className="flex justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{row.status}</span>
                      <span className="font-medium tabular-nums">{row.count}</span>
                    </div>
                  ),
                )}
                <div className="border-t pt-3">
                  {(home.charts.bySource.length ? home.charts.bySource : [{ source: "none", count: 0 }]).map(
                    (row) => (
                      <div key={row.source} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{row.source}</span>
                        <span className="font-medium tabular-nums">{row.count}</span>
                      </div>
                    ),
                  )}
                </div>
              </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border p-5">
                <h2 className="text-sm font-semibold">Recent activity</h2>
                {!home.activity.length ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No activity yet. Lead events and notifications will show here.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {home.activity.map((item) => (
                      <li key={item.id}>
                        <Link href={item.href} className="flex items-start justify-between gap-3 text-sm hover:text-teal-800">
                          <span className="capitalize">{item.title}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {new Date(item.at).toLocaleString()}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border p-5">
                <h2 className="text-sm font-semibold">Quick actions</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    { href: "/clinic/leads", label: "View leads", icon: Inbox },
                    { href: "/clinic/profile", label: "Edit profile", icon: Building2 },
                    { href: "/clinic/workforce", label: "Post job", icon: Briefcase },
                    { href: "/clinic/directory", label: "Submit directory", icon: Store },
                    { href: "/clinic/calendar", label: "Calendar", icon: CalendarDays },
                    { href: "/clinic/patients", label: "Patients", icon: Users },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button key={action.href} variant="outline" className="justify-start" asChild>
                        <Link href={action.href}>
                          <Icon className="mr-2 h-4 w-4 text-teal-700" />
                          {action.label}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Deferred: {home.deferred.revenueInfluenced}. {home.deferred.campaignRoi}.
                </p>
              </section>
            </div>
          </>
        )}
      </div>
    </ClinicPortalShell>
  );
}
