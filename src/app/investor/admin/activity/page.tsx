import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { SectionHeading } from "@/components/investor/section";
import { guardFounderAdmin } from "@/lib/investor/admin-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Activity", robots: { index: false } };

type EventRow = {
  id: string;
  event_type: string;
  section: string | null;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export default async function AdminActivityPage() {
  const founder = await guardFounderAdmin();

  const { data } = await getSupabaseAdmin()
    .from("investor_access_events")
    .select("id, event_type, section, user_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const events = (data as EventRow[] | null) ?? [];

  return (
    <WorkspaceShell isFounder displayName={founder.email ?? "Founder"}>
      <SectionHeading
        eyebrow="Admin"
        title="Activity log"
        description="Append-only record of portal access and actions. Most recent 200 events."
      />

      <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                  No activity recorded yet.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="border-b border-stone-100">
                  <td className="px-4 py-3 font-medium capitalize text-stone-800">
                    {e.event_type.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 capitalize text-stone-600">
                    {e.section ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </WorkspaceShell>
  );
}
