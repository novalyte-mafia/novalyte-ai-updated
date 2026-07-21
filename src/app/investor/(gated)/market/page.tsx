import type { Metadata } from "next";

import { InvestorShell } from "@/components/investor/shell";
import { Section, SectionHeading } from "@/components/investor/section";
import { MetricBadge } from "@/components/investor/metric-badge";
import { investorContent } from "@/lib/investor/content";

export const metadata: Metadata = { title: "Market" };

export default function MarketPage() {
  const { marketSizing, marketSizingNote, company } = investorContent;

  return (
    <InvestorShell>
      <Section tone="warm" className="pt-14">
        <SectionHeading
          eyebrow="Market"
          title="A fragmented, high-intent healthcare market"
          description="Novalyte AI starts in men's health and adjacent outpatient specialty care — a market where patient demand is increasingly online and clinic operations remain fragmented across disconnected tools."
        />
      </Section>

      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Fragmented operations",
              body: "Clinics stitch together marketing, staffing, procurement, and intake from disconnected point solutions.",
            },
            {
              title: "Online-first patients",
              body: "Patients research specialized care online before choosing a provider, creating demand for trusted discovery and structured intake.",
            },
            {
              title: "Measurable growth gap",
              body: "Operators need workflows that connect demand generation, operations, workforce, and vendor relationships — not just listings.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-stone-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="Market sizing"
          title="Sized only with cited sources"
        />
        {marketSizing.length > 0 ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Geography</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {marketSizing.map((entry) => (
                  <tr key={entry.metric} className="border-b border-stone-100">
                    <td className="px-4 py-3 font-medium text-stone-800">
                      {entry.metric}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {entry.value} {entry.unit}
                    </td>
                    <td className="px-4 py-3 text-stone-700">{entry.geography}</td>
                    <td className="px-4 py-3 text-stone-700">
                      {entry.sourceUrl ? (
                        <a
                          href={entry.sourceUrl}
                          className="text-teal-700 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {entry.source}
                        </a>
                      ) : (
                        entry.source
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <MetricBadge status={entry.metricStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-stone-700">
              Market sizing is pending sourced validation.
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {marketSizingNote}
            </p>
          </div>
        )}
      </Section>

      <Section>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm leading-relaxed text-amber-900/90">
            {company.technologyFacilitatorNotice}
          </p>
        </div>
      </Section>
    </InvestorShell>
  );
}
