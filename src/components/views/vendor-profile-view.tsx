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
} from "lucide-react";

/* Category icon — stable wrapper (switch with literal JSX so the React
   Compiler treats it as a static element) */
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

const TABS = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "catalog", label: "Products & Services", icon: Package },
  { id: "verification", label: "Verification", icon: ShieldCheck },
  { id: "contact", label: "Contact", icon: Mail },
];

const WHAT_VERIFICATION_MEANS = [
  "Submitted business information has been reviewed by Novalyte AI.",
  "Listing categories are reviewed for fit with the men's health operations marketplace.",
  "Clinical and outcome claims are subject to moderation before publication.",
  "Vendor maintains an active catalog and inquiry-routing channel through Novalyte.",
];

const VERIFICATION_IS_NOT = [
  "An endorsement of clinical outcomes, product efficacy, or service quality.",
  "A guarantee of regulatory compliance, licensure, or certifications.",
  "A warranty, insurance, or fulfillment commitment by Novalyte AI.",
  "A substitute for independent due diligence before purchase.",
];

/* ───────────────────────────────────────────────────────────────
   Main view
   ─────────────────────────────────────────────────────────────── */
export function VendorProfileView({
  vendor,
  listings,
}: {
  vendor: VendorT;
  listings: MarketplaceListingT[];
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [contactOpen, setContactOpen] = useState(false);

  const c = colorClasses("teal");

  // Derive categories served from their listings
  const categoriesServed = useMemo(() => {
    return Array.from(new Set(listings.map((l) => l.category))).sort();
  }, [listings]);

  const verifiedListings = useMemo(() => listings.filter((l) => l.verified), [listings]);

  // Reset active tab whenever the vendor changes — uses "adjusting state during
  // render" pattern (endorsed by React docs) to avoid setState-in-effect.
  const [lastVendorId, setLastVendorId] = useState(vendor.id);
  if (lastVendorId !== vendor.id) {
    setLastVendorId(vendor.id);
    setActiveTab("overview");
  }

  // Scroll to top on vendor change (genuine side effect — OK in useEffect).
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [vendor.id]);

  return (
    <div className="bg-background">
      {/* ── Breadcrumbs ───────────────────────────────────────── */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Marketplace", onClick: () => navigate("marketplace") },
              { label: "Vendors", onClick: () => navigate("marketplace") },
              { label: vendor.name },
            ]}
          />
        </div>
      </div>

      {/* ── Hero header ──────────────────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/40 to-background py-10 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className={cn("flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-premium-sm", c.bg)}>
              {vendor.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {vendor.name}
                </h1>
                <VerificationBadge verified={vendor.verified} />
              </div>
              {vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 transition hover:text-teal-800"
                >
                  <Globe className="h-4 w-4" />
                  {vendor.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  <ArrowRight className="h-3 w-3" />
                </a>
              )}
              <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground">
                {vendor.overview || `${vendor.name} is a vendor on the Novalyte AI healthcare services marketplace.`}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => setContactOpen(true)}>
                  <Mail className="mr-1 h-4 w-4" /> Contact vendor
                </Button>
                <Button variant="outline" onClick={() => navigate("marketplace")}>
                  <Store className="mr-1 h-4 w-4" /> Browse marketplace
                </Button>
                <Button variant="ghost" onClick={() => navigate("marketplace", undefined, undefined)}>
                  <Sparkles className="mr-1 h-4 w-4 text-teal-600" /> Become a vendor
                </Button>
              </div>
            </div>

            {/* Side meta card */}
            <PremiumCard className="hidden w-64 shrink-0 p-5 lg:block">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Vendor snapshot</p>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <VerificationBadge verified={vendor.verified} />
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Active listings</dt>
                  <dd className="font-semibold text-foreground">{listings.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Categories</dt>
                  <dd className="font-semibold text-foreground">{categoriesServed.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Verified listings</dt>
                  <dd className="font-semibold text-foreground">{verifiedListings.length}</dd>
                </div>
              </dl>
            </PremiumCard>
          </div>
        </div>
      </section>

      {/* ── Sticky tab nav ───────────────────────────────────── */}
      <StickyTabNav
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
        rightSlot={
          <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => setContactOpen(true)}>
            <Mail className="mr-1 h-3.5 w-3.5" /> Contact
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
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  {vendor.overview || `${vendor.name} is a vendor on the Novalyte AI healthcare services marketplace.`}
                </p>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  As a Novalyte marketplace participant, {vendor.name} maintains a structured catalog
                  and receives inquiry routing through the platform. Quotes, terms, lead times, and
                  fulfillment are coordinated directly between your organization and the vendor.
                </p>
              </div>

              <SectionDivider label="What they offer" />
              <div className="grid gap-3 sm:grid-cols-2">
                <PremiumCard className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-teal-600" />
                    <h4 className="text-sm font-semibold text-foreground">Catalog scope</h4>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {listings.length} active listing{listings.length === 1 ? "" : "s"} across {categoriesServed.length} categor{categoriesServed.length === 1 ? "y" : "ies"}.
                  </p>
                </PremiumCard>
                <PremiumCard className="p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                    <h4 className="text-sm font-semibold text-foreground">Verification</h4>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {vendor.verified ? "Verified vendor — business information reviewed." : "Vendor verification under review or pending."}
                  </p>
                </PremiumCard>
              </div>

              <SectionDivider label="Categories they serve" />
              {categoriesServed.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categoriesServed.map((cat) => {
                    return (
                      <button
                        key={cat}
                        onClick={() => navigate("marketplace")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-teal-300 hover:text-teal-700"
                      >
                        <CategoryIcon category={cat} className="h-3.5 w-3.5" /> {cat}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active listings yet.</p>
              )}
            </div>
          )}

          {activeTab === "catalog" && (
            <div className="novalyte-fade-up space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Products &amp; services</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {listings.length} active listing{listings.length === 1 ? "" : "s"} from {vendor.name}.
                  </p>
                </div>
              </div>

              {listings.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No active listings"
                  description={`${vendor.name} does not currently have any active listings on the marketplace.`}
                  action={
                    <Button variant="outline" size="sm" onClick={() => navigate("marketplace")}>
                      Browse full marketplace
                    </Button>
                  }
                />
              ) : (
                <div className="novalyte-fade-up grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map((l) => (
                    <VendorListingCard key={l.id} listing={l} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "verification" && (
            <div className="novalyte-fade-up space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Verification</h2>

              <PremiumCard className="p-6">
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                      vendor.verified ? "bg-teal-50 text-teal-600" : "bg-amber-50 text-amber-600",
                    )}
                  >
                    {vendor.verified ? <ShieldCheck className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {vendor.verified ? "Verified vendor" : "Verification under review"}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {vendor.verified
                        ? "Novalyte AI has reviewed this vendor's submitted business information. Verification is a transparency signal — not an endorsement."
                        : "This vendor's verification is currently under review or pending submission. Inquiries can still be routed; perform independent due diligence before purchase."}
                    </p>
                  </div>
                </div>
              </PremiumCard>

              <div className="grid gap-4 md:grid-cols-2">
                <PremiumCard className="p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-teal-600" /> What verification means
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {WHAT_VERIFICATION_MEANS.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </PremiumCard>
                <PremiumCard className="p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AlertCircle className="h-4 w-4 text-amber-600" /> What verification is not
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {VERIFICATION_IS_NOT.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </PremiumCard>
              </div>

              <SectionDivider label="Listing review status" />
              <MetaRow
                columns={3}
                items={[
                  { label: "Total listings", value: listings.length, icon: Package },
                  { label: "Verified listings", value: verifiedListings.length, icon: ShieldCheck },
                  {
                    label: "Under review",
                    value: listings.length - verifiedListings.length,
                    icon: Clock,
                  },
                ]}
              />
              <DisclaimerBanner tone="amber">
                Verification reflects a review of submitted business information. It is not an
                endorsement of clinical outcomes, product efficacy, or vendor performance.
                Independent due diligence — including regulatory, licensure, and reference checks —
                is recommended before entering purchasing agreements.
              </DisclaimerBanner>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="novalyte-fade-up space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Contact {vendor.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Send a general inquiry or request a quote on a specific listing. Novalyte routes
                  your message to the vendor; they respond directly.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-[1fr_280px]">
                <PremiumCard className="p-6">
                  <ContactForm vendor={vendor} defaultListingId={listings[0]?.id} />
                </PremiumCard>

                <div className="space-y-3">
                  <PremiumCard className="p-4">
                    <Inbox className="h-4 w-4 text-teal-600" />
                    <h4 className="mt-2 text-sm font-semibold text-foreground">Inquiry routing</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submissions are routed to {vendor.name} via Novalyte. Novalyte does not sell,
                      warranty, or fulfill products.
                    </p>
                  </PremiumCard>
                  <PremiumCard className="p-4">
                    <MessageSquare className="h-4 w-4 text-teal-600" />
                    <h4 className="mt-2 text-sm font-semibold text-foreground">Response time</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Vendors respond on their own timeline. For urgent procurement, indicate timeline
                      in your message.
                    </p>
                  </PremiumCard>
                  <PremiumCard className="p-4">
                    <ClipboardCheck className="h-4 w-4 text-teal-600" />
                    <h4 className="mt-2 text-sm font-semibold text-foreground">Independent diligence</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Verification is not an endorsement. Confirm compliance, references, and terms
                      directly with the vendor.
                    </p>
                  </PremiumCard>
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionShell>

      {/* ── Bottom disclaimer ────────────────────────────────── */}
      <SectionShell className="!py-10">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <DisclaimerBanner tone="amber">
            <strong className="font-semibold">Vendors are independent.</strong> {vendor.name} is an
            independently operated business. Novalyte AI facilitates discovery and inquiry routing
            and does not endorse, warrant, insure, or fulfill the vendor's products or services.
            Verification reflects a review of submitted business information and is not a guarantee
            of clinical outcomes, product efficacy, or vendor performance. Perform independent due
            diligence before entering purchasing agreements.
          </DisclaimerBanner>
          <MedicalDisclaimer />
        </div>
      </SectionShell>

      {/* ── Contact dialog (from sticky nav) ─────────────────── */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-teal-600" /> Contact {vendor.name}
            </DialogTitle>
            <DialogDescription>
              Send a general inquiry or quote request. Routed via Novalyte.
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            vendor={vendor}
            defaultListingId={listings[0]?.id}
            onSuccess={() => setTimeout(() => setContactOpen(false), 1200)}
          />
          <DisclaimerBanner tone="muted">
            Novalyte AI facilitates discovery and inquiry routing. We do not sell, ship, or warranty
            products. Vendor terms, lead times, and pricing are confirmed directly with the vendor.
          </DisclaimerBanner>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Vendor listing card (compact, with quote + save + compare)
   ─────────────────────────────────────────────────────────────── */
function VendorListingCard({ listing }: { listing: MarketplaceListingT }) {
  const savedProducts = useSaved((s) => s.products);
  const toggleSaved = useSaved((s) => s.toggle);
  const compareProducts = useCompare((s) => s.products);
  const toggleCompare = useCompare((s) => s.toggle);
  const isSaved = savedProducts.includes(listing.id);
  const isComparing = compareProducts.includes(listing.id);

  const c = colorClasses(listing.imageColor);
  const avail = availabilityMeta(listing.availability);

  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <PremiumCard hover className="flex flex-col overflow-hidden">
      <div className={cn("relative h-24 w-full", c.bg)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <CategoryIcon category={listing.category} className="h-8 w-8 text-white/90" />
        </div>
        <div className="absolute right-2 top-2">
          <SaveButton saved={isSaved} onToggle={() => toggleSaved("product", listing.id)} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <button
          onClick={() => navigate("product-detail", undefined, { id: listing.id })}
          className="text-left text-base font-semibold leading-snug text-foreground transition hover:text-teal-700"
        >
          {listing.title}
        </button>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusPill tone="muted">{listing.category}</StatusPill>
          <StatusPill tone="teal">{listing.listingType}</StatusPill>
          <StatusPill tone={avail.tone}>{avail.label}</StatusPill>
        </div>
        <p className="mt-2.5 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{listing.priceNote || "Request quote"}</p>
            <p className="text-xs text-muted-foreground">{listing.pricingModel || "—"}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <Button size="sm" className="flex-1 bg-teal-600 text-white hover:bg-teal-700" onClick={() => setQuoteOpen(true)}>
            <Quote className="mr-1 h-3.5 w-3.5" /> Request Quote
          </Button>
          <Button
            variant={isComparing ? "default" : "outline"}
            size="sm"
            onClick={() => toggleCompare("product", listing.id)}
            className={cn(isComparing && "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100")}
          >
            <Boxes className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("product-detail", undefined, { id: listing.id })}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
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
          <DisclaimerBanner tone="muted">
            Novalyte AI facilitates discovery and inquiry routing. We do not sell, ship, or warranty
            products. Vendor terms, lead times, and pricing are confirmed directly with the vendor.
          </DisclaimerBanner>
        </DialogContent>
      </Dialog>
    </PremiumCard>
  );
}

/* ───────────────────────────────────────────────────────────────
   Inline quote form (used inside the vendor listing card dialog)
   ─────────────────────────────────────────────────────────────── */
function QuoteInlineForm({ listing, onClose }: { listing: MarketplaceListingT; onClose: () => void }) {
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
      toast.success("Quote request submitted", {
        description: `${listing.vendorName} will follow up via email.`,
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
          <CheckCircle2 className="h-6 w-6 text-teal-600" />
        </span>
        <p className="text-base font-semibold text-foreground">Quote request submitted</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          We routed your inquiry to {listing.vendorName}. Expect a follow-up at the email you provided.
        </p>
        <Button variant="outline" size="sm" onClick={onClose} className="mt-2">Close</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-xs">Full name <span className="text-rose-500">*</span></Label>
          <Input required value={form.requesterName} onChange={(e) => setForm({ ...form, requesterName: e.target.value })} placeholder="Your name" />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">Work email <span className="text-rose-500">*</span></Label>
          <Input required type="email" value={form.requesterEmail} onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })} placeholder="you@clinic.com" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Organization / clinic</Label>
        <Input value={form.requesterOrg} onChange={(e) => setForm({ ...form, requesterOrg: e.target.value })} placeholder="Clinic or company name" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-xs">Quantity / scope</Label>
          <Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 10 units" />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">Notes</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Timeline, requirements" className="resize-none" />
        </div>
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5" />
        <span>
          I understand Novalyte AI is a technology platform that facilitates commerce inquiries and
          does not sell, warranty, or fulfill products directly.
        </span>
      </label>
      <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700" disabled={submitting}>
        {submitting ? "Sending…" : <>Send quote request <ArrowRight className="ml-1 h-4 w-4" /></>}
      </Button>
    </form>
  );
}

/* ───────────────────────────────────────────────────────────────
   Contact form (POSTs to /api/contact with role="vendor")
   ─────────────────────────────────────────────────────────────── */
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consent) {
      toast.error("Please acknowledge the platform terms before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      // Compose a vendor-context message that includes a quote/listing reference if available.
      const context = defaultListingId
        ? `[Novalyte marketplace — vendor: ${vendor.name} — listing ref: ${defaultListingId}] ${form.message}`
        : `[Novalyte marketplace — vendor: ${vendor.name}] ${form.message}`;
      const payload: { name: string; email: string; role: "vendor"; message: string } = {
        name: form.name,
        email: form.email,
        role: "vendor",
        message: form.organization ? `[Org: ${form.organization}] ${context}` : context,
      };
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
      toast.success("Message sent", {
        description: `Your inquiry has been routed to ${vendor.name}.`,
      });
      onSuccess?.();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
          <CheckCircle2 className="h-6 w-6 text-teal-600" />
        </span>
        <p className="text-base font-semibold text-foreground">Message sent</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your inquiry has been routed to {vendor.name}. Expect a follow-up at the email you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-xs">Full name <span className="text-rose-500">*</span></Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">Work email <span className="text-rose-500">*</span></Label>
          <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@clinic.com" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Organization / clinic</Label>
        <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Clinic or company name" />
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Message <span className="text-rose-500">*</span></Label>
        <Textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder={`Tell ${vendor.name} what you're sourcing, quantities, timeline, and any financing or bulk-pricing interest.`}
        />
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5" />
        <span>
          I understand Novalyte AI is a technology platform that facilitates commerce inquiries and
          does not sell, warranty, or fulfill products directly. Verification is not an endorsement.
        </span>
      </label>
      <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700" disabled={submitting}>
        {submitting ? "Sending…" : <>Send message <ArrowRight className="ml-1 h-4 w-4" /></>}
      </Button>
    </form>
  );
}
