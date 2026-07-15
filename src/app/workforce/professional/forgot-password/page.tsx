"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { toast } from "sonner";
import { Mail, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

export default function ProfessionalForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/workforce/professional/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset link. Please try again.");
      } else {
        toast.success("Password reset email sent! Please check your inbox.");
        setEmail("");
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
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Sending request...
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-neutral-100">
            <a
              href="/workforce/professional/sign-in"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-teal-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </a>
          </div>
        </div>
      </main>

      <Footer onNewsletter={async () => {}} />
    </div>
  );
}
