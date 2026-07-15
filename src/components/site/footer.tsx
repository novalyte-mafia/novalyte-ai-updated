"use client";

import { Logo } from "@/components/site/logo";
import { navigate, type ViewKey } from "@/lib/nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

const FOOTER_LINKS: { title: string; links: { label: string; view: ViewKey }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "For Patients", view: "patients" },
      { label: "For Clinics", view: "clinics" },
      { label: "Clinic Directory", view: "directory" },
      { label: "Workforce Hub", view: "workforce" },
      { label: "Marketplace", view: "marketplace" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", view: "about" },
      { label: "Journal", view: "journal" },
      { label: "Get Started", view: "about" },
      { label: "Contact", view: "about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Patient Guides", view: "patients" },
      { label: "Clinic Resources", view: "clinics" },
      { label: "Workforce Resources", view: "workforce" },
      { label: "Journal", view: "journal" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", view: "privacy" },
      { label: "Terms of Service", view: "terms" },
      { label: "Medical Disclaimer", view: "medical-disclaimer" },
      { label: "Accessibility", view: "accessibility" },
      { label: "Cookie Policy", view: "cookies" },
    ],
  },
];

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
      <div className="mx-auto w-full max-w-7xl px-4 py-9 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-[1.45fr_repeat(4,minmax(0,1fr))] lg:gap-6">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Novalyte AI is the operating system for men's health — connecting patient demand,
              verified clinics, specialized professionals, and operational services through one
              intelligent healthcare ecosystem.
            </p>
            <form onSubmit={subscribe} className="mt-4 flex max-w-sm gap-2">
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

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-2 space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => navigate(l.view)}
                      className="text-sm text-muted-foreground transition hover:text-teal-700"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer + copyright */}
        <div className="mt-7 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <p className="max-w-3xl">
              Novalyte AI is a healthcare technology platform and does not provide medical care,
              diagnosis, or treatment. Clinics and licensed professionals are independently
              responsible for all clinical decisions. © {new Date().getFullYear()} Novalyte AI. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <p className="text-xs text-muted-foreground">Designed for secure healthcare workflows.</p>
            <p className="text-xs text-muted-foreground font-medium">Made with ❤️ in San Francisco</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
