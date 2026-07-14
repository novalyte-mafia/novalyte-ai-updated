"use client";

import { useMemo, useState, useTransition } from "react";
import { SectionShell } from "@/components/shared/section";
import { SmartImage } from "@/components/shared/smart-image";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import {
  PremiumCard, MetaRow, StatCard, CardSkeleton, EmptyState,
  FilterChip, ViewToggle, SaveButton, Breadcrumbs,
} from "@/components/shared/enterprise";
import { getClinicImage } from "@/lib/images";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { navigate, useSaved, useCompare } from "@/lib/nav";
import { splitCsv, colorClasses, initials, US_STATES } from "@/lib/constants";
import type { ClinicT } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Search, MapPin, Video, Building2, Phone, Star, ShieldCheck, Clock,
  ArrowRight, SlidersHorizontal, LayoutGrid, List, Map, X, Heart,
  GitCompare, Stethoscope, CheckCircle2, Navigation, Sparkles, ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 6;

export function DirectoryView({ clinics }: { clinics: ClinicT[] }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("all");
  const [city, setCity] = useState("all");
  const [treatment, setTreatment] = useState("all");
  const [telehealthOnly, setTelehealthOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [inPersonOnly, setInPersonOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [loading, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Derived filter options
  const allTreatments = useMemo(() => {
    const set = new Set<string>();
    clinics.forEach((c) => splitCsv(c.specialties).forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [clinics]);

  const allCities = useMemo(() => {
    const set = new Set<string>();
    clinics.forEach((c) => set.add(c.city));
    return Array.from(set).sort();
  }, [clinics]);

  // Wrap filter updates in a transition to show loading skeleton (perceived performance)
  function updateFilter<T>(setter: (v: T) => void) {
    return (v: T) => {
      startTransition(() => {
        setter(v);
        setPage(1);
      });
    };
  }

  const filtered = useMemo(() => {
    let result = clinics.filter((c) => {
      if (query) {
        const q = query.toLowerCase();
        const hay = `${c.name} ${c.city} ${c.state} ${c.overview} ${c.specialties} ${c.tagline ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (state !== "all" && c.state !== state) return false;
      if (city !== "all" && c.city !== city) return false;
      if (treatment !== "all" && !splitCsv(c.specialties).includes(treatment)) return false;
      if (telehealthOnly && !c.telehealth) return false;
      if (inPersonOnly && c.telehealth && splitCsv(c.capabilities).length === 0) return false;
      if (verifiedOnly && !c.verified) return false;
      return true;
    });

    // Sorting
    if (sortBy === "verified") {
      result = [...result].sort((a, b) => Number(b.verified) - Number(a.verified));
    } else if (sortBy === "az") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "telehealth") {
      result = [...result].sort((a, b) => Number(b.telehealth) - Number(a.telehealth));
    }
    // relevance = default order
    return result;
  }, [clinics, query, state, city, treatment, telehealthOnly, verifiedOnly, inPersonOnly, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Active filter chips
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (query) activeFilters.push({ label: `"${query}"`, clear: () => setQuery("") });
  if (state !== "all") activeFilters.push({ label: `State: ${state}`, clear: () => setState("all") });
  if (city !== "all") activeFilters.push({ label: `City: ${city}`, clear: () => setCity("all") });
  if (treatment !== "all") activeFilters.push({ label: treatment, clear: () => setTreatment("all") });
  if (telehealthOnly) activeFilters.push({ label: "Telehealth", clear: () => setTelehealthOnly(false) });
  if (inPersonOnly) activeFilters.push({ label: "In-person", clear: () => setInPersonOnly(false) });
  if (verifiedOnly) activeFilters.push({ label: "Verified only", clear: () => setVerifiedOnly(false) });

  function resetFilters() {
    startTransition(() => {
      setQuery(""); setState("all"); setCity("all"); setTreatment("all");
      setTelehealthOnly(false); setVerifiedOnly(false); setInPersonOnly(false); setSortBy("relevance");
      setPage(1);
    });
  }

  // Stats for the directory header strip
  const verifiedCount = clinics.filter((c) => c.verified).length;
  const telehealthCount = clinics.filter((c) => c.telehealth).length;
  const stateCount = new Set(clinics.map((c) => c.state)).size;

  const filterContent = (
    <FiltersPanel
      query={query} setQuery={updateFilter(setQuery)}
      state={state} setState={updateFilter(setState)}
      city={city} setCity={updateFilter(setCity)}
      treatment={treatment} setTreatment={updateFilter(setTreatment)}
      telehealthOnly={telehealthOnly} setTelehealthOnly={updateFilter(setTelehealthOnly)}
      verifiedOnly={verifiedOnly} setVerifiedOnly={updateFilter(setVerifiedOnly)}
      inPersonOnly={inPersonOnly} setInPersonOnly={updateFilter(setInPersonOnly)}
      allTreatments={allTreatments}
      allCities={allCities}
      onReset={resetFilters}
    />
  );

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", onClick: () => navigate("home") }, { label: "Clinic Directory" }]} />
          <div className="mt-5 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-700 backdrop-blur">
              <Building2 className="h-3.5 w-3.5" /> Verified Clinic Directory
            </div>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Find a trusted men's health clinic
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Search verified clinics by location, treatment specialty, telehealth availability, and clinic capabilities. Every clinic's verification status is shown clearly.
            </p>
          </div>

          {/* Quick stats strip */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Clinics" value={clinics.length} sub="In directory" icon={Building2} tone="teal" />
            <StatCard label="Verified" value={verifiedCount} sub="Review completed" icon={ShieldCheck} tone="emerald" />
            <StatCard label="Telehealth" value={telehealthCount} sub="Remote care" icon={Video} tone="teal" />
            <StatCard label="States" value={stateCount} sub="Geographic reach" icon={MapPin} tone="emerald" />
          </div>

          {/* Big search bar */}
          <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-premium-sm sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by clinic name, city, or treatment..."
                value={query}
                onChange={(e) => updateFilter(setQuery)(e.target.value)}
                className="border-0 pl-9 shadow-none focus-visible:ring-0"
                aria-label="Search clinics"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={state} onValueChange={updateFilter(setState)}>
                <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="State" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
                {activeFilters.length > 0 && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">{activeFilters.length}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SectionShell className="!pt-8 !pb-16">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Desktop filter sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto novalyte-scroll pr-1">
              {filterContent}
            </div>
          </aside>

          {/* Mobile filter sheet */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="left" className="w-full max-w-xs overflow-y-auto p-0">
              <SheetHeader className="border-b px-5 py-4">
                <SheetTitle className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</SheetTitle>
              </SheetHeader>
              <div className="p-5">{filterContent}</div>
            </SheetContent>
          </Sheet>

          {/* Results column */}
          <div className="min-w-0">
            {/* Results header */}
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-premium-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-foreground">{filtered.length}</span>
                <span className="text-muted-foreground">of {clinics.length} clinics</span>
                {loading && <span className="ml-1 text-xs text-teal-600">· updating…</span>}
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most relevant</SelectItem>
                    <SelectItem value="verified">Verified first</SelectItem>
                    <SelectItem value="telehealth">Telehealth first</SelectItem>
                    <SelectItem value="az">A–Z</SelectItem>
                  </SelectContent>
                </Select>
                <ViewToggle
                  value={view}
                  onChange={setView}
                  options={[
                    { value: "grid", label: "Grid", icon: LayoutGrid },
                    { value: "list", label: "List", icon: List },
                    { value: "map", label: "Map", icon: Map },
                  ]}
                />
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                {activeFilters.map((f, i) => (
                  <FilterChip key={i} label={f.label} onRemove={f.clear} />
                ))}
                <button onClick={resetFilters} className="ml-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                  Clear all
                </button>
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className={cn("grid gap-4", view === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No clinics match your filters"
                description="Try widening your search area, removing a treatment filter, or clearing all filters to see more clinics."
                action={<Button variant="outline" size="sm" onClick={resetFilters}><X className="mr-1.5 h-3.5 w-3.5" /> Clear all filters</Button>}
              />
            ) : view === "map" ? (
              <MapView clinics={filtered} />
            ) : (
              <div className={cn("grid gap-4 novalyte-fade-up", view === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                {paged.map((c) => (
                  <ClinicCard key={c.id} clinic={c} view={view} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > PAGE_SIZE && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    className={cn("h-8 w-8 p-0", page === i + 1 && "bg-teal-600 text-white hover:bg-teal-700")}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}

            <DisclaimerBanner className="mt-8" tone="teal">
              Verification indicates that Novalyte AI has reviewed submitted business and provider information. It does not constitute endorsement or a guarantee of clinical outcomes. Licensure and credential information should be independently confirmed where appropriate.
            </DisclaimerBanner>
          </div>
        </div>
      </SectionShell>
    </>
  );
}

/* ── Filters panel ───────────────────────────────────────────── */
function FiltersPanel({
  query, setQuery, state, setState, city, setCity, treatment, setTreatment,
  telehealthOnly, setTelehealthOnly, verifiedOnly, setVerifiedOnly,
  inPersonOnly, setInPersonOnly, allTreatments, allCities, onReset,
}: {
  query: string; setQuery: (v: string) => void;
  state: string; setState: (v: string) => void;
  city: string; setCity: (v: string) => void;
  treatment: string; setTreatment: (v: string) => void;
  telehealthOnly: boolean; setTelehealthOnly: (v: boolean) => void;
  verifiedOnly: boolean; setVerifiedOnly: (v: boolean) => void;
  inPersonOnly: boolean; setInPersonOnly: (v: boolean) => void;
  allTreatments: string[]; allCities: string[];
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-teal-600" /> Filters
        </h3>
        <button onClick={onReset} className="text-xs font-medium text-muted-foreground hover:text-foreground">
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-1.5">
          <Label className="text-xs font-medium">State</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All states" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-medium">City</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All cities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {allCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-medium">Treatment specialty</Label>
          <Select value={treatment} onValueChange={setTreatment}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All treatments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All treatments</SelectItem>
              {allTreatments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Care format</Label>
          <label className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground/80"><Video className="h-4 w-4 text-teal-600" /> Telehealth available</span>
            <Switch checked={telehealthOnly} onCheckedChange={setTelehealthOnly} />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground/80"><Building2 className="h-4 w-4 text-emerald-600" /> In-person care</span>
            <Switch checked={inPersonOnly} onCheckedChange={setInPersonOnly} />
          </label>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Trust & status</Label>
          <label className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground/80"><ShieldCheck className="h-4 w-4 text-teal-600" /> Verified only</span>
            <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
          </label>
        </div>
      </div>
    </div>
  );
}

/* ── Clinic card (grid + list variants) ──────────────────────── */
function ClinicCard({ clinic, view }: { clinic: ClinicT; view: string }) {
  const saved = useSaved((s) => s.has("clinic", clinic.id));
  const toggleSave = useSaved((s) => s.toggle);
  const compareHas = useCompare((s) => s.has("clinic", clinic.id));
  const compareToggle = useCompare((s) => s.toggle);
  const c = colorClasses(clinic.logoColor);
  const specs = splitCsv(clinic.specialties).slice(0, 4);
  const caps = splitCsv(clinic.capabilities);
  const providers = splitCsv(clinic.providerTypes);

  const open = () => navigate("clinic-profile", undefined, { id: clinic.id });

  if (view === "list") {
    return (
      <PremiumCard hover className="overflow-hidden" >
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <button onClick={open} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl" aria-label={clinic.name}>
            <SmartImage
              src={getClinicImage(clinic.slug)}
              alt={`${clinic.name} clinic`}
              fill
              sizes="112px"
              imgClassName="object-cover"
              fallback={
                <div className={cn("flex h-full w-full items-center justify-center", c.soft)}>
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white", c.bg)}>{initials(clinic.name)}</span>
                </div>
              }
            />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={open} className="text-base font-semibold text-foreground hover:text-teal-700">{clinic.name}</button>
              <VerificationBadge verified={clinic.verified} status={clinic.verificationStatus} />
              {clinic.telehealth && <StatusPill tone="teal"><Video className="h-3 w-3" /> Telehealth</StatusPill>}
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {clinic.city}, {clinic.state}{clinic.serviceArea ? ` · ${clinic.serviceArea}` : ""}</p>
            <p className="mt-1.5 line-clamp-1 text-sm text-muted-foreground">{clinic.tagline ?? clinic.overview}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {specs.slice(0, 3).map((s) => <Badge key={s} variant="outline" className="border-teal-200 bg-teal-50/50 text-[11px] text-teal-700">{s}</Badge>)}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <div className="flex gap-1.5">
              <SaveButton saved={saved} onToggle={() => toggleSave("clinic", clinic.id)} size="sm" label="Save" />
              <button
                onClick={() => compareToggle("clinic", clinic.id)}
                className={cn("inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition", compareHas ? "border-teal-300 bg-teal-50 text-teal-700" : "border-border bg-card text-muted-foreground hover:border-teal-200 hover:text-teal-700")}
                title="Add to compare"
              >
                <GitCompare className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button size="sm" variant="outline" onClick={open}>View profile <ChevronRight className="ml-0.5 h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard hover className="group overflow-hidden">
      {/* Clinic image with fallback */}
      <div className="relative h-40 overflow-hidden">
        <SmartImage
          src={getClinicImage(clinic.slug)}
          alt={`${clinic.name} clinic in ${clinic.city}, ${clinic.state}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="transition duration-500 group-hover:scale-105"
          imgClassName="object-cover"
          fallback={
            <div className={cn("flex h-full w-full items-center justify-center", c.soft)}>
              <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm", c.bg)}>{initials(clinic.name)}</span>
            </div>
          }
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" aria-hidden />
        {/* Logo/initials badge */}
        <div className="absolute left-3 bottom-3">
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white shadow-premium-sm", c.bg)}>{initials(clinic.name)}</span>
        </div>
        {/* Verification badge */}
        <div className="absolute left-16 bottom-3">
          <VerificationBadge verified={clinic.verified} status={clinic.verificationStatus} />
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <SaveButton saved={saved} onToggle={() => toggleSave("clinic", clinic.id)} size="sm" />
          <button
            onClick={() => compareToggle("clinic", clinic.id)}
            className={cn("inline-flex h-7 w-7 items-center justify-center rounded-lg border transition", compareHas ? "border-teal-300 bg-teal-50 text-teal-700" : "border-border bg-card/80 text-muted-foreground hover:border-teal-200 hover:text-teal-700")}
            title="Add to compare"
          >
            <GitCompare className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <button onClick={open} className="block text-left">
          <h3 className="text-base font-semibold leading-tight text-foreground group-hover:text-teal-700">{clinic.name}</h3>
        </button>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {clinic.city}, {clinic.state}
        </p>
        {clinic.tagline && <p className="mt-2 text-sm font-medium text-foreground/80">{clinic.tagline}</p>}
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{clinic.overview}</p>

        {/* Specialties */}
        <div className="mt-3 flex flex-wrap gap-1">
          {specs.map((s) => <Badge key={s} variant="outline" className="border-teal-200 bg-teal-50/50 text-[11px] text-teal-700">{s}</Badge>)}
        </div>

        {/* Trust signals row */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {clinic.telehealth && <span className="inline-flex items-center gap-1"><Video className="h-3 w-3 text-teal-600" /> Telehealth</span>}
          {caps.includes("On-site phlebotomy") && <span className="inline-flex items-center gap-1"><Stethoscope className="h-3 w-3 text-emerald-600" /> Phlebotomy</span>}
          {providers.length > 0 && <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-teal-600" /> {providers.length} provider type{providers.length > 1 ? "s" : ""}</span>}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <Button size="sm" variant="outline" className="flex-1" onClick={open}>View profile</Button>
          <Button size="sm" className="flex-1 bg-teal-600 text-white hover:bg-teal-700" onClick={open}>
            Request consult <ArrowRight className="ml-0.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </PremiumCard>
  );
}

/* ── Map view (stylized placeholder — no external map service) ── */
function MapView({ clinics }: { clinics: ClinicT[] }) {
  const [selected, setSelected] = useState<ClinicT | null>(clinics[0] ?? null);
  return (
    <PremiumCard className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        {/* Map canvas */}
        <div className="relative h-[420px] overflow-hidden bg-teal-50/40 lg:h-[520px]">
          <div className="novalyte-grid absolute inset-0 opacity-50" aria-hidden />
          <div className="novalyte-dots absolute inset-0 opacity-30" aria-hidden />
          {/* Simulated clinic pins positioned by index */}
          {clinics.slice(0, 8).map((c, i) => {
            const pos = [
              { top: "15%", left: "20%" }, { top: "30%", left: "65%" }, { top: "55%", left: "25%" },
              { top: "70%", left: "60%" }, { top: "40%", left: "45%" }, { top: "25%", left: "35%" },
              { top: "60%", left: "75%" }, { top: "80%", left: "40%" },
            ][i % 8];
            const active = selected?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={pos}
                aria-label={`Select ${c.name}`}
              >
                <span className={cn("flex items-center justify-center rounded-full border-2 border-white shadow-premium-sm transition", active ? "h-9 w-9 bg-teal-600" : "h-7 w-7 bg-teal-500 hover:bg-teal-600")}>
                  <MapPin className={cn("text-white", active ? "h-4 w-4" : "h-3.5 w-3.5")} />
                </span>
                {active && <span className="novalyte-pulse-ring absolute inset-0 rounded-full bg-teal-400/40" />}
              </button>
            );
          })}
          <div className="absolute bottom-3 left-3 rounded-lg border border-border bg-card/90 px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur">
            Map view · {clinics.length} clinics shown
          </div>
        </div>
        {/* Selected clinic panel */}
        <div className="border-t border-border p-4 lg:border-l lg:border-t-0">
          {selected ? (
            <div>
              <div className="flex items-center gap-3">
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white", colorClasses(selected.logoColor).bg)}>{initials(selected.name)}</span>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-foreground">{selected.name}</h4>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {selected.city}, {selected.state}</p>
                </div>
              </div>
              <div className="mt-2"><VerificationBadge verified={selected.verified} status={selected.verificationStatus} /></div>
              <p className="mt-3 line-clamp-3 text-xs text-muted-foreground">{selected.overview}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {splitCsv(selected.specialties).slice(0, 3).map((s) => <Badge key={s} variant="outline" className="border-teal-200 bg-teal-50/50 text-[10px] text-teal-700">{s}</Badge>)}
              </div>
              <Button size="sm" className="mt-4 w-full bg-teal-600 text-white hover:bg-teal-700" onClick={() => navigate("clinic-profile", undefined, { id: selected.id })}>
                View profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Select a pin to view clinic details</p>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}
