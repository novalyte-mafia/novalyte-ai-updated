"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { SmartImage } from "@/components/shared/smart-image";
import { IMAGES } from "@/lib/images";
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
import { useCart } from "@/lib/cart";
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
  Store,
  Inbox,
  MessageSquare,
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
  Boxes,
  Eye,
  ShieldAlert,
  Sparkles
} from "lucide-react";

const PAGE_SIZE = 12;

function getListingImage(listing: MarketplaceListingT): string {
  const slug = listing.slug;
  const cat = listing.category.toLowerCase();
  
  if (slug.includes("scrubs") || slug.includes("lab-coat") || slug.includes("clogs") || slug.includes("gown") || slug.includes("badge")) {
    return "/images/treatments/preventive-3.jpg"; // Clinical apparel visual
  }
  if (cat.includes("lab") || cat.includes("diagnost")) {
    return "/images/marketplace/lab-1.jpg";
  }
  if (cat.includes("inject") || cat.includes("supply") || cat.includes("phlebotomy") || cat.includes("clinical-supplies")) {
    return "/images/marketplace/inject-1.jpg";
  }
  if (cat.includes("recovery") || cat.includes("wellness") || cat.includes("equipment")) {
    return "/images/marketplace/recovery-1.jpg";
  }
  return "/images/marketplace/product-1.jpg";
}

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  switch (category) {
    case "Laboratory Services":
    case "Laboratory and Diagnostics":
      return <FlaskConical className={className} />;
    case "Diagnostic Equipment":
    case "Medical Equipment":
      return <Activity className={className} />;
    case "Injection Supplies":
    case "Clinical Supplies":
      return <Syringe className={className} />;
    case "Phlebotomy Supplies":
      return <Droplet className={className} />;
    case "Medical Furniture":
    case "Exam Room and Facility":
      return <Armchair className={className} />;
    case "Body-Composition Systems":
      return <Stethoscope className={className} />;
    case "Recovery Technology":
    case "Wellness and Recovery":
      return <HeartPulse className={className} />;
    case "Telehealth Tools":
    case "Telehealth Technology":
      return <Video className={className} />;
    case "Clinic Software":
    case "Healthcare Software":
      return <Monitor className={className} />;
    case "Billing Services":
    case "Billing and Revenue Cycle":
      return <CreditCard className={className} />;
    case "Credentialing Services":
    case "Credentialing and Compliance":
      return <BadgeCheck className={className} />;
    case "Compliance Support":
      return <ShieldCheck className={className} />;
    case "Marketing Services":
    case "Marketing and Patient Growth":
      return <Megaphone className={className} />;
    case "Staffing Services":
    case "Staffing and Workforce Services":
      return <Users className={className} />;
    case "Patient Engagement Tools":
      return <MessageSquare className={className} />;
    default:
      return <Package className={className} />;
  }
}

function availabilityMeta(av: string): { tone: "teal" | "amber" | "sky" | "violet"; label: string } {
  const a = av.toLowerCase();
  if (a.includes("order")) return { tone: "amber", label: "Made to order" };
  if (a.includes("limit")) return { tone: "violet", label: "Limited" };
  if (a.includes("pre") || a.includes("back")) return { tone: "sky", label: "Pre-order" };
  return { tone: "teal", label: "In stock" };
}

