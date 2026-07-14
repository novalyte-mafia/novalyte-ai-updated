"use client";

import { useState, useMemo } from "react";
import {
  PremiumCard, Breadcrumbs,
} from "@/components/shared/enterprise";
import { StickyTabNav } from "@/components/shared/sticky-tab-nav";
import { SmartImage } from "@/components/shared/smart-image";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner, MedicalDisclaimer } from "@/components/shared/disclaimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { navigate } from "@/lib/nav";
import { getTreatmentIcon } from "@/lib/treatment-icons";
import { getTreatmentContent, type TreatmentContent } from "@/lib/treatment-content";
import { ASSESSMENTS } from "@/lib/assessment-config";
import { splitCsv, colorClasses, initials } from "@/lib/constants";
import type { ClinicT, ArticleT } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, ShieldCheck, Stethoscope, FileText, AlertCircle,
  ArrowRight, Calendar, Phone, BookOpen, Building2, ExternalLink, HeartPulse,
  ClipboardList, TestTube2, Activity, Scale, Pill, FlaskConical, Scissors,
  Sparkles, Infinity as InfinityIcon, Dumbbell, Video,
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "consultation", label: "Consultation", icon: Stethoscope },
  { id: "considerations", label: "Benefits & Risks", icon: ShieldCheck },
  { id: "faq", label: "FAQ", icon: FileText },
  { id: "resources", label: "Resources & Clinics", icon: Building2 },
];

/** Stable treatment icon component using a switch to satisfy the React compiler. */
function TreatmentIcon({ slug, className }: { slug: string; className?: string }) {
  switch (slug) {
    case "testosterone-replacement-therapy": return <TestTube2 className={className} />;
    case "hormone-optimization": return <Activity className={className} />;
    case "erectile-dysfunction": return <HeartPulse className={className} />;
    case "medical-weight-loss": return <Scale className={className} />;
    case "glp-1": return <Pill className={className} />;
    case "peptide-therapy": return <FlaskConical className={className} />;
    case "hair-restoration": return <Scissors className={className} />;
    case "sexual-wellness": return <Sparkles className={className} />;
    case "longevity-medicine": return <InfinityIcon className={className} />;
    case "performance-recovery": return <Dumbbell className={className} />;
    case "preventive-mens-health": return <ShieldCheck className={className} />;
    case "telehealth-services": return <Video className={className} />;
    default: return <HeartPulse className={className} />;
  }
}

