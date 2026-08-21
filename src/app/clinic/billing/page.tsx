"use client";

import { useEffect, useState } from "react";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Badge } from "@/components/ui/badge";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { toast } from "sonner";
import { CreditCard, Loader2 } from "lucide-react";

type BillingPayload = {
  subscription: { plan_key: string; status: string };
  plans: Array<{ key: string; name: string; priceLabel: string; features: string[] }>;
  stripeEnabled: boolean;
  security: { twoFactor: string; auditLog: string; sso: string };
};

export default function ClinicBillingPage() {
  const { authHeaders, contextLabel, allowedNavKeys, loading: sessionLoading } =
    useClinicPortalSession({ requireActive: true });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BillingPayload | null>(null);

  useEffect(() => {
    async function load() {
      if (!authHeaders) return;
      setLoading(true);
      const res = await fetch("/api/clinic/billing", { headers: authHeaders });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(payload.error || "Unable to load billing.");
        setLoading(false);
        return;
      }
      setData(payload);
      setLoading(false);
    }
    load();
  }, [authHeaders]);

  return (
    <ClinicPortalShell active="billing" contextLabel={contextLabel} allowedNavKeys={allowedNavKeys}>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <CreditCard className="h-5 w-5 text-teal-700" /> Billing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan usage and future Stripe subscriptions for your organization.
          </p>
        </div>

        {sessionLoading || loading || !data ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading billing...
          </div>
        ) : (
          <>
            <section className="space-y-4 rounded-2xl border p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Current plan</p>
                  <p className="mt-1 text-2xl font-bold capitalize">{data.subscription.plan_key}</p>
                </div>
                <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-800">
                  {data.subscription.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Stripe checkout is {data.stripeEnabled ? "configured" : "not configured yet"} on this
                environment. Paid upgrades will attach to `clinic_subscriptions`.
              </p>
            </section>

            <div className="grid gap-4 sm:grid-cols-3">
              {data.plans.map((plan) => (
                <section key={plan.key} className="rounded-2xl border p-4">
                  <p className="font-semibold">{plan.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.priceLabel}</p>
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {plan.features.map((f) => (
                      <li key={f}>· {f}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <section className="rounded-2xl border p-5 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Security roadmap</p>
              <ul className="mt-2 space-y-1">
                <li>2FA: {data.security.twoFactor}</li>
                <li>Audit log: {data.security.auditLog}</li>
                <li>SSO: {data.security.sso}</li>
              </ul>
            </section>
          </>
        )}
      </div>
    </ClinicPortalShell>
  );
}
