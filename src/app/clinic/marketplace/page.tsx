"use client";

import { useEffect, useState } from "react";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { toast } from "sonner";
import { Loader2, Store } from "lucide-react";

type Sku = {
  slug: string;
  headline: string;
  summary: string;
  guidePrice: string;
  leadTime: string;
  audience: string;
};

type Order = {
  id: string;
  sku_slug: string;
  quantity: number;
  status: string;
  created_at: string;
};

export default function ClinicMarketplacePage() {
  const { authHeaders, contextLabel, allowedNavKeys, loading: sessionLoading } =
    useClinicPortalSession({ requireActive: true });
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<Sku[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  async function load() {
    if (!authHeaders) return;
    setLoading(true);
    const res = await fetch("/api/clinic/marketplace", { headers: authHeaders });
    const payload = await res.json().catch(() => ({}));
    if (res.ok) {
      setCatalog(payload.catalog ?? []);
      setOrders(payload.orders ?? []);
    } else {
      toast.error(payload.error || "Unable to load marketplace.");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeaders]);

  async function requestQuote(slug: string) {
    if (!authHeaders) return;
    const res = await fetch("/api/clinic/marketplace", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ skuSlug: slug, quantity: 1 }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(payload.error || "Unable to request quote.");
      return;
    }
    toast.success("Quote requested.");
    await load();
  }

  return (
    <ClinicPortalShell
      active="marketplace"
      contextLabel={contextLabel}
      allowedNavKeys={allowedNavKeys}
    >
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Store className="h-5 w-5 text-teal-700" /> Marketplace
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse featured clinic supplies and request quotes without leaving the portal.
          </p>
        </div>

        {sessionLoading || loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading catalog...
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {catalog.map((sku) => (
                <article key={sku.slug} className="rounded-2xl border p-5">
                  <h2 className="text-base font-semibold">{sku.headline}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{sku.summary}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {sku.guidePrice} · {sku.leadTime}
                  </p>
                  <p className="mt-1 text-xs text-teal-800">{sku.audience}</p>
                  <Button
                    className="mt-4 bg-teal-600 text-white hover:bg-teal-700"
                    size="sm"
                    onClick={() => requestQuote(sku.slug)}
                  >
                    Request quote
                  </Button>
                </article>
              ))}
            </div>

            <section className="rounded-2xl border p-5">
              <h2 className="text-sm font-semibold">Your quote requests / orders</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {orders.map((o) => (
                  <li key={o.id} className="flex justify-between gap-3 border-b py-2 last:border-0">
                    <span>
                      {o.sku_slug} × {o.quantity}
                    </span>
                    <span className="capitalize text-muted-foreground">{o.status}</span>
                  </li>
                ))}
                {!orders.length ? (
                  <li className="text-muted-foreground">No quote requests yet.</li>
                ) : null}
              </ul>
            </section>
          </>
        )}
      </div>
    </ClinicPortalShell>
  );
}
