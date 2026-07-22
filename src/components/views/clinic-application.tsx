"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { captureSafeEvent } from "@/lib/analytics-client";
import { US_STATES, TREATMENT_VERTICALS } from "@/lib/constants";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Building2, MapPin, User, Stethoscope,
  Activity, TrendingUp, Image as ImageIcon, ShieldCheck, FileText, Lock,
  Clock, AlertCircle,
} from "lucide-react";

const STAGES = [
  { id: 0, label: "Organization", shortLabel: "Organization", icon: Building2 },
  { id: 1, label: "Locations", shortLabel: "Locations", icon: MapPin },
  { id: 2, label: "Decision Maker", shortLabel: "Contact", icon: User },
  { id: 3, label: "Providers & Credentials", shortLabel: "Providers", icon: Stethoscope },
  { id: 4, label: "Treatments", shortLabel: "Treatments", icon: Activity },
  { id: 5, label: "Patient Operations", shortLabel: "Operations", icon: TrendingUp },
  { id: 6, label: "Growth Interests", shortLabel: "Growth", icon: TrendingUp },
  { id: 7, label: "Directory Profile", shortLabel: "Profile", icon: ImageIcon },
  { id: 8, label: "Verification", shortLabel: "Verify", icon: ShieldCheck },
  { id: 9, label: "Review & Submit", shortLabel: "Review", icon: FileText },
];

const ORG_TYPES = ["Independent clinic", "Multi-location clinic group", "Telehealth provider", "Medical group", "Physician-owned practice", "Private-equity-backed group", "Franchise", "Hospital-affiliated clinic", "Management services organization", "Other"];
const OWNERSHIP_TYPES = ["Physician-owned", "Founder-owned", "Partnership", "Private equity", "Health system", "Corporate group", "Other", "Prefer not to disclose"];
const DM_ROLES = ["Owner", "Founder", "Co-founder", "Chief Executive Officer", "President", "Medical Director", "Chief Medical Officer", "Chief Operating Officer", "Practice Administrator", "Clinic Director", "Growth or Marketing Director", "Business Development", "Operations Manager", "Other"];
const ACQUISITION_CHANNELS = ["Organic search", "Google Ads", "Meta Ads", "Social media", "Referrals", "Existing patient referrals", "Directory listings", "Affiliates", "Partnerships", "Call center", "Events", "Other"];
const INTAKE_METHODS = ["Website form", "Phone", "SMS", "EHR form", "CRM", "Call center", "Manual spreadsheet", "Third-party intake platform", "Other"];
const WEEKLY_CAPACITY = ["1–5", "6–10", "11–25", "26–50", "50+", "Not sure"];
const MONTHLY_CAPACITY = ["Under 20", "20–49", "50–99", "100–249", "250+", "Not sure"];
const ACQUISITION_INTEREST = ["Yes, immediately", "Yes, within 30 days", "Yes, within 90 days", "Possibly, send information", "Directory listing only", "Not currently"];
const GROWTH_SERVICES = ["Treatment-ready patient opportunities", "Patient-acquisition campaigns", "Enhanced directory visibility", "Featured clinic placement", "Structured patient intake", "Consultation workflow management", "Clinic CRM or dashboard", "Automated follow-up", "Multi-location reporting", "Geographic expansion", "Telehealth expansion", "Workforce recruitment", "Medical director sourcing", "Credentialing support", "Vendor and equipment sourcing", "Laboratory partnerships", "Marketplace seller participation", "Journal or educational-content participation", "Sponsored educational content", "Referral partnerships", "Other"];
const COMMERCIAL_MODELS = ["Pay per patient opportunity", "Monthly subscription", "Performance-based", "Hybrid model", "Enhanced listing only", "Not sure", "Directory listing only"];
const BUDGET_RANGES = ["Under $1,000 per month", "$1,000–$2,499", "$2,500–$4,999", "$5,000–$9,999", "$10,000+", "Budget not determined", "Directory listing only"];
const WORKFORCE_NEEDS = ["Medical director", "Physician", "Nurse practitioner", "Physician assistant", "Registered nurse", "Medical assistant", "Phlebotomist", "Patient coordinator", "Operations manager", "Sales or consultation staff", "Telehealth clinician", "Credentialing support", "Marketing support", "Other"];
const MARKETPLACE_NEEDS = ["Laboratory partners", "Diagnostic equipment", "Exam furniture", "Blood-draw supplies", "Medical refrigeration", "Telehealth technology", "EHR", "CRM", "Medical waste services", "Credentialing services", "Marketing services", "Clinic furniture", "Recovery equipment", "Hyperbaric equipment", "IV equipment", "Pharmacy relationships", "Payment and financing services", "Other"];
const DRAFT_KEY = "novalyte-clinic-application-draft-v1";

type FormData = Record<string, string | boolean | string[]>;

