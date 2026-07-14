"use client";

import { useState } from "react";
import { SectionShell } from "@/components/shared/section";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { SmartImage } from "@/components/shared/smart-image";
import { PremiumCard } from "@/components/shared/enterprise";
import { ClinicApplication, ApplicationConfirmation } from "@/components/views/clinic-application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { navigate } from "@/lib/nav";
import { US_STATES, TREATMENT_VERTICALS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowRight, TrendingUp, Users, Filter, ClipboardList, BarChart3, ShieldCheck,
  Building2, Store, Stethoscope, MapPin, Video, FileText, Activity, Zap,
  CheckCircle2, Lock, Sparkles, Compass, Clock, DollarSign, Target, Layers,
  Megaphone, Settings, Network, ChevronRight, Calculator, Calendar, BookOpen,
} from "lucide-react";

const GROWTH_FLOW = [
  { label: "Patient Demand", icon: Megaphone },
  { label: "Treatment Assessment", icon: FileText },
  { label: "Structured Intake", icon: ClipboardList },
  { label: "Clinic Match", icon: Building2 },
  { label: "Consultation", icon: Stethoscope },
  { label: "Treatment Opportunity", icon: TrendingUp },
  { label: "Ongoing Growth", icon: Activity },
];

const OWNER_NEEDS = [
  { icon: TrendingUp, title: "More qualified patient inquiries", desc: "Treatment-specific pathways organize patient intent before the clinic receives the request." },
  { icon: Calendar, title: "More booked consultations", desc: "Structured intake and faster follow-up reduce drop-off between inquiry and consultation." },
  { icon: MapPin, title: "Better market visibility", desc: "Appear in local and telehealth directory searches where patients are already looking." },
  { icon: Zap, title: "Faster intake and follow-up", desc: "Organized patient information replaces manual forms, spreadsheets, and missed calls." },
  { icon: Users, title: "Easier access to specialized staff", desc: "Source NPs, medical directors, and coordinators with men's health experience." },
  { icon: Settings, title: "Better control over growth", desc: "Track demand, consultations, sources, and follow-up status in one place." },
];

const CHALLENGES = [
  { letter: "A", title: "Unpredictable patient demand", desc: "Lead flow fluctuates, campaigns are difficult to measure, and clinics lack a consistent pipeline." },
  { letter: "B", title: "Low-intent or unstructured inquiries", desc: "Many inquiries lack treatment readiness, timing, location, or financial preference data." },
  { letter: "C", title: "Intake and follow-up leakage", desc: "Manual forms, spreadsheets, and disconnected systems cause prospective patients to disappear." },
  { letter: "D", title: "Limited capacity to scale", desc: "Staffing, credentialing, vendor sourcing, and new-market expansion slow growth." },
  { letter: "E", title: "Weak performance visibility", desc: "Clinic owners can't clearly see which treatments, sources, and workflows drive consultations." },
];

const GROWTH_SYSTEMS = [
  {
    id: "growth",
    num: "01",
    title: "Patient Growth",
    positioning: "Create clearer pathways from patient interest to clinic consultation.",
    icon: Megaphone,
    features: ["Treatment-specific landing pages", "Patient education pathways", "Informational assessments", "High-intent patient capture", "Geographic demand discovery", "Clinic matching", "Referral-source tracking"],
  },
  {
    id: "intake",
    num: "02",
    title: "Intake & Conversion",
    positioning: "Receive organized patient information instead of incomplete contact forms.",
    icon: ClipboardList,
    features: ["Structured patient intake", "Treatment-interest capture", "Timeline and readiness signals", "Care-preference capture", "Self-pay preference capture", "Consultation-request routing", "Follow-up status", "Conversion visibility"],
  },
  {
    id: "visibility",
    num: "03",
    title: "Clinic Visibility",
    positioning: "Help patients understand why your clinic is the right next step.",
    icon: Building2,
    features: ["Verified clinic profile", "Treatment specialties", "Provider profiles", "Locations & telehealth", "Clinic photography", "Educational content", "Directory discovery", "Local and national reach"],
  },
  {
    id: "operations",
    num: "04",
    title: "Clinic Operations",
    positioning: "Access the people and operational resources required to expand.",
    icon: Settings,
    features: ["Workforce sourcing", "Medical director access", "Nurse practitioner sourcing", "Credentialing support", "Vendor marketplace", "Laboratory partnerships", "Equipment sourcing", "Multi-location expansion"],
  },
];

