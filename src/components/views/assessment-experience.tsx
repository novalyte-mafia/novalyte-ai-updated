"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmartImage } from "@/components/shared/smart-image";
import { VerificationBadge } from "@/components/shared/badges";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { Logo } from "@/components/site/logo";
import { splitCsv, colorClasses, initials, US_STATES } from "@/lib/constants";
import type { ClinicT } from "@/lib/types";
import type { AssessmentConfig, Question } from "@/lib/assessment-config";
import { navigate } from "@/lib/nav";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, CheckCircle2, MapPin, Video, AlertCircle,
  Sparkles, ShieldCheck, Lock, X, Clock, FileText, BookOpen,
  Building2, ArrowRight as ArrowRightIcon,
} from "lucide-react";

type Answers = Record<string, string | string[] | Record<string, unknown>>;

export function AssessmentExperience({
  config,
  clinics,
  onExit,
}: {
  config: AssessmentConfig;
  clinics: ClinicT[];
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<"intro" | "questions" | "review" | "results">("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{ readiness: string; matchedClinicIds: string[] } | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [saved, setSaved] = useState(false);

  // Filter questions by conditional logic
  const activeQuestions = useMemo(() => {
    return config.questions.filter((q) => {
      if (q.showIf) return q.showIf(answers);
      return true;
    });
  }, [config.questions, answers]);

  const totalSteps = activeQuestions.length;
  const currentQuestion = phase === "questions" ? activeQuestions[stepIndex] : null;

  // Determine current stage for progress rail
  const currentStageId = currentQuestion?.stage ?? (phase === "review" ? "review" : phase === "results" ? "review" : "info");
  const currentStageIndex = config.stages.findIndex((s) => s.id === currentStageId);

  const setAnswer = useCallback((id: string, value: string | string[] | Record<string, unknown>) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setSaved(false);
  }, []);

  // Show "Progress saved" indicator after answer changes
  useEffect(() => {
    if (!saved && phase === "questions") {
      const t = setTimeout(() => setSaved(true), 800);
      return () => clearTimeout(t);
    }
  }, [answers, phase, saved]);

  // Auto-advance for single-choice questions
  function handleSingleSelect(id: string, value: string) {
    setAnswer(id, value);
    setTransitioning(true);
    setTimeout(() => {
      if (stepIndex < totalSteps - 1) {
        setStepIndex((s) => s + 1);
      } else {
        setPhase("review");
      }
      setTransitioning(false);
    }, 300);
  }

  function canProceed(): boolean {
    if (!currentQuestion) return false;
    if (!currentQuestion.required) return true;
    const a = answers[currentQuestion.id];
    if (a == null) return false;
    if (typeof a === "string") return a.length > 0;
    if (Array.isArray(a)) return a.length > 0;
    // contact fields
    if (currentQuestion.type === "contact-name") {
      const c = a as { firstName?: string; lastName?: string };
      return !!(c.firstName && c.lastName);
    }
    if (currentQuestion.type === "contact-email") {
      const c = a as { email?: string; phone?: string };
      return !!(c.email && c.phone);
    }
    if (currentQuestion.type === "contact-location") {
      const c = a as { zip?: string; state?: string };
      return !!(c.zip && c.state);
    }
    if (currentQuestion.type === "consent") {
      const c = a as { consentContact?: boolean };
      return !!c.consentContact;
    }
    return false;
  }

  function next() {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((s) => s + 1);
    } else {
      setPhase("review");
    }
  }

  function back() {
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
    } else {
      setPhase("intro");
    }
  }

  function computeReadiness(): { status: string; clinics: string[] } {
    const timeline = answers["timeline"] as string | undefined;
    const selfPay = answers["self_pay"] as string | undefined;
    const contactLoc = answers["contact_location"] as { state?: string } | undefined;
    const careFormat = answers["care_format"] as string | undefined;
    const consent = answers["consent"] as { consentContact?: boolean } | undefined;

    const matched = clinics
      .filter((c) => {
        const specs = splitCsv(c.specialties);
        const specMatch = specs.some((s) => s.toLowerCase().includes(config.treatmentLabel.toLowerCase().split(" ")[0])) ||
          config.treatmentLabel.toLowerCase().includes(s.toLowerCase().split(" ")[0]);
        const stateMatch = !contactLoc?.state || c.state === contactLoc.state;
        const teleMatch = careFormat !== "in-person" || c.telehealth;
        return (specMatch || stateMatch) && teleMatch;
      })
      .sort((a, b) => {
        const sa = (a.state === contactLoc?.state ? 2 : 0) + (a.telehealth ? 1 : 0);
        const sb = (b.state === contactLoc?.state ? 2 : 0) + (b.telehealth ? 1 : 0);
        return sb - sa;
      })
      .slice(0, 4)
      .map((c) => c.id);

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

  async function submit() {
    setSubmitting(true);
    const { status, clinics: matched } = computeReadiness();
    const contactName = answers["contact_name"] as { firstName?: string; lastName?: string } | undefined;
    const contactEmail = answers["contact_email"] as { email?: string; phone?: string } | undefined;
    const contactLoc = answers["contact_location"] as { zip?: string; state?: string } | undefined;
    const consent = answers["consent"] as { consentContact?: boolean; consentSms?: boolean } | undefined;

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          treatmentType: config.slug,
          ageRange: answers["age_range"] ?? null,
          locationState: contactLoc?.state ?? null,
          zip: contactLoc?.zip ?? null,
          concerns: Array.isArray(answers["goal"]) ? answers["goal"] : (answers["goal"] ? [answers["goal"] as string] : []),
          treatmentInterest: config.treatmentLabel,
          careFormat: answers["care_format"] ?? null,
          telehealthPref: answers["care_format"] === "telehealth" || answers["care_format"] === "either",
          timeline: answers["timeline"] ?? null,
          selfPayOpenness: answers["self_pay"] ?? null,
          budgetRange: answers["budget"] ?? null,
          firstName: contactName?.firstName ?? null,
          lastName: contactName?.lastName ?? null,
          email: contactEmail?.email ?? null,
          phone: contactEmail?.phone ?? null,
          consentContact: consent?.consentContact ?? false,
          consentSms: consent?.consentSms ?? false,
          internalStatus: status,
          matchedClinicIds: matched,
          sourcePage: "assessment-fullscreen",
        }),
      });
      if (!res.ok) throw new Error();
      setResults({ readiness: status, matchedClinicIds: matched });
      setPhase("results");
      toast.success("Assessment complete.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const matchedClinics = results ? clinics.filter((c) => results.matchedClinicIds.includes(c.id)) : [];

  return (
    <div className="fixed inset-0 z-[70] bg-background">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <button onClick={onExit} aria-label="Exit assessment">
          <Logo size="sm" />
        </button>
        <div className="flex items-center gap-2">
          {phase === "questions" && (
            <span className="text-xs font-medium text-muted-foreground">
              {stepIndex + 1} / {totalSteps}
            </span>
          )}
          <button onClick={onExit} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Save and exit">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile progress bar */}
      {phase === "questions" && (
        <div className="h-1 bg-muted lg:hidden">
          <div className="h-full bg-teal-600 transition-all duration-300" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
        </div>
      )}

      <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen">
        {/* LEFT PANEL — Context (desktop only, 38%) */}
        <aside className="hidden w-[38%] shrink-0 overflow-y-auto border-r border-border bg-gradient-to-b from-teal-50/30 to-background lg:block novalyte-scroll">
          <div className="flex h-full flex-col p-8">
            {/* Logo */}
            <button onClick={onExit} className="mb-8 w-fit">
              <Logo />
            </button>

            {/* Treatment image */}
            <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl shadow-premium-md">
              <SmartImage
                src={config.heroImage}
                alt={config.heroImageAlt}
                fill
                sizes="38vw"
                imgClassName="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" aria-hidden />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/90">Assessment</p>
                <p className="text-sm font-bold text-white">{config.treatmentLabel}</p>
              </div>
            </div>

            {/* Stage context */}
            {phase === "intro" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">{config.intro.eyebrow}</p>
                  <h2 className="mt-1 text-2xl font-semibold text-foreground">{config.intro.headline}</h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{config.intro.supporting}</p>
                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-teal-600" />
                    <span className="font-medium text-foreground">{config.intro.estimatedTime}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    <span className="text-muted-foreground">{config.intro.whatHappensNext}</span>
                  </div>
                </div>
              </div>
            )}

            {phase === "questions" && currentQuestion && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                    {config.stages.find((s) => s.id === currentQuestion.stage)?.label}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">{currentQuestion.title}</h3>
                </div>
                {currentQuestion.whyWeAsk && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Why we ask</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{currentQuestion.whyWeAsk}</p>
                  </div>
                )}
                {saved && (
                  <p className="flex items-center gap-1.5 text-xs text-teal-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Progress saved
                  </p>
                )}
              </div>
            )}

            {phase === "review" && (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Review</p>
                <h3 className="text-lg font-semibold text-foreground">Review your responses</h3>
                <p className="text-sm text-muted-foreground">Take a moment to review your answers before submitting. You can go back to edit any section.</p>
              </div>
            )}

            {phase === "results" && (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Complete</p>
                <h3 className="text-lg font-semibold text-foreground">Your personalized results</h3>
                <p className="text-sm text-muted-foreground">Based on your responses, we've organized next steps and potential clinic matches.</p>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Privacy note — always visible at bottom */}
            <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                <p className="text-xs leading-relaxed text-muted-foreground">{config.context.privacyNote}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL — Active question (62%) */}
        <main className="flex-1 overflow-y-auto novalyte-scroll">
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 py-6 sm:px-8 sm:py-12 lg:px-12">
            {/* Desktop progress rail */}
            {phase === "questions" && (
              <div className="mb-8 hidden lg:block">
                <div className="flex items-center gap-1">
                  {config.stages.map((stage, i) => {
                    const isComplete = i < currentStageIndex;
                    const isCurrent = i === currentStageIndex;
                    return (
                      <div key={stage.id} className="flex flex-1 items-center gap-1">
                        <div className="flex flex-1 flex-col gap-1">
                          <div className={cn(
                            "h-1 rounded-full transition-colors",
                            isComplete ? "bg-teal-600" : isCurrent ? "bg-teal-400" : "bg-muted",
                          )} />
                          <span className={cn(
                            "text-[10px] font-medium",
                            isComplete ? "text-teal-700" : isCurrent ? "text-foreground" : "text-muted-foreground/60",
                          )}>
                            {stage.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content area */}
            <div className="flex-1">
              {phase === "intro" && <IntroScreen config={config} onBegin={() => { setPhase("questions"); setStepIndex(0); }} onExit={onExit} />}

              {phase === "questions" && currentQuestion && (
                <div className={cn("novalyte-fade-up", transitioning && "opacity-60")}>
                  <QuestionScreen
                    question={currentQuestion}
                    stageLabel={config.stages.find((s) => s.id === currentQuestion.stage)?.label ?? ""}
                    value={answers[currentQuestion.id]}
                    onChange={(v) => {
                      if (currentQuestion.type === "single") {
                        handleSingleSelect(currentQuestion.id, v as string);
                      } else {
                        setAnswer(currentQuestion.id, v);
                      }
                    }}
                  />
                </div>
              )}

              {phase === "review" && (
                <ReviewScreen
                  config={config}
                  answers={answers}
                  onEdit={(stageId) => {
                    const idx = activeQuestions.findIndex((q) => q.stage === stageId);
                    if (idx >= 0) { setStepIndex(idx); setPhase("questions"); }
                  }}
                  onSubmit={submit}
                  submitting={submitting}
                />
              )}

              {phase === "results" && results && (
                <ResultsScreen
                  config={config}
                  answers={answers}
                  readiness={results.readiness}
                  matchedClinics={matchedClinics}
                  onRetake={() => { setPhase("intro"); setStepIndex(0); setAnswers({}); setResults(null); }}
                  onExit={onExit}
                />
              )}
            </div>

            {/* Nav buttons — hidden for single-choice (auto-advances) and intro/results */}
            {phase === "questions" && currentQuestion && currentQuestion.type !== "single" && (
              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <Button variant="ghost" onClick={back}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <div className="flex items-center gap-2">
                  {!canProceed() && currentQuestion.required && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3" /> Required
                    </span>
                  )}
                  <Button
                    className="bg-teal-600 text-white hover:bg-teal-700"
                    onClick={next}
                    disabled={!canProceed()}
                  >
                    {stepIndex < totalSteps - 1 ? "Continue" : "Review"} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {phase === "questions" && currentQuestion && currentQuestion.type === "single" && (
              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <Button variant="ghost" onClick={back}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <span className="text-xs text-muted-foreground">Select an option to continue automatically</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Intro screen ────────────────────────────────────────────── */
function IntroScreen({ config, onBegin, onExit }: { config: AssessmentConfig; onBegin: () => void; onExit: () => void }) {
  return (
    <div className="flex flex-col justify-center novalyte-fade-up" style={{ minHeight: "60vh" }}>
      {/* Mobile image */}
      <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl shadow-premium-md lg:hidden">
        <SmartImage src={config.heroImage} alt={config.heroImageAlt} fill sizes="100vw" imgClassName="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" aria-hidden />
        <div className="absolute bottom-3 left-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/90">Assessment</p>
          <p className="text-sm font-bold text-white">{config.treatmentLabel}</p>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">{config.intro.eyebrow}</p>
      <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {config.intro.headline}
      </h1>
      <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
        {config.intro.supporting}
      </p>

      {/* Selected treatment + details */}
      <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-5 shadow-premium-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Selected interest</span>
          <span className="text-sm font-semibold text-foreground">{config.treatmentLabel}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Estimated time</span>
          <span className="text-sm font-semibold text-foreground">{config.intro.estimatedTime}</span>
        </div>
        <div className="border-t border-border pt-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">What happens next</p>
          <p className="mt-1 text-sm text-foreground/80">{config.intro.whatHappensNext}</p>
        </div>
      </div>

      <DisclaimerBanner tone="amber" className="mt-5">
        Novalyte AI does not diagnose medical conditions or determine medical eligibility. A licensed provider determines whether any treatment is appropriate.
      </DisclaimerBanner>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onBegin}>
          Begin Assessment <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <Button size="lg" variant="outline" onClick={onExit}>
          Choose a Different Treatment
        </Button>
      </div>
    </div>
  );
}

/* ── Question screen ─────────────────────────────────────────── */
function QuestionScreen({
  question,
  stageLabel,
  value,
  onChange,
}: {
  question: Question;
  stageLabel: string;
  value: unknown;
  onChange: (v: string | string[] | Record<string, unknown>) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">{stageLabel}</p>
      <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {question.title}
      </h2>
      {question.desc && <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">{question.desc}</p>}

      <div className="mt-6">
        <QuestionInput question={question} value={value} onChange={onChange} />
      </div>
    </div>
  );
}

/* ── Question input types ────────────────────────────────────── */
function QuestionInput({
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
      <div className="grid gap-2.5">
        {question.options?.map((opt) => {
          const active = (value as string) === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-5 py-4 text-left text-base font-medium transition",
                active
                  ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200 shadow-premium-sm"
                  : "border-border bg-card text-foreground hover:border-teal-200 hover:bg-teal-50/30",
              )}
            >
              <span>{opt.label}</span>
              {active && <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" />}
            </button>
          );
        })}
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
      <div className="grid gap-2.5 sm:grid-cols-2">
        {question.options?.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-5 py-4 text-left text-base font-medium transition",
                active
                  ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200 shadow-premium-sm"
                  : "border-border bg-card text-foreground hover:border-teal-200 hover:bg-teal-50/30",
              )}
            >
              <span className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition",
                active ? "border-teal-500 bg-teal-500" : "border-muted-foreground/30",
              )}>
                {active && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "contact-name") {
    const v = (value as { firstName?: string; lastName?: string }) ?? {};
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-sm font-medium">First name</Label>
          <Input
            className="h-12 text-base"
            value={v.firstName ?? ""}
            onChange={(e) => onChange({ ...v, firstName: e.target.value })}
            placeholder="First name"
            autoComplete="given-name"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-sm font-medium">Last name</Label>
          <Input
            className="h-12 text-base"
            value={v.lastName ?? ""}
            onChange={(e) => onChange({ ...v, lastName: e.target.value })}
            placeholder="Last name"
            autoComplete="family-name"
          />
        </div>
      </div>
    );
  }

  if (question.type === "contact-email") {
    const v = (value as { email?: string; phone?: string }) ?? {};
    return (
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label className="text-sm font-medium">Email address</Label>
          <Input
            type="email"
            className="h-12 text-base"
            value={v.email ?? ""}
            onChange={(e) => onChange({ ...v, email: e.target.value.trim() })}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-sm font-medium">Mobile phone number</Label>
          <Input
            type="tel"
            className="h-12 text-base"
            value={v.phone ?? ""}
            onChange={(e) => onChange({ ...v, phone: e.target.value })}
            placeholder="(555) 123-4567"
            autoComplete="tel"
          />
        </div>
      </div>
    );
  }

  if (question.type === "contact-location") {
    const v = (value as { zip?: string; state?: string }) ?? {};
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-sm font-medium">ZIP code</Label>
          <Input
            className="h-12 text-base"
            value={v.zip ?? ""}
            onChange={(e) => onChange({ ...v, zip: e.target.value.replace(/[^0-9]/g, "").slice(0, 5) })}
            placeholder="78701"
            autoComplete="postal-code"
            inputMode="numeric"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-sm font-medium">State</Label>
          <select
            value={v.state ?? ""}
            onChange={(e) => onChange({ ...v, state: e.target.value })}
            className="h-12 rounded-md border border-input bg-background px-3 text-base"
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    );
  }

  if (question.type === "consent") {
    const v = (value as { consentContact?: boolean; consentSms?: boolean }) ?? {};
    return (
      <div className="space-y-3">
        <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 cursor-pointer hover:bg-muted/30">
          <input
            type="checkbox"
            checked={v.consentContact ?? false}
            onChange={(e) => onChange({ ...v, consentContact: e.target.checked })}
            className="mt-1 h-5 w-5 accent-teal-600"
          />
          <span className="text-sm text-muted-foreground">
            <strong className="font-semibold text-foreground">I agree to be contacted.</strong> By submitting this form, I agree that Novalyte AI and participating clinics may contact me regarding my consultation request.
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 cursor-pointer hover:bg-muted/30">
          <input
            type="checkbox"
            checked={v.consentSms ?? false}
            onChange={(e) => onChange({ ...v, consentSms: e.target.checked })}
            className="mt-1 h-5 w-5 accent-teal-600"
          />
          <span className="text-sm text-muted-foreground">
            <strong className="font-semibold text-foreground">SMS consent (optional).</strong> I agree to receive text messages related to my request. Message and data rates may apply. Consent is not required to use the service.
          </span>
        </label>
      </div>
    );
  }

  return null;
}

/* ── Review screen ───────────────────────────────────────────── */
function ReviewScreen({
  config,
  answers,
  onEdit,
  onSubmit,
  submitting,
}: {
  config: AssessmentConfig;
  answers: Answers;
  onEdit: (stageId: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const contactName = answers["contact_name"] as { firstName?: string; lastName?: string } | undefined;
  const contactEmail = answers["contact_email"] as { email?: string; phone?: string } | undefined;
  const contactLoc = answers["contact_location"] as { zip?: string; state?: string } | undefined;
  const goal = answers["goal"];
  const goalLabel = Array.isArray(goal) ? goal.join(", ") : goal as string;
  const careFormat = answers["care_format"] as string | undefined;
  const timeline = answers["timeline"] as string | undefined;
  const selfPay = answers["self_pay"] as string | undefined;

  const sections = [
    { stage: "info", label: "Your Information", value: [contactName?.firstName, contactName?.lastName].filter(Boolean).join(" ") || "—", detail: `${contactEmail?.email ?? "—"} · ${contactLoc?.zip ?? "—"}, ${contactLoc?.state ?? "—"}` },
    { stage: "goals", label: "Your Goals", value: goalLabel || "—", detail: "" },
    { stage: "preferences", label: "Care Preferences", value: careFormat ? careFormat.replace(/-/g, " ") : "—", detail: "" },
    { stage: "timing", label: "Timing & Readiness", value: timeline ? timeline.replace(/-/g, " ") : "—", detail: selfPay ? `Self-pay: ${selfPay.replace(/-/g, " ")}` : "" },
  ];

  return (
    <div className="novalyte-fade-up">
      <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Review</p>
      <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Review your responses
      </h1>
      <p className="mt-3 text-base text-muted-foreground">Take a moment to review your answers. You can edit any section before submitting.</p>

      <div className="mt-6 space-y-3">
        {sections.map((s) => (
          <div key={s.stage} className="flex items-start justify-between rounded-xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-sm font-medium capitalize text-foreground">{s.value}</p>
              {s.detail && <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>}
            </div>
            <button onClick={() => onEdit(s.stage)} className="ml-3 shrink-0 text-xs font-medium text-teal-700 hover:underline">
              Edit
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Consent</p>
        <p className="mt-2 text-sm text-muted-foreground">Please confirm your consent above to complete the assessment. You can scroll up to review the consent options.</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onSubmit} disabled={submitting || !(answers["consent"] as { consentContact?: boolean })?.consentContact}>
          {submitting ? "Submitting..." : "Submit Assessment"} <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">A licensed provider determines whether testing or treatment is medically appropriate.</p>
    </div>
  );
}

/* ── Results screen ──────────────────────────────────────────── */
function ResultsScreen({
  config,
  answers,
  readiness,
  matchedClinics,
  onRetake,
  onExit,
}: {
  config: AssessmentConfig;
  answers: Answers;
  readiness: string;
  matchedClinics: ClinicT[];
  onRetake: () => void;
  onExit: () => void;
}) {
  const isReady = readiness === "consultation-ready" || readiness === "high-intent";
  const isInsurance = readiness === "insurance-dependent";
  const title = isReady ? config.results.readyTitle : isInsurance ? config.results.insuranceTitle : config.results.researchingTitle;
  const desc = isReady ? config.results.readyDesc : isInsurance ? config.results.insuranceDesc : config.results.researchingDesc;
  const goal = answers["goal"];
  const goalLabel = Array.isArray(goal) ? goal.join(", ") : goal as string;
  const timeline = answers["timeline"] as string | undefined;
  const careFormat = answers["care_format"] as string | undefined;

  return (
    <div className="novalyte-fade-up py-4">
      {/* Success header */}
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Assessment complete</p>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </div>
      </div>
      <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">{desc}</p>

      {/* Summary */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-premium-xs">
        <h3 className="text-sm font-semibold text-foreground">Your summary</h3>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 text-teal-600" />
            <div><span className="text-muted-foreground">Treatment: </span><span className="font-medium text-foreground">{config.treatmentLabel}</span></div>
          </div>
          {goalLabel && (
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 text-teal-600" />
              <div><span className="text-muted-foreground">Goals: </span><span className="font-medium text-foreground capitalize">{goalLabel}</span></div>
            </div>
          )}
          {timeline && (
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-teal-600" />
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

      {/* High-intent: clinic matches */}
      {isReady && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">Clinics that match your preferences</h3>
          {matchedClinics.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No clinics matched your exact preferences yet. Browse the full directory.
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
        </div>
      )}

      {/* Research-stage: educational resources */}
      {!isReady && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Recommended next steps</h3>
          <p className="mt-1 text-xs text-muted-foreground">You may benefit from reviewing additional information before requesting a consultation.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("journal")}><BookOpen className="mr-1 h-3.5 w-3.5" /> Read Journal articles</Button>
            <Button size="sm" variant="outline" onClick={() => navigate("treatment-detail", undefined, { slug: config.slug })}><FileText className="mr-1 h-3.5 w-3.5" /> View treatment guide</Button>
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="mt-6 flex flex-wrap gap-2">
        {isReady && (
          <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => navigate("directory")}>
            View Matching Clinics <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" onClick={onRetake}>Retake assessment</Button>
        <Button variant="ghost" onClick={onExit}>Back to Patients</Button>
      </div>

      <div className="mt-6 flex items-start gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
        <span>A licensed provider determines whether testing or treatment is medically appropriate. Novalyte AI does not diagnose or prescribe.</span>
      </div>
    </div>
  );
}
