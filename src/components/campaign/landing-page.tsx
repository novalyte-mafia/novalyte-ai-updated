import Link from "next/link";
import { MapPin, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/shared/badges";
import { EmbeddedAssessment } from "@/components/campaign/embedded-assessment";
import { colorClasses, initials } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PublicCampaignPage, CampaignPageBlock } from "@/lib/campaigns/types";
import type { ClinicT } from "@/lib/types";

type LandingPageProps = {
  data: PublicCampaignPage;
  fallbackClinics?: ClinicT[];
};

function blockByType(blocks: CampaignPageBlock[], type: string) {
  return blocks.filter((b) => b.type === type);
}

function AssessmentSlot({
  data,
  placement,
  clinics,
}: {
  data: PublicCampaignPage;
  placement: string;
  clinics: PublicCampaignPage["clinics"];
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
  const clinics = data.clinics.length > 0 ? data.clinics : fallbackClinics.slice(0, 6);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section id="campaign-hero" className="border-b border-border bg-gradient-to-b from-teal-50/40 to-background">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          {hero.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              {String(hero.eyebrow)}
            </p>
          ) : data.page.service_slug ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              {data.page.service_slug.replace(/-/g, " ")}
              {data.page.city_slug ? ` · ${data.page.city_slug.replace(/-/g, " ")}` : ""}
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
            {data.page.cta_primary ? (
              <Button asChild size="lg" className="bg-teal-600 text-white hover:bg-teal-700">
                <a href="#campaign-assessment">{data.page.cta_primary}</a>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-teal-600 text-white hover:bg-teal-700">
                <a href="#campaign-assessment">Start assessment</a>
              </Button>
            )}
            {data.page.cta_secondary ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/directory">{data.page.cta_secondary}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-12 sm:px-6">
        <AssessmentSlot data={data} placement="below_hero" clinics={clinics} />

        {/* Value props */}
        {valuePropBlocks.length > 0 && (
          <section aria-labelledby="value-props-heading">
            <h2 id="value-props-heading" className="text-xl font-semibold text-foreground">
              Why patients choose this path
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

        <AssessmentSlot data={data} placement="before_faq" clinics={clinics} />

        {/* FAQ */}
        {faqBlocks.length > 0 && (
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-xl font-semibold text-foreground">
              Frequently asked questions
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

        {/* Clinics */}
        {clinics.length > 0 && (
          <section aria-labelledby="clinics-heading">
            <h2 id="clinics-heading" className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <Building2 className="h-5 w-5 text-teal-600" />
              Featured clinics
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {clinics.map((clinic) => {
                const col = colorClasses(clinic.logoColor);
                const state = clinic.state?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                const city = clinic.city?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                const href =
                  state && city && clinic.slug
                    ? `/directory/${state}/${city}/${clinic.slug}`
                    : "/directory";

                return (
                  <Link
                    key={clinic.id}
                    href={href}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-teal-200 hover:shadow-sm"
                  >
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
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <AssessmentSlot data={data} placement="before_footer" clinics={clinics} />
        <AssessmentSlot data={data} placement="inline" clinics={clinics} />

        {/* CTA */}
        <section className="rounded-2xl border border-teal-100 bg-teal-50/50 p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Ready to see if you&apos;re a fit?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete the assessment above — it stays on this page and takes just a few minutes.
          </p>
          <Button asChild size="lg" className="mt-6 bg-teal-600 text-white hover:bg-teal-700">
            <a href="#campaign-assessment">{data.page.cta_primary ?? "Start assessment"}</a>
          </Button>
        </section>

        <section className="mt-10 rounded-xl border border-border bg-muted/30 p-5 text-left text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Important information</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-4">
            <li>This assessment is informational only and is not medical advice, diagnosis, or treatment.</li>
            <li>Eligibility and care decisions are made by licensed providers — not by Novalyte AI.</li>
            <li>Novalyte AI is a healthcare technology platform and facilitator, not a medical provider.</li>
            <li>Submitting this form does not guarantee treatment, an appointment, or a clinic match.</li>
            <li>If you are experiencing a medical emergency, call 911 or go to the nearest emergency department.</li>
          </ul>
          <p className="mt-3">
            <Link href="/privacy" className="underline-offset-2 hover:underline">
              Privacy
            </Link>
            {" · "}
            <Link href="/terms" className="underline-offset-2 hover:underline">
              Terms
            </Link>
            {" · "}
            <Link href="/medical-disclaimer" className="underline-offset-2 hover:underline">
              Medical disclaimer
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