export function MarketplaceView({
  listings,
  vendors,
  onGetStarted,
}: {
  listings: MarketplaceListingT[];
  vendors: VendorT[];
  onGetStarted: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [procurementType, setProcurementType] = useState<string>("all"); // all | direct | quote
  const [vendorName, setVendorName] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availability, setAvailability] = useState<string>("all");

  const [sort, setSort] = useState("relevant");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quoteListing, setQuoteListing] = useState<MarketplaceListingT | null>(null);
  const [quickViewListing, setQuickViewListing] = useState<MarketplaceListingT | null>(null);

  const uniqueVendors = useMemo(() => {
    return Array.from(new Set(listings.map((l) => l.vendorName))).sort();
  }, [listings]);

  const filterKey = `${query}|${category}|${procurementType}|${vendorName}|${verifiedOnly}|${availability}|${sort}`;
  
  useEffect(() => {
    setPage(1);
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, [filterKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = listings.filter((l) => {
      if (q) {
        const hay = `${l.title} ${l.vendorName} ${l.description} ${l.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (category !== "all" && l.category !== category) return false;
      
      // Procurement type filters (Direct vs Quote)
      if (procurementType !== "all") {
        const isDirect = l.listingType === "product" && l.pricingModel !== "quote";
        if (procurementType === "direct" && !isDirect) return false;
        if (procurementType === "quote" && isDirect) return false;
      }

      if (vendorName !== "all" && l.vendorName !== vendorName) return false;
      if (verifiedOnly && !l.verified) return false;
      if (availability !== "all") {
        const meta = availabilityMeta(l.availability);
        if (availability === "in-stock" && meta.tone !== "teal") return false;
        if (availability === "made-to-order" && meta.tone !== "amber") return false;
        if (availability === "limited" && meta.tone !== "violet") return false;
      }
      return true;
    });

    if (sort === "az") {
      out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "za") {
      out = [...out].sort((a, b) => b.title.localeCompare(a.title));
    } else if (sort === "verified") {
      out = [...out].sort((a, b) => Number(b.verified) - Number(a.verified));
    } else if (sort === "price-asc") {
      out = [...out].sort((a, b) => {
        const pa = parseFloat(a.priceNote?.replace(/[^0-9.]/g, "") || "999999");
        const pb = parseFloat(b.priceNote?.replace(/[^0-9.]/g, "") || "999999");
        return pa - pb;
      });
    } else if (sort === "price-desc") {
      out = [...out].sort((a, b) => {
        const pa = parseFloat(a.priceNote?.replace(/[^0-9.]/g, "") || "0");
        const pb = parseFloat(b.priceNote?.replace(/[^0-9.]/g, "") || "0");
        return pb - pa;
      });
    }
    return out;
  }, [listings, query, category, procurementType, vendorName, verifiedOnly, availability, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setProcurementType("all");
    setVendorName("all");
    setVerifiedOnly(false);
    setAvailability("all");
  }

  function scrollToCatalog() {
    document.getElementById("listings-catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleExploreServices() {
    setProcurementType("quote");
    setCategory("all");
    scrollToCatalog();
  }

  const chips: { label: string; onRemove: () => void }[] = [];
  if (query.trim()) chips.push({ label: `“${query.trim()}”`, onRemove: () => setQuery("") });
  if (category !== "all") chips.push({ label: category, onRemove: () => setCategory("all") });
  if (procurementType !== "all") chips.push({ label: procurementType === "direct" ? "Direct Purchase" : "Quote Required", onRemove: () => setProcurementType("all") });
  if (vendorName !== "all") chips.push({ label: vendorName, onRemove: () => setVendorName("all") });
  if (availability !== "all") chips.push({ label: availability.replace("-", " "), onRemove: () => setAvailability("all") });
  if (verifiedOnly) chips.push({ label: "Verified Only", onRemove: () => setVerifiedOnly(false) });

  const verifiedVendors = useMemo(() => vendors.filter((v) => v.verified), [vendors]);
  const listingCountByVendor = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of listings) m[l.vendorName] = (m[l.vendorName] ?? 0) + 1;
    return m;
  }, [listings]);

  return (
    <>
      {/* ── 1. COMPACT HERO WITH TYPOGRAPHY & IMAGERY ──────────── */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/40 to-background">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">
          {/* Left Side: Copy + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-700 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-pulse" /> B2B Health-Tech Commerce Marketplace
            </div>
            
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[56px]">
              Healthcare Products, Technology, and Services <br />
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Built for Modern Care Teams
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Discover healthcare supplies, equipment, technology, software, and operational services from specialized suppliers. Purchase everyday essentials directly or request quotes for larger and more configurable solutions.
            </p>

            <div className="mt-5 text-[11px] text-amber-800 bg-amber-50/60 border border-amber-200/50 p-3 rounded-xl max-w-lg flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-left font-medium leading-normal">
                <strong>Safety Safeguard:</strong> Novalyte AI coordinates discovery and inquiry routing. We do not sell or list prescription medications or restricted medical products.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700 font-bold" onClick={scrollToCatalog}>
                Browse Products
              </Button>
              <Button size="lg" variant="outline" className="font-bold border-neutral-300 hover:border-teal-300 hover:text-teal-700" onClick={handleExploreServices}>
                Explore Healthcare Services
              </Button>
            </div>
          </div>

          {/* Right Side: Visual Asset Composition */}
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-premium-lg border border-neutral-200/60">
              <SmartImage
                src={IMAGES.pillars.marketplace}
                alt="Novalyte B2B Healthcare Commerce Platform"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                imgClassName="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/15 to-transparent" aria-hidden />
            </div>
            
            {/* Floating details badge */}
            <div className="absolute -bottom-4 -left-4 hidden items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-premium-lg sm:flex">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Store className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">Verified Suppliers</p>
                <p className="text-[10px] text-muted-foreground">Audited catalog &amp; SLA support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Listings section ───────────────────────────────── */}
      <SectionShell id="listings-catalog" className="!pt-10 !pb-16 bg-neutral-50/10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          
          {/* Desktop Filter Panel with Category Dropdown */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <FiltersPanel
                query={query}
                setQuery={setQuery}
                category={category}
                setCategory={setCategory}
                procurementType={procurementType}
                setProcurementType={setProcurementType}
                vendorName={vendorName}
                setVendorName={setVendorName}
                verifiedOnly={verifiedOnly}
                setVerifiedOnly={setVerifiedOnly}
                availability={availability}
                setAvailability={setAvailability}
                uniqueVendors={uniqueVendors}
                onReset={resetFilters}
              />
            </div>
          </aside>

          {/* Main Listings Grid */}
          <div>
            {/* Mobile Filters and Layout toggles */}
            <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="border-neutral-200">
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
                      procurementType={procurementType}
                      setProcurementType={setProcurementType}
                      vendorName={vendorName}
                      setVendorName={setVendorName}
                      verifiedOnly={verifiedOnly}
                      setVerifiedOnly={setVerifiedOnly}
                      availability={availability}
                      setAvailability={setAvailability}
                      uniqueVendors={uniqueVendors}
                      onReset={resetFilters}
                    />
                    <Button className="mt-4 w-full bg-teal-600 text-white hover:bg-teal-700 font-bold" onClick={() => setMobileFiltersOpen(false)}>
                      Show {filtered.length} results
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

            {/* Results counts & chips */}
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-premium-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{filtered.length}</span> of <span className="font-bold text-foreground">{listings.length}</span> listings
                </p>
                {chips.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {chips.map((c, i) => (
                      <FilterChip key={i} label={c.label} onRemove={c.onRemove} />
                    ))}
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-muted-foreground transition hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5" /> Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Sorting and layouts */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground font-semibold">Sort</Label>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger size="sm" className="w-[170px] h-9 border-neutral-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevant">Featured / Relevant</SelectItem>
                      <SelectItem value="az">A–Z</SelectItem>
                      <SelectItem value="za">Z-A</SelectItem>
                      <SelectItem value="verified">Verified First</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
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

            {/* Catalog Grid */}
            {loading ? (
              <div
                className={cn(
                  "grid gap-5",
                  view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                )}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : paged.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No listings found"
                description="We couldn't find matches for your current catalog filters. Try widening search inputs."
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
                  view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                )}
              >
                {paged.map((l) => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    vendors={vendors}
                    view={view}
                    onQuote={() => setQuoteListing(l)}
                    onQuickView={() => setQuickViewListing(l)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && filtered.length > PAGE_SIZE && (
              <div className="mt-10 flex justify-center">
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
                      const show = n === 1 || n === totalPages || Math.abs(n - page) <= 1;
                      if (!show) return null;
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

      {/* ── 4. Supplier Storefronts Directory ──────────────────── */}
      <SectionShell tone="muted">
        <SectionHeading
          eyebrow="Supplier Directory"
          title="Verified healthcare suppliers on Novalyte"
          description="Each partner undergoes structured registration verification. Review catalogs, credentials, policies, and timelines on their storefront profiles."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {verifiedVendors.map((v) => {
            const count = listingCountByVendor[v.name] ?? 0;
            return (
              <PremiumCard key={v.id} hover className="flex flex-col p-6 bg-white">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-base font-extrabold text-white">
                    {v.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-base font-semibold text-foreground">{v.name}</h3>
                      <VerificationBadge verified={v.verified} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-normal">
                      {v.overview || "Fulfillment and licensing logs available."}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <span className="text-xs text-muted-foreground font-medium">
                    <span className="font-bold text-foreground">{count}</span> active listing{count === 1 ? "" : "s"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-semibold text-xs border-neutral-200 hover:border-teal-200 hover:text-teal-700"
                    onClick={() => navigate("vendor-profile", undefined, { id: v.id })}
                  >
                    View Storefront <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </PremiumCard>
            );
          })}
        </div>
      </SectionShell>

      {/* Quote Dialog */}
      <Dialog open={quoteListing !== null} onOpenChange={(open) => !open && setQuoteListing(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          {quoteListing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Quote className="h-4 w-4 text-teal-600" /> Request quote &amp; consult
                </DialogTitle>
                <DialogDescription>
                  {quoteListing.title} · <span className="text-foreground/80">{quoteListing.vendorName}</span>
                </DialogDescription>
              </DialogHeader>
              <QuoteRequestForm listing={quoteListing} onClose={() => setQuoteListing(null)} />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick View Dialog */}
      <Dialog open={quickViewListing !== null} onOpenChange={(open) => !open && setQuickViewListing(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          {quickViewListing && (
            <QuickViewDetails listing={quickViewListing} onClose={() => setQuickViewListing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick View Content Component
function QuickViewDetails({ listing, onClose }: { listing: MarketplaceListingT; onClose: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const isDirectPurchase = listing.listingType === "product" && listing.pricingModel !== "quote";
  const avail = availabilityMeta(listing.availability);
  const img = getListingImage(listing);

  const handleCartAdd = () => {
    if (isDirectPurchase) {
      addItem({
        id: listing.id,
        title: listing.title,
        variant: "Standard",
        price: parseFloat(listing.priceNote?.replace(/[^0-9.]/g, "") || "0"),
        imageColor: listing.imageColor,
        category: listing.category,
        vendorName: listing.vendorName,
        priceNote: listing.priceNote || "Custom",
        quantity: quantity,
      });
      toast.success(`"${listing.title}" added to cart.`);
      onClose();
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 p-4">
      {/* Product Image Column */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 flex items-center justify-center">
        <SmartImage
          src={img}
          alt={listing.title}
          fill
          imgClassName="object-cover"
        />
      </div>

      {/* Info Column */}
      <div className="flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusPill tone="muted">{listing.category}</StatusPill>
            <StatusPill tone={avail.tone}>{avail.label}</StatusPill>
          </div>
          <h2 className="text-xl font-bold text-foreground leading-tight">{listing.title}</h2>
          <p className="text-xs text-teal-700 font-semibold">{listing.vendorName}</p>
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">{listing.description}</p>
        </div>

        <div className="space-y-4 pt-3 border-t border-neutral-100">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-muted-foreground">Price Note</span>
            <span className="text-lg font-extrabold text-foreground">{listing.priceNote || "Quote Required"}</span>
          </div>

          <div className="flex gap-2">
            {isDirectPurchase ? (
              <>
                <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden h-9 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 hover:bg-neutral-50 text-neutral-500 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-3 hover:bg-neutral-50 text-neutral-500 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <Button className="flex-1 bg-teal-600 text-white font-bold h-9 text-xs rounded-xl" onClick={handleCartAdd}>
                  Add to Cart
                </Button>
              </>
            ) : (
              <Button className="flex-1 bg-teal-600 text-white font-bold h-9 text-xs rounded-xl" onClick={() => {
                onClose();
                navigate("product-detail", undefined, { id: listing.id });
              }}>
                Request Quote &amp; Details
              </Button>
            )}
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => {
                onClose();
                navigate("product-detail", undefined, { id: listing.id });
              }}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 transition flex items-center gap-1"
            >
              View Full Product Details <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 15-field Quote Request Form
function QuoteRequestForm({ listing, onClose }: { listing: MarketplaceListingT; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    org: "",
    phone: "",
    facilityType: "clinic",
    quantity: "",
    locations: "",
    budget: "",
    timeline: "",
    location: "",
    requirements: "",
    contactMethod: "email",
    notes: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) {
      toast.error("Please acknowledge the platform safeguards.");
      return;
    }

    setSubmitting(true);
    try {
      const notesCombined = `
Telephone: ${form.phone}
Facility Type: ${form.facilityType}
Locations: ${form.locations}
Budget Range: ${form.budget}
Desired Timeline: ${form.timeline}
Service Location: ${form.location}
Preferred Contact: ${form.contactMethod}
Requirements: ${form.requirements}
Additional Notes: ${form.notes}
      `.trim();

      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          requesterName: form.name,
          requesterEmail: form.email,
          requesterOrg: form.org,
          quantity: form.quantity || "1",
          notes: notesCombined,
        }),
      });

      if (!res.ok) throw new Error();
      setDone(true);
      toast.success("Quote request submitted successfully!");
    } catch {
      toast.error("Failed to submit quote request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
          <CheckCircle2 className="h-6 w-6 text-teal-600" />
        </span>
        <p className="text-base font-semibold text-foreground">Quote request submitted</p>
        <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
          We routed your detailed inquiry to {listing.vendorName}. Expect a response directly to your contact email.
        </p>
        <Button variant="outline" size="sm" onClick={onClose} className="mt-2 font-semibold">Close</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 pr-1">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label className="text-xs">Contact Name *</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your Name" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Work Email *</Label>
          <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@clinic.com" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label className="text-xs">Organization / Clinic *</Label>
          <Input required value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} placeholder="Clinic Name" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Telephone *</Label>
          <Input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 012-3456" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label className="text-xs">Facility Type *</Label>
          <select
            value={form.facilityType}
            onChange={(e) => setForm({ ...form, facilityType: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none"
          >
            <option value="clinic">Outpatient Clinic</option>
            <option value="practice">Private Practice</option>
            <option value="wellness">Wellness Center</option>
            <option value="telehealth">Telehealth Provider</option>
            <option value="hospital">Hospital / Health System</option>
          </select>
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Preferred Contact</Label>
          <select
            value={form.contactMethod}
            onChange={(e) => setForm({ ...form, contactMethod: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1">
          <Label className="text-xs">Est. Quantity *</Label>
          <Input required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 5 units" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Locations Count</Label>
          <Input value={form.locations} onChange={(e) => setForm({ ...form, locations: e.target.value })} placeholder="e.g. 3 offices" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Budget Range</Label>
          <Input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. $10k-$20k" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label className="text-xs">Desired Timeline</Label>
          <Input value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} placeholder="e.g. 30 days" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Service/Shipping Location</Label>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Austin, TX" />
        </div>
      </div>

      <div className="grid gap-1">
        <Label className="text-xs">Project Requirements &amp; Scope</Label>
        <Textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="Specify electrical, structural, integration, or custom staffing requirements..." className="resize-none text-xs" />
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground leading-snug">
        <input type="checkbox" required checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5 accent-teal-600" />
        <span>
          I acknowledge that Novalyte AI facilitates this request and suppliers are responsible for quote terms. We confirm that no prescription medications or restricted medical products are requested.
        </span>
      </label>

      <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700 font-bold" disabled={submitting}>
        {submitting ? "Sending..." : <>Submit Quote Request <ArrowRight className="ml-1 h-4 w-4" /></>}
      </Button>
    </form>
  );
}

// Side Filters Panel
function FiltersPanel({
  query,
  setQuery,
  category,
  setCategory,
  procurementType,
  setProcurementType,
  vendorName,
  setVendorName,
  verifiedOnly,
  setVerifiedOnly,
  availability,
  setAvailability,
  uniqueVendors,
  onReset,
}: {
  query: string;
  setQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  procurementType: string;
  setProcurementType: (v: string) => void;
  vendorName: string;
  setVendorName: (v: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (v: boolean) => void;
  availability: string;
  setAvailability: (v: string) => void;
  uniqueVendors: string[];
  onReset: () => void;
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-premium-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Filters</h3>
        <button onClick={onReset} className="text-xs font-bold text-muted-foreground hover:text-rose-600">
          Reset All
        </button>
      </div>

      {/* Query Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-xs font-bold text-muted-foreground">Search</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items..."
            className="pl-9 h-9 text-xs border-neutral-200 bg-white"
          />
        </div>
      </div>

      {/* Category selection inside the filters */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground">Category</Label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-9 w-full rounded-md border border-neutral-200 bg-background px-3 py-1.5 text-xs focus-visible:outline-none"
        >
          <option value="all">All categories</option>
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Procurement Type */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground">Procurement Type</Label>
        <select
          value={procurementType}
          onChange={(e) => setProcurementType(e.target.value)}
          className="flex h-9 w-full rounded-md border border-neutral-200 bg-background px-3 py-1.5 text-xs focus-visible:outline-none"
        >
          <option value="all">All listings</option>
          <option value="direct">Direct Purchase (Cart)</option>
          <option value="quote">Quote Required</option>
        </select>
      </div>

      {/* Supplier */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground">Supplier / Vendor</Label>
        <select
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          className="flex h-9 w-full rounded-md border border-neutral-200 bg-background px-3 py-1.5 text-xs focus-visible:outline-none"
        >
          <option value="all">All suppliers</option>
          {uniqueVendors.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Stock status */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground">Availability</Label>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="flex h-9 w-full rounded-md border border-neutral-200 bg-background px-3 py-1.5 text-xs focus-visible:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="in-stock">In Stock</option>
          <option value="made-to-order">Made to Order</option>
          <option value="limited">Limited</option>
        </select>
      </div>

      {/* Verified Suppliers Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <div className="space-y-0.5">
          <Label htmlFor="verified-toggle" className="text-xs font-bold text-foreground">Verified Only</Label>
          <p className="text-[10px] text-muted-foreground">Show audited suppliers.</p>
        </div>
        <Switch id="verified-toggle" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
      </div>
    </div>
  );
}

// Item Card Layout - Fully Clickable Card with Quick View option
function ListingCard({
  listing,
  vendors,
  view,
  onQuote,
  onQuickView,
}: {
  listing: MarketplaceListingT;
  vendors: VendorT[];
  view: string;
  onQuote: () => void;
  onQuickView: () => void;
}) {
  const savedProducts = useSaved((s) => s.products);
  const toggleSaved = useSaved((s) => s.toggle);
  const compareProducts = useCompare((s) => s.products);
  const toggleCompare = useCompare((s) => s.toggle);
  const isSaved = savedProducts.includes(listing.id);
  const isComparing = compareProducts.includes(listing.id);
  
  const addItem = useCart((s) => s.addItem);

  const c = colorClasses(listing.imageColor);
  const avail = availabilityMeta(listing.availability);
  const productImg = getListingImage(listing);

  // Derive direct purchase capability
  const isDirectPurchase = listing.listingType === "product" && listing.pricingModel !== "quote";

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDirectPurchase) {
      addItem({
        id: listing.id,
        title: listing.title,
        variant: "Standard",
        price: parseFloat(listing.priceNote?.replace(/[^0-9.]/g, "") || "0"),
        imageColor: listing.imageColor,
        category: listing.category,
        vendorName: listing.vendorName,
        priceNote: listing.priceNote || "Custom",
      });
      toast.success(`"${listing.title}" added to cart.`);
    } else {
      onQuote();
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView();
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaved("product", listing.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare("product", listing.id);
  };

  const vendorId = useMemo(() => {
    return vendors.find((v) => v.name === listing.vendorName)?.id;
  }, [vendors, listing.vendorName]);

  const handleCardClick = () => {
    navigate("product-detail", undefined, { id: listing.id });
  };

  if (view === "list") {
    return (
      <PremiumCard 
        onClick={handleCardClick}
        className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white hover:shadow-premium-md transition-shadow cursor-pointer"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 flex items-center justify-center">
          <SmartImage
            src={productImg}
            alt={listing.title}
            fill
            imgClassName="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-foreground hover:text-teal-700 transition line-clamp-1">
              {listing.title}
            </h3>
            <VerificationBadge verified={listing.verified} />
          </div>
          <p className="text-xs text-muted-foreground">
            Routed by{" "}
            <span className="font-semibold text-foreground">
              {listing.vendorName}
            </span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <StatusPill tone="muted">{listing.category}</StatusPill>
            <StatusPill tone={avail.tone}>{avail.label}</StatusPill>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t border-neutral-50 sm:border-0 pt-3 sm:pt-0 mt-3 sm:mt-0">
          <div className="text-left sm:text-right">
            <p className="text-sm font-bold text-foreground">{listing.priceNote || "Request quote"}</p>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{listing.pricingModel || "Quote"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 border border-neutral-200 text-neutral-500 hover:text-teal-700 hover:bg-teal-50"
              onClick={handleQuickViewClick}
              title="Quick View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" className="font-bold text-xs h-8 bg-teal-600 text-white" onClick={handleAction}>
              {isDirectPurchase ? "Buy Now" : "Request Quote"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-neutral-200"
              onClick={handleCompareClick}
            >
              <Boxes className={cn("h-3.5 w-3.5", isComparing ? "text-teal-600" : "text-neutral-500")} />
            </Button>
          </div>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard 
      onClick={handleCardClick}
      hover 
      className="flex flex-col bg-white cursor-pointer hover:shadow-premium-md transition-shadow duration-200"
    >
      <div className="relative h-32 w-full overflow-hidden border-b border-neutral-100 bg-neutral-50 flex items-center justify-center">
        <SmartImage
          src={productImg}
          alt={listing.title}
          fill
          imgClassName="object-cover"
        />
        <div className="absolute right-2 top-2 z-10">
          <SaveButton saved={isSaved} onToggle={() => toggleSaved("product", listing.id)} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold text-sm leading-snug text-foreground hover:text-teal-700 transition-colors line-clamp-1">
          {listing.title}
        </h3>
        
        <div className="mt-2 flex flex-wrap gap-1">
          <StatusPill tone="muted">{listing.category}</StatusPill>
          <StatusPill tone={avail.tone}>{avail.label}</StatusPill>
        </div>

        <p className="mt-2.5 line-clamp-2 text-xs leading-normal text-muted-foreground">
          {listing.description}
        </p>

        <div className="mt-4 flex items-end justify-between border-t border-neutral-100 pt-3">
          <div>
            <p className="text-xs font-bold text-foreground">{listing.priceNote || "Request quote"}</p>
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">{listing.pricingModel || "Quote"}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 border border-neutral-200 text-neutral-500 hover:text-teal-700 hover:bg-teal-50"
              onClick={handleQuickViewClick}
              title="Quick View"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" className="font-bold text-[10px] h-7 px-2.5 bg-teal-600 text-white" onClick={handleAction}>
              {isDirectPurchase ? "Buy Now" : "Request Quote"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-neutral-200"
              onClick={handleCompareClick}
            >
              <Boxes className={cn("h-3.5 w-3.5", isComparing ? "text-teal-600" : "text-neutral-500")} />
            </Button>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
