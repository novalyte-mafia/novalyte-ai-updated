"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { SectionShell } from "@/components/shared/section";
import { SmartImage } from "@/components/shared/smart-image";
import { StatusPill, ListingStatusBadge } from "@/components/shared/badges";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  PremiumCard, CardSkeleton, EmptyState,
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
import { captureSafeEvent } from "@/lib/analytics-client";
import {
  directorySortRank,
  expandSearchTerms,
  isClaimable,
  isGenuinelyVerified,
  resolveListingStatus,
} from "@/lib/directory/listing-status";
import {
  confirmedAcceptingNewPatients,
  confirmedHsaFsaAccepted,
  confirmedInsuranceAccepted,
  confirmedTelehealth,
  showDirectoryDemos,
} from "@/lib/directory/validate-clinic";
import {
  Search, MapPin, Video, Building2, Phone, Star, ShieldCheck, Clock,
  ArrowRight, SlidersHorizontal, LayoutGrid, List, Map, X, Heart,
  GitCompare, Stethoscope, CheckCircle2, Navigation, Sparkles, ChevronRight,
  DollarSign, Check, HelpCircle, ShieldAlert, Award, Languages, Accessibility, Users,
  ChevronDown, Info,
} from "lucide-react";

const PAGE_SIZE = 12;

