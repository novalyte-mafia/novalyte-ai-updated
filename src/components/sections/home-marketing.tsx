"use client";

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
    marketplace: IMAGES.marketplace.general[0],
  };
  const pillarAlts: Record<string, string> = {
    acquisition: "Male patient in a consultation with a healthcare provider",
    directory: "Modern men's health clinic exterior",
    workforce: "Healthcare professional in clinical setting",
    marketplace: "Medical equipment and clinic supplies",
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
          return (
            <div
              key={p.key}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-premium-sm transition hover:border-teal-300 hover:shadow-premium-lg"
            >
              {/* Pillar image */}
              <div className="relative h-44 overflow-hidden">
                <SmartImage
                  src={pillarImages[p.key] ?? IMAGES.hero.clinicScene}
                  alt={pillarAlts[p.key] ?? "Men's health platform"}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="transition duration-500 group-hover:scale-105"
                  imgClassName="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" aria-hidden />
                <div className="absolute bottom-3 left-5 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white shadow-premium-md">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground">{p.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                <button
                  onClick={() => navigate(p.view)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 transition hover:gap-2.5"
                >
                  {p.cta} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
