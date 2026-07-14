"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { SmartImage } from "@/components/shared/smart-image";
import { splitCsv, colorClasses, initials, US_STATES } from "@/lib/constants";
import type { ClinicT } from "@/lib/types";
import type { AssessmentConfig, Question } from "@/lib/assessment-config";
import { navigate } from "@/lib/nav";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, CheckCircle2, MapPin, Video, AlertCircle,
  Sparkles, ShieldCheck, Phone, Mail, User, Calendar, DollarSign,
} from "lucide-react";

type Answers = Record<string, string | string[] | { name: string; email: string; phone: string; zip: string; state: string; preferredContact: string; bestTime: string } | { consentContact: boolean; consentSms: boolean }>;

export function AssessmentEngine({
  config,
  clinics,
  onClose,
}: {
  config: AssessmentConfig;
  clinics: ClinicT[];
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{ readiness: string; matchedClinicIds: string[]; saved: boolean } | null>(null);

  const total = config.questions.length;
  const progress = ((step + 1) / total) * 100;
  const question = config.questions[step];

  const setAnswer = useCallback((id: string, value: string | string[] | Record<string, unknown>) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  function canProceed(): boolean {
    if (!question.required) return true;
    const a = answers[question.id];
    if (a == null) return false;
    if (typeof a === "string") return a.length > 0;
    if (Array.isArray(a)) return a.length > 0;
    if (question.type === "contact") {
      const c = a as { name?: string; email?: string; phone?: string; zip?: string; state?: string };
      return !!(c.name && c.email && c.phone && c.zip && c.state);
    }
    if (question.type === "consent") {
      const c = a as { consentContact?: boolean };
      return !!c.consentContact;
    }
    return false;
  }

  function computeReadiness(): { status: string; clinics: string[] } {
    const timeline = answers["timeline"] as string | undefined;
    const selfPay = answers["self_pay"] as string | undefined;
    const contact = answers["contact"] as { state?: string } | undefined;
    const careFormat = answers["care_format"] as string | undefined;
    const consent = answers["consent"] as { consentContact?: boolean } | undefined;

    // Match clinics based on treatment + state + telehealth
    const matched = clinics
      .filter((c) => {
        const specs = splitCsv(c.specialties);
        const specMatch = specs.some((s) => s.toLowerCase().includes(config.treatmentLabel.toLowerCase().split(" ")[0])) ||
          config.treatmentLabel.toLowerCase().includes(s.toLowerCase().split(" ")[0]);
        const stateMatch = !contact?.state || c.state === contact.state;
        const teleMatch = careFormat !== "in-person" || c.telehealth || careFormat !== "in-person";
        return (specMatch || stateMatch) && teleMatch;
      })
      .sort((a, b) => {
        const sa = (a.state === contact?.state ? 2 : 0) + (a.telehealth ? 1 : 0);
        const sb = (b.state === contact?.state ? 2 : 0) + (b.telehealth ? 1 : 0);
        return sb - sa;
      })
      .slice(0, 4)
      .map((c) => c.id);

    // Determine readiness status
    let status = "researching";
    if (timeline && timeline !== "researching" && timeline !== "within-3-months") {
      if (selfPay === "yes" || selfPay === "possibly") status = "consultation-ready";
      else status = "high-intent";
    } else if (timeline === "within-3-months") {
      status = "high-intent";
    } else if (selfPay === "insurance-only") {
      status = "insurance-dependent";
    }
    if (!consent?.consentContact) status = "incomplete";

    return { status, clinics: matched };
  }

  async function finish() {
    setSubmitting(true);
    const { status, clinics: matched } = computeReadiness();
    const contact = answers["contact"] as { name?: string; email?: string; phone?: string; zip?: string; state?: string; preferredContact?: string; bestTime?: string } | undefined;
    const consent = answers["consent"] as { consentContact?: boolean; consentSms?: boolean } | undefined;
    const nameParts = (contact?.name ?? "").trim().split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") ?? "";

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          treatmentType: config.slug,
          ageRange: answers["age_range"] ?? null,
          locationState: contact?.state ?? null,
          zip: contact?.zip ?? null,
          concerns: Array.isArray(answers["goal"]) ? answers["goal"] : (answers["goal"] ? [answers["goal"] as string] : []),
          treatmentInterest: config.treatmentLabel,
          careFormat: answers["care_format"] ?? null,
          telehealthPref: answers["care_format"] === "telehealth" || answers["care_format"] === "either",
          timeline: answers["timeline"] ?? null,
          selfPayOpenness: answers["self_pay"] ?? null,
          budgetRange: answers["budget"] ?? null,
          firstName,
          lastName,
          email: contact?.email ?? null,
          phone: contact?.phone ?? null,
          preferredContact: contact?.preferredContact ?? null,
          bestTime: contact?.bestTime ?? null,
          consentContact: consent?.consentContact ?? false,
          consentSms: consent?.consentSms ?? false,
          internalStatus: status,
          matchedClinicIds: matched,
          sourcePage: "patients",
        }),
      });
      if (!res.ok) throw new Error();
      setResults({ readiness: status, matchedClinicIds: matched, saved: true });
      toast.success("Assessment complete. Review your personalized results below.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (step < total - 1) setStep((s) => s + 1);
    else finish();
  }

  function back() {
    if (step === 0) onClose();
    else setStep((s) => s - 1);
  }

  const matchedClinics = results ? clinics.filter((c) => results.matchedClinicIds.includes(c.id)) : [];

  if (results) {
    return (
      <AssessmentResults
        config={config}
        answers={answers}
        readiness={results.readiness}
        matchedClinics={matchedClinics}
        onRetake={() => { setStep(0); setAnswers({}); setResults(null); }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-premium-sm">
      {/* Header with treatment + progress */}
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-600 text-white">{config.shortLabel}</Badge>
            <span className="text-sm font-semibold text-foreground">{config.treatmentLabel} Assessment</span>
          </div>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Step {step + 1} of {total}
          </span>
          <Progress value={progress} className="h-1.5 flex-1" />
        </div>
      </div>

      {/* Question */}
      <div className="p-5 sm:p-8">
        <div className="min-h-[260px]">
          <QuestionRenderer question={question} value={answers[question.id]} onChange={(v) => setAnswer(question.id, v)} />
        </div>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between border-t pt-5">
          <Button variant="ghost" size="sm" onClick={back}>
            <ArrowLeft className="mr-1 h-4 w-4" /> {step === 0 ? "Cancel" : "Back"}
          </Button>
          <div className="flex items-center gap-2">
            {!canProceed() && question.required && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" /> Required
              </span>
            )}
            <Button
              size="sm"
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={next}
              disabled={!canProceed() || submitting}
            >
              {step < total - 1 ? (
                <>Continue <ArrowRight className="ml-1 h-4 w-4" /></>
              ) : submitting ? (
                "Saving..."
              ) : (
                <>See my results <CheckCircle2 className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Question renderer ───────────────────────────────────────── */
function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: unknown;
  onChange: (v: string | string[] | Record<string, unknown>) => void;
}) {
  if (question.type === "single") {
    return (
      <div>
        <h3 className="text-lg font-semibold text-foreground">{question.title}</h3>
        {question.desc && <p className="mt-1.5 text-sm text-muted-foreground">{question.desc}</p>}
        <RadioGroup
          value={(value as string) ?? ""}
          onValueChange={(v) => onChange(v)}
          className="mt-4 space-y-2"
        >
          {question.options?.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition",
                (value as string) === opt.value
                  ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200"
                  : "border-border hover:border-teal-200 hover:bg-teal-50/30",
              )}
            >
              <RadioGroupItem value={opt.value} id={`${question.id}-${opt.value}`} />
              <span className="font-medium">{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>
    );
  }

  if (question.type === "multi") {
    const selected = (value as string[]) ?? [];
    const toggle = (v: string) => {
      const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
      onChange(next);
    };
    return (
      <div>
        <h3 className="text-lg font-semibold text-foreground">{question.title}</h3>
        {question.desc && <p className="mt-1.5 text-sm text-muted-foreground">{question.desc}</p>}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {question.options?.map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-3 text-sm transition",
                  active
                    ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200"
                    : "border-border hover:border-teal-200 hover:bg-teal-50/30",
                )}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle(opt.value)}
                  className="accent-teal-600"
                />
                <span className="font-medium">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "text") {
    return (
      <div>
        <h3 className="text-lg font-semibold text-foreground">{question.title}</h3>
        {question.desc && <p className="mt-1.5 text-sm text-muted-foreground">{question.desc}</p>}
        <Input
          className="mt-4"
          placeholder={question.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (question.type === "contact") {
    const v = (value as { name?: string; email?: string; phone?: string; zip?: string; state?: string; preferredContact?: string; bestTime?: string }) ?? {};
    const update = (field: string, val: string) => onChange({ ...v, [field]: val });
    return (
      <div>
        <h3 className="text-lg font-semibold text-foreground">{question.title}</h3>
        {question.desc && <p className="mt-1.5 text-sm text-muted-foreground">{question.desc}</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-xs">Full name *</Label>
            <Input value={v.name ?? ""} onChange={(e) => update("name", e.target.value)} placeholder="First and last name" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Email *</Label>
            <Input type="email" value={v.email ?? ""} onChange={(e) => update("email", e.target.value.trim())} placeholder="you@example.com" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Mobile phone *</Label>
            <Input type="tel" value={v.phone ?? ""} onChange={(e) => update("phone", e.target.value)} placeholder="(555) 123-4567" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">ZIP code *</Label>
            <Input value={v.zip ?? ""} onChange={(e) => update("zip", e.target.value)} placeholder="78701" maxLength={10} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">State *</Label>
            <select
              value={v.state ?? ""}
              onChange={(e) => update("state", e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select state</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Preferred contact method</Label>
            <select
              value={v.preferredContact ?? ""}
              onChange={(e) => update("preferredContact", e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Any</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="sms">Text message</option>
            </select>
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label className="text-xs">Best time to contact (optional)</Label>
            <Input value={v.bestTime ?? ""} onChange={(e) => update("bestTime", e.target.value)} placeholder="e.g., weekday mornings" />
          </div>
        </div>
      </div>
    );
  }

  if (question.type === "consent") {
    const v = (value as { consentContact?: boolean; consentSms?: boolean }) ?? {};
    return (
      <div>
        <h3 className="text-lg font-semibold text-foreground">{question.title}</h3>
        {question.desc && <p className="mt-1.5 text-sm text-muted-foreground">{question.desc}</p>}
        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/30">
            <input
              type="checkbox"
              checked={v.consentContact ?? false}
              onChange={(e) => onChange({ ...v, consentContact: e.target.checked })}
              className="mt-0.5 accent-teal-600"
            />
            <span className="text-sm text-muted-foreground">
              <strong className="font-medium text-foreground">I agree to be contacted.</strong> By submitting this form, I agree that Novalyte AI and participating clinics may contact me about my consultation request.
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/30">
            <input
              type="checkbox"
              checked={v.consentSms ?? false}
              onChange={(e) => onChange({ ...v, consentSms: e.target.checked })}
              className="mt-0.5 accent-teal-600"
            />
            <span className="text-sm text-muted-foreground">
              <strong className="font-medium text-foreground">SMS consent (optional).</strong> I agree to receive text messages regarding my request. Message and data rates may apply. Consent is not required to use the service.
            </span>
          </label>
        </div>
      </div>
    );
  }

  return null;
}

/* ── Results page ────────────────────────────────────────────── */
function AssessmentResults({
  config,
  answers,
  readiness,
  matchedClinics,
  onRetake,
  onClose,
}: {
  config: AssessmentConfig;
  answers: Answers;
  readiness: string;
  matchedClinics: ClinicT[];
  onRetake: () => void;
  onClose: () => void;
}) {
  const isReady = readiness === "consultation-ready" || readiness === "high-intent";
  const title = isReady ? config.results.readyTitle : config.results.researchingTitle;
  const desc = isReady ? config.results.readyDesc : config.results.researchingDesc;
  const goals = Array.isArray(answers["goal"]) ? answers["goal"] as string[] : [];
  const timeline = answers["timeline"] as string | undefined;
  const careFormat = answers["care_format"] as string | undefined;

  return (
    <div className="space-y-5">
      {/* Hero result */}
      <div className="overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-b from-teal-50/60 to-card shadow-premium-sm">
        <div className="relative h-32">
          <SmartImage src={config.heroImage} alt={config.heroImageAlt} fill sizes="(max-width: 768px) 100vw, 768px" imgClassName="object-cover" className="rounded-t-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          <div className="absolute bottom-3 left-5 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-premium-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Your results</p>
              <p className="text-sm font-bold text-foreground">{config.treatmentLabel}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          <DisclaimerBanner tone="amber" className="mt-4">
            Based on the goals you selected, these treatment categories may be worth discussing with a licensed healthcare professional. <strong className="font-semibold">This assessment is informational and does not provide a medical diagnosis, medical eligibility, or guarantee treatment approval.</strong>
          </DisclaimerBanner>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium-xs">
        <h4 className="text-sm font-semibold text-foreground">Your summary</h4>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {goals.length > 0 && (
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 text-teal-600" />
              <div><span className="text-muted-foreground">Goals: </span><span className="font-medium text-foreground">{goals.join(", ")}</span></div>
            </div>
          )}
          {timeline && (
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-teal-600" />
              <div><span className="text-muted-foreground">Timeline: </span><span className="font-medium text-foreground capitalize">{timeline.replace(/-/g, " ")}</span></div>
            </div>
          )}
          {careFormat && (
            <div className="flex items-start gap-2">
              <Video className="mt-0.5 h-4 w-4 text-teal-600" />
              <div><span className="text-muted-foreground">Care format: </span><span className="font-medium text-foreground capitalize">{careFormat}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Clinic matches */}
      <div>
        <h4 className="text-sm font-semibold text-foreground">Clinics that may be worth exploring</h4>
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
                <button
                  key={c.id}
                  onClick={() => navigate("clinic-profile", undefined, { id: c.id })}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition hover:border-teal-200 hover:shadow-sm"
                >
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white", col.bg)}>{initials(c.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {c.city}, {c.state}</p>
                  </div>
                  <VerificationBadge verified={c.verified} status={c.verificationStatus} />
                </button>
              );
            })}
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">Do not claim clinical suitability unless confirmed by a licensed provider.</p>
      </div>

      {/* Next steps */}
      <div className="flex flex-wrap gap-2">
        <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => navigate("directory")}>
          View Matching Clinics <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onRetake}>Retake assessment</Button>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
        Your responses are stored securely. A licensed provider determines appropriate care. Novalyte AI does not diagnose or prescribe.
      </div>
    </div>
  );
}