const REVENUE_STEPS = [
  { title: "Increase relevant patient discovery", desc: "Treatment-specific pages, educational content, and directory visibility help clinics appear in front of men already researching care." },
  { title: "Capture treatment intent", desc: "Assessments organize patient goals and treatment interest before the clinic receives the request." },
  { title: "Improve intake quality", desc: "Patient goals, timing, care preference, and contact information arrive organized and ready for follow-up." },
  { title: "Reduce follow-up delays", desc: "Structured workflows help the clinic respond faster and track the status of every inquiry." },
  { title: "Increase consultation opportunities", desc: "Better-intake, faster follow-up, and clearer readiness signals create more booked consultations." },
  { title: "Improve operational capacity", desc: "Workforce and marketplace access help clinics support more patient demand." },
  { title: "Support geographic expansion", desc: "Multi-location and telehealth capabilities help clinics enter new markets." },
];

const FUNNEL_STAGES = [
  { label: "Patient Interest", value: 100, note: "Treatment-specific education and discovery" },
  { label: "Assessment Started", value: 64, note: "Structured intent capture" },
  { label: "Assessment Completed", value: 48, note: "Readiness and preference data" },
  { label: "Clinic Match", value: 42, note: "Location and treatment alignment" },
  { label: "Consultation Requested", value: 31, note: "Organized inquiry routed to clinic" },
  { label: "Consultation Booked", value: 19, note: "Clinic follow-up and conversion" },
];

const WHY_NOVALYTE = [
  { num: "01", title: "Built specifically for men's health", desc: "Organized around the treatments, patient questions, and operating needs of modern men's health clinics." },
  { num: "02", title: "Covers the full patient-to-operations journey", desc: "From discovery through intake, consultation, workforce, and vendor operations." },
  { num: "03", title: "Treatment-specific, not generic", desc: "Each treatment vertical has its own assessments, education, and clinic matching logic." },
  { num: "04", title: "Structured information, not raw leads", desc: "Patient requests include goals, treatment interest, location, timeline, and care preference." },
  { num: "05", title: "Designed for measurable growth", desc: "Track demand, assessments, consultations, sources, treatments, and follow-up status." },
];

const USE_CASES = [
  { icon: Building2, title: "Independent Men's Health Clinic", needs: "More consistent demand, better local visibility, simpler intake, operational support." },
  { icon: Video, title: "Telehealth Men's Health Provider", needs: "Multi-state discovery, treatment-specific intake, geographic demand insight, credentialing support." },
  { icon: Network, title: "Multi-Location Clinic Group", needs: "Location-level demand, shared workflows, centralized visibility, expansion support." },
  { icon: Sparkles, title: "New Clinic or Treatment Launch", needs: "Patient discovery, directory presence, workforce access, vendor sourcing, launch infrastructure." },
];

const IMPLEMENTATION = [
  { num: "01", title: "Clinic profile & requirements", desc: "Confirm locations, treatments, providers, and care preferences." },
  { num: "02", title: "Patient pathway setup", desc: "Configure treatment categories, intake questions, and consultation routing." },
  { num: "03", title: "Directory & workflow launch", desc: "Publish clinic profile and activate operational workflows." },
  { num: "04", title: "Performance review", desc: "Review demand, consultation activity, and opportunities for improvement." },
];

