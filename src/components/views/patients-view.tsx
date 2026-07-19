"use client";

import { useState } from "react";
import { SectionShell } from "@/components/shared/section";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { TREATMENT_LIST } from "@/lib/treatments";
import { ASSESSMENTS } from "@/lib/assessment-config";
import { getTreatmentIcon } from "@/lib/treatment-icons";
import { navigate } from "@/lib/nav";
import { IMAGES, ALT_TEXT } from "@/lib/images";
import type { PlatformData } from "@/lib/platform-data";
import {
  Stethoscope, ArrowRight, ShieldCheck, Sparkles, CheckCircle2,
  Compass, Lock, HeartPulse, FileText, Video, Building2,
  Zap, Scale, Scissors, Infinity as InfinityIcon, Dumbbell, Clock,
  ChevronDown, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Treatment finder goals ──────────────────────────────────── */
const FINDER_GOALS = [
  { value: "energy", label: "Energy & hormones", icon: Zap, treatments: ["testosterone-replacement-therapy", "hormone-optimization", "preventive-mens-health"] },
  { value: "weight", label: "Weight management", icon: Scale, treatments: ["medical-weight-loss", "glp-1"] },
  { value: "sexual", label: "Sexual health", icon: HeartPulse, treatments: ["erectile-dysfunction", "sexual-wellness"] },
  { value: "hair", label: "Hair loss", icon: Scissors, treatments: ["hair-restoration"] },
  { value: "strength", label: "Strength & recovery", icon: Dumbbell, treatments: ["performance-recovery", "peptide-therapy"] },
  { value: "preventive", label: "Preventive health", icon: ShieldCheck, treatments: ["preventive-mens-health", "longevity-medicine"] },
  { value: "longevity", label: "Longevity", icon: InfinityIcon, treatments: ["longevity-medicine", "preventive-mens-health"] },
  { value: "unsure", label: "I'm not sure", icon: Compass, treatments: ["preventive-mens-health", "longevity-medicine", "telehealth-services"] },
];

const FEATURED_SLUGS = [
  "testosterone-replacement-therapy",
  "hormone-optimization",
  "medical-weight-loss",
  "glp-1",
  "erectile-dysfunction",
  "hair-restoration",
];

const SECONDARY_SLUGS = [
  "peptide-therapy",
  "sexual-wellness",
  "longevity-medicine",
  "performance-recovery",
  "preventive-mens-health",
  "telehealth-services",
];

const FEATURED_TREATMENT_IMAGES: Record<string, string> = {
  "testosterone-replacement-therapy": "/images/articles/trt-consultation.jpg",
  "hormone-optimization": "/images/articles/longevity-consultation.jpg",
  "medical-weight-loss": "/images/articles/glp1-consultation.jpg",
  "glp-1": "/images/treatments/preventive-3.jpg",
  "erectile-dysfunction": "/images/treatments/ed-1.jpg",
  "hair-restoration": "/images/treatments/hair-restoration-new.jpg",
};

const PROCESS_STEPS = [
  { icon: Compass, title: "Choose a goal", desc: "Pick a treatment or let us guide you" },
  { icon: FileText, title: "Complete assessment", desc: "Personalized to your treatment" },
  { icon: BookOpen, title: "Review options", desc: "Understand what to ask a provider" },
  { icon: Building2, title: "Discover clinics", desc: "Find verified clinics near you" },
  { icon: Stethoscope, title: "Request consultation", desc: "Send a structured request" },
  { icon: ShieldCheck, title: "Speak with a provider", desc: "A professional decides care" },
];

const VALUE_TOPICS = [
  { icon: Stethoscope, title: "What treatment may involve", desc: "Understand what a consultation, evaluation, and follow-up typically look like." },
  { icon: Video, title: "Telehealth vs. in-person care", desc: "Both have their place. Telehealth expands access; some care requires in-person visits." },
  { icon: FileText, title: "Why labs may be discussed", desc: "Many treatments involve lab work. Understanding why helps you have better conversations." },
  { icon: ShieldCheck, title: "How self-pay clinics operate", desc: "Many men's health clinics use direct-pay models. Understanding costs helps you plan." },
  { icon: Building2, title: "Questions to ask a clinic", desc: "Being prepared helps you get the most from your consultation and find the right fit." },
  { icon: Compass, title: "How clinic matching works", desc: "We use your treatment interest, location, timeline, and preferences to suggest clinics." },
];

export function PatientsView({ data, onGetStarted: _onGetStarted }: { data: PlatformData; onGetStarted: () => void }) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showAllTreatments, setShowAllTreatments] = useState(false);

  const recommendedTreatments = selectedGoal
    ? FINDER_GOALS.find((g) => g.value === selectedGoal)?.treatments
        .map((slug) => TREATMENT_LIST.find((t) => t.slug === slug))
        .filter(Boolean) ?? []
    : [];

  // Featured articles (use the articles passed in data)
  const featuredArticles = data.articles.slice(0, 3);

  function startAssessment(slug: string) {
    navigate("assessment", undefined, { slug });
  }

  function startAssessmentIntro() {
    // From the hero, scroll to the treatment finder so user picks a treatment first
    document.getElementById("finder")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="bg-background">
      {/* ── 1. COMPACT HERO ─────────────────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/40 to-background">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">
          {/* Left: copy + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-700 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Men's health, made easier
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[56px]">
              Find the Right Men's Health Care—{" "}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Without Guesswork
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Tell us what you want to improve. We'll help you understand relevant care options and find clinics that match your location and preferences.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={startAssessmentIntro}>
                Start My Assessment <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" })}>
                Explore Treatments
              </Button>
              <button onClick={() => navigate("directory")} className="text-sm font-medium text-teal-700 underline-offset-2 hover:underline sm:ml-2">
                Browse Clinics
              </button>
            </div>
            {/* Compact trust row */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-teal-600" /> Private and secure</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-teal-600" /> Takes ~2–3 minutes</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> No diagnosis or treatment guarantee</span>
            </div>
          </div>

          {/* Right: image + floating card */}
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-premium-lg">
              <SmartImage
                src={IMAGES.patients.hero}
                alt={ALT_TEXT.patientHero}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                imgClassName="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 to-transparent" aria-hidden />
            </div>
            {/* Floating assessment preview card */}
            <div className="absolute -bottom-4 -left-4 hidden items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-premium-lg sm:flex">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">Personalized assessment</p>
                <p className="text-[10px] text-muted-foreground">2–3 min · Progress saved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TREATMENT FINDER ────────────────────────────────── */}
      <section id="finder" className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">What would you like help with?</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">Choose the area closest to your goals. You can learn more or begin a personalized assessment.</p>
          </div>
          {/* Goal tiles */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
            {FINDER_GOALS.map((goal) => {
              const Icon = goal.icon;
              const active = selectedGoal === goal.value;
              return (
                <button
                  key={goal.value}
                  onClick={() => setSelectedGoal(active ? null : goal.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-center transition",
                    active
                      ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200"
                      : "border-border bg-card text-foreground/70 hover:border-teal-200 hover:bg-teal-50/30",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-teal-600" : "text-muted-foreground")} />
                  <span className="text-xs font-medium leading-tight">{goal.label}</span>
                </button>
              );
            })}
          </div>

          {/* Recommended treatments */}
          {recommendedTreatments.length > 0 && (
            <div className="mt-5 novalyte-fade-up">
              <p className="mb-3 text-sm font-medium text-foreground">Based on your selection, these may be relevant:</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedTreatments.slice(0, 3).map((t) => {
                  const Icon = getTreatmentIcon(t!.slug);
                  return (
                    <div key={t!.slug} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{t!.label}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{t!.explanation}</p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <Button size="sm" className="h-7 bg-teal-600 px-2.5 text-xs text-white hover:bg-teal-700" onClick={() => startAssessment(t!.slug)}>Start</Button>
                        <button onClick={() => navigate("treatment-detail", undefined, { slug: t!.slug })} className="text-[11px] font-medium text-teal-700 hover:underline">Learn</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. FEATURED TREATMENT CATEGORIES ───────────────────── */}
      <section id="featured" className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Featured treatment categories</h2>
              <p className="mt-2 text-sm text-muted-foreground">Start with the most common men's health treatments.</p>
            </div>
          </div>
          <div className="novalyte-marquee relative mt-6 overflow-hidden" aria-label="Featured treatment categories">
            <div className="novalyte-marquee-track flex w-max gap-4">
            {[...FEATURED_SLUGS, ...FEATURED_SLUGS].map((slug, index) => {
              const isClone = index >= FEATURED_SLUGS.length;
              const t = TREATMENT_LIST.find((x) => x.slug === slug);
              if (!t) return null;
              const Icon = getTreatmentIcon(slug);
              const img = FEATURED_TREATMENT_IMAGES[slug] ?? IMAGES.treatments[slug as keyof typeof IMAGES.treatments];
              return (
                <article
                  key={`${slug}-${index}`}
                  aria-hidden={isClone || undefined}
                  className={cn(
                    "group flex w-[min(82vw,300px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-premium-xs transition hover:border-teal-200 hover:shadow-premium-sm sm:w-[300px]",
                    isClone && "novalyte-marquee-clone",
                  )}
                >
                  <div className="relative h-36 overflow-hidden">
                    <SmartImage
                      src={img}
                      alt={`${t.label} treatment category`}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="transition duration-500 group-hover:scale-105"
                      imgClassName="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" aria-hidden />
                    <div className="absolute bottom-2.5 left-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-base font-semibold text-foreground">{t.label}</h3>
                    <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{t.explanation}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button tabIndex={isClone ? -1 : undefined} size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => startAssessment(slug)}>
                        Start Assessment
                      </Button>
                      <button tabIndex={isClone ? -1 : undefined} onClick={() => navigate("treatment-detail", undefined, { slug })} className="text-xs font-medium text-teal-700 underline-offset-2 hover:underline">
                        Learn More →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            </div>
          </div>

          {/* View All Treatments */}
          <div className="mt-5 text-center">
            <Button variant="outline" onClick={() => setShowAllTreatments(!showAllTreatments)}>
              {showAllTreatments ? "Show Less" : "View All Men's Health Treatments"} <ChevronDown className={cn("ml-1 h-4 w-4 transition", showAllTreatments && "rotate-180")} />
            </Button>
          </div>

          {/* Secondary treatments (expandable) */}
          {showAllTreatments && (
            <div className="mt-5 novalyte-fade-up">
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {SECONDARY_SLUGS.map((slug) => {
                  const t = TREATMENT_LIST.find((x) => x.slug === slug);
                  if (!t) return null;
                  const Icon = getTreatmentIcon(slug);
                  const img = IMAGES.treatments[slug as keyof typeof IMAGES.treatments] ?? IMAGES.hero.clinicScene;
                  return (
                    <div key={slug} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-teal-200">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <SmartImage src={img} alt={t.label} fill sizes="48px" imgClassName="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{t.label}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{t.explanation}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Icon className="h-4 w-4 text-teal-600" />
                        <button onClick={() => navigate("treatment-detail", undefined, { slug })} className="text-xs font-medium text-teal-700 hover:underline">Learn</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. ASSESSMENT PREVIEW ──────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-12 sm:py-14">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
          {/* Left: visual preview */}
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium-md">
              {/* Mock assessment UI */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white"><Sparkles className="h-3.5 w-3.5" /></span>
                  <span className="text-xs font-semibold text-foreground">Novalyte AI Assessment</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Step 2 of 6</span>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">Your Goals</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">What would you most like to improve?</p>
                </div>
                <div className="space-y-1.5">
                  {["Energy and motivation", "Sexual health", "Strength and muscle development"].map((opt, i) => (
                    <div key={i} className={cn("flex items-center justify-between rounded-lg border px-3 py-2.5 text-xs", i === 0 ? "border-teal-400 bg-teal-50 text-teal-800" : "border-border bg-card text-foreground/70")}>
                      <span>{opt}</span>
                      {i === 0 && <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="h-1 flex-1 rounded-full bg-teal-600" />
                  <div className="h-1 flex-1 rounded-full bg-teal-600" />
                  <div className="h-1 flex-1 rounded-full bg-muted" />
                  <div className="h-1 flex-1 rounded-full bg-muted" />
                  <div className="h-1 flex-1 rounded-full bg-muted" />
                  <div className="h-1 flex-1 rounded-full bg-muted" />
                </div>
                <p className="flex items-center gap-1 text-[10px] text-teal-600"><CheckCircle2 className="h-3 w-3" /> Progress saved</p>
              </div>
            </div>
          </div>
          {/* Right: copy + CTA */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-700">
              <FileText className="h-3.5 w-3.5" /> Assessment
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">A short assessment built around your goals</h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Answer a few focused questions about what you want to improve, your care preferences, timeline, and location. We'll use your responses to prepare relevant information and potential clinic matches.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Personalized by treatment",
                "Approximately 2–3 minutes",
                "Progress saved automatically",
                "Clear next steps after completion",
              ].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" /> {b}
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-6 bg-teal-600 text-white hover:bg-teal-700" onClick={startAssessmentIntro}>
              Start My Assessment <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── 5. PATIENT VALUE & EDUCATION ──────────────────────── */}
      <section className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
          {/* Left: editorial image */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-premium-md">
              <SmartImage
                src={IMAGES.patients.consultation}
                alt="Healthcare professional speaking with a male patient during a consultation"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                imgClassName="object-cover"
              />
            </div>
          </div>
          {/* Right: accordion */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">What you should know before choosing care</h2>
            <p className="mt-2 text-sm text-muted-foreground">Practical information to help you make informed decisions.</p>
            <Accordion type="single" collapsible className="mt-4">
              {VALUE_TOPICS.map((topic, i) => {
                const Icon = topic.icon;
                return (
                  <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
                    <AccordionTrigger className="py-3.5 text-left text-sm font-medium hover:no-underline">
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-teal-600" /> {topic.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{topic.desc}</AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── 6. HOW IT WORKS ───────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">How it works</h2>
          {/* Desktop: horizontal */}
          <div className="mt-8 hidden lg:block">
            <div className="relative">
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-emerald-400" aria-hidden />
              <div className="relative grid grid-cols-6 gap-3">
                {PROCESS_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex flex-col items-center text-center">
                      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-premium-sm ring-2 ring-teal-400">
                        <Icon className="h-4 w-4 text-teal-600" />
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[9px] font-bold text-white">{i + 1}</span>
                      </span>
                      <h4 className="mt-2.5 text-xs font-semibold text-foreground">{step.title}</h4>
                      <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Mobile: vertical */}
          <div className="mt-6 lg:hidden">
            <div className="relative space-y-4">
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-200 via-teal-400 to-emerald-400" aria-hidden />
              {PROCESS_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative flex gap-3">
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-premium-sm ring-2 ring-teal-400">
                      <Icon className="h-4 w-4 text-teal-600" />
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[9px] font-bold text-white">{i + 1}</span>
                    </span>
                    <div className="pt-1.5">
                      <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Licensed healthcare professionals remain responsible for diagnosis, prescribing, and treatment decisions.
          </p>
        </div>
      </section>

      {/* ── 7. JOURNAL CONTENT ────────────────────────────────── */}
      <section className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Learn before you decide</h2>
              <p className="mt-2 text-sm text-muted-foreground">Patient-focused guides from the Novalyte Journal.</p>
            </div>
            <button onClick={() => navigate("journal")} className="hidden text-sm font-medium text-teal-700 underline-offset-2 hover:underline sm:block">
              View All Patient Guides →
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {featuredArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => navigate("journal-article", undefined, { slug: article.slug })}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-premium-xs transition hover:border-teal-200 hover:shadow-premium-sm"
              >
                <div className="relative h-32 overflow-hidden">
                  <SmartImage
                    src={IMAGES.articles[0]}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="transition duration-500 group-hover:scale-105"
                    imgClassName="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" aria-hidden />
                  <Badge className="absolute left-3 top-3 bg-white/90 text-[10px] text-teal-700 backdrop-blur">{article.category}</Badge>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">{article.title}</h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-muted-foreground">{article.excerpt}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="h-3 w-3" /> {article.readingTime} min read</span>
                    <span className="text-xs font-medium text-teal-700">Read Article →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center sm:hidden">
            <button onClick={() => navigate("journal")} className="text-sm font-medium text-teal-700 underline-offset-2 hover:underline">
              View All Patient Guides →
            </button>
          </div>
        </div>
      </section>

      {/* ── 8. TRUST & TRANSPARENCY ───────────────────────────── */}
      <section className="bg-foreground py-12 text-background sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-background sm:text-3xl">Clear guidance. No pressure.</h2>
            <p className="mt-2 text-sm text-background/70 sm:text-base">
              Novalyte AI helps you understand options and connect with clinics. Licensed professionals remain responsible for diagnosis, prescribing, and treatment decisions.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: ShieldCheck, label: "No diagnosis from Novalyte AI" },
              { icon: Lock, label: "No guaranteed prescription" },
              { icon: CheckCircle2, label: "Transparent contact consent" },
              { icon: Compass, label: "You decide whether to contact a clinic" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-2.5 rounded-xl border border-background/15 bg-background/5 p-3.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                  <span className="text-xs font-medium leading-tight text-background/90">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
