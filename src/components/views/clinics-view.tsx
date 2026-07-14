"use client";

import { useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { CTASection } from "@/components/shared/cta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { navigate } from "@/lib/nav";
import { US_STATES } from "@/lib/constants";
import {
  TrendingDown, Filter, ClipboardList, BarChart3, Users, ShieldAlert, Store,
  Settings, Network, Megaphone, FileText, UserCheck, Building2, Activity,
  ArrowRight, CheckCircle2, Beaker, Package, Wrench,
} from "lucide-react";

const PROBLEMS = [
  { icon: TrendingDown, title: "Inconsistent patient demand", desc: "Lead volume swings month to month with no predictable pipeline." },
  { icon: Filter, title: "Poor lead quality", desc: "Inquiries rarely convert because intent and intake are misaligned." },
  { icon: ClipboardList, title: "Fragmented intake workflows", desc: "Forms, spreadsheets, and EHRs don't talk to each other." },
  { icon: BarChart3, title: "Limited acquisition visibility", desc: "You can't see which campaigns or sources actually drive consults." },
  { icon: Users, title: "Staffing shortages", desc: "Finding NPs, medical directors, and coordinators is slow and painful." },
  { icon: ShieldAlert, title: "Credentialing friction", desc: "Credentialing delays block providers from going live." },
  { icon: Store, title: "Vendor discovery challenges", desc: "Labs, supplies, and software are scattered across unrelated vendors." },
  { icon: Settings, title: "Operational inefficiency", desc: "Manual handoffs leak time and patients at every step." },
  { icon: Network, title: "Expansion complexity", desc: "Opening new locations or states multiplies every problem above." },
];

const CAPABILITIES = [
  { icon: Megaphone, title: "Patient demand generation", desc: "Data-driven campaigns that capture high-intent patients." },
  { icon: FileText, title: "Treatment-specific landing pages", desc: "Pre-built, conversion-optimized pages per vertical." },
  { icon: ClipboardList, title: "Informational assessments", desc: "Structured screening that routes intent to the right care." },
  { icon: UserCheck, title: "Structured intake workflows", desc: "Organized intake information — not raw leads." },
  { icon: Building2, title: "Clinic directory profile", desc: "A verified profile patients can discover and trust." },
  { icon: BarChart3, title: "Clinic analytics", desc: "Source, conversion, and demand insight by treatment." },
  { icon: Users, title: "Workforce sourcing", desc: "Match with licensed talent across roles and states." },
  { icon: Store, title: "Vendor discovery", desc: "Find labs, supplies, software, and services in one place." },
  { icon: Package, title: "Service requests", desc: "Request quotes and manage vendor relationships." },
  { icon: Network, title: "Geographic expansion support", desc: "Coordinate new locations and multi-state telehealth." },
  { icon: Activity, title: "Referral & consultation tracking", desc: "See every patient from inquiry to consult." },
  { icon: Wrench, title: "Operational tooling", desc: "Reduce manual handoffs across your team." },
];

export function ClinicsView({ onGetStarted }: { data: unknown; onGetStarted: () => void }) {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-14 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-700">
              <Building2 className="h-3.5 w-3.5" /> For Clinics
            </div>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Build a Stronger, More Scalable Men's Health Clinic
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              Novalyte AI helps clinics generate patient demand, streamline intake, improve visibility,
              access specialized talent, and source critical operational resources.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onGetStarted}>
                Request Clinic Access <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("directory")}>Explore the Platform</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problems */}
      <SectionShell id="problems" tone="muted">
        <SectionHeading eyebrow="The Challenges" title="What holds men's health clinics back" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-5">
                <Icon className="h-5 w-5 text-rose-600" />
                <h3 className="mt-3 text-sm font-semibold text-foreground">{p.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </SectionShell>

      {/* Capabilities */}
      <SectionShell id="capabilities">
        <SectionHeading eyebrow="Platform Capabilities" title="Everything a clinic needs to grow, in one ecosystem" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="group rounded-2xl border border-border bg-card p-5 transition hover:border-teal-300 hover:shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{c.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </SectionShell>

      {/* Dashboard preview */}
      <DashboardPreview />

      {/* Onboarding form */}
      <ClinicOnboardingSection />

      <CTASection
        title="Ready to grow your men's health clinic?"
        description="Request clinic access and our team will help you get set up on the Novalyte ecosystem."
        primaryLabel="Request Clinic Access"
        onPrimary={onGetStarted}
        secondaryLabel="Browse the Marketplace"
        secondaryView="marketplace"
        tone="dark"
      />
    </>
  );
}

