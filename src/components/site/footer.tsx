"use client";

import { Logo } from "@/components/site/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

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

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 md:items-end lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)_auto] lg:items-start lg:gap-8">
          <div className="max-w-xl">
            <Logo />
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Novalyte AI is a healthcare technology platform and does not provide medical care,
              diagnosis, or treatment. Clinics and licensed professionals are independently
              responsible for all clinical decisions.
            </p>
          </div>

          <form onSubmit={subscribe} className="w-full max-w-sm lg:pt-1">
            <label htmlFor="footer-newsletter-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-foreground">
              Product updates
            </label>
            <div className="flex gap-2">
              <Input
                id="footer-newsletter-email"
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
            </div>
          </form>

          <nav aria-label="Policies" className="md:col-span-2 lg:col-span-1 lg:pt-1">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-1.5">
              <li>
                <a
                  href="/privacy"
                  className="text-sm text-muted-foreground transition hover:text-teal-700"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-sm text-muted-foreground transition hover:text-teal-700"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/medical-disclaimer"
                  className="text-sm text-muted-foreground transition hover:text-teal-700"
                >
                  Medical Disclaimer
                </a>
              </li>
              <li>
                <a
                  href="/accessibility"
                  className="text-sm text-muted-foreground transition hover:text-teal-700"
                >
                  Accessibility
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground sm:text-xs lg:text-right">
          <p className="font-medium">Made with ❤️ in San Francisco</p>
        </div>
      </div>
    </footer>
  );
}
