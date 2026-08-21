"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { Loader2, Users } from "lucide-react";

type PatientRow = {
  assignmentId: string;
  status: string;
  deliveredAt: string;
  patient: {
    firstName: string;
    lastName: string;
    treatmentInterest: string | null;
    interestsSummary: string;
    assessmentHighlights: Record<string, unknown> | null;
    disclaimer: string;
    city: string | null;
    state: string | null;
  } | null;
};

export default function ClinicPatientsClient() {
  const search = useSearchParams();
  const assignmentId = search.get("assignmentId");
  const { authHeaders, contextLabel, allowedNavKeys, loading: sessionLoading } =
    useClinicPortalSession({ requireActive: true });
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [followUpsDue, setFollowUpsDue] = useState(0);
  const [upcoming, setUpcoming] = useState(0);

  useEffect(() => {
    async function load() {
      if (!authHeaders) return;
      setLoading(true);
      const qs = assignmentId ? `?assignmentId=${encodeURIComponent(assignmentId)}` : "";
      const res = await fetch(`/api/clinic/patients${qs}`, { headers: authHeaders });
      const payload = await res.json().catch(() => ({}));
      if (res.ok) {
        setPatients(payload.patients ?? []);
        setFollowUpsDue(payload.followUpsDue ?? 0);
        setUpcoming(payload.upcomingAppointments ?? 0);
      }
      setLoading(false);
    }
    load();
  }, [authHeaders, assignmentId]);

  return (
    <ClinicPortalShell active="patients" contextLabel={contextLabel} allowedNavKeys={allowedNavKeys}>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Users className="h-5 w-5 text-teal-700" /> Patient Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lifecycle beyond the lead row — assessment summaries for follow-up only, not clinical decisions.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Follow-ups due
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{followUpsDue}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Upcoming appointments
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{upcoming}</p>
          </div>
        </div>

        {sessionLoading || loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading patients...
          </div>
        ) : !patients.length ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No patients yet. Delivered leads appear here with assessment interest summaries.
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((row) => (
              <div key={row.assignmentId} className="rounded-2xl border p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {row.patient?.firstName} {row.patient?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {row.patient?.interestsSummary || "Patient opportunity"}
                      {[row.patient?.city, row.patient?.state].filter(Boolean).length
                        ? ` · ${[row.patient?.city, row.patient?.state].filter(Boolean).join(", ")}`
                        : ""}
                    </p>
                    <p className="mt-1 text-xs capitalize text-teal-800">{row.status}</p>
                  </div>
                  <Link
                    href={`/clinic/leads/${row.assignmentId}`}
                    className="text-sm font-medium text-teal-700 hover:underline"
                  >
                    Open lead →
                  </Link>
                </div>
                {row.patient?.assessmentHighlights ? (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-muted/40 p-3 text-xs">
                    {JSON.stringify(row.patient.assessmentHighlights, null, 2)}
                  </pre>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">{row.patient?.disclaimer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClinicPortalShell>
  );
}
