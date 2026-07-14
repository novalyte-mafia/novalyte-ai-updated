"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner, MedicalDisclaimer } from "@/components/shared/disclaimer";
import {
  PremiumCard,
  MetaRow,
  SaveButton,
  Breadcrumbs,
  SectionDivider,
} from "@/components/shared/enterprise";
import { StickyTabNav } from "@/components/shared/sticky-tab-nav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { colorClasses } from "@/lib/constants";
import type { MarketplaceListingT, VendorT } from "@/lib/types";
import { navigate, useSaved, useCompare } from "@/lib/nav";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Quote,
  Banknote,
  Truck,
  Package,
  Boxes,
  Building2,
  Tag,
  CheckCheck,
  ChevronRight,
  LayoutList,
  ClipboardCheck,
  FileBarChart,
  FlaskConical,
  Activity,
  Syringe,
  Droplet,
  Armchair,
  Stethoscope,
  HeartPulse,
  Video,
  Monitor,
  CreditCard,
  BadgeCheck,
  Megaphone,
  Users,
  MessageSquare,
} from "lucide-react";

/* ───────────────────────────────────────────────────────────────
   Category icon — stable wrapper (switch with literal JSX so the React
   Compiler treats it as a static element)
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

function availabilityMeta(av: string): { tone: "teal" | "amber" | "sky" | "violet"; label: string } {
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
function showsFinancingTag(l: MarketplaceListingT): boolean {
  return l.listingType === "product" && EQUIPMENT_CATEGORIES.has(l.category);
}

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutList },
  { id: "specifications", label: "Specifications", icon: ClipboardCheck },
  { id: "pricing", label: "Pricing & Financing", icon: Banknote },
  { id: "shipping", label: "Shipping & Fulfillment", icon: Truck },
  { id: "vendor", label: "Vendor", icon: Building2 },
  { id: "faqs", label: "FAQs", icon: FileBarChart },
];

const FAQS = [
  {
    q: "How does the quote process work?",
    a: "Submit a quote request with your contact details, organization, and quantity. Novalyte AI routes the inquiry directly to the vendor, who responds with pricing, lead times, and fulfillment options. Novalyte does not sell or fulfill products directly.",
  },
  {
    q: "Can I request bulk pricing?",
    a: "Yes. Use the quantity field to indicate volume (e.g. 100 units or 200 panels/month) and add a note. Bulk-order terms — including tiered pricing, contracts, and lead times — are confirmed by the vendor during the quote response.",
  },
  {
    q: "Is financing or leasing available for equipment?",
    a: "For equipment categories (diagnostic, recovery, body-composition, medical furniture, telehealth hardware), the Novalyte platform supports financing and leasing inquiries as part of your quote request. Terms are arranged directly between your organization and the vendor or a financing partner.",
  },
  {
    q: "What does the vendor verification badge mean?",
    a: "Verification indicates that Novalyte AI has reviewed the vendor's submitted business information. It is not an endorsement of clinical outcomes, product efficacy, or vendor performance. Independent due diligence is recommended before purchase.",
  },
  {
    q: "Are clinical or outcome claims moderated?",
    a: "Yes. Listings that make clinical, safety, or outcome claims are subject to moderation before publication. Listings may be paused or removed if claims cannot be substantiated or if they conflict with our healthcare-content policy.",
  },
];

/* ───────────────────────────────────────────────────────────────
   Main view
   ─────────────────────────────────────────────────────────────── */
