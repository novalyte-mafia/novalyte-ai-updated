"use client";

import { useEffect, useState } from "react";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { toast } from "sonner";
import { Loader2, Trash2, UserPlus, Users } from "lucide-react";

type Member = {
  id: string;
  user_id: string;
  role: string;
  email: string | null;
  fullName: string | null;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
};

export default function ClinicTeamPage() {
  const { loading, status, authHeaders, contextLabel } = useClinicPortalSession({ requireActive: true });
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "viewer" });

  async function loadTeam() {
    if (!authHeaders) return;
    setTeamLoading(true);
    try {
      const qs = status?.organization?.id ? `?organizationId=${status.organization.id}` : "";
      const res = await fetch(`/api/clinic/team${qs}`, { headers: authHeaders });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Unable to load team");
      setMembers(payload.members ?? []);
      setInvitations(payload.invitations ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load team");
    } finally {
      setTeamLoading(false);
    }
  }

  useEffect(() => {
    if (authHeaders && status?.organization?.id) loadTeam();
  }, [authHeaders, status?.organization?.id]);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!authHeaders || !status?.organization?.id) return;
    setInviting(true);
    try {
      const res = await fetch("/api/clinic/team/invite", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          organizationId: status.organization.id,
          email: inviteForm.email,
          role: inviteForm.role,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Invite failed");
      toast.success("Invitation sent.");
      setInviteForm({ email: "", role: "viewer" });
      await loadTeam();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send invite");
    } finally {
      setInviting(false);
    }
  }

  async function revokeMember(membershipId: string) {
    if (!authHeaders) return;
    try {
      const res = await fetch(`/api/clinic/team/${membershipId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Revoke failed");
      toast.success("Member access revoked.");
      await loadTeam();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to revoke member");
    }
  }

  const canManage = status?.memberships.some((m) =>
    m.organization_id === status.organization?.id && ["owner", "admin"].includes(m.role),
  );

  return (
    <ClinicPortalShell active="team" contextLabel={contextLabel}>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Users className="h-5 w-5 text-teal-700" /> Team
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage who can access your clinic portal and workforce tools.
          </p>
        </div>

        {loading || teamLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading team...
          </div>
        ) : (
          <>
            <section className="space-y-3 rounded-2xl border p-5">
              <h2 className="font-semibold">Members</h2>
              {!members.length && <p className="text-sm text-muted-foreground">No members found.</p>}
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{member.fullName || member.email || member.user_id}</p>
                    <p className="text-xs capitalize text-muted-foreground">{member.role}</p>
                  </div>
                  {canManage && member.role !== "owner" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-700"
                      onClick={() => revokeMember(member.id)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Revoke
                    </Button>
                  ) : null}
                </div>
              ))}
            </section>

            {canManage ? (
              <section className="space-y-4 rounded-2xl border p-5">
                <h2 className="flex items-center gap-2 font-semibold">
                  <UserPlus className="h-4 w-4" /> Invite teammate
                </h2>
                <form onSubmit={sendInvite} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <div className="grid gap-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Role</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={(v) => setInviteForm({ ...inviteForm, role: v })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["admin", "recruiter", "viewer"].map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={inviting}
                      className="bg-teal-600 text-white hover:bg-teal-700"
                    >
                      {inviting ? "Sending..." : "Send invite"}
                    </Button>
                  </div>
                </form>

                {invitations.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Pending invitations
                    </p>
                    {invitations.map((inv) => (
                      <div key={inv.id} className="rounded-lg border px-3 py-2 text-sm">
                        {inv.email} · {inv.role} · expires {new Date(inv.expires_at).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}
          </>
        )}
      </div>
    </ClinicPortalShell>
  );
}
