"use client";

import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Badge } from "@/components/ui/badge";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { CreditCard } from "lucide-react";

export default function ClinicBillingPage() {
  const { contextLabel } = useClinicPortalSession({ requireActive: true });

  return (
    <ClinicPortalShell active="billing" contextLabel={contextLabel}>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <CreditCard className="h-5 w-5 text-teal-700" /> Billing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your clinic portal plan and payment settings.
          </p>
        </div>

        <section className="space-y-4 rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Current plan</p>
              <p className="mt-1 text-2xl font-bold">Free directory</p>
            </div>
            <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-800">
              Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Paid plans for advanced lead routing, analytics, and marketplace checkout will appear here when available.
            This page is read-only for now.
          </p>
        </section>
      </div>
    </ClinicPortalShell>
  );
}
