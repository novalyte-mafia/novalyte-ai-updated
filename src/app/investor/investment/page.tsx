import type { Metadata } from "next";
import Link from "next/link";

import { InvestorShell } from "@/components/investor/shell";
import { Section, SectionHeading } from "@/components/investor/section";
import { Button } from "@/components/ui/button";
import { investorContent } from "@/lib/investor/content";
import { investorPath } from "@/lib/investor/config";

export const metadata: Metadata = { title: "Investment" };

export default function InvestmentPage() {
  const { investmentHighlights, fundraising, legalDisclaimers } = investorContent;

  return (
    <InvestorShell>
      <Section tone="warm" className="pt-14">
        <SectionHeading
          eyebrow="Investment"
          title="Why Novalyte AI"
          description="A founder-built, multi-sided healthcare operating platform with real deployed infrastructure and a disciplined, value-first go-to-market."
        />
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {investmentHighlights.map((highlight) => (
            <div
              key={highlight.title}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-stone-900">
                {highlight.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {highlight.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="Fundraise" title="Round details" />
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-8">
          <p className="text-sm font-semibold text-stone-800">
            {fundraising.status}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Specific round terms — stage, target raise, instrument, valuation or
            cap, minimum check, and use of funds — are shared directly with
            qualified investors and are not published on the portal. Request a
            conversation to discuss current terms.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-teal-700 hover:bg-teal-800">
              <Link href={investorPath("contact?intent=access")}>
                Request access to details
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-stone-300">
              <a href={`mailto:${fundraising.contactEmail}`}>
                {fundraising.contactEmail}
              </a>
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="space-y-3">
          {legalDisclaimers.map((disclaimer) => (
            <details
              key={disclaimer.id}
              className="rounded-xl border border-stone-200 bg-white p-4"
            >
              <summary className="cursor-pointer text-sm font-medium text-stone-800">
                {disclaimer.label}
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {disclaimer.body}
              </p>
            </details>
          ))}
        </div>
      </Section>
    </InvestorShell>
  );
}
