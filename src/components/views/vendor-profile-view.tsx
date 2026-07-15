"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner, MedicalDisclaimer } from "@/components/shared/disclaimer";
import {
  PremiumCard,
  MetaRow,
  EmptyState,
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
import { toast } from "sonner";
import { colorClasses } from "@/lib/constants";
import type { MarketplaceListingT, VendorT } from "@/lib/types";
import { navigate, useSaved, useCompare } from "@/lib/nav";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Quote,
  Package,
  Building2,
  Mail,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  Boxes,
  ClipboardCheck,
  Store,
  Inbox,
  Sparkles,
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
  MapPin,
  Truck,
  HelpCircle,
  ShieldAlert
} from "lucide-react";

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

const TABS = [
  { id: "catalog", label: "Storefront Products & Services", icon: Package },
  { id: "overview", label: "Company Overview", icon: Building2 },
  { id: "policies", label: "Shipping & Fulfillment Policies", icon: Truck },
  { id: "contact", label: "Contact & Support", icon: Mail },
];

const VENDOR_SNAP_DEFAULTS: Record<string, {
  locations: string;
  shipping: string;
  supportEmail: string;
  returnPolicy: string;
  warranty: string;
}> = {
  "helix-diagnostics": { locations: "Chicago, IL | Nationwide", shipping: "Nationwide (Cold-Chain available)", supportEmail: "support@helix-diagnostics.com", returnPolicy: "N/A - Reference diagnostic services", warranty: "N/A" },
  "apex-medical-supply": { locations: "Dallas, TX | Nationwide", shipping: "Nationwide (Standard, Expedited, and Freight)", supportEmail: "orders@apexmedical.com", returnPolicy: "30 days on unopened sterile products", warranty: "N/A" },
  "nova-recovery-systems": { locations: "Los Angeles, CA | North America", shipping: "US & Canada (Freight required for chambers)", supportEmail: "service@novarecovery.com", returnPolicy: "14 days on equipment (15% restocking fee)", warranty: "2-year manufacturer parts & labor warranty" },
  "clearpath-compliance": { locations: "Austin, TX | Multi-State", shipping: "Digital / Remote Delivery", supportEmail: "compliance@clearpath.com", returnPolicy: "N/A - Services contracts", warranty: "Satisfaction guarantee on filings" },
  "cadence-clinic-software": { locations: "San Francisco, CA | Global", shipping: "Cloud SaaS Deployment", supportEmail: "support@cadencesoftware.com", returnPolicy: "Cancel subscription anytime (retains access till cycle end)", warranty: "99.9% uptime SLA" },
  "medisolutions": { locations: "Atlanta, GA | Nationwide", shipping: "Nationwide (Freight & White-Glove inside delivery)", supportEmail: "support@medisolutions.com", returnPolicy: "30 days on exam tables and furniture", warranty: "1-year warranty on electronic actuators" },
  "careapparel-co": { locations: "New York, NY | Nationwide", shipping: "Nationwide (Standard Ground)", supportEmail: "support@careapparel.com", returnPolicy: "30-day exchange on clean, unwashed apparel", warranty: "Manufacturing defect replacement" },
  "beacon-patient-growth": { locations: "Boston, MA | Nationwide", shipping: "Remote Digital Sourcing", supportEmail: "growth@beacongrowth.com", returnPolicy: "N/A - Digital marketing agreements", warranty: "SLA backed deliverables" },
  "corestaff-healthcare": { locations: "Denver, CO | Nationwide", shipping: "Remote Placement", supportEmail: "staffing@corestaff.com", returnPolicy: "N/A - Staffing placements", warranty: "30-day candidate placement replacement guarantee" }
};

