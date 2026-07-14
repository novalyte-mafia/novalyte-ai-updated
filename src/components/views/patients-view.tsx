"use client";

import { useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { DisclaimerBanner, MedicalDisclaimer } from "@/components/shared/disclaimer";
import { CTASection } from "@/components/shared/cta";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssessmentEngine } from "@/components/views/assessment-engine";
import { TREATMENT_LIST } from "@/lib/treatments";
import { ASSESSMENTS, type AssessmentConfig } from "@/lib/assessment-config";
import { navigate } from "@/lib/nav";
import { IMAGES, ALT_TEXT } from "@/lib/images";
import type { PlatformData } from "@/components/site/app-shell";
import {
  Stethoscope, ClipboardList, BookOpen, MapPin, MessageSquare, Phone,
  ArrowRight, Search, HeartPulse, ShieldCheck, Sparkles, CheckCircle2,
  Compass, Lock, Eye, HandHeart, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const JOURNEY = [
  { icon: Compass, title: "Select a goal or treatment", desc: "Browse treatment categories or let AI guide you." },
  { icon: ClipboardList, title: "Complete a short personalized assessment", desc: "A treatment-specific screening — not a generic form." },
  { icon: BookOpen, title: "Review relevant educational guidance", desc: "Understand what to ask a licensed provider." },
  { icon: MapPin, title: "Discover matching clinics", desc: "Find verified clinics matching your preferences." },
  { icon: MessageSquare, title: "Request a consultation", desc: "Send a structured request to the clinic." },
  { icon: Phone, title: "Speak with a licensed provider", desc: "A professional determines appropriate care." },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, title: "No diagnosis from Novalyte AI", desc: "We organize information. We do not diagnose or prescribe." },
  { icon: CheckCircle2, title: "No guaranteed treatment approval", desc: "A licensed provider decides what's appropriate for you." },
  { icon: HandHeart, title: "You choose whether to contact a clinic", desc: "No pressure. No fake urgency. Your decision." },
  { icon: Lock, title: "Privacy-first data handling", desc: "Your responses are stored securely with clear consent." },
  { icon: Eye, title: "Transparent consent", desc: "Separate permissions. Easy opt-out at any time." },
  { icon: ShieldCheck, title: "No fake reviews or claims", desc: "Clinics are independently responsible for care." },
];

const AI_PROMPTS = [
  "What brings you here today?",
  "What would you most like to improve?",
  "How long have you noticed this concern?",
  "Which symptoms or goals are most relevant?",
  "Are you looking for in-person care, telehealth, or either?",
  "How soon would you like to speak with a provider?",
];

const AI_CATEGORIES = [
  { value: "low-energy", label: "Low energy", treatments: ["testosterone-replacement-therapy", "hormone-optimization"] },
  { value: "motivation", label: "Reduced motivation", treatments: ["testosterone-replacement-therapy", "hormone-optimization"] },
  { value: "weight-gain", label: "Weight gain", treatments: ["medical-weight-loss", "glp-1"] },
  { value: "trouble-losing", label: "Trouble losing weight", treatments: ["medical-weight-loss", "glp-1"] },
  { value: "sexual-performance", label: "Sexual performance concerns", treatments: ["erectile-dysfunction", "sexual-wellness"] },
  { value: "hair-loss", label: "Hair loss", treatments: ["hair-restoration"] },
  { value: "muscle-recovery", label: "Muscle and recovery concerns", treatments: ["performance-recovery", "peptide-therapy"] },
  { value: "sleep", label: "Sleep concerns", treatments: ["hormone-optimization", "longevity-medicine"] },
  { value: "hormone", label: "Hormone concerns", treatments: ["hormone-optimization", "testosterone-replacement-therapy"] },
  { value: "preventive", label: "Preventive health", treatments: ["longevity-medicine"] },
  { value: "longevity", label: "Longevity", treatments: ["longevity-medicine"] },
  { value: "general", label: "General men's health guidance", treatments: ["longevity-medicine", "preventive-mens-health"] },
];

