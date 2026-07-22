"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner, MedicalDisclaimer } from "@/components/shared/disclaimer";
import {
  PremiumCard,
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
import { captureSafeEvent } from "@/lib/analytics-client";
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
  ShieldAlert,
  ChevronLeft
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
  if (a.includes("limit")) return { tone: "violet", label: "Limited availability" };
  if (a.includes("pre") || a.includes("back")) return { tone: "sky", label: "Pre-order" };
  return { tone: "teal", label: "In stock" };
}

const TABS = [
  { id: "overview", label: "Overview & Specs", icon: ClipboardCheck },
  { id: "supplier", label: "Supplier Profile", icon: Store },
  { id: "faqs", label: "FAQs & Guides", icon: HelpCircle },
];

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
  const [quantity, setQuantity] = useState(1);

  const savedProducts = useSaved((s) => s.products);
  const toggleSaved = useSaved((s) => s.toggle);
  const compareProducts = useCompare((s) => s.products);
  const toggleCompare = useCompare((s) => s.toggle);
  const isSaved = savedProducts.includes(listing.id);
  const isComparing = compareProducts.includes(listing.id);
  
  const addItem = useCart((s) => s.addItem);

  const c = colorClasses(listing.imageColor);
  const avail = availabilityMeta(listing.availability);

  useEffect(() => {
    captureSafeEvent("marketplace_product_viewed", {
      listing_id: listing.id,
      listing_type: listing.listingType,
      category: listing.category,
    });
  }, [listing.category, listing.id, listing.listingType]);

  // Derive vendor structure
  const vendor = useMemo(
    () => vendors.find((v) => v.name === listing.vendorName) ?? null,
    [vendors, listing.vendorName],
  );

  // Derive direct purchase capability
  const isDirectPurchase = listing.listingType === "product" && listing.pricingModel !== "quote";

  // Mock variants for direct-purchase products
  const variants = useMemo(() => {
    if (!isDirectPurchase) return [];
    
    // Parse price base from priceNote (e.g. "$120/case" -> 120)
    const basePrice = parseFloat(listing.priceNote?.replace(/[^0-9.]/g, "") || "100");
    
    return [
      { id: "standard", name: "Standard Pack", priceMultiplier: 1.0, suffix: "" },
      { id: "pro", name: "Pro Bundle (Pack of 5)", priceMultiplier: 4.2, suffix: " (Save 16%)" },
      { id: "bulk", name: "Enterprise Case (Pack of 24)", priceMultiplier: 18.0, suffix: " (Save 25%)" }
    ].map(v => ({
      ...v,
      calculatedPrice: basePrice * v.priceMultiplier
    }));
  }, [isDirectPurchase, listing.priceNote]);

  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.id || "standard");

  const currentPrice = useMemo(() => {
    if (!isDirectPurchase) return 0;
    const matched = variants.find(v => v.id === selectedVariant);
    return matched ? matched.calculatedPrice : parseFloat(listing.priceNote?.replace(/[^0-9.]/g, "") || "0");
  }, [isDirectPurchase, selectedVariant, variants, listing.priceNote]);

  const currentVariantLabel = useMemo(() => {
    return variants.find(v => v.id === selectedVariant)?.name || "Standard";
  }, [selectedVariant, variants]);

  // Specifications mock based on categories
  const specifications = useMemo(() => {
    const baseSpecs = [
      { name: "Brand / Manufacturer", value: listing.vendorName },
      { name: "Category Taxonomy", value: listing.category },
      { name: "Logistics Category", value: listing.listingType.toUpperCase() },
      { name: "Verification Status", value: listing.verified ? "Verified Supplier Profile" : "Staged Supplier" }
    ];

    if (listing.category === "Clinical Supplies" || listing.category === "Apparel and Staff Essentials") {
      return [
        ...baseSpecs,
        { name: "Sterility Class", value: "Class A / Non-sterile variants" },
        { name: "Package Material", value: "Recycled Clinical Box" },
        { name: "Compliance Standards", value: "FDA Registered Facility" }
      ];
    }

    if (listing.category === "Laboratory and Diagnostics" || listing.category === "Medical Equipment") {
      return [
        ...baseSpecs,
        { name: "Calibration Interval", value: "Annual / Self-Checking" },
        { name: "Power Source", value: "110V Standard Wall Cord" },
        { name: "Warranty Duration", value: "1-Year Parts & Labor" }
      ];
    }

    return [
      ...baseSpecs,
      { name: "Deployment model", value: "SaaS Cloud / Digital Routing" },
      { name: "System Requirements", value: "Any modern browser" },
      { name: "Security Standards", value: "HIPAA Compliant Data Hosting" }
    ];
  }, [listing]);

  // Deliverables & Scope list (for services/software)
  const deliverables = useMemo(() => {
    if (listing.listingType === "product") return [];
    return [
      "Dedicated integration project manager matching.",
      "Custom brand setup on portal configurations.",
      "Service Level Agreement (SLA) covering data feeds.",
      "Onboarding coaching sessions for clinical staffs.",
      "Regulatory compliance audit logs exportable quarterly."
    ];
  }, [listing.listingType]);

  // Availability restrictions description
  const availabilityRestrictions = useMemo(() => {
    if (listing.listingType === "product") {
      return "Fulfillment regions cover the continental United States. Standard freight routing applied at checkout.";
    }
    return "Service contracts available for providers in all 50 states. Local diagnostic feeds depend on partner lab locations.";
  }, [listing.listingType]);

  // Implementation / Setup timelines
  const setupTimeline = useMemo(() => {
    if (listing.category === "Healthcare Software") return "Immediate provision upon signup approval.";
    if (listing.category === "Staffing and Workforce Services") return "Matches sourced in 7-14 business days.";
    if (listing.category === "Credentialing and Compliance") return "Applications completed in 10-30 days.";
    return "3-5 days dispatch shipping.";
  }, [listing.category]);

  const handleAddCart = () => {
    if (isDirectPurchase) {
      addItem({
        id: listing.id,
        title: listing.title,
        variant: currentVariantLabel,
        price: currentPrice,
        imageColor: listing.imageColor,
        category: listing.category,
        vendorName: listing.vendorName,
        priceNote: listing.priceNote || "Custom",
        quantity: quantity
      });
      toast.success(`Added ${quantity} x "${listing.title} (${currentVariantLabel})" to cart!`);
    } else {
      setQuoteOpen(true);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [listing.id]);

  return (
    <div className="bg-background">
      {/* Breadcrumbs */}
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

      {/* Hero detail section */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/30 to-background py-10 sm:py-16">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
          
          {/* Left Column: Product Banner & Details */}
          <div className="space-y-6">
            <div className={cn("flex h-64 sm:h-80 w-full items-center justify-center rounded-3xl shadow-premium-md", c.bg)}>
              <CategoryIcon category={listing.category} className="h-16 w-16 text-white/95" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="muted">{listing.category}</StatusPill>
              <StatusPill tone="teal">{listing.listingType}</StatusPill>
              <StatusPill tone={avail.tone}>{avail.label}</StatusPill>
              {listing.verified && (
                <StatusPill tone="emerald">Verified Listing</StatusPill>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {listing.title}
            </h1>

            <div className="flex items-center gap-4 text-sm">
              <button 
                onClick={() => vendor && navigate("vendor-profile", undefined, { id: vendor.id })}
                className="font-semibold text-foreground hover:text-teal-700 transition flex items-center gap-1"
              >
                <Building2 className="h-4 w-4 text-muted-foreground" /> {listing.vendorName}
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>

            <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
              <p>{listing.description}</p>
            </div>
          </div>

          {/* Right Column: Order / Quote Widget */}
          <div className="space-y-4">
            <PremiumCard className="p-6 bg-white border-neutral-200/80 space-y-6">
              
              {/* Product Pricing and Variant Selector */}
              {isDirectPurchase ? (
                <div className="space-y-6">
                  <div>
                    <span className="text-2xl font-black text-teal-700">
                      ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">Estimated Unit Price</span>
                  </div>

                  <div className="space-y-3.5 pt-4 border-t border-neutral-100">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Variant</Label>
                    <div className="space-y-2">
                      {variants.map((v) => (
                        <label 
                          key={v.id}
                          className={cn(
                            "flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer hover:bg-neutral-50 transition-colors",
                            selectedVariant === v.id ? "border-teal-600 bg-teal-50/20" : "border-neutral-200"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="variant"
                              checked={selectedVariant === v.id}
                              onChange={() => setSelectedVariant(v.id)}
                              className="accent-teal-600"
                            />
                            <span className="text-xs font-bold text-foreground">{v.name}</span>
                          </div>
                          <span className="text-xs font-bold text-teal-700">
                            ${v.calculatedPrice.toFixed(2)}{v.suffix}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selector & Add to Cart */}
                  <div className="space-y-3.5 pt-4 border-t border-neutral-100">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</Label>
                    <div className="flex gap-3">
                      <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden h-11 bg-white">
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="px-4 hover:bg-neutral-50 text-neutral-500 font-bold transition-colors"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-foreground">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(q => q + 1)}
                          className="px-4 hover:bg-neutral-50 text-neutral-500 font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      <Button 
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold h-11 rounded-xl"
                        onClick={handleAddCart}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Services / Quote Request Widget
                <div className="space-y-4">
                  <div>
                    <span className="text-xl font-bold text-foreground">
                      {listing.priceNote || "Request Quote"}
                    </span>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{listing.pricingModel || "Custom"}</p>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-neutral-100">
                    <div className="flex items-start gap-2 text-xs">
                      <Clock className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Estimated Setup Time</p>
                        <p className="text-muted-foreground">{setupTimeline}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs pt-2">
                      <Globe className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Availability Scope</p>
                        <p className="text-muted-foreground">{availabilityRestrictions}</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-11 rounded-xl flex items-center justify-center gap-1.5"
                    onClick={() => setQuoteOpen(true)}
                  >
                    <Quote className="h-4 w-4" /> Request Quote &amp; Consult
                  </Button>
                </div>
              )}

              {/* Utility Panel */}
              <div className="flex justify-between pt-4 border-t border-neutral-100 text-xs">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("text-muted-foreground font-semibold hover:text-teal-700")}
                  onClick={() => toggleSaved("product", listing.id)}
                >
                  <SaveButton saved={isSaved} size="xs" className="mr-1" />
                  {isSaved ? "Saved" : "Save for Later"}
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground font-semibold hover:text-teal-700 flex items-center gap-1"
                  onClick={() => toggleCompare("product", listing.id)}
                >
                  <Boxes className={cn("h-4 w-4", isComparing ? "text-teal-600" : "")} />
                  Compare
                </Button>
              </div>

            </PremiumCard>
          </div>

        </div>
      </section>

      {/* Spec tabs */}
      <StickyTabNav
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab contents */}
      <SectionShell className="!py-10 bg-neutral-50/10">
        <div className="mx-auto w-full max-w-5xl">
          
          {/* Overview & Specs Tab */}
          {activeTab === "overview" && (
            <div className="novalyte-fade-up space-y-6">
              
              {/* Deliverables List (if service) */}
              {deliverables.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-foreground">SLA Deliverables &amp; Scope</h3>
                  <ul className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground leading-normal pl-4 list-disc">
                    {deliverables.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications table */}
              <div className="space-y-4 pt-4">
                <h3 className="text-base font-bold text-foreground">Catalog Specifications</h3>
                <PremiumCard className="p-0 overflow-hidden bg-white">
                  <table className="min-w-full divide-y divide-neutral-100 text-xs">
                    <tbody className="divide-y divide-neutral-100">
                      {specifications.map((spec, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50/30"}>
                          <td className="px-6 py-3.5 font-semibold text-muted-foreground w-1/3 border-r border-neutral-100">{spec.name}</td>
                          <td className="px-6 py-3.5 text-foreground font-medium">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </PremiumCard>
              </div>

            </div>
          )}

          {/* Supplier Tab */}
          {activeTab === "supplier" && (
            <div className="novalyte-fade-up space-y-4">
              <h2 className="text-xl font-bold text-foreground">Supplier Profile</h2>
              {vendor ? (
                <PremiumCard className="p-6 bg-white space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-premium-sm", c.bg)}>
                      {vendor.name.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground flex items-center gap-1.5">
                        {vendor.name} <VerificationBadge verified={vendor.verified} />
                      </h4>
                      <p className="text-xs text-muted-foreground">Verified Healthcare Supplier</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {vendor.overview || "This supplier provides verified medical materials, tech, or workforce solutions on the Novalyte AI marketplace."}
                  </p>
                  <div className="pt-4 border-t border-neutral-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="font-semibold"
                      onClick={() => navigate("vendor-profile", undefined, { id: vendor.id })}
                    >
                      Visit Supplier Storefront <ArrowRight className="ml-1 h-4.5 w-4.5" />
                    </Button>
                  </div>
                </PremiumCard>
              ) : (
                <p className="text-sm text-muted-foreground">Supplier information not loaded.</p>
              )}
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === "faqs" && (
            <div className="novalyte-fade-up space-y-4 text-xs text-muted-foreground leading-relaxed">
              <h2 className="text-xl font-bold text-foreground">Product FAQs</h2>
              <PremiumCard className="p-6 bg-white space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">What is the estimated delivery time?</h4>
                  <p>Fulfillment dispatch averages 3–5 business days. Expedited routes can be configured at the shipping step in checkout.</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">Does this require clinical verification?</h4>
                  <p>Yes. Buying medical equipment or clinical supplies requires an active clinic identifier. Compliance reviews are performed prior to shipping.</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">Are volume or bulk discounts available?</h4>
                  <p>Absolutely. For high-volume purchases, choose the "Pro Bundle" or "Enterprise Case" variants, or request a custom quote directly from the supplier.</p>
                </div>
              </PremiumCard>
            </div>
          )}

        </div>
      </SectionShell>

      {/* Safeguards footer */}
      <SectionShell className="!py-10">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <DisclaimerBanner tone="amber">
            <strong className="font-semibold">B2B Platform Safeguard.</strong> Novalyte AI does not sell, ship, or warranty any marketplace items directly. All transactions are routed directly to qualified third-party suppliers. No prescription medications are sold on this platform.
          </DisclaimerBanner>
          <MedicalDisclaimer />
        </div>
      </SectionShell>

      {/* Quote request dialog */}
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
          <QuoteDetailedForm listing={listing} onClose={() => setQuoteOpen(false)} />
        </DialogContent>
      </Dialog>

    </div>
  );
}

// 15-field Detailed Quote Form
function QuoteDetailedForm({ listing, onClose }: { listing: MarketplaceListingT; onClose: () => void }) {
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
