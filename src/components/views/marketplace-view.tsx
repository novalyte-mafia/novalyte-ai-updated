"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { CTASection } from "@/components/shared/cta";
import {
  PremiumCard,
  EmptyState,
  FilterChip,
  ViewToggle,
  SaveButton,
  CardSkeleton,
} from "@/components/shared/enterprise";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { colorClasses, MARKETPLACE_CATEGORIES } from "@/lib/constants";
import type { MarketplaceListingT, VendorT } from "@/lib/types";
import { navigate, useSaved, useCompare } from "@/lib/nav";
import { cn } from "@/lib/utils";
import {
  Search,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Package,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ShieldCheck,
  Quote,
  FileBarChart,
  Store,
  LayoutDashboard,
  Image as ImageIcon,
  Inbox,
  MessageSquare,
  Wallet,
  Banknote,
  Users,
  Megaphone,
  CreditCard,
  BadgeCheck,
  FlaskConical,
  Syringe,
  Droplet,
  Armchair,
  Activity,
  HeartPulse,
  Video,
  Monitor,
  Building2,
  ClipboardCheck,
  Stethoscope,
  Clock,
  X,
  GitCompare,
} from "lucide-react";

/* ───────────────────────────────────────────────────────────────
   Category icon (stable wrapper — uses switch with literal JSX so the
   React Compiler treats it as a static element)
   ─────────────────────────────────────────────────────────────── */
function CategoryIcon({ category, className }: { category: string; className?: string }) {
  switch (category) {
    case "Laboratory Services": return <FlaskConical className={className} />;
    case "Diagnostic Equipment": return <Activity className={className} />;
    case "Injection Supplies": return <Syringe className={className} />;
    case "Phlebotomy Supplies": return <Droplet className={className} />;
    case "Medical Furniture": return <Armchair className={className} />;
    case "Body-Composition Systems": return <Stethoscope className={className} />;
    case "Recovery Technology": return <HeartPulse className={className} />;
    case "Telehealth Tools": return <Video className={className} />;
    case "Clinic Software": return <Monitor className={className} />;
    case "Billing Services": return <CreditCard className={className} />;
    case "Credentialing Services": return <BadgeCheck className={className} />;
    case "Compliance Support": return <ShieldCheck className={className} />;
    case "Marketing Services": return <Megaphone className={className} />;
    case "Staffing Services": return <Users className={className} />;
    case "Patient Engagement Tools": return <MessageSquare className={className} />;
    case "Clinic Expansion Services": return <Building2 className={className} />;
    default: return <Package className={className} />;
  }
}

/* ───────────────────────────────────────────────────────────────
   Availability + pricing + type helpers
   ─────────────────────────────────────────────────────────────── */
type AvailTone = "teal" | "amber" | "sky" | "violet";

function availabilityMeta(av: string): { tone: AvailTone; label: string } {
  const a = av.toLowerCase();
  if (a.includes("order")) return { tone: "amber", label: "Made to order" };
  if (a.includes("limit")) return { tone: "violet", label: "Limited" };
  if (a.includes("pre") || a.includes("back")) return { tone: "sky", label: "Pre-order" };
  return { tone: "teal", label: "In stock" };
}

const EQUIPMENT_CATEGORIES = new Set([
  "Diagnostic Equipment",
  "Body-Composition Systems",
  "Recovery Technology",
  "Medical Furniture",
  "Telehealth Tools",
]);

function showsFinancingTag(listing: MarketplaceListingT): boolean {
  return listing.listingType === "product" && EQUIPMENT_CATEGORIES.has(listing.category);
}

function vendorIdForName(vendors: VendorT[], name: string): string | undefined {
  return vendors.find((v) => v.name === name)?.id;
}

const PRICING_MODELS = [
  { value: "one-time", label: "One-time" },
  { value: "subscription", label: "Subscription" },
  { value: "quote", label: "Quote-based" },
  { value: "range", label: "Price range" },
  { value: "per-test", label: "Per-test" },
  { value: "percentage", label: "Percentage" },
];

const AVAILABILITY_FILTERS = [
  { value: "in-stock", label: "In stock" },
  { value: "made-to-order", label: "Made to order" },
  { value: "limited", label: "Limited" },
  { value: "preorder", label: "Pre-order" },
];

const PAGE_SIZE = 9;

/* ───────────────────────────────────────────────────────────────
   Hero trust indicators (qualitative only — no fake numbers)
   ─────────────────────────────────────────────────────────────── */
