"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { ClinicDashboardView } from "@/components/views/clinic-dashboard-view";
import { Button } from "@/components/ui/button";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ClinicT } from "@/lib/types";

export default function ClinicProfilePortalPage() {
  const supabase = getSupabaseClient();
  const { loading: sessionLoading, status, contextLabel } = useClinicPortalSession({ requireActive: true });
  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState<ClinicT | null>(null);

  useEffect(() => {
    async function load() {
      if (!status?.clinics?.length) {
        setLoading(false);
        return;
      }

      const clinicId =
        new URLSearchParams(window.location.search).get("clinicId") || status.clinics[0].id;

      const { data: row, error } = await supabase
        .from("Clinic")
        .select("*, ClinicLocation(*), ClinicProvider(*), ClinicTreatment(*)")
        .eq("id", clinicId)
        .maybeSingle();

      if (error || !row) {
        toast.error(error?.message || "Unable to load clinic profile for editing.");
        setLoading(false);
        return;
      }

      const mapped = {
        ...row,
        locations: row.ClinicLocation ?? [],
        providers: row.ClinicProvider ?? [],
        treatments: row.ClinicTreatment ?? [],
      } as ClinicT;
      setClinic(mapped);
      setLoading(false);
    }
    if (status) load();
  }, [status, supabase]);

  return (
    <ClinicPortalShell active="profile" contextLabel={clinic?.name ?? contextLabel}>
      {sessionLoading || loading ? (
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading directory profile...
        </div>
      ) : !clinic ? (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            We couldn’t load an editable clinic profile. Confirm your clinic claim is approved.
          </p>
          <Button className="mt-4" onClick={() => window.location.assign("/clinic/onboarding")}>
            Continue onboarding
          </Button>
        </div>
      ) : (
        <ClinicDashboardView clinic={clinic} allClinics={[clinic]} />
      )}
    </ClinicPortalShell>
  );
}
