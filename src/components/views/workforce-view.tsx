"use client";

import { useEffect, useTransition, useMemo, useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { StatusPill, CheckItem } from "@/components/shared/badges";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { SmartImage } from "@/components/shared/smart-image";
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
} from "@/components/shared/enterprise";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Award,
  ShieldCheck,
  UserCheck,
  BriefcaseBusiness,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Building2,
  Banknote,
  HeartPulse,
  FileText,
  Activity,
  TrendingUp,
  Rocket,
  CalendarClock,
  GraduationCap,
  Cog,
  HeartHandshake,
  Microscope,
  Brain,
  Laptop,
  Wallet,
  BarChart3,
  Mail,
  Eye,
  Bookmark,
  Phone,
  Lock,
  Globe,
  BadgeCheck,
  ClipboardList,
  Circle,
  Plus,
  Star,
  ClipboardCheck,
  FileCheck,
  FolderOpen,
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

const COMP_RANGES = [
  { value: "all", label: "All compensation" },
  { value: "0-50", label: "$0 – $50k" },
  { value: "50-100", label: "$50k – $100k" },
  { value: "100-150", label: "$100k – $150k" },
  { value: "150+", label: "$150k+" },
] as const;

function inCompRange(min: number | null, max: number | null, range: string): boolean {
  if (range === "all") return true;
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
   Static config: ecosystem flow, workforce models, categories,
   professional + employer capabilities, matching factors, trust
   ──────────────────────────────────────────────────────────────── */

const ECOSYSTEM_STAGES = [
  {
    step: "01",
    title: "Patient Demand",
    desc: "Patients discover care options through content, assessments, and the clinic directory.",
    icon: HeartPulse,
  },
  {
    step: "02",
    title: "Clinic & Provider Growth",
    desc: "Verified clinics receive structured intake and scale operations to meet demand.",
    icon: TrendingUp,
  },
  {
    step: "03",
    title: "Workforce Capacity",
    desc: "Clinical and operational roles are posted and matched against credentialed talent.",
    icon: Users,
  },
  {
    step: "04",
    title: "Operational Enablement",
    desc: "Marketplace vendors, software, and services complete the operational picture.",
    icon: Cog,
  },
] as const;

const WORKFORCE_MODELS = [
  {
    title: "Permanent Hiring",
    desc: "Full-time and part-time roles across clinical, administrative, and operational functions, including leadership and director-level positions.",
    icon: BriefcaseBusiness,
    points: ["Full-time", "Part-time", "Permanent clinical / admin / ops", "Leadership & directors"],
  },
  {
    title: "Contract & Flexible Work",
    desc: "Contract, temporary, per-diem, locum, and project-based engagements, including remote and telehealth-supported roles.",
    icon: CalendarClock,
    points: ["Contract", "Temporary", "Per-diem & locum", "Project-based", "Remote & telehealth"],
  },
  {
    title: "Capacity Expansion",
    desc: "Bring on additional capacity when patient volume increases, a new location opens, a new service line launches, or coverage gaps appear.",
    icon: Rocket,
    points: ["Patient-volume growth", "New location", "New service line", "Staff overload", "Seasonal demand", "Temporary coverage"],
  },
] as const;

const HEALTHCARE_CATEGORIES = [
  {
    name: "Clinical Care",
    icon: Stethoscope,
    keyword: "Nurse",
    examples: ["Physician", "Nurse Practitioner", "PA", "Registered Nurse", "Medical Assistant"],
  },
  {
    name: "Allied Health",
    icon: HeartHandshake,
    keyword: "Therapist",
    examples: ["Phlebotomist", "Therapist", "Technologist", "MA", "Technician"],
  },
  {
    name: "Behavioral Health",
    icon: Brain,
    keyword: "Behavioral",
    examples: ["Therapist", "Counselor", "Social Worker", "Psychiatric Provider"],
  },
  {
    name: "Operations & Administration",
    icon: ClipboardList,
    keyword: "Administrator",
    examples: ["Clinic Administrator", "Operations Manager", "Coordinator", "Office Manager"],
  },
  {
    name: "Revenue Cycle",
    icon: Wallet,
    keyword: "Revenue",
    examples: ["Revenue Cycle Specialist", "Medical Biller", "Coder", "Claims Specialist"],
  },
  {
    name: "Healthcare Technology",
    icon: Laptop,
    keyword: "Technology",
    examples: ["Health IT Analyst", "EHR Specialist", "Implementation Manager", "Data Analyst"],
  },
  {
    name: "Specialty Care",
    icon: Microscope,
    keyword: "Specialty",
    examples: ["Men's Health", "Hormone & TRT", "Weight Management", "Longevity Medicine"],
  },
] as const;

const PRO_CAPABILITIES = [
  "Create a professional account",
  "Add your title, summary, and specialties",
  "Upload your resume and link your LinkedIn",
  "Capture licenses, certifications, and credentials",
  "List your specialties, skills, and care settings",
  "Set employment preferences and availability",
  "Apply to permanent, contract, and flexible roles",
  "Track applications across hiring stages",
  "Receive recommendations as new roles post",
  "Control your profile visibility",
] as const;

const FLEXIBLE_OPTIONS = [
  "Temporary coverage",
  "Contract assignments",
  "Per-diem shifts",
  "Part-time roles",
  "Remote opportunities",
  "Telehealth visits",
  "Project-based work",
  "Short-term coverage",
  "Permanent placement",
] as const;

const EMPLOYER_CAPABILITIES = [
  "Create an organization account",
  "Build a verified organization profile",
  "Complete organization verification",
  "Publish permanent, contract, temporary, or flexible roles",
  "Review and manage applicants",
  "Configure hiring stages and pipeline views",
  "Maintain an active talent pipeline",
  "Receive candidate recommendations",
  "Track listing performance and engagement",
  "Coordinate multi-location hiring",
] as const;

const MATCHING_FACTORS: { label: string; icon: React.ElementType }[] = [
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
  { label: "Assignment duration", icon: CalendarClock },
  { label: "Start date", icon: CalendarDays },
  { label: "Shift", icon: Clock },
  { label: "Compensation", icon: Banknote },
  { label: "Organization type", icon: Building2 },
  { label: "Care setting", icon: HeartPulse },
  { label: "Travel radius", icon: MapPin },
];

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Employer verification",
    desc: "Organizations complete verification before listings are surfaced broadly.",
  },
  {
    icon: BadgeCheck,
    title: "Credential-aware profiles",
    desc: "Profiles capture licenses, certifications, and specialties in a structured format.",
  },
  {
    icon: Lock,
    title: "Secure document handling",
    desc: "Resumes and credentials are handled with privacy-conscious infrastructure.",
  },
  {
    icon: UserCheck,
    title: "Candidate privacy",
    desc: "Professionals control what is visible to employers and when.",
  },
  {
    icon: Eye,
    title: "Profile visibility controls",
    desc: "Availability and contact preferences are managed by the candidate.",
  },
  {
    icon: ClipboardCheck,
    title: "Listing review & fraud reporting",
    desc: "Listings are reviewed and any user can flag a posting for review.",
  },
] as const;

