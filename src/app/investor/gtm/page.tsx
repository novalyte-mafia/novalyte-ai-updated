import type { Metadata } from "next";

import { InvestorShell } from "@/components/investor/shell";
import { Section, SectionHeading } from "@/components/investor/section";
import { investorContent } from "@/lib/investor/content";

export const metadata: Metadata = { title: "Go-to-Market" };

export default function GtmPage() {
  const { gtmPhases } = investorContent;

  return (
    <InvestorShell>
      <Section tone="warm" className="pt-14">
        <SectionHeading
          eyebrow="Go-to-market"
          title="Supply first, prove value, then monetize"
          description="A phased, founder-led motion: build verified clinic supply, generate patient demand, demonstrate measurable value, and convert high-fit clinics into paid relationships before expanding revenue modules."
        />
      </Section>

      <Section>
        <ol className="relative space-y-6 border-l border-stone-200 pl-6">
          {gtmPhases.map((phase) => (
            <li key={phase.phase} className="relative">
              <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
                {phase.phase}
              </span>
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-stone-900">
                  {phase.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {phase.summary}
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {phase.activities.map((activity) => (
                    <li
                      key={activity}
                      className="flex items-start gap-2 text-sm text-stone-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </InvestorShell>
  );
}
