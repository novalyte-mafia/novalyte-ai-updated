"use client";

import { useMemo, useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { CTASection } from "@/components/shared/cta";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { splitCsv, colorClasses, initials, US_STATES } from "@/lib/constants";
import type { ProfessionalT, JobPostingT } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Users,
  MapPin,
  Briefcase,
  CheckCircle2,
  X,
  Video,
  ArrowRight,
  Send,
  Stethoscope,
  Clock,
  CalendarDays,
  DollarSign,
  Award,
  ShieldCheck,
  UserCheck,
  BriefcaseBusiness,
  ListChecks,
} from "lucide-react";

const AVATAR_COLORS = ["teal", "emerald", "sky", "violet", "amber"] as const;

const MATCHING_FACTORS = [
  { label: "Role", icon: Briefcase },
  { label: "Location", icon: MapPin },
  { label: "Licensure", icon: ShieldCheck },
  { label: "Licensed states", icon: Award },
  { label: "Specialty", icon: Stethoscope },
  { label: "Remote availability", icon: Video },
  { label: "Experience", icon: Clock },
  { label: "Employment preference", icon: BriefcaseBusiness },
  { label: "Schedule", icon: CalendarDays },
  { label: "Credential status", icon: UserCheck },
] as const;

function avatarColor(index: number) {
  const key = AVATAR_COLORS[index % AVATAR_COLORS.length];
  // colorClasses() exposes "blue" mapped to sky tones; treat "sky" as blue.
  return colorClasses(key === "sky" ? "blue" : key);
}

function formatComp(min: number | null, max: number | null): string | null {
  const isHourly = (n: number | null) => n != null && n < 1000;
  const hourly = isHourly(min) || isHourly(max);
  const fmt = (n: number) => (hourly ? `$${n}/hr` : `$${Math.round(n / 1000)}k`);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `From ${fmt(min)}`;
  if (max != null) return `Up to ${fmt(max)}`;
  return null;
}

