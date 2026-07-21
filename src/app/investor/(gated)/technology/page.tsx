import type { Metadata } from "next";

import { InvestorShell } from "@/components/investor/shell";
import { Section, SectionHeading } from "@/components/investor/section";

export const metadata: Metadata = { title: "Technology" };

const stack = [
  {
    layer: "Application",
    detail:
      "Next.js 16 App Router, React 19, and TypeScript across the public site and every subdomain surface (portal, ads, admin, investor).",
  },
  {
    layer: "Data & auth",
    detail:
      "Supabase Postgres with Row Level Security, role-based access via signed app-metadata roles, and server-validated sessions on protected routes.",
  },
  {
    layer: "Growth engine",
    detail:
      "Campaign Studio schema powers landing pages and embedded assessments with full campaign, page, treatment, and clinic attribution.",
  },
  {
    layer: "Operations",
    detail:
      "Admin console for clinic prospecting, call tracking, and outreach history supports founder-led go-to-market.",
  },
  {
    layer: "Security posture",
    detail:
      "Private storage buckets, signed short-lived download URLs, append-only access events, and separation between public content and confidential data.",
  },
];

export default function TechnologyPage() {
  return (
    <InvestorShell>
      <Section tone="warm" className="pt-14">
        <SectionHeading
          eyebrow="Technology"
          title="Built for compliance-aware healthcare workflows"
          description="Novalyte AI runs on a modern, single-codebase architecture with security and data separation designed in from the start, not bolted on later."
        />
      </Section>

      <Section>
        <div className="space-y-4">
          {stack.map((item, index) => (
            <div
              key={item.layer}
              className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:gap-6"
            >
              <div className="flex items-center gap-3 sm:w-56 sm:shrink-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                  {index + 1}
                </span>
                <h3 className="text-base font-semibold text-stone-900">
                  {item.layer}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-stone-900">
            Privacy by design
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Sensitive assessment responses stay inside the approved secure data
            system. Only privacy-safe identifiers and funnel metadata flow into
            general analytics — never health answers or sensitive free text.
          </p>
        </div>
      </Section>
    </InvestorShell>
  );
}
