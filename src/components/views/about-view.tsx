"use client";

import { useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { CTASection } from "@/components/shared/cta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { navigate } from "@/lib/nav";
import {
  ArrowRight,
  Users,
  Building2,
  Briefcase,
  Store,
  Layers,
  ShieldCheck,
  Workflow,
  MessageSquare,
  CheckCircle2,
  HeartPulse,
} from "lucide-react";

type Role = "patient" | "clinic" | "professional" | "vendor" | "investor" | "other";

const MISSION_CARDS = [
  {
    icon: Users,
    title: "Connect demand",
    description:
      "Surface high-intent patients seeking men's health care and route them to clinics that can actually serve them — by location, treatment, telehealth, and capability.",
  },
  {
    icon: ShieldCheck,
    title: "Verify clinics",
    description:
      "Apply a structured verification process to clinic business and provider information so patients, professionals, and vendors can transact with greater confidence.",
  },
  {
    icon: Briefcase,
    title: "Source talent",
    description:
      "Build a workforce hub of physicians, nurse practitioners, physician assistants, nurses, coordinators, and operational staff aligned to men's health specialties.",
  },
  {
    icon: Store,
    title: "Unify services",
    description:
      "Aggregate the equipment, laboratory, software, billing, compliance, and operational vendors clinics need to launch, scale, and operate modern men's health practices.",
  },
];

const APPROACH_STEPS = [
  {
    icon: HeartPulse,
    title: "Patients",
    description:
      "Patients arrive through education, assessments, and discovery flows. We capture intent and route it intelligently to the right clinics.",
  },
  {
    icon: Building2,
    title: "Clinics",
    description:
      "Verified clinics receive structured leads, manage intake, and use Novalyte tooling to coordinate their patient journey and operations.",
  },
  {
    icon: Briefcase,
    title: "Workforce",
    description:
      "Clinics tap into a network of pre-qualified professionals to fill clinical and operational roles — full-time, contract, or locum.",
  },
  {
    icon: Store,
    title: "Marketplace",
    description:
      "Clinics discover vetted vendors and services to expand capabilities, from lab partners to telehealth platforms to compliance support.",
  },
];

const PILLARS = [
  {
    icon: Layers,
    title: "One connected ecosystem",
    description: "Patient demand, clinics, workforce, and services in a single coordinated workflow.",
  },
  {
    icon: ShieldCheck,
    title: "Verified provider network",
    description: "Clinic and provider information reviewed through a structured verification process.",
  },
  {
    icon: HeartPulse,
    title: "Human-guided technology",
    description: "Automation and infrastructure that supports — not replaces — licensed professionals.",
  },
  {
    icon: Workflow,
    title: "Built for secure healthcare workflows",
    description: "Designed with healthcare privacy, consent, and audit expectations in mind.",
  },
];

export function AboutView() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-14 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="About Novalyte AI"
            title="Building the infrastructure layer for men's health"
            description="Novalyte AI is a healthcare technology facilitator. We connect patient demand, verified clinics, specialized professionals, and operational services through one intelligent ecosystem — so the men's health industry can scale without sacrificing trust, safety, or clinical integrity."
          />
        </div>
      </section>

      {/* Legal positioning */}
      <SectionShell className="!pt-12 !pb-8">
        <DisclaimerBanner tone="amber" className="text-sm leading-relaxed">
          <strong className="font-semibold">Important — please read.</strong> Novalyte AI is a
          healthcare technology facilitator. It is <strong>not</strong> a medical provider, clinic,
          pharmacy, or diagnostic service. Novalyte AI does not diagnose, prescribe, or provide
          medical advice. Licensed clinics and professionals remain solely responsible for all
          medical decisions, patient care, prescribing, treatment, credentialing, and regulatory
          compliance. Information on this site is for operational and educational purposes only and
          is not a substitute for professional medical advice.
        </DisclaimerBanner>
      </SectionShell>

      {/* Mission */}
      <SectionShell tone="tint" className="!py-16">
        <SectionHeading
          eyebrow="Mission"
          title="An operating system for the men's health economy"
          description="The men's health sector is growing rapidly, but it is fragmented across patient acquisition, clinical delivery, talent, and operational services. Novalyte exists to coordinate that fragmentation."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MISSION_CARDS.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{m.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {m.description}
                </p>
              </div>
            );
          })}
        </div>
      </SectionShell>

      {/* Approach */}
      <SectionShell className="!py-16">
        <SectionHeading
          eyebrow="Approach"
          title="How Novalyte coordinates the ecosystem"
          description="We connect four sides of the men's health economy into one workflow. Each layer reinforces the next — demand becomes care, care requires talent, talent requires tooling and supply."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {APPROACH_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </SectionShell>

      {/* Positioning pillars */}
      <SectionShell tone="muted" className="!py-16">
        <SectionHeading
          eyebrow="Positioning"
          title="What makes Novalyte different"
          description="We don't measure value in vanity metrics. These are the qualitative pillars that define how we operate."
          align="center"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </SectionShell>

      {/* Contact form */}
      <ContactSection />

      {/* CTA */}
      <CTASection
        title="Join the Novalyte Network"
        description="Whether you're a patient, clinic, professional, or vendor — there's a place for you in the ecosystem."
        tone="dark"
      />
    </>
  );
}

function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "" as Role | "",
    message: "",
  });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      toast.error("Please acknowledge the consent checkbox before submitting.");
      return;
    }
    if (!form.role) {
      toast.error("Please select a role.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      toast.success("Thanks — we'll be in touch within two business days.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SectionShell id="contact" className="!py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <SectionHeading
          eyebrow="Contact"
          title="Talk to the Novalyte team"
          description="Tell us who you are and what you're trying to solve. We route inquiries to the right partner — clinical network, workforce, marketplace, or platform."
        />
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {done ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-teal-600" />
              <h3 className="text-lg font-semibold">Message received</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Thanks for reaching out. A member of the Novalyte team will respond within two
                business days.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDone(false);
                  setForm({ name: "", email: "", role: "", message: "" });
                  setConsent(false);
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    required
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="contact-role">I am a...</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => update("role", v as Role)}
                >
                  <SelectTrigger id="contact-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="clinic">Clinic / Practice</SelectItem>
                    <SelectItem value="professional">Healthcare Professional</SelectItem>
                    <SelectItem value="vendor">Vendor / Service Provider</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="What are you trying to solve?"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  className="mt-0.5"
                />
                <span>
                  I understand Novalyte AI is a technology platform and does not provide medical
                  care, diagnosis, or treatment. I consent to be contacted about my inquiry.
                </span>
              </label>

              <Button
                type="submit"
                className="bg-teal-600 text-white hover:bg-teal-700"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send message"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground">
                <MessageSquare className="mr-1 inline h-3 w-3" />
                For medical emergencies, call 911 (or your local emergency number). Do not use this form.
              </p>
            </form>
          )}
        </div>
      </div>

      <DisclaimerBanner tone="muted" className="mt-8">
        For legal policies, including our{" "}
        <button onClick={() => navigate("privacy")} className="font-medium underline">Privacy Policy</button>,{" "}
        <button onClick={() => navigate("terms")} className="font-medium underline">Terms of Service</button>, and{" "}
        <button onClick={() => navigate("medical-disclaimer")} className="font-medium underline">Medical Disclaimer</button>, visit our legal pages.
      </DisclaimerBanner>
    </SectionShell>
  );
}
