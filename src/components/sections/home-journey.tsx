"use client";

import { SectionShell, SectionHeading } from "@/components/shared/section";
import { navigate } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Stethoscope,
  Briefcase,
  UserCog,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