function DashboardPreview() {
  return (
    <SectionShell id="dashboard" tone="dark" className="!text-background">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Clinic Dashboard"
          title={<span className="text-background">A single view of demand, intake, and operations</span>}
          description={<span className="text-background/70">Track inquiries, assessments, consults, conversion, workforce, and marketplace activity — all connected.</span>}
          className="[&_button]:border-background/30 [&_button]:text-background/70"
        />
        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
          Preview · Development fixtures only
        </span>
      </div>

      {/* Mock dashboard */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-background/15 bg-background/5 p-4 backdrop-blur sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[repeat(4,1fr)]">
          <FixtureCard label="New patient inquiries" value="—" note="This period" />
          <FixtureCard label="Assessment completions" value="—" note="Informational" />
          <FixtureCard label="Consultation requests" value="—" note="Awaiting response" />
          <FixtureCard label="Conversion rate" value="—" note="Inquiry → consult" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          {/* Demand chart */}
          <div className="rounded-xl border border-background/15 bg-background/5 p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-background">Demand by source</h4>
              <span className="text-xs text-background/50">Fixture</span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: "Organic search", w: "72%" },
                { label: "Assessment routing", w: "58%" },
                { label: "Directory profile", w: "44%" },
                { label: "Paid campaigns", w: "31%" },
                { label: "Referrals", w: "22%" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs text-background/70">
                    <span>{s.label}</span>
                    <span className="text-background/40">—</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-background/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" style={{ width: s.w }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment interest */}
          <div className="rounded-xl border border-background/15 bg-background/5 p-5">
            <h4 className="text-sm font-semibold text-background">Treatment interest</h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {["TRT", "Weight loss", "GLP-1", "ED care", "Peptides", "Longevity", "Hair", "Recovery"].map((t) => (
                <span key={t} className="rounded-full border border-background/20 bg-background/5 px-2.5 py-1 text-xs text-background/70">{t}</span>
              ))}
            </div>
            <h4 className="mt-5 text-sm font-semibold text-background">Geographic demand</h4>
            <p className="mt-1 text-xs text-background/50">Heatmap not shown — requires live data integration.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniStat label="Workforce requests" value="—" icon={Users} />
              <MiniStat label="Marketplace requests" value="—" icon={Store} />
              <MiniStat label="Directory views" value="—" icon={Building2} />
              <MiniStat label="Active team" value="—" icon={UserCheck} />
            </div>
          </div>
        </div>
      </div>

      <DisclaimerBanner tone="muted" className="mt-6 !bg-background/5 !text-background/70 !border-background/15">
        <strong className="font-semibold">Development fixtures only.</strong> No production metrics are
        shown. The dashboard concept illustrates the data points clinics would see once integrated:
        new patient inquiries, assessment completions, consultation requests, conversion rate, patient
        source, treatment interest, geographic demand, workforce requests, marketplace requests, and
        directory profile views.
      </DisclaimerBanner>
    </SectionShell>
  );
}

function FixtureCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-background/15 bg-background/5 p-4">
      <p className="text-xs text-background/60">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-background">{value}</p>
      <p className="mt-0.5 text-xs text-background/40">{note}</p>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-lg border border-background/15 bg-background/5 p-3">
      <Icon className="h-3.5 w-3.5 text-background/50" />
      <p className="mt-1 text-lg font-semibold text-background">{value}</p>
      <p className="text-[10px] text-background/40">{label}</p>
    </div>
  );
}

function ClinicOnboardingSection() {
  const [form, setForm] = useState({
    clinicName: "", contactName: "", email: "", phone: "",
    city: "", state: "", specialties: "", currentVolume: "", goals: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/clinic-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      toast.success("Clinic access requested. Our team will reach out.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SectionShell id="onboarding" tone="muted">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow="Get Started"
            title="Request clinic access"
            description="Tell us about your clinic. A Novalyte team member will follow up to set up your directory profile, intake workflows, and ecosystem access."
          />
          <div className="mt-6 space-y-3">
            {[
              { icon: Building2, t: "Verified directory profile", d: "Get discovered by high-intent patients." },
              { icon: ClipboardList, t: "Structured intake", d: "Receive organized patient information." },
              { icon: Users, t: "Workforce sourcing", d: "Access licensed talent on demand." },
              { icon: Store, t: "Vendor marketplace", d: "Source labs, supplies, and services." },
            ].map((b) => (
              <div key={b.t} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                  <b.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.t}</p>
                  <p className="text-xs text-muted-foreground">{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {!done ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Clinic name" required>
                  <Input required value={form.clinicName} onChange={(e) => setForm({ ...form, clinicName: e.target.value })} />
                </Field>
                <Field label="Contact name" required>
                  <Input required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
                </Field>
                <Field label="Work email" required>
                  <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
                <Field label="City">
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </Field>
                <Field label="State">
                  <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>{US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Treatment specialties">
                <Input placeholder="e.g. TRT, Weight loss, Peptides" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
              </Field>
              <Field label="Current patient volume">
                <Input placeholder="e.g. ~120 consults/month" value={form.currentVolume} onChange={(e) => setForm({ ...form, currentVolume: e.target.value })} />
              </Field>
              <Field label="What are you hoping to achieve?">
                <Textarea rows={3} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
              </Field>
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" required className="mt-0.5 accent-teal-600" />
                <span>I acknowledge Novalyte AI is a technology platform, not a medical provider, and agree to the Terms and Privacy Policy.</span>
              </label>
              <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700" disabled={submitting}>
                {submitting ? "Submitting..." : "Request clinic access"} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-semibold">Request received</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Thank you. A Novalyte team member will follow up within 1–2 business days to set up your clinic.
              </p>
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}{required && <span className="text-rose-500"> *</span>}</Label>
      {children}
    </div>
  );
}
