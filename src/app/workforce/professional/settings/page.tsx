"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Logo } from "@/components/site/logo";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { toast } from "sonner";
import { Lock, Mail, Loader2, ArrowLeft, ShieldCheck, LogOut, Check } from "lucide-react";
import { fetchProfessionalStatus } from "@/lib/professional-client";

export default function ProfessionalSettings() {
  const supabaseClient = getSupabaseClient();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Form states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Get active auth session
        const { data: { session: activeSession }, error: authErr } = await supabaseClient.auth.getSession();
        
        if (authErr || !activeSession) {
          window.location.href = "/workforce/professional/sign-in";
          return;
        }

        setSession(activeSession);

        const status = await fetchProfessionalStatus(activeSession.access_token);
        if (status.status !== "pending_review" && status.status !== "approved") {
          window.location.replace(status.redirectTo);
          return;
        }

        // Fetch corresponding profile
        const { data: prof, error: profileErr } = await supabaseClient
          .from("workforce_professional_profiles")
          .select("*")
          .eq("userId", activeSession.user.id)
          .single();

        if (profileErr || !prof) {
          toast.error("Professional profile not found.");
          window.location.href = "/workforce/professional";
          return;
        }

        setProfile(prof);
      } catch (err) {
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleToggleVisibility(checked: boolean) {
    if (!profile) return;
    setSavingVisibility(true);
    const newStatus = checked ? "discoverable" : "private";

    try {
      const { error } = await supabaseClient
        .from("workforce_professional_profiles")
        .update({ visibility_status: newStatus })
        .eq("id", profile.id);

      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, visibility_status: newStatus }));
      toast.success(`Profile visibility set to ${newStatus === "discoverable" ? "discoverable" : "private"}.`);
    } catch (err) {
      toast.error("Failed to update visibility status.");
    } finally {
      setSavingVisibility(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !confirmPassword) return;

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
      const { error } = await supabaseClient.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message || "Failed to change password.");
      } else {
        toast.success("Password changed successfully.");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleSignOut() {
    try {
      await supabaseClient.auth.signOut();
      toast.success("Signed out successfully.");
      window.location.href = "/?view=workforce";
    } catch (err) {
      toast.error("Error signing out.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header onGetStarted={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm font-medium text-muted-foreground">Loading preferences...</p>
        </div>
        <Footer onNewsletter={async () => {}} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => {}} />

      <main className="flex-1 max-w-4xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your credentials, preferences, and profile settings.</p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = "/workforce/professional/dashboard"} className="flex items-center gap-1.5 font-semibold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Button>
        </div>

        <div className="space-y-6">
          {/* Card: Profile visibility */}
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-premium-xs">
            <h2 className="text-lg font-bold text-foreground mb-4">Profile Visibility</h2>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {profile?.visibility_status === "discoverable" ? "Discoverable Profile" : "Private Profile"}
                </p>
                <p className="text-xs text-muted-foreground max-w-xl">
                  When active, verified clinics can discover your license types, history, and request clinical placement matches. When inactive, you will not appear in employer search results.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {savingVisibility && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                <Switch
                  checked={profile?.visibility_status === "discoverable"}
                  onCheckedChange={handleToggleVisibility}
                  disabled={savingVisibility}
                />
              </div>
            </div>
          </div>

          {/* Card: Security */}
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-premium-xs">
            <h2 className="text-lg font-bold text-foreground mb-4">Security settings</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={session?.user?.email || ""}
                      disabled
                      className="pl-10 bg-neutral-50/50 border-neutral-200 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">To update your registered email address, please contact support.</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-white border-neutral-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-white border-neutral-200"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold w-full"
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Card: Danger Zone */}
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-premium-xs">
            <h2 className="text-lg font-bold text-rose-800 mb-2">Danger Zone</h2>
            <p className="text-xs text-rose-700/80 mb-4 max-w-xl">
              Logging out of your account will securely end your session. To request account deletion or data removal under privacy policies, contact data privacy.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer onNewsletter={async () => {}} />
    </div>
  );
}
