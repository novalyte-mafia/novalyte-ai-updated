"use client";

import Link from "next/link";
import { SectionHeading, SectionShell } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileSearch,
  HeartHandshake,
  Layers3,
  LockKeyhole,
  Network,
  SearchCheck,
  ShieldCheck,
  Stethoscope,
  Store,
  UserRoundSearch,
  UsersRound,
  Workflow,
} from "lucide-react";

const CLINIC_OUTCOMES = [
  [UserRoundSearch, "Generate better-qualified patient demand", "Use educational content, assessment pathways, local discovery, and demand intelligence to reach men actively researching care."],
  [SearchCheck, "Improve clinic visibility", "Give clinics a detailed digital presence across treatment categories, provider information, telehealth availability, service areas, and booking pathways."],
  [Workflow, "Strengthen intake and conversion", "Create structured workflows that help clinics organize inquiries, reduce friction, and move qualified prospective patients toward the appropriate next step."],
  [UsersRound, "Access specialized healthcare talent", "Connect clinics with clinical and operational professionals experienced in men’s health, hormones, telehealth, patient coordination, and practice growth."],
  [Store, "Source operational services", "Help clinics discover vendors, platforms, equipment, and professional services relevant to modern healthcare operations."],
] as const;

const WORKFLOW_STEPS = [
  [FileSearch, "Demand", "Men discover Novalyte through education, search, local discovery, or an informational assessment."],
  [Network, "Discovery and Intake", "Novalyte helps organize that demand and connect prospective patients with clinics based on treatment interest, location, telehealth availability, and clinic capability."],
  [Building2, "Clinic Operations", "Clinics receive more structured inquiries and use Novalyte-supported workflows to strengthen visibility, intake, staffing, and operations."],
  [Layers3, "Growth Infrastructure", "As demand grows, clinics can access specialized professionals, vendors, technology, and services through the broader Novalyte ecosystem."],
] as const;

const OPERATING_MODEL = [
  "A patient begins researching care.",
  "Novalyte helps organize and clarify that demand.",
  "The patient discovers an appropriate clinic.",
  "The clinic receives a more structured inquiry.",
  "The clinic strengthens its team and operations as demand grows.",
  "The ecosystem becomes more useful to patients, clinics, professionals, and vendors.",
] as const;

const TRUST_PRINCIPLES = [
  [Stethoscope, "Clinical independence", "Novalyte does not diagnose, prescribe, recommend treatment, or direct clinical care. Licensed providers and clinics retain full responsibility for medical decisions, treatment, patient outcomes, credentialing, and regulatory compliance."],
  [Eye, "Transparent clinic information", "Clinic profiles are designed to present clear information about services, providers, locations, telehealth availability, service areas, and booking options."],
  [ClipboardCheck, "Structured review processes", "Where verification is offered, Novalyte reviews submitted business and provider information using documented criteria. Verification does not represent clinical endorsement or guarantee treatment quality or outcomes."],
  [LockKeyhole, "Privacy-conscious infrastructure", "Novalyte is designed around responsible data handling, consent, controlled access, and healthcare-oriented security practices."],
  [ShieldCheck, "Honest compliance positioning", "We do not claim certifications, approvals, partnerships, or regulatory status that have not been formally achieved."],
] as const;

function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-teal-700">{children}</span>;
}

