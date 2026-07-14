"use client";

import { useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { DisclaimerBanner, MedicalDisclaimer } from "@/components/shared/disclaimer";
import { CTASection } from "@/components/shared/cta";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TREATMENT_LIST } from "@/lib/treatments";
import { ASSESSMENTS } from "@/lib/assessment-config";
import { getTreatmentIcon } from "@/lib/treatment-icons";
import { navigate } from "@/lib/nav";
import { IMAGES, ALT_TEXT } from "@/lib/images";
import type { PlatformData } from "@/components/site/app-shell";
import {
  Stethoscope, ClipboardList, BookOpen, MapPin, MessageSquare, Phone,
  ArrowRight, ShieldCheck, Sparkles, CheckCircle2,
  Compass, Lock, HeartPulse, Zap, FileText, Video, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AI_CATEGORIES = [
  { value: "energy", label: "Energy", treatments: ["testosterone-replacement-therapy", "hormone-optimization"] },
  { value: "weight", label: "Weight management", treatments: ["medical-weight-loss", "glp-1"] },
  { value: "sexual-health", label: "Sexual health", treatments: ["erectile-dysfunction", "sexual-wellness"] },
  { value: "hair", label: "Hair loss", treatments: ["hair-restoration"] },
  { value: "strength", label: "Strength & recovery", treatments: ["performance-recovery", "peptide-therapy"] },
  { value: "hormones", label: "Hormone health", treatments: ["hormone-optimization", "testosterone-replacement-therapy"] },
  { value: "sleep", label: "Sleep", treatments: ["hormone-optimization", "longevity-medicine"] },
  { value: "preventive", label: "Preventive health", treatments: ["longevity-medicine", "preventive-mens-health"] },
  { value: "longevity", label: "Longevity", treatments: ["longevity-medicine"] },
  { value: "general", label: "General men's health", treatments: ["preventive-mens-health", "longevity-medicine"] },
];

const PROCESS_STEPS = [
  { icon: Compass, title: "Choose a goal", desc: "Select a treatment or let AI guide you" },
  { icon: ClipboardList, title: "Complete a short assessment", desc: "Personalized to your treatment interest" },
  { icon: BookOpen, title: "Review relevant guidance", desc: "Understand what to ask a provider" },
  { icon: MapPin, title: "Discover matching clinics", desc: "Find verified clinics near you" },
  { icon: MessageSquare, title: "Request a consultation", desc: "Send a structured request" },
  { icon: Phone, title: "Speak with a licensed provider", desc: "A professional determines appropriate care" },
];

export function PatientsView({ data, onGetStarted: _onGetStarted }: { data: PlatformData; onGetStarted: () => void }) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);

  function toggleGoal(value: string) {
    setSelectedGoals((prev) => prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]);
  }

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

      {/* Treatment Categories — directly beneath hero */}
      <SectionShell id="treatments" className="!pt-14">
        <SectionHeading
          eyebrow="Treatment Categories"
          title="Explore Men's Health Treatment Options"
          description="Choose the area that best matches your goals. You can learn more, complete a short personalized assessment, or explore clinics that offer the service."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TREATMENT_LIST.map((t) => {
            const config = ASSESSMENTS[t.slug];
            const hasAssessment = !!config;
            const Icon = getTreatmentIcon(t.slug);
            const img = IMAGES.treatments[t.slug as keyof typeof IMAGES.treatments] ?? IMAGES.hero.clinicScene;
            return (
              <div
                key={t.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-premium-sm transition hover:border-teal-300 hover:shadow-premium-lg"
              >
                {/* Image panel — upper portion */}
                <div className="relative h-44 overflow-hidden">
                  <SmartImage
                    src={img}
                    alt={`${t.label} treatment category`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="transition duration-500 group-hover:scale-105"
                    imgClassName="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" aria-hidden />
                  {/* Treatment icon layered near lower edge of image */}
                  <div className="absolute bottom-3 left-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-premium-md">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  {/* Short label badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-teal-700 backdrop-blur">{t.short}</Badge>
                  </div>
                </div>
                {/* Content area */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-foreground">{t.label}</h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">{t.explanation}</p>
                  <div className="mt-4 flex gap-2">
                    {hasAssessment && (
                      <Button size="sm" className="flex-1 bg-teal-600 text-white hover:bg-teal-700" onClick={() => navigate("assessment", undefined, { slug: t.slug })}>
                        Take Assessment
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => navigate("treatment-detail", undefined, { slug: t.slug })}>
                      Learn More
                    </Button>
                  </div>
                  <button
                    onClick={() => navigate("directory")}
                    className="mt-2 text-left text-xs font-medium text-teal-700 underline-offset-2 hover:underline"
                  >
                    Find clinics →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionShell>

      {/* AI-guided care discovery */}
      <SectionShell id="ai-discovery" tone="muted">
        <SectionHeading
          eyebrow="AI-Guided Care Discovery"
          title="Not Sure Which Treatment Fits Your Goals?"
          description="Select the areas you would like to improve. We will organize relevant treatment categories and educational resources."
        />
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-premium-sm">
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
              <p className="text-sm text-muted-foreground">Select all that apply.</p>
              {/* Visual selectable chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {AI_CATEGORIES.map((cat) => {
                  const active = selectedGoals.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      onClick={() => toggleGoal(cat.value)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition",
                        active
                          ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200"
                          : "border-border bg-card text-foreground/70 hover:border-teal-200 hover:bg-teal-50/30",
                      )}
                    >
                      {active && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {cat.label}
                    </button>
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
                {recommendedTreatments.map((t) => {
                  const Icon = getTreatmentIcon(t.slug);
                  return (
                    <div key={t.slug} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{t.treatmentLabel}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => navigate("treatment-detail", undefined, { slug: t.slug })}>Learn</Button>
                        <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => { navigate("assessment", undefined, { slug: t.slug }); setShowAiResults(false); }}>
                          Assess
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <DisclaimerBanner tone="amber">
                This is informational guidance, not a medical diagnosis. Novalyte AI does not determine medical eligibility. Always consult a licensed provider.
              </DisclaimerBanner>
              <Button variant="outline" size="sm" onClick={() => { setShowAiResults(false); setSelectedGoals([]); }}>Start over</Button>
            </div>
          )}
        </div>
      </SectionShell>

      {/* Educational value content */}
      <SectionShell>
        <SectionHeading
          eyebrow="Understanding Your Options"
          title="What to know before you start"
          description="Useful, practical information to help you make informed decisions about men's health care."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Stethoscope, title: "Understanding treatment options", desc: "Learn what each treatment involves, who it may help, and what to expect during a consultation." },
            { icon: Video, title: "Telehealth vs. in-person care", desc: "Both have their place. Telehealth expands access; some care requires in-person evaluation. Understand the difference." },
            { icon: FileText, title: "Common laboratory discussions", desc: "Many treatments involve lab work. Understanding why helps you have better conversations with providers." },
            { icon: ShieldCheck, title: "How self-pay care typically works", desc: "Many men's health clinics operate on direct-pay models. Understanding costs upfront helps you plan." },
            { icon: MessageSquare, title: "Questions to ask a clinic", desc: "Being prepared with questions helps you get the most from your consultation and find the right fit." },
            { icon: Building2, title: "How Novalyte AI matches patients and clinics", desc: "We use your treatment interest, location, timeline, and care preferences to suggest relevant clinics." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5 shadow-premium-xs">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <h4 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </SectionShell>

      {/* How It Works — connected process illustration */}
      <SectionShell tone="muted">
        <SectionHeading eyebrow="How It Works" title="From goal to consultation in six steps" />
        <div className="mt-10">
          {/* Desktop: horizontal connected process */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-6 h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-emerald-400" aria-hidden />
              <div className="relative grid grid-cols-6 gap-4">
                {PROCESS_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex flex-col items-center text-center">
                      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-premium-md ring-2 ring-teal-400">
                        <Icon className="h-5 w-5 text-teal-600" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">{i + 1}</span>
                      </span>
                      <h4 className="mt-3 text-xs font-semibold text-foreground">{step.title}</h4>
                      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Mobile: vertical process */}
          <div className="lg:hidden">
            <div className="relative space-y-6">
              <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-200 via-teal-400 to-emerald-400" aria-hidden />
              {PROCESS_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative flex gap-4">
                    <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-premium-md ring-2 ring-teal-400">
                      <Icon className="h-5 w-5 text-teal-600" />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">{i + 1}</span>
                    </span>
                    <div className="pt-1">
                      <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Licensed healthcare professionals remain responsible for diagnosis, prescribing, and treatment decisions.
          </p>
        </div>
      </SectionShell>

      {/* Trust section — with supporting image */}
      <SectionShell id="trust">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading
              eyebrow="Trust & Transparency"
              title="Clear guidance without pressure"
              description="Novalyte AI helps organize your treatment interests, preferences, and consultation goals."
            />
            <div className="mt-6 relative aspect-[4/3] overflow-hidden rounded-2xl shadow-premium-md">
              <SmartImage
                src={IMAGES.patients.consultation}
                alt="Healthcare professional speaking privately with a male patient"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                imgClassName="object-cover"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, title: "Novalyte AI does not diagnose", desc: "We organize information. We do not diagnose or prescribe." },
              { icon: Lock, title: "Does not prescribe", desc: "Only licensed providers make prescribing decisions." },
              { icon: CheckCircle2, title: "Treatment is not guaranteed", desc: "A licensed provider decides what's appropriate for you." },
              { icon: HeartPulse, title: "You choose whether to contact a clinic", desc: "No pressure. No fake urgency. Your decision." },
              { icon: Building2, title: "Clinics are independently responsible", desc: "Clinics make all clinical decisions independently." },
              { icon: FileText, title: "Explicit consent", desc: "Separate permissions. Easy opt-out at any time." },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.title} className="rounded-xl border border-border bg-card p-4 shadow-premium-xs">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h4 className="mt-2.5 text-sm font-semibold text-foreground">{t.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </SectionShell>

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