export function ClinicApplication({ onComplete }: { onComplete: (applicationId: string) => void }) {
  const completed = useRef(false);
  const latestStage = useRef(0);
  const [stage, setStage] = useState(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      const parsed = saved ? JSON.parse(saved) as { stage?: number } : {};
      return typeof parsed.stage === "number" && parsed.stage >= 0 && parsed.stage <= 9 ? parsed.stage : 0;
    } catch { return 0; }
  });
  const [data, setData] = useState<FormData>(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      const parsed = saved ? JSON.parse(saved) as { data?: FormData } : {};
      return parsed.data ?? {};
    } catch { return {}; }
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    captureSafeEvent("clinic_application_started");
    return () => {
      if (!completed.current) {
        captureSafeEvent("clinic_application_abandoned", {
          stage_number: latestStage.current + 1,
        });
      }
    };
  }, []);

  useEffect(() => {
    latestStage.current = stage;
    if (Object.keys(data).length === 0) return;
    try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ stage, data })); } catch {}
  }, [data, stage]);

  function set(key: string, value: string | boolean | string[]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArray(key: string, value: string) {
    const arr = (data[key] as string[]) ?? [];
    set(key, arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  function canProceed(): boolean {
    switch (stage) {
      case 0: return !!(data.legalName as string)?.trim();
      case 1: return true; // locations optional at minimum
      case 2: return !!(data.dmFirstName as string)?.trim() && !!(data.dmLastName as string)?.trim() && !!(data.dmEmail as string)?.trim();
      case 3: return true; // credentials optional
      case 4: return Array.isArray(data.treatments) && (data.treatments as string[]).length > 0;
      case 5: return true;
      case 6: return true;
      case 7: return true;
      case 8: return !!data.accuracyConfirm && !!data.verifyConsent && !!data.termsConsent && !!data.contactConsent;
      case 9: return true;
      default: return false;
    }
  }

  async function submit() {
    setSubmitting(true);
    try {
      const payload = {
        legalName: data.legalName ?? "",
        dbaName: data.dbaName ?? null,
        parentOrg: data.parentOrg ?? null,
        orgType: data.orgType ?? null,
        ownershipType: data.ownershipType ?? null,
        yearEstablished: data.yearEstablished ?? null,
        website: data.website ?? null,
        mainPhone: data.mainPhone ?? null,
        generalEmail: data.generalEmail ?? null,
        orgDescription: data.orgDescription ?? null,
        locationCount: data.locationCount ?? null,
        providerCount: data.providerCount ?? null,
        employeeCount: data.employeeCount ?? null,
        dmFirstName: data.dmFirstName ?? "",
        dmLastName: data.dmLastName ?? "",
        dmTitle: data.dmTitle ?? null,
        dmRole: data.dmRole ?? null,
        dmEmail: data.dmEmail ?? "",
        dmPhone: data.dmPhone ?? null,
        dmMobile: data.dmMobile ?? null,
        dmPreferredContact: data.dmPreferredContact ?? null,
        dmBestTime: data.dmBestTime ?? null,
        dmLinkedin: data.dmLinkedin ?? null,
        dmAuthorized: data.dmAuthorized ?? false,
        dmFinalDecisionMaker: data.dmFinalDecisionMaker ?? false,
        orgNpi: data.orgNpi ?? null,
        taxonomyCode: data.taxonomyCode ?? null,
        medicalDirector: data.medicalDirector ?? null,
        medicalDirectorNpi: data.medicalDirectorNpi ?? null,
        licenseStates: Array.isArray(data.licenseStates) ? (data.licenseStates as string[]).join(", ") : (data.licenseStates as string ?? null),
        accreditation: data.accreditation ?? null,
        treatments: Array.isArray(data.treatments) ? (data.treatments as string[]).join(", ") : null,
        monthlyInquiries: data.monthlyInquiries ?? null,
        monthlyConsults: data.monthlyConsults ?? null,
        monthlyNewPatients: data.monthlyNewPatients ?? null,
        acquisitionChannels: Array.isArray(data.acquisitionChannels) ? (data.acquisitionChannels as string[]).join(", ") : null,
        responseTime: data.responseTime ?? null,
        intakeMethod: data.intakeMethod ?? null,
        crmSystem: data.crmSystem ?? null,
        acquisitionInterest: data.acquisitionInterest ?? null,
        weeklyCapacity: data.weeklyCapacity ?? null,
        monthlyCapacity: data.monthlyCapacity ?? null,
        growthServices: Array.isArray(data.growthServices) ? (data.growthServices as string[]).join(", ") : null,
        commercialModel: data.commercialModel ?? null,
        budgetRange: data.budgetRange ?? null,
        workforceNeeds: Array.isArray(data.workforceNeeds) ? (data.workforceNeeds as string[]).join(", ") : null,
        marketplaceNeeds: Array.isArray(data.marketplaceNeeds) ? (data.marketplaceNeeds as string[]).join(", ") : null,
        shortDescription: data.shortDescription ?? null,
        fullBio: data.fullBio ?? null,
        mission: data.mission ?? null,
        differentiator: data.differentiator ?? null,
        idealPatient: data.idealPatient ?? null,
        consultationProcess: data.consultationProcess ?? null,
        insuranceInfo: data.insuranceInfo ?? null,
        selfPayInfo: data.selfPayInfo ?? null,
        financingInfo: data.financingInfo ?? null,
        languages: data.languages ?? null,
        accessibility: data.accessibility ?? null,
        amenities: data.amenities ?? null,
        bookingUrl: data.bookingUrl ?? null,
        socialUrls: data.socialUrls ?? null,
        accuracyConfirm: !!data.accuracyConfirm,
        verifyConsent: !!data.verifyConsent,
        mediaConsent: !!data.mediaConsent,
        termsConsent: !!data.termsConsent,
        contactConsent: !!data.contactConsent,
        marketingConsent: !!data.marketingConsent,
        referralSource: data.referralSource ?? null,
        notes: data.notes ?? null,
      };
      const res = await fetch("/api/clinic-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Request failed");
      }
      const result = await res.json();
      try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
      completed.current = true;
      captureSafeEvent("clinic_application_submitted");
      toast.success("Application submitted successfully.");
      onComplete(result.applicationId);
    } catch (e) {
      captureSafeEvent("form_submission_error", {
        form_type: "clinic_application",
        stage_number: stage + 1,
      });
      toast.error("Something went wrong. Please try again.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (stage < 9) {
      captureSafeEvent("clinic_application_step_completed", {
        stage_number: stage + 1,
      });
      setStage(stage + 1);
    }
    else submit();
  }

  function back() {
    if (stage > 0) setStage(stage - 1);
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-premium-sm">
      {/* Header with progress */}
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Stage {stage + 1} of 10 — {STAGES[stage].label}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Approximately 8–12 minutes · Draft saved automatically on this device</p>
          </div>
          <span className="hidden rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 sm:block">DRAFT</span>
        </div>
        {/* Progress rail */}
        <div className="novalyte-scroll mt-4 flex items-center gap-1 overflow-x-auto pb-1" aria-label="Clinic application progress">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const isComplete = i < stage;
            const isCurrent = i === stage;
            return (
              <button
                key={s.id}
                onClick={() => i < stage && setStage(i)}
                aria-label={`${s.label}${isCurrent ? ", current step" : isComplete ? ", completed" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
                title={s.label}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition",
                  isCurrent ? "bg-teal-50 text-teal-800 ring-1 ring-teal-200" : isComplete ? "text-teal-700 hover:bg-teal-50/50" : "text-muted-foreground/60",
                )}
                disabled={i > stage}
              >
                {isComplete ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                <span className="hidden md:inline">{s.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <div>
          {stage === 0 && <StageOrganization data={data} set={set} />}
          {stage === 1 && <StageLocations data={data} set={set} />}
          {stage === 2 && <StageDecisionMaker data={data} set={set} />}
          {stage === 3 && <StageProviders data={data} set={set} toggleArray={toggleArray} />}
          {stage === 4 && <StageTreatments data={data} set={set} toggleArray={toggleArray} />}
          {stage === 5 && <StagePatientOps data={data} set={set} toggleArray={toggleArray} />}
          {stage === 6 && <StageGrowthInterests data={data} set={set} toggleArray={toggleArray} />}
          {stage === 7 && <StageDirectoryProfile data={data} set={set} />}
          {stage === 8 && <StageVerification data={data} set={set} />}
          {stage === 9 && <StageReview data={data} set={set} onJumpTo={(s) => setStage(s)} />}
        </div>

        {/* Nav */}
        <div className="mt-5 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" className="self-start" onClick={back} disabled={stage === 0}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <div className="flex flex-col-reverse items-start gap-2 sm:flex-row sm:items-center">
            {!canProceed() && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" /> {stage === 8 ? "Required consents must be checked" : "Required fields missing"}
              </span>
            )}
            <Button
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={next}
              disabled={!canProceed() || submitting}
            >
              {stage < 9 ? (
                <>Continue <ArrowRight className="ml-1 h-4 w-4" /></>
              ) : submitting ? (
                "Submitting..."
              ) : (
                <>Submit Clinic Application <CheckCircle2 className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Field helpers ───────────────────────────────────────────── */
function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium">
        {label}{required && <span className="text-rose-500"> *</span>}
      </Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ChipToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200" : "border-border bg-card text-foreground/70 hover:border-teal-200",
      )}
    >
      {active && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
      {children}
    </button>
  );
}

/* ── Stage 1: Organization ──────────────────────────────────── */
function StageOrganization({ data, set }: { data: FormData; set: (k: string, v: string | boolean | string[]) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <h3 className="text-lg font-semibold text-foreground">Organization information</h3>
      <p className="text-sm text-muted-foreground">Tell us about your clinic or organization.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Legal business name" required>
          <Input value={(data.legalName as string) ?? ""} onChange={(e) => set("legalName", e.target.value)} />
        </Field>
        <Field label="Clinic or DBA name">
          <Input value={(data.dbaName as string) ?? ""} onChange={(e) => set("dbaName", e.target.value)} />
        </Field>
        <Field label="Parent organization">
          <Input value={(data.parentOrg as string) ?? ""} onChange={(e) => set("parentOrg", e.target.value)} />
        </Field>
        <Field label="Business type">
          <Select value={(data.orgType as string) ?? ""} onValueChange={(v) => set("orgType", v)}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>{ORG_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Ownership type">
          <Select value={(data.ownershipType as string) ?? ""} onValueChange={(v) => set("ownershipType", v)}>
            <SelectTrigger><SelectValue placeholder="Select ownership" /></SelectTrigger>
            <SelectContent>{OWNERSHIP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Year established">
          <Input value={(data.yearEstablished as string) ?? ""} onChange={(e) => set("yearEstablished", e.target.value)} placeholder="e.g., 2019" />
        </Field>
        <Field label="Primary website">
          <Input value={(data.website as string) ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="example.com" />
        </Field>
        <Field label="Main clinic phone">
          <Input value={(data.mainPhone as string) ?? ""} onChange={(e) => set("mainPhone", e.target.value)} placeholder="(555) 123-4567" />
        </Field>
        <Field label="General clinic email">
          <Input type="email" value={(data.generalEmail as string) ?? ""} onChange={(e) => set("generalEmail", e.target.value)} placeholder="info@clinic.com" />
        </Field>
        <Field label="Number of locations">
          <Input type="number" min="1" value={(data.locationCount as string) ?? ""} onChange={(e) => set("locationCount", e.target.value)} />
        </Field>
        <Field label="Number of providers">
          <Input type="number" min="0" value={(data.providerCount as string) ?? ""} onChange={(e) => set("providerCount", e.target.value)} />
        </Field>
        <Field label="Approximate total employees">
          <Input value={(data.employeeCount as string) ?? ""} onChange={(e) => set("employeeCount", e.target.value)} />
        </Field>
      </div>
      <Field label="Organization description">
        <Textarea rows={3} value={(data.orgDescription as string) ?? ""} onChange={(e) => set("orgDescription", e.target.value)} placeholder="Brief description of your clinic..." />
      </Field>
    </div>
  );
}

/* ── Stage 2: Locations ─────────────────────────────────────── */
function StageLocations({ data, set }: { data: FormData; set: (k: string, v: string | boolean | string[]) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <h3 className="text-lg font-semibold text-foreground">Location information</h3>
      <p className="text-sm text-muted-foreground">Provide your primary location. Multi-location details can be collected during verification.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Primary location name">
          <Input value={(data.locName as string) ?? ""} onChange={(e) => set("locName", e.target.value)} placeholder="e.g., Austin Main Clinic" />
        </Field>
        <Field label="Street address">
          <Input value={(data.locAddress as string) ?? ""} onChange={(e) => set("locAddress", e.target.value)} />
        </Field>
        <Field label="City">
          <Input value={(data.locCity as string) ?? ""} onChange={(e) => set("locCity", e.target.value)} />
        </Field>
        <Field label="State">
          <Select value={(data.locState as string) ?? ""} onValueChange={(v) => set("locState", v)}>
            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="ZIP code">
          <Input value={(data.locZip as string) ?? ""} onChange={(e) => set("locZip", e.target.value)} maxLength={10} />
        </Field>
        <Field label="Location phone">
          <Input value={(data.locPhone as string) ?? ""} onChange={(e) => set("locPhone", e.target.value)} />
        </Field>
        <Field label="Hours of operation">
          <Input value={(data.locHours as string) ?? ""} onChange={(e) => set("locHours", e.target.value)} placeholder="Mon–Fri 8am–6pm" />
        </Field>
        <Field label="Appointment URL">
          <Input value={(data.locBookingUrl as string) ?? ""} onChange={(e) => set("locBookingUrl", e.target.value)} placeholder="booking.example.com" />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Telehealth availability">
          <Select value={(data.locTelehealth as string) ?? ""} onValueChange={(v) => set("locTelehealth", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes, we offer telehealth</SelectItem>
              <SelectItem value="no">No, in-person only</SelectItem>
              <SelectItem value="planned">Planning to add telehealth</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="States served through telehealth" hint="Comma-separated state codes">
          <Input value={(data.locTelehealthStates as string) ?? ""} onChange={(e) => set("locTelehealthStates", e.target.value)} placeholder="TX, FL, CO" />
        </Field>
        <Field label="New-patient availability">
          <Select value={(data.locNewPatients as string) ?? ""} onValueChange={(v) => set("locNewPatients", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Accepting new patients</SelectItem>
              <SelectItem value="waitlist">Waitlist only</SelectItem>
              <SelectItem value="no">Not currently</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Estimated consultation wait time">
          <Input value={(data.locWaitTime as string) ?? ""} onChange={(e) => set("locWaitTime", e.target.value)} placeholder="e.g., 3–5 days" />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">If your clinic is telehealth-only, provide the legally required business address above. Additional locations can be collected during verification.</p>
    </div>
  );
}

/* ── Stage 3: Decision Maker ────────────────────────────────── */
function StageDecisionMaker({ data, set }: { data: FormData; set: (k: string, v: string | boolean | string[]) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <h3 className="text-lg font-semibold text-foreground">Decision-maker information</h3>
      <p className="text-sm text-muted-foreground">Who is authorized to make partnership decisions for your clinic?</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name" required>
          <Input value={(data.dmFirstName as string) ?? ""} onChange={(e) => set("dmFirstName", e.target.value)} />
        </Field>
        <Field label="Last name" required>
          <Input value={(data.dmLastName as string) ?? ""} onChange={(e) => set("dmLastName", e.target.value)} />
        </Field>
        <Field label="Job title">
          <Input value={(data.dmTitle as string) ?? ""} onChange={(e) => set("dmTitle", e.target.value)} placeholder="e.g., Owner, Medical Director" />
        </Field>
        <Field label="Role in buying/partnership decision">
          <Select value={(data.dmRole as string) ?? ""} onValueChange={(v) => set("dmRole", v)}>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>{DM_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Work email address" required>
          <Input type="email" value={(data.dmEmail as string) ?? ""} onChange={(e) => set("dmEmail", e.target.value.trim())} placeholder="name@clinic.com" />
        </Field>
        <Field label="Direct telephone number">
          <Input type="tel" value={(data.dmPhone as string) ?? ""} onChange={(e) => set("dmPhone", e.target.value)} />
        </Field>
        <Field label="Mobile number">
          <Input type="tel" value={(data.dmMobile as string) ?? ""} onChange={(e) => set("dmMobile", e.target.value)} />
        </Field>
        <Field label="Preferred contact method">
          <Select value={(data.dmPreferredContact as string) ?? ""} onValueChange={(v) => set("dmPreferredContact", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="sms">Text message</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Best time to contact">
          <Input value={(data.dmBestTime as string) ?? ""} onChange={(e) => set("dmBestTime", e.target.value)} placeholder="e.g., weekday mornings" />
        </Field>
        <Field label="LinkedIn profile URL">
          <Input value={(data.dmLinkedin as string) ?? ""} onChange={(e) => set("dmLinkedin", e.target.value)} placeholder="linkedin.com/in/..." />
        </Field>
      </div>
      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={!!data.dmAuthorized} onChange={(e) => set("dmAuthorized", e.target.checked)} className="mt-0.5 accent-teal-600" />
          <span className="text-muted-foreground">I am authorized to submit this application on behalf of the organization.</span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={!!data.dmFinalDecisionMaker} onChange={(e) => set("dmFinalDecisionMaker", e.target.checked)} className="mt-0.5 accent-teal-600" />
          <span className="text-muted-foreground">I am the final decision-maker for partnerships and growth services.</span>
        </label>
      </div>
    </div>
  );
}

/* ── Stage 4: Providers & Credentials ───────────────────────── */
function StageProviders({ data, set, toggleArray }: { data: FormData; set: (k: string, v: string | boolean | string[]) => void; toggleArray: (k: string, v: string) => void }) {
  const licenseArr = (data.licenseStates as string[]) ?? [];
  return (
    <div className="space-y-4 novalyte-fade-up">
      <h3 className="text-lg font-semibold text-foreground">Providers & credentials</h3>
      <p className="text-sm text-muted-foreground">Organization-level verification information. Provider-specific details can be collected during verification.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Organization NPI" hint="National Provider Identifier">
          <Input value={(data.orgNpi as string) ?? ""} onChange={(e) => set("orgNpi", e.target.value)} maxLength={10} />
        </Field>
        <Field label="Taxonomy code">
          <Input value={(data.taxonomyCode as string) ?? ""} onChange={(e) => set("taxonomyCode", e.target.value)} />
        </Field>
        <Field label="Medical director name">
          <Input value={(data.medicalDirector as string) ?? ""} onChange={(e) => set("medicalDirector", e.target.value)} />
        </Field>
        <Field label="Medical director NPI">
          <Input value={(data.medicalDirectorNpi as string) ?? ""} onChange={(e) => set("medicalDirectorNpi", e.target.value)} maxLength={10} />
        </Field>
      </div>
      <Field label="License states" hint="Select all states where your providers are licensed">
        <div className="mt-2 flex flex-wrap gap-1.5">
          {US_STATES.map((s) => (
            <ChipToggle key={s} active={licenseArr.includes(s)} onClick={() => toggleArray("licenseStates", s)}>
              {s}
            </ChipToggle>
          ))}
        </div>
      </Field>
      <Field label="Accreditation or certifications" hint="Comma-separated">
        <Input value={(data.accreditation as string) ?? ""} onChange={(e) => set("accreditation", e.target.value)} placeholder="e.g., AAAHC, Joint Commission" />
      </Field>
      <p className="text-xs text-muted-foreground">Do not upload sensitive identity documents here. License verification will be conducted through a secure workflow if required.</p>
    </div>
  );
}

/* ── Stage 5: Treatments ────────────────────────────────────── */
function StageTreatments({ data, set, toggleArray }: { data: FormData; set: (k: string, v: string | boolean | string[]) => void; toggleArray: (k: string, v: string) => void }) {
  const arr = (data.treatments as string[]) ?? [];
  return (
    <div className="space-y-4 novalyte-fade-up">
      <h3 className="text-lg font-semibold text-foreground">Treatments & services</h3>
      <p className="text-sm text-muted-foreground">Select all treatment categories your clinic offers. Required to continue.</p>
      <div className="flex flex-wrap gap-1.5">
        {TREATMENT_VERTICALS.map((t) => (
          <ChipToggle key={t.slug} active={arr.includes(t.slug)} onClick={() => toggleArray("treatments", t.slug)}>
            {t.label}
          </ChipToggle>
        ))}
        {["IV Therapy", "Primary Men's Health Care", "Lab Testing", "Sleep Health", "Mental & Behavioral Health", "Telehealth Consultations"].map((t) => (
          <ChipToggle key={t} active={arr.includes(t)} onClick={() => toggleArray("treatments", t)}>
            {t}
          </ChipToggle>
        ))}
      </div>
      {arr.length > 0 && (
        <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-4">
          <p className="text-xs font-semibold text-teal-800">{arr.length} treatment{arr.length !== 1 ? "s" : ""} selected</p>
        </div>
      )}
      <Separator />
      <Field label="May Novalyte AI display pricing information publicly?">
        <Select value={(data.pricingDisplay as string) ?? ""} onValueChange={(v) => set("pricingDisplay", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="range">Yes, as a range</SelectItem>
            <SelectItem value="quote">Request quote only</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

/* ── Stage 6: Patient Operations ────────────────────────────── */
function StagePatientOps({ data, set, toggleArray }: { data: FormData; set: (k: string, v: string | boolean | string[]) => void; toggleArray: (k: string, v: string) => void }) {
  const channels = (data.acquisitionChannels as string[]) ?? [];
  return (
    <div className="space-y-4 novalyte-fade-up">
      <h3 className="text-lg font-semibold text-foreground">Current patient operations</h3>
      <p className="text-sm text-muted-foreground">Help us understand your clinic's capacity and current operations.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="New patient inquiries / month">
          <Input value={(data.monthlyInquiries as string) ?? ""} onChange={(e) => set("monthlyInquiries", e.target.value)} placeholder="e.g., 120" />
        </Field>
        <Field label="Consultations booked / month">
          <Input value={(data.monthlyConsults as string) ?? ""} onChange={(e) => set("monthlyConsults", e.target.value)} placeholder="e.g., 45" />
        </Field>
        <Field label="New patients accepted / month">
          <Input value={(data.monthlyNewPatients as string) ?? ""} onChange={(e) => set("monthlyNewPatients", e.target.value)} placeholder="e.g., 30" />
        </Field>
      </div>
      <Field label="Current patient-acquisition channels" hint="Select all that apply">
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ACQUISITION_CHANNELS.map((c) => (
            <ChipToggle key={c} active={channels.includes(c)} onClick={() => toggleArray("acquisitionChannels", c)}>
              {c}
            </ChipToggle>
          ))}
        </div>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Average response time to new inquiries">
          <Select value={(data.responseTime as string) ?? ""} onValueChange={(v) => set("responseTime", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="under-1h">Under 1 hour</SelectItem>
              <SelectItem value="1-4h">1–4 hours</SelectItem>
              <SelectItem value="same-day">Same day</SelectItem>
              <SelectItem value="1-2d">1–2 days</SelectItem>
              <SelectItem value="3-5d">3–5 days</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Current intake method">
          <Select value={(data.intakeMethod as string) ?? ""} onValueChange={(v) => set("intakeMethod", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{INTAKE_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="CRM or patient-management system">
          <Input value={(data.crmSystem as string) ?? ""} onChange={(e) => set("crmSystem", e.target.value)} placeholder="e.g., HubSpot, Jane, EHR name" />
        </Field>
      </div>
    </div>
  );
}

/* ── Stage 7: Growth Interests ──────────────────────────────── */
function StageGrowthInterests({ data, set, toggleArray }: { data: FormData; set: (k: string, v: string | boolean | string[]) => void; toggleArray: (k: string, v: string) => void }) {
  const services = (data.growthServices as string[]) ?? [];
  const workforce = (data.workforceNeeds as string[]) ?? [];
  const marketplace = (data.marketplaceNeeds as string[]) ?? [];
  return (
    <div className="space-y-5 novalyte-fade-up">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Patient-acquisition interest</h3>
        <p className="text-sm text-muted-foreground">Novalyte AI may offer optional patient-acquisition services to approved clinics. These are separate from the free directory application.</p>
      </div>
      <Field label="Would your clinic like to receive additional patient opportunities?">
        <Select value={(data.acquisitionInterest as string) ?? ""} onValueChange={(v) => set("acquisitionInterest", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{ACQUISITION_INTEREST.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Weekly patient-opportunity capacity">
          <Select value={(data.weeklyCapacity as string) ?? ""} onValueChange={(v) => set("weeklyCapacity", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{WEEKLY_CAPACITY.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Monthly patient-opportunity capacity">
          <Select value={(data.monthlyCapacity as string) ?? ""} onValueChange={(v) => set("monthlyCapacity", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{MONTHLY_CAPACITY.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <Separator />
      <Field label="Which growth services are you interested in?" hint="Select all that apply">
        <div className="mt-2 flex flex-wrap gap-1.5">
          {GROWTH_SERVICES.map((s) => (
            <ChipToggle key={s} active={services.includes(s)} onClick={() => toggleArray("growthServices", s)}>
              {s}
            </ChipToggle>
          ))}
        </div>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Preferred commercial model">
          <Select value={(data.commercialModel as string) ?? ""} onValueChange={(v) => set("commercialModel", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{COMMERCIAL_MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Growth budget range" hint="Optional">
          <Select value={(data.budgetRange as string) ?? ""} onValueChange={(v) => set("budgetRange", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{BUDGET_RANGES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <Separator />
      <Field label="Workforce needs" hint="Select all that apply">
        <div className="mt-2 flex flex-wrap gap-1.5">
          {WORKFORCE_NEEDS.map((w) => (
            <ChipToggle key={w} active={workforce.includes(w)} onClick={() => toggleArray("workforceNeeds", w)}>
              {w}
            </ChipToggle>
          ))}
        </div>
      </Field>
      <Field label="Marketplace & vendor needs" hint="Select all that apply">
        <div className="mt-2 flex flex-wrap gap-1.5">
          {MARKETPLACE_NEEDS.map((m) => (
            <ChipToggle key={m} active={marketplace.includes(m)} onClick={() => toggleArray("marketplaceNeeds", m)}>
              {m}
            </ChipToggle>
          ))}
        </div>
      </Field>
      <p className="text-xs text-muted-foreground">Applying for the directory is free. Optional growth services may have separate fees. Paid services do not guarantee clinical outcomes or revenue.</p>
    </div>
  );
}

/* ── Stage 8: Directory Profile ─────────────────────────────── */
function StageDirectoryProfile({ data, set }: { data: FormData; set: (k: string, v: string | boolean | string[]) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <h3 className="text-lg font-semibold text-foreground">Directory profile content</h3>
      <p className="text-sm text-muted-foreground">Information used to build your public clinic profile. You can edit this later.</p>
      <Field label="Short clinic description" hint="1–2 sentences for directory cards">
        <Textarea rows={2} value={(data.shortDescription as string) ?? ""} onChange={(e) => set("shortDescription", e.target.value)} maxLength={200} />
      </Field>
      <Field label="Full clinic biography">
        <Textarea rows={4} value={(data.fullBio as string) ?? ""} onChange={(e) => set("fullBio", e.target.value)} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Mission statement">
          <Textarea rows={2} value={(data.mission as string) ?? ""} onChange={(e) => set("mission", e.target.value)} />
        </Field>
        <Field label="What makes your clinic different">
          <Textarea rows={2} value={(data.differentiator as string) ?? ""} onChange={(e) => set("differentiator", e.target.value)} />
        </Field>
        <Field label="Ideal patient">
          <Input value={(data.idealPatient as string) ?? ""} onChange={(e) => set("idealPatient", e.target.value)} placeholder="e.g., Men 35–60 seeking hormone optimization" />
        </Field>
        <Field label="Consultation process">
          <Textarea rows={2} value={(data.consultationProcess as string) ?? ""} onChange={(e) => set("consultationProcess", e.target.value)} />
        </Field>
        <Field label="Insurance information">
          <Input value={(data.insuranceInfo as string) ?? ""} onChange={(e) => set("insuranceInfo", e.target.value)} placeholder="e.g., Out-of-network, superbills provided" />
        </Field>
        <Field label="Self-pay information">
          <Input value={(data.selfPayInfo as string) ?? ""} onChange={(e) => set("selfPayInfo", e.target.value)} placeholder="e.g., Direct-pay, membership" />
        </Field>
        <Field label="Financing information">
          <Input value={(data.financingInfo as string) ?? ""} onChange={(e) => set("financingInfo", e.target.value)} />
        </Field>
        <Field label="Languages supported">
          <Input value={(data.languages as string) ?? ""} onChange={(e) => set("languages", e.target.value)} placeholder="e.g., English, Spanish" />
        </Field>
        <Field label="Booking URL">
          <Input value={(data.bookingUrl as string) ?? ""} onChange={(e) => set("bookingUrl", e.target.value)} />
        </Field>
        <Field label="Social media URLs" hint="Comma-separated">
          <Input value={(data.socialUrls as string) ?? ""} onChange={(e) => set("socialUrls", e.target.value)} />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">Media uploads (logo, cover image, gallery photos, provider headshots) will be collected during profile preparation after application review.</p>
    </div>
  );
}

/* ── Stage 9: Verification ──────────────────────────────────── */
function StageVerification({ data, set }: { data: FormData; set: (k: string, v: string | boolean | string[]) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <h3 className="text-lg font-semibold text-foreground">Verification & consent</h3>
      <p className="text-sm text-muted-foreground">Please review and confirm the following before submitting your application.</p>
      <div className="space-y-3">
        <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-muted/30">
          <input type="checkbox" checked={!!data.accuracyConfirm} onChange={(e) => set("accuracyConfirm", e.target.checked)} className="mt-0.5 accent-teal-600" />
          <span className="text-sm text-muted-foreground"><strong className="font-semibold text-foreground">Required.</strong> The information provided is accurate to the best of my knowledge.</span>
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-muted/30">
          <input type="checkbox" checked={!!data.verifyConsent} onChange={(e) => set("verifyConsent", e.target.checked)} className="mt-0.5 accent-teal-600" />
          <span className="text-sm text-muted-foreground"><strong className="font-semibold text-foreground">Required.</strong> Novalyte AI may verify clinic, provider, and credential information through appropriate channels.</span>
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-muted/30">
          <input type="checkbox" checked={!!data.termsConsent} onChange={(e) => set("termsConsent", e.target.checked)} className="mt-0.5 accent-teal-600" />
          <span className="text-sm text-muted-foreground"><strong className="font-semibold text-foreground">Required.</strong> I agree to the Novalyte AI Clinic Directory terms and understand that submission does not guarantee approval.</span>
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-muted/30">
          <input type="checkbox" checked={!!data.contactConsent} onChange={(e) => set("contactConsent", e.target.checked)} className="mt-0.5 accent-teal-600" />
          <span className="text-sm text-muted-foreground"><strong className="font-semibold text-foreground">Required.</strong> I agree to be contacted regarding this application.</span>
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-muted/30">
          <input type="checkbox" checked={!!data.mediaConsent} onChange={(e) => set("mediaConsent", e.target.checked)} className="mt-0.5 accent-teal-600" />
          <span className="text-sm text-muted-foreground"><strong className="font-semibold text-foreground">Optional.</strong> The clinic owns or has permission to use any media uploaded for the directory profile.</span>
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-muted/30">
          <input type="checkbox" checked={!!data.marketingConsent} onChange={(e) => set("marketingConsent", e.target.checked)} className="mt-0.5 accent-teal-600" />
          <span className="text-sm text-muted-foreground"><strong className="font-semibold text-foreground">Optional.</strong> I agree to receive marketing communications about Novalyte AI services. Consent is not required.</span>
        </label>
      </div>
    </div>
  );
}

/* ── Stage 10: Review ───────────────────────────────────────── */
function StageReview({ data, set, onJumpTo }: { data: FormData; set: (k: string, v: string | boolean | string[]) => void; onJumpTo: (stage: number) => void }) {
  const sections = [
    { stage: 0, label: "Organization", value: (data.legalName as string) ?? "—" },
    { stage: 2, label: "Decision Maker", value: `${data.dmFirstName ?? ""} ${data.dmLastName ?? ""}`.trim() || "—" },
    { stage: 3, label: "Credentials", value: data.orgNpi ? `NPI: ${data.orgNpi}` : "—" },
    { stage: 4, label: "Treatments", value: Array.isArray(data.treatments) ? `${(data.treatments as string[]).length} selected` : "—" },
    { stage: 5, label: "Patient Operations", value: data.monthlyInquiries ? `${data.monthlyInquiries} inquiries/mo` : "—" },
    { stage: 6, label: "Growth Interests", value: data.acquisitionInterest ?? "—" },
    { stage: 7, label: "Directory Profile", value: data.shortDescription ? "Content provided" : "—" },
    { stage: 8, label: "Verification", value: data.accuracyConfirm ? "Confirmed" : "—" },
  ];
  return (
    <div className="space-y-4 novalyte-fade-up">
      <h3 className="text-lg font-semibold text-foreground">Review your application</h3>
      <p className="text-sm text-muted-foreground">Review each section before submitting. Click any section to edit.</p>
      <div className="space-y-2">
        {sections.map((s) => (
          <button key={s.stage} onClick={() => onJumpTo(s.stage)} className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3.5 text-left transition hover:border-teal-200">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{s.value}</p>
            </div>
            <span className="text-xs font-medium text-teal-700">Edit</span>
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-4">
        <p className="text-xs text-teal-800">By submitting, you confirm that the information provided is accurate and that Novalyte AI may verify clinic and provider information. Submission does not guarantee directory approval. Applying is free.</p>
      </div>
    </div>
  );
}

/* ── Post-submission confirmation ───────────────────────────── */
export function ApplicationConfirmation({ applicationId, clinicName, onBackToClinics }: { applicationId: string; clinicName: string; onBackToClinics: () => void }) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="mx-auto w-full max-w-2xl py-12">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-premium-sm text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">Your clinic application has been received</h2>
        <p className="mt-2 text-sm text-muted-foreground">Thank you. We will review your application and contact the authorized representative if additional information is required.</p>

        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5 text-left">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Application Reference</p>
              <p className="mt-1 font-mono text-lg font-bold text-foreground">{applicationId}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Clinic</p>
              <p className="mt-1 font-semibold text-foreground">{clinicName || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Submitted</p>
              <p className="mt-1 font-medium text-foreground">{today}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">UNDER REVIEW</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Review process</p>
          <ol className="mt-3 space-y-2.5">
            {[
              "Application completeness review",
              "Clinic and credential verification",
              "Directory-profile preparation",
              "Clinic approval and confirmation",
              "Profile publication",
              "Optional growth-services discussion",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">{i + 1}</span>
                <span className="text-foreground/80">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={onBackToClinics}>Back to Clinics Page</Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Save your application reference: <span className="font-mono font-bold">{applicationId}</span></p>
      </div>
    </div>
  );
}