function clinicProfilePath(clinic: ClinicT): string {
  const segment = (value: string | null | undefined) =>
    (value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  return `/directory/${segment(clinic.state)}/${segment(clinic.city)}/${clinic.slug}`;
}

// Maps patient-level symptoms / concerns to medical specialties
function getSpecialtiesForConcern(query: string): string[] {
  const q = query.toLowerCase();
  const specs: string[] = [];
  if (q.includes("energy") || q.includes("fatigue") || q.includes("brain fog") || q.includes("focus") || q.includes("tired") || q.includes("sleep")) {
    specs.push("Hormone Optimization", "Testosterone Replacement Therapy", "TRT", "Hormone Evaluation");
  }
  if (q.includes("libido") || q.includes("sex") || q.includes("erectile") || q.includes("ed") || q.includes("pe") || q.includes("ejaculation") || q.includes("prostate")) {
    specs.push("Erectile Dysfunction", "Sexual Wellness", "Erectile Dysfunction Care");
  }
  if (q.includes("weight") || q.includes("fat") || q.includes("glp") || q.includes("semaglutide") || q.includes("tirzepatide") || q.includes("diet") || q.includes("metabolic")) {
    specs.push("Medical Weight Loss", "GLP-1 Programs");
  }
  if (q.includes("hair") || q.includes("bald") || q.includes("thinning")) {
    specs.push("Hair Restoration");
  }
  if (q.includes("longevity") || q.includes("aging") || q.includes("healthspan") || q.includes("biomarker") || q.includes("peptide")) {
    specs.push("Longevity Medicine", "Peptide Therapy");
  }
  if (q.includes("preventive") || q.includes("primary") || q.includes("checkup")) {
    specs.push("Preventive Men's Health");
  }
  return specs;
}

export function DirectoryView({ clinics }: { clinics: ClinicT[] }) {
  // Search state
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  // Filter state
  const [state, setState] = useState("all");
  const [city, setCity] = useState("all");
  const [treatment, setTreatment] = useState("all");
  
  // Advanced filters
  const [careFormat, setCareFormat] = useState("all"); // all | telehealth | in-person | hybrid
  const [providerType, setProviderType] = useState("all"); // all | Physician | Nurse Practitioner | PA | etc
  const [clinicType, setClinicType] = useState("all"); // all | independent | group | longevity
  const [pricingStatus, setPricingStatus] = useState("all"); // all | published | partial | consult
  const [insuranceAccepted, setInsuranceAccepted] = useState(false);
  const [hsaFsaAccepted, setHsaFsaAccepted] = useState(false);
  const [financingAvailable, setFinancingAvailable] = useState(false);
  const [onSiteLab, setOnSiteLab] = useState(false);
  const [acceptingNewPatients, setAcceptingNewPatients] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [claimedStatus, setClaimedStatus] = useState("all"); // all | claimed | unclaimed | demo
  const [includeDemos, setIncludeDemos] = useState(() => showDirectoryDemos());
  const [distanceRadius, setDistanceRadius] = useState("all");
  const [consultationAvailability, setConsultationAvailability] = useState("all");
  const [language, setLanguage] = useState("all");

  // Toolbar & view state
  const [sortBy, setSortBy] = useState("relevance");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [loading, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [guidedOpen, setGuidedOpen] = useState(false);
  const [locationNotice, setLocationNotice] = useState("");
  const searchStarted = useRef(false);
  const filtersMounted = useRef(false);

  useEffect(() => {
    captureSafeEvent("directory_viewed", {
      result_count: clinics.length,
      view_mode: view,
    });
  }, [clinics.length]);

  // Restore a shareable search when a directory URL is revisited.
  /* eslint-disable react-hooks/set-state-in-effect -- URL state is an external navigation source. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") !== "directory") return;
    setQuery(params.get("q") ?? "");
    setLocationQuery(params.get("location") ?? "");
    setState(params.get("state") ?? "all");
    setCity(params.get("city") ?? "all");
    setTreatment(params.get("treatment") ?? "all");
    setCareFormat(params.get("format") ?? "all");
    setProviderType(params.get("provider") ?? "all");
    setDistanceRadius(params.get("distance") ?? "all");
    setConsultationAvailability(params.get("availability") ?? "all");
    setLanguage(params.get("language") ?? "all");
    setSortBy(params.get("sort") ?? "relevance");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("view", "directory");
    const values: Record<string, string> = {
      q: query, location: locationQuery, state, city, treatment, format: careFormat,
      provider: providerType, distance: distanceRadius, availability: consultationAvailability,
      language, sort: sortBy,
    };
    Object.entries(values).forEach(([key, value]) => {
      if (!value || value === "all" || value === "relevance") params.delete(key);
      else params.set(key, value);
    });
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [query, locationQuery, state, city, treatment, careFormat, providerType, distanceRadius, consultationAvailability, language, sortBy]);

  useEffect(() => {
    if (searchStarted.current || (!query.trim() && !locationQuery.trim())) return;
    searchStarted.current = true;
    captureSafeEvent("directory_search_started");
  }, [query, locationQuery]);

  useEffect(() => {
    if (!filtersMounted.current) {
      filtersMounted.current = true;
      return;
    }
    const activeFilterCount = [
      state,
      city,
      treatment,
      careFormat,
      providerType,
      clinicType,
      pricingStatus,
      claimedStatus,
      distanceRadius,
      consultationAvailability,
      language,
    ].filter((value) => value !== "all").length +
      [
        insuranceAccepted,
        hsaFsaAccepted,
        financingAvailable,
        onSiteLab,
        acceptingNewPatients,
        verifiedOnly,
      ].filter(Boolean).length;
    if (activeFilterCount > 0) {
      captureSafeEvent("directory_filter_applied", {
        active_filter_count: activeFilterCount,
      });
    }
  }, [
    state,
    city,
    treatment,
    careFormat,
    providerType,
    clinicType,
    pricingStatus,
    claimedStatus,
    distanceRadius,
    consultationAvailability,
    language,
    insuranceAccepted,
    hsaFsaAccepted,
    financingAvailable,
    onSiteLab,
    acceptingNewPatients,
    verifiedOnly,
  ]);

  // Derived filter options from clinics
  const allTreatments = useMemo(() => {
    const set = new Set<string>();
    clinics.forEach((c) => {
      splitCsv(c.specialties).forEach((s) => set.add(s));
      c.treatments?.forEach((t) => set.add(t.name));
    });
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

  // Filter application logic
  const filtered = useMemo(() => {
    let result = clinics.filter((c) => {
      // 1. Search Field 1: Care
      if (query) {
        const terms = expandSearchTerms(query);
        const hay = `${c.name} ${c.city} ${c.state} ${c.overview} ${c.specialties} ${c.tagline ?? ""} ${c.providerTypes ?? ""} ${c.capabilities ?? ""} ${c.treatments?.map((t) => t.name).join(" ") ?? ""}`.toLowerCase();
        const textMatch = terms.some((term) => hay.includes(term));
        const providerMatch = c.providers?.some((p) =>
          terms.some((term) =>
            `${p.name} ${p.role} ${p.credentials}`.toLowerCase().includes(term),
          ),
        );
        const mappedSpecs = getSpecialtiesForConcern(query);
        const specMatch = mappedSpecs.some((spec) =>
          splitCsv(c.specialties).some((s) => s.toLowerCase().includes(spec.toLowerCase())),
        );
        if (!textMatch && !providerMatch && !specMatch) return false;
      }

      // 2. Search Field 2: Location
      if (locationQuery) {
        const loc = locationQuery.toLowerCase();
        if (loc === "telehealth" || loc === "remote" || loc === "virtual") {
          if (!c.telehealth) return false;
        } else {
          const stateMatch = c.state.toLowerCase() === loc || c.state.toLowerCase().includes(loc);
          const cityMatch = c.city.toLowerCase().includes(loc);
          const zipMatch = c.zip.includes(loc);
          const serviceMatch = c.serviceArea?.toLowerCase().includes(loc);
          const addressMatch = c.locations?.some((l) => l.address.toLowerCase().includes(loc));
          if (!stateMatch && !cityMatch && !zipMatch && !serviceMatch && !addressMatch) return false;
        }
      }

      // 3. Location dropdown filters
      if (state !== "all" && c.state !== state) return false;
      if (city !== "all" && c.city !== city) return false;

      // 4. Treatment specialty dropdown
      if (treatment !== "all") {
        const clinicSpecs = splitCsv(c.specialties);
        const hasSpec = clinicSpecs.some((s) => s.toLowerCase() === treatment.toLowerCase()) ||
                        c.treatments?.some((t) => t.name.toLowerCase() === treatment.toLowerCase()) ||
                        expandSearchTerms(treatment).some((term) =>
                          clinicSpecs.some((s) => s.toLowerCase().includes(term)) ||
                          c.treatments?.some((t) => t.name.toLowerCase().includes(term)),
                        );
        if (!hasSpec) return false;
      }

      // 5. Care format
      if (careFormat === "telehealth" && !c.telehealth) return false;
      if (careFormat === "in-person" && c.telehealth && !c.locations?.length && c.inPersonAvailable === false) return false;
      if (careFormat === "hybrid" && (!c.telehealth || (!c.locations?.length && !c.inPersonAvailable))) return false;

      // 6. Provider Type
      if (providerType !== "all" && !splitCsv(c.providerTypes).some((p) => p.toLowerCase().includes(providerType.toLowerCase()))) return false;

      // 7. Clinic Type
      if (clinicType !== "all") {
        const typeStr = c.overview.toLowerCase() + " " + c.name.toLowerCase() + " " + c.specialties.toLowerCase();
        if (clinicType === "longevity" && !typeStr.includes("longevity")) return false;
        if (clinicType === "weight" && !typeStr.includes("weight") && !typeStr.includes("metabolic") && !typeStr.includes("glp")) return false;
        if (clinicType === "telehealth-provider" && !c.telehealth) return false;
        if (clinicType === "independent" && (typeStr.includes("hospital") || typeStr.includes("collective group"))) return false;
      }

      // 8. Pricing status
      if (pricingStatus !== "all" && c.pricingStatus !== pricingStatus) return false;

      // 9. Payment variables — only match when confirmed true (demo values omitted)
      if (insuranceAccepted && confirmedInsuranceAccepted(c) !== true) return false;
      if (hsaFsaAccepted && confirmedHsaFsaAccepted(c) !== true) return false;
      if (financingAvailable) {
        const explicit = c.financingAvailable === true;
        const searchable = `${c.capabilities ?? ""} ${c.pricingStatus} ${c.overview}`.toLowerCase();
        if (!explicit && !searchable.includes("financ")) return false;
      }

      // 10. Capabilities
      if (onSiteLab) {
        const hasOnsiteLab = splitCsv(c.capabilities).some((cap) => cap.toLowerCase().includes("lab") || cap.toLowerCase().includes("phlebotomy")) ||
                             c.locations?.some((l) => l.onSiteLab || l.phlebotomy);
        if (!hasOnsiteLab) return false;
      }

      // 11. Availability & claim status
      if (acceptingNewPatients && confirmedAcceptingNewPatients(c) !== true) return false;
      if (verifiedOnly && !isGenuinelyVerified(c)) return false;
      if (!includeDemos && resolveListingStatus(c) === "demo") return false;
      if (claimedStatus === "claimed" && resolveListingStatus(c) !== "claimed" && resolveListingStatus(c) !== "verified") return false;
      if (claimedStatus === "unclaimed" && resolveListingStatus(c) !== "unclaimed") return false;
      if (claimedStatus === "demo" && resolveListingStatus(c) !== "demo") return false;

      if (distanceRadius !== "all") {
        if (!locationQuery && !c.locations?.length && c.latitude == null) return false;
        if (locationQuery && !c.locations?.length && !c.telehealth && c.latitude == null) return false;
      }
      if (consultationAvailability !== "all") {
        const availability = `${c.earliestAvailability ?? ""} ${c.sameDayConsultations ? "same day" : ""} ${c.locations?.map((l) => l.earliestAppt ?? "").join(" ")}`.toLowerCase();
        if (consultationAvailability === "soon" && !/(today|tomorrow|same day|next day|this week|within 7|[1-7] day)/i.test(availability)) return false;
        if (consultationAvailability === "month" && !availability.trim()) return false;
      }
      if (language !== "all") {
        const languageText = `${c.languages} ${c.providers?.map((p) => p.languages ?? "").join(" ")}`.toLowerCase();
        if (!languageText.includes(language.toLowerCase())) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "relevance" || sortBy === "most-relevant") {
      result = [...result].sort((a, b) => directorySortRank(b) - directorySortRank(a));
    } else if (sortBy === "recent") {
      result = [...result].sort((a, b) =>
        String((b as { lastReviewedAt?: string | null }).lastReviewedAt ?? "").localeCompare(
          String((a as { lastReviewedAt?: string | null }).lastReviewedAt ?? ""),
        ),
      );
    } else if (sortBy === "completeness") {
      result = [...result].sort((a, b) => b.profileCompleteness - a.profileCompleteness);
    } else if (sortBy === "az") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "za") {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "nearest") {
      result = [...result].sort((a, b) => Number(Boolean(b.locations?.length || (b as { latitude?: number | null }).latitude != null)) - Number(Boolean(a.locations?.length || (a as { latitude?: number | null }).latitude != null)));
    }
    return result;
  }, [clinics, query, locationQuery, state, city, treatment, careFormat, providerType, clinicType, pricingStatus, insuranceAccepted, hsaFsaAccepted, financingAvailable, onSiteLab, acceptingNewPatients, verifiedOnly, claimedStatus, includeDemos, distanceRadius, consultationAvailability, language, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (filtered.length !== 0 || (!query.trim() && !locationQuery.trim())) return;
    const timer = window.setTimeout(() => {
      captureSafeEvent("directory_no_results", {
        has_care_query: Boolean(query.trim()),
        has_location_query: Boolean(locationQuery.trim()),
      });
    }, 750);
    return () => window.clearTimeout(timer);
  }, [filtered.length, query, locationQuery]);

  // Active filter chips
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (query) activeFilters.push({ label: `Care: "${query}"`, clear: () => setQuery("") });
  if (locationQuery) activeFilters.push({ label: `Where: "${locationQuery}"`, clear: () => setLocationQuery("") });
  if (state !== "all") activeFilters.push({ label: `State: ${state}`, clear: () => setState("all") });
  if (city !== "all") activeFilters.push({ label: `City: ${city}`, clear: () => setCity("all") });
  if (treatment !== "all") activeFilters.push({ label: treatment, clear: () => setTreatment("all") });
  if (careFormat !== "all") activeFilters.push({ label: `Format: ${careFormat}`, clear: () => setCareFormat("all") });
  if (providerType !== "all") activeFilters.push({ label: `Provider: ${providerType}`, clear: () => setProviderType("all") });
  if (clinicType !== "all") activeFilters.push({ label: `Type: ${clinicType}`, clear: () => setClinicType("all") });
  if (pricingStatus !== "all") activeFilters.push({ label: `Pricing: ${pricingStatus}`, clear: () => setPricingStatus("all") });
  if (insuranceAccepted) activeFilters.push({ label: "Accepts Insurance", clear: () => setInsuranceAccepted(false) });
  if (hsaFsaAccepted) activeFilters.push({ label: "Accepts HSA/FSA", clear: () => setHsaFsaAccepted(false) });
  if (financingAvailable) activeFilters.push({ label: "Financing available", clear: () => setFinancingAvailable(false) });
  if (onSiteLab) activeFilters.push({ label: "On-site Lab/Phlebotomy", clear: () => setOnSiteLab(false) });
  if (acceptingNewPatients) activeFilters.push({ label: "Accepting Patients", clear: () => setAcceptingNewPatients(false) });
  if (verifiedOnly) activeFilters.push({ label: "Verified only", clear: () => setVerifiedOnly(false) });
  if (distanceRadius !== "all") activeFilters.push({ label: `Within ${distanceRadius} miles`, clear: () => setDistanceRadius("all") });
  if (consultationAvailability !== "all") activeFilters.push({ label: consultationAvailability === "soon" ? "Consultation within 7 days" : "Consultation within 30 days", clear: () => setConsultationAvailability("all") });
  if (language !== "all") activeFilters.push({ label: `Language: ${language}`, clear: () => setLanguage("all") });
  if (claimedStatus !== "all") activeFilters.push({ label: `Profile: ${claimedStatus}`, clear: () => setClaimedStatus("all") });
  if (!includeDemos) activeFilters.push({ label: "Demo profiles hidden", clear: () => setIncludeDemos(true) });

  function resetFilters() {
    startTransition(() => {
      setQuery(""); setLocationQuery(""); setState("all"); setCity("all"); setTreatment("all");
      setCareFormat("all"); setProviderType("all"); setClinicType("all"); setPricingStatus("all");
      setInsuranceAccepted(false); setHsaFsaAccepted(false); setOnSiteLab(false);
      setAcceptingNewPatients(false); setVerifiedOnly(false); setClaimedStatus("all");
      setIncludeDemos(showDirectoryDemos());
      setFinancingAvailable(false); setDistanceRadius("all"); setConsultationAvailability("all"); setLanguage("all");
      setSortBy("relevance"); setPage(1);
    });
  }

  const filterContent = (
    <FiltersPanel
      state={state} setState={updateFilter(setState)}
      city={city} setCity={updateFilter(setCity)}
      treatment={treatment} setTreatment={updateFilter(setTreatment)}
      careFormat={careFormat} setCareFormat={updateFilter(setCareFormat)}
      providerType={providerType} setProviderType={updateFilter(setProviderType)}
      clinicType={clinicType} setClinicType={updateFilter(setClinicType)}
      pricingStatus={pricingStatus} setPricingStatus={updateFilter(setPricingStatus)}
      insuranceAccepted={insuranceAccepted} setInsuranceAccepted={updateFilter(setInsuranceAccepted)}
      hsaFsaAccepted={hsaFsaAccepted} setHsaFsaAccepted={updateFilter(setHsaFsaAccepted)}
      financingAvailable={financingAvailable} setFinancingAvailable={updateFilter(setFinancingAvailable)}
      onSiteLab={onSiteLab} setOnSiteLab={updateFilter(setOnSiteLab)}
      acceptingNewPatients={acceptingNewPatients} setAcceptingNewPatients={updateFilter(setAcceptingNewPatients)}
      verifiedOnly={verifiedOnly} setVerifiedOnly={updateFilter(setVerifiedOnly)}
      claimedStatus={claimedStatus} setClaimedStatus={updateFilter(setClaimedStatus)}
      includeDemos={includeDemos}
      setIncludeDemos={(v) => {
        setIncludeDemos(v);
        captureSafeEvent("directory_demo_filter_toggled", { include_demos: v, view_mode: view, sort_option: sortBy });
        setPage(1);
      }}
      demosAvailable={showDirectoryDemos()}
      moreFiltersOpen={moreFiltersOpen}
      setMoreFiltersOpen={(open) => {
        setMoreFiltersOpen(open);
        if (open) captureSafeEvent("directory_more_filters_opened", { view_mode: view });
      }}
      distanceRadius={distanceRadius} setDistanceRadius={updateFilter(setDistanceRadius)}
      consultationAvailability={consultationAvailability} setConsultationAvailability={updateFilter(setConsultationAvailability)}
      language={language} setLanguage={updateFilter(setLanguage)}
      allTreatments={allTreatments}
      allCities={allCities}
      onReset={resetFilters}
      onApply={() => setMobileFiltersOpen(false)}
    />
  );

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 via-background to-background relative overflow-hidden">
        <div className="absolute inset-0 novalyte-grid opacity-[0.03]" />
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 relative">
          <Breadcrumbs items={[{ label: "Home", onClick: () => navigate("home") }, { label: "Clinic Directory" }]} />
          
          <div className="mt-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/70 px-3 py-1 text-xs font-semibold text-teal-800 backdrop-blur">
              <Building2 className="h-3.5 w-3.5 text-teal-600" /> Men&apos;s Health Clinic Directory
            </div>
            
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Find the Right Men’s Health{" "}
              <span className="text-teal-600">Clinic for Your Needs</span>
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg max-w-3xl">
              Search and compare men’s health clinics by location, treatment focus, care format, telehealth availability, and publicly available clinic information.
            </p>
          </div>

          {/* Dual Field Search Experience */}
          <div id="directory-search" className="mt-8 grid gap-4 p-4 rounded-2xl border border-border bg-card shadow-premium-md md:grid-cols-[1fr_1fr_auto] md:items-center">
            {/* Field 1: What Care */}
            <div className="grid gap-1.5">
              <Label htmlFor="search-care" className="text-xs font-medium text-foreground/80">What care are you looking for?</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search-care"
                  placeholder="TRT, low energy, ED care, weight loss..."
                  value={query}
                  onChange={(e) => updateFilter(setQuery)(e.target.value)}
                  className="border-0 pl-10 bg-muted/30 focus-visible:ring-1 focus-visible:ring-teal-600 focus-visible:bg-card transition"
                />
              </div>
            </div>

            {/* Field 2: Where */}
            <div className="grid gap-1.5">
              <Label htmlFor="search-location" className="text-xs font-medium text-foreground/80">Where?</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search-location"
                  placeholder="City, state, ZIP code, or telehealth"
                  value={locationQuery}
                  onChange={(e) => updateFilter(setLocationQuery)(e.target.value)}
                  className="border-0 pl-10 bg-muted/30 focus-visible:ring-1 focus-visible:ring-teal-600 focus-visible:bg-card transition"
                />
              </div>
            </div>

            {/* Actions Block */}
            <div className="flex flex-col gap-2 pt-2 md:pt-5 md:flex-row">
              <Button 
                onClick={() => {
                  setPage(1);
                  captureSafeEvent("directory_search_submitted", {
                    has_care_query: Boolean(query.trim()),
                    has_location_query: Boolean(locationQuery.trim()),
                    result_count: filtered.length,
                  });
                  captureSafeEvent("clinic_search", {
                    has_care_query: Boolean(query.trim()),
                    has_location_query: Boolean(locationQuery.trim()),
                    result_count: filtered.length,
                  });
                  document.getElementById("directory-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-premium-sm font-semibold h-10 px-5"
              >
                Search Clinics
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  captureSafeEvent("directory_listing_interest_clicked");
                  navigate("clinic-application");
                }}
                className="h-10 border-teal-200 px-5 font-semibold text-teal-700 hover:bg-teal-50"
              >
                Apply to List Your Clinic <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Supporting Actions */}
          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-teal-700">
            <button
              onClick={() => {
                captureSafeEvent("directory_location_requested");
                if (!navigator.geolocation) {
                  setLocationNotice("Location is not supported by this browser.");
                  captureSafeEvent("directory_location_permission_denied", {
                    reason: "unsupported",
                  });
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  () => {
                    setLocationNotice(
                      "Location permission granted. Distance sorting will appear when approved clinic coordinates are available.",
                    );
                    captureSafeEvent("directory_location_permission_granted");
                  },
                  (error) => {
                    setLocationNotice("Location permission was not granted.");
                    captureSafeEvent("directory_location_permission_denied", {
                      reason: error.code === 1 ? "denied" : "unavailable",
                    });
                  },
                  { enableHighAccuracy: false, timeout: 8_000, maximumAge: 300_000 },
                );
              }}
              className="hover:text-teal-950 transition flex items-center gap-1"
            >
              <Navigation className="h-3.5 w-3.5" /> Use My Location
            </button>
            <span className="text-muted-foreground/30 hidden sm:inline">|</span>
            <button
              onClick={resetFilters}
              className="hover:text-teal-950 transition flex items-center gap-1"
            >
              <Building2 className="h-3.5 w-3.5" /> View All Clinics
            </button>
            <span className="text-muted-foreground/30 hidden sm:inline">|</span>
            <button
              onClick={() => navigate("assessment")}
              className="hover:text-teal-950 transition flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" /> Complete the Patient Assessment
            </button>
          </div>
          {locationNotice && (
            <p className="mt-2 text-xs text-muted-foreground" role="status">
              {locationNotice}
            </p>
          )}

          {/* Quick-Search Chips */}
          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground mr-1">Quick searches:</span>
            {[
              { label: "Testosterone Therapy", search: "TRT" },
              { label: "Erectile Dysfunction", search: "ED care" },
              { label: "Medical Weight Loss", search: "weight loss" },
              { label: "Hair Restoration", search: "hair restoration" },
              { label: "Sexual Wellness", search: "sexual wellness" },
              { label: "Longevity", search: "longevity" },
              { label: "Preventive Care", search: "preventive" },
              { label: "Telehealth", locSearch: "telehealth" },
            ].map((chip) => {
              const active = Boolean(
                (chip.search && query.toLowerCase() === chip.search.toLowerCase()) ||
                  (chip.locSearch && locationQuery.toLowerCase() === chip.locSearch.toLowerCase()),
              );
              return (
                <button
                  key={chip.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    startTransition(() => {
                      if (chip.search) {
                        setQuery(active ? "" : chip.search);
                      }
                      if (chip.locSearch) {
                        setLocationQuery(active ? "" : chip.locSearch);
                      }
                      setPage(1);
                    });
                    captureSafeEvent("directory_quick_search_selected", {
                      treatment: chip.label,
                      result_count: clinics.length,
                    });
                  }}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition",
                    active
                      ? "border-teal-400 bg-teal-50 text-teal-800"
                      : "border-border bg-card text-foreground/80 hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-700",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      <SectionShell id="directory-results" className="!pt-8 !pb-16 bg-muted/10">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto novalyte-scroll pr-1">
              {filterContent}
            </div>
          </aside>

          {/* Mobile Filter Sheet */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="left" className="w-full max-w-xs overflow-y-auto p-0">
              <SheetHeader className="border-b px-5 py-4">
                <SheetTitle className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</SheetTitle>
              </SheetHeader>
              <div className="p-5">{filterContent}</div>
            </SheetContent>
          </Sheet>

          {/* Results Column */}
          <div className="min-w-0">
            <div className="mb-3 flex justify-end lg:hidden">
              <Button variant="outline" size="sm" className="font-semibold" onClick={() => setMobileFiltersOpen(true)}>
                <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5 text-teal-600" /> More Filters
              </Button>
            </div>
            {/* Results Header Toolbar */}
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-premium-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-foreground">
                  {activeFilters.length > 0
                    ? `Showing ${filtered.length} of ${clinics.length} clinics`
                    : `Showing ${filtered.length} clinics`}
                </span>
                {loading && <span className="ml-1 text-xs text-teal-600">· updating…</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end gap-0.5">
                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value);
                      captureSafeEvent("directory_sort_changed", { sort_option: value, view_mode: view });
                    }}
                  >
                    <SelectTrigger className="h-8.5 w-[180px] text-xs" aria-label="Sort directory results">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="recent">Recently reviewed</SelectItem>
                      <SelectItem value="completeness">Profile completeness</SelectItem>
                      <SelectItem value="az">Name A–Z</SelectItem>
                      <SelectItem value="za">Name Z–A</SelectItem>
                      <SelectItem value="nearest">Distance</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="hidden text-[10px] text-muted-foreground sm:inline-flex items-center gap-1 max-w-[220px] text-right">
                    <Info className="h-2.5 w-2.5 shrink-0" aria-hidden />
                    Ordered by search relevance and available profile information, not medical quality.
                  </span>
                </div>
                <ViewToggle
                  value={view}
                  onChange={(next) => {
                    setView(next);
                    captureSafeEvent("directory_view_changed", { view_mode: next, result_count: filtered.length });
                  }}
                  options={[
                    { value: "grid", label: "Grid", icon: LayoutGrid },
                    { value: "list", label: "List", icon: List },
                    { value: "map", label: "Map", icon: Map },
                  ]}
                />
              </div>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
              Novalyte AI is actively expanding this directory. Some profiles are publicly sourced and unclaimed, while demonstration profiles are clearly labeled. Clinic information may be incomplete or change over time.
            </p>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                {activeFilters.map((f, i) => (
                  <FilterChip key={i} label={f.label} onRemove={f.clear} />
                ))}
                <button onClick={resetFilters} className="ml-1 text-xs font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-2">
                  Clear all filters
                </button>
              </div>
            )}

            {/* Results Grid/List/Map */}
            {loading ? (
              <div className={cn("grid gap-4", view === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                {Array.from({ length: PAGE_SIZE }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title={verifiedOnly ? "No verified clinics currently match these filters" : "No clinics match these filters"}
                description={
                  verifiedOnly
                    ? "Browse all listings or adjust your search. Verified status is only shown for clinics that completed Novalyte verification."
                    : "Try expanding your location, selecting additional treatment categories, increasing the distance radius, or clearing one or more filters."
                }
                action={
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      <X className="mr-1.5 h-3.5 w-3.5" /> Clear all filters
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        resetFilters();
                        captureSafeEvent("directory_filters_cleared");
                      }}
                    >
                      View all clinics
                    </Button>
                    <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => navigate("assessment")}>
                      Complete the patient assessment
                    </Button>
                  </div>
                }
              />
            ) : view === "map" ? (
              <MapView clinics={filtered} />
            ) : (
              <div className={cn("grid gap-4 novalyte-fade-up", view === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                {paged.map((c, index) => (
                  <div key={c.id} className="contents">
                    <ClinicCard clinic={c} view={view} />
                    {index === 5 && page === 1 && (
                      <div className={cn(view === "list" ? "" : "md:col-span-2", "flex flex-col items-start gap-3 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/80 to-transparent p-4 md:flex-row md:items-center md:justify-between")}>
                        <div>
                          <h3 className="text-sm font-semibold text-teal-900 flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-teal-600" aria-hidden /> Unsure what care fits your goals?</h3>
                          <p className="mt-1 text-xs text-teal-800/80">Use our guided clinic discovery assistant to narrow results based on concerns, care models, and coverage preferences.</p>
                        </div>
                        <Button
                          onClick={() => setGuidedOpen(true)}
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-1.5 shrink-0"
                        >
                          Help Me Find the Right Clinic <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
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

            {/* Claim Profile Banner Callout */}
            <div className="mt-8 p-5 border border-dashed border-teal-200 bg-teal-50/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Award className="h-6 w-6 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-teal-900">Are you a Men's Health Clinic Owner?</h4>
                  <p className="mt-1 text-xs text-teal-800/80">Claim your directory listing to verify credentials, add provider profiles, publish custom treatments/pricing, and directly receive client consultation requests.</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold"
                onClick={() => navigate("clinics")}
              >
                Apply to List Your Clinic <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* Guided Discovery Wizard */}
      <GuidedDiscoveryWizard
        open={guidedOpen}
        onOpenChange={setGuidedOpen}
        onComplete={(filters) => {
          startTransition(() => {
            if (filters.state) setState(filters.state);
            if (filters.treatment && filters.treatment !== "all") setTreatment(filters.treatment);
            if (filters.careFormat) setCareFormat(filters.careFormat);
            if (filters.pricingModel) {
              if (filters.pricingModel === "insurance") setInsuranceAccepted(true);
            }
            setPage(1);
          });
        }}
      />
    </>
  );
}

/* ── Filters Panel Component ────────────────────────────────── */
function FiltersPanel({
  state, setState, city, setCity, treatment, setTreatment,
  careFormat, setCareFormat, providerType, setProviderType,
  clinicType, setClinicType, pricingStatus, setPricingStatus,
  insuranceAccepted, setInsuranceAccepted, hsaFsaAccepted, setHsaFsaAccepted, financingAvailable, setFinancingAvailable,
  onSiteLab, setOnSiteLab, acceptingNewPatients, setAcceptingNewPatients,
  verifiedOnly, setVerifiedOnly, claimedStatus, setClaimedStatus,
  includeDemos, setIncludeDemos, demosAvailable, moreFiltersOpen, setMoreFiltersOpen,
  distanceRadius, setDistanceRadius, consultationAvailability, setConsultationAvailability, language, setLanguage,
  allTreatments, allCities, onReset, onApply,
}: {
  state: string; setState: (v: string) => void;
  city: string; setCity: (v: string) => void;
  treatment: string; setTreatment: (v: string) => void;
  careFormat: string; setCareFormat: (v: string) => void;
  providerType: string; setProviderType: (v: string) => void;
  clinicType: string; setClinicType: (v: string) => void;
  pricingStatus: string; setPricingStatus: (v: string) => void;
  insuranceAccepted: boolean; setInsuranceAccepted: (v: boolean) => void;
  hsaFsaAccepted: boolean; setHsaFsaAccepted: (v: boolean) => void;
  financingAvailable: boolean; setFinancingAvailable: (v: boolean) => void;
  onSiteLab: boolean; setOnSiteLab: (v: boolean) => void;
  acceptingNewPatients: boolean; setAcceptingNewPatients: (v: boolean) => void;
  verifiedOnly: boolean; setVerifiedOnly: (v: boolean) => void;
  claimedStatus: string; setClaimedStatus: (v: string) => void;
  includeDemos: boolean; setIncludeDemos: (v: boolean) => void;
  demosAvailable: boolean;
  moreFiltersOpen: boolean; setMoreFiltersOpen: (v: boolean) => void;
  distanceRadius: string; setDistanceRadius: (v: string) => void;
  consultationAvailability: string; setConsultationAvailability: (v: string) => void;
  language: string; setLanguage: (v: string) => void;
  allTreatments: string[]; allCities: string[];
  onReset: () => void;
  onApply?: () => void;
}) {
  const [filterSearch, setFilterSearch] = useState("");

  const filteredTreatments = useMemo(() => {
    if (!filterSearch) return allTreatments;
    return allTreatments.filter((t) => t.toLowerCase().includes(filterSearch.toLowerCase()));
  }, [allTreatments, filterSearch]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-teal-600" /> Filters
        </h3>
        <button type="button" onClick={onReset} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold text-foreground/80">State</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All states" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold text-foreground/80">City</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All cities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {allCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold text-foreground/80">Treatment</Label>
          <div className="relative mb-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search treatments..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-muted/20 border-0"
            />
          </div>
          <Select value={treatment} onValueChange={setTreatment}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select specialty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All treatments</SelectItem>
              {filteredTreatments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold text-foreground/80">Care Format</Label>
          <Select value={careFormat} onValueChange={setCareFormat}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="telehealth">Telehealth Only</SelectItem>
              <SelectItem value="in-person">In-Person Only</SelectItem>
              <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {demosAvailable && (
          <label className="flex items-center justify-between text-xs text-foreground/80">
            <span>Include Demo Profiles</span>
            <Switch checked={includeDemos} onCheckedChange={setIncludeDemos} className="scale-75" />
          </label>
        )}

        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-muted/40"
          aria-expanded={moreFiltersOpen}
          onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
        >
          <span className="inline-flex items-center gap-1.5"><SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" /> More Filters</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition", moreFiltersOpen && "rotate-180")} />
        </button>

        {moreFiltersOpen && (
          <div className="space-y-4 border-t border-border pt-4">
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Distance radius</Label>
              <Select value={distanceRadius} onValueChange={setDistanceRadius}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Any distance" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any distance</SelectItem>
                  <SelectItem value="10">Within 10 miles</SelectItem>
                  <SelectItem value="25">Within 25 miles</SelectItem>
                  <SelectItem value="50">Within 50 miles</SelectItem>
                  <SelectItem value="100">Within 100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Consultation availability</Label>
              <Select value={consultationAvailability} onValueChange={setConsultationAvailability}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Any availability" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any availability</SelectItem>
                  <SelectItem value="soon">Within 7 days</SelectItem>
                  <SelectItem value="month">Within 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Any language" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any language</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="Mandarin">Mandarin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Provider Type</Label>
              <Select value={providerType} onValueChange={setProviderType}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Physician">Physician / MD / DO</SelectItem>
                  <SelectItem value="Nurse Practitioner">Nurse Practitioner (NP)</SelectItem>
                  <SelectItem value="Physician Assistant">Physician Assistant (PA)</SelectItem>
                  <SelectItem value="Registered Nurse">Registered Nurse (RN)</SelectItem>
                  <SelectItem value="Medical Director">Medical Director</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Clinic Type</Label>
              <Select value={clinicType} onValueChange={setClinicType}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="longevity">Longevity Clinic</SelectItem>
                  <SelectItem value="weight">Medical Weight Loss</SelectItem>
                  <SelectItem value="telehealth-provider">Purely Telehealth</SelectItem>
                  <SelectItem value="independent">Independent Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing & Insurance</Label>
              <Select value={pricingStatus} onValueChange={setPricingStatus}>
                <SelectTrigger className="h-8.5 text-xs"><SelectValue placeholder="Pricing transparency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Pricing Status</SelectItem>
                  <SelectItem value="Full Pricing Published">Full Pricing Published</SelectItem>
                  <SelectItem value="Partial Pricing Published">Partial Pricing</SelectItem>
                  <SelectItem value="Consultation Pricing Available">Consultation Pricing</SelectItem>
                  <SelectItem value="Contact Clinic for Pricing">Contact Clinic</SelectItem>
                </SelectContent>
              </Select>
              <label className="flex items-center justify-between text-xs text-foreground/80">
                <span>Accepts Insurance</span>
                <Switch checked={insuranceAccepted} onCheckedChange={setInsuranceAccepted} className="scale-75" />
              </label>
              <label className="flex items-center justify-between text-xs text-foreground/80">
                <span>Accepts HSA / FSA</span>
                <Switch checked={hsaFsaAccepted} onCheckedChange={setHsaFsaAccepted} className="scale-75" />
              </label>
              <label className="flex items-center justify-between text-xs text-foreground/80">
                <span>Financing available</span>
                <Switch checked={financingAvailable} onCheckedChange={setFinancingAvailable} className="scale-75" />
              </label>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capabilities & Status</Label>
              <label className="flex items-center justify-between text-xs text-foreground/80">
                <span>On-site Lab / Phlebotomy</span>
                <Switch checked={onSiteLab} onCheckedChange={setOnSiteLab} className="scale-75" />
              </label>
              <label className="flex items-center justify-between text-xs text-foreground/80">
                <span>Accepting New Patients</span>
                <Switch checked={acceptingNewPatients} onCheckedChange={setAcceptingNewPatients} className="scale-75" />
              </label>
              <label className="flex items-center justify-between text-xs text-foreground/80">
                <span>Verified Only</span>
                <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} className="scale-75" />
              </label>
              <div className="grid gap-1.5 pt-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Claim Status</Label>
                <Select value={claimedStatus} onValueChange={setClaimedStatus}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clinics</SelectItem>
                    <SelectItem value="claimed">Claimed Profile</SelectItem>
                    <SelectItem value="unclaimed">Unclaimed Listing</SelectItem>
                    <SelectItem value="demo">Demo Profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <Button type="button" className="w-full bg-teal-600 text-white hover:bg-teal-700" onClick={onApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

/* ── Clinic Card Component ──────────────────────────────────── */
function ClinicCard({ clinic, view }: { clinic: ClinicT; view: string }) {
  const saved = useSaved((s) => s.has("clinic", clinic.id));
  const toggleSave = useSaved((s) => s.toggle);
  const compareHas = useCompare((s) => s.has("clinic", clinic.id));
  const compareToggle = useCompare((s) => s.toggle);
  const c = colorClasses(clinic.logoColor);
  const status = resolveListingStatus(clinic);
  const isDemo = status === "demo";

  const allSpecs = useMemo(() => splitCsv(clinic.specialties), [clinic.specialties]);
  const specs = allSpecs.slice(0, 3);

  const profileHref = clinicProfilePath(clinic);
  const claimHref = `/clinics/apply?claim=1&clinicId=${encodeURIComponent(clinic.id)}&slug=${encodeURIComponent(clinic.slug)}&name=${encodeURIComponent(clinic.name)}`;
  const canClaim = isClaimable(clinic);
  const accepting = confirmedAcceptingNewPatients(clinic);
  const insurance = confirmedInsuranceAccepted(clinic);
  const hsa = confirmedHsaFsaAccepted(clinic);
  const careFormat = confirmedTelehealth(clinic);
  const description = clinic.tagline ?? clinic.overview;

  const trackProfileClick = () => {
    captureSafeEvent("directory_profile_clicked", {
      clinic_id: clinic.id,
      clinic_slug: clinic.slug,
      listing_status: status,
      verification_status: clinic.verificationStatus,
      city: clinic.city,
      state: clinic.state,
      view_mode: view,
    });
    if (isDemo) {
      captureSafeEvent("directory_demo_profile_viewed", {
        clinic_id: clinic.id,
        clinic_slug: clinic.slug,
        listing_status: "demo",
        city: clinic.city,
        state: clinic.state,
      });
    } else if (status === "unclaimed") {
      captureSafeEvent("directory_unclaimed_profile_viewed", {
        clinic_id: clinic.id,
        clinic_slug: clinic.slug,
        listing_status: "unclaimed",
        city: clinic.city,
        state: clinic.state,
      });
    }
  };

  const metaPills = (
    <div className="flex flex-wrap gap-1.5 text-[11px]">
      {careFormat === "telehealth" && <StatusPill tone="teal"><Video className="h-3 w-3" /> Telehealth</StatusPill>}
      {careFormat === "in-person" && <StatusPill tone="muted"><Building2 className="h-3 w-3" /> In-person</StatusPill>}
      {careFormat === "hybrid" && <StatusPill tone="teal"><Video className="h-3 w-3" /> Hybrid care</StatusPill>}
      {accepting === true && <StatusPill tone="emerald">Accepting new patients</StatusPill>}
      {insurance === true && <StatusPill tone="sky">Insurance listed</StatusPill>}
      {hsa === true && <StatusPill tone="sky">HSA/FSA</StatusPill>}
      {clinic.financingAvailable === true && status !== "demo" && <StatusPill tone="sky">Financing</StatusPill>}
    </div>
  );

  const renderSpecs = () => (
    <div className="flex flex-wrap gap-1">
      {specs.map((s) => (
        <Badge key={s} variant="outline" className="border-teal-100 bg-teal-50/30 text-[10px] text-teal-800">
          {s}
        </Badge>
      ))}
      {allSpecs.length > specs.length && (
        <Badge variant="outline" className="border-border bg-muted/30 text-[10px] text-muted-foreground">
          +{allSpecs.length - specs.length} more
        </Badge>
      )}
    </div>
  );

  const secondaryAction = isDemo ? (
    <a href={profileHref} onClick={trackProfileClick} className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline">
      About this demo profile
    </a>
  ) : canClaim ? (
    <a
      href={claimHref}
      className="text-xs font-medium text-amber-800 underline-offset-2 hover:underline"
      onClick={() =>
        captureSafeEvent("directory_claim_clicked", {
          clinic_id: clinic.id,
          clinic_slug: clinic.slug,
          listing_status: status,
          city: clinic.city,
          state: clinic.state,
        })
      }
    >
      Own this clinic? Claim listing
    </a>
  ) : null;

  if (view === "list") {
    return (
      <PremiumCard hover className="overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <a href={profileHref} onClick={trackProfileClick} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-muted" aria-label={`View profile for ${clinic.name}`}>
            <SmartImage
              src={getClinicImage(clinic.slug)}
              alt=""
              fill
              sizes="112px"
              imgClassName="object-cover"
              fallback={
                <div className={cn("flex h-full w-full items-center justify-center", c.soft)}>
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white", c.bg)}>{initials(clinic.name)}</span>
                </div>
              }
            />
          </a>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <a href={profileHref} onClick={trackProfileClick} className="text-base font-semibold text-foreground hover:text-teal-700 text-left">{clinic.name}</a>
              <ListingStatusBadge clinic={clinic} />
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {clinic.city}, {clinic.state}
            </p>
            {description && <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>}
            {renderSpecs()}
            {metaPills}
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end justify-between self-stretch">
            <div className="flex gap-1.5">
              <SaveButton
                saved={saved}
                onToggle={() => {
                  if (!saved) captureSafeEvent("clinic_saved", { clinic_slug: clinic.slug });
                  toggleSave("clinic", clinic.id);
                }}
                size="sm"
                label="Save"
              />
              <button
                type="button"
                onClick={() => compareToggle("clinic", clinic.id)}
                className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg border transition", compareHas ? "border-teal-300 bg-teal-50 text-teal-700" : "border-border bg-card text-muted-foreground hover:border-teal-200 hover:text-teal-700")}
                aria-label={compareHas ? `Remove ${clinic.name} from compare` : `Compare ${clinic.name}`}
              >
                <GitCompare className="h-4 w-4" />
              </button>
            </div>
            <Button asChild size="sm" variant="outline" className="border-border hover:border-teal-200 font-semibold">
              <a href={profileHref} onClick={trackProfileClick}>View Profile</a>
            </Button>
            {secondaryAction}
          </div>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard hover className="group overflow-hidden flex flex-col justify-between h-full">
      <div>
        <div className="relative h-36 overflow-hidden bg-muted">
          <SmartImage
            src={getClinicImage(clinic.slug)}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="transition duration-500 group-hover:scale-103"
            imgClassName="object-cover"
            fallback={
              <div className={cn("flex h-full w-full items-center justify-center", c.soft)}>
                <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm", c.bg)}>{initials(clinic.name)}</span>
              </div>
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" aria-hidden />
          <div className="absolute left-3 bottom-3 flex items-center gap-2">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white shadow-premium-sm ring-2 ring-background", c.bg)}>{initials(clinic.name)}</span>
            <ListingStatusBadge clinic={clinic} />
          </div>
          <div className="absolute right-3 top-3 flex gap-1.5">
            <SaveButton
              saved={saved}
              onToggle={() => {
                if (!saved) captureSafeEvent("clinic_saved", { clinic_slug: clinic.slug });
                toggleSave("clinic", clinic.id);
              }}
              size="sm"
            />
            <button
              type="button"
              onClick={() => compareToggle("clinic", clinic.id)}
              className={cn("inline-flex h-7 w-7 items-center justify-center rounded-lg border transition", compareHas ? "border-teal-300 bg-teal-50 text-teal-700" : "border-border bg-card/80 text-muted-foreground hover:border-teal-200 hover:text-teal-700")}
              aria-label={compareHas ? `Remove ${clinic.name} from compare` : `Compare ${clinic.name}`}
            >
              <GitCompare className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <a href={profileHref} onClick={trackProfileClick} className="block text-left">
            <h3 className="text-base font-semibold leading-tight text-foreground group-hover:text-teal-700 transition">{clinic.name}</h3>
          </a>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {clinic.city}, {clinic.state}
          </p>
          {description && <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">{description}</p>}
          {renderSpecs()}
          {metaPills}
        </div>
      </div>

      <div className="px-5 pb-5 pt-1 border-t border-border/40 mt-auto flex flex-col gap-2">
        <Button asChild size="sm" className="w-full bg-teal-600 text-white hover:bg-teal-700 shadow-premium-sm font-semibold">
          <a href={profileHref} onClick={trackProfileClick}>View Profile</a>
        </Button>
        {secondaryAction}
      </div>
    </PremiumCard>
  );
}

/* ── Map View Component ─────────────────────────────────────── */
function MapView({ clinics }: { clinics: ClinicT[] }) {
  const [selected, setSelected] = useState<ClinicT | null>(clinics[0] ?? null);
  const color = selected ? colorClasses(selected.logoColor) : null;

  return (
    <PremiumCard className="overflow-hidden shadow-premium-sm border-border">
      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        {/* Map canvas placeholder */}
        <div className="relative h-[420px] overflow-hidden bg-teal-50/40 lg:h-[500px]">
          <div className="novalyte-grid absolute inset-0 opacity-50" aria-hidden />
          <div className="novalyte-dots absolute inset-0 opacity-30" aria-hidden />
          
          {/* Map pins — position by lat/lng when available */}
          {clinics.map((c, i) => {
            const fallback = [
              { top: "15%", left: "20%" }, { top: "30%", left: "65%" }, { top: "55%", left: "25%" },
              { top: "70%", left: "60%" }, { top: "40%", left: "45%" }, { top: "25%", left: "35%" },
              { top: "60%", left: "75%" }, { top: "80%", left: "40%" }, { top: "45%", left: "80%" },
              { top: "85%", left: "20%" },
            ][i % 10];
            const pos =
              c.latitude != null && c.longitude != null
                ? {
                    top: `${Math.min(88, Math.max(8, ((49 - c.latitude) / 24) * 100))}%`,
                    left: `${Math.min(90, Math.max(8, ((c.longitude + 125) / 55) * 100))}%`,
                  }
                : fallback;
            const active = selected?.id === c.id;
            const demo = resolveListingStatus(c) === "demo";

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelected(c);
                  captureSafeEvent("directory_map_pin_opened", {
                    clinic_id: c.id,
                    clinic_slug: c.slug,
                    listing_status: resolveListingStatus(c),
                  });
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={pos}
                aria-label={`Select ${c.name}${demo ? " (demo profile)" : ""}`}
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 border-white shadow-premium-sm transition duration-300",
                    active ? "h-9 w-9" : "h-7 w-7 hover:scale-105",
                    demo ? (active ? "bg-slate-600" : "bg-slate-500 hover:bg-slate-600") : active ? "bg-teal-600" : "bg-teal-500 hover:bg-teal-600",
                  )}
                >
                  <MapPin className={cn("text-white", active ? "h-4.5 w-4.5" : "h-3.5 w-3.5")} />
                </span>
                {active && <span className="novalyte-pulse-ring absolute inset-0 rounded-full bg-teal-400/40 animate-ping" />}
              </button>
            );
          })}
          
          <div className="absolute bottom-3 left-3 rounded-lg border border-border bg-card/90 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground shadow-sm backdrop-blur">
            Map view · {clinics.length} clinics plotted · slate pins = demo profiles
          </div>
        </div>

        {/* Selected Clinic Sidebar */}
        <div className="border-t border-border p-5 lg:border-l lg:border-t-0 bg-card flex flex-col justify-between">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white", color?.bg)}>
                  {initials(selected.name)}
                </span>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-foreground leading-tight">{selected.name}</h4>
                  <p className="flex items-center gap-0.5 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" /> {selected.city}, {selected.state}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                <ListingStatusBadge clinic={selected} />
                {selected.telehealth && <Badge className="bg-teal-50 text-teal-700 text-[10px] font-medium border-teal-100 hover:bg-teal-50">Telehealth</Badge>}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{selected.tagline ?? selected.overview}</p>
              
              <div className="space-y-1 text-xs border-t border-border/50 pt-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Care format</span><span className="font-medium text-foreground">{selected.telehealth ? "Telehealth listed" : "Confirm with clinic"}</span></div>
                {selected.providerTypes ? (
                  <div className="flex justify-between"><span className="text-muted-foreground">Provider Types</span><span className="font-medium text-foreground truncate max-w-[140px]">{selected.providerTypes}</span></div>
                ) : null}
              </div>

              <Button asChild size="sm" className="w-full bg-teal-600 text-white hover:bg-teal-700 shadow-premium-sm font-semibold mt-2">
                <a href={clinicProfilePath(selected)}>
                  View Profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center h-full"><HelpCircle className="h-8 w-8 text-muted-foreground/40 mb-2" /> Select a pin to view clinic details</p>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}

/* ── Guided Discovery Wizard Component ─────────────────────── */
type GuidedWizardState = {
  step: number;
  concern: string;
  state: string;
  treatment: string;
  careFormat: string;
  pricingModel: string;
};

function GuidedDiscoveryWizard({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (filters: Partial<GuidedWizardState>) => void;
}) {
  const [step, setStep] = useState(0);
  const [concern, setConcern] = useState("");
  const [state, setState] = useState("");
  const [careFormat, setCareFormat] = useState("");
  const [pricingModel, setPricingModel] = useState("");

  const handleComplete = () => {
    // Map patient concern option to actual treatment category slug
    const mapping: Record<string, string> = {
      trt: "Testosterone Replacement Therapy (TRT)",
      ed: "Erectile Dysfunction Care",
      weight: "GLP-1 Medical Weight Loss Program",
      longevity: "Longevity & Healthspan Assessment",
      hair: "Hair Restoration Treatment",
    };

    onComplete({
      state,
      treatment: mapping[concern] || "all",
      careFormat: careFormat || "all",
      pricingModel: pricingModel || "all",
    });
    
    // reset state
    setStep(0);
    setConcern("");
    setState("");
    setCareFormat("");
    setPricingModel("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-6 rounded-2xl bg-card border border-border shadow-premium-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5 text-base font-semibold text-teal-950">
            <Sparkles className="h-5 w-5 text-teal-600 animate-pulse" /> Clinic Discovery Assistant
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Let's find the best care match. Step {step + 1} of 4
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 min-h-[160px] flex flex-col justify-center">
          {step === 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-teal-900">What primary concern brings you here?</Label>
              <div className="grid gap-2">
                {[
                  { value: "trt", label: "Low testosterone, lack of energy, or TRT interest" },
                  { value: "ed", label: "Erectile difficulties, libido, or sexual wellness" },
                  { value: "weight", label: "Medical weight loss, GLP-1, or metabolism" },
                  { value: "hair", label: "Hair loss or restoration therapies" },
                  { value: "longevity", label: "Longevity medicine, biomarkers, and healthspan" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setConcern(item.value)}
                    className={cn("w-full text-left p-3 rounded-lg border text-xs font-semibold transition", 
                      concern === item.value ? "border-teal-500 bg-teal-50/50 text-teal-950" : "border-border bg-card hover:bg-muted/30 text-foreground/80")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-teal-900">Which state do you currently reside in?</Label>
              <p className="text-[11px] text-muted-foreground">This ensures matching clinics are licensed to treat patients in your state.</p>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="w-full text-xs h-10"><SelectValue placeholder="Select your state" /></SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-teal-900">Do you prefer telehealth or in-person visits?</Label>
              <div className="grid gap-2">
                {[
                  { value: "telehealth", label: "100% Remote / Telehealth consultation", desc: "No travel required; medication and lab orders coordinated online." },
                  { value: "in-person", label: "In-Person physical clinic visit", desc: "Allows face-to-face physician exams and on-site phlebotomy." },
                  { value: "hybrid", label: "Hybrid care model", desc: "Initial visit in-person with ongoing telehealth monitoring." },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setCareFormat(item.value)}
                    className={cn("w-full text-left p-3 rounded-lg border transition", 
                      careFormat === item.value ? "border-teal-500 bg-teal-50/50 text-teal-950" : "border-border bg-card hover:bg-muted/30 text-foreground/80")}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-teal-900">Are you looking for insurance-based or self-pay options?</Label>
              <div className="grid gap-2">
                {[
                  { value: "insurance", label: "Insurance-based care coverage", desc: "Clinic files claims with major insurance providers (co-pays apply)." },
                  { value: "self-pay", label: "Direct-Pay / Self-Pay membership options", desc: "Transparent upfront monthly fees (HSA/FSA cards often accepted)." },
                  { value: "all", label: "Open to either payment model", desc: "Show all matching clinics." },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setPricingModel(item.value)}
                    className={cn("w-full text-left p-3 rounded-lg border transition", 
                      pricingModel === item.value ? "border-teal-500 bg-teal-50/50 text-teal-950" : "border-border bg-card hover:bg-muted/30 text-foreground/80")}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between border-t border-border pt-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-xs font-semibold"
          >
            Back
          </Button>

          {step < 3 ? (
            <Button
              size="sm"
              disabled={
                (step === 0 && !concern) ||
                (step === 1 && !state) ||
                (step === 2 && !careFormat)
              }
              onClick={() => setStep((s) => s + 1)}
              className="bg-teal-600 text-white hover:bg-teal-700 font-semibold"
            >
              Continue
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={!pricingModel}
              onClick={handleComplete}
              className="bg-teal-600 text-white hover:bg-teal-700 font-semibold flex items-center gap-1"
            >
              Show Matches <Sparkles className="h-3.5 w-3.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
