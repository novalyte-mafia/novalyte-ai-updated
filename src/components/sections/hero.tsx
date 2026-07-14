"use client";

import { Button } from "@/components/ui/button";
import { navigate } from "@/lib/nav";
import { ArrowRight, Sparkles, Users, Building2, Store, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

const ECOSYSTEM_NODES = [
  { label: "Patients", icon: Stethoscope, color: "teal", pos: "top-[8%] left-[6%]", delay: "0s" },
  { label: "Clinics", icon: Building2, color: "emerald", pos: "top-[8%] right-[6%]", delay: "0.6s" },
  { label: "Professionals", icon: Users, color: "sky", pos: "bottom-[10%] left-[6%]", delay: "1.2s" },
  { label: "Suppliers", icon: Store, color: "violet", pos: "bottom-[10%] right-[6%]", delay: "1.8s" },
];

const colorMap: Record<string, { ring: string; bg: string; text: string; dot: string }> = {
  teal: { ring: "ring-teal-200", bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  emerald: { ring: "ring-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  sky: { ring: "ring-sky-200", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  violet: { ring: "ring-violet-200", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
};

export function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-teal-50/50 via-background to-background">
      {/* Grid texture */}
      <div className="novalyte-grid novalyte-radial-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-700 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Healthcare Technology Facilitator
            </div>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The Operating System for{" "}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Men's Health
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Novalyte AI connects patient demand, verified clinics, specialized healthcare
              professionals, equipment suppliers, and operational services through one intelligent
              healthcare ecosystem.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => navigate("directory")}>
                Explore the Platform <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={onGetStarted}>
                Join the Novalyte Network
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Designed for secure healthcare workflows · Built with privacy-conscious infrastructure · Supports compliant operational processes
            </p>
          </div>

          {/* Ecosystem visual */}
          <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-lg">
            {/* connecting lines (SVG) */}
            <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <linearGradient id="eco-line" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              {/* diamond connectors to center */}
              <g stroke="url(#eco-line)" strokeWidth="1.5" strokeDasharray="4 4" fill="none">
                <line x1="60" y1="60" x2="200" y2="200" />
                <line x1="340" y1="60" x2="200" y2="200" />
                <line x1="60" y1="340" x2="200" y2="200" />
                <line x1="340" y1="340" x2="200" y2="200" />
              </g>
              {/* outer ring connecting nodes */}
              <circle cx="200" cy="200" r="160" stroke="url(#eco-line)" strokeWidth="1.5" strokeDasharray="2 6" fill="none" opacity="0.6" />
            </svg>

            {/* center hub */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xl shadow-teal-600/20">
                <div className="novalyte-pulse-ring absolute inset-0 rounded-3xl bg-teal-400/40" />
                <div className="relative text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Novalyte</div>
                  <div className="text-base font-bold">AI Core</div>
                </div>
              </div>
            </div>

            {/* nodes */}
            {ECOSYSTEM_NODES.map((node) => {
              const Icon = node.icon;
              const c = colorMap[node.color];
              return (
                <div key={node.label} className={cn("absolute", node.pos)}>
                  <div className="novalyte-float flex flex-col items-center gap-2" style={{ animationDelay: node.delay }}>
                    <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1", c.ring)}>
                      <Icon className={cn("h-7 w-7", c.text)} />
                    </div>
                    <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
                      {node.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* floating data chips */}
            <div className="absolute left-[42%] top-[2%] rounded-lg border border-border bg-white/90 px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur">
              intake routed
            </div>
            <div className="absolute right-[2%] top-[44%] rounded-lg border border-border bg-white/90 px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur">
              clinic matched
            </div>
            <div className="absolute bottom-[2%] left-[44%] rounded-lg border border-border bg-white/90 px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur">
              talent sourced
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