export function VendorProfileView({
  vendor,
  listings,
}: {
  vendor: VendorT;
  listings: MarketplaceListingT[];
}) {
  const [activeTab, setActiveTab] = useState("catalog");
  const [contactOpen, setContactOpen] = useState(false);

  const c = colorClasses("teal");

  // Load static snap defaults
  const snap = useMemo(() => {
    return VENDOR_SNAP_DEFAULTS[vendor.slug] ?? {
      locations: "Nationwide",
      shipping: "Standard Shipping",
      supportEmail: `support@${vendor.slug}.com`,
      returnPolicy: "Contact supplier for return information",
      warranty: "Manufacturer warranty where applicable"
    };
  }, [vendor.slug]);

  // Separate listings into direct-purchase products and quote-based services
  const directProducts = useMemo(() => {
    return listings.filter((l) => l.listingType === "product" && l.pricingModel !== "quote");
  }, [listings]);

  const quoteListings = useMemo(() => {
    return listings.filter((l) => l.listingType === "service" || l.listingType === "software" || l.pricingModel === "quote");
  }, [listings]);

  const categoriesServed = useMemo(() => {
    return Array.from(new Set(listings.map((l) => l.category))).sort();
  }, [listings]);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [vendor.id]);

  return (
    <div className="bg-background">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Marketplace", onClick: () => navigate("marketplace") },
              { label: "Suppliers", onClick: () => navigate("marketplace") },
              { label: vendor.name },
            ]}
          />
        </div>
      </div>

      {/* Hero storefront section */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/30 to-background py-10 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Supplier Logo placeholder */}
              <div className={cn("flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl text-3xl font-extrabold text-white shadow-premium-md", c.bg)}>
                {vendor.name.slice(0, 1)}
              </div>
              
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {vendor.name}
                  </h1>
                  <VerificationBadge verified={vendor.verified} />
                </div>

                {vendor.website && (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    {vendor.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    <ArrowRight className="h-3 w-3" />
                  </a>
                )}

                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {vendor.overview || `${vendor.name} is a verified B2B healthcare supplier on the Novalyte AI marketplace.`}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold" onClick={() => setContactOpen(true)}>
                    <Mail className="mr-1.5 h-4 w-4" /> Contact Supplier
                  </Button>
                  <Button variant="outline" onClick={() => navigate("marketplace")} className="font-semibold">
                    <Store className="mr-1.5 h-4 w-4" /> Browse Marketplace
                  </Button>
                </div>
              </div>
            </div>

            {/* Snapshot Sidebar Widget */}
            <PremiumCard className="w-full lg:w-72 shrink-0 p-5 bg-white space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Storefront Snapshot</h4>
              <dl className="space-y-3 text-xs leading-normal">
                <div className="flex justify-between pb-2 border-b border-neutral-100">
                  <dt className="text-muted-foreground font-medium">Headquarters</dt>
                  <dd className="font-semibold text-foreground text-right">{snap.locations.split("|")[0].trim()}</dd>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-100">
                  <dt className="text-muted-foreground font-medium">Active Listings</dt>
                  <dd className="font-semibold text-foreground">{listings.length}</dd>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-100">
                  <dt className="text-muted-foreground font-medium">Fulfillment Regions</dt>
                  <dd className="font-semibold text-foreground text-right max-w-[140px] truncate">{snap.shipping.split("(")[0].trim()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground font-medium">Response Rate</dt>
                  <dd className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> High
                  </dd>
                </div>
              </dl>
            </PremiumCard>
          </div>
        </div>
      </section>

      {/* Sticky nav tab bar */}
      <StickyTabNav
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
        rightSlot={
          <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => setContactOpen(true)}>
            <Mail className="mr-1 h-3.5 w-3.5" /> Contact Supplier
          </Button>
        }
      />

      {/* Tab content areas */}
      <SectionShell className="!py-10 sm:!py-14 bg-neutral-50/10">
        <div className="mx-auto w-full max-w-5xl">
          
          {/* Catalog Tab */}
          {activeTab === "catalog" && (
            <div className="novalyte-fade-up space-y-10">
              {/* Direct Purchase Products */}
              {directProducts.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Direct Purchase Products</h3>
                    <p className="text-xs text-muted-foreground">Items eligible for immediate checkout via shopping cart.</p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {directProducts.map((l) => (
                      <VendorListingCard key={l.id} listing={l} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quote-based Services & Equipment */}
              {quoteListings.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-neutral-100">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Quote-Based Services &amp; Equipment</h3>
                    <p className="text-xs text-muted-foreground">High-value, specialized, or custom solutions requiring consult.</p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {quoteListings.map((l) => (
                      <VendorListingCard key={l.id} listing={l} />
                    ))}
                  </div>
                </div>
              )}

              {listings.length === 0 && (
                <EmptyState
                  icon={Package}
                  title="No active listings"
                  description={`${vendor.name} has no published listings at this time.`}
                  action={
                    <Button variant="outline" size="sm" onClick={() => navigate("marketplace")}>
                      Browse Full Marketplace
                    </Button>
                  }
                />
              )}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="novalyte-fade-up space-y-6">
              <h2 className="text-xl font-bold text-foreground">Company Overview</h2>
              <PremiumCard className="p-6 bg-white space-y-4 leading-relaxed text-sm text-muted-foreground">
                <p>
                  {vendor.name} is a qualified supplier on the Novalyte AI marketplace platform. We operate under strict service levels to ensure rapid response routing and clear catalog specifications for clinical buyers.
                </p>
                <p>
                  Our solutions are designed to optimize B2B procurement, helping clinics scale operations, standardize consumable inventory, and implement advanced technologies seamlessly.
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-neutral-100 text-foreground">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Locations Served</p>
                      <p className="text-sm font-semibold mt-0.5">{snap.locations}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Website</p>
                      <p className="text-sm font-semibold mt-0.5">{vendor.website || "No site linked"}</p>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </div>
          )}

          {/* Policies Tab */}
          {activeTab === "policies" && (
            <div className="novalyte-fade-up space-y-6">
              <h2 className="text-xl font-bold text-foreground">Fulfillment &amp; Return Policies</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <PremiumCard className="p-5 bg-white space-y-2">
                  <Truck className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold text-sm text-foreground">Shipping Details</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {snap.shipping}. Alternate freight configurations or priority clinical logistics can be arranged by our logistics coordinator upon quote confirmation.
                  </p>
                </PremiumCard>
                
                <PremiumCard className="p-5 bg-white space-y-2">
                  <ShieldCheck className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold text-sm text-foreground">Return Policy</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {snap.returnPolicy}. Returns require pre-authorization from our compliance team. Custom-order or biological components are non-returnable.
                  </p>
                </PremiumCard>

                <PremiumCard className="p-5 bg-white space-y-2 md:col-span-2">
                  <BadgeCheck className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold text-sm text-foreground">Warranty Terms</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {snap.warranty}. Warranty service inquiries should be routed through support channels referencing your order or project ID.
                  </p>
                </PremiumCard>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="novalyte-fade-up space-y-6">
              <h2 className="text-xl font-bold text-foreground">Contact &amp; Support</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <PremiumCard className="p-6 bg-white">
                    <ContactForm vendor={vendor} defaultListingId={listings[0]?.id} />
                  </PremiumCard>
                </div>
                
                <div className="space-y-4">
                  <PremiumCard className="p-4 bg-white space-y-2">
                    <Mail className="h-4.5 w-4.5 text-teal-600" />
                    <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">Support Email</h4>
                    <p className="text-xs font-semibold text-teal-700">{snap.supportEmail}</p>
                  </PremiumCard>

                  <PremiumCard className="p-4 bg-white space-y-2">
                    <Inbox className="h-4.5 w-4.5 text-teal-600" />
                    <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">Inquiry Routing</h4>
                    <p className="text-xs text-muted-foreground leading-normal">
                      All messages are routed directly to {vendor.name}. Expect an email follow-up within 1 business day.
                    </p>
                  </PremiumCard>
                </div>
              </div>
            </div>
          )}

        </div>
      </SectionShell>

      {/* Bottom disclaimer */}
      <SectionShell className="!py-10">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <DisclaimerBanner tone="amber">
            <strong className="font-semibold">Independent Supplier.</strong> {vendor.name} is an independently operated healthcare supplier. Novalyte AI is a technology platform coordinating logistics discovery, not a reseller. Complete independent diligence on all licenses and certifications.
          </DisclaimerBanner>
          <MedicalDisclaimer />
        </div>
      </SectionShell>

      {/* Contact modal dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4.5 w-4.5 text-teal-600" /> Contact {vendor.name}
            </DialogTitle>
            <DialogDescription>
              Submit an operational or placement request. Routed via Novalyte.
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            vendor={vendor}
            defaultListingId={listings[0]?.id}
            onSuccess={() => setTimeout(() => setContactOpen(false), 1200)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Compact Listing Card
function VendorListingCard({ listing }: { listing: MarketplaceListingT }) {
  const savedProducts = useSaved((s) => s.products);
  const toggleSaved = useSaved((s) => s.toggle);
  const compareProducts = useCompare((s) => s.products);
  const toggleCompare = useCompare((s) => s.toggle);
  const isSaved = savedProducts.includes(listing.id);
  const isComparing = compareProducts.includes(listing.id);
  const addItem = useCart((s) => s.addItem);

  const c = colorClasses(listing.imageColor);
  const avail = availabilityMeta(listing.availability);

  const [quoteOpen, setQuoteOpen] = useState(false);

  // Derive direct-purchase capabilities
  const isDirectPurchase = listing.listingType === "product" && listing.pricingModel !== "quote";

  const handleCartAction = () => {
    if (isDirectPurchase) {
      // Direct Add to Cart
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
      toast.success(`"${listing.title}" added to shopping cart!`);
    } else {
      setQuoteOpen(true);
    }
  };

  return (
    <PremiumCard hover className="flex flex-col overflow-hidden bg-white">
      <div className={cn("relative h-24 w-full flex items-center justify-center", c.bg)}>
        <CategoryIcon category={listing.category} className="h-8 w-8 text-white/90" />
        <div className="absolute right-2 top-2">
          <SaveButton saved={isSaved} onToggle={() => toggleSaved("product", listing.id)} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <button
          onClick={() => navigate("product-detail", undefined, { id: listing.id })}
          className="text-left text-base font-semibold leading-snug text-foreground hover:text-teal-700 transition-colors line-clamp-1"
        >
          {listing.title}
        </button>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusPill tone="muted">{listing.category}</StatusPill>
          <StatusPill tone="teal">{listing.listingType}</StatusPill>
          <StatusPill tone={avail.tone}>{avail.label}</StatusPill>
        </div>
        
        <p className="mt-2.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {listing.description}
        </p>
        
        <div className="mt-4 flex items-end justify-between border-t border-neutral-100 pt-4">
          <div>
            <p className="text-sm font-bold text-foreground">{listing.priceNote || "Request quote"}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">{listing.pricingModel || "Quote"}</p>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              className={cn("font-bold text-xs h-8 px-3 text-white bg-teal-600 hover:bg-teal-700")}
              onClick={handleCartAction}
            >
              {isDirectPurchase ? "Add to Cart" : "Request Quote"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-neutral-200 hover:border-teal-200"
              onClick={() => toggleCompare("product", listing.id)}
            >
              <Boxes className={cn("h-3.5 w-3.5", isComparing ? "text-teal-600" : "text-neutral-500")} />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Quote className="h-4 w-4 text-teal-600" /> Request a quote
            </DialogTitle>
            <DialogDescription>
              {listing.title} · <span className="text-foreground/80">{listing.vendorName}</span>
            </DialogDescription>
          </DialogHeader>
          <QuoteInlineForm listing={listing} onClose={() => setQuoteOpen(false)} />
        </DialogContent>
      </Dialog>
    </PremiumCard>
  );
}

// Quote Form Dialog (Inline)
function QuoteInlineForm({ listing, onClose }: { listing: MarketplaceListingT; onClose: () => void }) {
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
      // Serialize all fields into notes
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
    <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
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

// General Contact Form (uses /api/contact)
function ContactForm({
  vendor,
  defaultListingId,
  onSuccess,
}: {
  vendor: VendorT;
  defaultListingId?: string;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
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
      const context = defaultListingId
        ? `[Novalyte B2B Supplier Room — vendor: ${vendor.name} — listing ref: ${defaultListingId}] ${form.message}`
        : `[Novalyte B2B Supplier Room — vendor: ${vendor.name}] ${form.message}`;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: "vendor",
          message: form.organization ? `[Org: ${form.organization}] ${context}` : context,
        }),
      });

      if (!res.ok) throw new Error();
      setDone(true);
      toast.success("Message sent successfully!");
      onSuccess?.();
    } catch {
      toast.error("Failed to send message. Please try again.");
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
        <p className="text-base font-semibold text-foreground">Message Sent</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          We have routed your message directly to {vendor.name}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label className="text-xs">Full Name *</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your Name" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Work Email *</Label>
          <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@clinic.com" />
        </div>
      </div>

      <div className="grid gap-1">
        <Label className="text-xs">Organization / Clinic</Label>
        <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Organization Name" />
      </div>

      <div className="grid gap-1">
        <Label className="text-xs">Message *</Label>
        <Textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={`Tell ${vendor.name} about your operational needs or diagnostic requirements...`} className="resize-none text-xs" />
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground leading-snug">
        <input type="checkbox" required checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5 accent-teal-600" />
        <span>
          I understand Novalyte AI facilitates this request and does not fulfill products.
        </span>
      </label>

      <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700 font-bold" disabled={submitting}>
        {submitting ? "Sending..." : <>Send Message <ArrowRight className="ml-1 h-4 w-4" /></>}
      </Button>
    </form>
  );
}
