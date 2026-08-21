"use client";

import { useEffect, useMemo, useState } from "react";
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

const PIPELINE = [
  { key: "all", label: "All" },
  { key: "delivered", label: "Delivered" },
  { key: "viewed", label: "Viewed" },
  { key: "accepted", label: "Accepted" },
  { key: "contacted", label: "Contacted" },
  { key: "booked", label: "Booked" },
  { key: "declined", label: "Declined" },
] as const;

export default function ClinicLeadsPage() {
  const {
    loading: sessionLoading,
    authHeaders,
    contextLabel,
    allowedNavKeys,
  } = useClinicPortalSession({ requireActive: true });
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [filter, setFilter] = useState("all");
  const [slaTasks, setSlaTasks] = useState(0);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      if (!authHeaders) return;
      setLoading(true);
      const qs = filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
      const [leadsRes, tasksRes] = await Promise.all([
        fetch(`/api/clinic/leads${qs}`, { headers: authHeaders }),
        fetch(`/api/clinic/tasks?sla=1`, { headers: authHeaders }),
      ]);
      const payload = await leadsRes.json().catch(() => ({}));
      const tasksPayload = await tasksRes.json().catch(() => ({}));
      if (!leadsRes.ok) {
        toast.error(payload.error || "Unable to load leads.");
        setLoading(false);
        return;
      }
      setLeads(payload.leads ?? []);
      setSlaTasks((tasksPayload.tasks ?? []).length);
      setSelected(new Set());
      setLoading(false);
    }
    load();
  }, [authHeaders, filter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: leads.length };
    for (const row of leads) {
      map[row.assignmentStatus] = (map[row.assignmentStatus] ?? 0) + 1;
    }
    return map;
  }, [leads]);

  async function bulkStatus(status: "accepted" | "contacted" | "declined") {
    if (!authHeaders || !selected.size) return;
    setBulkBusy(true);
    try {
      await Promise.all(
        [...selected].map((id) =>
          fetch(`/api/clinic/leads/${id}`, {
            method: "PATCH",
            headers: authHeaders,
            body: JSON.stringify({ status }),
          }),
        ),
      );
      toast.success(`Updated ${selected.size} lead(s) to ${status}.`);
      setFilter(status);
    } catch {
      toast.error("Bulk update failed.");
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <ClinicPortalShell active="leads" contextLabel={contextLabel} allowedNavKeys={allowedNavKeys}>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold">
              <Inbox className="h-5 w-5 text-teal-700" /> Lead pipeline
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Daily lead ops — delivered → viewed → accepted → contacted → booked.
              {slaTasks > 0 ? (
                <span className="ml-1 font-medium text-amber-700">
                  {slaTasks} follow-up{slaTasks === 1 ? "" : "s"} overdue.
                </span>
              ) : null}
            </p>
          </div>
          {selected.size > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={bulkBusy} onClick={() => bulkStatus("accepted")}>
                Accept selected
              </Button>
              <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulkStatus("contacted")}>
                Mark contacted
              </Button>
              <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulkStatus("declined")}>
                Decline
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {PIPELINE.map((s) => (
            <Button
              key={s.key}
              size="sm"
              variant={filter === s.key ? "default" : "outline"}
              className={filter === s.key ? "bg-teal-600 text-white hover:bg-teal-700" : undefined}
              onClick={() => setFilter(s.key)}
            >
              {s.label}
              {filter === "all" && s.key !== "all" && counts[s.key]
                ? ` (${counts[s.key]})`
                : ""}
            </Button>
          ))}
        </div>

        {sessionLoading || loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading leads...
          </div>
        ) : !leads.length ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No leads in this stage. When Novalyte verifies a patient opportunity for your clinic, it appears
            here.
          </div>
        ) : (
          <div className="space-y-2">
            {leads.map((row) => {
              const lead = row.lead;
              const unread =
                row.assignmentStatus === "delivered" || row.assignmentStatus === "pending";
              const checked = selected.has(row.assignmentId);
              return (
                <div
                  key={row.assignmentId}
                  className={cn(
                    "flex items-stretch gap-2 rounded-2xl border transition hover:border-teal-200",
                    unread && "border-amber-200 bg-amber-50/40",
                  )}
                >
                  <label className="flex items-center px-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(row.assignmentId);
                          else next.delete(row.assignmentId);
                          return next;
                        });
                      }}
                    />
                  </label>
                  <Link href={`/clinic/leads/${row.assignmentId}`} className="flex-1 px-2 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {lead?.first_name} {lead?.last_name}
                          {unread ? (
                            <span className="ml-2 text-xs font-semibold uppercase text-amber-700">
                              New
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {[lead?.treatment_interest, [lead?.city, lead?.state].filter(Boolean).join(", ")]
                            .filter(Boolean)
                            .join(" · ") || "Patient opportunity"}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p className="capitalize font-medium text-foreground">{row.assignmentStatus}</p>
                        <p>{new Date(row.deliveredAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ClinicPortalShell>
  );
}
