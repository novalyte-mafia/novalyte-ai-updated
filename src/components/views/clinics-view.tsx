"use client";

import { useState } from "react";
import { SectionHeading, SectionShell } from "@/components/shared/section";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CLINIC_FAQS } from "@/lib/clinic-faqs";
import { navigate } from "@/lib/nav";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  Megaphone,
  MonitorSmartphone,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck,
  Users,
  Video,
} from "lucide-react";

const CLINIC_VALUE = [
  {
    icon: Megaphone,
    title: "Patient Growth",
    description: "Reach men actively researching relevant treatments in the clinic's service area.",
  },
  {
    icon: UserRoundCheck,
    title: "Intake and Conversion",
    description: "Create a clearer path from patient interest to inquiry, scheduling, and follow-up.",
  },
  {
    icon: Building2,
    title: "Clinic Visibility",
    description: "Present treatments, providers, locations, telehealth availability, hours, and booking options.",
  },
  {
    icon: Settings,
    title: "Clinic Operations",
    description: "Access optional workforce, marketplace, technology, and growth-support resources.",
  },
];

const LISTING_DETAILS = [
  "Treatments and service categories",
  "Providers and credentials",
  "Locations and hours",
  "Telehealth availability",
  "Contact and booking links",
  "Pricing or consultation guidance",
];

const APPLICATION_STEPS = [
  { number: "01", title: "Submit clinic information", description: "Tell us about the organization, locations, services, and authorized contact." },
  { number: "02", title: "Complete profile details", description: "Add provider, treatment, telehealth, booking, and verification information." },
  { number: "03", title: "Novalyte reviews", description: "We review the application and request clarification when information is incomplete." },
  { number: "04", title: "Approved profile publishes", description: "Verified information becomes a patient-facing clinic directory profile." },
];

const OPTIONAL_SERVICES = [
  "Patient-acquisition support",
  "Intake and conversion optimization",
  "Local market visibility",
  "Campaign and landing-page support",
  "Workforce access",
  "Marketplace and operational support",
];

