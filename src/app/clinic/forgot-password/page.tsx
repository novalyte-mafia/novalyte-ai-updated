"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { toast } from "sonner";
import { Mail, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

export default function ClinicForgotPasswordPage() {
  const supabaseClient = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/clinic/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset link. Please try again.");
      } else {
        toast.success("Password reset email sent! Please check your inbox.");
        setEmail("");
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
              Forgot Password
            </h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Enter your email to receive a password reset link
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleResetRequest}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Sending request...
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="border-t border-neutral-100 pt-2 text-center">
            <Link
              href="/clinic/sign-in"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-teal-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
