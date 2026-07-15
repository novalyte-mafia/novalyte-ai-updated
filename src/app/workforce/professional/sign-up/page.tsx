"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { toast } from "sonner";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function ProfessionalSignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabaseClient.auth.getSession();
      if (data?.session) {
        window.location.href = "/workforce/professional/dashboard";
      }
    }
    checkSession();
  }, []);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "professional", // User metadata role
          },
        },
      });

      if (error) {
        toast.error(error.message || "Failed to create account. Please try again.");
      } else {
        // Check if confirmation is required (Supabase settings)
        if (data.session) {
          toast.success("Account created successfully! Welcome to Novalyte.");
          window.location.href = "//?view=professional-onboarding";
        } else {
          toast.success("Registration successful! Please check your email for verification instructions.");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        }
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
              Professional Sign Up
            </h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Create an account to start your professional talent profile
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSignUp}>
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="•••••••• (Min. 6 characters)"
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
                  name="confirmPassword"
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
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-neutral-100">
            <span className="text-xs text-muted-foreground">
              Already have a profile?{" "}
              <a
                href="/workforce/professional/sign-in"
                className="font-bold text-teal-600 hover:text-teal-700 hover:underline"
              >
                Sign in
              </a>
            </span>
          </div>
        </div>
      </main>

      <Footer onNewsletter={async () => {}} />
    </div>
  );
}