export function TreatmentDetailView({
  slug,
  clinics,
  articles,
  onStartAssessment,
}: {
  slug: string;
  clinics: ClinicT[];
  articles: ArticleT[];
  onStartAssessment: (slug: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const content = getTreatmentContent(slug);
  const assessment = ASSESSMENTS[slug];

  // Related clinics (matching this treatment specialty)
  const relatedClinics = useMemo(() => {
    if (!content) return [];
    return clinics
      .filter((c) => splitCsv(c.specialties).some((s) => s.toLowerCase().includes(content.label.toLowerCase().split(" ")[0])))
      .slice(0, 3);
  }, [clinics, content]);

  // Related articles (matching this treatment category)
  const relatedArticles = useMemo(() => {
    if (!content) return [];
    const keyword = content.label.toLowerCase().split(" ")[0];
    const matched = articles.filter((a) =>
      a.title.toLowerCase().includes(keyword) ||
      a.category.toLowerCase().includes(keyword) ||
      (a.relatedTreatment ?? "").toLowerCase().includes(content.label.toLowerCase())
    );
    return (matched.length > 0 ? matched : articles.slice(0, 3)).slice(0, 3);
  }, [articles, content]);

  if (!content) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Treatment page not found</h1>
        <Button className="mt-4" variant="outline" onClick={() => navigate("patients")}>Back to Patients</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs items={[
            { label: "Home", onClick: () => navigate("home") },
            { label: "Patients", onClick: () => navigate("patients") },
            { label: content.label },
          ]} />
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="relative h-56 overflow-hidden sm:h-72 lg:h-80">
          <SmartImage
            src={content.heroImage}
            alt={content.heroImageAlt}
            fill
            priority
            sizes="100vw"
            imgClassName="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" aria-hidden />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-premium-md">
              <TreatmentIcon slug={slug} className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{content.label}</h1>
              </div>
              <p className="mt-1 text-sm font-medium text-teal-700">{content.tagline}</p>
              <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">{content.overview}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {assessment && (
                  <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => onStartAssessment(slug)}>
                    <ClipboardList className="mr-1.5 h-4 w-4" /> Take Assessment
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate("directory")}>
                  <Building2 className="mr-1.5 h-4 w-4" /> Find Clinics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StickyTabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-8">
            {activeTab === "overview" && <OverviewTab content={content} />}
            {activeTab === "consultation" && <ConsultationTab content={content} />}
            {activeTab === "considerations" && <ConsiderationsTab content={content} />}
            {activeTab === "faq" && <FaqTab content={content} />}
            {activeTab === "resources" && (
              <ResourcesTab content={content} clinics={relatedClinics} articles={relatedArticles} onStartAssessment={onStartAssessment} />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <PremiumCard className="p-5">
              <h3 className="text-sm font-semibold text-foreground">Ready to explore?</h3>
              <p className="mt-1 text-xs text-muted-foreground">Take a personalized assessment to organize your goals and preferences.</p>
              {assessment ? (
                <Button className="mt-3 w-full bg-teal-600 text-white hover:bg-teal-700" onClick={() => onStartAssessment(slug)}>
                  <ClipboardList className="mr-1 h-4 w-4" /> Take Assessment
                </Button>
              ) : (
                <Button className="mt-3 w-full bg-teal-600 text-white hover:bg-teal-700" onClick={() => navigate("directory")}>
                  Find Clinics
                </Button>
              )}
              <Separator className="my-4" />
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-foreground">Quick facts</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium text-foreground">{content.shortLabel}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Assessment</span><span className="font-medium text-foreground">{assessment ? "Available" : "Coming soon"}</span></div>
              </div>
            </PremiumCard>

            <PremiumCard className="p-5">
              <h3 className="text-sm font-semibold text-foreground">Important</h3>
              <p className="mt-2 text-xs text-muted-foreground">This page is educational. Novalyte AI does not diagnose, prescribe, or guarantee treatment. A licensed provider determines what's appropriate for you.</p>
            </PremiumCard>
          </aside>
        </div>

        <MedicalDisclaimer className="mt-10" />
      </div>
    </div>
  );
}

/* ── Tabs ────────────────────────────────────────────────────── */
function OverviewTab({ content }: { content: TreatmentContent }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><BookOpen className="h-5 w-5 text-teal-600" /> About {content.label}</h2>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground/80">{content.overview}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PremiumCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground">Who may consider this</h3>
          <ul className="mt-3 space-y-2">
            {content.whoMayConsider.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /> {item}
              </li>
            ))}
          </ul>
        </PremiumCard>
        <PremiumCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground">Common goals</h3>
          <ul className="mt-3 space-y-2">
            {content.commonGoals.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /> {item}
              </li>
            ))}
          </ul>
        </PremiumCard>
      </div>

      <DisclaimerBanner tone="amber">
        This information is educational and does not constitute medical advice. Treatment eligibility is determined by a licensed healthcare provider based on individual health factors.
      </DisclaimerBanner>
    </div>
  );
}

function ConsultationTab({ content }: { content: TreatmentContent }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><Stethoscope className="h-5 w-5 text-teal-600" /> What a consultation may involve</h2>
        <p className="mt-2 text-sm text-muted-foreground">Understanding the consultation process helps you prepare and know what to expect.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PremiumCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground">Consultation process</h3>
          <ul className="mt-3 space-y-2">
            {content.consultationInvolves.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" /> {item}
              </li>
            ))}
          </ul>
        </PremiumCard>
        <PremiumCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground">Possible testing</h3>
          <ul className="mt-3 space-y-2">
            {content.possibleTesting.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /> {item}
              </li>
            ))}
          </ul>
        </PremiumCard>
      </div>

      <PremiumCard className="p-5">
        <h3 className="text-sm font-semibold text-foreground">Questions to ask a provider</h3>
        <p className="mt-1 text-xs text-muted-foreground">Being prepared with questions helps you get the most from your consultation.</p>
        <ul className="mt-3 space-y-2">
          {content.questionsToAsk.map((q) => (
            <li key={q} className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground/80">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /> {q}
            </li>
          ))}
        </ul>
      </PremiumCard>
    </div>
  );
}

