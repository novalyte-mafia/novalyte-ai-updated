"use client";

import { trackCampaignEvent, type CampaignAnalyticsContext } from "@/lib/campaigns/analytics";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  analytics?: CampaignAnalyticsContext;
  source: string;
  event?: "campaign_find_clinics_clicked" | "campaign_contextual_cta_clicked" | "campaign_resource_clicked";
};

export function CampaignOutboundLink({
  href,
  children,
  className,
  analytics,
  source,
  event = "campaign_find_clinics_clicked",
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        trackCampaignEvent(event, analytics, {
          directory_destination: href,
          source,
        });
        if (event === "campaign_find_clinics_clicked") {
          trackCampaignEvent("campaign_directory_opened", analytics, {
            directory_destination: href,
            source,
          });
        }
      }}
    >
      {children}
    </a>
  );
}

export function CampaignAssessmentAnchor({
  href = "#campaign-assessment",
  children,
  className,
  analytics,
  source,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  analytics?: CampaignAnalyticsContext;
  source: string;
}) {
  return (
    <a
      href={href}
      className={cn(className)}
      onClick={() => {
        trackCampaignEvent("campaign_primary_cta_clicked", analytics, {
          source,
          cta: "start_assessment",
        });
      }}
    >
      {children}
    </a>
  );
}
