"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

type Note = { id: string; body: string; created_at: string };
type Task = { id: string; title: string; status: string; due_at: string | null };

export default function ClinicLeadDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    loading: sessionLoading,
    authHeaders,
    contextLabel,
    allowedNavKeys,
  } = useClinicPortalSession({ requireActive: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [notes, setNotes] = useState("");
  const [thread, setThread] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");

  async function reloadExtras() {
    if (!authHeaders) return;
    const [notesRes, tasksRes] = await Promise.all([
      fetch(`/api/clinic/notes?assignmentId=${params.id}`, { headers: authHeaders }),
      fetch(`/api/clinic/tasks?assignmentId=${params.id}&status=all`, { headers: authHeaders }),
    ]);
    const notesPayload = await notesRes.json().catch(() => ({}));
    const tasksPayload = await tasksRes.json().catch(() => ({}));
    if (notesRes.ok) setThread(notesPayload.notes ?? []);
    if (tasksRes.ok) setTasks(tasksPayload.tasks ?? []);
  }

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
      await reloadExtras();
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeaders, params.id]);

  async function updateStatus(status: "accepted" | "contacted" | "declined" | "booked") {
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

  async function addNote() {
    if (!authHeaders || !noteDraft.trim()) return;
    const res = await fetch("/api/clinic/notes", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ assignmentId: params.id, body: noteDraft.trim() }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(payload.error || "Unable to add note.");
      return;
    }
    setNoteDraft("");
    await reloadExtras();
    toast.success("Note added.");
  }

  async function addTask() {
    if (!authHeaders || !taskTitle.trim()) return;
    const res = await fetch("/api/clinic/tasks", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        assignmentId: params.id,
        title: taskTitle.trim(),
        dueAt: taskDue ? new Date(taskDue).toISOString() : null,
      }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(payload.error || "Unable to create task.");
      return;
    }
    setTaskTitle("");
    setTaskDue("");
    await reloadExtras();
    toast.success("Follow-up task created.");
  }

  async function completeTask(id: string) {
    if (!authHeaders) return;
    await fetch("/api/clinic/tasks", {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ id, status: "done" }),
    });
    await reloadExtras();
  }

  const lead = detail?.lead;

  return (
    <ClinicPortalShell active="leads" contextLabel={contextLabel} allowedNavKeys={allowedNavKeys}>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clinic/leads">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to pipeline
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
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {label as string}
                  </p>
                  <p className="mt-0.5 text-sm font-medium">{value ? String(value) : "—"}</p>
                </div>
              ))}
            </section>

            {(lead.symptoms || lead.concerns || lead.assessment_payload) && (
              <section className="space-y-3 rounded-2xl border p-5">
                <h2 className="text-sm font-semibold">Assessment / intake details</h2>
                {lead.symptoms ? (
                  <p className="whitespace-pre-wrap text-sm">{String(lead.symptoms)}</p>
                ) : null}
                {lead.concerns ? (
                  <p className="whitespace-pre-wrap text-sm">{String(lead.concerns)}</p>
                ) : null}
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
              <h2 className="text-sm font-semibold">Pipeline status</h2>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Shared clinic notes on assignment..." />
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={saving}
                  className="bg-teal-600 text-white hover:bg-teal-700"
                  onClick={() => updateStatus("accepted")}
                >
                  Accept
                </Button>
                <Button disabled={saving} variant="outline" onClick={() => updateStatus("contacted")}>
                  Contacted
                </Button>
                <Button disabled={saving} variant="outline" onClick={() => updateStatus("booked")}>
                  Mark booked
                </Button>
                <Button disabled={saving} variant="outline" onClick={() => updateStatus("declined")}>
                  Decline
                </Button>
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border p-5">
              <h2 className="text-sm font-semibold">Notes timeline</h2>
              <Textarea
                rows={3}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Add an internal note..."
              />
              <Button size="sm" onClick={addNote}>
                Add note
              </Button>
              <ul className="space-y-2">
                {thread.map((n) => (
                  <li key={n.id} className="rounded-xl bg-muted/40 px-3 py-2 text-sm">
                    <p className="whitespace-pre-wrap">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
                {!thread.length ? (
                  <li className="text-sm text-muted-foreground">No notes yet.</li>
                ) : null}
              </ul>
            </section>

            <section className="space-y-3 rounded-2xl border p-5">
              <h2 className="text-sm font-semibold">Follow-up tasks</h2>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
                <Input type="datetime-local" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
                <Button size="sm" onClick={addTask}>
                  Add task
                </Button>
              </div>
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <p className={t.status === "done" ? "line-through text-muted-foreground" : ""}>
                        {t.title}
                      </p>
                      {t.due_at ? (
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(t.due_at).toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                    {t.status === "open" ? (
                      <Button size="sm" variant="outline" onClick={() => completeTask(t.id)}>
                        Done
                      </Button>
                    ) : (
                      <span className="text-xs capitalize text-muted-foreground">{t.status}</span>
                    )}
                  </li>
                ))}
                {!tasks.length ? (
                  <li className="text-sm text-muted-foreground">No tasks yet.</li>
                ) : null}
              </ul>
            </section>

            <section className="space-y-3 rounded-2xl border p-5">
              <h2 className="text-sm font-semibold">AI assist (informational)</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (!authHeaders) return;
                  const res = await fetch("/api/clinic/ai-assist", {
                    method: "POST",
                    headers: authHeaders,
                    body: JSON.stringify({ assignmentId: params.id, mode: "lead_summary" }),
                  });
                  const payload = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    toast.error(payload.error || "Assist unavailable.");
                    return;
                  }
                  toast.message(payload.summary, { description: payload.disclaimer });
                }}
              >
                Summarize lead
              </Button>
            </section>

            <p className="text-center text-sm">
              <Link href={`/clinic/patients?assignmentId=${detail.assignmentId}`} className="text-teal-700 hover:underline">
                Open in Patient Center →
              </Link>
            </p>
          </>
        )}
      </div>
    </ClinicPortalShell>
  );
}
