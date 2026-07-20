"use client";

import { useEffect, useState } from "react";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { toast } from "sonner";
import { Bell, Loader2 } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

export default function ClinicMessagesPage() {
  const { loading, status, authHeaders, contextLabel } = useClinicPortalSession({ requireActive: true });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!authHeaders) return;
      setMessagesLoading(true);
      try {
        const qs = status?.organization?.id ? `?organizationId=${status.organization.id}` : "";
        const res = await fetch(`/api/clinic/notifications${qs}`, { headers: authHeaders });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Unable to load messages");
        setNotifications(payload.notifications ?? []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load messages");
      } finally {
        setMessagesLoading(false);
      }
    }
    if (authHeaders) load();
  }, [authHeaders, status?.organization?.id]);

  return (
    <ClinicPortalShell active="messages" contextLabel={contextLabel}>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Bell className="h-5 w-5 text-teal-700" /> Messages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Portal notifications for your clinic organization.
          </p>
        </div>

        {loading || messagesLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading messages...
          </div>
        ) : !notifications.length ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No messages yet.
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-2xl border p-4 ${n.read_at ? "opacity-80" : "border-teal-100 bg-teal-50/30"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{n.title}</p>
                  <span className="text-[10px] uppercase text-muted-foreground">{n.type}</span>
                </div>
                {n.body ? <p className="mt-1 text-sm text-muted-foreground">{n.body}</p> : null}
                <p className="mt-2 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClinicPortalShell>
  );
}
