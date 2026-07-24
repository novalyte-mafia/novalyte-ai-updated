"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { splitCsv, colorClasses, initials, US_STATES } from "@/lib/constants";
import type { ClinicT } from "@/lib/types";
import { navigate } from "@/lib/nav";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, CheckCircle2, MapPin, Video, AlertCircle, Sparkles, ShieldCheck,
} from "lucide-react";

const STEPS = [
  "Age range",
  "Location",
  "Primary concerns",
  "Symptoms",
  "Treatment interest",
  "Care format",
  "Contact & consent",
] as const;

const CONCERNS = [
  "Low energy / fatigue",
  "Low libido",
  "Weight management",
  "Mood changes",
  "Hair loss",
  "Sexual health",
  "Recovery / performance",
  "Preventive screening",
  "Hormone-related questions",
];

const SYMPTOMS = [
  "Fatigue",
  "Reduced drive",
  "Difficulty concentrating",
  "Sleep changes",
  "Changes in body composition",
  "Erection difficulties",
  "Mood changes",
  "None of the above",
];

const TREATMENTS = [
  "Testosterone Replacement Therapy",
  "Hormone Optimization",
  "Erectile Dysfunction Care",
  "Medical Weight Loss",
  "GLP-1 Programs",
  "Peptide Therapy",
  "Hair Restoration",
  "Sexual Wellness",
  "Longevity Medicine",
  "Performance & Recovery",
  "Preventive Men's Health",
  "Not sure yet",
];

type FormData = {
  ageRange: string;
  locationState: string;
  zip: string;
  concerns: string[];
  symptoms: string[];
  treatmentInterest: string;
  careFormat: string;
  telehealthPref: boolean;
  contactName: string;
  contactEmail: string;
  consent: boolean;
};

const initial: FormData = {
  ageRange: "", locationState: "", zip: "", concerns: [], symptoms: [],
  treatmentInterest: "", careFormat: "", telehealthPref: false,
  contactName: "", contactEmail: "", consent: false,
};