export function ClinicsView({ onGetStarted }: { data: unknown; onGetStarted: () => void }) {
  const [activeSystem, setActiveSystem] = useState("growth");
  const [activeTreatment, setActiveTreatment] = useState(TREATMENT_VERTICALS[0].slug);
  const [activeClinicType, setActiveClinicType] = useState("independent");
  const [showApplication, setShowApplication] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<{ id: string; clinicName: string } | null>(null);

  // ROI calculator state
  const [roi, setRoi] = useState({ inquiries: 100, consultRate: 30, conversion: 40, value: 1500 });

  const roiResult = Math.round((roi.inquiries * (roi.consultRate / 100) * (roi.conversion / 100) * roi.value));

  return (
    <div className="bg-background">
      {/* ── 1. HERO ────────────────────────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/40 to-background">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-700 backdrop-blur">
              <Building2 className="h-3.5 w-3.5" /> Built for men's health clinics
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[52px]">
              Turn Patient Demand Into{" "}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Predictable Clinic Growth
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Novalyte AI helps men's health clinics attract treatment-ready patients, organize intake, improve consultation conversion, increase visibility, access specialized talent, and source operational resources.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => document.getElementById("application")?.scrollIntoView({ behavior: "smooth" })}>
                Apply for a Free Clinic Listing <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("growth-model")?.scrollIntoView({ behavior: "smooth" })}>
                Explore Clinic Growth Services
              </Button>
              <button onClick={() => navigate("directory")} className="text-sm font-medium text-teal-700 underline-offset-2 hover:underline sm:ml-2">
                See the Platform in Action
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600" /> Built specifically for men's health</span>
              <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-teal-600" /> Treatment-specific pathways</span>
              <span className="flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5 text-teal-600" /> Structured intake & matching</span>
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-teal-600" /> No long-term commitment (early access)</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Novalyte AI is a technology platform and does not provide medical care.</p>
          </div>
          {/* Right: image + floating dashboard */}
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-premium-lg">
              <SmartImage
                src="/images/clinics/clinic-2.jpg"
                alt="Modern men's health clinic team reviewing operations and patient information"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                imgClassName="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 to-transparent" aria-hidden />
            </div>
            {/* Floating dashboard preview */}
            <div className="absolute -bottom-4 -left-4 hidden w-56 rounded-xl border border-border bg-card p-3 shadow-premium-lg sm:block">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">This month</span>
                <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-700">DEMO</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div><p className="text-lg font-semibold text-foreground">128</p><p className="text-[9px] text-muted-foreground">Inquiries</p></div>
                <div><p className="text-lg font-semibold text-foreground">37</p><p className="text-[9px] text-muted-foreground">Consults</p></div>
              </div>
              <div className="mt-2 flex items-end gap-1">
                {[40, 55, 35, 70, 50, 80, 60].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-teal-500/70" style={{ height: `${h * 0.4}px` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CONNECTED GROWTH MODEL ──────────────────────────── */}
      <section id="growth-model" className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">One growth system for the entire clinic journey</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">Novalyte AI connects patient acquisition, structured intake, clinic discovery, workforce access, and vendor operations in one ecosystem.</p>
          </div>
          {/* Connected flow */}
          <div className="mt-8 hidden lg:block">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-emerald-400" aria-hidden />
              {GROWTH_FLOW.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative flex flex-col items-center text-center" style={{ width: `${100 / GROWTH_FLOW.length}%` }}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-premium-sm ring-2 ring-teal-400">
                      <Icon className="h-4 w-4 text-teal-600" />
                    </span>
                    <p className="mt-2 text-[11px] font-medium leading-tight text-foreground">{step.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Mobile vertical */}
          <div className="mt-6 lg:hidden">
            <div className="relative space-y-3">
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-200 via-teal-400 to-emerald-400" aria-hidden />
              {GROWTH_FLOW.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative flex items-center gap-3">
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-premium-sm ring-2 ring-teal-400">
                      <Icon className="h-4 w-4 text-teal-600" />
                    </span>
                    <p className="text-sm font-medium text-foreground">{step.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. WHAT CLINIC OWNERS NEED ─────────────────────────── */}
      <section className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">What clinic owners actually need</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {OWNER_NEEDS.map((item) => {
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
        </div>
      </section>

      {/* ── 4. CLINIC GROWTH CHALLENGES ────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-12 sm:py-14">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">What holds men's health clinics back</h2>
            <p className="mt-2 text-sm text-muted-foreground">Five strategic challenges that limit clinic growth.</p>
            <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-2xl shadow-premium-md">
              <SmartImage src="/images/clinics/clinic-4.jpg" alt="Clinic operations team discussing performance" fill sizes="(max-width: 1024px) 100vw, 40vw" imgClassName="object-cover" />
            </div>
          </div>
          <div className="space-y-2.5">
            {CHALLENGES.map((c) => (
              <div key={c.letter} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 font-bold text-rose-600 ring-1 ring-rose-100">{c.letter}</span>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{c.title}</h4>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FOUR GROWTH SYSTEMS ─────────────────────────────── */}
      <section className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Four clinic-growth systems in one platform</h2>
          <p className="mt-2 text-sm text-muted-foreground">Organized around revenue, not feature lists.</p>
          {/* Tab selector */}
          <div className="mt-6 flex flex-wrap gap-2">
            {GROWTH_SYSTEMS.map((sys) => {
              const Icon = sys.icon;
              const active = activeSystem === sys.id;
              return (
                <button
                  key={sys.id}
                  onClick={() => setActiveSystem(sys.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition",
                    active ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200" : "border-border bg-card text-foreground/70 hover:border-teal-200",
                  )}
                >
                  <Icon className="h-4 w-4" /> {sys.title}
                </button>
              );
            })}
          </div>
          {/* Active system content */}
          {GROWTH_SYSTEMS.filter((s) => s.id === activeSystem).map((sys) => {
            const Icon = sys.icon;
            return (
              <div key={sys.id} className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr] novalyte-fade-up">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">System {sys.num}</span>
                      <h3 className="text-xl font-semibold text-foreground">{sys.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-pretty text-sm text-muted-foreground">{sys.positioning}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {sys.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Visual preview */}
                <SystemPreview systemId={sys.id} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. STRUCTURED PATIENT INQUIRY PREVIEW ──────────────── */}
      <section className="border-b border-border bg-muted/30 py-12 sm:py-14">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">What a structured patient inquiry can include</h2>
            <p className="mt-2 text-sm text-muted-foreground">See exactly what an organized patient opportunity looks like before your clinic follows up.</p>
            <ul className="mt-5 space-y-2">
              {["Treatment interest and primary goals", "Location, state, and telehealth preference", "Consultation timeline and readiness", "Self-pay openness and prior treatment status", "Validated contact information and consent", "Follow-up status tracking"].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /> {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Mock intake record */}
          <PremiumCard className="p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient Inquiry</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">DEMO DATA</span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: "Treatment Interest", value: "Testosterone Replacement Therapy" },
                { label: "Primary Goals", value: "Energy, recovery, sexual health" },
                { label: "Preferred Care", value: "Telehealth or in-person" },
                { label: "Timeline", value: "Within 14 days" },
                { label: "Self-Pay", value: "Open to discussing options" },
                { label: "Location", value: "Austin, TX 78701" },
                { label: "Contact Status", value: "Email and phone validated" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 border-b border-border/50 pb-2">
                  <span className="text-xs font-medium text-muted-foreground">{row.label}</span>
                  <span className="text-right text-xs font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700">Contact patient</Button>
              <Button size="sm" variant="outline">Assign to staff</Button>
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">Preview · Demonstration data only. Not a real patient record.</p>
          </PremiumCard>
        </div>
      </section>

      {/* ── 7. CLINIC DASHBOARD PREVIEW ────────────────────────── */}
      <section className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Your clinic command center</h2>
              <p className="mt-2 text-sm text-muted-foreground">Track demand, assessments, consultations, sources, and follow-up in one place.</p>
            </div>
            <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 sm:block">Product preview · Demonstration data only</span>
          </div>
          {/* Dashboard mockup */}
          <PremiumCard className="mt-6 overflow-hidden">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Clinic Dashboard</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 sm:hidden">DEMO</span>
              </div>
            </div>
            <div className="p-4">
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "New inquiries", value: "128", sub: "+12% wk", icon: Megaphone },
                  { label: "Assessments", value: "94", sub: "73% rate", icon: FileText },
                  { label: "Consult requests", value: "61", sub: "+8% wk", icon: Stethoscope },
                  { label: "Consults booked", value: "37", sub: "39% rate", icon: CheckCircle2 },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-lg border border-border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                        <Icon className="h-3.5 w-3.5 text-teal-600" />
                      </div>
                      <p className="mt-1.5 text-2xl font-semibold text-foreground">{stat.value}</p>
                      <p className="text-[10px] text-teal-600">{stat.sub}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
                {/* Funnel chart */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="text-xs font-semibold text-foreground">Inquiry-to-consultation funnel</h4>
                  <div className="mt-3 space-y-2">
                    {FUNNEL_STAGES.map((stage) => (
                      <div key={stage.label} className="flex items-center gap-2">
                        <span className="w-32 shrink-0 text-[10px] text-muted-foreground">{stage.label}</span>
                        <div className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                          <div className="flex h-full items-center rounded bg-gradient-to-r from-teal-500 to-emerald-500 px-2" style={{ width: `${stage.value}%` }}>
                            <span className="text-[10px] font-bold text-white">{stage.value}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Treatment mix + source */}
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="text-xs font-semibold text-foreground">Demand by treatment</h4>
                    <div className="mt-2 space-y-1.5">
                      {[
                        { label: "TRT", pct: 34 },
                        { label: "Weight loss", pct: 22 },
                        { label: "GLP-1", pct: 18 },
                        { label: "ED care", pct: 14 },
                        { label: "Other", pct: 12 },
                      ].map((t) => (
                        <div key={t.label} className="flex items-center gap-2">
                          <span className="w-16 shrink-0 text-[10px] text-muted-foreground">{t.label}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-teal-500" style={{ width: `${t.pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-[10px] font-medium text-foreground">{t.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="text-xs font-semibold text-foreground">Demand by source</h4>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[
                        { label: "Organic", pct: "34%" },
                        { label: "Directory", pct: "26%" },
                        { label: "Assessment", pct: "21%" },
                        { label: "Paid", pct: "12%" },
                        { label: "Referral", pct: "7%" },
                      ].map((s) => (
                        <span key={s.label} className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-foreground/80">{s.label} · {s.pct}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>
          <p className="mt-3 text-center text-xs text-muted-foreground">Product preview · Demonstration data only. Not actual customer results.</p>
        </div>
      </section>

      {/* ── 8. REVENUE GROWTH FRAMEWORK ────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">How Novalyte AI supports clinic revenue growth</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REVENUE_STEPS.map((step, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-premium-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{i + 1}</span>
                  <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
            <div className="flex items-center rounded-xl border border-teal-200 bg-teal-50/40 p-4">
              <p className="text-xs text-teal-800">Revenue impact varies by clinic, market, treatment mix, response time, pricing, provider capacity, and implementation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. TREATMENT-SPECIFIC PATHWAYS ─────────────────────── */}
      <section className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Built around the treatments your clinic offers</h2>
          <p className="mt-2 text-sm text-muted-foreground">Select a treatment to see how Novalyte AI supports the full pathway.</p>
          {/* Treatment selector */}
          <div className="mt-6 flex flex-wrap gap-2">
            {TREATMENT_VERTICALS.map((t) => {
              const active = activeTreatment === t.slug;
              return (
                <button
                  key={t.slug}
                  onClick={() => setActiveTreatment(t.slug)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                    active ? "border-teal-400 bg-teal-50 text-teal-800 ring-1 ring-teal-200" : "border-border bg-card text-foreground/70 hover:border-teal-200",
                  )}
                >
                  {t.short}
                </button>
              );
            })}
          </div>
          {/* Pathway display */}
          <div className="mt-6 novalyte-fade-up">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { icon: BookOpen, label: "Patient education" },
                { icon: FileText, label: "Treatment assessment" },
                { icon: ClipboardList, label: "Structured intake" },
                { icon: Building2, label: "Clinic matching" },
                { icon: Compass, label: "Directory discovery" },
                { icon: BarChart3, label: "Demand tracking" },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
                    <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <p className="mt-2 text-xs font-medium text-foreground">{step.label}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{TREATMENT_VERTICALS.find((t) => t.slug === activeTreatment)?.label}</span> — treatment-specific education, assessment, intake, matching, directory discovery, and demand tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ── 10. DIRECTORY VALUE ────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-12 sm:py-14">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Turn your clinic profile into a patient-decision page</h2>
            <p className="mt-2 text-sm text-muted-foreground">Help patients understand your clinic before they request a consultation.</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {["Cover image & logo", "Verified status", "Treatment specialties", "Provider team", "Telehealth availability", "Locations & hours", "Pricing approach", "Patient eligibility", "FAQ", "Consultation CTA"].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /> {item}
                </li>
              ))}
            </ul>
            <Button className="mt-5 bg-teal-600 text-white hover:bg-teal-700" onClick={() => navigate("directory")}>
              Explore the Directory <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {/* Mock clinic profile */}
          <PremiumCard className="overflow-hidden">
            <div className="relative h-32">
              <SmartImage src="/images/clinics/clinic-1.jpg" alt="Clinic profile cover" fill sizes="(max-width: 1024px) 100vw, 50vw" imgClassName="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              <div className="absolute bottom-2 left-3 flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white">MM</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Meridian Men's Health</p>
                  <span className="flex items-center gap-1 text-[10px] text-teal-700"><ShieldCheck className="h-3 w-3" /> Verified</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5">
                {["TRT", "Hormone Optimization", "Weight Loss", "Telehealth"].map((tag) => (
                  <Badge key={tag} variant="outline" className="border-teal-200 bg-teal-50/50 text-[10px] text-teal-700">{tag}</Badge>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3 w-3" /> Austin, TX</div>
                <div className="flex items-center gap-1.5 text-muted-foreground"><Video className="h-3 w-3" /> Telehealth</div>
                <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3 w-3" /> Mon–Fri 8–6</div>
                <div className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-3 w-3" /> 3 providers</div>
              </div>
              <Button size="sm" className="mt-3 w-full bg-teal-600 text-white hover:bg-teal-700">Request consultation</Button>
            </div>
          </PremiumCard>
        </div>
      </section>

      {/* ── 11. WORKFORCE VALUE ────────────────────────────────── */}
      <section className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="order-2 lg:order-1">
            <PremiumCard className="p-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <SmartImage src="/images/professionals/pro-1.jpg" alt="Healthcare professional" fill sizes="48px" imgClassName="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Dr. Alan Pierce</p>
                  <p className="text-xs text-muted-foreground">Physician · TX, FL, CO</p>
                </div>
                <span className="ml-auto flex items-center gap-1 text-[10px] text-teal-700"><ShieldCheck className="h-3 w-3" /> Verified</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["TRT", "Hormone Optimization", "Longevity"].map((s) => (
                  <Badge key={s} variant="outline" className="border-teal-200 bg-teal-50/50 text-[10px] text-teal-700">{s}</Badge>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div><p className="font-semibold text-foreground">12</p><p className="text-muted-foreground">Years</p></div>
                <div><p className="font-semibold text-foreground">3</p><p className="text-muted-foreground">States</p></div>
                <div><p className="font-semibold text-foreground">Open</p><p className="text-muted-foreground">Avail.</p></div>
              </div>
            </PremiumCard>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Access specialized men's health talent</h2>
            <p className="mt-2 text-sm text-muted-foreground">Reduce time spent sourcing candidates and find professionals with treatment-relevant experience.</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Medical directors", "Physicians", "Nurse practitioners", "Physician assistants", "Registered nurses", "Medical assistants", "Patient coordinators", "Operations", "Telehealth clinicians", "Credentialing"].map((role) => (
                <span key={role} className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground/80">{role}</span>
              ))}
            </div>
            <Button className="mt-5 bg-teal-600 text-white hover:bg-teal-700" onClick={() => navigate("workforce")}>
              Explore Workforce <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── 12. MARKETPLACE VALUE ──────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-12 sm:py-14">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Source what your clinic needs to operate and expand</h2>
            <p className="mt-2 text-sm text-muted-foreground">Compare vendors, request quotes, and discover specialized suppliers in one place.</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Lab partners", "Diagnostic equipment", "Exam furniture", "Phlebotomy supplies", "Telehealth tech", "EHR software", "Credentialing", "Marketing", "Recovery equipment"].map((cat) => (
                <span key={cat} className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground/80">{cat}</span>
              ))}
            </div>
            <Button className="mt-5 bg-teal-600 text-white hover:bg-teal-700" onClick={() => navigate("marketplace")}>
              Browse Marketplace <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {/* Marketplace preview */}
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { img: "/images/marketplace/lab-1.jpg", title: "Men's Health Lab Panel", vendor: "Helix Diagnostics", price: "From $89" },
              { img: "/images/marketplace/inject-1.jpg", title: "Injection Supply Kit", vendor: "Apex Medical", price: "$120/case" },
            ].map((p) => (
              <PremiumCard key={p.title} className="overflow-hidden">
                <div className="relative h-24">
                  <SmartImage src={p.img} alt={p.title} fill sizes="(max-width: 640px) 100vw, 50vw" imgClassName="object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground">{p.vendor}</p>
                  <p className="text-sm font-semibold text-foreground">{p.title}</p>
                  <p className="mt-1 text-xs font-medium text-teal-700">{p.price}</p>
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 13. CLINIC USE CASES ───────────────────────────────── */}
      <section className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Built for clinics at every stage</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((uc) => {
              const Icon = uc.icon;
              return (
                <div key={uc.title} className="rounded-xl border border-border bg-card p-5 shadow-premium-xs">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <h4 className="mt-3 text-sm font-semibold text-foreground">{uc.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{uc.needs}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 14. WHY NOVALYTE ───────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Why men's health clinics choose Novalyte AI</h2>
          <div className="mt-6 space-y-2.5">
            {WHY_NOVALYTE.map((item) => (
              <div key={item.num} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white">{item.num}</span>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 15. ROI FRAMEWORK ──────────────────────────────────── */}
      <section className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Understand the economics of your growth</h2>
            <p className="mt-2 text-sm text-muted-foreground">Adjust the variables to see an illustrative opportunity based on your own assumptions.</p>
            <div className="mt-5 space-y-4">
              <div>
                <Label className="text-xs">Monthly patient inquiries: <span className="font-bold text-foreground">{roi.inquiries}</span></Label>
                <input type="range" min="20" max="500" step="10" value={roi.inquiries} onChange={(e) => setRoi({ ...roi, inquiries: Number(e.target.value) })} className="mt-1 w-full accent-teal-600" />
              </div>
              <div>
                <Label className="text-xs">Consultation booking rate: <span className="font-bold text-foreground">{roi.consultRate}%</span></Label>
                <input type="range" min="5" max="60" step="1" value={roi.consultRate} onChange={(e) => setRoi({ ...roi, consultRate: Number(e.target.value) })} className="mt-1 w-full accent-teal-600" />
              </div>
              <div>
                <Label className="text-xs">Treatment conversion rate: <span className="font-bold text-foreground">{roi.conversion}%</span></Label>
                <input type="range" min="10" max="80" step="1" value={roi.conversion} onChange={(e) => setRoi({ ...roi, conversion: Number(e.target.value) })} className="mt-1 w-full accent-teal-600" />
              </div>
              <div>
                <Label className="text-xs">Average first-year patient value ($)</Label>
                <Input type="number" value={roi.value} onChange={(e) => setRoi({ ...roi, value: Number(e.target.value) })} className="mt-1" />
              </div>
            </div>
          </div>
          <PremiumCard className="p-6 text-center">
            <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
              <Calculator className="h-6 w-6" />
            </span>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Estimated monthly opportunity</p>
            <p className="mt-1 text-4xl font-bold text-foreground">${roiResult.toLocaleString()}</p>
            <p className="mt-2 text-xs text-muted-foreground">Based on {roi.inquiries} inquiries → {Math.round(roi.inquiries * roi.consultRate / 100)} consults → {Math.round(roi.inquiries * roi.consultRate / 100 * roi.conversion / 100)} patients</p>
            <Separator className="my-4" />
            <p className="text-[10px] leading-relaxed text-muted-foreground">This calculator provides illustrative estimates only and does not guarantee revenue. Actual results vary by clinic, market, and implementation.</p>
          </PremiumCard>
        </div>
      </section>

      {/* ── 16. IMPLEMENTATION ─────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">From clinic access to active growth infrastructure</h2>
          <div className="mt-8 hidden lg:block">
            <div className="relative">
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-emerald-400" aria-hidden />
              <div className="relative grid grid-cols-4 gap-4">
                {IMPLEMENTATION.map((step) => (
                  <div key={step.num} className="flex flex-col items-center text-center">
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-premium-sm ring-2 ring-teal-400">
                      <span className="text-xs font-bold text-teal-700">{step.num}</span>
                    </span>
                    <h4 className="mt-2.5 text-xs font-semibold text-foreground">{step.title}</h4>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 lg:hidden">
            <div className="relative space-y-4">
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-200 via-teal-400 to-emerald-400" aria-hidden />
              {IMPLEMENTATION.map((step) => (
                <div key={step.num} className="relative flex gap-3">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-premium-sm ring-2 ring-teal-400">
                    <span className="text-xs font-bold text-teal-700">{step.num}</span>
                  </span>
                  <div className="pt-1.5">
                    <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 17. TRUST ──────────────────────────────────────────── */}
      <section className="bg-foreground py-12 text-background sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-background sm:text-3xl">Designed for responsible healthcare growth</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { icon: ShieldCheck, label: "Clear separation between technology and clinical care" },
              { icon: Lock, label: "Explicit patient consent" },
              { icon: FileText, label: "Structured data handling" },
              { icon: CheckCircle2, label: "No fabricated reviews" },
              { icon: TrendingUp, label: "No false revenue promises" },
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
          <p className="mt-5 text-xs text-background/60">Designed to support secure healthcare workflows. Novalyte AI does not claim HIPAA compliance unless the full implementation and vendors have been verified.</p>
        </div>
      </section>

      {/* ── 18. FREE LISTING EXPLANATION ───────────────────────── */}
      <section className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Applying is free</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Applying to join the Novalyte AI Clinic Directory is free. Approved clinics may receive a verified directory profile. Enhanced growth, patient-acquisition, workforce, marketplace, and promotional services are optional and may be offered separately.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Free application — no application fee",
                "Approved basic listing may be free during launch phase",
                "Submission does not guarantee approval",
                "Novalyte AI may verify clinic and provider information",
                "Incomplete or unverifiable applications may not be published",
                "Optional growth services are separate and may have fees",
                "Paid services do not guarantee clinical outcomes or revenue",
                "Clinics remain independently responsible for all medical care",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 19. COMPLETE CLINIC APPLICATION ────────────────────── */}
      <section id="application" className="border-b border-border py-12 sm:py-14">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          {submittedApp ? (
            <ApplicationConfirmation
              applicationId={submittedApp.id}
              clinicName={submittedApp.clinicName}
              onBackToClinics={() => { setSubmittedApp(null); setShowApplication(false); }}
            />
          ) : !showApplication ? (
            <div className="rounded-2xl border border-border bg-card p-8 shadow-premium-sm text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                <Building2 className="h-3.5 w-3.5" /> Join the Novalyte AI Clinic Network
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Apply for your free clinic directory listing</h2>
              <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
                Create a verified clinic profile, improve how patients discover your services, and tell us which patient-acquisition, workforce, marketplace, and growth capabilities may support your organization.
              </p>
              <div className="mx-auto mt-6 grid max-w-2xl gap-2.5 sm:grid-cols-2">
                {[
                  "Free application",
                  "Complete patient-facing clinic profile",
                  "Treatment and location visibility",
                  "Provider and telehealth information",
                  "Optional patient-acquisition services",
                  "Optional workforce and vendor support",
                ].map((b) => (
                  <div key={b} className="flex items-center justify-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-left text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" /> {b}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-teal-600" /> Approximately 8–12 minutes · Progress saved automatically
              </div>
              <Button size="lg" className="mt-6 bg-teal-600 text-white hover:bg-teal-700" onClick={() => setShowApplication(true)}>
                Begin Clinic Application <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">Your application will be reviewed before publication. Submission does not guarantee approval.</p>
            </div>
          ) : (
            <ClinicApplication onComplete={(appId) => setSubmittedApp({ id: appId, clinicName: "" })} />
          )}
        </div>
      </section>

      {/* ── 20. APPLICATION PROCESS ────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-12 sm:py-14">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">What happens after you apply</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { num: "01", title: "Completeness review", desc: "We review your application for completeness." },
              { num: "02", title: "Verification", desc: "Clinic and credential verification." },
              { num: "03", title: "Profile preparation", desc: "We prepare your directory profile." },
              { num: "04", title: "Approval", desc: "Clinic approval and confirmation." },
              { num: "05", title: "Publication", desc: "Your profile goes live in the directory." },
              { num: "06", title: "Growth discussion", desc: "Optional growth-services conversation." },
            ].map((step) => (
              <div key={step.num} className="rounded-xl border border-border bg-card p-4 text-center shadow-premium-xs">
                <span className="flex h-8 w-8 mx-auto items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{step.num}</span>
                <h4 className="mt-2.5 text-xs font-semibold text-foreground">{step.title}</h4>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">We will contact the authorized representative if additional information is required. Approval timeframes vary by application complexity.</p>
        </div>
      </section>

      {/* ── 19. FINAL CTA ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-emerald-700 py-12 text-white sm:py-14">
        <div className="novalyte-dots absolute inset-0 opacity-10" aria-hidden />
        <div className="relative mx-auto w-full max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Build a more predictable growth engine for your clinic</h2>
          <p className="mt-3 text-pretty text-sm text-white/90 sm:text-base">Connect patient demand, structured intake, clinic visibility, workforce access, and vendor operations through one men's health ecosystem.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-white/90" onClick={() => document.getElementById("application")?.scrollIntoView({ behavior: "smooth" })}>
              Apply for a Free Clinic Listing <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" onClick={() => navigate("directory")}>View the Clinic Directory</Button>
            <button onClick={() => navigate("marketplace")} className="text-sm font-medium text-white/90 underline-offset-2 hover:underline">Browse the Marketplace</button>
          </div>
        </div>
      </section>

      <DisclaimerBanner tone="muted" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        Novalyte AI is a healthcare technology platform and does not provide medical care, diagnosis, or treatment. All demonstration data shown is fictional and for illustrative purposes only. Revenue illustrations do not guarantee results.
      </DisclaimerBanner>
    </div>
  );
}

/* ── System preview component ────────────────────────────────── */
function SystemPreview({ systemId }: { systemId: string }) {
  if (systemId === "growth") {
    return (
      <PremiumCard className="p-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-xs font-semibold text-foreground">Patient demand pipeline</span>
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">DEMO</span>
        </div>
        <div className="mt-3 space-y-2">
          {[
            { label: "Organic search", pct: 72 },
            { label: "Assessment routing", pct: 58 },
            { label: "Directory profile", pct: 44 },
            { label: "Paid campaigns", pct: 31 },
          ].map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>{s.label}</span><span>—</span></div>
              <div className="mt-0.5 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-teal-500" style={{ width: `${s.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </PremiumCard>
    );
  }
  if (systemId === "intake") {
    return (
      <PremiumCard className="p-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-xs font-semibold text-foreground">Structured intake</span>
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">DEMO</span>
        </div>
        <div className="mt-3 space-y-1.5">
          {[
            { label: "Treatment interest", value: "TRT" },
            { label: "Primary goals", value: "Energy, recovery" },
            { label: "Timeline", value: "Within 14 days" },
            { label: "Care preference", value: "Telehealth" },
            { label: "Self-pay", value: "Open" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between border-b border-border/50 pb-1">
              <span className="text-[10px] text-muted-foreground">{row.label}</span>
              <span className="text-[10px] font-semibold text-foreground">{row.value}</span>
            </div>
          ))}
        </div>
      </PremiumCard>
    );
  }
  if (systemId === "visibility") {
    return (
      <PremiumCard className="overflow-hidden">
        <div className="relative h-28">
          <SmartImage src="/images/clinics/clinic-3.jpg" alt="Clinic directory profile" fill sizes="(max-width: 1024px) 100vw, 50vw" imgClassName="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-[10px] font-bold text-white">SV</span>
            <div><p className="text-[11px] font-semibold text-foreground">Summit Vitality</p><span className="flex items-center gap-1 text-[9px] text-teal-700"><ShieldCheck className="h-2.5 w-2.5" /> Verified</span></div>
          </div>
        </div>
        <div className="p-3">
          <div className="flex flex-wrap gap-1">
            {["TRT", "Peptides", "Recovery"].map((t) => <Badge key={t} variant="outline" className="border-teal-200 text-[9px] text-teal-700">{t}</Badge>)}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">Denver, CO · Telehealth</p>
        </div>
      </PremiumCard>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      <PremiumCard className="p-3">
        <div className="relative h-16 overflow-hidden rounded-lg"><SmartImage src="/images/professionals/pro-5.jpg" alt="Healthcare professional" fill sizes="50vw" imgClassName="object-cover" /></div>
        <p className="mt-2 text-[10px] font-semibold text-foreground">Dr. Nair</p>
        <p className="text-[9px] text-muted-foreground">Medical Director</p>
      </PremiumCard>
      <PremiumCard className="p-3">
        <div className="relative h-16 overflow-hidden rounded-lg"><SmartImage src="/images/marketplace/product-1.jpg" alt="Medical equipment" fill sizes="50vw" imgClassName="object-cover" /></div>
        <p className="mt-2 text-[10px] font-semibold text-foreground">Lab Panel</p>
        <p className="text-[9px] text-muted-foreground">Helix Diagnostics</p>
      </PremiumCard>
    </div>
  );
}

