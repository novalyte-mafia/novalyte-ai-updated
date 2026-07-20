"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { toast } from "sonner";
import { Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LeadRow = {
  assignmentId: string;
  assignmentStatus: string;
  deliveredAt: string;
  clinicId: string;
  lead: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    treatment_interest: string | null;
    preferred_contact: string | null;
    best_time: string | null;
    qualification_score: number | null;
  } | null;
};

export default function ClinicLeadsPage() {
  const { loading: sessionLoading, authHeaders, contextLabel } = useClinicPortalSession({ requireActive: true });
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      if (!authHeaders) return;
      setLoading(true);
      const qs = filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
      const res = await fetch(`/api/clinic/leads${qs}`, { headers: authHeaders });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(payload.error || "Unable to load leads.");
        setLoading(false);
        return;
      }
      setLeads(payload.leads ?? []);
      setLoading(false);
    }
    load();
  }, [authHeaders, filter]);

  return (
    <ClinicPortalShell active="leads" contextLabel={contextLabel}>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold">
              <Inbox className="h-5 w-5 text-teal-700" /> Lead inbox
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified opportunities Novalyte pushes to your clinic — full assessment details included.
            </p>
          </div>
          <div className="flex gap-2">
            {["all", "delivered", "viewed", "accepted", "booked", "declined"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={filter === s ? "default" : "outline"}
                className={filter === s ? "bg-teal-600 text-white hover:bg-teal-700" : undefined}
                onClick={() => setFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {sessionLoading || loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading leads...
          </div>
        ) : !leads.length ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No leads yet. When Novalyte verifies a patient opportunity for your clinic, it appears here with an alert.
          </div>
        ) : (
          <div className="space-y-2">
            {leads.map((row) => {
              const lead = row.lead;
              const unread = row.assignmentStatus === "delivered" || row.assignmentStatus === "pending";
              return (
                <Link
                  key={row.assignmentId}
                  href={`/clinic/leads/${row.assignmentId}`}
                  className={cn(
                    "block rounded-2xl border p-4 transition hover:border-teal-200",
                    unread && "border-amber-200 bg-amber-50/40",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {lead ? `${lead.first_name} ${lead.last_name}`.trim() || "Patient" : "Patient"}
                        {unread && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                            New
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[lead?.treatment_interest, [lead?.city, lead?.state].filter(Boolean).join(", ")]
                          .filter(Boolean)
                          .join(" · ") || "Opportunity details available"}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="font-medium capitalize text-foreground">{row.assignmentStatus}</div>
                      <div>{new Date(row.deliveredAt).toLocaleString()}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ClinicPortalShell>
  );
}