const HERO_TRUST = [
  { icon: ShieldCheck, label: "Verified supplier badges" },
  { icon: Quote, label: "Quote & bulk-order workflows" },
  { icon: Banknote, label: "Equipment financing indicators" },
  { icon: ClipboardCheck, label: "Clinical-claim moderation" },
];

const VENDOR_PORTAL_FEATURES = [
  { icon: Store, title: "Create profile", desc: "Establish your vendor identity with company overview, capabilities, and verification." },
  { icon: Package, title: "Submit products & services", desc: "List equipment, software, services, and subscriptions with structured pricing." },
  { icon: ImageIcon, title: "Upload media", desc: "Add banners, logos, and category tags so clinics can quickly evaluate fit." },
  { icon: LayoutDashboard, title: "Manage listings", desc: "Edit pricing, availability, and descriptions across your entire catalog." },
  { icon: Inbox, title: "Receive inquiries", desc: "Get quote requests and questions routed directly from clinic buyers." },
  { icon: MessageSquare, title: "Respond to quotes", desc: "Reply with quantities, lead times, financing, and fulfillment details." },
  { icon: FileBarChart, title: "Track performance", desc: "Monitor listing engagement and inquiries without vanity metrics." },
  { icon: Wallet, title: "Manage billing", desc: "Subscription and commission terms reviewed during onboarding." },
];

const SAFETY_REVIEW_TYPES = [
  { label: "Vendor verification", icon: ShieldCheck },
  { label: "Product review", icon: Package },
  { label: "Service review", icon: ClipboardCheck },
  { label: "Claim review", icon: FileBarChart },
  { label: "Category approval", icon: BadgeCheck },
  { label: "Listing approval", icon: CheckCircle2 },
];

/* ───────────────────────────────────────────────────────────────
   Main view
   ─────────────────────────────────────────────────────────────── */