export function ProductDetailView({
  listing,
  allListings,
  vendors,
}: {
  listing: MarketplaceListingT;
  allListings: MarketplaceListingT[];
  vendors: VendorT[];
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [quoteOpen, setQuoteOpen] = useState(false);

  const savedProducts = useSaved((s) => s.products);
  const toggleSaved = useSaved((s) => s.toggle);
  const compareProducts = useCompare((s) => s.products);
  const toggleCompare = useCompare((s) => s.toggle);
  const isSaved = savedProducts.includes(listing.id);
  const isComparing = compareProducts.includes(listing.id);

  const c = colorClasses(listing.imageColor);
  const avail = availabilityMeta(listing.availability);
  const financingEligible = showsFinancingTag(listing);

  const vendor = useMemo(
    () => vendors.find((v) => v.name === listing.vendorName) ?? null,
    [vendors, listing.vendorName],
  );
  const vendorListings = useMemo(
    () => allListings.filter((l) => l.vendorName === listing.vendorName && l.id !== listing.id),
    [allListings, listing],
  );
  const related = useMemo(() => {
    const sameCategory = allListings.filter((l) => l.id !== listing.id && l.category === listing.category);
    const sameVendor = allListings.filter(
      (l) => l.id !== listing.id && l.vendorName === listing.vendorName && !sameCategory.includes(l),
    );
    return [...sameCategory, ...sameVendor].slice(0, 3);
  }, [allListings, listing]);

  // Reset active tab whenever the listing changes — uses "adjusting state during
  // render" pattern (endorsed by React docs) to avoid setState-in-effect.
  const [lastListingId, setLastListingId] = useState(listing.id);
  if (lastListingId !== listing.id) {
    setLastListingId(listing.id);
    setActiveTab("overview");
  }

  // Scroll to top on listing change (genuine side effect — OK in useEffect).
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [listing.id]);

  return (
    <div className="bg-background">
      {/* ── Breadcrumbs ───────────────────────────────────────── */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Marketplace", onClick: () => navigate("marketplace") },
              { label: listing.category, onClick: () => navigate("marketplace") },
              { label: listing.title },
            ]}
          />
        </div>
      </div>

      {/* ── Hero header (two-column) ─────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/40 to-background py-10 sm:py-14">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
          {/* Left: banner + identity */}
          <div>
            <div className={cn("flex h-48 w-full items-center justify-center rounded-2xl shadow-premium-sm", c.bg)}>
              <CategoryIcon category={listing.category} className="h-14 w-14 text-white/90" />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatusPill tone="muted">{listing.category}</StatusPill>
              <StatusPill tone="teal">{listing.listingType}</StatusPill>
              <StatusPill tone={avail.tone}>{avail.label}</StatusPill>
              {financingEligible && (
                <StatusPill tone="violet"><Banknote className="h-3 w-3" /> Financing available</StatusPill>
              )}
            </div>

            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {listing.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => vendor && navigate("vendor-profile", undefined, { id: vendor.id })}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition hover:text-teal-700"
              >
                <Building2 className="h-4 w-4 text-muted-foreground" /> {listing.vendorName}
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <VerificationBadge verified={listing.verified} status={listing.reviewStatus} />
            </div>

            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
              {listing.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => setQuoteOpen(true)}>
                <Quote className="mr-1 h-4 w-4" /> Request Quote
              </Button>
              <Button variant="outline" onClick={() => toggleSaved("product", listing.id)}>
                <SaveButton saved={isSaved} onToggle={() => toggleSaved("product", listing.id)} label={isSaved ? "Saved" : "Save"} />
              </Button>
              <Button
                variant="outline"
                onClick={() => toggleCompare("product", listing.id)}
                className={cn(isComparing && "border-teal-200 bg-teal-50 text-teal-700")}
              >
                <Boxes className="mr-1 h-4 w-4" />
                {isComparing ? "In compare" : "Compare"}
              </Button>
            </div>
          </div>

          {/* Right: pricing & quote card */}
          <div id="quote-card">
            <PremiumCard className="overflow-hidden">
              <div className="border-b border-border bg-muted/30 p-5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Pricing</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  {listing.priceNote || "Quote-based"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {listing.pricingModel ? `Model: ${listing.pricingModel}` : "Pricing confirmed with vendor"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <StatusPill tone={avail.tone}>{avail.label}</StatusPill>
                  {financingEligible && (
                    <StatusPill tone="violet"><Banknote className="h-3 w-3" /> Financing eligible</StatusPill>
                  )}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-sm font-semibold text-foreground">Request a quote</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sent directly to {listing.vendorName}. Novalyte facilitates the inquiry — terms come from the vendor.
                </p>
                <CompactQuoteForm
                  listing={listing}
                  onSuccess={() => toast.success("Quote request submitted", {
                    description: `${listing.vendorName} will follow up via email.`,
                  })}
                />
              </div>
            </PremiumCard>

            <DisclaimerBanner tone="muted" className="mt-3">
              Novalyte AI does not sell, warranty, or fulfill this product. Pricing, lead times, and
              terms are confirmed by the vendor during the quote process.
            </DisclaimerBanner>
          </div>
        </div>
      </section>

      {/* ── Sticky tab nav ───────────────────────────────────── */}
      <StickyTabNav
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
        rightSlot={
          <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => setQuoteOpen(true)}>
            <Quote className="mr-1 h-3.5 w-3.5" /> Request Quote
          </Button>
        }
      />

      {/* ── Tab content ──────────────────────────────────────── */}
      <SectionShell className="!py-10 sm:!py-14">
        <div className="mx-auto w-full max-w-5xl">
          {activeTab === "overview" && (
            <div className="novalyte-fade-up space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Overview</h2>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{listing.description}</p>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  This listing is published in the Novalyte marketplace by {listing.vendorName} and
                  categorized under <span className="font-medium text-foreground">{listing.category}</span>.
                  Vendors are responsible for the accuracy of their listing details; Novalyte
                  facilitates discovery and inquiry routing.
                </p>
              </div>

              <SectionDivider label="What's included" />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Direct inquiry routing to the vendor",
                  "Bulk-order and quantity coordination",
                  financingEligible ? "Financing & leasing inquiry support" : "Structured pricing & terms response",
                  "Vendor-confirmed lead times",
                  "Saved-list and compare-tray tooling",
                  "Verification status transparency",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl border border-border bg-card p-3.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    <span className="text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>

              <SectionDivider label="Use cases for men's health clinics" />
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Building2, label: "Clinic operations", desc: "Adopt across intake, lab, or back-office workflows." },
                  { icon: CheckCheck, label: "Standardization", desc: "Equip multiple locations with consistent sourcing." },
                  { icon: Boxes, label: "Scale procurement", desc: "Coordinate bulk purchasing for growing networks." },
                ].map((u) => {
                  const U = u.icon;
                  return (
                    <PremiumCard key={u.label} className="p-4">
                      <U className="h-5 w-5 text-teal-600" />
                      <h4 className="mt-2 text-sm font-semibold text-foreground">{u.label}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{u.desc}</p>
                    </PremiumCard>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="novalyte-fade-up space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Specifications</h2>
              <MetaRow
                columns={3}
                items={[
                  { label: "Category", value: listing.category, icon: Tag },
                  { label: "Listing type", value: listing.listingType, icon: Package },
                  { label: "Pricing model", value: listing.pricingModel || "—", icon: Banknote },
                  { label: "Price", value: listing.priceNote || "Quote-based", icon: Banknote },
                  { label: "Availability", value: avail.label, icon: CheckCircle2 },
                  { label: "Vendor", value: listing.vendorName, icon: Building2 },
                ]}
              />
              <DisclaimerBanner tone="teal">
                Detailed product specifications — including dimensions, materials, regulatory status,
                compatibility, and certifications — are confirmed by the vendor during the quote
                process. Request a quote to receive a structured specification sheet.
              </DisclaimerBanner>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="novalyte-fade-up space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Pricing &amp; financing</h2>
              <PremiumCard className="p-6">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Listed price</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  {listing.priceNote || "Quote-based"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pricing model: <span className="font-medium text-foreground">{listing.pricingModel || "Not specified"}</span>
                </p>
              </PremiumCard>

              <div className="grid gap-4 md:grid-cols-2">
                <PremiumCard className="p-5">
                  <Banknote className="h-5 w-5 text-teal-600" />
                  <h3 className="mt-2 text-sm font-semibold text-foreground">Pricing model</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {pricingModelExplanation(listing.pricingModel)}
                  </p>
                </PremiumCard>
                <PremiumCard className="p-5">
                  <Boxes className="h-5 w-5 text-teal-600" />
                  <h3 className="mt-2 text-sm font-semibold text-foreground">Bulk orders</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Volume pricing, contract terms, and recurring delivery schedules can be
                    requested through the quote form. Indicate quantity and deployment timeline in
                    your inquiry for the most accurate response.
                  </p>
                </PremiumCard>
              </div>

              {financingEligible && (
                <PremiumCard className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                      <Banknote className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Financing &amp; leasing inquiry support</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        This listing is in an equipment category. The Novalyte platform supports
                        financing and leasing inquiries as part of your quote request. Financing
                        terms — including down payment, duration, and end-of-term options — are
                        arranged directly between your organization and the vendor or a financing
                        partner. This is a platform capability, not a per-listing financing offer.
                      </p>
                    </div>
                  </div>
                </PremiumCard>
              )}

              <DisclaimerBanner tone="muted">
                All pricing is provided by the vendor and subject to change. Novalyte AI does not
                set, guarantee, or process payments for listings.
              </DisclaimerBanner>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="novalyte-fade-up space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Shipping &amp; fulfillment</h2>
              <PremiumCard className="p-5">
                <Truck className="h-5 w-5 text-teal-600" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">Coordinated directly with the vendor</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Shipping, freight, white-glove delivery, installation, and onboarding are
                  coordinated directly between your organization and {listing.vendorName}. Novalyte
                  AI facilitates the initial inquiry — we do not warehouse, ship, or fulfill
                  products ourselves.
                </p>
              </PremiumCard>
              <div className="grid gap-4 sm:grid-cols-3">
                <PremiumCard className="p-4">
                  <Clock className="h-4 w-4 text-teal-600" />
                  <h4 className="mt-2 text-sm font-semibold text-foreground">Lead times</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Confirmed during quote based on availability and quantity.</p>
                </PremiumCard>
                <PremiumCard className="p-4">
                  <Package className="h-4 w-4 text-teal-600" />
                  <h4 className="mt-2 text-sm font-semibold text-foreground">Freight &amp; handling</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Equipment freight, hazmat, and cold-chain handled by vendor.</p>
                </PremiumCard>
                <PremiumCard className="p-4">
                  <CheckCheck className="h-4 w-4 text-teal-600" />
                  <h4 className="mt-2 text-sm font-semibold text-foreground">Onboarding</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Software &amp; service onboarding scheduled directly with vendor.</p>
                </PremiumCard>
              </div>
            </div>
          )}

          {activeTab === "vendor" && (
            <div className="novalyte-fade-up space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Vendor</h2>
              {vendor ? (
                <PremiumCard className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-lg font-bold text-white">
                      {vendor.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{vendor.name}</h3>
                        <VerificationBadge verified={vendor.verified} />
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {vendor.overview || "Vendor overview available on the full vendor profile."}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span><span className="font-semibold text-foreground">{vendorListings.length + 1}</span> active listing{vendorListings.length === 0 ? "" : "s"} on Novalyte</span>
                        {vendor.website && (
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-teal-700 transition hover:text-teal-800"
                          >
                            Visit website <ArrowRight className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => navigate("vendor-profile", undefined, { id: vendor.id })}
                      >
                        View full vendor profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </PremiumCard>
              ) : (
                <DisclaimerBanner tone="muted">
                  Vendor information for {listing.vendorName} is not available.
                </DisclaimerBanner>
              )}
            </div>
          )}

          {activeTab === "faqs" && (
            <div className="novalyte-fade-up space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Frequently asked questions</h2>
              <PremiumCard className="p-2">
                <Accordion type="single" collapsible className="px-3">
                  {FAQS.map((f, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                      <AccordionTrigger className="text-left text-sm font-medium text-foreground">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </PremiumCard>
            </div>
          )}
        </div>
      </SectionShell>

      {/* ── Related products ─────────────────────────────────── */}
      {related.length > 0 && (
        <SectionShell tone="muted" className="!pt-10 !pb-16">
          <div className="flex items-end justify-between">
            <SectionHeading
              eyebrow="Related"
              title="Related products & services"
              description="More from this category or this vendor."
            />
            <Button variant="outline" size="sm" onClick={() => navigate("marketplace")} className="hidden sm:inline-flex">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to marketplace
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => {
              const rc = colorClasses(r.imageColor);
              return (
                <button
                  key={r.id}
                  onClick={() => navigate("product-detail", undefined, { id: r.id })}
                  className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-premium-sm transition card-premium-hover"
                >
                  <div className={cn("flex h-20 w-full items-center justify-center", rc.bg)}>
                    <CategoryIcon category={r.category} className="h-7 w-7 text-white/90" />
                  </div>
                  <div className="p-4 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {r.vendorName}
                    </p>
                    <h4 className="mt-1 text-sm font-semibold leading-snug text-foreground group-hover:text-teal-700">{r.title}</h4>
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{r.priceNote || "Quote"}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-teal-600" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionShell>
      )}

      {/* ── Bottom disclaimer ────────────────────────────────── */}
      <SectionShell className="!py-10">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <DisclaimerBanner tone="amber">
            <strong className="font-semibold">Not a sale by Novalyte.</strong> Novalyte AI is a
            technology platform that facilitates commerce inquiries between clinics and vendors.
            We do not sell, warranty, insure, or fulfill products. Quotes, terms, lead times, and
            warranties are provided by the vendor. Verification reflects a review of submitted
            business information and is not an endorsement of clinical outcomes or product
            efficacy. Perform independent due diligence before purchase.
          </DisclaimerBanner>
          <MedicalDisclaimer />
        </div>
      </SectionShell>

      {/* ── Quote dialog (from sticky nav button) ────────────── */}
      <QuoteDialog listing={listing} open={quoteOpen} onOpenChange={setQuoteOpen} />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Pricing model explanation
   ─────────────────────────────────────────────────────────────── */
function pricingModelExplanation(model: string | null): string {
  switch ((model ?? "").toLowerCase()) {
    case "one-time":
      return "A single upfront price for the product or service. No recurring charges unless add-ons are negotiated separately with the vendor.";
    case "subscription":
      return "Recurring billing (monthly or annual) for continued access to the product, software, or service. Pricing tiers may scale with usage, seats, or locations.";
    case "quote":
      return "Pricing is configured per inquiry based on quantity, scope, contract length, and customization. Submit a quote request to receive a tailored proposal.";
    case "range":
      return "Pricing falls within a published range. Final pricing depends on configuration, quantity, and contract terms confirmed during the quote process.";
    case "per-test":
      return "Priced per unit of service (e.g. per lab panel or per draw). Useful for variable-volume clinic workflows; volume tiers may apply.";
    case "percentage":
      return "Priced as a percentage of collections, revenue, or transaction volume. Common for billing, RCM, and revenue-share service arrangements.";
    default:
      return "Pricing details are confirmed with the vendor during the quote process.";
  }
}

/* ───────────────────────────────────────────────────────────────
   Compact quote form (used inline on the pricing card)
   ─────────────────────────────────────────────────────────────── */
function CompactQuoteForm({
  listing,
  onSuccess,
}: {
  listing: MarketplaceListingT;
  onSuccess: () => void;
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
      onSuccess();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/50 p-5 text-center">
        <CheckCircle2 className="h-7 w-7 text-teal-600" />
        <p className="text-sm font-semibold text-foreground">Quote request submitted</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          We routed your inquiry to {listing.vendorName}. Expect a follow-up at the email you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          required
          placeholder="Full name *"
          value={form.requesterName}
          onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
        />
        <Input
          required
          type="email"
          placeholder="Work email *"
          value={form.requesterEmail}
          onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
        />
      </div>
      <Input
        placeholder="Organization / clinic"
        value={form.requesterOrg}
        onChange={(e) => setForm({ ...form, requesterOrg: e.target.value })}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Quantity / scope"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <Textarea
          rows={2}
          placeholder="Notes (timeline, requirements)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="resize-none"
        />
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          className="mt-0.5"
        />
        <span>
          I understand Novalyte AI is a technology platform that facilitates inquiries and does not
          sell, warranty, or fulfill products directly.
        </span>
      </label>
      <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700" disabled={submitting}>
        {submitting ? "Sending…" : <>Send quote request <ArrowRight className="ml-1 h-4 w-4" /></>}
      </Button>
    </form>
  );
}

/* ───────────────────────────────────────────────────────────────
   Quote dialog (used from sticky nav Request Quote button)
   ─────────────────────────────────────────────────────────────── */
function QuoteDialog({
  listing,
  open,
  onOpenChange,
}: {
  listing: MarketplaceListingT;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Quote className="h-4 w-4 text-teal-600" /> Request a quote
          </DialogTitle>
          <DialogDescription>
            {listing.title} · <span className="text-foreground/80">{listing.vendorName}</span>
          </DialogDescription>
        </DialogHeader>
        <CompactQuoteForm
          listing={listing}
          onSuccess={() => {
            toast.success("Quote request submitted", {
              description: `${listing.vendorName} will follow up via email.`,
            });
            setTimeout(() => onOpenChange(false), 1200);
          }}
        />
        <DisclaimerBanner tone="muted">
          Novalyte AI facilitates discovery and inquiry routing. We do not sell, ship, or warranty
          products. Vendor terms, lead times, and pricing are confirmed directly with the vendor.
        </DisclaimerBanner>
      </DialogContent>
    </Dialog>
  );
}
