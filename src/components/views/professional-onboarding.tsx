"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/site/logo";
import { navigate } from "@/lib/nav";
import { US_STATES } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Upload, Linkedin, Globe, X,
  Plus, Trash2, Lock, User, FileText, GraduationCap, Award, Sparkles,
  Settings, Eye, ShieldCheck, Briefcase, Building2,
} from "lucide-react";

const PRO_STEPS = [
  { id: 0, label: "Account", icon: User },
  { id: 1, label: "Professional Identity", icon: Briefcase },
  { id: 2, label: "Resume & Links", icon: FileText },
  { id: 3, label: "Employment History", icon: Briefcase },
  { id: 4, label: "Education", icon: GraduationCap },
  { id: 5, label: "Licenses & Certifications", icon: Award },
  { id: 6, label: "Skills & Specialties", icon: Sparkles },
  { id: 7, label: "Job Preferences", icon: Settings },
  { id: 8, label: "Profile Visibility", icon: Eye },
  { id: 9, label: "Review & Publish", icon: ShieldCheck },
];

export function ProfessionalOnboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, unknown>>({});
  const total = PRO_STEPS.length;
  const progress = ((step + 1) / total) * 100;

  function set(key: string, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (step < total - 1) setStep(step + 1);
    else {
      toast.success("Professional profile created. Welcome to Novalyte Workforce.");
      navigate("workforce");
    }
  }

  function back() {
    if (step === 0) navigate("join");
    else setStep(step - 1);
  }

  return (
    <div className="fixed inset-0 z-[70] bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <button onClick={() => navigate("join")} aria-label="Exit"><Logo size="sm" /></button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Step {step + 1} of {total}</span>
          <button onClick={() => navigate("join")} className="text-xs text-muted-foreground hover:text-foreground">Save & Exit</button>
        </div>
      </div>
      {/* Progress */}
      <div className="h-1 bg-muted">
        <div className="h-full bg-teal-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex h-[calc(100vh-3.5rem-0.25rem)]">
        {/* Left: stage rail (desktop) */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border bg-muted/20 p-4 lg:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Onboarding progress</p>
          <div className="space-y-1">
            {PRO_STEPS.map((s, i) => {
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

        {/* Right: content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="min-h-[400px]">
              {step === 0 && <StepAccount data={data} set={set} />}
              {step === 1 && <StepIdentity data={data} set={set} />}
              {step === 2 && <StepResumeLinks data={data} set={set} />}
              {step === 3 && <StepEmployment data={data} set={set} />}
              {step === 4 && <StepEducation data={data} set={set} />}
              {step === 5 && <StepLicenses data={data} set={set} />}
              {step === 6 && <StepSkills data={data} set={set} />}
              {step === 7 && <StepPreferences data={data} set={set} />}
              {step === 8 && <StepVisibility data={data} set={set} />}
              {step === 9 && <StepReview data={data} />}
            </div>

            {/* Nav */}
            <div className="mt-8 flex items-center justify-between border-t pt-5">
              <Button variant="ghost" onClick={back}>
                <ArrowLeft className="mr-1 h-4 w-4" /> {step === 0 ? "Back to Join" : "Back"}
              </Button>
              <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={next}>
                {step < total - 1 ? <>Continue <ArrowRight className="ml-1 h-4 w-4" /></> : <>Publish Profile <CheckCircle2 className="ml-1 h-4 w-4" /></>}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Field helpers ───────────────────────────────────────────── */
function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium">{label}{required && <span className="text-rose-500"> *</span>}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ChipToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition", active ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200" : "border-border bg-card text-foreground/70 hover:border-teal-200")}>
      {active && <CheckCircle2 className="mr-1 inline h-3 w-3" />}{children}
    </button>
  );
}

/* ── Step 1: Account ────────────────────────────────────────── */
function StepAccount({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Create your account</h2><p className="mt-1 text-sm text-muted-foreground">Start by setting up your login credentials.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name" required><Input value={(data.firstName as string) ?? ""} onChange={(e) => set("firstName", e.target.value)} autoComplete="given-name" /></Field>
        <Field label="Last name" required><Input value={(data.lastName as string) ?? ""} onChange={(e) => set("lastName", e.target.value)} autoComplete="family-name" /></Field>
      </div>
      <Field label="Email address" required><Input type="email" value={(data.email as string) ?? ""} onChange={(e) => set("email", e.target.value.trim())} placeholder="you@example.com" autoComplete="email" /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Password" required><Input type="password" value={(data.password as string) ?? ""} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" /></Field>
        <Field label="Phone number" required><Input type="tel" value={(data.phone as string) ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 123-4567" autoComplete="tel" /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="City"><Input value={(data.city as string) ?? ""} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="State" required><Select value={(data.state as string) ?? ""} onValueChange={(v) => set("state", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" required className="mt-0.5 accent-teal-600" /><span>I agree to the Novalyte AI Terms of Service and Privacy Policy.</span></label>
    </div>
  );
}

/* ── Step 2: Professional Identity ──────────────────────────── */
function StepIdentity({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Professional identity</h2><p className="mt-1 text-sm text-muted-foreground">Tell us about your professional background.</p></div>
      <Field label="Profile picture" hint="JPG or PNG, max 5MB"><div className="flex items-center gap-3"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground"><Upload className="h-6 w-6" /></div><Button variant="outline" size="sm">Upload photo</Button></div></Field>
      <Field label="Professional headline" hint="e.g., Family Nurse Practitioner | Telehealth and Primary Care" required><Input value={(data.headline as string) ?? ""} onChange={(e) => set("headline", e.target.value)} placeholder="Professional headline" /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Current role" required><Input value={(data.currentRole as string) ?? ""} onChange={(e) => set("currentRole", e.target.value)} placeholder="e.g., Nurse Practitioner" /></Field>
        <Field label="Years of experience" required><Select value={(data.yearsExp as string) ?? ""} onValueChange={(v) => set("yearsExp", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Entry level", "1–2 years", "3–5 years", "5–10 years", "10+ years"].map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select></Field>
      </div>
      <Field label="Professional summary"><Textarea rows={4} value={(data.summary as string) ?? ""} onChange={(e) => set("summary", e.target.value)} placeholder="Write a brief professional summary..." /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Current employment status"><Select value={(data.employmentStatus as string) ?? ""} onValueChange={(v) => set("employmentStatus", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Employed", "Seeking opportunities", "Open to opportunities", "Unemployed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Availability date"><Input type="date" value={(data.availabilityDate as string) ?? ""} onChange={(e) => set("availabilityDate", e.target.value)} /></Field>
      </div>
    </div>
  );
}

/* ── Step 3: Resume & Links ─────────────────────────────────── */
function StepResumeLinks({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Resume & professional links</h2><p className="mt-1 text-sm text-muted-foreground">Upload your resume and add professional links.</p></div>
      <Field label="Resume upload" hint="PDF or DOCX, max 10MB">
        {resumeUploaded ? (
          <div className="flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50/40 p-3">
            <FileText className="h-5 w-5 text-teal-600" />
            <span className="flex-1 text-sm text-foreground">resume.pdf</span>
            <button onClick={() => setResumeUploaded(false)} className="text-xs text-rose-600 hover:underline">Remove</button>
          </div>
        ) : (
          <button onClick={() => setResumeUploaded(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground transition hover:border-teal-300 hover:bg-teal-50/30">
            <Upload className="h-5 w-5" /> Click to upload your resume
          </button>
        )}
      </Field>
      <Field label="LinkedIn profile URL"><div className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-muted-foreground" /><Input value={(data.linkedin as string) ?? ""} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/..." /></div></Field>
      <Field label="Portfolio URL"><div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /><Input value={(data.portfolio as string) ?? ""} onChange={(e) => set("portfolio", e.target.value)} placeholder="your-portfolio.com" /></div></Field>
      <Field label="Personal website"><Input value={(data.website as string) ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="your-website.com" /></Field>
      <Field label="Publications or research links" hint="Comma-separated"><Input value={(data.publications as string) ?? ""} onChange={(e) => set("publications", e.target.value)} /></Field>
      <Field label="GitHub (for technical roles)"><Input value={(data.github as string) ?? ""} onChange={(e) => set("github", e.target.value)} placeholder="github.com/username" /></Field>
    </div>
  );
}

/* ── Step 4: Employment History ─────────────────────────────── */
function StepEmployment({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const jobs = (data.employmentHistory as Array<Record<string, string>>) ?? [];
  function addJob() { set("employmentHistory", [...jobs, { org: "", title: "", type: "", location: "", start: "", end: "", current: "", responsibilities: "" }]); }
  function updateJob(i: number, field: string, value: string) { const next = [...jobs]; next[i] = { ...next[i], [field]: value }; set("employmentHistory", next); }
  function removeJob(i: number) { set("employmentHistory", jobs.filter((_, idx) => idx !== i)); }
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-semibold text-foreground">Employment history</h2><p className="mt-1 text-sm text-muted-foreground">Add your previous positions.</p></div><Button variant="outline" size="sm" onClick={addJob}><Plus className="mr-1 h-3.5 w-3.5" /> Add position</Button></div>
      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center"><Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50" /><p className="mt-2 text-sm text-muted-foreground">No positions added yet.</p><Button variant="outline" size="sm" className="mt-3" onClick={addJob}><Plus className="mr-1 h-3.5 w-3.5" /> Add your first position</Button></div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">Position {i + 1}</span><button onClick={() => removeJob(i)} className="text-xs text-rose-600 hover:underline"><Trash2 className="mr-1 inline h-3 w-3" />Remove</button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Organization"><Input value={job.org} onChange={(e) => updateJob(i, "org", e.target.value)} /></Field>
                <Field label="Job title"><Input value={job.title} onChange={(e) => updateJob(i, "title", e.target.value)} /></Field>
                <Field label="Employment type"><Select value={job.type} onValueChange={(v) => updateJob(i, "type", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Full-time", "Part-time", "Contract", "Per-diem", "Temporary"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Location"><Input value={job.location} onChange={(e) => updateJob(i, "location", e.target.value)} /></Field>
                <Field label="Start date"><Input type="date" value={job.start} onChange={(e) => updateJob(i, "start", e.target.value)} /></Field>
                <Field label="End date"><Input type="date" value={job.end} onChange={(e) => updateJob(i, "end", e.target.value)} disabled={job.current === "true"} /></Field>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={job.current === "true"} onChange={(e) => updateJob(i, "current", e.target.checked ? "true" : "")} className="accent-teal-600" /> I currently work here</label>
              <div className="mt-2"><Field label="Responsibilities & achievements"><Textarea rows={2} value={job.responsibilities} onChange={(e) => updateJob(i, "responsibilities", e.target.value)} /></Field></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Step 5: Education ──────────────────────────────────────── */
function StepEducation({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const education = (data.education as Array<Record<string, string>>) ?? [];
  function addEdu() { set("education", [...education, { institution: "", degree: "", field: "", gradDate: "" }]); }
  function updateEdu(i: number, field: string, value: string) { const next = [...education]; next[i] = { ...next[i], [field]: value }; set("education", next); }
  function removeEdu(i: number) { set("education", education.filter((_, idx) => idx !== i)); }
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-semibold text-foreground">Education</h2><p className="mt-1 text-sm text-muted-foreground">Add your educational background.</p></div><Button variant="outline" size="sm" onClick={addEdu}><Plus className="mr-1 h-3.5 w-3.5" /> Add education</Button></div>
      {education.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center"><GraduationCap className="mx-auto h-8 w-8 text-muted-foreground/50" /><p className="mt-2 text-sm text-muted-foreground">No education entries yet.</p><Button variant="outline" size="sm" className="mt-3" onClick={addEdu}><Plus className="mr-1 h-3.5 w-3.5" /> Add education</Button></div>
      ) : (
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">Education {i + 1}</span><button onClick={() => removeEdu(i)} className="text-xs text-rose-600 hover:underline"><Trash2 className="mr-1 inline h-3 w-3" />Remove</button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Institution"><Input value={edu.institution} onChange={(e) => updateEdu(i, "institution", e.target.value)} /></Field>
                <Field label="Degree"><Input value={edu.degree} onChange={(e) => updateEdu(i, "degree", e.target.value)} placeholder="e.g., BSN, MSN, MD" /></Field>
                <Field label="Field of study"><Input value={edu.field} onChange={(e) => updateEdu(i, "field", e.target.value)} /></Field>
                <Field label="Graduation date"><Input type="date" value={edu.gradDate} onChange={(e) => updateEdu(i, "gradDate", e.target.value)} /></Field>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Step 6: Licenses & Certifications ──────────────────────── */
function StepLicenses({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const creds = (data.credentials as Array<Record<string, string>>) ?? [];
  function addCred() { set("credentials", [...creds, { type: "", name: "", authority: "", state: "", issueDate: "", expiryDate: "" }]); }
  function updateCred(i: number, field: string, value: string) { const next = [...creds]; next[i] = { ...next[i], [field]: value }; set("credentials", next); }
  function removeCred(i: number) { set("credentials", creds.filter((_, idx) => idx !== i)); }
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-semibold text-foreground">Licenses & certifications</h2><p className="mt-1 text-sm text-muted-foreground">Add your professional credentials. Credential numbers and documents are kept private by default.</p></div><Button variant="outline" size="sm" onClick={addCred}><Plus className="mr-1 h-3.5 w-3.5" /> Add credential</Button></div>
      {creds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center"><Award className="mx-auto h-8 w-8 text-muted-foreground/50" /><p className="mt-2 text-sm text-muted-foreground">No credentials added yet.</p><Button variant="outline" size="sm" className="mt-3" onClick={addCred}><Plus className="mr-1 h-3.5 w-3.5" /> Add credential</Button></div>
      ) : (
        <div className="space-y-3">
          {creds.map((cred, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">Credential {i + 1}</span><button onClick={() => removeCred(i)} className="text-xs text-rose-600 hover:underline"><Trash2 className="mr-1 inline h-3 w-3" />Remove</button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Credential type"><Select value={cred.type} onValueChange={(v) => updateCred(i, "type", v)}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{["RN", "NP", "PA-C", "MD", "DO", "LPN", "CMA", "BLS", "ACLS", "PALS", "ARRT", "CPR", "Board certification", "Other"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="License/certification name"><Input value={cred.name} onChange={(e) => updateCred(i, "name", e.target.value)} /></Field>
                <Field label="Issuing authority"><Input value={cred.authority} onChange={(e) => updateCred(i, "authority", e.target.value)} /></Field>
                <Field label="Issuing state"><Select value={cred.state} onValueChange={(v) => updateCred(i, "state", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Issue date"><Input type="date" value={cred.issueDate} onChange={(e) => updateCred(i, "issueDate", e.target.value)} /></Field>
                <Field label="Expiration date"><Input type="date" value={cred.expiryDate} onChange={(e) => updateCred(i, "expiryDate", e.target.value)} /></Field>
              </div>
              <div className="mt-2"><Field label="Supporting document (optional)" hint="PDF, max 5MB. Kept private."><button className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground hover:border-teal-300"><Upload className="h-4 w-4" /> Upload document</button></Field></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Step 7: Skills & Specialties ───────────────────────────── */
function StepSkills({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const clinicalSpecialties = ["Primary Care", "Men's Health", "Women's Health", "Hormone Care", "Medical Weight Management", "Telehealth", "Behavioral Health", "Rehabilitation", "Imaging", "Laboratory", "Cardiology", "Endocrinology", "Dermatology", "Oncology", "Orthopedics", "Home Health", "Urgent Care", "Longevity", "Sexual Wellness"];
  const selected = (data.specialties as string[]) ?? [];
  function toggle(v: string) { set("specialties", selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]); }
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Skills & specialties</h2><p className="mt-1 text-sm text-muted-foreground">Select your clinical specialties and skills.</p></div>
      <div>
        <Label className="text-xs font-medium">Clinical specialties</Label>
        <div className="mt-2 flex flex-wrap gap-1.5">{clinicalSpecialties.map((s) => <ChipToggle key={s} active={selected.includes(s)} onClick={() => toggle(s)}>{s}</ChipToggle>)}</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Healthcare settings" hint="Comma-separated"><Input value={(data.settings as string) ?? ""} onChange={(e) => set("settings", e.target.value)} placeholder="e.g., Outpatient, Inpatient, Telehealth" /></Field>
        <Field label="EHR systems" hint="Comma-separated"><Input value={(data.ehr as string) ?? ""} onChange={(e) => set("ehr", e.target.value)} placeholder="e.g., Epic, Cerner, Jane" /></Field>
        <Field label="Languages" hint="Comma-separated"><Input value={(data.languages as string) ?? ""} onChange={(e) => set("languages", e.target.value)} placeholder="e.g., English, Spanish" /></Field>
        <Field label="Other skills" hint="Comma-separated"><Input value={(data.skills as string) ?? ""} onChange={(e) => set("skills", e.target.value)} placeholder="e.g., Phlebotomy, IV therapy, Patient education" /></Field>
      </div>
    </div>
  );
}

/* ── Step 8: Job Preferences ────────────────────────────────── */
function StepPreferences({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const empTypes = ["Full-time", "Part-time", "Permanent", "Contract", "Temporary", "Per-diem"];
  const workArr = ["Remote", "Hybrid", "On-site"];
  const selectedEmp = (data.empTypes as string[]) ?? [];
  const selectedArr = (data.workArrangements as string[]) ?? [];
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Job preferences</h2><p className="mt-1 text-sm text-muted-foreground">Tell us what kind of work you're looking for.</p></div>
      <div><Label className="text-xs font-medium">Employment type</Label><div className="mt-2 flex flex-wrap gap-1.5">{empTypes.map((t) => <ChipToggle key={t} active={selectedEmp.includes(t)} onClick={() => set("empTypes", selectedEmp.includes(t) ? selectedEmp.filter((x) => x !== t) : [...selectedEmp, t])}>{t}</ChipToggle>)}</div></div>
      <div><Label className="text-xs font-medium">Work arrangement</Label><div className="mt-2 flex flex-wrap gap-1.5">{workArr.map((w) => <ChipToggle key={w} active={selectedArr.includes(w)} onClick={() => set("workArrangements", selectedArr.includes(w) ? selectedArr.filter((x) => x !== w) : [...selectedArr, w])}>{w}</ChipToggle>)}</div></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Preferred locations" hint="States or cities, comma-separated"><Input value={(data.preferredLocations as string) ?? ""} onChange={(e) => set("preferredLocations", e.target.value)} /></Field>
        <Field label="Maximum travel distance (miles)"><Input type="number" value={(data.travelDistance as string) ?? ""} onChange={(e) => set("travelDistance", e.target.value)} placeholder="e.g., 50" /></Field>
        <Field label="Willingness to relocate"><Select value={(data.relocate as string) ?? ""} onValueChange={(v) => set("relocate", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Yes", "No", "Open to discussion"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Compensation preference"><Input value={(data.compPref as string) ?? ""} onChange={(e) => set("compPref", e.target.value)} placeholder="e.g., $90k–$120k" /></Field>
        <Field label="Preferred schedule"><Select value={(data.schedule as string) ?? ""} onValueChange={(v) => set("schedule", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Day shift", "Evening shift", "Night shift", "Flexible", "Weekdays only"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Start-date availability"><Input type="date" value={(data.startDate as string) ?? ""} onChange={(e) => set("startDate", e.target.value)} /></Field>
      </div>
    </div>
  );
}

/* ── Step 9: Profile Visibility ─────────────────────────────── */
function StepVisibility({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  const options = [
    { key: "discoverable", label: "Employers can discover my profile", default: true },
    { key: "contactVisible", label: "Contact information is visible to employers", default: false },
    { key: "compVisible", label: "Compensation preferences are visible", default: false },
    { key: "currentEmpVisible", label: "Current employment is visible", default: true },
    { key: "recruiterContact", label: "Recruiters may contact me", default: true },
    { key: "talentSearch", label: "Appear in talent-search results", default: true },
  ];
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Profile visibility</h2><p className="mt-1 text-sm text-muted-foreground">Control how your profile appears to healthcare organizations.</p></div>
      <div className="space-y-2">
        {options.map((opt) => {
          const val = data[opt.key] as boolean | undefined;
          return (
            <label key={opt.key} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-muted/30">
              <input type="checkbox" checked={val ?? opt.default} onChange={(e) => set(opt.key, e.target.checked)} className="mt-0.5 accent-teal-600" />
              <span className="text-sm text-muted-foreground">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 10: Review ────────────────────────────────────────── */
function StepReview({ data }: { data: Record<string, unknown> }) {
  const sections = [
    { label: "Account", value: `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() || "—" },
    { label: "Professional identity", value: (data.headline as string) ?? "—" },
    { label: "Resume & links", value: data.linkedin ? "LinkedIn added" : "—" },
    { label: "Employment history", value: Array.isArray(data.employmentHistory) ? `${(data.employmentHistory as unknown[]).length} positions` : "—" },
    { label: "Education", value: Array.isArray(data.education) ? `${(data.education as unknown[]).length} entries` : "—" },
    { label: "Licenses & certifications", value: Array.isArray(data.credentials) ? `${(data.credentials as unknown[]).length} credentials` : "—" },
    { label: "Skills & specialties", value: Array.isArray(data.specialties) ? `${(data.specialties as string[]).length} selected` : "—" },
    { label: "Job preferences", value: Array.isArray(data.empTypes) ? (data.empTypes as string[]).join(", ") : "—" },
  ];
  return (
    <div className="space-y-4 novalyte-fade-up">
      <div><h2 className="text-2xl font-semibold text-foreground">Review & publish</h2><p className="mt-1 text-sm text-muted-foreground">Review your profile before publishing. You can edit any section after publishing.</p></div>
      <div className="space-y-2">
        {sections.map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p><p className="mt-0.5 text-sm font-medium text-foreground">{s.value}</p></div>
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-4"><p className="text-xs text-teal-800">After publishing, you'll be taken to the Workforce job board where you can browse and apply to healthcare roles.</p></div>
    </div>
  );
}
