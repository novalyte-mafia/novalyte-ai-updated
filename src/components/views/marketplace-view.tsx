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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { colorClasses, MARKETPLACE_CATEGORIES } from "@/lib/constants";
import type { MarketplaceListingT } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Search, ArrowRight, X, CheckCircle2, ShieldCheck, Package,
  FlaskConical, Syringe, Droplet, Armchair, Activity, HeartPulse,
  Video, Monitor, CreditCard, BadgeCheck, Megaphone, Users,
  MessageSquare, Building2, TrendingUp, Store, LayoutDashboard,
  ImageIcon, Inbox, FileBarChart, Wallet, ListChecks,
} from "lucide-react";

type IconKey =
  | "flask" | "syringe" | "droplet" | "armchair" | "activity"
  | "heartpulse" | "video" | "monitor" | "credit" | "badge"
  | "shield" | "megaphone" | "users" | "message" | "building" | "trending"
  | "package";

function iconForCategory(category: string): IconKey {
  const k = category.toLowerCase();
  if (k.includes("lab")) return "flask";
  if (k.includes("diagnostic")) return "activity";
  if (k.includes("injection")) return "syringe";
  if (k.includes("phlebotomy")) return "droplet";
  if (k.includes("furniture")) return "armchair";
  if (k.includes("body-composition") || k.includes("body composition")) return "activity";
  if (k.includes("recovery")) return "heartpulse";
  if (k.includes("telehealth")) return "video";
  if (k.includes("software")) return "monitor";
  if (k.includes("billing")) return "credit";
  if (k.includes("credential")) return "badge";
  if (k.includes("compliance")) return "shield";
  if (k.includes("marketing")) return "megaphone";
  if (k.includes("staffing")) return "users";
  if (k.includes("patient engagement")) return "message";
  if (k.includes("expansion")) return "trending";
  return "package";
}

function CategoryIcon({ icon, className }: { icon: IconKey; className?: string }) {
  switch (icon) {
    case "flask": return <FlaskConical className={className} />;
    case "syringe": return <Syringe className={className} />;
    case "droplet": return <Droplet className={className} />;
    case "armchair": return <Armchair className={className} />;
    case "activity": return <Activity className={className} />;
    case "heartpulse": return <HeartPulse className={className} />;
    case "video": return <Video className={className} />;
    case "monitor": return <Monitor className={className} />;
    case "credit": return <CreditCard className={className} />;
    case "badge": return <BadgeCheck className={className} />;
    case "shield": return <ShieldCheck className={className} />;
    case "megaphone": return <Megaphone className={className} />;
    case "users": return <Users className={className} />;
    case "message": return <MessageSquare className={className} />;
    case "building": return <Building2 className={className} />;
    case "trending": return <TrendingUp className={className} />;
    case "package": default: return <Package className={className} />;
  }
}

type QuoteFormState = {
  requesterName: string;
  requesterEmail: string;
  requesterOrg: string;
  quantity: string;
  notes: string;
  consent: boolean;
};

const emptyForm: QuoteFormState = {
  requesterName: "",
  requesterEmail: "",
  requesterOrg: "",
  quantity: "",
  notes: "",
  consent: false,
};

