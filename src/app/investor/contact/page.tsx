import type { Metadata } from "next";

import { InvestorShell } from "@/components/investor/shell";
import { Section, SectionHeading } from "@/components/investor/section";
import { AccessRequestForm } from "@/components/investor/access-request-form";
import { investorContent } from "@/lib/investor/content";

export const metadata: Metadata = { title: "Contact & Access" };

export default function ContactPage() {
  const { founder } = investorContent;

  return (
    <InvestorShell>
      <Section tone="warm" className="pt-14">
        <SectionHeading
          eyebrow="Contact"
          title="Request access or reach the founder"
          description="Approved investors receive a secure invitation to the confidential data room with financials, traction detail, and founder updates."
        />
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <AccessRequestForm />
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-stone-900">
                Prefer to email?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Reach {founder.firstName} {founder.lastName}, {founder.title},
                directly.
              </p>
              <a
                href={`mailto:${founder.email}`}
                className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline"
              >
                {founder.email}
              </a>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-stone-900">
                What happens next
              </h3>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>1. You submit an access request.</li>
                <li>2. The founder reviews it personally.</li>
                <li>3. Approved investors receive a secure invitation.</li>
                <li>4. You sign in and accept confidentiality terms.</li>
                <li>5. The data room unlocks.</li>
              </ol>
            </div>
          </div>
        </div>
      </Section>
    </InvestorShell>
  );
}
