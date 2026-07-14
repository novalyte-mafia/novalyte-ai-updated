"use client";

import { SectionShell, SectionHeading } from "@/components/shared/section";
import { TREATMENT_VERTICALS } from "@/lib/constants";
import { navigate } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import {
  Search,
  Brain,
  MapPin,
  ClipboardList,
  Users,
  Package,
  TrendingUp,
  ArrowRight,
  Stethoscope,
  Briefcase,
  UserCog,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const JOURNEY = [
  { step: "01", title: "Patient discovers content or assessment", desc: "Educational content and an informational assessment capture intent.", icon: Search },
  { step: "02", title: "Novalyte identifies a care pathway", desc: "Responses map to relevant treatment categories — not a diagnosis.", icon: Brain },
  { step: "03", title: "Patient discovers an appropriate clinic", desc: "The directory surfaces verified clinics matching preferences.", icon: MapPin },
  { step: "04", title: "Clinic receives structured intake", desc: "Intake information arrives organized, not as a raw lead.", icon: ClipboardList },
  { step: "05", title: "Clinic hires talent through Workforce", desc: "Growth triggers demand for NPs, directors, and coordinators.", icon: Users },
  { step: "06", title: "Clinic sources via Marketplace", desc: "Labs, supplies, software, and services in one place.", icon: Package },
  { step: "07", title: "Clinic expands and serves more patients", desc: "Capacity grows — and the cycle repeats.", icon: TrendingUp },
];

const AUDIENCES = [
  { label: "I'm a Patient", desc: "Explore treatments, complete an assessment, and find a trusted clinic.", icon: Stethoscope, view: "patients" as const, color: "teal" },
  { label: "I Represent a Clinic", desc: "Generate demand, streamline intake, and access talent and vendors.", icon: Briefcase, view: "clinics" as const, color: "emerald" },
  { label: "I'm a Healthcare Professional", desc: "Find roles matching your licensure, specialty, and availability.", icon: UserCog, view: "workforce" as const, color: "sky" },
  { label: "I'm a Vendor or Service Provider", desc: "Reach men's health clinics seeking your products and services.", icon: Store, view: "marketplace" as const, color: "violet" },
];

const audienceColors: Record<string, { bg: string; ring: string; text: string; hover: string }> = {
  teal: { bg: "bg-teal-50", ring: "ring-teal-100", text: "text-teal-700", hover: "group-hover:border-teal-300" },
  emerald: { bg: "bg-emerald-50", ring: "ring-emerald-100", text: "text-emerald-700", hover: "group-hover:border-emerald-300" },
  sky: { bg: "bg-sky-50", ring: "ring-sky-100", text: "text-sky-700", hover: "group-hover:border-sky-300" },
  violet: { bg: "bg-violet-50", ring: "ring-violet-100", text: "text-violet-700", hover: "group-hover:border-violet-300" },
};

export function EcosystemJourney() {
  return (
    <SectionShell id="ecosystem" tone="tint">
      <SectionHeading
        eyebrow="The Connected Cycle"
        title="Patient demand creates clinic growth. Clinic growth creates operational demand."
        description="Novalyte AI connects the entire cycle — so growth compounds instead of stalling."
      />
      <div className="mt-12 grid gap-3 lg:grid-cols-7">
        {JOURNEY.map((j, i) => {
          const Icon = j.icon;
          return (
            <div key={j.step} className="relative">
              <div className="h-full rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-xs font-bold text-teal-600/70">{j.step}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{j.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{j.desc}</p>
              </div>
              {i < JOURNEY.length - 1 && (
                <ArrowRight className="absolute -right-2.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-teal-400 lg:block" />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-8 rounded-xl border border-teal-200 bg-teal-50/50 p-5 text-center text-sm font-medium text-teal-800">
        Patient demand creates clinic growth. Clinic growth creates workforce and operational demand. Novalyte AI connects the entire cycle.
      </p>
    </SectionShell>
  );
}

export function TreatmentVerticals() {
  return (
    <SectionShell id="treatments">
      <SectionHeading
        eyebrow="Treatment Verticals"
        title="Built for the full spectrum of men's health care."
        description="Novalyte AI supports the treatment categories that define the modern men's health industry."
      />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TREATMENT_VERTICALS.map((t) => (
          <button
            key={t.slug}
            onClick={() => navigate("patients", "treatments")}
            className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
              <Stethoscope className="h-4.5 w-4.5" />
            </span>
            <span className="text-sm font-semibold text-foreground">{t.label}</span>
            <span className="inline-flex items-center gap-1 text-xs text-teal-600 opacity-0 transition group-hover:opacity-100">
              Learn more <ArrowRight className="h-3 w-3" />
            </span>
          </button>
        ))}
      </div>
    </SectionShell>
  );
}

export function AudiencePathways({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <SectionShell id="audiences" tone="muted">
      <SectionHeading
        eyebrow="Choose Your Path"
        title="Whatever your role, there's a place for you in the ecosystem."
        align="center"
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map((a) => {
          const Icon = a.icon;
          const c = audienceColors[a.color];
          return (
            <button
              key={a.label}
              onClick={() => navigate(a.view)}
              className={cn(
                "group flex h-full flex-col rounded-2xl border border-border bg-card p-6 text-left transition hover:shadow-lg",
                c.hover,
              )}
            >
              <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl ring-1", c.bg, c.ring, c.text)}>
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{a.label}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
              <span className={cn("mt-4 inline-flex items-center gap-1 text-sm font-semibold", c.text)}>
                Start here <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-10 text-center">
        <Button size="lg" variant="outline" onClick={onGetStarted}>
          Not sure where you fit? Talk to our team
        </Button>
      </div>
    </SectionShell>
  );
}