function ActionButtons({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  centered = false,
}: {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  centered?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${centered ? "justify-center" : ""}`}>
      <Button asChild size="lg" className="bg-teal-600 text-white hover:bg-teal-700">
        <Link href={primaryHref}>
          {primaryLabel}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline"><Link href={secondaryHref}>{secondaryLabel}</Link></Button>
    </div>
  );
}

export function AboutView() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-teal-50/45 to-background py-14 sm:py-20 lg:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.72fr)] lg:items-end lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">About Novalyte AI</div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The infrastructure behind <Accent>modern men’s-health clinics</Accent>
            </h1>
            <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>Novalyte AI is a healthcare technology infrastructure company built to support the growth and operation of modern men’s-health clinics.</p>
              <p>We connect patient demand, clinic discovery, specialized workforce access, and operational services through one coordinated platform.</p>
              <p>Our role is not to practice medicine. Our role is to help licensed clinics become easier to discover, better equipped to manage demand, and more capable of scaling responsibly.</p>
            </div>
            <div className="mt-8"><ActionButtons primaryLabel="Explore the Clinic Platform" primaryHref="/clinics" secondaryLabel="Talk to the Novalyte Team" secondaryHref="/contact" /></div>
          </div>
          <aside className="rounded-2xl border border-teal-200/80 bg-white p-6 shadow-premium-sm sm:p-7">
            <HeartHandshake className="h-7 w-7 text-teal-600" aria-hidden="true" />
            <p className="mt-4 text-lg font-semibold leading-snug text-foreground">Novalyte AI builds the technology, discovery, workforce, and operational infrastructure that helps men’s-health clinics grow responsibly.</p>
            <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">Novalyte AI is a technology platform, not a medical provider. Licensed clinics and professionals remain responsible for all clinical care and medical decisions.</p>
          </aside>
        </div>
      </section>

      <SectionShell className="!py-14 sm:!py-18">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14">
          <SectionHeading eyebrow="Company Context" title={<>Built for the business and <Accent>operational realities</Accent> of men’s health</>} />
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>Men’s-health clinics operate in a complex environment.</p>
            <p>They must attract the right patients, communicate clearly, manage intake, maintain staffing, coordinate vendors, protect patient trust, and grow without compromising clinical standards.</p>
            <p>Most clinics currently manage these functions through disconnected tools, manual processes, and fragmented service providers.</p>
            <p className="font-medium text-foreground">Novalyte is building a unified infrastructure layer designed specifically around those challenges.</p>
          </div>
        </div>
      </SectionShell>

      <SectionShell tone="tint" className="!py-14 sm:!py-18">
        <SectionHeading eyebrow="Our Mission" title={<>Build the operating infrastructure for the <Accent>next generation</Accent> of men’s-health clinics</>} className="max-w-4xl" />
        <div className="mt-8 grid gap-5 text-sm leading-relaxed text-muted-foreground md:grid-cols-2 md:text-base">
          <div className="rounded-2xl border border-border bg-background p-6 shadow-premium-sm">
            <p>Men’s-health clinics are expected to deliver exceptional care while managing patient acquisition, intake, staffing, technology, vendors, compliance, and growth across disconnected systems.</p>
            <p className="mt-4 font-medium text-foreground">Novalyte exists to reduce that fragmentation.</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-6 shadow-premium-sm">
            <p>Our mission is to give clinics a coordinated operating environment where patient demand, clinic discovery, workforce access, and operational services work together instead of existing as separate tools.</p>
            <p className="mt-4">We are building Novalyte so clinics can spend less time managing disconnected systems and more time serving patients, improving operations, and growing with discipline.</p>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="!py-14 sm:!py-18">
        <SectionHeading eyebrow="Clinic Outcomes" title={<>What Novalyte <Accent>helps clinics do</Accent></>} description="Practical infrastructure for the recurring growth and operating work behind a modern clinic." />
        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {CLINIC_OUTCOMES.map(([Icon, title, description]) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-5 shadow-premium-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell tone="muted" className="!py-14 sm:!py-18">
        <SectionHeading eyebrow="How It Works" title={<>One <Accent>coordinated growth system</Accent></>} description="A practical operating model that connects demand and discovery with the infrastructure clinics need as they grow." />
        <ol className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {WORKFLOW_STEPS.map(([Icon, label, description], index) => (
            <li key={label} className="rounded-2xl border border-border bg-background p-5 shadow-premium-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Step {index + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-4xl rounded-xl border border-teal-200 bg-teal-50/70 px-5 py-4 text-sm leading-relaxed text-teal-950">The objective is not to replace clinic systems or clinical judgment. It is to make the operational path from patient interest to clinic growth more coordinated.</p>
      </SectionShell>

      <SectionShell className="!py-14 sm:!py-18">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14">
          <div>
            <SectionHeading title={<>Why clinics <Accent>choose Novalyte</Accent></>} />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>Clinics do not need another disconnected marketing tool or generic healthcare directory.</p>
              <p>They need infrastructure that understands the relationship between demand, discovery, staffing, and operations.</p>
              <p className="font-medium text-foreground">Novalyte is being built around that reality.</p>
              <p>Our model is designed to support clinics across the full growth cycle. It is an operating model—not a guarantee of patient volume, revenue, or clinical outcomes.</p>
            </div>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {OPERATING_MODEL.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">{index + 1}</span>
                <span className="text-sm leading-relaxed text-foreground/80">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </SectionShell>

      <SectionShell tone="tint" className="!py-14 sm:!py-18">
        <SectionHeading eyebrow="Operating Principles" title={<>Trust is built through <Accent>clarity</Accent>, not claims</>} description="Clear boundaries and documented practices matter more than broad promises." className="max-w-4xl" />
        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {TRUST_PRINCIPLES.map(([Icon, title, description]) => (
            <article key={title} className="rounded-2xl border border-border bg-background p-5 shadow-premium-sm">
              <Icon className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="!py-12 sm:!py-14">
        <div className="rounded-3xl border border-border bg-muted/35 p-6 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <BriefcaseBusiness className="h-6 w-6 text-teal-700" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Talk to the Novalyte team</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">Whether you represent a clinic, healthcare organization, professional network, vendor, or strategic partner, we will route your inquiry to the appropriate team.</p>
          </div>
          <div className="mt-6 shrink-0 lg:mt-0"><ActionButtons primaryLabel="Contact Novalyte" primaryHref="/contact" secondaryLabel="Explore Clinic Solutions" secondaryHref="/clinics" /></div>
        </div>
      </SectionShell>

      <section className="border-y border-border bg-teal-50/45 py-12 sm:py-14">
        <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <CheckCircle2 className="mx-auto h-7 w-7 text-teal-700" aria-hidden="true" />
          <h2 className="mx-auto mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Build with the infrastructure designed for <Accent>modern men’s health</Accent></h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground">Novalyte brings together patient discovery, clinic visibility, workforce access, and operational services in one coordinated environment designed to support responsible clinic growth.</p>
          <div className="mt-7"><ActionButtons primaryLabel="Explore the Clinic Platform" primaryHref="/clinics" secondaryLabel="List Your Clinic" secondaryHref="/clinics/apply" centered /></div>
        </div>
      </section>
    </>
  );
}
