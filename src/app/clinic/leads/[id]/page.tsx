"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

type Detail = {
  assignmentId: string;
  assignmentStatus: string;
  explanation: string | null;
  clinicNotes: string | null;
  deliveredAt: string;
  clinicId: string;
  lead: Record<string, unknown> | null;
};

export default function ClinicLeadDetailPage() {
  const params = useParams<{ id: string }>();
  const { loading: sessionLoading, authHeaders, contextLabel } = useClinicPortalSession({ requireActive: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      if (!authHeaders) return;
      const res = await fetch(`/api/clinic/leads/${params.id}`, { headers: authHeaders });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(payload.error || "Unable to load lead.");
        setLoading(false);
        return;
      }
      setDetail(payload);
      setNotes(payload.clinicNotes || "");
      setLoading(false);
    }
    load();
  }, [authHeaders, params.id]);

  async function updateStatus(status: "accepted" | "declined" | "booked") {
    if (!authHeaders || !detail) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/clinic/leads/${detail.assignmentId}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status, clinicNotes: notes }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Update failed");
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              assignmentStatus: payload.assignment?.status ?? status,
              clinicNotes: payload.assignment?.clinic_notes ?? notes,
            }
          : prev,
      );
      toast.success(`Marked as ${status}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update");
    } finally {
      setSaving(false);
    }
  }

  const lead = detail?.lead;

  return (
    <ClinicPortalShell active="leads" contextLabel={contextLabel}>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clinic/leads">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to inbox
          </Link>
        </Button>

        {sessionLoading || loading || !detail || !lead ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading lead...
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                {String(detail.assignmentStatus)}
              </p>
              <h1 className="mt-1 text-2xl font-semibold">
                {String(lead.first_name || "")} {String(lead.last_name || "")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Delivered {new Date(detail.deliveredAt).toLocaleString()}
              </p>
            </div>

            <section className="grid gap-3 rounded-2xl border p-5 sm:grid-cols-2">
              {[
                ["Email", lead.email],
                ["Phone", lead.phone],
                ["Location", [lead.city, lead.state].filter(Boolean).join(", ")],
                ["Treatment interest", lead.treatment_interest],
                ["Preferred contact", lead.preferred_contact],
                ["Best time", lead.best_time],
                ["Insurance", lead.insurance_preference],
                ["Telehealth", lead.telehealth_preference],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label as string}</p>
                  <p className="mt-0.5 text-sm font-medium">{value ? String(value) : "—"}</p>
                </div>
              ))}
            </section>

            {(lead.symptoms || lead.concerns || lead.assessment_payload) && (
              <section className="space-y-3 rounded-2xl border p-5">
                <h2 className="text-sm font-semibold">Assessment / intake details</h2>
                {lead.symptoms ? <p className="text-sm whitespace-pre-wrap">{String(lead.symptoms)}</p> : null}
                {lead.concerns ? <p className="text-sm whitespace-pre-wrap">{String(lead.concerns)}</p> : null}
                {lead.assessment_payload && typeof lead.assessment_payload === "object" ? (
                  <pre className="overflow-x-auto rounded-xl bg-muted/50 p-3 text-xs">
                    {JSON.stringify(lead.assessment_payload, null, 2)}
                  </pre>
                ) : null}
              </section>
            )}

            {detail.explanation ? (
              <section className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4 text-sm text-teal-950">
                <strong>Why this clinic:</strong> {detail.explanation}
              </section>
            ) : null}

            <section className="space-y-3 rounded-2xl border p-5">
              <h2 className="text-sm font-semibold">Clinic notes</h2>
              <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                <Button disabled={saving} className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => updateStatus("accepted")}>
                  Accept
                </Button>
                <Button disabled={saving} variant="outline" onClick={() => updateStatus("booked")}>
                  Mark booked
                </Button>
                <Button disabled={saving} variant="outline" className="text-rose-700" onClick={() => updateStatus("declined")}>
                  Decline
                </Button>
              </div>
            </section>
          </>
        )}
      </div>
    </ClinicPortalShell>
  );
}
