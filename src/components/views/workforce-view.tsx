"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { CTASection } from "@/components/shared/cta";
import {
  PremiumCard,
  MetaRow,
  StatCard,
  CardSkeleton,
  EmptyState,
  FilterChip,
  ViewToggle,
  SaveButton,
  Breadcrumbs,
  SectionDivider,
} from "@/components/shared/enterprise";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  splitCsv,
  colorClasses,
  initials,
  US_STATES,
} from "@/lib/constants";
import type { ProfessionalT, JobPostingT } from "@/lib/types";
import { navigate, useSaved } from "@/lib/nav";
import { cn } from "@/lib/utils";
import {
  Users,
  MapPin,
  Briefcase,
  CheckCircle2,
  Video,
  ArrowRight,
  Stethoscope,
  Clock,
  CalendarDays,
  DollarSign,
  Award,
  ShieldCheck,
  UserCheck,
  BriefcaseBusiness,
  ListChecks,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Star,
  Building2,
  Sparkles,
  GraduationCap,
  Banknote,
  HeartPulse,
  FileText,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Shared helpers
   ──────────────────────────────────────────────────────────────── */

const AVATAR_COLORS = ["teal", "emerald", "sky", "violet", "amber"] as const;

function avatarColor(index: number) {
  const key = AVATAR_COLORS[index % AVATAR_COLORS.length];
  // colorClasses() exposes "blue" mapped to sky tones; treat "sky" as blue.
  return colorClasses(key === "sky" ? "blue" : key);
}

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

const COMP_RANGES = [
  { value: "all", label: "All compensation" },
  { value: "0-50", label: "$0 – $50k" },
  { value: "50-100", label: "$50k – $100k" },
  { value: "100-150", label: "$100k – $150k" },
  { value: "150+", label: "$150k+" },
] as const;

function inCompRange(min: number | null, max: number | null, range: string): boolean {
  if (range === "all") return true;
  // Job with no compensation data is excluded when a range is selected.
  if (min == null && max == null) return false;
  const jMin = min ?? 0;
  const jMax = max ?? Number.POSITIVE_INFINITY;
  const [loStr, hiStr] = range.split("-");
  const lo = Number(loStr) * 1000;
  const hi = hiStr === "" ? Number.POSITIVE_INFINITY : Number(hiStr) * 1000;
  return jMin <= hi && jMax >= lo;
}

const PAGE_SIZE = 10;

/* ────────────────────────────────────────────────────────────────
   Page-level view
   ──────────────────────────────────────────────────────────────── */

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
            Novalyte AI connects men&apos;s health clinics with qualified Physicians,
            Nurse Practitioners, Physician Assistants, Registered Nurses, Medical
            Assistants, Phlebotomists, Medical Directors, Patient Coordinators,
            Telehealth professionals, Compliance specialists, Clinic administrators,
            and Revenue Cycle specialists. Browse verified professionals and open
            roles, then start a structured introduction through the platform.
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

          {/* Qualitative trust indicators (no fake numbers) */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TrustItem
              icon={ShieldCheck}
              label="Verified credential flow"
              sub="Structured licensure & verification capture"
            />
            <TrustItem
              icon={MapPin}
              label="Multi-state licensure matching"
              sub="Align candidates with clinic geographies"
            />
            <TrustItem
              icon={Building2}
              label="Direct clinic applications"
              sub="Applications route to the hiring clinic"
            />
            <TrustItem
              icon={HeartPulse}
              label="Men&apos;s-health specialties"
              sub="TRT, hormones, weight loss, longevity & more"
            />
          </div>
        </div>
      </section>

      {/* 2 + 3 + 4. Tabs with Jobs & Professionals */}
      <SectionShell className="!pt-10">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="h-auto">
            <TabsTrigger value="jobs" className="gap-1.5 px-4 py-1.5">
              <Briefcase className="h-4 w-4" /> Browse Jobs
            </TabsTrigger>
            <TabsTrigger value="professionals" className="gap-1.5 px-4 py-1.5">
              <Users className="h-4 w-4" /> Browse Professionals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-6">
            <JobsPanel jobs={jobs} />
          </TabsContent>

          <TabsContent value="professionals" className="mt-6">
            <ProfessionalsPanel professionals={professionals} />
          </TabsContent>
        </Tabs>
      </SectionShell>

      {/* 5. Matching logic */}
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
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 shadow-premium-xs"
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

      {/* 6. Disclaimer */}
      <SectionShell tone="default" className="!pt-0 !pb-12">
        <DisclaimerBanner tone="amber">
          Novalyte AI facilitates discovery and communication. Clinics remain
          responsible for background checks, credential verification, licensing
          confirmation, employment compliance, clinical supervision, and hiring
          decisions.
        </DisclaimerBanner>
      </SectionShell>

      {/* 7. CTA */}
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

function TrustItem({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card/80 p-3.5 shadow-premium-xs backdrop-blur-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   3. Browse Jobs (flagship job board)
   ──────────────────────────────────────────────────────────────── */

type JobFilters = {
  query: string;
  state: string;
  empType: string;
  remoteOnly: boolean;
  compRange: string;
  license: string;
  specialty: string;
};

const DEFAULT_JOB_FILTERS: JobFilters = {
  query: "",
  state: "all",
  empType: "all",
  remoteOnly: false,
  compRange: "all",
  license: "all",
  specialty: "all",
};

type JobSort = "relevant" | "newest" | "comp-high" | "comp-low";

const JOB_SORTS: { value: JobSort; label: string }[] = [
  { value: "relevant", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "comp-high", label: "Compensation: high to low" },
  { value: "comp-low", label: "Compensation: low to high" },
];

function JobsPanel({ jobs }: { jobs: JobPostingT[] }) {
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_JOB_FILTERS);
  const [sort, setSort] = useState<JobSort>("relevant");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // 300ms simulated loading skeleton — clears via setTimeout when
  // filters/sort/view change. setLoading(true) is fired synchronously
  // in the change handlers below; the effect schedules the clear.
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 300);
    return () => window.clearTimeout(t);
  }, [filters, sort, view]);

  function applyFilter(patch: Partial<JobFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
    setLoading(true);
  }

  function applySort(v: JobSort) {
    setSort(v);
    setPage(1);
    setLoading(true);
  }

  function applyView(v: "grid" | "list") {
    setView(v);
    setLoading(true);
  }

  function clearAll() {
    setFilters(DEFAULT_JOB_FILTERS);
    setPage(1);
    setLoading(true);
  }

  const update = applyFilter;

  // Derived filter options
  const allEmpTypes = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => set.add(j.employmentType));
    return Array.from(set).sort();
  }, [jobs]);

  const allLicenses = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => splitCsv(j.requiredLicenses).forEach((l) => set.add(l)));
    return Array.from(set).sort();
  }, [jobs]);

  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => splitCsv(j.treatmentSpecialties).forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [jobs]);

  // Filtered + sorted results
  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const out = jobs.filter((j) => {
      if (q) {
        const hay = `${j.title} ${j.clinicName} ${j.city} ${j.state} ${j.description} ${j.treatmentSpecialties ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.state !== "all" && j.state !== filters.state) return false;
      if (filters.empType !== "all" && j.employmentType !== filters.empType) return false;
      if (filters.remoteOnly && !j.remote) return false;
      if (!inCompRange(j.compMin, j.compMax, filters.compRange)) return false;
      if (filters.license !== "all") {
        const ls = splitCsv(j.requiredLicenses);
        if (!ls.includes(filters.license)) return false;
      }
      if (filters.specialty !== "all") {
        const ss = splitCsv(j.treatmentSpecialties);
        if (!ss.includes(filters.specialty)) return false;
      }
      return true;
    });

    // Sort
    const sorted = [...out];
    if (sort === "comp-high") {
      sorted.sort((a, b) => (b.compMax ?? b.compMin ?? 0) - (a.compMax ?? a.compMin ?? 0));
    } else if (sort === "comp-low") {
      sorted.sort((a, b) => (a.compMin ?? a.compMax ?? Number.POSITIVE_INFINITY) - (b.compMin ?? b.compMax ?? Number.POSITIVE_INFINITY));
    }
    // "newest" and "relevant" both use the natural order from the DB (createdAt desc)
    return sorted;
  }, [jobs, filters, sort]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Active filter chips
  const chips = useMemo(() => {
    const arr: { label: string; clear: () => void }[] = [];
    if (filters.query.trim()) {
      arr.push({ label: `“${filters.query.trim()}”`, clear: () => applyFilter({ query: "" }) });
    }
    if (filters.state !== "all") {
      arr.push({ label: `State: ${filters.state}`, clear: () => applyFilter({ state: "all" }) });
    }
    if (filters.empType !== "all") {
      arr.push({ label: filters.empType, clear: () => applyFilter({ empType: "all" }) });
    }
    if (filters.remoteOnly) {
      arr.push({ label: "Remote only", clear: () => applyFilter({ remoteOnly: false }) });
    }
    if (filters.compRange !== "all") {
      const r = COMP_RANGES.find((c) => c.value === filters.compRange);
      arr.push({ label: r?.label ?? "Comp", clear: () => applyFilter({ compRange: "all" }) });
    }
    if (filters.license !== "all") {
      arr.push({ label: `License: ${filters.license}`, clear: () => applyFilter({ license: "all" }) });
    }
    if (filters.specialty !== "all") {
      arr.push({ label: filters.specialty, clear: () => applyFilter({ specialty: "all" }) });
    }
    return arr;
  }, [filters]);

  const filtersNode = (
    <JobFiltersContent
      filters={filters}
      update={update}
      allEmpTypes={allEmpTypes}
      allLicenses={allLicenses}
      allSpecialties={allSpecialties}
    />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto novalyte-scroll rounded-2xl border border-border bg-card p-5 shadow-premium-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            {chips.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
          {filtersNode}
        </div>
      </aside>

      <div>
        {/* Mobile filters + Sort + View toggle row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {chips.length > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[11px] font-semibold text-white">
                    {chips.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88%] max-w-sm overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                {filtersNode}
                <div className="mt-5 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={clearAll}>
                    Clear all
                  </Button>
                  <Button
                    className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
                    onClick={() => setSheetOpen(false)}
                  >
                    Show {filtered.length} results
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-2">
            <Select value={sort} onValueChange={(v) => applySort(v as JobSort)}>
              <SelectTrigger size="sm" className="h-9 w-[180px] gap-1.5 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ViewToggle
              value={view}
              onChange={(v) => applyView(v as "grid" | "list")}
              options={[
                { value: "grid", label: "Grid", icon: LayoutGrid },
                { value: "list", label: "List", icon: List },
              ]}
            />
          </div>
        </div>

        {/* Desktop sort + view row */}
        <div className="mb-4 hidden items-center justify-between gap-3 lg:flex">
          <Select value={sort} onValueChange={(v) => applySort(v as JobSort)}>
            <SelectTrigger className="h-9 w-[220px] gap-1.5 text-xs">
              <span className="text-muted-foreground">Sort:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ViewToggle
            value={view}
            onChange={(v) => applyView(v as "grid" | "list")}
            options={[
              { value: "grid", label: "Grid", icon: LayoutGrid },
              { value: "list", label: "List", icon: List },
            ]}
          />
        </div>

        {/* Applied filter chips */}
        {chips.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {chips.map((c, i) => (
              <FilterChip key={i} label={c.label} onRemove={c.clear} />
            ))}
            <button
              onClick={clearAll}
              className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results header */}
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">{pageItems.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            opportunities
          </p>
        </div>

        {/* Results */}
        {loading ? (
          <div className={cn("grid gap-4", view === "grid" ? "md:grid-cols-2" : "grid-cols-1")}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs match your filters"
            description="Try widening your filters or clearing them to see more open roles in the network."
            action={
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div
            key={`${currentPage}-${view}`}
            className={cn(
              "grid gap-4 novalyte-fade-up",
              view === "grid" ? "md:grid-cols-2" : "grid-cols-1",
            )}
          >
            {pageItems.map((j, idx) => (
              <JobCard
                key={j.id}
                job={j}
                index={idx}
                featured={sort === "relevant" && idx < 2}
                layout={view}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {buildPageList(currentPage, totalPages).map((p, i) =>
                  p === "…" ? (
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}

function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

function JobFiltersContent({
  filters,
  update,
  allEmpTypes,
  allLicenses,
  allSpecialties,
}: {
  filters: JobFilters;
  update: (patch: Partial<JobFilters>) => void;
  allEmpTypes: string[];
  allLicenses: string[];
  allSpecialties: string[];
}) {
  return (
    <div className="space-y-4">
      {/* Keyword search */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Keyword</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Title, clinic, or skill"
            value={filters.query}
            onChange={(e) => update({ query: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      <Separator />

      {/* State */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">State</Label>
        <Select value={filters.state} onValueChange={(v) => update({ state: v })}>
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

      {/* Employment type */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Employment type</Label>
        <Select value={filters.empType} onValueChange={(v) => update({ empType: v })}>
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

      {/* Compensation range */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Compensation</Label>
        <Select value={filters.compRange} onValueChange={(v) => update({ compRange: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMP_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Required license */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Required license</Label>
        <Select value={filters.license} onValueChange={(v) => update({ license: v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any license" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any license</SelectItem>
            {allLicenses.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Treatment specialty */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Treatment specialty</Label>
        <Select value={filters.specialty} onValueChange={(v) => update({ specialty: v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any specialty</SelectItem>
            {allSpecialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Remote only */}
      <label className="flex items-center justify-between gap-2 cursor-pointer">
        <span className="flex items-center gap-1.5 text-sm text-foreground">
          <Video className="h-3.5 w-3.5 text-muted-foreground" />
          Remote only
        </span>
        <Switch checked={filters.remoteOnly} onCheckedChange={(v) => update({ remoteOnly: v })} />
      </label>
    </div>
  );
}

function JobCard({
  job,
  index,
  featured,
  layout,
}: {
  job: JobPostingT;
  index: number;
  featured: boolean;
  layout: "grid" | "list";
}) {
  const licenses = splitCsv(job.requiredLicenses);
  const specialties = splitCsv(job.treatmentSpecialties);
  const appReqs = splitCsv(job.applicationRequirements);
  const comp = formatComp(job.compMin, job.compMax);

  const saved = useSaved((s) => s.jobs.includes(job.id));
  const toggle = useSaved((s) => s.toggle);

  function openDetail() {
    navigate("job-detail", undefined, { id: job.id });
  }

  return (
    <PremiumCard hover className="flex h-full flex-col p-5" as="article">
      {/* Top row: clinic name + badges + save */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {job.clinicName}
          </p>
          {featured && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {featured && (
            <StatusPill tone="emerald">
              <ShieldCheck className="h-3 w-3" /> Verified employer
            </StatusPill>
          )}
          <SaveButton
            size="sm"
            saved={saved}
            onToggle={() => toggle("job", job.id)}
          />
        </div>
      </div>

      {/* Title */}
      <button
        onClick={openDetail}
        className="mt-2 text-left transition hover:text-teal-700"
      >
        <h3 className="text-base font-semibold leading-tight text-foreground sm:text-lg">
          {job.title}
        </h3>
      </button>

      {/* Location + employment + remote pill */}
      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {job.city}, {job.state}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" /> {job.employmentType}
        </span>
        <RemotePill remote={job.remote} />
      </div>

      {/* Compensation (prominent) */}
      <div className="mt-3 flex items-center gap-1.5">
        <Banknote className="h-4 w-4 text-emerald-600" />
        {comp ? (
          <span className="text-sm font-semibold text-emerald-700">{comp}</span>
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">Competitive</span>
        )}
      </div>

      {/* Specialties (outline badges) */}
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

      {/* Required licenses (small badges) */}
      {licenses.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
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

      {/* Description */}
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {job.description}
      </p>

      {/* Schedule */}
      {job.schedule && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" /> {job.schedule}
        </div>
      )}

      <div className="mt-auto" />

      {/* Footer row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
        {job.requiredExperience && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {job.requiredExperience}
          </span>
        )}
        {appReqs.length > 0 && (
          <span className="flex items-center gap-1">
            <ListChecks className="h-3.5 w-3.5" /> {appReqs.length} application requirement{appReqs.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
          onClick={openDetail}
        >
          Apply now <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={openDetail}>
          View details
        </Button>
      </div>
      {/* `index` is used to give the avatar/cyclic colors a stable offset for `list` view */}
      {layout === "list" && <span className="sr-only">card {index + 1}</span>}
    </PremiumCard>
  );
}

function RemotePill({ remote }: { remote: boolean }) {
  if (remote) return <StatusPill tone="teal">Remote</StatusPill>;
  return <StatusPill tone="muted">On-site</StatusPill>;
}

/* ────────────────────────────────────────────────────────────────
   4. Browse Professionals
   ──────────────────────────────────────────────────────────────── */

type ProFilters = {
  query: string;
  state: string;
  title: string;
  remoteOnly: boolean;
  verifiedOnly: boolean;
  specialty: string;
};

const DEFAULT_PRO_FILTERS: ProFilters = {
  query: "",
  state: "all",
  title: "all",
  remoteOnly: false,
  verifiedOnly: false,
  specialty: "all",
};

type ProSort = "relevant" | "exp-high" | "verified-first";

const PRO_SORTS: { value: ProSort; label: string }[] = [
  { value: "relevant", label: "Most relevant" },
  { value: "exp-high", label: "Years experience: high to low" },
  { value: "verified-first", label: "Verified first" },
];

function ProfessionalsPanel({ professionals }: { professionals: ProfessionalT[] }) {
  const [filters, setFilters] = useState<ProFilters>(DEFAULT_PRO_FILTERS);
  const [sort, setSort] = useState<ProSort>("relevant");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState<ProfessionalT | null>(null);

  // 300ms simulated loading skeleton — clears via setTimeout when
  // filters/sort change. setLoading(true) is fired synchronously in
  // the change handlers below; the effect schedules the clear.
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 300);
    return () => window.clearTimeout(t);
  }, [filters, sort]);

  function applyFilter(patch: Partial<ProFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
    setLoading(true);
  }

  function applySort(v: ProSort) {
    setSort(v);
    setPage(1);
    setLoading(true);
  }

  function clearAll() {
    setFilters(DEFAULT_PRO_FILTERS);
    setPage(1);
    setLoading(true);
  }

  const update = applyFilter;

  const allTitles = useMemo(() => {
    const set = new Set<string>();
    professionals.forEach((p) => set.add(p.title));
    return Array.from(set).sort();
  }, [professionals]);

  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    professionals.forEach((p) => splitCsv(p.specialties).forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [professionals]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const out = professionals.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.title} ${p.city} ${p.state} ${p.bio ?? ""} ${p.specialties ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.state !== "all" && p.state !== filters.state) return false;
      if (filters.title !== "all" && p.title !== filters.title) return false;
      if (filters.remoteOnly && !p.remote) return false;
      if (filters.verifiedOnly && !p.verified) return false;
      if (filters.specialty !== "all") {
        const ss = splitCsv(p.specialties);
        if (!ss.includes(filters.specialty)) return false;
      }
      return true;
    });

    const sorted = [...out];
    if (sort === "exp-high") {
      sorted.sort((a, b) => b.yearsExperience - a.yearsExperience);
    } else if (sort === "verified-first") {
      sorted.sort((a, b) => Number(b.verified) - Number(a.verified));
    }
    return sorted;
  }, [professionals, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const chips = useMemo(() => {
    const arr: { label: string; clear: () => void }[] = [];
    if (filters.query.trim()) {
      arr.push({ label: `“${filters.query.trim()}”`, clear: () => applyFilter({ query: "" }) });
    }
    if (filters.state !== "all") {
      arr.push({ label: `State: ${filters.state}`, clear: () => applyFilter({ state: "all" }) });
    }
    if (filters.title !== "all") {
      arr.push({ label: filters.title, clear: () => applyFilter({ title: "all" }) });
    }
    if (filters.remoteOnly) {
      arr.push({ label: "Remote only", clear: () => applyFilter({ remoteOnly: false }) });
    }
    if (filters.verifiedOnly) {
      arr.push({ label: "Verified only", clear: () => applyFilter({ verifiedOnly: false }) });
    }
    if (filters.specialty !== "all") {
      arr.push({ label: filters.specialty, clear: () => applyFilter({ specialty: "all" }) });
    }
    return arr;
  }, [filters]);

  const filtersNode = (
    <ProFiltersContent
      filters={filters}
      update={update}
      allTitles={allTitles}
      allSpecialties={allSpecialties}
    />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto novalyte-scroll rounded-2xl border border-border bg-card p-5 shadow-premium-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            {chips.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
          {filtersNode}
        </div>
      </aside>

      <div>
        {/* Mobile filter + sort row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {chips.length > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[11px] font-semibold text-white">
                    {chips.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88%] max-w-sm overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                {filtersNode}
                <div className="mt-5 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={clearAll}>
                    Clear all
                  </Button>
                  <Button
                    className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
                    onClick={() => setSheetOpen(false)}
                  >
                    Show {filtered.length} results
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="ml-auto">
            <Select value={sort} onValueChange={(v) => applySort(v as ProSort)}>
              <SelectTrigger className="h-9 w-[200px] gap-1.5 text-xs sm:w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRO_SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop sort row */}
        <div className="mb-4 hidden items-center justify-between gap-3 lg:flex">
          <Select value={sort} onValueChange={(v) => applySort(v as ProSort)}>
            <SelectTrigger className="h-9 w-[240px] gap-1.5 text-xs">
              <span className="text-muted-foreground">Sort:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRO_SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Applied filter chips */}
        {chips.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {chips.map((c, i) => (
              <FilterChip key={i} label={c.label} onRemove={c.clear} />
            ))}
            <button
              onClick={clearAll}
              className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results header */}
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">{pageItems.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            professionals
          </p>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No professionals match your filters"
            description="Try widening your filters or clearing them to see more professionals in the network."
            action={
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div
            key={currentPage}
            className="grid gap-4 novalyte-fade-up md:grid-cols-2 lg:grid-cols-3"
          >
            {pageItems.map((p, idx) => (
              <ProfessionalCard
                key={p.id}
                professional={p}
                index={idx}
                onView={() => setProfileOpen(p)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {buildPageList(currentPage, totalPages).map((p, i) =>
                  p === "…" ? (
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Profile dialog */}
      <ProfessionalProfileDialog
        professional={profileOpen}
        onClose={() => setProfileOpen(null)}
      />
    </div>
  );
}

function ProFiltersContent({
  filters,
  update,
  allTitles,
  allSpecialties,
}: {
  filters: ProFilters;
  update: (patch: Partial<ProFilters>) => void;
  allTitles: string[];
  allSpecialties: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Keyword</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Name, title, or specialty"
            value={filters.query}
            onChange={(e) => update({ query: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      <Separator />

      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">State</Label>
        <Select value={filters.state} onValueChange={(v) => update({ state: v })}>
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
        <Label className="text-xs font-medium text-muted-foreground">Title</Label>
        <Select value={filters.title} onValueChange={(v) => update({ title: v })}>
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

      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Specialty</Label>
        <Select value={filters.specialty} onValueChange={(v) => update({ specialty: v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any specialty</SelectItem>
            {allSpecialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <label className="flex items-center justify-between gap-2 cursor-pointer">
        <span className="flex items-center gap-1.5 text-sm text-foreground">
          <Video className="h-3.5 w-3.5 text-muted-foreground" />
          Remote only
        </span>
        <Switch checked={filters.remoteOnly} onCheckedChange={(v) => update({ remoteOnly: v })} />
      </label>

      <label className="flex items-center justify-between gap-2 cursor-pointer">
        <span className="flex items-center gap-1.5 text-sm text-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
          Verified only
        </span>
        <Switch checked={filters.verifiedOnly} onCheckedChange={(v) => update({ verifiedOnly: v })} />
      </label>
    </div>
  );
}

function ProfessionalCard({
  professional,
  index,
  onView,
}: {
  professional: ProfessionalT;
  index: number;
  onView: () => void;
}) {
  const c = avatarColor(index);
  const licensedStates = splitCsv(professional.licensedStates);
  const specialties = splitCsv(professional.specialties).slice(0, 3);

  return (
    <PremiumCard hover className="flex h-full flex-col p-5" as="article">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
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
                className="border-teal-200 bg-teal-50/50 text-xs font-medium text-teal-700"
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
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {professional.bio}
        </p>
      )}

      <div className="mt-auto" />

      <div className="mt-4 border-t border-border pt-4">
        <Button size="sm" variant="outline" className="w-full" onClick={onView}>
          View profile
        </Button>
      </div>
    </PremiumCard>
  );
}

function ProfessionalProfileDialog({
  professional,
  onClose,
}: {
  professional: ProfessionalT | null;
  onClose: () => void;
}) {
  const licensedStates = professional ? splitCsv(professional.licensedStates) : [];
  const specialties = professional ? splitCsv(professional.specialties) : [];
  const certifications = professional ? splitCsv(professional.certifications) : [];

  return (
    <Dialog
      open={!!professional}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {professional && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                    avatarColor(
                      // Stable color based on name length so the dialog matches the card
                      professional.name.length % AVATAR_COLORS.length,
                    ).bg,
                  )}
                >
                  {initials(professional.name)}
                </span>
                <div className="min-w-0">
                  <DialogTitle className="text-xl">{professional.name}</DialogTitle>
                  <DialogDescription className="flex flex-wrap items-center gap-2">
                    <span>{professional.title}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {professional.city}, {professional.state}
                    </span>
                    {professional.remote && <StatusPill tone="sky">Remote</StatusPill>}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex items-center gap-2">
              <VerificationBadge verified={professional.verified} />
              <StatusPill tone="teal">
                <Clock className="h-3 w-3" /> {professional.yearsExperience} yrs experience
              </StatusPill>
              <StatusPill tone="emerald">
                <CalendarDays className="h-3 w-3" /> {professional.availability}
              </StatusPill>
            </div>

            {professional.bio && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  About
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {professional.bio}
                </p>
              </div>
            )}

            <MetaRow
              columns={3}
              items={[
                { label: "Experience", value: `${professional.yearsExperience} yrs`, icon: Clock },
                { label: "Availability", value: professional.availability, icon: CalendarDays },
                { label: "Employment pref", value: professional.employmentPref, icon: Briefcase },
              ]}
            />

            {licensedStates.length > 0 && (
              <div>
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
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Specialties
                </p>
                <div className="flex flex-wrap gap-1.5">
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
              </div>
            )}

            {certifications.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Certifications
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {certifications.map((s) => (
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

            <DisclaimerBanner tone="muted">
              Novalyte AI is a technology platform and does not verify credentials on
              behalf of clinics. Confirm licensure and background directly before
              engaging any professional.
            </DisclaimerBanner>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
