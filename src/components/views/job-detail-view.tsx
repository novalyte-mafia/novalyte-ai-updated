"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SectionShell } from "@/components/shared/section";
import { VerificationBadge, StatusPill, CheckItem } from "@/components/shared/badges";
import {
  PremiumCard,
  MetaRow,
  StatCard,
  EmptyState,
  SaveButton,
  Breadcrumbs,
} from "@/components/shared/enterprise";
import { StickyTabNav } from "@/components/shared/sticky-tab-nav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { splitCsv } from "@/lib/constants";
import type { JobPostingT } from "@/lib/types";
import { navigate, useSaved } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { captureSafeEvent } from "@/lib/analytics-client";
import {
  MapPin,
  Briefcase,
  CalendarDays,
  DollarSign,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Send,
  Clock,
  Video,
  ShieldCheck,
  CheckCircle2,
  ListChecks,
  Award,
  GraduationCap,
  Building2,
  FileText,
  Info,
  Stethoscope,
  Users,
  Sparkles,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */

function formatComp(min: number | null, max: number | null): string | null {
  const isHourly = (n: number | null) => n != null && n < 1000;
  const hourly = isHourly(min) || isHourly(max);
  const fmt = (n: number) => (hourly ? `$${n}/hr` : `$${Math.round(n / 1000)}k`);
  if (min != null && max != null && min > 0 && max > 0) {
    return `${fmt(min)}\u2013${fmt(max)}`;
  }
  if (min != null && min > 0) return `From ${fmt(min)}`;
  if (max != null && max > 0) return `Up to ${fmt(max)}`;
  return null;
}

function formatCompShort(min: number | null, max: number | null): string {
  const c = formatComp(min, max);
  return c ?? "Competitive";
}

type TabId = "overview" | "requirements" | "compensation" | "schedule" | "apply";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Info },
  { id: "requirements", label: "Requirements", icon: ListChecks },
  { id: "compensation", label: "Compensation & Benefits", icon: Banknote },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "apply", label: "How to Apply", icon: Send },
];

/* ────────────────────────────────────────────────────────────────
   Main view
   ──────────────────────────────────────────────────────────────── */

