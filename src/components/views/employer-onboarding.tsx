"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/site/logo";
import { navigate } from "@/lib/nav";
import { US_STATES } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { captureSafeEvent } from "@/lib/analytics-client";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Upload, User, Building2, Image as ImageIcon,
  ShieldCheck, Settings, Briefcase, Loader2,
} from "lucide-react";

const EMPLOYER_STEPS = [
  { id: 0, label: "Account Owner", icon: User },
  { id: 1, label: "Organization Information", icon: Building2 },
  { id: 2, label: "Branding", icon: ImageIcon },
  { id: 3, label: "Verification", icon: ShieldCheck },
  { id: 4, label: "Hiring Needs", icon: Briefcase },
  { id: 5, label: "Dashboard Setup", icon: Settings },
];

function requiredFieldsForStep(step: number, data: Record<string, unknown>): string | null {
  if (step === 0) {
    if (!String(data.name ?? "").trim()) return "Full name is required.";
    if (!String(data.title ?? "").trim()) return "Job title is required.";
    if (!String(data.email ?? "").trim()) return "Work email is required.";
    if (!String(data.phone ?? "").trim()) return "Phone number is required.";
    if (!String(data.password ?? "") || String(data.password).length < 8) {
      return "Password must be at least 8 characters.";
    }
  }
  if (step === 1) {
    if (!String(data.legalName ?? "").trim()) return "Legal organization name is required.";
    if (!String(data.orgType ?? "").trim()) return "Organization type is required.";
  }
  if (step === 3 && data.authorized !== true) {
    return "Authorization confirmation is required.";
  }
  return null;
}

