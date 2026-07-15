"use client";
import React from "react";

import { SectionShell, SectionHeading } from "@/components/shared/section";
import { SmartImage } from "@/components/shared/smart-image";
import { PILLARS } from "@/lib/constants";
import { IMAGES } from "@/lib/images";
import { navigate } from "@/lib/nav";
import { Megaphone, Building2, Users, Package, ArrowRight, Link2, Link2Off } from "lucide-react";
import { cn } from "@/lib/utils";

const PILLAR_ICONS: Record<string, React.ElementType> = {
  Megaphone, Building2, Users, Package,
};

const TRUST_ITEMS = [
  "Built for Men's Health",
  "Secure Digital Infrastructure",
  "Verified Provider Network",
  "Human-Guided Technology",
  "Nationwide Expansion Ready",
];

const PROBLEMS = [
  { title: "Patients struggle to find trusted providers", desc: "Men's health care is scattered across generic directories with little specialty context." },
  { title: "Clinics struggle to acquire consistent demand", desc: "Lead quality is unpredictable and intake workflows leak high-intent patients." },
  { title: "Specialized professionals are hard to recruit", desc: "Men's health-specific NPs, medical directors, and coordinators don't surface on general job boards." },
  { title: "Equipment and services are disconnected", desc: "Labs, supplies, software, and compliance support live across unrelated vendors." },
  { title: "Clinics rely on multiple unrelated systems", desc: "Marketing, intake, EHR, staffing, and sourcing each operate in silos." },
];

export function TrustStrip() {
  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST_ITEMS.map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProblemSection() {
  return (
    <SectionShell id="problem" tone="muted">
      <SectionHeading
        eyebrow="The Problem"
        title="Men's health is fragmented. The infrastructure hasn't caught up."
        description="A growing sector held back by disconnected systems, unclear demand, and hard-to-find specialized talent."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PROBLEMS.map((p, i) => (
          <div
            key={p.title}
            className={cn(
              "rounded-2xl border border-border bg-card p-6",
              i === 4 && "lg:col-span-1",
            )}
          >
            <div className="flex items-center gap-2 text-rose-600">
              <Link2Off className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Fragmented</span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">{p.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
          </div>
        ))}
        <div className="flex flex-col justify-center rounded-2xl border border-teal-200 bg-teal-50/50 p-6">
          <div className="flex items-center gap-2 text-teal-700">
            <Link2 className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">The Solution</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-foreground">
            Novalyte AI unifies the entire ecosystem.
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            One intelligent platform connects demand, intake, talent, and sourcing — so clinics
            grow and patients find care faster.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

export function PillarsSection() {
  const pillarImages: Record<string, string> = {
    acquisition: IMAGES.patients.consultation,
    directory: IMAGES.clinics.exterior[0],
    workforce: IMAGES.professionals[4],
    marketplace: IMAGES.marketplace.lab[0],
  };
  const pillarAlts: Record<string, string> = {
    acquisition: "Adult male patient in healthcare consultation completing digital intake",
    directory: "Modern men's health clinic reception and consultation environment",
    workforce: "Healthcare professionals collaborating in a clinical setting",
    marketplace: "Modern laboratory technology and clinical equipment",
  };
  return (
    <SectionShell id="pillars" tone="muted">
      <SectionHeading
        eyebrow="The Connected Platform"
        title="One platform. Four ways it powers the men's health economy."
        description="Each pillar is a complete product on its own — and exponentially more valuable connected to the ecosystem."
      />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {PILLARS.map((p) => {
          const Icon = PILLAR_ICONS[p.icon] ?? Building2;
          const NUMBER_LABEL: Record<string, string> = {
            acquisition: "01 — Patient Growth",
            directory: "02 — Discovery",
            workforce: "03 — Talent",
            marketplace: "04 — Infrastructure",
          };
          return (
            <div
              key={p.key}
              onClick={() => navigate(p.view)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white cursor-pointer shadow-premium-xs transition-all duration-300 hover:border-teal-500/40 hover:shadow-premium-md"
            >
              {/* Pillar Image - top half */}
              <div className="relative h-52 w-full overflow-hidden bg-neutral-100 border-b border-neutral-100">
                <SmartImage
                  src={pillarImages[p.key] ?? IMAGES.hero.clinicScene}
                  alt={pillarAlts[p.key] ?? p.label}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="transition duration-700 group-hover:scale-[1.03]"
                  imgClassName="object-cover"
                />
                {/* Subtle soft gradient fade at the bottom of the image */}
                <div
                  className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/10 to-transparent"
                  aria-hidden
                />
              </div>

              {/* Text content sits below the image */}
              <div className="flex flex-1 flex-col justify-between p-6 space-y-4">
                <div className="space-y-2">
                  {/* Category pill */}
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100/50">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[10px] font-bold text-teal-700 tracking-wider uppercase">
                      {NUMBER_LABEL[p.key]}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground tracking-tight leading-snug">
                    {p.label}
                  </h3>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 transition-all group-hover:text-teal-700 group-hover:gap-2">
                    {p.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
