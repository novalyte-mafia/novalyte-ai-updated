"use client";

import { Button } from "@/components/ui/button";
import {
  CampaignAssessmentAnchor,
  CampaignOutboundLink,
} from "@/components/campaign/campaign-links";
import { trackCampaignEvent, type CampaignAnalyticsContext } from "@/lib/campaigns/analytics";
import type { CampaignAnswerCardItem } from "@/lib/campaigns/types";

function isApproved(item: CampaignAnswerCardItem) {
  return !item.status || item.status === "approved";
}

export function CampaignAnswerCards({
  heading,
  items,
  directoryUrl,
  analytics,
}: {
  heading: string;
  items: CampaignAnswerCardItem[];
  directoryUrl: string;
  analytics?: CampaignAnalyticsContext;
}) {
  const approved = items.filter(
    (item) => (item.question || item.title) && (item.answer || item.description) && isApproved(item),
  );
  if (approved.length === 0) return null;

  return (
    <section aria-labelledby="answer-cards-heading">
      <h2 id="answer-cards-heading" className="text-xl font-semibold text-foreground">
        {heading}
      </h2>
      <div className="mt-6 space-y-3">
        {approved.map((item, idx) => {
          const question = item.question ?? item.title ?? "Question";
          const answer = item.answer ?? item.description ?? "";
          return (
            <details
              key={item.id ?? `answer-${idx}`}
              className="group rounded-2xl border border-border bg-card p-5 shadow-premium-xs"
              onToggle={(e) => {
                if ((e.target as HTMLDetailsElement).open) {
                  trackCampaignEvent("campaign_answer_expanded", analytics, {
                    intent: item.intent ?? undefined,
                    answer_index: idx,
                  });
                }
              }}
            >
              <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none">
                {question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              {item.ctaLabel ? (
                <div className="mt-4">
                  {item.ctaType === "directory" ? (
                    <Button asChild size="sm" variant="outline">
                      <CampaignOutboundLink
                        href={item.resourceUrl || directoryUrl}
                        analytics={analytics}
                        source="answer_card"
                        event="campaign_contextual_cta_clicked"
                      >
                        {item.ctaLabel}
                      </CampaignOutboundLink>
                    </Button>
                  ) : item.ctaType === "resource" && item.resourceUrl ? (
                    <Button asChild size="sm" variant="outline">
                      <CampaignOutboundLink
                        href={item.resourceUrl}
                        analytics={analytics}
                        source="answer_card"
                        event="campaign_resource_clicked"
                      >
                        {item.ctaLabel}
                      </CampaignOutboundLink>
                    </Button>
                  ) : (
                    <Button asChild size="sm" className="bg-teal-700 text-white hover:bg-teal-800">
                      <CampaignAssessmentAnchor analytics={analytics} source="answer_card">
                        {item.ctaLabel}
                      </CampaignAssessmentAnchor>
                    </Button>
                  )}
                </div>
              ) : null}
            </details>
          );
        })}
      </div>
    </section>
  );
}