/* ────────────────────────────────────────────────────────────────
   Mock demonstration data (clearly labeled in the UI)
   ──────────────────────────────────────────────────────────────── */

const MOCK_PRO = {
  name: "Jordan Avery",
  title: "Family Nurse Practitioner",
  city: "Austin",
  state: "TX",
  years: 8,
  specialties: ["Primary Care", "Telehealth", "Men's Health"],
  employmentPref: "Permanent, Full-time",
  availability: "Available in 30 days",
  licensedStates: ["TX", "NM", "OK", "CO"],
  remote: true,
  skills: [
    "Patient assessment",
    "Chronic care management",
    "Telehealth visits",
    "EHR: Epic, Athena",
    "Spanish (conversational)",
  ],
  profileCompletion: 92,
  resumeUploaded: true,
  linkedinAdded: true,
  verifications: [
    { label: "Email Verified", icon: Mail },
    { label: "Phone Verified", icon: Phone },
    { label: "Identity Verified", icon: BadgeCheck },
    { label: "Resume Reviewed", icon: FileCheck },
    { label: "License Verified", icon: ShieldCheck },
    { label: "Certification Verified", icon: Award },
  ] as const,
};

const APPLICATION_STAGES = [
  "Draft",
  "Submitted",
  "Under Review",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Not Selected",
] as const;

const MOCK_APPLICATIONS = [
  { role: "Family NP", org: "Austin Community Clinic", stage: "Interview" as const, applied: "Mar 14" },
  { role: "Telehealth NP", org: "Mesa Health", stage: "Under Review" as const, applied: "Mar 18" },
  { role: "Primary Care NP", org: "Riverbend Medical", stage: "Submitted" as const, applied: "Mar 22" },
  { role: "Senior NP", org: "Capital Men's Health", stage: "Screening" as const, applied: "Mar 24" },
];

const MOCK_EMPLOYER = {
  activeJobs: 6,
  newApplicants: 14,
  shortlisted: 9,
  inInterview: 5,
  recommendations: 8,
  topListing: { title: "Family Nurse Practitioner", views: 47, applications: 12 },
  stageBreakdown: [
    { stage: "Submitted", count: 9 },
    { stage: "Under Review", count: 6 },
    { stage: "Screening", count: 4 },
    { stage: "Interview", count: 3 },
    { stage: "Offer", count: 1 },
  ],
  recentApplicants: [
    { name: "Maria S.", role: "Family NP", stage: "Interview", color: "teal" },
    { name: "David K.", role: "MA", stage: "Screening", color: "emerald" },
    { name: "Aisha R.", role: "Telehealth NP", stage: "Under Review", color: "sky" },
  ],
};