export function JobDetailView({
  job,
  allJobs,
}: {
  job: JobPostingT;
  allJobs: JobPostingT[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const applicationStarted = useRef(false);

  useEffect(() => {
    captureSafeEvent("job_viewed", { job_id: job.id });
  }, [job.id]);

  const licenses = splitCsv(job.requiredLicenses);
  const specialties = splitCsv(job.treatmentSpecialties);
  const appReqs = splitCsv(job.applicationRequirements);
  const comp = formatComp(job.compMin, job.compMax);
  const compShort = formatCompShort(job.compMin, job.compMax);

  const saved = useSaved((s) => s.jobs.includes(job.id));
  const toggle = useSaved((s) => s.toggle);

  // Related jobs: same state, OR same employment type, OR shared specialty — exclude self, take 3
  const relatedJobs = useMemo(() => {
    const jobSpecialties = new Set(specialties);
    const jobLicenses = new Set(licenses);
    const scored = allJobs
      .filter((j) => j.id !== job.id)
      .map((j) => {
        let score = 0;
        if (j.state === job.state) score += 2;
        if (j.employmentType === job.employmentType) score += 1;
        const jSpecs = splitCsv(j.treatmentSpecialties);
        if (jSpecs.some((s) => jobSpecialties.has(s))) score += 3;
        const jLics = splitCsv(j.requiredLicenses);
        if (jLics.some((l) => jobLicenses.has(l))) score += 1;
        if (j.clinicName === job.clinicName) score += 1;
        return { j, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.j);
    return relatedJobsFill(allJobs, job, scored);
  }, [allJobs, job, licenses, specialties]);

  function scrollToApply() {
    if (!applicationStarted.current) {
      applicationStarted.current = true;
      captureSafeEvent("job_application_started", { job_id: job.id });
    }
    setActiveTab("apply");
    // Allow tab state to render then smooth-scroll
    window.setTimeout(() => {
      document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function backToWorkforce() {
    navigate("workforce");
  }

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Workforce", onClick: backToWorkforce },
              { label: job.clinicName, onClick: backToWorkforce },
              { label: job.title },
            ]}
          />
        </div>
      </div>

      {/* Hero header */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-8 sm:py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Main */}
            <div>
              <button
                onClick={backToWorkforce}
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-teal-700"
              >
                {job.clinicName}
              </button>
              <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {job.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {job.city}, {job.state}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" /> {job.employmentType}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <RemotePill remote={job.remote} />
              </div>

              {/* Compensation prominent */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                <Banknote className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/80">
                    Compensation
                  </p>
                  <p className="text-lg font-semibold text-emerald-700">
                    {comp ?? "Competitive"}
                  </p>
                </div>
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  <ShieldCheck className="h-3 w-3" /> Transparent
                </span>
              </div>

              {/* Action row */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Button
                  size="lg"
                  className="bg-teal-600 text-white hover:bg-teal-700"
                  onClick={scrollToApply}
                >
                  Apply now <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <SaveButton
                  saved={saved}
                  onToggle={() => toggle("job", job.id)}
                  label={saved ? "Saved" : "Save"}
                />
                <Button variant="ghost" size="lg" onClick={backToWorkforce}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to jobs
                </Button>
              </div>
            </div>

            {/* Employer snapshot card */}
            <aside>
              <PremiumCard className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Employer snapshot
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {job.clinicName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {job.city}, {job.state}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <dl className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" /> Type
                    </dt>
                    <dd className="font-medium text-foreground">{job.employmentType}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <Banknote className="h-3.5 w-3.5" /> Comp
                    </dt>
                    <dd className="font-medium text-foreground">{compShort}</dd>
                  </div>
                  {job.requiredExperience && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> Experience
                      </dt>
                      <dd className="font-medium text-foreground">{job.requiredExperience}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <Video className="h-3.5 w-3.5" /> Remote
                    </dt>
                    <dd className="font-medium text-foreground">
                      {job.remote ? "Available" : "On-site"}
                    </dd>
                  </div>
                </dl>

                <Separator className="my-4" />

                <div className="flex flex-wrap gap-1.5">
                  <StatusPill tone="emerald">
                    <ShieldCheck className="h-3 w-3" /> Verified employer
                  </StatusPill>
                  <StatusPill tone="teal">
                    <Sparkles className="h-3 w-3" /> Hiring
                  </StatusPill>
                </div>
              </PremiumCard>
            </aside>
          </div>
        </div>
      </section>

      {/* Sticky tab nav */}
      <StickyTabNav
        tabs={TABS}
        active={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
        rightSlot={
          <Button
            size="sm"
            className="bg-teal-600 text-white hover:bg-teal-700"
            onClick={scrollToApply}
          >
            Apply now <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        }
      />

      {/* Tab content */}
      <SectionShell className="!pt-10 !pb-12">
        <div className="mx-auto w-full max-w-4xl">
          {activeTab === "overview" && (
            <OverviewTab job={job} licenses={licenses} specialties={specialties} />
          )}
          {activeTab === "requirements" && (
            <RequirementsTab
              job={job}
              licenses={licenses}
              appReqs={appReqs}
            />
          )}
          {activeTab === "compensation" && (
            <CompensationTab job={job} comp={comp} compShort={compShort} />
          )}
          {activeTab === "schedule" && <ScheduleTab job={job} />}
          {activeTab === "apply" && (
            <ApplyTab job={job} comp={comp} />
          )}
        </div>
      </SectionShell>

      {/* Related jobs */}
      {relatedJobs.length > 0 && (
        <SectionShell tone="muted" className="!pt-10 !pb-16">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                  Related opportunities
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  More roles like this
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={backToWorkforce}>
                Browse all jobs <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3 novalyte-fade-up">
              {relatedJobs.map((rj) => (
                <RelatedJobCard key={rj.id} job={rj} />
              ))}
            </div>
          </div>
        </SectionShell>
      )}
    </>
  );
}

function relatedJobsFill(
  allJobs: JobPostingT[],
  current: JobPostingT,
  matched: JobPostingT[],
): JobPostingT[] {
  if (matched.length >= 3) return matched.slice(0, 3);
  const fillers = allJobs
    .filter((j) => j.id !== current.id && !matched.some((m) => m.id === j.id))
    .slice(0, 3 - matched.length);
  return [...matched, ...fillers];
}

function RemotePill({ remote }: { remote: boolean }) {
  if (remote) return <StatusPill tone="teal">Remote</StatusPill>;
  return <StatusPill tone="muted">On-site</StatusPill>;
}

/* ────────────────────────────────────────────────────────────────
   Tab: Overview
   ──────────────────────────────────────────────────────────────── */

function OverviewTab({
  job,
  licenses,
  specialties,
}: {
  job: JobPostingT;
  licenses: string[];
  specialties: string[];
}) {
  const paragraphs = job.description.split(/\n{2,}|\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <SectionLabel icon={Info} label="Position overview" />
        <div className="mt-4 space-y-4 text-pretty text-base leading-relaxed text-foreground/80">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p>{job.description}</p>
          )}
        </div>
      </div>

      <MetaRow
        columns={3}
        items={[
          { label: "Clinic", value: job.clinicName, icon: Building2 },
          { label: "Location", value: `${job.city}, ${job.state}`, icon: MapPin },
          { label: "Type", value: job.employmentType, icon: Briefcase },
          { label: "Remote", value: job.remote ? "Yes" : "On-site", icon: Video },
          {
            label: "Experience",
            value: job.requiredExperience ?? "Not specified",
            icon: Clock,
          },
          {
            label: "Compensation",
            value: formatCompShort(job.compMin, job.compMax),
            icon: Banknote,
          },
        ]}
      />

      {specialties.length > 0 && (
        <div>
          <SectionLabel icon={Stethoscope} label="Treatment specialties" />
          <div className="mt-3 flex flex-wrap gap-2">
            {specialties.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="border-teal-200 bg-teal-50/50 px-3 py-1 text-sm font-medium text-teal-700"
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {licenses.length > 0 && (
        <div>
          <SectionLabel icon={Award} label="Required licenses" />
          <div className="mt-3 flex flex-wrap gap-2">
            {licenses.map((l) => (
              <Badge
                key={l}
                variant="outline"
                className="border-border bg-muted/40 px-3 py-1 text-sm text-foreground/80"
              >
                {l}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Tab: Requirements
   ──────────────────────────────────────────────────────────────── */

function RequirementsTab({
  job,
  licenses,
  appReqs,
}: {
  job: JobPostingT;
  licenses: string[];
  appReqs: string[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <SectionLabel icon={Clock} label="Required experience" />
        <PremiumCard className="mt-3 p-5">
          <p className="text-sm text-foreground/80">
            {job.requiredExperience && job.requiredExperience.trim().length > 0
              ? job.requiredExperience
              : "No specific experience requirement listed. The hiring clinic will evaluate candidate qualifications during the screening process."}
          </p>
        </PremiumCard>
      </div>

      <div>
        <SectionLabel icon={Award} label="Required licenses" />
        {licenses.length > 0 ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {licenses.map((l) => (
              <li
                key={l}
                className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-premium-xs"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-foreground">{l}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No specific licensure is listed for this posting. Confirm requirements
            directly with the hiring clinic.
          </p>
        )}
      </div>

      <div>
        <SectionLabel icon={ListChecks} label="Application requirements" />
        {appReqs.length > 0 ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {appReqs.map((a) => (
              <CheckItem key={a}>{a}</CheckItem>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Submit a complete application through the form on the “How to Apply”
            tab. The hiring clinic may request additional documentation during
            screening.
          </p>
        )}
      </div>

      <div>
        <SectionLabel icon={GraduationCap} label="Credential & compliance expectations" />
        <PremiumCard className="mt-3 p-5">
          <ul className="space-y-2.5 text-sm text-foreground/80">
            <CheckItem>
              Active, unrestricted licensure in the state of practice (and any
              additional states for remote or multi-state roles).
            </CheckItem>
            <CheckItem>
              Current board certifications, DEA registration, and malpractice
              coverage as required for the role.
            </CheckItem>
            <CheckItem>
              Documented experience in men&apos;s health, hormone optimization,
              TRT, weight management, or related specialty areas.
            </CheckItem>
            <CheckItem>
              Compliance with HIPAA, OSHA, and applicable state telehealth
              regulations.
            </CheckItem>
            <CheckItem>
              Successful completion of the hiring clinic&apos;s background check,
              reference verification, and credentialing process.
            </CheckItem>
          </ul>
        </PremiumCard>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Tab: Compensation & Benefits
   ──────────────────────────────────────────────────────────────── */

function CompensationTab({
  job,
  comp,
  compShort,
}: {
  job: JobPostingT;
  comp: string | null;
  compShort: string;
}) {
  return (
    <div className="space-y-8">
      <div>
        <SectionLabel icon={Banknote} label="Compensation" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Range"
            value={comp ?? "Competitive"}
            sub={comp ? "Salary transparency" : "Confirm with clinic"}
            icon={DollarSign}
            tone="emerald"
          />
          <StatCard
            label="Min"
            value={job.compMin != null ? formatComp(job.compMin, null) ?? "—" : "—"}
            sub={job.compMin != null && job.compMin < 1000 ? "Hourly" : "Annual"}
            icon={ArrowRight}
          />
          <StatCard
            label="Max"
            value={job.compMax != null ? formatComp(null, job.compMax) ?? "—" : "—"}
            sub={job.compMax != null && job.compMax < 1000 ? "Hourly" : "Annual"}
            icon={ArrowRight}
          />
        </div>
      </div>

      <div>
        <SectionLabel icon={ShieldCheck} label="Benefits" />
        <PremiumCard className="mt-3 p-5">
          <p className="text-sm text-foreground/80">
            Specific benefits — including health, dental, and vision insurance,
            retirement contributions, paid time off, continuing medical education
            (CME) allowances, license renewal reimbursement, malpractice coverage,
            and performance bonuses — are confirmed directly with the hiring
            clinic during the interview and offer stage.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Novalyte AI lists compensation ranges when disclosed by the clinic but
            does not negotiate or administer benefit packages.
          </p>
        </PremiumCard>
      </div>

      <div>
        <SectionLabel icon={FileText} label="Schedule" />
        <PremiumCard className="mt-3 p-5">
          <p className="text-sm text-foreground/80">
            {job.schedule ?? "Schedule details are confirmed directly with the hiring clinic."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill tone="teal">{job.employmentType}</StatusPill>
            <StatusPill tone={job.remote ? "teal" : "muted"}>
              {job.remote ? "Remote available" : "On-site"}
            </StatusPill>
            <StatusPill tone="muted">{job.city}, {job.state}</StatusPill>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Tab: Schedule
   ──────────────────────────────────────────────────────────────── */

function ScheduleTab({ job }: { job: JobPostingT }) {
  return (
    <div className="space-y-8">
      <div>
        <SectionLabel icon={CalendarDays} label="Schedule" />
        <PremiumCard className="mt-3 p-5">
          <p className="text-base leading-relaxed text-foreground/80">
            {job.schedule ?? "Schedule details are confirmed directly with the hiring clinic during the interview process."}
          </p>
        </PremiumCard>
      </div>

      <div>
        <SectionLabel icon={Briefcase} label="Employment & location" />
        <MetaRow
          columns={2}
          items={[
            { label: "Employment type", value: job.employmentType, icon: Briefcase },
            {
              label: "Work model",
              value: job.remote ? "Remote available" : "On-site",
              icon: Video,
            },
            { label: "City", value: job.city, icon: MapPin },
            { label: "State", value: job.state, icon: MapPin },
          ]}
        />
      </div>

      <div>
        <SectionLabel icon={Video} label="Remote & telehealth" />
        <PremiumCard className="mt-3 p-5">
          {job.remote ? (
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Video className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Remote work available</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This role supports remote or telehealth delivery. Candidates
                  must hold active licensure in every state of practice and comply
                  with applicable state telehealth regulations. The hiring clinic
                  confirms coverage areas and supervision requirements.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">On-site role</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This position is performed on-site at the clinic location in
                  {` ${job.city}, ${job.state}`}. Confirm any hybrid flexibility
                  directly with the hiring clinic.
                </p>
              </div>
            </div>
          )}
        </PremiumCard>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Tab: How to Apply
   ──────────────────────────────────────────────────────────────── */

type ApplicationForm = {
  coverNote: string;
  consent: boolean;
};

const EMPTY_FORM: ApplicationForm = {
  coverNote: "",
  consent: false,
};

function ApplyTab({ job, comp }: { job: JobPostingT; comp: string | null }) {
  const [form, setForm] = useState<ApplicationForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consent) {
      captureSafeEvent("form_validation_error", { form_type: "job_application" });
      toast.error("Please acknowledge the platform disclosure to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const { getSupabaseClient } = await import("@/lib/supabase/client");
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast.error("Sign in to your professional account to apply.");
        window.location.assign("/workforce/professional/sign-in");
        return;
      }
      const res = await fetch("/api/job-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobPostingId: job.id,
          coverNote: form.coverNote || null,
          consentVersion: "v1",
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Unable to apply.");
      setDone(true);
      captureSafeEvent("job_application_submitted", { job_id: job.id });
      toast.success("Application submitted. The clinic will reach out if there is a fit.");
    } catch (error) {
      captureSafeEvent("form_submission_error", { form_type: "job_application" });
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="apply-form" className="scroll-mt-32 space-y-6">
      <div>
        <SectionLabel icon={Send} label="How to apply" />
        <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
          Submit your details below to express interest in <span className="font-semibold text-foreground">{job.title}</span> at{" "}
          <span className="font-semibold text-foreground">{job.clinicName}</span>.
          Your application is routed directly to the hiring clinic. Novalyte AI
          facilitates discovery and communication — the clinic remains responsible
          for screening, credentialing, and hiring decisions.
        </p>
      </div>

      <MetaRow
        columns={3}
        items={[
          { label: "Role", value: job.title, icon: Briefcase },
          { label: "Compensation", value: comp ?? "Competitive", icon: Banknote },
          { label: "Location", value: `${job.city}, ${job.state}`, icon: MapPin },
        ]}
      />

      <PremiumCard className="p-6">
        {!done ? (
          <>
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-teal-700" />
              <h3 className="text-base font-semibold text-foreground">
                Application form
              </h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Applications require a signed-in professional account. Your name and contact details are taken from your verified profile.
            </p>

            <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="jd-note" className="text-xs">
                  Cover note <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="jd-note"
                  rows={4}
                  placeholder="Why are you a strong fit for this role?"
                  value={form.coverNote}
                  onChange={(e) => setForm({ ...form, coverNote: e.target.value })}
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                  className="mt-0.5"
                />
                <span>
                  I understand Novalyte AI is a technology platform and does not
                  employ providers or make hiring decisions. Hiring clinics are
                  responsible for background checks, credential verification,
                  licensing confirmation, employment compliance, clinical
                  supervision, and hiring decisions.
                </span>
              </label>

              <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm(EMPTY_FORM)}
                  disabled={submitting}
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 text-white hover:bg-teal-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit application <Send className="ml-1 h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold text-foreground">
              Application submitted
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Your application for <span className="font-medium text-foreground">{job.title}</span> at{" "}
              {job.clinicName} has been received. The clinic will reach out
              directly if there is a fit.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setForm(EMPTY_FORM);
                setDone(false);
              }}
            >
              Submit another response
            </Button>
          </div>
        )}
      </PremiumCard>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Related jobs card (compact)
   ──────────────────────────────────────────────────────────────── */

function RelatedJobCard({ job }: { job: JobPostingT }) {
  const specialties = splitCsv(job.treatmentSpecialties).slice(0, 2);
  const comp = formatComp(job.compMin, job.compMax);

  function open() {
    navigate("job-detail", undefined, { id: job.id });
  }

  return (
    <PremiumCard hover className="flex h-full cursor-pointer flex-col p-5" as="article">
      <button onClick={open} className="text-left">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {job.clinicName}
        </p>
        <h3 className="mt-1 text-base font-semibold leading-tight text-foreground transition group-hover:text-teal-700">
          {job.title}
        </h3>
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {job.city}, {job.state}
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" /> {job.employmentType}
        </span>
      </div>

      <div className="mt-2">
        <RemotePill remote={job.remote} />
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <Banknote className="h-4 w-4 text-emerald-600" />
        {comp ? (
          <span className="text-sm font-semibold text-emerald-700">{comp}</span>
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">Competitive</span>
        )}
      </div>

      {specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {specialties.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="border-teal-200 bg-teal-50/50 text-xs font-medium text-teal-700"
            >
              {s}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-auto" />

      <div className="mt-4 border-t border-border pt-4">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={open}
        >
          View role <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </PremiumCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   Small shared label
   ──────────────────────────────────────────────────────────────── */

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{label}</h2>
    </div>
  );
}