export function PatientAssessment({ clinics, onMatched }: { clinics: ClinicT[]; onMatched?: (ids: string[]) => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{ clinicIds: string[]; saved: boolean } | null>(null);

  const total = STEPS.length;
  const progress = ((step + 1) / total) * 100;

  function toggle(field: "concerns" | "symptoms", value: string) {
    setData((d) => {
      const arr = d[field];
      const has = arr.includes(value);
      let next: string[];
      if (field === "symptoms" && value === "None of the above") {
        next = has ? [] : ["None of the above"];
      } else {
        next = has ? arr.filter((v) => v !== value) : [...arr.filter((v) => v !== "None of the above"), value];
      }
      return { ...d, [field]: next };
    });
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return !!data.ageRange;
      case 1: return !!data.locationState || !!data.zip;
      case 2: return data.concerns.length > 0;
      case 3: return data.symptoms.length > 0;
      case 4: return !!data.treatmentInterest;
      case 5: return !!data.careFormat;
      case 6: return !!data.contactName && !!data.contactEmail && data.consent;
      default: return false;
    }
  }

  function matchClinics(): string[] {
    const interest = data.treatmentInterest;
    return clinics
      .filter((c) => {
        const specs = splitCsv(c.specialties);
        const specMatch = interest === "Not sure yet" || specs.some((s) => s.toLowerCase().includes(interest.toLowerCase().split(" ")[0])) || specs.some((s) => interest.toLowerCase().includes(s.toLowerCase().split(" ")[0]));
        const stateMatch = !data.locationState || c.state === data.locationState;
        const teleMatch = !data.telehealthPref || c.telehealth;
        // Score: prefer state + telehealth + specialty match
        return (specMatch || stateMatch) && teleMatch;
      })
      .sort((a, b) => {
        const sa = (a.state === data.locationState ? 2 : 0) + (a.telehealth ? 1 : 0) + (splitCsv(a.specialties).some((s) => s.toLowerCase().includes(interest.toLowerCase().split(" ")[0])) ? 2 : 0);
        const sb = (b.state === data.locationState ? 2 : 0) + (b.telehealth ? 1 : 0) + (splitCsv(b.specialties).some((s) => s.toLowerCase().includes(interest.toLowerCase().split(" ")[0])) ? 2 : 0);
        return sb - sa;
      })
      .slice(0, 4)
      .map((c) => c.id);
  }

  async function finish() {
    setSubmitting(true);
    const matched = matchClinics();
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageRange: data.ageRange,
          locationState: data.locationState || null,
          zip: data.zip || null,
          concerns: data.concerns,
          symptoms: data.symptoms,
          treatmentInterest: data.treatmentInterest,
          careFormat: data.careFormat,
          telehealthPref: data.careFormat === "telehealth" || data.careFormat === "either",
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          consent: data.consent,
          matchedClinicIds: matched,
        }),
      });
      if (!res.ok) throw new Error();
      setResults({ clinicIds: matched, saved: true });
      onMatched?.(matched);
      toast.success("Assessment complete. Review your matches below.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setData(initial);
    setStep(0);
    setResults(null);
  }

  const matchedClinics = results ? clinics.filter((c) => results.clinicIds.includes(c.id)) : [];

  if (results) {
    return (
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-b from-teal-50/50 to-card p-6 sm:p-8">
        <div className="flex items-center gap-2 text-teal-700">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">Your informational results</span>
        </div>
        <h3 className="mt-3 text-2xl font-semibold text-foreground">
          Care categories worth discussing with a licensed provider
        </h3>
        <div className="mt-6 rounded-xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">Based on your responses, you indicated interest in:</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge className="bg-teal-600 text-white">{data.treatmentInterest}</Badge>
            {data.concerns.map((c) => <Badge key={c} variant="outline" className="border-teal-200 text-teal-700">{c}</Badge>)}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Preferred format: <span className="font-medium text-foreground">{data.careFormat}</span>
            {data.locationState && <> · State: <span className="font-medium text-foreground">{data.locationState}</span></>}
            {(data.careFormat === "telehealth" || data.careFormat === "either") && <> · Telehealth: open</>}
          </p>
        </div>

        <h4 className="mt-7 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Clinics that may be worth exploring
        </h4>
        {matchedClinics.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No clinics matched your exact preferences yet. Try browsing the full directory.
            <div className="mt-3"><Button variant="outline" size="sm" onClick={() => navigate("directory")}>Browse directory</Button></div>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {matchedClinics.map((c) => {
              const col = colorClasses(c.logoColor);
              return (
                <div key={c.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white", col.bg)}>{initials(c.name)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {c.city}, {c.state}</p>
                    </div>
                    <VerificationBadge verified={c.verified} status={c.verificationStatus} className="ml-auto" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.telehealth && <StatusPill tone="teal"><Video className="h-3 w-3" /> Telehealth</StatusPill>}
                    {splitCsv(c.specialties).slice(0, 2).map((s) => <StatusPill key={s} tone="muted">{s}</StatusPill>)}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Do not claim clinical suitability unless confirmed by a licensed provider.
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => navigate("directory")} className="bg-teal-600 text-white hover:bg-teal-700">
            View full directory <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={restart}>Retake assessment</Button>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
          Your responses are stored securely and shared only to support your care navigation. A licensed provider determines appropriate care.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Step {step + 1} of {total}
        </span>
        <span className="text-sm text-muted-foreground">{STEPS[step]}</span>
      </div>
      <Progress value={progress} className="mt-2 h-1.5" />

      <div className="mt-6 min-h-[280px]">
        {step === 0 && (
          <Step title="What is your age range?" desc="Used only to suggest age-relevant care categories.">
            <RadioGroup value={data.ageRange} onValueChange={(v) => setData({ ...data, ageRange: v })}>
              {["18–29", "30–39", "40–49", "50–59", "60+"].map((a) => (
                <label key={a} className={choiceClass(data.ageRange === a)}>
                  <RadioGroupItem value={a} id={`age-${a}`} /> <span>{a}</span>
                </label>
              ))}
            </RadioGroup>
          </Step>
        )}
        {step === 1 && (
          <Step title="Where are you located?" desc="Helps surface clinics in your area or licensed in your state for telehealth.">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label className="text-xs">State</Label>
                <select
                  value={data.locationState}
                  onChange={(e) => setData({ ...data, locationState: e.target.value })}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select state</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">ZIP code (optional)</Label>
                <Input value={data.zip} onChange={(e) => setData({ ...data, zip: e.target.value })} placeholder="e.g. 78701" maxLength={10} />
              </div>
            </div>
          </Step>
        )}
        {step === 2 && (
          <Step title="What are your primary concerns?" desc="Select all that apply.">
            <div className="grid gap-2 sm:grid-cols-2">
              {CONCERNS.map((c) => (
                <label key={c} className={choiceClass(data.concerns.includes(c))}>
                  <input type="checkbox" checked={data.concerns.includes(c)} onChange={() => toggle("concerns", c)} className="accent-teal-600" />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </Step>
        )}
        {step === 3 && (
          <Step title="Which symptoms resonate with you?" desc="Select all that apply. This is informational only.">
            <div className="grid gap-2 sm:grid-cols-2">
              {SYMPTOMS.map((s) => (
                <label key={s} className={choiceClass(data.symptoms.includes(s))}>
                  <input type="checkbox" checked={data.symptoms.includes(s)} onChange={() => toggle("symptoms", s)} className="accent-teal-600" />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </Step>
        )}
        {step === 4 && (
          <Step title="Which treatment are you most interested in?" desc="Choose the category you'd like to explore. 'Not sure yet' is fine.">
            <RadioGroup value={data.treatmentInterest} onValueChange={(v) => setData({ ...data, treatmentInterest: v })}>
              <div className="grid gap-2 sm:grid-cols-2">
                {TREATMENTS.map((t) => (
                  <label key={t} className={choiceClass(data.treatmentInterest === t)}>
                    <RadioGroupItem value={t} id={`t-${t}`} /> <span>{t}</span>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </Step>
        )}
        {step === 5 && (
          <Step title="How would you prefer to receive care?" desc="We'll factor telehealth availability into your matches.">
            <RadioGroup value={data.careFormat} onValueChange={(v) => setData({ ...data, careFormat: v, telehealthPref: v === "telehealth" || v === "either" })}>
              {[
                { v: "in-person", l: "In-person care" },
                { v: "telehealth", l: "Telehealth (remote)" },
                { v: "either", l: "Either — open to both" },
              ].map((o) => (
                <label key={o.v} className={choiceClass(data.careFormat === o.v)}>
                  <RadioGroupItem value={o.v} id={`cf-${o.v}`} /> <span>{o.l}</span>
                </label>
              ))}
            </RadioGroup>
          </Step>
        )}
        {step === 6 && (
          <Step title="Where should we send your results?" desc="We use this only to share your informational results. We do not provide medical advice.">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="pa-name">Full name</Label>
                <Input id="pa-name" required value={data.contactName} onChange={(e) => setData({ ...data, contactName: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pa-email">Email</Label>
                <Input id="pa-email" type="email" required value={data.contactEmail} onChange={(e) => setData({ ...data, contactEmail: e.target.value })} />
              </div>
            </div>
            <label className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <input type="checkbox" checked={data.consent} onChange={(e) => setData({ ...data, consent: e.target.checked })} className="mt-0.5 accent-teal-600" />
              <span>
                I acknowledge this assessment is informational and does not provide a medical diagnosis, and that Novalyte AI is a technology platform that does not provide medical care. I consent to being contacted about care navigation. See the Privacy Policy.
              </span>
            </label>
          </Step>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t pt-5">
        <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        {step < total - 1 ? (
          <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={finish} disabled={!canProceed() || submitting}>
            {submitting ? "Saving..." : "See my results"} <CheckCircle2 className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      {!canProceed() && (
        <p className="mt-2 flex items-center justify-end gap-1 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" /> Please complete this step to continue
        </p>
      )}
    </div>
  );
}

function Step({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function choiceClass(active: boolean) {
  return cn(
    "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition",
    active ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200" : "border-border bg-background hover:border-teal-200 hover:bg-teal-50/30",
  );
}