export function WorkforceView({
  professionals,
  jobs,
  onGetStarted,
}: {
  professionals: ProfessionalT[];
  jobs: JobPostingT[];
  onGetStarted: () => void;
}) {
  return (
    <>
      {/* 1. Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-14 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <Users className="h-3.5 w-3.5" /> Workforce Hub
          </div>
          <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Specialized Talent for the Future of Men&apos;s Health
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Novalyte AI connects men&apos;s health clinics with qualified physicians,
            nurse practitioners, physician assistants, registered nurses, medical
            assistants, phlebotomists, medical directors, patient coordinators, and
            revenue cycle specialists. Browse verified professionals and open roles,
            then start a structured introduction through the platform.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={onGetStarted}
            >
              Join as a Professional <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={onGetStarted}>
              <Briefcase className="mr-1 h-4 w-4" /> Post a Role
            </Button>
          </div>
        </div>
      </section>

      {/* 2 + 3 + 4. Tabs with Professionals & Jobs */}
      <SectionShell className="!pt-10">
        <Tabs defaultValue="professionals" className="w-full">
          <TabsList className="h-auto">
            <TabsTrigger value="professionals" className="gap-1.5 px-4 py-1.5">
              <Users className="h-4 w-4" /> Browse Professionals
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-1.5 px-4 py-1.5">
              <Briefcase className="h-4 w-4" /> Browse Jobs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professionals" className="mt-6">
            <ProfessionalsPanel professionals={professionals} />
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <JobsPanel jobs={jobs} />
          </TabsContent>
        </Tabs>
      </SectionShell>

      {/* 6. Matching logic */}
      <SectionShell tone="muted" className="!pt-12 !pb-12">
        <SectionHeading
          eyebrow="How Matching Works"
          title="How matching works on Novalyte AI"
          description="When a clinic posts a role or a professional searches for opportunities, the platform aligns profiles and postings across ten structured factors to surface relevant, licensure-aware matches."
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {MATCHING_FACTORS.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <f.icon className="h-4 w-4" />
              </span>
              <div className="flex min-w-0 items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                <span className="truncate text-sm font-medium text-foreground">
                  {f.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* 7. Disclaimer */}
      <SectionShell tone="default" className="!pt-0 !pb-12">
        <DisclaimerBanner tone="amber">
          Novalyte AI facilitates discovery and communication. Clinics remain
          responsible for background checks, credential verification, licensing
          confirmation, employment compliance, clinical supervision, and hiring
          decisions.
        </DisclaimerBanner>
      </SectionShell>

      {/* 8. CTA */}
      <CTASection
        title="Hiring for your men's health clinic?"
        description="Post a role to reach verified physicians, advanced practitioners, nurses, and operational staff. Novalyte AI helps you find aligned candidates — you stay in control of hiring."
        primaryLabel="Post a Role"
        onPrimary={onGetStarted}
        secondaryLabel="Browse Marketplace"
        secondaryView="marketplace"
      />
    </>
  );
}

/* ----------------------------------------------------------------------- */
/* 3. Browse Professionals                                                 */
/* ----------------------------------------------------------------------- */

function ProfessionalsPanel({ professionals }: { professionals: ProfessionalT[] }) {
  const [state, setState] = useState("all");
  const [title, setTitle] = useState("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const allTitles = useMemo(() => {
    const set = new Set<string>();
    professionals.forEach((p) => set.add(p.title));
    return Array.from(set).sort();
  }, [professionals]);

  const filtered = useMemo(() => {
    return professionals.filter((p) => {
      if (state !== "all" && p.state !== state) return false;
      if (title !== "all" && p.title !== title) return false;
      if (remoteOnly && !p.remote) return false;
      if (verifiedOnly && !p.verified) return false;
      return true;
    });
  }, [professionals, state, title, remoteOnly, verifiedOnly]);

  function resetFilters() {
    setState("all");
    setTitle("all");
    setRemoteOnly(false);
    setVerifiedOnly(false);
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto]">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All states" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Select value={title} onValueChange={setTitle}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All titles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All titles</SelectItem>
                {allTitles.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <Switch checked={remoteOnly} onCheckedChange={setRemoteOnly} />
            <span className="flex items-center gap-1 text-muted-foreground">
              <Video className="h-3.5 w-3.5" /> Remote
            </span>
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
            <span className="flex items-center gap-1 text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified
            </span>
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            {professionals.length} professionals
          </span>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <ProfessionalsEmptyState onReset={resetFilters} />
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, idx) => (
            <ProfessionalCard key={p.id} professional={p} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProfessionalCard({
  professional,
  index,
}: {
  professional: ProfessionalT;
  index: number;
}) {
  const c = avatarColor(index);
  const licensedStates = splitCsv(professional.licensedStates);
  const specialties = splitCsv(professional.specialties).slice(0, 3);

  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white",
              c.bg,
            )}
          >
            {initials(professional.name)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold leading-tight text-foreground">
              {professional.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{professional.title}</p>
          </div>
        </div>
        <VerificationBadge verified={professional.verified} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {professional.city}, {professional.state}
        </span>
        {professional.remote && <StatusPill tone="sky">Remote</StatusPill>}
      </div>

      {licensedStates.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Licensed states
          </p>
          <div className="flex flex-wrap gap-1.5">
            {licensedStates.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="border-border bg-muted/40 text-xs text-foreground/80"
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {specialties.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Specialties
          </p>
          <div className="flex flex-wrap gap-1.5">
            {specialties.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="border-teal-200 bg-teal-50/50 text-xs text-teal-700"
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {professional.yearsExperience}y exp
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" /> {professional.availability}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" /> {professional.employmentPref}
        </span>
      </div>

      {professional.bio && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{professional.bio}</p>
      )}
    </Card>
  );
}

function ProfessionalsEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
      <Users className="h-8 w-8 text-muted-foreground/60" />
      <h3 className="mt-3 text-base font-semibold">No professionals match your filters</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try widening your filters or clearing them to see more professionals in the
        network.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* 4. Browse Jobs                                                          */
/* ----------------------------------------------------------------------- */

function JobsPanel({ jobs }: { jobs: JobPostingT[] }) {
  const [state, setState] = useState("all");
  const [empType, setEmpType] = useState("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selected, setSelected] = useState<JobPostingT | null>(null);

  const allEmpTypes = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => set.add(j.employmentType));
    return Array.from(set).sort();
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (state !== "all" && j.state !== state) return false;
      if (empType !== "all" && j.employmentType !== empType) return false;
      if (remoteOnly && !j.remote) return false;
      return true;
    });
  }, [jobs, state, empType, remoteOnly]);

  function resetFilters() {
    setState("all");
    setEmpType("all");
    setRemoteOnly(false);
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All states" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Employment type</Label>
            <Select value={empType} onValueChange={setEmpType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {allEmpTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <Switch checked={remoteOnly} onCheckedChange={setRemoteOnly} />
            <span className="flex items-center gap-1 text-muted-foreground">
              <Video className="h-3.5 w-3.5" /> Remote
            </span>
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            {jobs.length} jobs
          </span>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <JobsEmptyState onReset={resetFilters} />
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((j) => (
            <JobCard key={j.id} job={j} onView={() => setSelected(j)} />
          ))}
        </div>
      )}

      <JobApplicationDialog job={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function JobCard({ job, onView }: { job: JobPostingT; onView: () => void }) {
  const licenses = splitCsv(job.requiredLicenses);
  const specialties = splitCsv(job.treatmentSpecialties);
  const comp = formatComp(job.compMin, job.compMax);

  return (
    <Card className="gap-0 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {job.clinicName}
      </p>
      <h3 className="mt-1 text-base font-semibold leading-tight text-foreground">
        {job.title}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {job.city}, {job.state}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" /> {job.employmentType}
        </span>
        {job.remote && <StatusPill tone="sky">Remote</StatusPill>}
      </div>

      {licenses.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {licenses.map((l) => (
            <Badge
              key={l}
              variant="outline"
              className="border-border bg-muted/40 text-xs text-foreground/80"
            >
              {l}
            </Badge>
          ))}
        </div>
      )}

      {specialties.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {specialties.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="border-teal-200 bg-teal-50/50 text-xs text-teal-700"
            >
              {s}
            </Badge>
          ))}
        </div>
      )}

      {comp && (
        <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
          <DollarSign className="h-4 w-4" /> {comp}
        </div>
      )}

      {job.schedule && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" /> {job.schedule}
        </div>
      )}

      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{job.description}</p>

      <div className="mt-4 flex gap-2 border-t pt-4">
        <Button
          size="sm"
          className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
          onClick={onView}
        >
          View &amp; Apply <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={onView}>
          Details
        </Button>
      </div>
    </Card>
  );
}

function JobsEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
      <Briefcase className="h-8 w-8 text-muted-foreground/60" />
      <h3 className="mt-3 text-base font-semibold">No jobs match your filters</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try widening your filters or clearing them to see more open roles in the
        network.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* 5. Job Application Dialog                                               */
/* ----------------------------------------------------------------------- */

type ApplicationForm = {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  coverNote: string;
  consent: boolean;
};

const EMPTY_FORM: ApplicationForm = {
  applicantName: "",
  applicantEmail: "",
  applicantPhone: "",
  coverNote: "",
  consent: false,
};

function JobApplicationDialog({
  job,
  onClose,
}: {
  job: JobPostingT | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ApplicationForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const licenses = job ? splitCsv(job.requiredLicenses) : [];
  const specialties = job ? splitCsv(job.treatmentSpecialties) : [];
  const comp = job ? formatComp(job.compMin, job.compMax) : null;

  function close() {
    onClose();
    // Reset after the close animation finishes so users see a clean form next time.
    setTimeout(() => {
      setForm(EMPTY_FORM);
      setDone(false);
      setSubmitting(false);
    }, 200);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!job) return;
    if (!form.consent) {
      toast.error("Please acknowledge the platform disclosure to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/job-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostingId: job.id,
          applicantName: form.applicantName,
          applicantEmail: form.applicantEmail,
          applicantPhone: form.applicantPhone || null,
          coverNote: form.coverNote || null,
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      toast.success("Application submitted. The clinic will reach out if there is a fit.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={!!job}
      onOpenChange={(v) => {
        if (!v) close();
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {job && (
          <>
            <DialogHeader>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {job.clinicName}
              </p>
              <DialogTitle className="text-xl">{job.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {job.city}, {job.state}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> {job.employmentType}
                </span>
                {job.remote && <StatusPill tone="sky">Remote</StatusPill>}
              </DialogDescription>
            </DialogHeader>

            {/* Job summary */}
            <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
              {comp && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-700" />
                  <span className="font-semibold text-emerald-700">{comp}</span>
                </div>
              )}
              {job.schedule && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> {job.schedule}
                </div>
              )}
              {job.requiredExperience && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> {job.requiredExperience}
                </div>
              )}
              {job.remote && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Video className="h-4 w-4 text-teal-600" /> Remote available
                </div>
              )}
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">{job.description}</p>

            {licenses.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Required licenses
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {licenses.map((l) => (
                    <Badge
                      key={l}
                      variant="outline"
                      className="border-border bg-muted/40 text-xs text-foreground/80"
                    >
                      {l}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {specialties.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Treatment specialties
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {specialties.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="border-teal-200 bg-teal-50/50 text-xs text-teal-700"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Application form / success */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-5">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-teal-700" />
                <h4 className="text-sm font-semibold text-foreground">Apply for this role</h4>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Your application is sent to the hiring clinic. Novalyte AI is a
                technology platform and does not employ or supervise providers.
              </p>

              {!done ? (
                <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="ja-name" className="text-xs">
                      Full name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="ja-name"
                      required
                      placeholder="Jane Doe"
                      value={form.applicantName}
                      onChange={(e) =>
                        setForm({ ...form, applicantName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="ja-email" className="text-xs">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="ja-email"
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={form.applicantEmail}
                      onChange={(e) =>
                        setForm({ ...form, applicantEmail: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="ja-phone" className="text-xs">
                      Phone <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="ja-phone"
                      placeholder="(555) 123-4567"
                      value={form.applicantPhone}
                      onChange={(e) =>
                        setForm({ ...form, applicantPhone: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="ja-note" className="text-xs">
                      Cover note <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Textarea
                      id="ja-note"
                      rows={3}
                      placeholder="Why are you a strong fit for this role?"
                      value={form.coverNote}
                      onChange={(e) =>
                        setForm({ ...form, coverNote: e.target.value })
                      }
                    />
                  </div>
                  <label className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) =>
                        setForm({ ...form, consent: e.target.checked })
                      }
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
                  <DialogFooter className="sm:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={close}
                      disabled={submitting}
                    >
                      Cancel
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
                  </DialogFooter>
                </form>
              ) : (
                <div className="mt-4 flex flex-col items-center gap-2 py-6 text-center">
                  <CheckCircle2 className="h-10 w-10 text-teal-600" />
                  <p className="text-sm font-semibold text-foreground">
                    Application submitted
                  </p>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    Your application for <span className="font-medium">{job.title}</span> at{" "}
                    {job.clinicName} has been received. The clinic will reach out if
                    there is a fit.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={close}>
                    Close
                  </Button>
                </div>
              )}
            </div>

            <DisclaimerBanner tone="muted">
              Applications are routed to the hiring clinic. Novalyte AI does not
              verify candidate credentials on behalf of clinics.
            </DisclaimerBanner>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
