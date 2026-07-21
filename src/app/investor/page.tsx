import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { InvestorShell } from "@/components/investor/shell";
import { Section, SectionHeading } from "@/components/investor/section";
import { StatusPill } from "@/components/investor/status-pill";
import { Button } from "@/components/ui/button";
import { investorContent } from "@/lib/investor/content";
import { investorPath } from "@/lib/investor/config";

export const metadata: Metadata = {
  title: "Overview",
  description:
    "Confidential Novalyte AI investor overview — the operating infrastructure for modern healthcare discovery and clinic growth.",
};

export default function InvestorOverviewPage() {
  const { company, pillars, productModules, stage } = investorContent;

  return (
    <InvestorShell>
      <Section tone="warm" className="pt-14 sm:pt-20">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Confidential investor portal
          </div>
          <h1 className="font-[family-name:var(--font-investor-serif)] text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {company.oneLiner}
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            {company.positioning}
          </p>
          <p className="mt-4 text-sm font-medium text-teal-800">{stage}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-teal-700 hover:bg-teal-800">
              <Link href={investorPath("product")}>
                Explore the platform <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-stone-300">
              <Link href={investorPath("investment")}>Investment thesis</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="The ecosystem"
          title="Four connected pillars, one operating layer"
          description="Novalyte AI links patient demand, verified clinic supply, specialized workforce, and B2B commerce inside a single integrated system — starting with men's health."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <div
              key={pillar.key}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-stone-900">
                {pillar.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="Product"
          title="What is live today"
          description="Novalyte AI is founder-built with real infrastructure already deployed across the public site, ads subdomain, admin console, and this portal. Status is labeled honestly."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {productModules.map((module) => (
            <div
              key={module.key}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-stone-900">
                  {module.label}
                </h3>
                <StatusPill status={module.status} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {module.description}
              </p>
              {module.notes ? (
                <p className="mt-3 text-xs leading-relaxed text-stone-500">
                  {module.notes}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="rounded-3xl border border-teal-100 bg-teal-50/60 p-8 sm:p-12">
          <div className="max-w-2xl">
            <h2 className="font-[family-name:var(--font-investor-serif)] text-2xl font-semibold text-stone-900 sm:text-3xl">
              Reviewing Novalyte AI for investment?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-stone-700">
              Request access to the confidential data room for financials,
              traction detail, and founder updates, or reach out to arrange a
              conversation.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-stone-700">
              {[
                "Founder-led, product already deployed",
                "Multi-sided healthcare operating model",
                "Clear, honestly-labeled status on every claim",
              ].map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-700" /> {point}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-teal-700 hover:bg-teal-800">
                <Link href={investorPath("contact?intent=access")}>
                  Request data room access
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-stone-300">
                <Link href={investorPath("contact")}>Contact the founder</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </InvestorShell>
  );
}
