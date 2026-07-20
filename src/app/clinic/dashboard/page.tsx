"use client";

import Link from "next/link";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import {
  Bell,
  Briefcase,
  Building2,
  Loader2,
  Store,
  UserRound,
  Inbox,
} from "lucide-react";

export default function ClinicDashboardPage() {
  const { loading, status, contextLabel } = useClinicPortalSession({ requireActive: true });

  if (loading) {
    return (
      <ClinicPortalShell active="dashboard">
        <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading clinic portal...
        </div>
      </ClinicPortalShell>
    );
  }

  return (
    <ClinicPortalShell active="dashboard" contextLabel={contextLabel}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Clinic portal</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{contextLabel ?? "Clinic"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Patient opportunities, directory listing, and hiring — without replacing your EHR/CRM.
          </p>
        </div>

        {(status?.unreadLeadCount ?? 0) > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
            <Bell className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1 text-sm">
              <strong>{status?.unreadLeadCount} new lead{(status?.unreadLeadCount ?? 0) === 1 ? "" : "s"}</strong>{" "}
              ready in your inbox.
            </div>
            <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" asChild>
              <Link href="/clinic/leads">Open leads</Link>
            </Button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: "/clinic/leads",
              title: "Lead inbox",
              desc: "Verified patient opportunities pushed by Novalyte.",
              icon: Inbox,
            },
            {
              href: "/clinic/profile",
              title: "Directory profile",
              desc: "Edit listing, logo, locations, and treatments.",
              icon: Building2,
            },
            {
              href: "/clinic/workforce",
              title: "Workforce",
              desc: "Hire clinicians and staff from your clinic account.",
              icon: Briefcase,
            },
            {
              href: "/clinic/marketplace",
              title: "Marketplace",
              desc: "Browse clinic supplies under portal chrome.",
              icon: Store,
            },
          ].map((card) => {
            const Icon = card.icon;
            const inner = (
              <div className="rounded-2xl border bg-card p-5 shadow-premium-xs transition hover:border-teal-200">
                <Icon className="h-5 w-5 text-teal-700" />
                <h2 className="mt-3 text-base font-semibold">{card.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
              </div>
            );
            return card.external ? (
              <a key={card.title} href={card.href} target="_blank" rel="noreferrer">
                {inner}
              </a>
            ) : (
              <Link key={card.title} href={card.href}>
                {inner}
              </Link>
            );
          })}
        </div>

        <section className="rounded-2xl border p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <UserRound className="h-4 w-4 text-teal-700" /> Linked clinics
          </h2>
          <ul className="mt-3 space-y-2">
            {(status?.clinics ?? []).map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
                <span>
                  {c.name}
                  {(c.city || c.state) && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {[c.city, c.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                </span>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/clinic/profile?clinicId=${c.id}`}>Edit profile</Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ClinicPortalShell>
  );
}
