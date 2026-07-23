import Link from "next/link";
import { MapPin, CheckCircle2, Building2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/shared/badges";
import { EmbeddedAssessment } from "@/components/campaign/embedded-assessment";
import { CampaignAnswerCards } from "@/components/campaign/campaign-answer-cards";
import {
  CampaignAssessmentAnchor,
  CampaignOutboundLink,
} from "@/components/campaign/campaign-links";
import { CampaignComplianceNotice } from "@/components/campaign/campaign-compliance";
import { colorClasses, initials } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  buildDirectoryUrl,
  clinicProfileUrl,
  mainSitePath,
  parseLocationSlug,
} from "@/lib/campaigns/directory-url";
import { quickAnswersHeading, locationDisplayLabel, treatmentDisplayLabel } from "@/lib/campaigns/labels";
import type { CampaignAnalyticsContext } from "@/lib/campaigns/analytics";
import type { PublicCampaignPage, CampaignPageBlock } from "@/lib/campaigns/types";
import type { ClinicT } from "@/lib/types";

type LandingPageProps = {
  data: PublicCampaignPage;
  fallbackClinics?: ClinicT[];
};

function blockByType(blocks: CampaignPageBlock[], type: string) {
  return blocks.filter((b) => b.type === type);
}

function analyticsFromPage(
  data: PublicCampaignPage,
  directoryUrl: string,
): CampaignAnalyticsContext {
  const parsed = parseLocationSlug(data.page.city_slug);
  return {
    campaign_id: data.page.campaign_id,
    campaign_slug: data.page.slug,
    treatment_slug: data.page.service_slug,
    city: data.prefill.city ?? parsed.city,
    state: data.prefill.state ?? parsed.state,
    landing_page_url: data.page.path,
    assessment_id: data.assessmentSlug,
    directory_destination: directoryUrl,
  };
}

function AssessmentSlot({
  data,
  placement,
  clinics,
  directoryUrl,
}: {
  data: PublicCampaignPage;
  placement: string;
  clinics: PublicCampaignPage["clinics"];
  directoryUrl: string;
}) {
  if (!data.assessmentPlacement.includes(placement)) return null;

  return (
    <EmbeddedAssessment
      assessmentSlug={data.assessmentSlug}
      pageId={data.page.id}
      campaignId={data.page.campaign_id}
      pagePath={data.page.path}
      pageVersion={data.page.current_version}
      host={data.page.host}
      prefill={data.prefill}
      placement={placement}
      clinics={clinics}
      mode={data.assessmentMode}
      assessmentTemplateId={data.page.assessment_template_id}
      assessmentVersion={data.page.current_version}
      directoryUrl={directoryUrl}
    />
  );
}

