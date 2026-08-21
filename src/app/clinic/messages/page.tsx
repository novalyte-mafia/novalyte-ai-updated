"use client";

import { useEffect, useState } from "react";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { toast } from "sonner";
import { Bell, Loader2 } from "lucide-react";
import { MESSAGING_ARCHITECTURE } from "@/lib/clinic/messaging-architecture";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

export default function ClinicMessagesPage() {
  const { loading, status, authHeaders, contextLabel, allowedNavKeys } = useClinicPortalSession({
    requireActive: true,
  });
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
    <ClinicPortalShell active="messages" contextLabel={contextLabel} allowedNavKeys={allowedNavKeys}>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Bell className="h-5 w-5 text-teal-700" /> Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            In-app alerts for your clinic. Full SMS/email inbox is architecture-only for now.
          </p>
        </div>

        <section className="rounded-2xl border p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Messaging channels (v{MESSAGING_ARCHITECTURE.version})</p>
          <ul className="mt-2 space-y-1">
            <li>In-app: {MESSAGING_ARCHITECTURE.channels.in_app.status}</li>
            <li>
              Email: {MESSAGING_ARCHITECTURE.channels.email.status} via{" "}
              {MESSAGING_ARCHITECTURE.channels.email.provider}
            </li>
            <li>SMS: {MESSAGING_ARCHITECTURE.channels.sms.status}</li>
          </ul>
        </section>

        {loading || messagesLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading messages...
          </div>
        ) : !notifications.length ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No messages yet. New lead deliveries will notify here and by email when Resend is configured.
          </div>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`rounded-2xl border px-4 py-3 text-sm ${n.read_at ? "opacity-70" : "border-teal-100 bg-teal-50/30"}`}
              >
                <p className="font-medium">{n.title}</p>
                {n.body ? <p className="mt-1 text-muted-foreground">{n.body}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ClinicPortalShell>
  );
}