export function PatientsView({ data, onGetStarted: _onGetStarted }: { data: PlatformData; onGetStarted: () => void }) {
  const [activeAssessment, setActiveAssessment] = useState<AssessmentConfig | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);

  function toggleGoal(value: string) {
    setSelectedGoals((prev) => prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]);
  }

  // Compute recommended treatments from selected goals
  const recommendedTreatments = Array.from(new Set(
    selectedGoals.flatMap((g) => AI_CATEGORIES.find((c) => c.value === g)?.treatments ?? [])
  ))
    .map((slug) => ASSESSMENTS[slug])
    .filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-teal-50/50 to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-700 backdrop-blur">
                <Stethoscope className="h-3.5 w-3.5" /> For Patients
              </div>
              <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                Find the Right Path for Your{" "}
                <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Men's Health Goals
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Explore treatment options, understand what may be relevant to your goals, complete a
                personalized readiness assessment, and connect with qualified men's health clinics.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => document.getElementById("treatments")?.scrollIntoView({ behavior: "smooth" })}>
                  Start Your Assessment <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById("treatments")?.scrollIntoView({ behavior: "smooth" })}>
                  Explore Treatments
                </Button>
              </div>
              <button
                onClick={() => navigate("directory")}
                className="mt-3 text-sm font-medium text-teal-700 underline-offset-2 hover:underline"
              >
                Find a Clinic →
              </button>
              <DisclaimerBanner tone="amber" className="mt-5">
                Novalyte AI provides educational and technology services only. It does not diagnose medical conditions or provide medical care.
              </DisclaimerBanner>
            </div>

            {/* Hero image */}
            <div className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-premium-lg">
              <SmartImage
                src={IMAGES.hero.consultation}
                alt={ALT_TEXT.heroConsultation}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                imgClassName="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" aria-hidden />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl border border-white/20 bg-white/90 p-3 backdrop-blur-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Private · Trusted · Modern</p>
                  <p className="text-xs text-muted-foreground">Human-guided men's healthcare</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two pathways */}
      <SectionShell className="!pt-14">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-6">
            <div className="flex items-center gap-2 text-teal-700">
              <Zap className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Path A</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-foreground">I know what I'm looking for</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">Browse treatment categories and take a treatment-specific assessment.</p>
            <Button className="mt-4 bg-teal-600 text-white hover:bg-teal-700" size="sm" onClick={() => document.getElementById("treatments")?.scrollIntoView({ behavior: "smooth" })}>
              Explore treatments <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm">
            <div className="flex items-center gap-2 text-violet-700">
              <Compass className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Path B</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-foreground">Not sure where to start?</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">Tell us what you'd like to improve and Novalyte AI will suggest relevant categories.</p>
            <Button variant="outline" className="mt-4" size="sm" onClick={() => document.getElementById("ai-discovery")?.scrollIntoView({ behavior: "smooth" })}>
              Guide me <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SectionShell>

      {/* Treatment cards — "What are you interested in?" */}
      <SectionShell id="treatments" tone="muted">
        <SectionHeading
          eyebrow="Treatment Categories"
          title="What are you interested in?"
          description="Select a treatment to take a personalized assessment. Each assessment is tailored to that treatment — not a generic questionnaire."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TREATMENT_LIST.map((t) => {
            const config = ASSESSMENTS[t.slug];
            const hasAssessment = !!config;
            return (
              <div
                key={t.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-premium-sm transition hover:border-teal-300 hover:shadow-premium-lg"
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <SmartImage
                    src={IMAGES.treatments[t.slug as keyof typeof IMAGES.treatments] ?? IMAGES.hero.clinicScene}
                    alt={`${t.label} treatment category`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="transition duration-500 group-hover:scale-105"
                    imgClassName="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" aria-hidden />
                  <div className="absolute bottom-2 left-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
                      <HeartPulse className="h-4 w-4" />
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-foreground">{t.label}</h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">{t.explanation}</p>
                  <div className="mt-4 flex gap-2">
                    {hasAssessment ? (
                      <>
                        <Button size="sm" className="flex-1 bg-teal-600 text-white hover:bg-teal-700" onClick={() => setActiveAssessment(config)}>
                          Take Assessment
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate("journal")}>Learn More</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate("directory")}>
                        Find clinics
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionShell>

      {/* AI-guided care discovery */}
      <SectionShell id="ai-discovery">
        <SectionHeading
          eyebrow="AI-Guided Care Discovery"
          title="Not sure where to start?"
          description="Tell us what you would like to improve, and Novalyte AI will help organize relevant treatment categories and questions to discuss with a licensed provider."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Conversation panel */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Novalyte AI Assistant</p>
                <p className="text-xs text-muted-foreground">Informational guidance · Not a diagnosis</p>
              </div>
            </div>

            {!showAiResults ? (
              <div className="mt-5">
                <p className="text-sm text-muted-foreground">{AI_PROMPTS[1]}</p>
                <p className="mt-1 text-xs text-muted-foreground">Select all that apply.</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {AI_CATEGORIES.map((cat) => {
                    const active = selectedGoals.includes(cat.value);
                    return (
                      <label
                        key={cat.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition",
                          active
                            ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200"
                            : "border-border hover:border-teal-200 hover:bg-teal-50/30",
                        )}
                      >
                        <input type="checkbox" checked={active} onChange={() => toggleGoal(cat.value)} className="accent-teal-600" />
                        <span className="font-medium">{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-5 flex gap-2">
                  <Button
                    className="bg-teal-600 text-white hover:bg-teal-700"
                    disabled={selectedGoals.length === 0}
                    onClick={() => setShowAiResults(true)}
                  >
                    See recommendations <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                  {selectedGoals.length > 0 && (
                    <Button variant="ghost" onClick={() => setSelectedGoals([])}>Clear</Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Based on the goals you selected, these treatment categories may be worth discussing with a licensed healthcare professional.
                  </p>
                </div>
                <div className="space-y-2">
                  {recommendedTreatments.map((t) => (
                    <div key={t.slug} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                        <HeartPulse className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{t.treatmentLabel}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                      <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => { setActiveAssessment(t); setShowAiResults(false); }}>
                        Assess
                      </Button>
                    </div>
                  ))}
                </div>
                <DisclaimerBanner tone="amber">
                  This is informational guidance, not a medical diagnosis. Novalyte AI does not determine medical eligibility. Always consult a licensed provider.
                </DisclaimerBanner>
                <Button variant="outline" size="sm" onClick={() => { setShowAiResults(false); setSelectedGoals([]); }}>Start over</Button>
              </div>
            )}
          </div>

          {/* Prompts preview */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What we'll ask</h4>
            <ul className="mt-3 space-y-2">
              {AI_PROMPTS.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700">{i + 1}</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionShell>

      {/* How it works */}
      <SectionShell tone="muted">
        <SectionHeading eyebrow="How It Works" title="From curiosity to a real conversation in six steps" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {JOURNEY.map((j, i) => {
            const Icon = j.icon;
            return (
              <div key={j.title} className="relative rounded-2xl border border-border bg-card p-5 shadow-premium-xs">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white"><Icon className="h-4.5 w-4.5" /></span>
                  <span className="text-xs font-bold text-teal-600/60">Step {i + 1}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{j.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{j.desc}</p>
              </div>
            );
          })}
        </div>
      </SectionShell>

      {/* Trust section */}
      <SectionShell id="trust">
        <SectionHeading
          eyebrow="Trust & Transparency"
          title="Clear guidance without pressure"
          description="Novalyte AI helps organize your treatment interests, preferences, and consultation goals. Licensed healthcare professionals remain responsible for diagnosis, treatment decisions, and prescribing."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_POINTS.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="rounded-xl border border-border bg-card p-5 shadow-premium-xs">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <h4 className="mt-3 text-sm font-semibold text-foreground">{t.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </SectionShell>

      {/* Assessment modal */}
      {activeAssessment && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setActiveAssessment(null)}>
          <div className="my-auto w-full max-w-2xl novalyte-scale-in" onClick={(e) => e.stopPropagation()}>
            <AssessmentEngine
              config={activeAssessment}
              clinics={data.clinics}
              onClose={() => setActiveAssessment(null)}
            />
          </div>
        </div>
      )}

      <CTASection
        title="Ready to explore your options?"
        description="Take a personalized assessment and connect with qualified men's health clinics."
        primaryLabel="Start Your Assessment"
        onPrimary={() => document.getElementById("treatments")?.scrollIntoView({ behavior: "smooth" })}
        secondaryLabel="Browse Clinic Directory"
        secondaryView="directory"
        tone="dark"
      />
      <MedicalDisclaimer className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8" />
    </>
  );
}