export function CampaignLandingPage({ data, fallbackClinics = [] }: LandingPageProps) {
  const hero = data.page.hero ?? {};
  const headline =
    (hero.headline as string | undefined) ??
    data.page.public_title ??
    data.page.seo_title ??
    "Find care near you";
  const subheadline =
    (hero.subheadline as string | undefined) ??
    data.page.seo_description ??
    "";

  const faqBlocks = blockByType(data.blocks, "faq");
  const valuePropBlocks = blockByType(data.blocks, "value_props");
  const answerBlocks = blockByType(data.blocks, "answer_cards");
  const costBlocks = blockByType(data.blocks, "cost_factors");
  const howBlocks = blockByType(data.blocks, "how_it_works");
  const clinics = data.clinics.length > 0 ? data.clinics : fallbackClinics.slice(0, 6);

  const directoryUrl = buildDirectoryUrl({
    treatmentSlug: data.page.service_slug,
    citySlug: data.page.city_slug,
    stateSlug: data.page.state_slug,
    state: data.prefill.state,
    city: data.prefill.city,
  });

  const analytics = analyticsFromPage(data, directoryUrl);
  const locationLabel = locationDisplayLabel({
    citySlug: data.page.city_slug,
    city: data.prefill.city,
    stateSlug: data.page.state_slug,
    state: data.prefill.state,
  });
  const treatmentLabel = treatmentDisplayLabel(data.page.service_slug);
  const cityOnly = locationLabel.split(",")[0]?.trim();
  const secondaryCta =
    data.page.cta_secondary ??
    (cityOnly && cityOnly !== "your area" ? `Find ${cityOnly} Clinics` : "Find Clinics");
  const primaryCta = data.page.cta_primary ?? "Start My Assessment";

  const answerItems = answerBlocks.flatMap((b) => b.items ?? []);
  const answersHeading =
    answerBlocks[0]?.title ?? quickAnswersHeading(data.page.service_slug, locationLabel);

  const costTitle =
    costBlocks[0]?.title ?? `What can affect ${treatmentLabel.toUpperCase() === "TRT" ? "TRT" : treatmentLabel} pricing?`;
  const costItems =
    costBlocks.flatMap((b) => b.items ?? []).map((item) => item.title ?? item.label ?? item.description).filter(Boolean) as string[];

  const isAds = data.page.host === "ads";

  return (
    <div className="bg-background">
      <section id="campaign-hero" className="border-b border-border bg-gradient-to-b from-teal-50/40 to-background">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          {hero.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              {String(hero.eyebrow)}
            </p>
          ) : data.page.service_slug ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              {locationLabel} · {treatmentLabel}
            </p>
          ) : null}
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {headline}
          </h1>
          {subheadline ? (
            <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {subheadline}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-teal-700 text-white hover:bg-teal-800">
              <CampaignAssessmentAnchor analytics={analytics} source="hero_primary">
                {primaryCta}
              </CampaignAssessmentAnchor>
            </Button>
            <Button asChild size="lg" variant="outline">
              <CampaignOutboundLink
                href={directoryUrl}
                analytics={analytics}
                source="hero_secondary"
                className="inline-flex"
              >
                {secondaryCta}
              </CampaignOutboundLink>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-12 sm:px-6">
        <AssessmentSlot data={data} placement="below_hero" clinics={clinics} directoryUrl={directoryUrl} />

        {valuePropBlocks.length > 0 && (
          <section aria-labelledby="value-props-heading">
            <h2 id="value-props-heading" className="text-xl font-semibold text-foreground">
              {valuePropBlocks[0]?.title ?? "Why patients start here"}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {valuePropBlocks.flatMap((block) =>
                (block.items ?? []).map((item, idx) => (
                  <div
                    key={`${block.type}-${idx}`}
                    className="rounded-2xl border border-border bg-card p-5 shadow-premium-xs"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.title ?? item.question ?? "Benefit"}
                        </p>
                        {(item.description ?? item.answer) && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.description ?? item.answer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )),
              )}
            </div>
          </section>
        )}

        <CampaignAnswerCards
          heading={answersHeading}
          items={answerItems}
          directoryUrl={directoryUrl}
          analytics={analytics}
        />

        {costItems.length > 0 && (
          <section aria-labelledby="cost-factors-heading">
            <h2 id="cost-factors-heading" className="text-xl font-semibold text-foreground">
              {costTitle}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {costItems.map((label) => (
                <li
                  key={label}
                  className="flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                >
                  <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Pricing varies by clinic and is not set by Novalyte AI. Ask each provider what is included.
            </p>
          </section>
        )}

        <section aria-labelledby="how-heading" className="rounded-2xl border border-border bg-muted/20 p-6 sm:p-8">
          <h2 id="how-heading" className="text-xl font-semibold text-foreground">
            {howBlocks[0]?.title ?? "How Novalyte AI works"}
          </h2>
          {howBlocks[0]?.items && howBlocks[0].items.length > 0 ? (
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              {howBlocks[0].items.map((item, idx) => (
                <li key={idx}>
                  <span className="font-medium text-foreground">{item.title ?? item.question}</span>
                  {(item.description ?? item.answer) ? (
                    <> — {item.description ?? item.answer}</>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Share your goals and preferences in a short informational assessment.</li>
              <li>Novalyte AI organizes educational guidance and potential clinic options for your review.</li>
              <li>Licensed providers — not Novalyte AI — decide eligibility, care, and treatment.</li>
            </ol>
          )}
        </section>

        <AssessmentSlot data={data} placement="before_faq" clinics={clinics} directoryUrl={directoryUrl} />

        <section className="rounded-2xl border border-teal-100 bg-teal-50/40 p-6 text-center sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">Explore clinics independently</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Prefer to browse on your own? Open the Novalyte clinic directory in a new tab
            {locationLabel ? ` with ${locationLabel}` : ""} filters when available.
          </p>
          <Button asChild size="lg" variant="outline" className="mt-5 bg-background">
            <CampaignOutboundLink href={directoryUrl} analytics={analytics} source="directory_cta_section">
              {secondaryCta}
            </CampaignOutboundLink>
          </Button>
        </section>

        {faqBlocks.length > 0 && (
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-xl font-semibold text-foreground">
              {faqBlocks[0]?.title ?? "Frequently asked questions"}
            </h2>
            <div className="mt-6 space-y-4">
              {faqBlocks.flatMap((block) =>
                (block.items ?? []).map((item, idx) => (
                  <details
                    key={`faq-${idx}`}
                    className="group rounded-2xl border border-border bg-card p-5 shadow-premium-xs"
                  >
                    <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none">
                      {item.question}
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                  </details>
                )),
              )}
            </div>
          </section>
        )}

        {clinics.length > 0 && (
          <section aria-labelledby="clinics-heading">
            <h2 id="clinics-heading" className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <Building2 className="h-5 w-5 text-teal-600" />
              Featured clinics
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {clinics.map((clinic) => {
                const col = colorClasses(clinic.logoColor);
                const href = isAds
                  ? clinicProfileUrl(clinic)
                  : clinic.state && clinic.city && clinic.slug
                    ? `/directory/${clinic.state.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${clinic.city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${clinic.slug}`
                    : "/directory";

                const cardClass =
                  "flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-teal-200 hover:shadow-sm";

                const body = (
                  <>
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
                        col.bg,
                      )}
                    >
                      {initials(clinic.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{clinic.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {clinic.city}, {clinic.state}
                      </p>
                    </div>
                    <VerificationBadge
                      verified={clinic.verified}
                      status={clinic.verificationStatus}
                    />
                  </>
                );

                return isAds ? (
                  <CampaignOutboundLink
                    key={clinic.id}
                    href={href}
                    analytics={analytics}
                    source="featured_clinic"
                    event="campaign_resource_clicked"
                    className={cardClass}
                  >
                    {body}
                  </CampaignOutboundLink>
                ) : (
                  <Link key={clinic.id} href={href} className={cardClass}>
                    {body}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <AssessmentSlot data={data} placement="before_footer" clinics={clinics} directoryUrl={directoryUrl} />
        <AssessmentSlot data={data} placement="inline" clinics={clinics} directoryUrl={directoryUrl} />

        <section className="rounded-2xl border border-teal-100 bg-teal-50/50 p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Ready to organize your preferences?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete the assessment on this page — it is informational only and takes a few minutes.
          </p>
          <Button asChild size="lg" className="mt-6 bg-teal-700 text-white hover:bg-teal-800">
            <CampaignAssessmentAnchor analytics={analytics} source="final_cta">
              {primaryCta}
            </CampaignAssessmentAnchor>
          </Button>
        </section>

        <CampaignComplianceNotice isAds={isAds} />
      </div>
    </div>
  );
}
