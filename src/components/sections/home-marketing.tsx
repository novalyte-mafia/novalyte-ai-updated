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
    <SectionShell id="pillars">
      <SectionHeading
        eyebrow="Four Connected Pillars"
        title="One platform. Four ways it powers the men's health economy."
        description="Each pillar is a complete product on its own — and exponentially more valuable connected to the ecosystem."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
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
              className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-black min-h-[380px] flex flex-col justify-end cursor-pointer shadow-premium-sm transition duration-300 hover:border-teal-500/50 hover:shadow-premium-lg"
            >
              {/* Pillar background image — explicit positioned wrapper so fill has a valid height */}
              <div className="absolute inset-0 overflow-hidden">
                <SmartImage
                  src={pillarImages[p.key] ?? IMAGES.hero.clinicScene}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="transition duration-700 group-hover:scale-[1.04]"
                  imgClassName="object-cover opacity-85"
                />
                {/* Dark teal gradient overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[rgba(4,31,28,0.97)] via-[rgba(4,31,28,0.72)] to-[rgba(4,31,28,0.18)]"
                  aria-hidden
                />
              </div>

              {/* Text content sits above overlay */}
              <div className="relative z-10 space-y-3 p-6">
                {/* Category pill */}
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/25 text-teal-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-bold text-teal-300 tracking-widest uppercase">
                    {NUMBER_LABEL[p.key]}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                  {p.label}
                </h3>

                <p className="text-sm leading-relaxed text-neutral-300 font-medium">
                  {p.description}
                </p>

                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-300 transition-all group-hover:text-teal-200 group-hover:gap-2.5">
                    {p.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