export function EmployerOnboarding() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const total = EMPLOYER_STEPS.length;
  const progress = ((step + 1) / total) * 100;

  useEffect(() => {
    captureSafeEvent("employer_registration_started");
  }, []);

  function set(key: string, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function next() {
    const validationError = requiredFieldsForStep(step, data);
    if (validationError) {
      captureSafeEvent("form_validation_error", {
        form_type: "employer_registration",
        stage_number: step + 1,
      });
      toast.error(validationError);
      return;
    }

    if (step < total - 1) {
      captureSafeEvent("employer_registration_step_completed", {
        stage_number: step + 1,
      });
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    try {
      const email = String(data.email ?? "").trim().toLowerCase();
      const password = String(data.password ?? "");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/workforce/employer`,
          data: {
            account_intent: "employer",
            first_name: String(data.name ?? "").split(" ")[0] ?? "",
            last_name: String(data.name ?? "").split(" ").slice(1).join(" "),
          },
        },
      });
      if (signUpError) throw signUpError;

      const session = signUpData.session;
      if (!session) {
        captureSafeEvent("employer_account_created", {
          confirmation_required: true,
        });
        toast.success("Check your email to confirm your employer account, then continue onboarding.");
        window.location.assign("/workforce/employer/sign-in");
        return;
      }

      const response = await fetch("/api/workforce/employer/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          currentStep: step,
          data: {
            ...data,
            password: undefined,
          },
          finalize: true,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Unable to create organization.");

      captureSafeEvent("employer_profile_completed");
      toast.success("Organization submitted for review. You can manage hiring from your employer dashboard.");
      window.location.assign("/workforce/employer/dashboard");
    } catch (error) {
      captureSafeEvent("form_submission_error", {
        form_type: "employer_registration",
        stage_number: step + 1,
      });
      toast.error(error instanceof Error ? error.message : "Unable to complete employer onboarding.");
    } finally {
      setSubmitting(false);
    }
  }

  function back() {
    if (step === 0) navigate("join");
    else setStep(step - 1);
  }

  return (
    <div className="fixed inset-0 z-[70] bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <button onClick={() => navigate("join")} aria-label="Exit"><Logo size="sm" /></button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Step {step + 1} of {total}</span>
          <button onClick={() => navigate("join")} className="text-xs text-muted-foreground hover:text-foreground">Save & Exit</button>
        </div>
      </div>
      <div className="h-1 bg-muted"><div className="h-full bg-teal-600 transition-all duration-300" style={{ width: `${progress}%` }} /></div>

      <div className="flex h-[calc(100vh-3.5rem-0.25rem)]">
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border bg-muted/20 p-4 lg:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization onboarding</p>
          <div className="space-y-1">
            {EMPLOYER_STEPS.map((s, i) => {
              const Icon = s.icon;
              const isComplete = i < step;
              const isCurrent = i === step;
              return (
                <div key={s.id} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs", isCurrent ? "bg-teal-50 text-teal-800 ring-1 ring-teal-200" : isComplete ? "text-teal-700" : "text-muted-foreground")}>
                  {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  <span className={cn(isCurrent && "font-semibold")}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              Organization accounts require email confirmation and admin review. Fake success paths have been removed.
            </div>
            <div className="min-h-[400px]">
              {step === 0 && <EmpStepAccount data={data} set={set} />}
              {step === 1 && <EmpStepOrgInfo data={data} set={set} />}
              {step === 2 && <EmpStepBranding data={data} set={set} />}
              {step === 3 && <EmpStepVerification data={data} set={set} />}
              {step === 4 && <EmpStepHiringNeeds data={data} set={set} />}
              {step === 5 && <EmpStepDashboard data={data} set={set} />}
            </div>
            <div className="mt-8 flex items-center justify-between border-t pt-5">
              <Button variant="ghost" onClick={back} disabled={submitting}>
                <ArrowLeft className="mr-1 h-4 w-4" /> {step === 0 ? "Back to Join" : "Back"}
              </Button>
              <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={next} disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Submitting...</>
                ) : step < total - 1 ? (
                  <>Continue <ArrowRight className="ml-1 h-4 w-4" /></>
                ) : (
                  <>Submit organization <CheckCircle2 className="ml-1 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (<div className="grid gap-1.5"><Label className="text-xs font-medium">{label}{required && <span className="text-rose-500"> *</span>}</Label>{children}{hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}</div>);
}

function ChipToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (<button type="button" onClick={onClick} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition", active ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200" : "border-border bg-card text-foreground/70 hover:border-teal-200")}>{active && <CheckCircle2 className="mr-1 inline h-3 w-3" />}{children}</button>);
}

function EmpStepAccount({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Account owner</h2><p className="mt-1 text-sm text-muted-foreground">Who will manage this organization&apos;s account?</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" required><Input value={(data.name as string) ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Job title" required><Input value={(data.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="e.g., Owner, Medical Director, COO" /></Field>
      </div>
      <Field label="Work email" required><Input type="email" value={(data.email as string) ?? ""} onChange={(e) => set("email", e.target.value.trim())} placeholder="name@organization.com" /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Phone number" required><Input type="tel" value={(data.phone as string) ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Password" required><Input type="password" value={(data.password as string) ?? ""} onChange={(e) => set("password", e.target.value)} /></Field>
      </div>
    </div>
  );
}

function EmpStepOrgInfo({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Organization information</h2><p className="mt-1 text-sm text-muted-foreground">Tell us about your healthcare organization.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Legal organization name" required><Input value={(data.legalName as string) ?? ""} onChange={(e) => set("legalName", e.target.value)} /></Field>
        <Field label="Public organization name"><Input value={(data.publicName as string) ?? ""} onChange={(e) => set("publicName", e.target.value)} /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Organization type" required><Select value={(data.orgType as string) ?? ""} onValueChange={(v) => set("orgType", v)}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{["Clinic", "Medical practice", "Hospital", "Health system", "Telehealth", "Laboratory", "Imaging center", "Behavioral health provider", "Rehabilitation provider", "Home health", "Healthcare technology company", "Medical device company", "Healthcare services company", "Other"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Website"><Input value={(data.website as string) ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="organization.com" /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Headquarters state"><Select value={(data.hqState as string) ?? ""} onValueChange={(v) => set("hqState", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Number of locations"><Input type="number" min="1" value={(data.locCount as string) ?? ""} onChange={(e) => set("locCount", e.target.value)} /></Field>
        <Field label="Organization size"><Select value={(data.orgSize as string) ?? ""} onValueChange={(v) => set("orgSize", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["1–10", "11–50", "51–200", "201–500", "500+"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Primary specialty"><Input value={(data.primarySpecialty as string) ?? ""} onChange={(e) => set("primarySpecialty", e.target.value)} placeholder="e.g., Men's Health, Primary Care" /></Field>
        <Field label="Additional specialties" hint="Comma-separated"><Input value={(data.additionalSpecialties as string) ?? ""} onChange={(e) => set("additionalSpecialties", e.target.value)} /></Field>
      </div>
      <Field label="Organization description"><Textarea rows={3} value={(data.orgDescription as string) ?? ""} onChange={(e) => set("orgDescription", e.target.value)} /></Field>
    </div>
  );
}

function EmpStepBranding({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Organization branding</h2><p className="mt-1 text-sm text-muted-foreground">Optional branding details for your hiring profile.</p></div>
      <Field label="Logo" hint="Logo upload will be available after organization approval."><div className="flex items-center gap-3"><div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Building2 className="h-6 w-6" /></div><Button variant="outline" size="sm" disabled type="button">Upload logo</Button></div></Field>
      <Field label="Cover image" hint="Available after approval."><button type="button" disabled className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground"><Upload className="h-5 w-5" /> Upload cover image</button></Field>
      <Field label="Brand description"><Textarea rows={2} value={(data.brandDesc as string) ?? ""} onChange={(e) => set("brandDesc", e.target.value)} /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="LinkedIn URL"><Input value={(data.linkedin as string) ?? ""} onChange={(e) => set("linkedin", e.target.value)} /></Field>
        <Field label="Social media URLs" hint="Comma-separated"><Input value={(data.social as string) ?? ""} onChange={(e) => set("social", e.target.value)} /></Field>
      </div>
    </div>
  );
}

function EmpStepVerification({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Verification information</h2><p className="mt-1 text-sm text-muted-foreground">Your organization remains unverified until Novalyte review is complete.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Organization NPI" hint="If applicable"><Input value={(data.npi as string) ?? ""} onChange={(e) => set("npi", e.target.value)} maxLength={10} /></Field>
        <Field label="Business registration number" hint="If applicable"><Input value={(data.businessReg as string) ?? ""} onChange={(e) => set("businessReg", e.target.value)} /></Field>
      </div>
      <Field label="Business address"><Input value={(data.address as string) ?? ""} onChange={(e) => set("address", e.target.value)} /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Accreditation details" hint="If applicable"><Input value={(data.accreditation as string) ?? ""} onChange={(e) => set("accreditation", e.target.value)} /></Field>
        <Field label="Authorized representative name"><Input value={(data.authRep as string) ?? ""} onChange={(e) => set("authRep", e.target.value)} /></Field>
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          className="mt-0.5 accent-teal-600"
          checked={data.authorized === true}
          onChange={(e) => set("authorized", e.target.checked)}
        />
        <span>I confirm that I am authorized to submit this information on behalf of the organization, and the information provided is accurate.</span>
      </label>
    </div>
  );
}

function EmpStepHiringNeeds({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const needs = ["Post a permanent role", "Hire part-time staff", "Find temporary coverage", "Find contract professionals", "Hire remote healthcare staff", "Build a talent pipeline", "Browse healthcare professionals", "Manage multiple locations", "Prepare for increasing patient demand"];
  const selected = (data.hiringNeeds as string[]) ?? [];
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Hiring needs</h2><p className="mt-1 text-sm text-muted-foreground">What does your organization need? Select all that apply.</p></div>
      <div className="flex flex-wrap gap-1.5">{needs.map((n) => <ChipToggle key={n} active={selected.includes(n)} onClick={() => set("hiringNeeds", selected.includes(n) ? selected.filter((x) => x !== n) : [...selected, n])}>{n}</ChipToggle>)}</div>
    </div>
  );
}

function EmpStepDashboard({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Dashboard setup</h2><p className="mt-1 text-sm text-muted-foreground">Configure your hiring workflow preferences.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Default hiring stages" hint="Comma-separated"><Input value={(data.hiringStages as string) ?? ""} onChange={(e) => set("hiringStages", e.target.value)} placeholder="New, Reviewed, Interview, Offer" /></Field>
        <Field label="Default location"><Input value={(data.defaultLocation as string) ?? ""} onChange={(e) => set("defaultLocation", e.target.value)} /></Field>
        <Field label="Departments" hint="Comma-separated"><Input value={(data.departments as string) ?? ""} onChange={(e) => set("departments", e.target.value)} placeholder="Clinical, Operations, Admin" /></Field>
        <Field label="Notification preferences"><Select value={(data.notifications as string) ?? ""} onValueChange={(v) => set("notifications", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Email all applicants", "Email new only", "Daily digest", "No notifications"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></Field>
      </div>
      <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-4"><p className="text-xs text-teal-800">After submission, your organization is reviewed before full hiring features are unlocked.</p></div>
    </div>
  );
}
