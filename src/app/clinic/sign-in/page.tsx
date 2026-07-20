"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { toast } from "sonner";
import { Building2, Loader2, Lock, Mail, ArrowRight } from "lucide-react";

export default function ClinicPortalSignIn() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace("/clinic");
    });
  }, [supabase]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in.");
      window.location.replace("/clinic");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo size="sm" />
          <a href="https://novalyte.io" className="text-sm font-medium text-teal-700 hover:underline">
            Back to Novalyte
          </a>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-premium-md">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal-500/20 bg-teal-50/50">
              <Building2 className="h-6 w-6 text-teal-700" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Clinic Portal</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Leads, directory profile, and hiring — for retained Novalyte clinics
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSignIn}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="border-t pt-4 text-center text-xs text-muted-foreground">
            <a href="/clinic/forgot-password" className="font-semibold text-teal-700 hover:underline">
              Forgot password?
            </a>
            {" · "}
            Need access after retaining Novalyte?{" "}
            <a href="/clinic/onboarding" className="font-semibold text-teal-700 hover:underline">
              Start clinic onboarding
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
