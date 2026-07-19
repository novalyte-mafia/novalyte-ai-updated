"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { toast } from "sonner";
import { Building2, Loader2, Lock, Mail, ArrowRight } from "lucide-react";

export default function EmployerSignIn() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.location.replace("/workforce/employer");
      }
    }
    checkSession();
  }, [supabase]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in.");
      window.location.replace("/workforce/employer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => {}} />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-8 bg-white border border-neutral-200/80 p-8 rounded-3xl shadow-premium-md">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-50/50">
              <Building2 className="h-6 w-6 text-emerald-700" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">Employer Sign In</h2>
            <p className="mt-1 text-xs text-muted-foreground text-center">
              Access your organization hiring dashboard
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSignIn}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            Need an organization account?{" "}
            <a href="/?view=employer-onboarding" className="font-semibold text-emerald-700 hover:underline">
              Start employer onboarding
            </a>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Logo size="sm" showWord={false} />
              <span>Novalyte Workforce</span>
            </div>
          </div>
        </div>
      </main>
      <Footer onNewsletter={async () => {}} />
    </div>
  );
}