const TRUST_ROW_ITEMS = [
  "Credential-aware profiles",
  "Permanent & flexible",
  "Multi-state licensure",
  "Clinical & operational",
  "Verified organizations",
  "Application tracking",
] as const;

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
      <Hero onGetStarted={onGetStarted} professionalsCount={professionals.length} jobsCount={jobs.length} />
      <EcosystemConnectionSection />
      <WorkforceModelsSection />
      <JobsSection jobs={jobs} />
      <CategoriesSection />
      <ProfessionalPathwaySection onGetStarted={onGetStarted} />
      <FlexibleTalentSection />
      <ProfessionalProfilePreview />
      <ApplicationTrackingPreview />
      <EmployerPathwaySection onGetStarted={onGetStarted} />
      <PartnerClinicSection />
      <EmployerDashboardPreview />
      <MatchingMethodologySection />
      <TrustResponsibilitySection />
      <FinalEmployerCTA onGetStarted={onGetStarted} />
      <FinalProfessionalCTA onGetStarted={onGetStarted} />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────
   1. Hero
   ──────────────────────────────────────────────────────────────── */

function Hero({
  onGetStarted,
  professionalsCount,
  jobsCount,
}: {
  onGetStarted: () => void;
  professionalsCount: number;
  jobsCount: number;
}) {
  function scrollToJobs() {
    const el = document.getElementById("browse-jobs");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="border-b border-border bg-gradient-to-b from-teal-50/60 via-background to-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <Breadcrumbs
              items={[
                { label: "Home", onClick: () => navigate("home") },
                { label: "Workforce Hub" },
              ]}
            />
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <Users className="h-3.5 w-3.5" /> Workforce Hub
            </div>
            <h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Connect Patient Demand with the{" "}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Workforce Required to Deliver Care
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Novalyte AI helps healthcare organizations find qualified clinical and
              operational professionals, publish permanent or flexible roles, and
              expand their workforce as patient volume grows — across clinical care,
              allied health, behavioral health, operations, revenue cycle, technology,
              and specialty care.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                size="lg"
                className="bg-teal-600 text-white hover:bg-teal-700"
                onClick={scrollToJobs}
              >
                <Search className="mr-1 h-4 w-4" /> Browse Healthcare Roles
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("professional-onboarding")}>
                <Users className="mr-1 h-4 w-4" /> Join as a Professional
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-200 bg-emerald-50/40 text-emerald-700 hover:bg-emerald-100/60"
                onClick={() => navigate("employer-onboarding")}
              >
                <Briefcase className="mr-1 h-4 w-4" /> Post a Role
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {TRUST_ROW_ITEMS.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" /> {item}
                </span>
              ))}
            </div>

            {/* Real, prop-derived counts — no fabricated metrics */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
              <div className="rounded-xl border border-border bg-card p-3 shadow-premium-xs">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Active roles
                </p>
                <p className="mt-0.5 text-xl font-semibold text-foreground">{jobsCount}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 shadow-premium-xs">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Professionals in network
                </p>
                <p className="mt-0.5 text-xl font-semibold text-foreground">{professionalsCount}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-premium-md">
              <SmartImage
                src="/images/professionals/pro-5.jpg"
                alt="Healthcare professional preparing for a patient visit"
                width={1200}
                height={900}
                priority
                sizes="(min-width: 1024px) 480px, 100vw"
                className="aspect-[4/3] w-full"
                imgClassName="object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-border bg-card p-3 shadow-premium-sm sm:block">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Credential-aware matching</p>
                  <p className="text-[11px] text-muted-foreground">Licenses, specialties, and credentials</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   2. Ecosystem Connection Section
   ──────────────────────────────────────────────────────────────── */

function EcosystemConnectionSection() {
  return (
    <SectionShell id="ecosystem" tone="tint" className="!py-14 sm:!py-16">
      <SectionHeading
        eyebrow="The Ecosystem"
        title="One Ecosystem Built Around Healthcare Growth"
        description="Patient demand creates provider growth. Provider growth creates workforce demand. Workforce demand creates operational needs. Novalyte AI connects every stage so capacity grows with care."
      />

      <div className="mt-10 grid gap-3 lg:grid-cols-4">
        {ECOSYSTEM_STAGES.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.step} className="relative">
              <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-premium-xs">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-teal-600/70">{s.step}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
              {i < ECOSYSTEM_STAGES.length - 1 && (
                <ArrowRight className="absolute -right-2.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-teal-400 lg:block" />
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-8 rounded-xl border border-teal-200 bg-teal-50/60 p-5 text-center text-sm font-medium text-teal-800">
        More patient demand requires more workforce capacity. Novalyte connects both.
      </p>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   3. Workforce Models
   ──────────────────────────────────────────────────────────────── */

function WorkforceModelsSection() {
  return (
    <SectionShell className="!py-14 sm:!py-16">
      <SectionHeading
        eyebrow="Workforce Models"
        title="Permanent, flexible, and capacity-expansion hiring"
        description="Whether you are building a core team, adding flexible coverage, or expanding capacity for new patient volume, the Workforce Hub supports the hiring model that fits the moment."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {WORKFORCE_MODELS.map((m) => {
          const Icon = m.icon;
          return (
            <PremiumCard key={m.title} hover className="flex h-full flex-col p-6 card-premium-hover">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
              <ul className="mt-4 space-y-1.5">
                {m.points.map((p) => (
                  <CheckItem key={p}>{p}</CheckItem>
                ))}
              </ul>
            </PremiumCard>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   4. Job Search & Filters
   ──────────────────────────────────────────────────────────────── */

type JobFilters = {
  query: string;
  state: string;
  empType: string;
  remoteOnly: boolean;
  compRange: string;
};

const DEFAULT_JOB_FILTERS: JobFilters = {
  query: "",
  state: "all",
  empType: "all",
  remoteOnly: false,
  compRange: "all",
};

type JobSort = "relevant" | "newest" | "comp-high" | "comp-low";

const JOB_SORTS: { value: JobSort; label: string }[] = [
  { value: "relevant", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "comp-high", label: "Compensation: high to low" },
  { value: "comp-low", label: "Compensation: low to high" },
];

function JobsSection({ jobs }: { jobs: JobPostingT[] }) {
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_JOB_FILTERS);
  const [sort, setSort] = useState<JobSort>("relevant");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function applyFilter(patch: Partial<JobFilters>) {
    startTransition(() => {
      setFilters((f) => ({ ...f, ...patch }));
      setPage(1);
    });
  }

  // Listen for category clicks from the Browse by Healthcare Category section.
  // Uses a window CustomEvent so categories can set the keyword filter and
  // scroll back up without lifting state out of the JobsSection.
  useEffect(() => {
    function onKeyword(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string" && detail.length > 0) {
        applyFilter({ query: detail });
      }
    }
    window.addEventListener("novalyte:set-job-keyword", onKeyword as EventListener);
    return () =>
      window.removeEventListener("novalyte:set-job-keyword", onKeyword as EventListener);
  }, []);

  function applySort(v: JobSort) {
    startTransition(() => {
      setSort(v);
      setPage(1);
    });
  }

  function applyView(v: "grid" | "list") {
    startTransition(() => setView(v));
  }

  function clearAll() {
    startTransition(() => {
      setFilters(DEFAULT_JOB_FILTERS);
      setPage(1);
    });
  }

  // Derived filter options
  const allEmpTypes = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => set.add(j.employmentType));
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
      return true;
    });

    const sorted = [...out];
    if (sort === "comp-high") {
      sorted.sort((a, b) => (b.compMax ?? b.compMin ?? 0) - (a.compMax ?? a.compMin ?? 0));
    } else if (sort === "comp-low") {
      sorted.sort((a, b) => (a.compMin ?? a.compMax ?? Number.POSITIVE_INFINITY) - (b.compMin ?? b.compMax ?? Number.POSITIVE_INFINITY));
    }
    return sorted;
  }, [jobs, filters, sort]);

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
    return arr;
  }, [filters]);

  const filtersNode = (
    <JobFiltersContent filters={filters} update={applyFilter} allEmpTypes={allEmpTypes} />
  );

  return (
    <SectionShell id="browse-jobs" className="!py-14 sm:!py-16 scroll-mt-20">
      <SectionHeading
        eyebrow="Browse Healthcare Roles"
        title="Find your next healthcare opportunity"
        description="Search across clinical, allied health, behavioral health, operations, revenue cycle, technology, and specialty care roles. Save roles, apply, and track your applications — all in one place."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
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
              healthcare opportunities
            </p>
          </div>

          {/* Results */}
          {isPending ? (
            <div className={cn("grid gap-4", view === "grid" ? "md:grid-cols-2" : "grid-cols-1")}>
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No roles match your filters"
              description="Try widening your filters or clearing them to see more healthcare opportunities in the network."
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
          {!isPending && totalPages > 1 && (
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
    </SectionShell>
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
}: {
  filters: JobFilters;
  update: (patch: Partial<JobFilters>) => void;
  allEmpTypes: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Keyword</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Title, organization, or skill"
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

      <Separator />

      <label className="flex cursor-pointer items-center justify-between gap-2">
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
  const comp = formatComp(job.compMin, job.compMax);

  const saved = useSaved((s) => s.jobs.includes(job.id));
  const toggle = useSaved((s) => s.toggle);

  function openDetail() {
    navigate("job-detail", undefined, { id: job.id });
  }

  function handleSave() {
    toggle("job", job.id);
    toast.success(saved ? "Removed from saved roles" : "Saved to your roles", {
      description: job.title,
    });
  }

  return (
    <PremiumCard hover className="flex h-full flex-col p-5" as="article">
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
              <ShieldCheck className="h-3 w-3" /> Verified
            </StatusPill>
          )}
          <SaveButton size="sm" saved={saved} onToggle={handleSave} />
        </div>
      </div>

      <button
        onClick={openDetail}
        className="mt-2 text-left transition hover:text-teal-700"
      >
        <h3 className="text-base font-semibold leading-tight text-foreground sm:text-lg">
          {job.title}
        </h3>
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {job.city}, {job.state}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" /> {job.employmentType}
        </span>
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
          {specialties.slice(0, 4).map((s) => (
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

      {licenses.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {licenses.slice(0, 3).map((l) => (
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

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

      {job.schedule && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" /> {job.schedule}
        </div>
      )}

      <div className="mt-auto" />

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
        {job.requiredExperience && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {job.requiredExperience}
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
      {layout === "list" && <span className="sr-only">card {index + 1}</span>}
    </PremiumCard>
  );
}

function RemotePill({ remote }: { remote: boolean }) {
  if (remote) return <StatusPill tone="teal">Remote</StatusPill>;
  return <StatusPill tone="muted">On-site</StatusPill>;
}

/* ────────────────────────────────────────────────────────────────
   5. Browse by Healthcare Category
   ──────────────────────────────────────────────────────────────── */

function CategoriesSection() {
  function applyCategory(keyword: string) {
    // Set the keyword filter via the URL-less state by dispatching a custom
    // event the JobsSection listens for. Simpler: set window location hash
    // and let JobsSection read. We use a window event for clean cross-section
    // communication without lifting state.
    window.dispatchEvent(
      new CustomEvent("novalyte:set-job-keyword", { detail: keyword }),
    );
    // Scroll to jobs
    const el = document.getElementById("browse-jobs");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    toast.success("Filter applied", {
      description: `Showing roles matching "${keyword}"`,
    });
  }

  return (
    <SectionShell tone="muted" className="!py-14 sm:!py-16">
      <SectionHeading
        eyebrow="Browse by Category"
        title="Find roles by healthcare category"
        description="From clinical care to revenue cycle and healthcare technology — pick a category to surface matching roles. Men's health is one specialty among many."
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HEALTHCARE_CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.name}
              onClick={() => applyCategory(c.keyword)}
              className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-left shadow-premium-xs transition hover:border-teal-300 hover:shadow-premium-sm card-premium-hover"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{c.name}</h3>
              <ul className="mt-2 space-y-0.5">
                {c.examples.map((e) => (
                  <li key={e} className="text-xs text-muted-foreground">
                    {e}
                  </li>
                ))}
              </ul>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 opacity-0 transition group-hover:opacity-100">
                Filter roles <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   6. Professional Pathway
   ──────────────────────────────────────────────────────────────── */

function ProfessionalPathwaySection({ onGetStarted }: { onGetStarted: () => void }) {
  function scrollToJobs() {
    const el = document.getElementById("browse-jobs");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <SectionShell className="!py-14 sm:!py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <SectionHeading
          eyebrow="For Professionals"
          title="Build One Professional Profile. Access Multiple Healthcare Opportunities."
          description="A single credential-aware profile lets you apply to permanent, contract, and flexible healthcare roles across clinical, allied health, behavioral health, operations, revenue cycle, technology, and specialty care."
        />

        <PremiumCard className="p-6 lg:p-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <GraduationCap className="h-4 w-4" />
            </span>
            <h3 className="text-base font-semibold text-foreground">Profile capabilities</h3>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {PRO_CAPABILITIES.map((cap) => (
              <CheckItem key={cap}>{cap}</CheckItem>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={() => navigate("professional-onboarding")}
            >
              Create Your Talent Profile <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={scrollToJobs}>
              <Search className="mr-1 h-4 w-4" /> Browse Healthcare Roles
            </Button>
          </div>
        </PremiumCard>
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   7. Flexible Talent Pathway
   ──────────────────────────────────────────────────────────────── */

function FlexibleTalentSection() {
  return (
    <SectionShell tone="tint" className="!py-14 sm:!py-16">
      <SectionHeading
        eyebrow="Flexible Talent"
        title="Make Your Availability Work for You."
        description="Professionals can indicate the kinds of engagements they will consider — from short-term coverage to permanent placement. Availability and preference fields are designed to support flexible work alongside permanent roles."
      />

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FLEXIBLE_OPTIONS.map((opt) => (
          <div
            key={opt}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-premium-xs"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <CalendarClock className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-foreground">{opt}</span>
          </div>
        ))}
      </div>

      <DisclaimerBanner tone="muted" className="mt-8">
        Flexible-assignment matching, scheduling, and shift-coordination features are planned and
        designed to support contract, per-diem, and locum workflows. Availability fields are
        captured today so your preferences are ready as these capabilities ship.
      </DisclaimerBanner>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   8. Professional Profile Preview (demonstration)
   ──────────────────────────────────────────────────────────────── */

function ProfessionalProfilePreview() {
  const pro = MOCK_PRO;
  return (
    <SectionShell className="!py-14 sm:!py-16">
      <SectionHeading
        eyebrow="Profile Preview"
        title="A credential-aware profile, layered verification"
        description="A demonstration of how a Novalyte talent profile brings together credentials, specialties, availability, and layered verification — all controlled by the professional."
      />

      <div className="mt-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
          <Sparkles className="h-3.5 w-3.5" /> Demonstration preview
        </span>
      </div>

      <PremiumCard className="mt-4 overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-[260px_1fr] lg:p-8">
          {/* Left: headshot + identity */}
          <div className="flex flex-col items-start gap-4">
            <div className="relative h-40 w-40 overflow-hidden rounded-2xl border border-border bg-muted">
              <SmartImage
                src="/images/professionals/pro-3.jpg"
                alt="Demonstration candidate headshot"
                width={320}
                height={320}
                sizes="160px"
                className="h-full w-full"
                imgClassName="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{pro.name}</h3>
              <p className="text-sm text-muted-foreground">{pro.title}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {pro.city}, {pro.state}
              </p>
            </div>
            <div className="w-full">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Profile completion</span>
                <span className="font-semibold text-foreground">{pro.profileCompletion}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                  style={{ width: `${pro.profileCompletion}%` }}
                />
              </div>
            </div>
            <div className="flex w-full flex-wrap gap-2">
              {pro.resumeUploaded && (
                <StatusPill tone="emerald">
                  <FileText className="h-3 w-3" /> Resume uploaded
                </StatusPill>
              )}
              {pro.linkedinAdded && (
                <StatusPill tone="teal">
                  <Globe className="h-3 w-3" /> LinkedIn added
                </StatusPill>
              )}
              {pro.remote && (
                <StatusPill tone="sky">
                  <Video className="h-3 w-3" /> Remote-eligible
                </StatusPill>
              )}
            </div>
          </div>

          {/* Right: details */}
          <div className="space-y-5">
            <MetaRow
              columns={3}
              items={[
                { label: "Experience", value: `${pro.years} years`, icon: Clock },
                { label: "Employment pref", value: pro.employmentPref, icon: BriefcaseBusiness },
                { label: "Availability", value: pro.availability, icon: CalendarDays },
              ]}
            />

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Specialties
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pro.specialties.map((s) => (
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

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Licensed states
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pro.licensedStates.map((s) => (
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

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pro.skills.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs text-foreground/80">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Verification layers
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {pro.verifications.map((v) => {
                  const Icon = v.icon;
                  return (
                    <div
                      key={v.label}
                      className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-1.5"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                      <span className="text-xs font-medium text-emerald-800">{v.label}</span>
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </PremiumCard>

      <DisclaimerBanner tone="muted" className="mt-4">
        Demonstration preview. Verification layers reflect the structured information Novalyte is
        designed to capture. Novalyte AI does not independently verify credentials on behalf of
        employers — confirm licensure and background directly during hiring.
      </DisclaimerBanner>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   9. Application Tracking Preview (demonstration)
   ──────────────────────────────────────────────────────────────── */

function ApplicationTrackingPreview() {
  const pro = MOCK_PRO;
  return (
    <SectionShell tone="muted" className="!py-14 sm:!py-16">
      <SectionHeading
        eyebrow="Application Tracking"
        title="Track every application across hiring stages"
        description="A demonstration of the candidate dashboard — application stages, saved roles, recommended opportunities, profile views, and employer messages."
      />

      <div className="mt-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
          <Sparkles className="h-3.5 w-3.5" /> Product preview · Demonstration data only
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Main: application stages + list */}
        <PremiumCard className="p-6">
          <h3 className="text-base font-semibold text-foreground">Application stages</h3>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {APPLICATION_STAGES.map((s, i) => {
              const isCurrent = MOCK_APPLICATIONS.some((a) => a.stage === s);
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                      isCurrent
                        ? "border-teal-200 bg-teal-50 text-teal-700"
                        : "border-border bg-muted/40 text-muted-foreground",
                    )}
                  >
                    {isCurrent ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                    {s}
                  </span>
                  {i < APPLICATION_STAGES.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Active applications
            </p>
            {MOCK_APPLICATIONS.map((a) => (
              <div
                key={`${a.role}-${a.org}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{a.role}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.org}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">Applied {a.applied}</span>
                  <StatusPill tone="teal">{a.stage}</StatusPill>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>

        {/* Right: side stats */}
        <div className="space-y-3">
          <StatCard
            label="Saved roles"
            value={7}
            sub="Across clinical & operations"
            icon={Bookmark}
            tone="teal"
          />
          <StatCard
            label="Recommended"
            value={12}
            sub="Updated this week"
            icon={Sparkles}
            tone="emerald"
          />
          <StatCard
            label="Profile views"
            value={23}
            sub="Last 7 days"
            icon={Eye}
            tone="default"
          />
          <StatCard
            label="Employer messages"
            value={2}
            sub="Unread in inbox"
            icon={Mail}
            tone="amber"
          />
        </div>
      </div>

      <DisclaimerBanner tone="muted" className="mt-4">
        Demonstration data only. Application-tracking views, profile-view analytics, and employer
        messaging are planned and designed to support a structured candidate experience.
      </DisclaimerBanner>

      <span className="sr-only">{pro.name} demonstration profile</span>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   10. Employer Pathway
   ──────────────────────────────────────────────────────────────── */

function EmployerPathwaySection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <SectionShell className="!py-14 sm:!py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <SectionHeading
          eyebrow="For Employers"
          title="Build the Capacity Required to Serve More Patients."
          description="Publish permanent, contract, temporary, or flexible roles. Review structured applicants, manage hiring stages, and grow your talent pipeline as patient volume grows."
        />

        <PremiumCard className="p-6 lg:p-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Building2 className="h-4 w-4" />
            </span>
            <h3 className="text-base font-semibold text-foreground">Organization capabilities</h3>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {EMPLOYER_CAPABILITIES.map((cap) => (
              <CheckItem key={cap}>{cap}</CheckItem>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => navigate("employer-onboarding")}
            >
              Post a Healthcare Role <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate("employer-onboarding")}>
              <Plus className="mr-1 h-4 w-4" /> Create Organization Account
            </Button>
          </div>
        </PremiumCard>
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   11. Novalyte Partner Clinic Connection
   ──────────────────────────────────────────────────────────────── */

function PartnerClinicSection() {
  const benefits = [
    {
      icon: FolderOpen,
      title: "Publish from the clinic dashboard",
      desc: "Post permanent, contract, and flexible roles from your connected Novalyte clinic dashboard.",
    },
    {
      icon: ClipboardList,
      title: "Review structured applicants",
      desc: "Applications arrive organized with credentials, specialties, and preferences — not as raw leads.",
    },
    {
      icon: Sparkles,
      title: "Talent recommendations",
      desc: "Surfaced candidates aligned to your role, location, licensure, and care setting.",
    },
    {
      icon: Activity,
      title: "Staffing-pressure insights",
      desc: "Connect patient-volume and intake signals to workforce planning, in one view.",
    },
  ] as const;

  return (
    <SectionShell tone="tint" className="!py-14 sm:!py-16">
      <SectionHeading
        eyebrow="Connected Workflows"
        title="Your Patient Pipeline and Workforce Capacity Should Grow Together."
        description="Future Novalyte connected workflows will let partner clinics publish roles, review applicants, and act on staffing-pressure insights — directly from their clinic dashboard."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <PremiumCard key={b.title} className="h-full p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{b.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{b.desc}</p>
            </PremiumCard>
          );
        })}
      </div>

      <DisclaimerBanner tone="teal" className="mt-8">
        Connected clinic-to-workforce workflows are planned. Partner clinics will be able to publish
        roles and review applicants from a connected dashboard as these capabilities ship.
      </DisclaimerBanner>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   12. Employer Dashboard Preview (demonstration)
   ──────────────────────────────────────────────────────────────── */

function EmployerDashboardPreview() {
  const e = MOCK_EMPLOYER;
  return (
    <SectionShell className="!py-14 sm:!py-16">
      <SectionHeading
        eyebrow="Employer Preview"
        title="An at-a-glance hiring dashboard"
        description="A demonstration of the employer dashboard — active jobs, applicant flow, pipeline stages, candidate recommendations, and listing performance."
      />

      <div className="mt-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
          <Sparkles className="h-3.5 w-3.5" /> Product preview · Demonstration data only
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active jobs" value={e.activeJobs} icon={Briefcase} tone="teal" />
        <StatCard label="New applicants" value={e.newApplicants} sub="This week" icon={UserCheck} tone="emerald" />
        <StatCard label="Shortlisted" value={e.shortlisted} icon={Star} tone="amber" />
        <StatCard label="In interview" value={e.inInterview} icon={CalendarDays} tone="default" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Pipeline + recent applicants */}
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Applicant pipeline</h3>
            <span className="text-xs text-muted-foreground">By stage</span>
          </div>
          <div className="mt-4 space-y-3">
            {e.stageBreakdown.map((s) => {
              const max = Math.max(...e.stageBreakdown.map((x) => x.count));
              const pct = Math.round((s.count / max) * 100);
              return (
                <div key={s.stage}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{s.stage}</span>
                    <span className="text-muted-foreground">{s.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recent applicants
            </p>
            <div className="space-y-2">
              {e.recentApplicants.map((a) => {
                const c = avatarColor(
                  ["teal", "emerald", "sky", "violet", "amber"].indexOf(a.color),
                );
                return (
                  <div
                    key={a.name}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                          c.bg,
                        )}
                      >
                        {initials(a.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{a.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{a.role}</p>
                      </div>
                    </div>
                    <StatusPill tone="teal">{a.stage}</StatusPill>
                  </div>
                );
              })}
            </div>
          </div>
        </PremiumCard>

        {/* Recommendations + listing performance */}
        <div className="space-y-4">
          <PremiumCard className="p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Candidate recommendations</h3>
                <p className="text-xs text-muted-foreground">Aligned to your open roles</p>
              </div>
            </div>
            <p className="mt-3 text-2xl font-semibold text-teal-700">{e.recommendations}</p>
            <p className="text-xs text-muted-foreground">
              Recommended candidates across active roles, refreshed as new profiles match.
            </p>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <BarChart3 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Listing performance</h3>
                <p className="text-xs text-muted-foreground">Top performing role</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{e.topListing.title}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Views</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{e.topListing.views}</p>
              </div>
              <div className="col-span-2 rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Applications</p>
                <p className="mt-0.5 text-sm font-semibold text-emerald-700">
                  {e.topListing.applications} applicants
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>

      <DisclaimerBanner tone="muted" className="mt-4">
        Demonstration data only. The employer dashboard, pipeline analytics, candidate
        recommendations, and listing-performance views are planned and designed to support
        healthcare hiring workflows.
      </DisclaimerBanner>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   13. Matching Methodology
   ──────────────────────────────────────────────────────────────── */

function MatchingMethodologySection() {
  return (
    <SectionShell tone="muted" className="!py-14 sm:!py-16">
      <SectionHeading
        eyebrow="How Matching Works"
        title="How Novalyte Aligns Healthcare Talent and Opportunity"
        description="When an organization posts a role or a professional searches for opportunities, the platform aligns profiles and postings across structured factors to surface relevant, licensure-aware matches."
      />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {MATCHING_FACTORS.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.label}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 shadow-premium-xs"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Icon className="h-4 w-4" />
              </span>
              <span className="truncate text-sm font-medium text-foreground">{f.label}</span>
            </div>
          );
        })}
      </div>

      <DisclaimerBanner tone="amber" className="mt-8">
        Novalyte AI facilitates discovery and communication. Employers remain responsible for
        background checks, license confirmation, credential verification, employment eligibility,
        clinical supervision, compliance, and final hiring decisions.
      </DisclaimerBanner>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   14. Trust & Responsibility
   ──────────────────────────────────────────────────────────────── */

function TrustResponsibilitySection() {
  return (
    <SectionShell className="!py-14 sm:!py-16">
      <SectionHeading
        eyebrow="Trust & Responsibility"
        title="A trust framework designed for healthcare hiring"
        description="Verification, credential-aware profiles, secure document handling, candidate privacy, listing review, and fraud reporting — built around the realities of healthcare workforce workflows."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRUST_ITEMS.map((t) => {
          const Icon = t.icon;
          return (
            <PremiumCard key={t.title} className="h-full p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{t.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
            </PremiumCard>
          );
        })}
      </div>

      <DisclaimerBanner tone="muted" className="mt-6">
        Novalyte AI does not represent that any organization, professional, license, or credential
        has been independently verified beyond review of submitted information. Confirm licensure,
        credentials, and background directly during hiring. Novalyte does not guarantee employment
        outcomes, candidate quality, or hiring timelines.
      </DisclaimerBanner>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   15. Final Employer CTA
   ──────────────────────────────────────────────────────────────── */

function FinalEmployerCTA({ onGetStarted }: { onGetStarted: () => void }) {
  function scrollToJobs() {
    const el = document.getElementById("browse-jobs");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <SectionShell tone="tint" className="!py-14 sm:!py-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-background p-8 sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <Building2 className="h-3.5 w-3.5" /> For Employers
        </div>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Need More Capacity as Patient Demand Grows?
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Publish permanent, contract, temporary, or flexible healthcare roles and reach
          credentialed clinical and operational professionals — or browse active talent in the
          Workforce Hub.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => navigate("employer-onboarding")}
          >
            <Briefcase className="mr-1 h-4 w-4" /> Post a Role
          </Button>
          <Button size="lg" variant="outline" onClick={scrollToJobs}>
            <Search className="mr-1 h-4 w-4" /> Find Healthcare Talent
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Novalyte partner organizations can manage roles from their connected dashboard.
        </p>
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────────────────────────
   16. Final Professional CTA
   ──────────────────────────────────────────────────────────────── */

function FinalProfessionalCTA({ onGetStarted }: { onGetStarted: () => void }) {
  function scrollToJobs() {
    const el = document.getElementById("browse-jobs");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Inline implementation rather than CTASection so the "Browse Healthcare Roles"
  // secondary button scrolls to the jobs panel instead of reloading the view.
  return (
    <section className="bg-foreground py-16 text-background sm:py-20">
      <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Find Work That Matches Your Credentials, Goals, and Availability.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-background/70 sm:text-lg">
          Create one credential-aware profile and access permanent, contract, and flexible
          healthcare opportunities across clinical, allied health, behavioral health, operations,
          revenue cycle, technology, and specialty care.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="bg-teal-600 text-white hover:bg-teal-700"
            onClick={() => navigate("professional-onboarding")}
          >
            Join as a Professional <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-background/30 text-background hover:bg-background/10"
            onClick={scrollToJobs}
          >
            <Search className="mr-1 h-4 w-4" /> Browse Healthcare Roles
          </Button>
        </div>
      </div>
    </section>
  );
}
