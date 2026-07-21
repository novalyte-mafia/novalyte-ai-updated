import type { Metadata } from "next";

import { InvestorShell } from "@/components/investor/shell";
import { Section, SectionHeading } from "@/components/investor/section";
import { investorContent } from "@/lib/investor/content";

export const metadata: Metadata = { title: "Business Model" };

const timingStyles: Record<string, string> = {
  Current: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Near-term": "border-teal-200 bg-teal-50 text-teal-800",
  Future: "border-neutral-200 bg-neutral-100 text-neutral-700",
};

export default function BusinessModelPage() {
  const { revenueStreams, company } = investorContent;

  return (
    <InvestorShell>
      <Section tone="warm" className="pt-14">
        <SectionHeading
          eyebrow="Business model"
          title="Multiple interconnected revenue streams"
          description={company.businessModelSummary}
        />
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The commercial wedge is a free verified directory listing. Paid
          services layer on only after clinics see demonstrated value. Pricing
          and packaging that are not yet finalized are labeled honestly rather
          than invented.
        </p>
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {revenueStreams.map((stream) => (
            <div
              key={stream.key}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-stone-900">
                  {stream.label}
                </h3>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    timingStyles[stream.timing] ?? timingStyles.Future
                  }`}
                >
                  {stream.timing}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {stream.description}
              </p>
              <dl className="mt-4 space-y-1.5 border-t border-stone-100 pt-4 text-xs">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 font-semibold text-stone-500">
                    Customer
                  </dt>
                  <dd className="text-stone-700">{stream.customer}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 font-semibold text-stone-500">
                    Pricing
                  </dt>
                  <dd className="text-stone-700">{stream.pricingModel}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 font-semibold text-stone-500">
                    Status
                  </dt>
                  <dd className="text-stone-700">{stream.statusNote}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </Section>
    </InvestorShell>
  );
}
