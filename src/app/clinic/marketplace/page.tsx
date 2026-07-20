"use client";

import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { PUBLIC_SITE_URL } from "@/lib/clinic-portal";
import { ExternalLink, Store } from "lucide-react";

export default function ClinicMarketplacePage() {
  const { contextLabel } = useClinicPortalSession({ requireActive: true });
  const marketplaceUrl = `${PUBLIC_SITE_URL}/marketplace`;

  return (
    <ClinicPortalShell active="marketplace" contextLabel={contextLabel}>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Store className="h-5 w-5 text-teal-700" /> Marketplace
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The Novalyte catalog is shared across the public site and clinic portal. Browse supplies and equipment on
            the public marketplace — orders will use the same account once in-portal checkout ships.
          </p>
        </div>

        <section className="space-y-4 rounded-2xl border p-6">
          <p className="text-sm text-muted-foreground">
            Cross-host iframe sign-in isn&apos;t supported yet, so we link you to the public catalog while keeping
            your portal session here.
          </p>
          <Button className="bg-teal-600 text-white hover:bg-teal-700" asChild>
            <a href={marketplaceUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Novalyte Marketplace
            </a>
          </Button>
        </section>
      </div>
    </ClinicPortalShell>
  );
}