export function MarketplaceView({
  listings,
  onGetStarted,
}: {
  listings: MarketplaceListingT[];
  onGetStarted: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [listingType, setListingType] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [quoteListing, setQuoteListing] = useState<MarketplaceListingT | null>(null);
  const [detailListing, setDetailListing] = useState<MarketplaceListingT | null>(null);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => set.add(l.category));
    return Array.from(set).sort();
  }, [listings]);

  const allListingTypes = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => set.add(l.listingType));
    return Array.from(set).sort();
  }, [listings]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (query) {
        const q = query.toLowerCase();
        const hay = `${l.title} ${l.vendorName} ${l.description} ${l.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (category !== "all" && l.category !== category) return false;
      if (listingType !== "all" && l.listingType !== listingType) return false;
      if (verifiedOnly && !l.verified) return false;
      return true;
    });
  }, [listings, query, category, listingType, verifiedOnly]);

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setListingType("all");
    setVerifiedOnly(false);
  }

  function selectCategoryAndScroll(cat: string) {
    setCategory(cat);
    scrollToListings();
  }

  function scrollToListings() {
    const el = document.getElementById("listings");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* 1. Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-14 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <Store className="h-3.5 w-3.5" /> Marketplace
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              The Healthcare Services Marketplace
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              A B2B marketplace for clinic products and services — labs, equipment, supplies,
              software, billing, credentialing, compliance, marketing, and staffing. Discover
              verified vendors, compare offerings, and request quotes in one place.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onGetStarted}>
                Become a Vendor <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToListings}>
                <Search className="mr-1 h-4 w-4" /> Browse Listings
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories overview */}
      <SectionShell className="!pt-12">
        <SectionHeading
          eyebrow="Categories"
          title="Everything your clinic needs, organized"
          description="Tap a category to jump straight to relevant listings. Vendors cover both physical products and operational services."
        />
        <div className="mt-6 flex flex-wrap gap-2.5">
          {MARKETPLACE_CATEGORIES.map((cat) => {
            const active = category === cat;
            const icon = iconForCategory(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => selectCategoryAndScroll(cat)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                  active
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-border bg-card text-foreground/80 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700",
                )}
              >
                <CategoryIcon icon={icon} className="h-4 w-4" />
                {cat}
              </button>
            );
          })}
        </div>
      </SectionShell>

      {/* 3. Listings */}
      <SectionShell id="listings" className="!pt-12">
        <SectionHeading
          eyebrow="Browse Listings"
          title="Equipment, services, and vendors in one place"
          description="Filter by keyword, category, listing type, and verification status. Request a quote or contact a vendor directly."
        />

        {/* Filter bar */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
            <div className="grid gap-1.5">
              <Label htmlFor="mk-q" className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="mk-q"
                  placeholder="Title, vendor, or description..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {allCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Listing type</Label>
              <Select value={listingType} onValueChange={setListingType}>
                <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {allListingTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified only
                </span>
              </label>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {listings.length} listings
            </span>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                onQuote={() => setQuoteListing(l)}
                onContact={onGetStarted}
                onDetails={() => setDetailListing(l)}
              />
            ))}
          </div>
        )}

        <DisclaimerBanner className="mt-8" tone="teal">
          Vendor verification reflects administrative review of business information. Listings
          and any associated product claims are subject to moderation. Novalyte AI does not
          endorse specific vendors and does not guarantee clinical or financial outcomes.
        </DisclaimerBanner>
      </SectionShell>

      {/* 6. Vendor portal preview */}
      <SectionShell tone="muted">
        <SectionHeading
          eyebrow="Vendor Portal"
          title="A complete toolkit for vendors"
          description="List products and services, manage inquiries, and track performance — all from a single vendor dashboard."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VENDOR_FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onGetStarted}>
            Become a Vendor <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </SectionShell>

      {/* 7. Marketplace safety */}
      <SectionShell className="!pt-12">
        <SectionHeading
          eyebrow="Marketplace Safety"
          title="Moderated listings, verified vendors"
          description="Novalyte AI does not allow direct publication of medical claims without review. An administrative moderation process governs what appears in the marketplace."
        />
        <div className="mt-6">
          <DisclaimerBanner tone="teal">
            <div className="space-y-3">
              <p>
                <strong className="font-semibold">No medical claims without review.</strong> Listings
                may not publish medical or clinical claims until they pass moderation. This protects
                clinics, patients, and the integrity of the marketplace.
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700/80">
                Moderation covers
              </p>
              <div className="flex flex-wrap gap-2">
                {REVIEW_TYPES.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 rounded-full border border-teal-300 bg-white px-2.5 py-1 text-xs font-medium text-teal-800"
                  >
                    <CheckCircle2 className="h-3 w-3" /> {r}
                  </span>
                ))}
              </div>
            </div>
          </DisclaimerBanner>
        </div>
      </SectionShell>

      {/* 8. CTA */}
      <CTASection
        title="Reach men's health clinics seeking your solutions"
        description="List your products and services in the Novalyte AI marketplace and connect with verified clinics actively looking for what you offer."
        primaryLabel="Become a Vendor"
        onPrimary={onGetStarted}
        secondaryLabel="Explore Workforce"
        secondaryView="workforce"
        tone="dark"
      />

      {/* 4. Quote request dialog */}
      <QuoteRequestDialog
        listing={quoteListing}
        onClose={() => setQuoteListing(null)}
      />

      {/* 5. Listing detail dialog (with embedded quote form) */}
      <ListingDetailDialog
        listing={detailListing}
        onClose={() => setDetailListing(null)}
        onQuote={(l) => {
          setDetailListing(null);
          setQuoteListing(l);
        }}
        onContact={onGetStarted}
      />
    </>
  );
}

function ListingCard({
  listing,
  onQuote,
  onContact,
  onDetails,
}: {
  listing: MarketplaceListingT;
  onQuote: () => void;
  onContact: () => void;
  onDetails: () => void;
}) {
  const c = colorClasses(listing.imageColor);
  const icon = iconForCategory(listing.category);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* Banner */}
      <div className={cn("relative flex h-24 items-center justify-center", c.bg)}>
        <CategoryIcon icon={icon} className="h-9 w-9 text-white/90" />
        <div className="absolute right-3 top-3">
          <VerificationBadge verified={listing.verified} status={listing.reviewStatus} className="bg-white/90" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {listing.vendorName}
        </p>
        <h3 className="mt-1 text-base font-semibold leading-tight text-foreground">{listing.title}</h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusPill tone="teal">{listing.category}</StatusPill>
          <StatusPill tone="muted">{listing.listingType}</StatusPill>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {listing.description}
        </p>

        <div className="mt-3 space-y-1.5">
          {listing.priceNote && (
            <p className="text-sm font-semibold text-foreground">{listing.priceNote}</p>
          )}
          {listing.pricingModel && (
            <p className="text-xs text-muted-foreground">Pricing: {listing.pricingModel}</p>
          )}
        </div>

        <div className="mt-3">
          <StatusPill tone={listing.availability.toLowerCase().includes("avail") ? "emerald" : "amber"}>
            {listing.availability}
          </StatusPill>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row">
          <Button
            size="sm"
            className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
            onClick={onQuote}
          >
            Request Quote
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={onContact}>
            Contact Vendor
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={onDetails}>
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuoteForm({
  listingId,
  listingTitle,
  onDone,
}: {
  listingId: string;
  listingTitle: string;
  onDone?: () => void;
}) {
  const [form, setForm] = useState<QuoteFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consent) {
      toast.error("Please acknowledge the consent statement before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          requesterName: form.requesterName,
          requesterEmail: form.requesterEmail,
          requesterOrg: form.requesterOrg || null,
          quantity: form.quantity || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      toast.success("Quote request sent. The vendor will follow up.");
      onDone?.();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <CheckCircle2 className="h-9 w-9 text-teal-600" />
        <p className="text-sm font-medium">Quote request sent for &ldquo;{listingTitle}&rdquo;</p>
        <p className="text-xs text-muted-foreground">The vendor will reach out using the contact details you provided.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <Label htmlFor="qf-name" className="text-xs">Requester name *</Label>
        <Input
          id="qf-name"
          required
          placeholder="Full name"
          value={form.requesterName}
          onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="qf-email" className="text-xs">Email *</Label>
        <Input
          id="qf-email"
          required
          type="email"
          placeholder="you@clinic.com"
          value={form.requesterEmail}
          onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="qf-org" className="text-xs">Organization (optional)</Label>
        <Input
          id="qf-org"
          placeholder="Clinic or company"
          value={form.requesterOrg}
          onChange={(e) => setForm({ ...form, requesterOrg: e.target.value })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="qf-qty" className="text-xs">Quantity (optional)</Label>
        <Input
          id="qf-qty"
          placeholder="e.g. 5 units, 12 months"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <Label htmlFor="qf-notes" className="text-xs">Notes (optional)</Label>
        <Textarea
          id="qf-notes"
          rows={3}
          placeholder="Questions, delivery timelines, integrations, etc."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
        <Checkbox
          checked={form.consent}
          onCheckedChange={(v) => setForm({ ...form, consent: v === true })}
          className="mt-0.5"
        />
        <span>
          I understand Novalyte AI is a technology platform and does not sell, endorse, or warrant
          vendor products. Quotes are provided directly by the vendor. Medical or clinical claims
          are subject to moderation.
        </span>
      </label>
      <Button
        type="submit"
        className="sm:col-span-2 bg-teal-600 text-white hover:bg-teal-700"
        disabled={submitting || !form.consent}
      >
        {submitting ? "Sending..." : "Submit quote request"} <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </form>
  );
}

function QuoteRequestDialog({
  listing,
  onClose,
}: {
  listing: MarketplaceListingT | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!listing} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {listing && (
          <>
            <DialogHeader>
              <DialogTitle>Request a quote</DialogTitle>
              <DialogDescription>
                For <span className="font-medium text-foreground">{listing.title}</span> by {listing.vendorName}.
              </DialogDescription>
            </DialogHeader>
            <QuoteForm
              key={listing.id}
              listingId={listing.id}
              listingTitle={listing.title}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ListingDetailDialog({
  listing,
  onClose,
  onQuote,
  onContact,
}: {
  listing: MarketplaceListingT | null;
  onClose: () => void;
  onQuote: (l: MarketplaceListingT) => void;
  onContact: () => void;
}) {
  const c = listing ? colorClasses(listing.imageColor) : colorClasses("teal");
  const icon = listing ? iconForCategory(listing.category) : "package";

  return (
    <Dialog open={!!listing} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {listing && (
          <>
            <DialogHeader>
              <div className={cn("mb-3 flex h-24 w-full items-center justify-center rounded-xl", c.bg)}>
                <CategoryIcon icon={icon} className="h-9 w-9 text-white/90" />
              </div>
              <DialogTitle className="text-xl">{listing.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  {listing.vendorName}
                </span>
                <VerificationBadge verified={listing.verified} status={listing.reviewStatus} />
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-1.5">
              <StatusPill tone="teal">{listing.category}</StatusPill>
              <StatusPill tone="muted">{listing.listingType}</StatusPill>
              <StatusPill tone={listing.availability.toLowerCase().includes("avail") ? "emerald" : "amber"}>
                {listing.availability}
              </StatusPill>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">{listing.description}</p>

            <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
              {listing.pricingModel && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing model</p>
                  <p className="mt-0.5 text-foreground">{listing.pricingModel}</p>
                </div>
              )}
              {listing.priceNote && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</p>
                  <p className="mt-0.5 font-semibold text-foreground">{listing.priceNote}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification</p>
                <p className="mt-0.5 text-foreground">
                  {listing.verified ? "Verified vendor" : listing.reviewStatus.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Listing type</p>
                <p className="mt-0.5 text-foreground">{listing.listingType}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
                onClick={() => onQuote(listing)}
              >
                Request Quote <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" className="flex-1" onClick={onContact}>
                Contact Vendor
              </Button>
            </div>

            <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-5">
              <h4 className="text-sm font-semibold text-foreground">Request a quote</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Submit your details and the vendor will respond directly. Novalyte AI does not
                intermediate transactions.
              </p>
              <div className="mt-4">
                <QuoteForm
                  key={listing.id}
                  listingId={listing.id}
                  listingTitle={listing.title}
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
      <Search className="h-8 w-8 text-muted-foreground/60" />
      <h3 className="mt-3 text-base font-semibold">No listings match your filters</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try widening your search or clearing filters to see more marketplace listings.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>Clear filters</Button>
    </div>
  );
}

const VENDOR_FEATURES: { title: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    title: "Create company profile",
    description: "Establish a verified vendor profile with capabilities, coverage area, and contact details.",
    icon: Store,
  },
  {
    title: "Submit products & services",
    description: "Publish equipment, supplies, software, and service offerings with full descriptions.",
    icon: Package,
  },
  {
    title: "Upload media",
    description: "Add product images, spec sheets, demo videos, and brand assets to your listings.",
    icon: ImageIcon,
  },
  {
    title: "Manage listings",
    description: "Edit pricing, availability, categories, and listing types from a single dashboard.",
    icon: LayoutDashboard,
  },
  {
    title: "Receive inquiries",
    description: "Get notified when clinics request quotes or reach out about your offerings.",
    icon: Inbox,
  },
  {
    title: "Respond to quote requests",
    description: "Reply to qualified buyers with pricing, lead times, and terms.",
    icon: MessageSquare,
  },
  {
    title: "Track listing performance",
    description: "Monitor views, inquiries, and quote conversions across your catalog.",
    icon: FileBarChart,
  },
  {
    title: "Subscription & commission",
    description: "Manage your vendor subscription tier and any applicable marketplace commission.",
    icon: Wallet,
  },
];

const REVIEW_TYPES: string[] = [
  "Vendor verification",
  "Product review",
  "Service review",
  "Claim review",
  "Category approval",
  "Listing approval",
];
