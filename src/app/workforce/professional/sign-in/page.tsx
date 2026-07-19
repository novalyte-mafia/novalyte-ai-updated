"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { toast } from "sonner";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { captureAnalyticsEvent, identifyAnalyticsUser } from "@/lib/analytics-client";

export default function ProfessionalSignIn() {
  const supabaseClient = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Returning users always pass through the centralized status gateway.
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabaseClient.auth.getSession();
      if (data?.session) {
        window.location.replace("/workforce/professional");
      }
    }
    checkSession();
  }, []);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to sign in. Please verify your credentials.");
      } else {
        if (data.user) {
          identifyAnalyticsUser(data.user.id, { role: "professional" });
          captureAnalyticsEvent("professional_signed_in");
        }
        toast.success("Welcome back! Checking your profile status...");
        window.location.assign("/workforce/professional");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => {}} />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50/20 via-background to-background">
        <div className="w-full max-w-md space-y-8 bg-white border border-neutral-200/80 p-8 rounded-3xl shadow-premium-md">
          <div className="flex flex-col items-center">
            {/* Round animated logo icon container */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal-500/20 bg-teal-50/50 shadow-premium-sm">
              <Logo size="md" showWord={false} animated />
            </div>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-foreground">
              Professional Sign In
            </h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Access your workforce dashboard and profile
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white border-neutral-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/workforce/professional/forgot-password"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white border-neutral-200"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-neutral-100">
            <span className="text-xs text-muted-foreground">
              Don't have a profile yet?{" "}
              <a
                href="/workforce/professional/sign-up"
                className="font-bold text-teal-600 hover:text-teal-700 hover:underline"
              >
                Sign up
              </a>
            </span>
          </div>
        </div>
      </main>

      <Footer onNewsletter={async () => {}} />
    </div>
  );
}
