"use client";

import { useEffect, useState } from "react";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { toast } from "sonner";
import { CalendarDays, Loader2 } from "lucide-react";

type Appointment = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  notes: string | null;
};

type Task = {
  id: string;
  title: string;
  due_at: string | null;
  status: string;
};

export default function ClinicCalendarPage() {
  const { authHeaders, contextLabel, allowedNavKeys, loading: sessionLoading } =
    useClinicPortalSession({ requireActive: true });
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");

  async function load() {
    if (!authHeaders) return;
    setLoading(true);
    const res = await fetch("/api/clinic/calendar", { headers: authHeaders });
    const payload = await res.json().catch(() => ({}));
    if (res.ok) {
      setAppointments(payload.appointments ?? []);
      setTasks(payload.tasks ?? []);
    } else {
      toast.error(payload.error || "Unable to load calendar.");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeaders]);

  async function createAppointment() {
    if (!authHeaders || !title.trim() || !startsAt) return;
    const res = await fetch("/api/clinic/calendar", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        title: title.trim(),
        startsAt: new Date(startsAt).toISOString(),
      }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(payload.error || "Unable to create appointment.");
      return;
    }
    setTitle("");
    setStartsAt("");
    toast.success("Appointment scheduled.");
    await load();
  }

  return (
    <ClinicPortalShell active="calendar" contextLabel={contextLabel} allowedNavKeys={allowedNavKeys}>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <CalendarDays className="h-5 w-5 text-teal-700" /> Calendar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Internal appointments and follow-ups. Google/Outlook sync comes later.
          </p>
        </div>

        <section className="rounded-2xl border p-5">
          <h2 className="text-sm font-semibold">Schedule appointment</h2>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
            <Button onClick={createAppointment}>Add</Button>
          </div>
        </section>

        {sessionLoading || loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading calendar...
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border p-5">
              <h2 className="text-sm font-semibold">Upcoming appointments</h2>
              <ul className="mt-3 space-y-2">
                {appointments.map((a) => (
                  <li key={a.id} className="rounded-xl border px-3 py-2 text-sm">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.starts_at).toLocaleString()} · {a.status}
                    </p>
                  </li>
                ))}
                {!appointments.length ? (
                  <li className="text-sm text-muted-foreground">No appointments in the next 30 days.</li>
                ) : null}
              </ul>
            </section>
            <section className="rounded-2xl border p-5">
              <h2 className="text-sm font-semibold">Open follow-ups</h2>
              <ul className="mt-3 space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="rounded-xl border px-3 py-2 text-sm">
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.due_at ? `Due ${new Date(t.due_at).toLocaleString()}` : "No due date"}
                    </p>
                  </li>
                ))}
                {!tasks.length ? (
                  <li className="text-sm text-muted-foreground">No open follow-ups.</li>
                ) : null}
              </ul>
            </section>
          </div>
        )}
      </div>
    </ClinicPortalShell>
  );
}