const PROFILE_DETAILS = [
  { icon: Stethoscope, label: "Treatment categories" },
  { icon: Users, label: "Provider information" },
  { icon: MapPin, label: "Locations" },
  { icon: Video, label: "Telehealth availability" },
  { icon: Clock3, label: "Hours" },
  { icon: CalendarDays, label: "Booking options" },
];

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ClinicsView({ onGetStarted }: { data: unknown; onGetStarted: () => void }) {
  const [averagePatientValue, setAveragePatientValue] = useState(1200);
  const [qualifiedInquiries, setQualifiedInquiries] = useState(20);
  const [conversionRate, setConversionRate] = useState(25);
  const [grossMargin, setGrossMargin] = useState(60);
  const [monthlyInvestment, setMonthlyInvestment] = useState(2500);

  const convertedPatients = Math.max(0, qualifiedInquiries) * (Math.min(100, Math.max(0, conversionRate)) / 100);
  const incrementalRevenue = Math.max(0, averagePatientValue) * convertedPatients;
  const contributionProfit = incrementalRevenue * (Math.min(100, Math.max(0, grossMargin)) / 100);
  const netReturn = contributionProfit - Math.max(0, monthlyInvestment);
  const monthlyRoi = monthlyInvestment > 0 ? (netReturn / monthlyInvestment) * 100 : 0;
  const annualNetReturn = netReturn * 12;
  const contributionPerPatient = Math.max(0, averagePatientValue) * (Math.min(100, Math.max(0, grossMargin)) / 100);
  const breakEvenPatients = contributionPerPatient > 0 ? Math.max(0, monthlyInvestment) / contributionPerPatient : 0;

  function openApplication() {
    navigate("clinic-application");
  }

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-gradient-to-b from-teal-50/40 to-background">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-9 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-xs font-semibold text-teal-700">
              <Building2 className="h-3.5 w-3.5" /> For independent, telehealth, and multi-location clinics
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[52px]">
              Grow your clinic with better visibility, <span className="text-teal-700">qualified patient demand</span>, and stronger operations.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Novalyte helps men's health clinics build a trusted public presence, connect with relevant patient demand, improve intake workflows, and access optional workforce and operational services.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={openApplication}>
                Apply for a Free Clinic Listing <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("clinic-solutions")?.scrollIntoView({ behavior: "smooth" })}>
                Explore Clinic Solutions
              </Button>
            </div>
            <div className="mt-6 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              {[
                "Free directory application",
                "Verification before publication",
                "No guaranteed revenue claims",
                "Clinics remain responsible for clinical care",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-600" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg">
            <div className="relative aspect-[5/4]">
              <SmartImage
                src="/images/clinics/clinic-2.jpg"
                alt="Men's health clinic team reviewing patient services and clinic operations"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                imgClassName="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <SectionShell id="clinic-solutions" className="border-b border-border py-10 sm:py-12">
        <SectionHeading
          eyebrow="What clinics get"
          title="Practical support across the patient and clinic journey"
          description="Each part of Novalyte is designed around a tangible clinic need—from discovery to intake and operational capacity."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CLINIC_VALUE.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-premium-xs">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-base font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </article>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell tone="muted" className="border-b border-border py-10 sm:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Free directory listing</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Create a patient-facing clinic profile at no application cost.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              The directory application is free and every submission is reviewed before publication. Approved profiles help patients understand where a clinic operates, which services it offers, and how to request care.
            </p>
            <Button className="mt-6 bg-teal-600 text-white hover:bg-teal-700" onClick={openApplication}>
              Start Free Application <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="rounded-2xl border border-teal-200 bg-background p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {LISTING_DETAILS.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /> {item}
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
              Incomplete or unverifiable applications may not be published. Paid services are separate and optional.
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="border-b border-border py-10 sm:py-12">
        <SectionHeading
          eyebrow="How it works"
          title="A clear path from application to publication"
          description="The public process stays simple. The application collects the detail needed for an accurate, useful clinic profile."
        />
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {APPLICATION_STEPS.map((step) => (
            <li key={step.number} className="rounded-2xl border border-border bg-card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{step.number}</span>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </SectionShell>

      <SectionShell tone="muted" className="border-b border-border py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Optional growth services</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground">Add support when your clinic needs it.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              A directory listing does not require purchasing growth services. Clinics can separately explore patient acquisition, intake optimization, workforce, or operational support.
            </p>
            <p className="mt-4 rounded-xl border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground">
              Optional services may have separate fees and do not guarantee patient volume, revenue, or clinical outcomes.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {OPTIONAL_SERVICES.map((service) => (
              <div key={service} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" /> {service}
              </div>
            ))}
            <Button variant="outline" className="justify-self-start sm:col-span-2" onClick={onGetStarted}>Talk to Our Team About Clinic Solutions</Button>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="border-b border-border py-10 sm:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Clinic profile preview</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground">Show patients what they need to choose a clinic confidently.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Approved profiles organize clinic information into a clear discovery and contact experience without making medical or outcome guarantees.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => navigate("directory")}>
              Browse the Clinic Directory <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium-md">
            <div className="relative h-44 sm:h-52">
              <SmartImage src="/images/pillars/clinic-directory.jpg" alt="Doctor welcoming a patient in a modern clinic reception area" fill sizes="(max-width: 1024px) 100vw, 55vw" imgClassName="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <p className="text-lg font-semibold">Example Men's Health Clinic</p>
                  <p className="mt-0.5 text-xs text-white/85">Austin, TX · In-person and telehealth</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-teal-700"><ShieldCheck className="h-3 w-3" /> Verified</span>
              </div>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {PROFILE_DETAILS.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div key={detail.label} className="flex items-center gap-2 text-xs text-foreground/80">
                    <Icon className="h-4 w-4 shrink-0 text-teal-600" /> {detail.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell tone="muted" className="border-b border-border py-10 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="ROI calculator"
            title="Clinic acquisition ROI calculator"
            description="Estimate the financial return from additional qualified inquiries using your clinic's collected revenue, conversion rate, margin, and monthly program cost."
          />
          <div className="mt-7 grid gap-5 rounded-2xl border border-border bg-card p-5 shadow-premium-xs sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              <CalculatorField id="average-patient-revenue" label="Average collected revenue per new patient" prefix="$" value={averagePatientValue} onChange={setAveragePatientValue} />
              <CalculatorField id="qualified-inquiries" label="Additional qualified inquiries / month" value={qualifiedInquiries} onChange={setQualifiedInquiries} />
              <CalculatorField id="conversion-rate" label="Inquiry-to-patient conversion rate" suffix="%" value={conversionRate} max={100} onChange={setConversionRate} />
              <CalculatorField id="gross-margin" label="Estimated gross margin" suffix="%" value={grossMargin} max={100} onChange={setGrossMargin} />
              <CalculatorField id="monthly-program-cost" label="Monthly program cost" prefix="$" value={monthlyInvestment} onChange={setMonthlyInvestment} />
              <div className="rounded-xl border border-border bg-muted/35 p-3 text-xs leading-relaxed text-muted-foreground">
                Use collected revenue after refunds. Gross margin should reflect variable clinical and fulfillment costs.
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-xl border border-teal-200 bg-teal-50/35 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Estimated monthly return</p>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
                  <RoiMetric label="Converted patients" value={convertedPatients.toFixed(1)} />
                  <RoiMetric label="Incremental revenue" value={formatCurrency(incrementalRevenue)} />
                  <RoiMetric label="Contribution profit" value={formatCurrency(contributionProfit)} />
                  <RoiMetric label="Net return" value={formatCurrency(netReturn)} />
                  <RoiMetric label="ROI" value={`${Math.round(monthlyRoi).toLocaleString()}%`} />
                  <RoiMetric label="Annual net return" value={formatCurrency(annualNetReturn)} />
                </div>
                <p className="mt-5 rounded-lg bg-white/70 px-3 py-2 text-xs text-foreground/80">
                  Break-even: <span className="font-semibold text-foreground">{breakEvenPatients.toFixed(1)} converted patients per month</span>
                </p>
              </div>
              <p className="mt-5 border-t border-teal-200 pt-4 text-[11px] leading-relaxed text-muted-foreground">
                Results are estimates based solely on the assumptions entered. They do not represent guaranteed patient volume, revenue, profitability, or clinical outcomes. Exclude fixed overhead unless it changes with the program.
              </p>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="py-10 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Clinic FAQ"
            title="Questions clinic owners ask before applying"
            description="Six concise answers about cost, verification, patient growth, profile requirements, optional services, and outcome expectations."
          />
          <Accordion type="single" collapsible className="mt-7" aria-label="Clinic owner frequently asked questions">
            {CLINIC_FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`clinic-faq-${index}`}>
                <AccordionTrigger className="py-4 text-left text-sm font-medium hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </SectionShell>
    </div>
  );
}

function formatCurrency(value: number) {
  return USD_FORMATTER.format(value);
}

function RoiMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">{value}</p>
    </div>
  );
}

function CalculatorField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  max,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  max?: number;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-foreground">{label}</Label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <Input
          id={id}
          type="number"
          min={0}
          max={max}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={prefix ? "pl-7" : suffix ? "pr-8" : undefined}
        />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}
