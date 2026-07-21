import type { Metadata } from "next";

import { InvestorShell } from "@/components/investor/shell";
import { Section, SectionHeading } from "@/components/investor/section";
import { StatusPill } from "@/components/investor/status-pill";
import { investorContent } from "@/lib/investor/content";
import type { ProductModuleStatus } from "@/lib/investor/content";

export const metadata: Metadata = { title: "Roadmap" };

const order: ProductModuleStatus[] = ["Completed", "In progress", "Planned"];
const columnCopy: Record<ProductModuleStatus, string> = {
  Completed: "Shipped and deployed",
  "In progress": "Actively building",
  Planned: "Next on the roadmap",
};

export default function RoadmapPage() {
  const { productModules, gtmPhases } = investorContent;

  const grouped = order.map((status) => ({
    status,
    items: productModules.filter((m) => m.status === status),
  }));

  return (
    <InvestorShell>
      <Section tone="warm" className="pt-14">
        <SectionHeading
          eyebrow="Roadmap"
          title="What is shipped, in progress, and planned"
          description="Status reflects the current state of the codebase and deployed surfaces. Forward-looking items are labeled as planned, not promised."
        />
      </Section>

      <Section>
        <div className="grid gap-5 lg:grid-cols-3">
          {grouped.map((column) => (
            <div key={column.status} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <StatusPill status={column.status} />
                <span className="text-xs text-stone-500">
                  {columnCopy[column.status]}
                </span>
              </div>
              {column.items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-500">
                  Nothing in this stage yet.
                </p>
              ) : (
                column.items.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                  >
                    <h3 className="text-sm font-semibold text-stone-900">
                      {item.label}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="Execution plan"
          title="Phased go-to-market"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gtmPhases.map((phase) => (
            <div
              key={phase.phase}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                Phase {phase.phase}
              </span>
              <h3 className="mt-1 text-sm font-semibold text-stone-900">
                {phase.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {phase.summary}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </InvestorShell>
  );
}