export function MarketplaceView({
  listings,
  vendors,
  onGetStarted,
}: {
  listings: MarketplaceListingT[];
  vendors: VendorT[];
  onGetStarted: () => void;
}) {
  /* Filter state */
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [listingType, setListingType] = useState<string>("all");
  const [vendorName, setVendorName] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [pricingModel, setPricingModel] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");

  /* UI state */
  const [sort, setSort] = useState("relevant");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quoteListing, setQuoteListing] = useState<MarketplaceListingT | null>(null);

  /* Derive select options from listings */
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(listings.map((l) => l.category))).sort();
  }, [listings]);
  const uniqueListingTypes = useMemo(() => {
    return Array.from(new Set(listings.map((l) => l.listingType))).sort();
  }, [listings]);
  const uniqueVendors = useMemo(() => {
    return Array.from(new Set(listings.map((l) => l.vendorName))).sort();
  }, [listings]);
  const uniquePricingModels = useMemo(() => {
    const present = new Set(listings.map((l) => l.pricingModel).filter(Boolean));
    return PRICING_MODELS.filter((m) => present.has(m.value));
  }, [listings]);

  /* Reset to page 1 + brief loading shimmer whenever filters change.
     Using the "adjusting state during render" pattern (endorsed by React docs)
     to avoid cascading setState-in-effect warnings. */
  const filterKey = `${query}|${category}|${listingType}|${vendorName}|${verifiedOnly}|${pricingModel}|${availability}|${sort}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
    setLoading(true);
  }

  // Clear the loading shimmer 300ms after filters settle.
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [loading, filterKey]);

  /* Filter + sort */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = listings.filter((l) => {
      if (q) {
        const hay = `${l.title} ${l.vendorName} ${l.description} ${l.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (category !== "all" && l.category !== category) return false;
      if (listingType !== "all" && l.listingType !== listingType) return false;
      if (vendorName !== "all" && l.vendorName !== vendorName) return false;
      if (verifiedOnly && !l.verified) return false;
      if (pricingModel !== "all" && l.pricingModel !== pricingModel) return false;
      if (availability !== "all") {
        const meta = availabilityMeta(l.availability);
        const expected = AVAILABILITY_FILTERS.find((a) => a.value === availability);
        if (expected && meta.label.toLowerCase() !== expected.label.toLowerCase()) return false;
      }
      return true;
    });

    if (sort === "az") {
      out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "verified") {
      out = [...out].sort((a, b) => Number(b.verified) - Number(a.verified));
    } else if (sort === "category") {
      out = [...out].sort((a, b) => a.category.localeCompare(b.category));
    }
    return out;
  }, [listings, query, category, listingType, vendorName, verifiedOnly, pricingModel, availability, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setListingType("all");
    setVendorName("all");
    setVerifiedOnly(false);
    setPricingModel("all");
    setAvailability("all");
  }

  function scrollToCatalog() {
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectCategory(cat: string) {
    setCategory(cat);
    scrollToCatalog();
  }

  /* Applied filter chips */
  const chips: { label: string; onRemove: () => void }[] = [];
  if (query.trim()) chips.push({ label: `“${query.trim()}”`, onRemove: () => setQuery("") });
  if (category !== "all") chips.push({ label: category, onRemove: () => setCategory("all") });
  if (listingType !== "all") chips.push({ label: listingType, onRemove: () => setListingType("all") });
  if (vendorName !== "all") chips.push({ label: vendorName, onRemove: () => setVendorName("all") });
  if (pricingModel !== "all") {
    const m = PRICING_MODELS.find((p) => p.value === pricingModel);
    if (m) chips.push({ label: m.label, onRemove: () => setPricingModel("all") });
  }
  if (availability !== "all") {
    const a = AVAILABILITY_FILTERS.find((x) => x.value === availability);
    if (a) chips.push({ label: a.label, onRemove: () => setAvailability("all") });
  }
  if (verifiedOnly) chips.push({ label: "Verified only", onRemove: () => setVerifiedOnly(false) });

  /* Verified vendors (directory preview) */
  const verifiedVendors = useMemo(() => vendors.filter((v) => v.verified), [vendors]);
  const listingCountByVendor = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of listings) m[l.vendorName] = (m[l.vendorName] ?? 0) + 1;
    return m;
  }, [listings]);

  return (
    <>
      {/* ── 1. Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-16 sm:py-24">
        <div className="novalyte-dots novalyte-radial-fade pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Healthcare Services Marketplace"
            title={
              <>
                The B2B Commerce Platform for{" "}
                <span className="text-teal-700">Men&apos;s Health Operations</span>
              </>
            }
            description="Source labs, equipment, supplies, software, billing, credentialing, compliance, marketing, and staffing — specialized for healthcare operations and clinical equipment procurement. Built for clinics buying, vendors selling, and the operational workflows in between."
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onGetStarted}>
              Become a Vendor <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToCatalog}>
              <ArrowDown className="mr-1 h-4 w-4" /> Browse Catalog
            </Button>
          </div>

          {/* Qualitative trust indicators (no fake numbers) */}
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {HERO_TRUST.map((t) => {
              const Icon = t.icon;
              return (
                <PremiumCard key={t.label} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-medium leading-snug text-foreground">{t.label}</p>
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. Category navigation bar (sticky) ───────────────── */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="novalyte-scroll -mb-px flex items-center gap-1 overflow-x-auto py-2">
            <button
              onClick={() => selectCategory("all")}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                category === "all"
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-border bg-card text-muted-foreground hover:border-teal-300 hover:text-teal-700",
              )}
            >
              All categories
            </button>
            {MARKETPLACE_CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => selectCategory(cat)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-border bg-card text-muted-foreground hover:border-teal-300 hover:text-teal-700",
                  )}
                >
                  <CategoryIcon category={cat} className="h-3.5 w-3.5" />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 3. Listings section ───────────────────────────────── */}
      <SectionShell id="listings" className="!pt-10 !pb-16">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Desktop filter sidebar (sticky) */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <FiltersPanel
                query={query}
                setQuery={setQuery}
                category={category}
                setCategory={setCategory}
                listingType={listingType}
                setListingType={setListingType}
                vendorName={vendorName}
                setVendorName={setVendorName}
                verifiedOnly={verifiedOnly}
                setVerifiedOnly={setVerifiedOnly}
                pricingModel={pricingModel}
                setPricingModel={setPricingModel}
                availability={availability}
                setAvailability={setAvailability}
                uniqueCategories={uniqueCategories}
                uniqueListingTypes={uniqueListingTypes}
                uniqueVendors={uniqueVendors}
                uniquePricingModels={uniquePricingModels}
                onReset={resetFilters}
              />
            </div>
          </aside>

          {/* Main column */}
          <div>
            {/* Mobile filter trigger */}
            <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
                    {chips.length > 0 && (
                      <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[11px] font-semibold text-white">
                        {chips.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-sm">
                  <SheetHeader>
                    <SheetTitle>Filter catalog</SheetTitle>
                    <SheetDescription>Refine the marketplace listings.</SheetDescription>
                  </SheetHeader>
                  <div className="p-4">
                    <FiltersPanel
                      query={query}
                      setQuery={setQuery}
                      category={category}
                      setCategory={setCategory}
                      listingType={listingType}
                      setListingType={setListingType}
                      vendorName={vendorName}
                      setVendorName={setVendorName}
                      verifiedOnly={verifiedOnly}
                      setVerifiedOnly={setVerifiedOnly}
                      pricingModel={pricingModel}
                      setPricingModel={setPricingModel}
                      availability={availability}
                      setAvailability={setAvailability}
                      uniqueCategories={uniqueCategories}
                      uniqueListingTypes={uniqueListingTypes}
                      uniqueVendors={uniqueVendors}
                      uniquePricingModels={uniquePricingModels}
                      onReset={resetFilters}
                    />
                    <Button className="mt-4 w-full bg-teal-600 text-white hover:bg-teal-700" onClick={() => setMobileFiltersOpen(false)}>
                      Show {filtered.length} result{filtered.length === 1 ? "" : "s"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <ViewToggle
                value={view}
                onChange={setView}
                options={[
                  { value: "grid", label: "Grid", icon: LayoutGrid },
                  { value: "list", label: "List", icon: List },
                ]}
              />
            </div>

            {/* Results header */}
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-premium-xs sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-foreground">{listings.length}</span> products
                  &amp; services
                </p>
                {chips.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {chips.map((c, i) => (
                      <FilterChip key={i} label={c.label} onRemove={c.onRemove} />
                    ))}
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition hover:text-rose-600"
                    >
                      <X className="h-3 w-3" /> Clear all
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Sort</Label>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger size="sm" className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevant">Most relevant</SelectItem>
                      <SelectItem value="az">A–Z</SelectItem>
                      <SelectItem value="verified">Verified first</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="hidden lg:block">
                  <ViewToggle
                    value={view}
                    onChange={setView}
                    options={[
                      { value: "grid", label: "Grid", icon: LayoutGrid },
                      { value: "list", label: "List", icon: List },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Results grid */}
            {loading ? (
              <div
                className={cn(
                  "grid gap-5",
                  view === "grid"
                    ? "sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1",
                )}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : paged.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No listings match your filters"
                description="Try widening your search or clearing filters to see more products & services."
                action={
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div
                className={cn(
                  "novalyte-fade-up grid gap-5",
                  view === "grid"
                    ? "sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1",
                )}
              >
                {paged.map((l) => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    vendors={vendors}
                    view={view}
                    onQuote={() => setQuoteListing(l)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > PAGE_SIZE && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-disabled={page === 1}
                        className={cn(page === 1 && "pointer-events-none opacity-40")}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const n = i + 1;
                      // Compact pagination: show first, last, current ±1, with ellipsis handled by clamping
                      const show =
                        n === 1 ||
                        n === totalPages ||
                        Math.abs(n - page) <= 1;
                      if (!show) {
                        if (n === page - 2 || n === page + 2) {
                          return (
                            <PaginationItem key={n}>
                              <span className="flex h-9 w-9 items-center justify-center text-muted-foreground">
                                …
                              </span>
                            </PaginationItem>
                          );
                        }
                        return null;
                      }
                      return (
                        <PaginationItem key={n}>
                          <PaginationLink
                            isActive={n === page}
                            onClick={(e: React.MouseEvent) => {
                              e.preventDefault();
                              setPage(n);
                            }}
                          >
                            {n}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        aria-disabled={page === totalPages}
                        className={cn(page === totalPages && "pointer-events-none opacity-40")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </SectionShell>

      {/* ── 4. Vendor directory preview ──────────────────────── */}
      <SectionShell tone="muted">
        <SectionHeading
          eyebrow="Vendor Directory"
          title="Verified suppliers powering men's health operations"
          description="Each vendor goes through a structured verification process. Browse the full vendor profile to review their catalog, capabilities, and review status."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {verifiedVendors.map((v) => {
            const count = listingCountByVendor[v.name] ?? 0;
            return (
              <PremiumCard key={v.id} hover className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-base font-bold text-white">
                    {v.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-base font-semibold text-foreground">{v.name}</h3>
                      <VerificationBadge verified={v.verified} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {v.overview || "Vendor overview available on profile."}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{count}</span> active listing
                    {count === 1 ? "" : "s"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("vendor-profile", undefined, { id: v.id })}
                  >
                    View vendor profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </PremiumCard>
            );
          })}
        </div>
      </SectionShell>

      {/* ── 5. Vendor portal preview ─────────────────────────── */}
      <SectionShell>
        <SectionHeading
          eyebrow="Vendor Portal"
          title="Everything vendors need to sell to men's health clinics"
          description="A purpose-built commerce workflow for healthcare suppliers — from company profile through inquiry routing and billing."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VENDOR_PORTAL_FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <PremiumCard key={f.title} hover className="p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </PremiumCard>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onGetStarted}>
            Become a Vendor <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </SectionShell>

      {/* ── 6. Marketplace safety section ─────────────────────── */}
      <SectionShell tone="default" className="!pt-0">
        <DisclaimerBanner tone="teal">
          <div>
            <p className="font-semibold">Marketplace safety &amp; clinical-claim moderation.</p>
            <p className="mt-1">
              Novalyte AI is a commerce facilitator. We do not sell, warranty, or ship products
              ourselves. Listings that make clinical or outcome claims are subject to moderation
              before publication. Verification reflects a review of submitted business information —
              it is not an endorsement of clinical outcomes, product efficacy, or vendor performance.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {SAFETY_REVIEW_TYPES.map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.label}
                    className="flex items-center gap-2 rounded-lg border border-teal-200 bg-white/60 px-2.5 py-2 text-xs font-medium text-teal-800"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {r.label}
                  </div>
                );
              })}
            </div>
          </div>
        </DisclaimerBanner>
      </SectionShell>

      {/* ── 7. CTA ────────────────────────────────────────────── */}
      <CTASection
        title="Reach men's health clinics seeking your solutions"
        description="List your products and services where clinics are already sourcing labs, equipment, software, and operational tools. Quote workflows, verification, and inquiry routing are built in."
        primaryLabel="Become a Vendor"
        onPrimary={onGetStarted}
        secondaryLabel="Explore Workforce"
        secondaryView="workforce"
        tone="dark"
      />

      {/* Quote dialog */}
      <QuoteDialog listing={quoteListing} onClose={() => setQuoteListing(null)} />
    </>
  );
}

/* ───────────────────────────────────────────────────────────────
   Filters panel (shared between desktop sidebar & mobile sheet)
   ─────────────────────────────────────────────────────────────── */
function FiltersPanel(props: {
  query: string;
  setQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  listingType: string;
  setListingType: (v: string) => void;
  vendorName: string;
  setVendorName: (v: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (v: boolean) => void;
  pricingModel: string;
  setPricingModel: (v: string) => void;
  availability: string;
  setAvailability: (v: string) => void;
  uniqueCategories: string[];
  uniqueListingTypes: string[];
  uniqueVendors: string[];
  uniquePricingModels: { value: string; label: string }[];
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <Button variant="ghost" size="sm" onClick={props.onReset} className="h-7 text-xs text-muted-foreground">
          <X className="mr-1 h-3 w-3" /> Reset
        </Button>
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs">Keyword</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search catalog…"
            value={props.query}
            onChange={(e) => props.setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <SelectField label="Category" value={props.category} onChange={props.setCategory}
        options={[{ value: "all", label: "All categories" }, ...props.uniqueCategories.map((c) => ({ value: c, label: c }))]} />

      <SelectField label="Listing type" value={props.listingType} onChange={props.setListingType}
        options={[{ value: "all", label: "All types" }, ...props.uniqueListingTypes.map((t) => ({ value: t, label: t }))]} />

      <SelectField label="Vendor" value={props.vendorName} onChange={props.setVendorName}
        options={[{ value: "all", label: "All vendors" }, ...props.uniqueVendors.map((v) => ({ value: v, label: v }))]} />

      <SelectField label="Pricing model" value={props.pricingModel} onChange={props.setPricingModel}
        options={[{ value: "all", label: "Any model" }, ...props.uniquePricingModels]} />

      <SelectField label="Availability" value={props.availability} onChange={props.setAvailability}
        options={[{ value: "all", label: "Any availability" }, ...AVAILABILITY_FILTERS]} />

      <label className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
        <span className="flex items-center gap-2 text-sm text-foreground">
          <ShieldCheck className="h-4 w-4 text-teal-600" /> Verified suppliers only
        </span>
        <Switch checked={props.verifiedOnly} onCheckedChange={props.setVerifiedOnly} />
      </label>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Listing card
   ─────────────────────────────────────────────────────────────── */
function ListingCard({
  listing,
  vendors,
  view,
  onQuote,
}: {
  listing: MarketplaceListingT;
  vendors: VendorT[];
  view: string;
  onQuote: () => void;
}) {
  const savedProducts = useSaved((s) => s.products);
  const toggleSaved = useSaved((s) => s.toggle);
  const compareProducts = useCompare((s) => s.products);
  const toggleCompare = useCompare((s) => s.toggle);

  const isSaved = savedProducts.includes(listing.id);
  const isComparing = compareProducts.includes(listing.id);
  const c = colorClasses(listing.imageColor);
  const avail = availabilityMeta(listing.availability);
  const financingEligible = showsFinancingTag(listing);
  const vendorId = vendorIdForName(vendors, listing.vendorName);

  function goVendor() {
    if (vendorId) navigate("vendor-profile", undefined, { id: vendorId });
  }
  function goProduct() {
    navigate("product-detail", undefined, { id: listing.id });
  }

  if (view === "list") {
    return (
      <PremiumCard hover className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
        <button
          onClick={goProduct}
          className={cn(
            "relative flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-auto sm:w-40",
            c.bg,
          )}
          aria-label={listing.title}
        >
          <CategoryIcon category={listing.category} className="h-8 w-8 text-white/90" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button onClick={goVendor} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-teal-700">
                {listing.vendorName}
              </button>
              <button onClick={goProduct} className="block text-left text-base font-semibold leading-tight text-foreground transition hover:text-teal-700">
                {listing.title}
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <SaveButton saved={isSaved} onToggle={() => toggleSaved("product", listing.id)} size="sm" />
              <CompareToggle active={isComparing} onClick={() => toggleCompare("product", listing.id)} />
            </div>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusPill tone="muted">{listing.category}</StatusPill>
            <StatusPill tone="teal">{listing.listingType}</StatusPill>
            <StatusPill tone={avail.tone}>{avail.label}</StatusPill>
            {financingEligible && <StatusPill tone="violet"><Banknote className="h-3 w-3" /> Financing available</StatusPill>}
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{listing.priceNote || "Request quote"}</p>
              <p className="text-xs text-muted-foreground">{listing.pricingModel || "—"}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goProduct}>Details</Button>
              <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onQuote}>
                <Quote className="mr-1 h-3.5 w-3.5" /> Request Quote
              </Button>
            </div>
          </div>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard hover className="flex flex-col overflow-hidden">
      {/* Banner */}
      <div className={cn("relative h-28 w-full", c.bg)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <CategoryIcon category={listing.category} className="h-9 w-9 text-white/90" />
        </div>
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          <SaveButton saved={isSaved} onToggle={() => toggleSaved("product", listing.id)} size="sm" />
          <CompareToggle active={isComparing} onClick={() => toggleCompare("product", listing.id)} />
        </div>
        <div className="absolute left-2 top-2">
          {listing.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-teal-700 backdrop-blur-sm">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-amber-700 backdrop-blur-sm">
              <Clock className="h-3 w-3" /> Under review
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={goVendor}
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-teal-700"
          >
            {listing.vendorName}
          </button>
          <VerificationBadge verified={listing.verified} status={listing.reviewStatus} />
        </div>

        <button
          onClick={goProduct}
          className="mt-1 text-left text-base font-semibold leading-snug text-foreground transition hover:text-teal-700"
        >
          {listing.title}
        </button>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusPill tone="muted">{listing.category}</StatusPill>
          <StatusPill tone="teal">{listing.listingType}</StatusPill>
        </div>

        <p className="mt-2.5 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{listing.priceNote || "Request quote"}</p>
            <p className="text-xs text-muted-foreground">{listing.pricingModel || "—"}</p>
          </div>
          <StatusPill tone={avail.tone}>{avail.label}</StatusPill>
        </div>

        {financingEligible && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 self-start rounded-md bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700">
            <Banknote className="h-3 w-3" /> Financing available (platform inquiry)
          </div>
        )}

        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <Button size="sm" className="flex-1 bg-teal-600 text-white hover:bg-teal-700" onClick={onQuote}>
            <Quote className="mr-1 h-3.5 w-3.5" /> Request Quote
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={goProduct}>
            Details
          </Button>
        </div>
      </div>
    </PremiumCard>
  );
}

function CompareToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClick(); }}
      aria-pressed={active}
      title={active ? "Remove from compare" : "Add to compare"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition",
        active
          ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
          : "border-border bg-card text-muted-foreground hover:border-teal-200 hover:text-teal-700",
      )}
    >
      <GitCompare className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{active ? "Comparing" : "Compare"}</span>
    </button>
  );
}

/* ───────────────────────────────────────────────────────────────
   Quote dialog
   ─────────────────────────────────────────────────────────────── */
function QuoteDialog({
  listing,
  onClose,
}: {
  listing: MarketplaceListingT | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterOrg: "",
    quantity: "",
    notes: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Reset form whenever a new listing is opened
  useEffect(() => {
    if (listing) {
      setForm({ requesterName: "", requesterEmail: "", requesterOrg: "", quantity: "", notes: "", consent: false });
      setDone(false);
      setSubmitting(false);
    }
  }, [listing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!listing) return;
    if (!form.consent) {
      toast.error("Please acknowledge the platform terms before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          requesterName: form.requesterName,
          requesterEmail: form.requesterEmail,
          requesterOrg: form.requesterOrg || null,
          quantity: form.quantity || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
      toast.success("Quote request submitted", {
        description: `${listing.vendorName} will follow up via email.`,
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    onClose();
  }

  return (
    <Dialog open={!!listing} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {listing && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Quote className="h-4 w-4 text-teal-600" /> Request a quote
              </DialogTitle>
              <DialogDescription>
                {listing.title} · <span className="text-foreground/80">{listing.vendorName}</span>
              </DialogDescription>
            </DialogHeader>

            {/* Snapshot */}
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
              <div className="bg-card p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Price</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{listing.priceNote || "Quote-based"}</p>
              </div>
              <div className="bg-card p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Pricing model</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{listing.pricingModel || "—"}</p>
              </div>
              <div className="bg-card p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Availability</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{availabilityMeta(listing.availability).label}</p>
              </div>
              <div className="bg-card p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Type</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{listing.listingType}</p>
              </div>
            </div>

            {!done ? (
              <form onSubmit={submit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Full name" required>
                    <Input
                      required
                      value={form.requesterName}
                      onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                      placeholder="Your name"
                    />
                  </Field>
                  <Field label="Work email" required>
                    <Input
                      required
                      type="email"
                      value={form.requesterEmail}
                      onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
                      placeholder="you@clinic.com"
                    />
                  </Field>
                </div>
                <Field label="Organization / clinic">
                  <Input
                    value={form.requesterOrg}
                    onChange={(e) => setForm({ ...form, requesterOrg: e.target.value })}
                    placeholder="Clinic or company name"
                  />
                </Field>
                <Field label="Quantity / scope">
                  <Input
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="e.g. 10 units, 200 panels/mo"
                  />
                </Field>
                <Field label="Notes for vendor">
                  <Textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Timeline, deployment context, bulk-pricing or financing interest, specific requirements…"
                  />
                </Field>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                    className="mt-0.5"
                  />
                  <span>
                    I understand Novalyte AI is a technology platform that facilitates commerce
                    inquiries. Novalyte does not sell, warranty, or fulfill products directly —
                    quotes and terms come from the vendor. Vendors are independently operated and
                    verification does not constitute endorsement.
                  </span>
                </label>
                <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700" disabled={submitting}>
                  {submitting ? "Sending…" : <>Send quote request <ArrowRight className="ml-1 h-4 w-4" /></>}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                  <CheckCircle2 className="h-6 w-6 text-teal-600" />
                </span>
                <p className="text-base font-semibold text-foreground">Quote request submitted</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  We routed your inquiry to <span className="font-medium text-foreground">{listing.vendorName}</span>. Expect a follow-up at the email you provided.
                </p>
                <Button variant="outline" size="sm" onClick={close} className="mt-2">Close</Button>
              </div>
            )}

            <DisclaimerBanner tone="muted">
              Novalyte AI facilitates discovery and inquiry routing. We do not sell, ship, or
              warranty products. Vendor terms, lead times, and pricing are confirmed directly with
              the vendor.
            </DisclaimerBanner>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

// Re-export for downstream (unused but kept stable for AppShell contract)
// (no exports — MarketplaceView is the only public symbol)
