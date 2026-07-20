"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { toast } from "sonner";
import { Lock, Loader2, ArrowRight } from "lucide-react";

export default function ClinicResetPasswordPage() {
  const supabaseClient = getSupabaseClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkResetSession() {
      const { data } = await supabaseClient.auth.getSession();
      if (!data?.session) {
        toast.error("Password reset link is invalid or has expired.");
      }
    }
    checkResetSession();
  }, [supabaseClient]);

  async function handleResetPassword(e: React.FormEvent) {
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

    setLoading(true);

    try {
      const { error } = await supabaseClient.auth.updateUser({ password });

      if (error) {
        toast.error(error.message || "Failed to update password. Please try again.");
      } else {
        toast.success("Password updated successfully! Redirecting to sign in...");
        setTimeout(() => {
          window.location.href = "/clinic/sign-in";
        }, 2000);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-center">
          <Logo size="sm" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-teal-50/20 via-background to-background px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-premium-md">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal-500/20 bg-teal-50/50 shadow-premium-sm">
              <Logo size="md" showWord={false} animated />
            </div>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-foreground">
              Reset Password
            </h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-1.5">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-neutral-200 bg-white pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-neutral-200 bg-white pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 w-full bg-teal-600 font-semibold text-white hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                <>
                  Update Password <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
