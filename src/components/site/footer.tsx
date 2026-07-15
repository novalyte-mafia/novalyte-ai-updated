"use client";

import { Logo } from "@/components/site/logo";
import { navigate } from "@/lib/nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { useCookieConsent } from "@/lib/cookie-consent-store";

export function Footer({ onNewsletter }: { onNewsletter: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await onNewsletter(email);
      toast.success("You're on the list. Watch your inbox for Novalyte updates.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function openCookiePreferences() {
    useCookieConsent.getState().setShowPreferencesModal(true);
  }

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-9 sm:px-6 sm:py-10 lg:px-8">
        {/* Main Footer Content */}
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between sm:items-start">
          {/* Brand Area */}
          <div className="max-w-md space-y-4">
            <Logo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Novalyte AI is the operating system for men's health — connecting patient demand,
              verified clinics, specialized professionals, and operational services through one
              intelligent healthcare ecosystem.
            </p>
            <form onSubmit={subscribe} className="flex max-w-sm gap-2">
              <Input
                type="email"
                required
                placeholder="Work email for updates"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
                aria-label="Email for newsletter"
              />
              <Button type="submit" size="sm" className="bg-teal-600 text-white hover:bg-teal-700" disabled={loading}>
                {loading ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>

          {/* Legal Section */}
          <div className="shrink-0">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Legal</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <button
                  onClick={() => navigate("privacy")}
                  className="text-sm text-muted-foreground transition hover:text-teal-700"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("terms")}
                  className="text-sm text-muted-foreground transition hover:text-teal-700"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={openCookiePreferences}
                  className="text-sm text-muted-foreground transition hover:text-teal-700"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Area: Disclaimer + Copyright */}
        <div className="mt-8 border-t border-border pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {/* Medical Disclaimer */}
            <div className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed max-w-3xl">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              <p>
                Novalyte AI is a healthcare technology platform and does not provide medical care,
                diagnosis, or treatment. Clinics and licensed professionals are independently
                responsible for all clinical decisions.
              </p>
            </div>
            
            {/* Copyright & Location */}
            <div className="flex flex-col gap-1 text-xs text-muted-foreground lg:text-right shrink-0">
              <p>© {new Date().getFullYear()} Novalyte AI. All rights reserved.</p>
              <p className="font-medium">Made with ❤️ in San Francisco</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