function ConsiderationsTab({ content }: { content: TreatmentContent }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><ShieldCheck className="h-5 w-5 text-teal-600" /> Benefits, risks, and limitations</h2>
        <p className="mt-2 text-sm text-muted-foreground">An honest look at what to consider before pursuing this treatment.</p>
      </div>

      <PremiumCard className="p-5 border-teal-200 bg-teal-50/30">
        <h3 className="text-sm font-semibold text-foreground">Potential benefits</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">{content.potentialBenefits}</p>
      </PremiumCard>

      <PremiumCard className="p-5 border-amber-200 bg-amber-50/30">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground"><AlertCircle className="h-4 w-4 text-amber-600" /> Risks, limitations, and uncertainties</h3>
        <ul className="mt-3 space-y-2">
          {content.risksLimitations.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" /> {item}
            </li>
          ))}
        </ul>
      </PremiumCard>

      <DisclaimerBanner tone="amber">
        No treatment is guaranteed. A licensed provider determines whether any treatment is appropriate based on your individual health factors, lab results, and medical history.
      </DisclaimerBanner>
    </div>
  );
}

function FaqTab({ content }: { content: TreatmentContent }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><FileText className="h-5 w-5 text-teal-600" /> Frequently asked questions</h2>
      </div>
      <PremiumCard className="p-2">
        <Accordion type="single" collapsible className="w-full">
          {content.faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border last:border-0">
              <AccordionTrigger className="px-4 text-left text-sm font-medium hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="px-4 text-sm text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </PremiumCard>
    </div>
  );
}

function ResourcesTab({
  content,
  clinics,
  articles,
  onStartAssessment,
}: {
  content: TreatmentContent;
  clinics: ClinicT[];
  articles: ArticleT[];
  onStartAssessment: (slug: string) => void;
}) {
  return (
    <div className="space-y-8 novalyte-fade-up">
      {/* References */}
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><FileText className="h-5 w-5 text-teal-600" /> Sources and references</h2>
        <p className="mt-1 text-xs text-muted-foreground">For general reference. Always consult a licensed provider for medical guidance.</p>
        <div className="mt-4 space-y-2">
          {content.references.map((ref, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">{i + 1}</span>
              <div>
                <p className="font-medium text-foreground">{ref.label}</p>
                <p className="text-xs text-muted-foreground">{ref.source}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related clinics */}
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><Building2 className="h-5 w-5 text-teal-600" /> Clinics offering {content.shortLabel}</h2>
        {clinics.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No matching clinics found. Browse the full directory.
            <div className="mt-3"><Button variant="outline" size="sm" onClick={() => navigate("directory")}>Browse directory</Button></div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {clinics.map((c) => {
              const col = colorClasses(c.logoColor);
              return (
                <button
                  key={c.id}
                  onClick={() => navigate("clinic-profile", undefined, { id: c.id })}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition hover:border-teal-200 hover:shadow-sm"
                >
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white", col.bg)}>{initials(c.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.city}, {c.state}</p>
                  </div>
                  <VerificationBadge verified={c.verified} status={c.verificationStatus} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Related articles */}
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><BookOpen className="h-5 w-5 text-teal-600" /> Related Journal articles</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {articles.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate("journal-article", undefined, { slug: a.slug })}
              className="flex flex-col rounded-xl border border-border bg-card p-4 text-left transition hover:border-teal-200 hover:shadow-sm"
            >
              <Badge className="mb-2 w-fit border-teal-200 bg-teal-50 text-[10px] text-teal-700">{a.category}</Badge>
              <p className="text-sm font-semibold leading-tight text-foreground line-clamp-2">{a.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.readingTime} min read</p>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground">Ready to explore {content.label}?</h3>
        <p className="mt-1 text-sm text-muted-foreground">Take a personalized assessment to organize your goals and connect with clinics.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => onStartAssessment(content.slug)}>
            <ClipboardList className="mr-1 h-4 w-4" /> Take Assessment
          </Button>
          <Button variant="outline" onClick={() => navigate("directory")}>Find Clinics</Button>
        </div>
      </div>
    </div>
  );
}

