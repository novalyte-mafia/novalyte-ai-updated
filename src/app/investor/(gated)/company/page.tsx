import type { Metadata } from "next";

import { InvestorShell } from "@/components/investor/shell";
import { Section, SectionHeading } from "@/components/investor/section";
import { investorContent } from "@/lib/investor/content";

export const metadata: Metadata = { title: "Company" };

export default function CompanyPage() {
  const { company, founder } = investorContent;

  const facts: { label: string; value: string }[] = [
    { label: "Industry", value: company.industry },
    { label: "Core market", value: company.coreMarket },
    { label: "Business model", value: company.businessModelSummary },
    { label: "Stage", value: investorContent.stage },
  ];

  return (
    <InvestorShell>
      <Section tone="warm" className="pt-14">
        <SectionHeading
          eyebrow="Company"
          title={company.name}
          description={company.oneLiner}
        />
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {company.positioning}
        </p>
      </Section>

      <Section>
        <div className="grid gap-4 sm:grid-cols-2">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <dt className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                {fact.label}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-stone-800">
                {fact.value}
              </dd>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="Founder" title="Founder-led" />
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-lg font-semibold text-stone-900">
            {founder.firstName} {founder.lastName}
          </p>
          <p className="text-sm text-teal-700">{founder.title}</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {founder.summary}
          </p>
          <p className="mt-4 text-sm text-stone-500">
            Founder biography, photo, and background are pending founder
            publication and are not shown until provided.
          </p>
          <a
            href={`mailto:${founder.email}`}
            className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline"
          >
            {founder.email}
          </a>
        </div>
      </Section>

      <Section>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="text-sm font-semibold text-amber-900">
            Healthcare technology facilitator
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
            {company.technologyFacilitatorNotice}
          </p>
        </div>
      </Section>
    </InvestorShell>
  );
}
