import type { Metadata } from "next";

import { InvestorShell } from "@/components/investor/shell";
import { Section, SectionHeading } from "@/components/investor/section";
import { StatusPill } from "@/components/investor/status-pill";
import { investorContent } from "@/lib/investor/content";

export const metadata: Metadata = { title: "Product" };

export default function ProductPage() {
  const { productModules, pillars } = investorContent;

  return (
    <InvestorShell>
      <Section tone="warm" className="pt-14">
        <SectionHeading
          eyebrow="Product"
          title="One integrated operating platform"
          description="Every module reinforces the others: patient acquisition feeds the directory, the directory anchors workforce and marketplace, and Campaign Studio plus the admin console drive founder-led GTM."
        />
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {productModules.map((module) => (
            <div
              key={module.key}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-stone-900">
                  {module.label}
                </h3>
                <StatusPill status={module.status} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {module.description}
              </p>
              {module.notes ? (
                <p className="mt-3 border-t border-stone-100 pt-3 text-xs leading-relaxed text-stone-500">
                  {module.notes}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="How it connects" title="The four pillars in practice" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.key}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-teal-800">
                {pillar.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </InvestorShell>
  );
}
