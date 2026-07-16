"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { navigate, type ViewKey } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { goToProfessionalAccess } from "@/lib/professional-client";
import { captureAnalyticsEvent } from "@/lib/analytics-client";
import { Stethoscope, Briefcase, Users, Store, ArrowRight, CheckCircle2 } from "lucide-react";

type Role = "patient" | "clinic" | "professional" | "vendor";

const ROLES: { key: Role; label: string; desc: string; icon: React.ElementType; next: ViewKey }[] = [
  { key: "patient", label: "I'm a Patient", desc: "Explore treatments and find a clinic", icon: Stethoscope, next: "patients" },
  { key: "clinic", label: "I Represent a Clinic", desc: "Generate demand and grow operations", icon: Briefcase, next: "clinics" },
  { key: "professional", label: "I'm a Healthcare Professional", desc: "Find roles that match your licensure", icon: Users, next: "workforce" },
  { key: "vendor", label: "I'm a Vendor or Service Provider", desc: "Reach men's health clinics", icon: Store, next: "marketplace" },
];

export function GetStartedDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [role, setRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  function selectRole(r: Role) {
    if (r === "professional") {
      onOpenChange(false);
      goToProfessionalAccess("get_started_dialog");
      return;
    }
    setRole(r);
    setDone(false);
    captureAnalyticsEvent("get_started_role_selected", { role: r });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    if (role === "professional") {
      onOpenChange(false);
      goToProfessionalAccess("get_started_dialog_form");
      return;
    }
    setSubmitting(true);
    try {
      const endpoint =
        role === "clinic"
          ? "/api/clinic-onboarding"
          : role === "vendor"
          ? "/api/vendor-onboarding"
          : "/api/contact";
      let payload: Record<string, string>;
      if (role === "clinic") {
        payload = { clinicName: form.company, contactName: form.name, email: form.email, goals: form.message };
      } else if (role === "vendor") {
        payload = { companyName: form.company, contactName: form.name, email: form.email, notes: form.message };
      } else {
        // patient / other → contact form
        payload = { name: form.name, email: form.email, message: form.message || "Interested in patient resources.", role };
      }
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      captureAnalyticsEvent("get_started_form_submitted", { role });
      setDone(true);
      toast.success("Thanks — our team will reach out shortly.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setRole(null);
    setDone(false);
    setForm({ name: "", email: "", company: "", message: "" });
  }

  function close() {
    onOpenChange(false);
    setTimeout(reset, 200);
  }

  const fieldLabel = role === "clinic" ? "Clinic name" : role === "vendor" ? "Company name" : role === "professional" ? "Professional title" : "How can we help?";

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTimeout(reset, 200); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Join the Novalyte Network</DialogTitle>
          <DialogDescription>
            Tell us how you'd like to participate. We'll route you to the right onboarding path.
          </DialogDescription>
        </DialogHeader>

        {!role && (
          <div className="grid gap-2.5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.key}
                  onClick={() => selectRole(r.key)}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-foreground">{r.label}</span>
                    <span className="block text-xs text-muted-foreground">{r.desc}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-teal-600" />
                </button>
              );
            })}
          </div>
        )}

        {role && !done && (
          <form onSubmit={submit} className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <button type="button" onClick={() => setRole(null)} className="text-teal-600 hover:underline">
                ← Back
              </button>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium capitalize text-foreground">
                {ROLES.find((r) => r.key === role)?.label}
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gs-name">Full name</Label>
              <Input id="gs-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gs-email">Work email</Label>
              <Input id="gs-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gs-company">{fieldLabel}</Label>
              <Input id="gs-company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gs-message">Anything else? (optional)</Label>
              <Textarea id="gs-message" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" required className="mt-0.5" />
              <span>I acknowledge that Novalyte AI is a technology platform and does not provide medical care, and I agree to the Terms and Privacy Policy.</span>
            </label>
            <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit request"}
            </Button>
          </form>
        )}

        {role && done && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <h3 className="text-lg font-semibold">Request received</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Thank you. A Novalyte team member will follow up within 1–2 business days.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={close}>Close</Button>
              <Button
                className="bg-teal-600 text-white hover:bg-teal-700"
                onClick={() => {
                  const next = ROLES.find((r) => r.key === role)?.next ?? "home";
                  close();
                  navigate(next);
                }}
              >
                Explore {ROLES.find((r) => r.key === role)?.label.replace("I'm a ", "").replace("I Represent a ", "")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
