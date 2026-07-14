"use client";

import { useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { DisclaimerBanner, MedicalDisclaimer } from "@/components/shared/disclaimer";
import { CTASection } from "@/components/shared/cta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PatientAssessment } from "@/components/views/patient-assessment";
import { TREATMENT_LIST, type TreatmentInfo } from "@/lib/treatments";
import { navigate } from "@/lib/nav";
import {
  Stethoscope, ClipboardList, BookOpen, MapPin, MessageSquare, Phone,
  ArrowRight, Search, FileText, HeartPulse, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlatformData } from "@/components/site/app-shell";

const JOURNEY = [
  { icon: Search, title: "Explore symptoms or treatment categories", desc: "Browse treatment areas to understand what's available." },
  { icon: ClipboardList, title: "Complete an informational assessment", desc: "A short screening that does not provide a diagnosis." },
  { icon: BookOpen, title: "Review educational guidance", desc: "Understand what to ask a licensed provider." },
  { icon: MapPin, title: "Discover relevant clinics", desc: "Find verified clinics matching your preferences." },
  { icon: MessageSquare, title: "Request a consultation", desc: "Send a structured request to the clinic." },
  { icon: Phone, title: "Speak with a licensed provider", desc: "A professional determines appropriate care." },
];

export function PatientsView({ data, onGetStarted }: { data: PlatformData; onGetStarted: () => void }) {
  const [activeTreatment, setActiveTreatment] = useState<TreatmentInfo | null>(null);
  const [assessOpen, setAssessOpen] = useState(false);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-14 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-700">
              <Stethoscope className="h-3.5 w-3.5" /> For Patients
            </div>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              A Clearer Path to Men's Health Care
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              Explore treatment categories, complete an informational assessment, discover trusted
              providers, and prepare for a conversation with a licensed healthcare professional.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => setAssessOpen(true)}>
                Start Your Assessment <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("directory")}>Find a Clinic</Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Informational only · Does not provide a medical diagnosis · Novalyte AI does not provide medical care
            </p>
          </div>
        </div>
      </section>

      {/* Patient journey */}
      <SectionShell id="journey" tone="muted">
        <SectionHeading eyebrow="Your Journey" title="Six steps from curiosity to a real conversation" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {JOURNEY.map((j, i) => {
            const Icon = j.icon;
            return (
              <div key={j.title} className="relative rounded-2xl border border-border bg-card p-5">
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

      {/* Treatment discovery */}
      <SectionShell id="treatments">
        <SectionHeading
          eyebrow="Treatment Discovery"
          title="Explore men's health treatment categories"
          description="Each category explains what it involves, common reasons people seek care, who may help, and questions to ask. Always consult a licensed provider."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TREATMENT_LIST.map((t) => (
            <button
              key={t.slug}
              onClick={() => setActiveTreatment(t)}
              className="group flex flex-col items-start rounded-xl border border-border bg-card p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/30"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                <HeartPulse className="h-4.5 w-4.5" />
              </span>
              <span className="mt-3 text-sm font-semibold text-foreground">{t.label}</span>
              <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.explanation}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-600">
                Learn more <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>

        <TreatmentDetailDialog treatment={activeTreatment} onClose={() => setActiveTreatment(null)} />
      </SectionShell>

      {/* Assessment */}
      <SectionShell id="assessment" tone="tint">
        <SectionHeading
          eyebrow="Informational Assessment"
          title="A short screening to guide your next conversation"
          description="Answer a few questions about your goals and preferences. The result is informational — it does not provide a medical diagnosis."
        />
        <div className="mx-auto mt-8 max-w-3xl">
          {assessOpen ? (
            <PatientAssessment clinics={data.clinics} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <ClipboardList className="mx-auto h-10 w-10 text-teal-600" />
              <h3 className="mt-3 text-xl font-semibold text-foreground">Ready to start?</h3>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
                The assessment takes about 3 minutes. You'll see care categories and clinics worth
                exploring — not a diagnosis.
              </p>
              <Button className="mt-5 bg-teal-600 text-white hover:bg-teal-700" onClick={() => setAssessOpen(true)}>
                Start Your Assessment <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
          <MedicalDisclaimer className="mt-5" />
        </div>
      </SectionShell>

      {/* Recommendations note */}
      <SectionShell tone="default" className="!py-12">
        <DisclaimerBanner tone="teal">
          Clinic recommendations are based on your stated preferences (location, treatment interest,
          telehealth). Novalyte AI does not claim clinical suitability unless confirmed by a licensed
          provider. Always verify licensure and credentials independently where appropriate.
        </DisclaimerBanner>
      </SectionShell>

      <CTASection
        title="Find a clinic that fits your goals"
        description="Browse verified men's health clinics by location, specialty, and telehealth availability."
        primaryLabel="Browse the Clinic Directory"
        primaryView="directory"
        secondaryLabel="Talk to our team"
        onSecondary={onGetStarted}
        tone="dark"
      />
    </>
  );
}

function TreatmentDetailDialog({ treatment, onClose }: { treatment: TreatmentInfo | null; onClose: () => void }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm transition sm:items-center sm:p-4",
        treatment ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={onClose}
    >
      {treatment && (
        <div
          className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-card p-6 shadow-xl sm:rounded-2xl novalyte-scroll"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge className="bg-teal-600 text-white">{treatment.short}</Badge>
              <h3 className="mt-2 text-2xl font-semibold text-foreground">{treatment.label}</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">✕</Button>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{treatment.explanation}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-4 w-4" /> Common reasons people seek care
              </h4>
              <ul className="mt-2 space-y-1.5">
                {treatment.reasons.map((r) => (
                  <li key={r} className="flex items-start gap-1.5 text-sm text-foreground/80">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-teal-500" /> {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Stethoscope className="h-4 w-4" /> Who may help
              </h4>
              <p className="mt-2 text-sm text-foreground/80">{treatment.providerType}</p>
              <h4 className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-4 w-4" /> Questions to ask
              </h4>
              <ul className="mt-2 space-y-1.5">
                {treatment.questions.map((q) => (
                  <li key={q} className="flex items-start gap-1.5 text-sm text-foreground/80">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-teal-500" /> {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DisclaimerBanner tone="amber" className="mt-5">
            This information is educational and does not constitute medical advice. Consult a licensed
            healthcare professional before making any medical decisions.
          </DisclaimerBanner>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => { onClose(); navigate("directory"); }}>
              Find clinics for this treatment <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
