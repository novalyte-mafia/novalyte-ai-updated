"use client";

import { Suspense, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  AssessmentExperience,
  type AssessmentAttribution,
} from "@/components/views/assessment-experience";
import { getAssessment } from "@/lib/assessment-config";
import { applyDeclarativeQuestions } from "@/lib/campaigns/assessment-overrides";
import type { ClinicT } from "@/lib/types";
import type { PageHost } from "@/lib/campaigns/types";

export type EmbeddedAssessmentProps = {
  assessmentSlug: string;
  pageId: string;
  campaignId?: string | null;
  pagePath: string;
  pageVersion: number;
  host: PageHost;
  prefill?: {
    state?: string;
    city?: string;
    zip?: string;
  };
  placement?: string;
  clinics: ClinicT[];
  mode?: "full" | "short";
  assessmentTemplateId?: string | null;
  assessmentVersion?: number | null;
  /** Absolute directory URL for ads-host handoffs (new tab). */
  directoryUrl?: string;
  /** Optional Studio-published declarative questions override. */
  assessmentQuestions?: import("@/lib/campaigns/assessment-overrides").DeclarativeQuestion[];
};

function EmbeddedAssessmentInner(props: EmbeddedAssessmentProps) {
  const searchParams = useSearchParams();
  const startTimeRef = useRef(new Date().toISOString());

  const base = getAssessment(props.assessmentSlug);
  if (!base) return null;
  const config = applyDeclarativeQuestions(base, props.assessmentQuestions);

  const attribution = useMemo<AssessmentAttribution>(() => {
    const deviceType =
      typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
        ? "mobile"
        : "desktop";

    return {
      csPageId: props.pageId,
      csCampaignId: props.campaignId ?? undefined,
      assessmentTemplateId: props.assessmentTemplateId ?? undefined,
      assessmentVersion: props.assessmentVersion ?? undefined,
      pageVersion: props.pageVersion,
      pagePath: props.pagePath,
      host: props.host,
      trafficSource: searchParams.get("utm_source") ?? searchParams.get("ref") ?? undefined,
      deviceType,
      consentVersion: "v1",
      startTime: startTimeRef.current,
      assessmentMode: props.mode ?? "full",
      utmSource: searchParams.get("utm_source") ?? undefined,
      utmMedium: searchParams.get("utm_medium") ?? undefined,
      utmCampaign: searchParams.get("utm_campaign") ?? undefined,
      utmContent: searchParams.get("utm_content") ?? undefined,
      utmTerm: searchParams.get("utm_term") ?? undefined,
    };
  }, [props, searchParams]);

  const initialAnswers = useMemo(() => {
    if (!props.prefill?.state && !props.prefill?.zip && !props.prefill?.city) {
      return undefined;
    }
    return {
      contact_location: {
        state: props.prefill?.state ?? "",
        zip: props.prefill?.zip ?? "",
        city: props.prefill?.city ?? "",
      },
    };
  }, [props.prefill]);

  return (
    <AssessmentExperience
      config={config}
      clinics={props.clinics}
      variant="embedded"
      attribution={attribution}
      initialAnswers={initialAnswers}
      directoryUrl={props.directoryUrl}
      onExit={() => {
        // Stay on the landing page — scroll back to hero.
        document.getElementById("campaign-hero")?.scrollIntoView({ behavior: "smooth" });
      }}
    />
  );
}

export function EmbeddedAssessment(props: EmbeddedAssessmentProps) {
  return (
    <section
      id="campaign-assessment"
      data-placement={props.placement ?? "below_hero"}
      className="scroll-mt-24"
      aria-label="Patient assessment"
    >
      <Suspense
        fallback={
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">Loading assessment…</p>
          </div>
        }
      >
        <EmbeddedAssessmentInner {...props} />
      </Suspense>
    </section>
  );
}
