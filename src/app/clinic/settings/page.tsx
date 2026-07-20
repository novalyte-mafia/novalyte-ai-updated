"use client";

import { useState } from "react";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock, LogOut, Settings } from "lucide-react";

const NOTIF_PREFS_KEY = "clinic-portal:notification-prefs";

export default function ClinicSettingsPage() {
  const { loading, contextLabel } = useClinicPortalSession({ requireActive: true });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [emailLeads, setEmailLeads] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const raw = localStorage.getItem(NOTIF_PREFS_KEY);
      return raw ? JSON.parse(raw).emailLeads !== false : true;
    } catch {
      return true;
    }
  });
  const [emailTeam, setEmailTeam] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const raw = localStorage.getItem(NOTIF_PREFS_KEY);
      return raw ? JSON.parse(raw).emailTeam !== false : true;
    } catch {
      return true;
    }
  });

  function saveNotifPrefs(next: { emailLeads: boolean; emailTeam: boolean }) {
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(next));
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      toast.error("Password must be at least 8 characters and include a letter and a number.");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await getSupabaseClient().auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password changed successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to change password.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await getSupabaseClient().auth.signOut();
      toast.success("Signed out.");
      window.location.assign("/clinic/sign-in");
    } catch {
      toast.error("Unable to sign out.");
      setSigningOut(false);
    }
  }

  return (
    <ClinicPortalShell active="settings" contextLabel={contextLabel}>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Settings className="h-5 w-5 text-teal-700" /> Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Account security and notification preferences.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <>
            <section className="space-y-4 rounded-2xl border p-5">
              <h2 className="flex items-center gap-2 font-semibold">
                <Lock className="h-4 w-4" /> Change password
              </h2>
              <form onSubmit={handleChangePassword} className="grid gap-3 sm:max-w-md">
                <div className="grid gap-1.5">
                  <Label>New password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Confirm password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="w-fit bg-teal-600 text-white hover:bg-teal-700"
                >
                  {changingPassword ? "Updating..." : "Update password"}
                </Button>
              </form>
            </section>

            <section className="space-y-4 rounded-2xl border p-5">
              <h2 className="font-semibold">Notification preferences</h2>
              <p className="text-xs text-muted-foreground">
                Stored locally until a server-side preferences API is available.
              </p>
              <label className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Email me about new leads</span>
                <Switch
                  checked={emailLeads}
                  onCheckedChange={(checked) => {
                    setEmailLeads(checked);
                    saveNotifPrefs({ emailLeads: checked, emailTeam });
                  }}
                />
              </label>
              <label className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Email me about team changes</span>
                <Switch
                  checked={emailTeam}
                  onCheckedChange={(checked) => {
                    setEmailTeam(checked);
                    saveNotifPrefs({ emailLeads, emailTeam: checked });
                  }}
                />
              </label>
            </section>

            <section className="rounded-2xl border p-5">
              <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {signingOut ? "Signing out..." : "Sign out"}
              </Button>
            </section>
          </>
        )}
      </div>
    </ClinicPortalShell>
  );
}
