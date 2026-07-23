"use client";

import { useState, useMemo, useCallback } from "react";
import {
  PremiumCard, Breadcrumbs, SaveButton, EmptyState,
} from "@/components/shared/enterprise";
import { StickyTabNav } from "@/components/shared/sticky-tab-nav";
import { SmartImage, ImageLightbox } from "@/components/shared/smart-image";
import { StatusPill, ListingStatusBadge } from "@/components/shared/badges";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getClinicImage, getClinicGallery } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { navigate, useSaved } from "@/lib/nav";
import { splitCsv, colorClasses, initials } from "@/lib/constants";
import type { ClinicT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { captureSafeEvent } from "@/lib/analytics-client";
import { resolveListingStatus } from "@/lib/directory/listing-status";
import { toast } from "sonner";
import {
  MapPin, Video, Phone, Mail, Globe, Clock, ShieldCheck, Stethoscope,
  CheckCircle2, Star, ArrowRight, Heart, Navigation, Building2, Users,
  Calendar, DollarSign, FileText, Award, Lock, Sparkles, ChevronRight,
  Image as ImageIcon, MessageSquare, BookOpen, AlertCircle, ShieldAlert, Check,
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "treatments", label: "Treatments & Specialties", icon: Stethoscope },
  { id: "providers", label: "Providers", icon: Users },
  { id: "locations", label: "Locations & Hours", icon: MapPin },
  { id: "insurance", label: "Insurance & Pricing", icon: DollarSign },
  { id: "telehealth", label: "Telehealth", icon: Video },
  { id: "eligibility", label: "Eligibility", icon: FileText },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "faq", label: "FAQ", icon: MessageSquare },
  { id: "contact", label: "Contact & Booking", icon: Calendar },
  { id: "safety", label: "Safety & Compliance", icon: ShieldCheck },
];

export function ClinicProfileView({ clinic, allClinics }: { clinic: ClinicT; allClinics: ClinicT[] }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [claimOpen, setClaimOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimForm, setClaimForm] = useState({ dmFirstName: "", dmLastName: "", dmEmail: "", dmPhone: "", authorized: false });
  const saved = useSaved((s) => s.has("clinic", clinic.id));
  const toggleSave = useSaved((s) => s.toggle);
  const c = colorClasses(clinic.logoColor);

  const specs = useMemo(() => splitCsv(clinic.specialties), [clinic.specialties]);
  const caps = useMemo(() => splitCsv(clinic.capabilities), [clinic.capabilities]);
  const providers = useMemo(() => splitCsv(clinic.providerTypes), [clinic.providerTypes]);

  // Related clinics (same state or shared specialty, excluding self)
  const related = useMemo(() => {
    return allClinics
      .filter((x) => x.id !== clinic.id)
      .map((x) => {
        const sharedSpecialty = splitCsv(x.specialties).filter((s) => specs.includes(s)).length;
        const sameState = x.state === clinic.state ? 1 : 0;
        return { clinic: x, score: sharedSpecialty * 2 + sameState };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.clinic);
  }, [allClinics, clinic.id, specs, clinic.state]);

  const scrollToTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
    const el = document.getElementById("clinic-content");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Claim Submit logic
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimForm.authorized) {
      toast.error("Please confirm you are authorized to claim this profile.");
      return;
    }
    setClaiming(true);
    try {
      const res = await fetch(`/api/clinics/${clinic.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimForm),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Claim failed");
      
      toast.success("Profile claimed successfully! Redirecting to management dashboard...");
      // The server is the source of truth; the dashboard will render the new claim state.
      navigate("clinic-dashboard", undefined, { id: clinic.id });
    } catch (err: any) {
      toast.error(err.message || "Failed to claim profile. Please try again.");
    } finally {
      setClaiming(false);
      setClaimOpen(false);
    }
  };

  const consultPriceText = () => {
    if (clinic.initialConsultPrice !== null) {
      if (clinic.initialConsultPrice === 0) return "Free Consultation";
      return `$${clinic.initialConsultPrice} Consultation`;
    }
    return "Contact Clinic";
  };

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs items={[
            { label: "Home", onClick: () => navigate("home") },
            { label: "Clinic Directory", onClick: () => navigate("directory") },
            { label: clinic.name },
          ]} />
        </div>
      </div>

      {/* Listing status banners */}
      {resolveListingStatus(clinic) === "demo" && (
        <div className="bg-slate-700 text-white font-medium text-xs sm:text-sm py-2.5 px-4 text-center flex items-center justify-center gap-2 relative" role="status">
          <ShieldAlert className="h-4.5 w-4.5" aria-hidden />
          <span>
            This is a fictional demonstration profile created to preview Novalyte AI directory functionality. It does not represent an operating clinic.
          </span>
        </div>
      )}
      {resolveListingStatus(clinic) === "unclaimed" && (
        <div className="bg-amber-500 text-white font-medium text-xs sm:text-sm py-2.5 px-4 text-center flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 relative" role="status">
          <span className="inline-flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5" aria-hidden />
            This is an unclaimed profile compiled from publicly available information. Details may be incomplete or outdated. Clinic representatives can claim the listing to verify and manage the profile.
          </span>
          <a
            href={`/clinics/apply?claim=1&clinicId=${encodeURIComponent(clinic.id)}&slug=${encodeURIComponent(clinic.slug)}&name=${encodeURIComponent(clinic.name)}`}
            className="underline hover:text-amber-100 font-bold focus:outline-none"
            onClick={() =>
              captureSafeEvent("directory_claim_clicked", {
                clinic_id: clinic.id,
                clinic_slug: clinic.slug,
                listing_status: "unclaimed",
                city: clinic.city,
                state: clinic.state,
              })
            }
          >
            Own or manage this clinic? Claim and update this listing.
          </a>
        </div>
      )}

      {/* Cover image */}
      <div className="relative h-48 overflow-hidden border-b border-border sm:h-64 lg:h-80 bg-muted">
        <SmartImage
          src={getClinicImage(clinic.slug)}
          alt={`${clinic.name}`}
          fill
          priority
          sizes="100vw"
          imgClassName="object-cover"
          fallback={<div className={cn("h-full w-full", c.soft)} />}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" aria-hidden />
      </div>

      {/* Hero Header */}
      <section className="relative border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* Left: identity */}
            <div>
              <div className="flex items-start gap-4">
                <span className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-premium-md ring-4 ring-background", c.bg)}>
                  {initials(clinic.name)}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{clinic.name}</h1>
                    <ListingStatusBadge clinic={clinic} />
                  </div>
                  {clinic.tagline && <p className="mt-1 text-sm font-medium text-foreground/80">{clinic.tagline}</p>}
                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {clinic.city}, {clinic.state}</span>
                    {clinic.telehealth && <span className="inline-flex items-center gap-1"><Video className="h-3.5 w-3.5 text-teal-600" /> Telehealth Coverage</span>}
                    {clinic.hours && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {clinic.hours.split(",")[0]}</span>}
                  </div>
                </div>
              </div>

              {/* Specialty chips */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {specs.map((s) => (
                  <Badge key={s} className="border-teal-200 bg-white/70 text-teal-700 hover:bg-white/70">{s}</Badge>
                ))}
              </div>

              {/* Trust signals */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-foreground/70">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  {resolveListingStatus(clinic) === "verified"
                    ? "Verified Clinic Identity"
                    : resolveListingStatus(clinic) === "demo"
                      ? "Demonstration profile"
                      : "Not verified by Novalyte AI"}
                </span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-emerald-600" /> {clinic.providers?.length || providers.length} Provider{(clinic.providers?.length || providers.length) !== 1 ? "s" : ""}</span>
                <span className="inline-flex items-center gap-1.5"><Stethoscope className="h-4 w-4 text-teal-600" /> {clinic.treatments?.length || 2} Active Treatment{(clinic.treatments?.length || 2) !== 1 ? "s" : ""}</span>
              </div>

              {/* Primary actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                {resolveListingStatus(clinic) !== "demo" && (
                  <Button className="bg-teal-600 text-white hover:bg-teal-700 shadow-premium-sm font-semibold" onClick={() => scrollToTab("contact")}>
                    <Calendar className="mr-1.5 h-4 w-4" /> Request Consultation
                  </Button>
                )}
                {resolveListingStatus(clinic) !== "demo" && clinic.phone && (
                  <Button variant="outline" className="font-semibold border-border" asChild>
                    <a href={`tel:${clinic.phone}`} data-analytics-event="clinic_phone_clicked" data-analytics-label={clinic.slug}><Phone className="mr-1.5 h-4 w-4" /> Call Clinic</a>
                  </Button>
                )}
                {resolveListingStatus(clinic) !== "demo" && clinic.website && (
                  <Button variant="outline" className="font-semibold border-border" asChild>
                    <a href={clinic.website} target="_blank" rel="noopener noreferrer" data-analytics-event="clinic_website_clicked" data-analytics-label={clinic.slug}><Globe className="mr-1.5 h-4 w-4" /> Visit Website</a>
                  </Button>
                )}
                {resolveListingStatus(clinic) !== "demo" && clinic.bookingUrl && (
                  <Button className="bg-teal-600 text-white hover:bg-teal-700" asChild>
                    <a href={clinic.bookingUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="booking_link_clicked" data-analytics-label={clinic.slug}><Calendar className="mr-1.5 h-4 w-4" /> Book Online</a>
                  </Button>
                )}
                <Button variant="outline" className="font-semibold border-border" onClick={() => scrollToTab("treatments")}>
                  <Stethoscope className="mr-1.5 h-4 w-4" /> View Treatments Catalog
                </Button>
                <SaveButton
                  saved={saved}
                  onToggle={() => {
                    if (!saved) {
                      captureSafeEvent("clinic_saved", { clinic_slug: clinic.slug });
                    }
                    toggleSave("clinic", clinic.id);
                  }}
                  label={saved ? "Saved" : "Save"}
                />
              </div>
            </div>

            {/* Right: snapshot card */}
            <PremiumCard className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Directory Snapshot</h3>
              <div className="mt-3 space-y-3 text-sm">
                <SnapshotRow icon={Building2} label="Care Model" value="Men's Health Platform" />
                <SnapshotRow icon={MapPin} label="Active locations" value={`${clinic.locations?.length || 1} Location${(clinic.locations?.length || 1) !== 1 ? "s" : ""}`} />
                <SnapshotRow icon={Navigation} label="Service area" value={clinic.serviceArea ?? `${clinic.city} metro`} />
                <SnapshotRow icon={Video} label="Telehealth" value={clinic.telehealth ? (resolveListingStatus(clinic) === "demo" ? "Demo · Available" : "Yes, Available") : "Not publicly listed"} />
                <SnapshotRow icon={Users} label="Provider structures" value={clinic.providerTypes || "Not publicly listed"} />
                <SnapshotRow icon={Clock} label="Clinic availability" value={clinic.earliestAvailability ?? "Not publicly listed"} />
                {resolveListingStatus(clinic) === "unclaimed" && clinic.sourceUrl && (
                  <SnapshotRow icon={Globe} label="Public source" value={clinic.sourceUrl.replace(/^https?:\/\//, "").split("/")[0]} />
                )}
                {resolveListingStatus(clinic) === "unclaimed" && clinic.lastReviewedAt && (
                  <SnapshotRow icon={Clock} label="Last reviewed" value={clinic.lastReviewedAt} />
                )}
              </div>
              <Separator className="my-4" />
              <div className="space-y-1.5">
                {clinic.phone && <a href={`tel:${clinic.phone}`} data-analytics-event="clinic_phone_clicked" data-analytics-label={clinic.slug} className="flex items-center gap-2 text-sm text-foreground hover:text-teal-700"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {clinic.phone}</a>}
                {clinic.email && <a href={`mailto:${clinic.email}`} className="flex items-center gap-2 text-sm text-foreground hover:text-teal-700 truncate"><Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> <span className="truncate">{clinic.email}</span></a>}
                {clinic.website && <a href={clinic.website} target="_blank" rel="noopener noreferrer" data-analytics-event="clinic_website_clicked" data-analytics-label={clinic.slug} className="flex items-center gap-2 text-sm text-foreground hover:text-teal-700 truncate"><Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> <span className="truncate">{clinic.website.replace(/^https?:\/\//, "")}</span></a>}
              </div>
            </PremiumCard>
          </div>
        </div>
      </section>

      {/* Sticky Tab Nav */}
      <StickyTabNav
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
        rightSlot={
          <Button size="sm" className="hidden bg-teal-600 text-white hover:bg-teal-700 sm:inline-flex shadow-premium-sm font-semibold" onClick={() => scrollToTab("contact")}>
            <Calendar className="mr-1 h-3.5 w-3.5" /> Book consult
          </Button>
        }
      />

      {/* Main Content Area */}
      <div id="clinic-content" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-10">
            {activeTab === "overview" && <OverviewTab clinic={clinic} />}
            {activeTab === "treatments" && <TreatmentsTab clinic={clinic} />}
            {activeTab === "providers" && <ProvidersTab clinic={clinic} />}
            {activeTab === "locations" && <LocationsTab clinic={clinic} />}
            {activeTab === "insurance" && <InsuranceTab clinic={clinic} />}
            {activeTab === "telehealth" && <TelehealthTab clinic={clinic} />}
            {activeTab === "eligibility" && <EligibilityTab clinic={clinic} />}
            {activeTab === "gallery" && <GalleryTab clinic={clinic} />}
            {activeTab === "faq" && <FaqTab clinic={clinic} />}
            {activeTab === "contact" && <ContactTab clinic={clinic} />}
            {activeTab === "safety" && <SafetyTab clinic={clinic} />}
          </div>

          {/* Sticky Sidebar Info */}
          <aside className="space-y-4">
            <PremiumCard className="p-5">
              <h3 className="text-sm font-semibold text-foreground">Request Consultation</h3>
              <p className="mt-1 text-xs text-muted-foreground">Submit a structured inquiry. The clinic will follow up to complete scheduling.</p>
              <Button className="mt-3 w-full bg-teal-600 text-white hover:bg-teal-700 shadow-premium-sm font-semibold text-xs h-9" onClick={() => scrollToTab("contact")}>
                <Calendar className="mr-1 h-4 w-4" /> Request consult
              </Button>
              <Separator className="my-4" />
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-foreground">Verification status</p>
                <div className="flex items-center gap-2"><ListingStatusBadge clinic={clinic} /></div>
                <p className="text-muted-foreground">Verification indicates that business entity documents and medical director credentials have been reviewed by Novalyte.</p>
              </div>
            </PremiumCard>

            <PremiumCard className="p-5">
              <h3 className="text-sm font-semibold text-foreground">Clinic Facts</h3>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between"><dt className="text-muted-foreground">Accepting Patients</dt><dd className="font-semibold text-teal-700">{clinic.acceptingNewPatients ? "Yes" : "No"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Pricing Model</dt><dd className="font-medium text-foreground">{clinic.pricingStatus}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Insurance accepted</dt><dd className="font-medium text-foreground">{clinic.insuranceAccepted ? "Yes" : "No"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">HSA / FSA Cards</dt><dd className="font-medium text-foreground">{clinic.hsaFsaAccepted ? "Accepted" : "No"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Earliest availability</dt><dd className="font-medium text-foreground">{clinic.earliestAvailability || "3 days"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Languages</dt><dd className="font-medium text-foreground truncate max-w-[120px]">{clinic.languages}</dd></div>
              </dl>
            </PremiumCard>

            {related.length > 0 && (
              <PremiumCard className="p-5">
                <h3 className="text-sm font-semibold text-foreground">Related clinics</h3>
                <div className="mt-3 space-y-2.5">
                  {related.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => navigate("clinic-profile", undefined, { id: r.id })}
                      className="flex w-full items-center gap-3 rounded-lg border border-border p-2.5 text-left transition hover:border-teal-200 hover:bg-teal-50/30"
                    >
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white", colorClasses(r.logoColor).bg)}>{initials(r.name)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{r.name}</p>
                        <p className="flex items-center gap-0.5 text-[10px] text-muted-foreground mt-0.5"><MapPin className="h-2.5 w-2.5" /> {r.city}, {r.state}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-3 w-full text-xs" onClick={() => navigate("directory")}>Browse all clinics</Button>
              </PremiumCard>
            )}
          </aside>
        </div>
      </div>

      {/* Claim Profile Verification Dialog */}
      <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
        <DialogContent className="sm:max-w-[460px] p-6 rounded-2xl bg-card border border-border shadow-premium-lg">
          <form onSubmit={handleClaim} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-1.5 text-base font-semibold text-teal-950">
                <ShieldCheck className="h-5 w-5 text-teal-600" /> Verify Clinic Profile Ownership
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                To claim <strong>{clinic.name}</strong>, please verify your credentials. Claims are moderated to prevent unauthorized edits.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="claim-fname" className="text-xs">First Name *</Label>
                  <Input id="claim-fname" required value={claimForm.dmFirstName} onChange={(e) => setClaimForm({ ...claimForm, dmFirstName: e.target.value })} className="h-9 text-xs" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="claim-lname" className="text-xs">Last Name *</Label>
                  <Input id="claim-lname" required value={claimForm.dmLastName} onChange={(e) => setClaimForm({ ...claimForm, dmLastName: e.target.value })} className="h-9 text-xs" />
                </div>
              </div>
              
              <div className="grid gap-1.5">
                <Label htmlFor="claim-email" className="text-xs">Authorized Business Email *</Label>
                <Input id="claim-email" type="email" required placeholder="dr.smith@yourclinic.com" value={claimForm.dmEmail} onChange={(e) => setClaimForm({ ...claimForm, dmEmail: e.target.value })} className="h-9 text-xs" />
                <p className="text-[10px] text-muted-foreground">Verification link will be sent to this email address.</p>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="claim-phone" className="text-xs">Phone Number *</Label>
                <Input id="claim-phone" required placeholder="(555) 019-2834" value={claimForm.dmPhone} onChange={(e) => setClaimForm({ ...claimForm, dmPhone: e.target.value })} className="h-9 text-xs" />
              </div>

              <label className="flex items-start gap-2 text-xs text-muted-foreground pt-1.5">
                <input 
                  type="checkbox" 
                  checked={claimForm.authorized} 
                  onChange={(e) => setClaimForm({ ...claimForm, authorized: e.target.checked })} 
                  className="mt-0.5 accent-teal-600" 
                  required
                />
                <span>I confirm that I am a licensed provider or authorized administrator representing this clinic practice.</span>
              </label>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => setClaimOpen(false)} className="text-xs font-semibold">Cancel</Button>
              <Button type="submit" disabled={claiming} size="sm" className="bg-teal-600 text-white hover:bg-teal-700 font-semibold flex items-center gap-1">
                {claiming ? "Claiming..." : "Submit Claim & Verify"} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SnapshotRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs leading-normal">
      <span className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc?: string }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground"><Icon className="h-5 w-5 text-teal-600" /> {title}</h2>
      {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
    </div>
  );
}

/* ── Tab Views (Bound to relational schemas) ─────────────────── */

function OverviewTab({ clinic }: { clinic: ClinicT }) {
  const caps = useMemo(() => splitCsv(clinic.capabilities), [clinic.capabilities]);
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Building2} title="Clinic Overview" desc="Coordinated men's health services guided by clinical research." />
      <PremiumCard className="p-6">
        <p className="text-pretty text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{clinic.overview}</p>
        {clinic.serviceArea && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-muted/20 p-3 text-xs">
            <Navigation className="mt-0.5 h-4 w-4 text-teal-600 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Service Coverage</p>
              <p className="text-muted-foreground mt-0.5">{clinic.serviceArea}</p>
            </div>
          </div>
        )}
      </PremiumCard>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Clinic Capabilities</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {caps.map((cap) => (
            <div key={cap} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-xs">
              <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> <span className="font-medium text-foreground/80">{cap}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TreatmentsTab({ clinic }: { clinic: ClinicT }) {
  const openContact = () => {
    const el = document.getElementById("clinic-content");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Stethoscope} title="Treatments & Specialties" desc="Available clinical programs and wellness therapies." />
      
      {clinic.treatments && clinic.treatments.length > 0 ? (
        <div className="grid gap-4">
          {clinic.treatments.map((t) => (
            <PremiumCard key={t.id} className="p-5 space-y-3 border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="bg-teal-50 border-teal-100 text-teal-800 text-[10px] font-medium hover:bg-teal-50">{t.category}</Badge>
                  <h4 className="mt-1.5 text-sm font-semibold text-foreground">{t.name}</h4>
                </div>
                {t.priceRange && <span className="font-bold text-teal-700 text-xs sm:text-sm">{t.priceRange}</span>}
              </div>
              
              {t.description && <p className="text-xs text-muted-foreground leading-normal">{t.description}</p>}
              
              {t.concerns && (
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  <span className="font-medium">Concerns addressed:</span>
                  {splitCsv(t.concerns).map((con) => (
                    <Badge key={con} variant="outline" className="border-border text-[9px] text-foreground/70">{con}</Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] bg-muted/10 p-2.5 rounded-lg border border-border/40">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle2 className={cn("h-3.5 w-3.5", t.consultRequired ? "text-teal-600" : "text-muted-foreground/30")} /> Consult Req.
                  </label>
                  <label className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle2 className={cn("h-3.5 w-3.5", t.labRequired ? "text-teal-600" : "text-muted-foreground/30")} /> Labs Req.
                  </label>
                  {t.careFormat && (
                    <span className="text-muted-foreground uppercase text-[10px] font-semibold bg-muted px-2 py-0.5 rounded">
                      {t.careFormat}
                    </span>
                  )}
                </div>
                <Button size="sm" onClick={openContact} className="bg-teal-600 text-white hover:bg-teal-700 text-[10px] h-7 px-3">
                  Request consult
                </Button>
              </div>
            </PremiumCard>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {splitCsv(clinic.specialties).map((s) => (
            <PremiumCard key={s} className="p-5 border-border">
              <div className="flex items-start justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100"><Stethoscope className="h-4.5 w-4.5" /></span>
                <StatusPill tone="teal">Available</StatusPill>
              </div>
              <h4 className="mt-3 text-sm font-semibold text-foreground">{s}</h4>
              <p className="mt-1 text-xs text-muted-foreground">Consult the clinic to confirm custom options and package pricing.</p>
            </PremiumCard>
          ))}
        </div>
      )}
    </div>
  );
}

function ProvidersTab({ clinic }: { clinic: ClinicT }) {
  const c = colorClasses(clinic.logoColor);
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Users} title="Medical Directory & Staff" desc="Licensed practitioners and clinic staff." />
      
      {clinic.providers && clinic.providers.length > 0 ? (
        <div className="grid gap-4">
          {clinic.providers.map((p) => (
            <PremiumCard key={p.id} className="p-5 flex flex-col sm:flex-row gap-4 border-border">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted border">
                {p.avatarUrl ? (
                  <SmartImage src={p.avatarUrl} alt={p.name} fill sizes="64px" imgClassName="object-cover" />
                ) : (
                  <div className={cn("flex h-full w-full items-center justify-center text-sm font-bold text-white", c.bg)}>
                    {initials(p.name)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{p.name}, {p.credentials}</h4>
                  <Badge variant="outline" className="text-[10px] text-teal-800 border-teal-200 bg-teal-50/50">{p.role}</Badge>
                  {p.telehealth && <Badge className="text-[9px] bg-sky-50 text-sky-800 border-sky-100 hover:bg-sky-50">Telehealth Available</Badge>}
                </div>
                
                {p.bio && <p className="text-xs text-muted-foreground leading-relaxed">{p.bio}</p>}
                
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    {p.specialties && <span><strong>Focus:</strong> {p.specialties}</span>}
                    {p.yearsExperience > 0 && <span><strong>Experience:</strong> {p.yearsExperience} Years</span>}
                    {p.languages && <span><strong>Languages:</strong> {p.languages}</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-700 hover:text-teal-800 hover:bg-teal-50 text-[10px] h-7 px-2 font-semibold flex items-center gap-0.5"
                    onClick={() => navigate("provider-profile", undefined, { id: p.id })}
                  >
                    View Provider Profile <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {splitCsv(clinic.providerTypes).map((p, i) => {
            const colors = ["teal", "emerald", "sky", "violet", "amber"];
            const col = colorClasses(colors[i % colors.length]);
            return (
              <PremiumCard key={p} className="flex items-center gap-3 p-4 border-border">
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white", col.bg)}>{p.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{p}</p>
                  <p className="text-xs text-muted-foreground">On Staff at Clinic</p>
                </div>
                <ShieldCheck className="h-4 w-4 text-teal-600" />
              </PremiumCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LocationsTab({ clinic }: { clinic: ClinicT }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={MapPin} title="Locations & Hours" desc="Physical offices and scheduling hours." />
      
      {clinic.locations && clinic.locations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {clinic.locations.map((loc) => (
            <PremiumCard key={loc.id} className="overflow-hidden border-border flex flex-col justify-between">
              <div>
                <div className="h-28 bg-teal-50/50 relative">
                  <div className="novalyte-grid h-full w-full opacity-60" />
                  <MapPin className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-teal-600 animate-bounce" />
                </div>
                
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-foreground leading-tight">{loc.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" /> {loc.address}</p>
                  
                  {loc.hours && (
                    <div className="text-xs text-muted-foreground pt-1.5 flex items-start gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground">Hours:</span>
                        <div className="mt-0.5 whitespace-pre-wrap">{loc.hours}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-1 bg-muted/10 border-t border-border/40 flex flex-wrap gap-2 text-[10px]">
                {loc.onSiteLab && <Badge className="bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-50">On-site Lab</Badge>}
                {loc.phlebotomy && <Badge className="bg-teal-50 text-teal-800 border-teal-100 hover:bg-teal-50">Phlebotomy</Badge>}
                {loc.earliestAppt && <Badge variant="outline" className="border-border text-foreground/80">Next: {loc.earliestAppt}</Badge>}
              </div>
            </PremiumCard>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <PremiumCard className="overflow-hidden border-border">
            <div className="h-40 bg-teal-50/50">
              <div className="novalyte-grid h-full w-full opacity-60" />
            </div>
            <div className="p-5">
              <h4 className="text-sm font-semibold text-foreground">{clinic.name}</h4>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {clinic.city}, {clinic.state} {clinic.zip}</p>
            </div>
          </PremiumCard>
          
          <PremiumCard className="p-5 border-border">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Clock className="h-4 w-4 text-teal-600" /> Hours of Operation</h4>
            <div className="mt-3 space-y-1.5 text-sm">
              {(clinic.hours ?? "Contact clinic for hours").split(/[,;]/).map((h, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <span className="text-muted-foreground">{h.trim().split(" ").slice(0, 2).join(" ")}</span>
                  <span className="font-semibold text-foreground">{h.trim().split(" ").slice(2).join(" ") || h.trim()}</span>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>
      )}
    </div>
  );
}

function InsuranceTab({ clinic }: { clinic: ClinicT }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={DollarSign} title="Insurance & Pricing" desc="Standardized pricing model and coverage details." />
      <PremiumCard className="p-6 border-border space-y-5">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Transparency</h4>
            <p className="text-sm font-bold text-teal-700 flex items-center gap-1"><ShieldCheck className="h-4.5 w-4.5 text-teal-600" /> {clinic.pricingStatus}</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">This practice publishes complete or partial pricing schedules to support consumer decision making.</p>
          </div>

          <div className="space-y-2 text-xs leading-normal">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Standardized Fees</h4>
            <div className="flex justify-between border-b pb-1.5 border-border/40">
              <span className="text-muted-foreground">Initial Consultation</span>
              <span className="font-bold text-foreground">{clinic.initialConsultPrice !== null ? `$${clinic.initialConsultPrice}` : "Contact clinic"}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5 border-border/40">
              <span className="text-muted-foreground">Monthly Membership Range</span>
              <span className="font-bold text-foreground">{clinic.membershipPrice !== null ? `$${clinic.membershipPrice}/mo` : "None / Pay-per-service"}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Insurance & Billing</h4>
            <div className="flex flex-wrap gap-2">
              <Badge className={cn("text-xs font-medium", clinic.insuranceAccepted ? "bg-teal-50 text-teal-800 border-teal-100" : "bg-muted text-muted-foreground")}>
                {clinic.insuranceAccepted ? "Accepts Insurance" : "Self-Pay / Direct-Pay only"}
              </Badge>
              <Badge className={cn("text-xs font-medium", clinic.hsaFsaAccepted ? "bg-teal-50 text-teal-800 border-teal-100" : "bg-muted text-muted-foreground")}>
                {clinic.hsaFsaAccepted ? "HSA & FSA Approved" : "FSA/HSA not accepted"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-normal pt-1.5">
              {clinic.insuranceAccepted 
                ? "The clinic files claims directly with commercial insurance providers. Copays and deductibles are due at appointment."
                : "This clinic operates on a cash-pay direct care model. You can request a superbill to submit independently for out-of-network reimbursement."}
            </p>
          </div>

          <div className="bg-teal-50/40 border border-teal-200/60 rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-semibold text-teal-950">Payment Methods Accepted</h4>
            <p className="text-teal-800/80 leading-relaxed">Major Credit Cards, Apple Pay, HSA/FSA debit cards. Financing options like CareCredit or local payment plans may be available upon inquiry.</p>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}

function TelehealthTab({ clinic }: { clinic: ClinicT }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Video} title="Telehealth & Remote Care" desc="Multi-state telehealth boundaries and delivery logistics." />
      <PremiumCard className="p-6 border-border space-y-4">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100")}>
            <Video className="h-5.5 w-5.5" />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{clinic.telehealth ? "Telehealth Available" : "In-Person Visits Required"}</h4>
            <p className="text-xs text-muted-foreground">Provider consultation coverage area</p>
          </div>
        </div>

        {clinic.telehealth && (
          <div className="space-y-4 pt-2">
            <div className="grid gap-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Licensed States Served</Label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {splitCsv(clinic.statesServed || clinic.state).map((st) => (
                  <Badge key={st} className="bg-sky-50 text-sky-800 border-sky-100 hover:bg-sky-50 text-[10px] font-semibold">
                    {st}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs space-y-2 leading-relaxed">
              <p className="font-semibold text-foreground">Telehealth Intake Protocol</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Blood draw can be completed at local Quest or LabCorp facilities, or via at-home blood collection kits.</li>
                <li>Telehealth consults conducted via secure video calls (HIPAA-compliant client portal).</li>
                <li>Prescription delivery is fulfilled by certified compound pharmacies and shipped discretely to your home.</li>
              </ul>
            </div>
          </div>
        )}
      </PremiumCard>
    </div>
  );
}

function EligibilityTab({ clinic }: { clinic: ClinicT }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={FileText} title="Eligibility Requirements" desc="Patient qualifiers for clinical programs." />
      <PremiumCard className="p-6 border-border">
        <ul className="space-y-3.5 text-sm">
          {[
            "Adult males aged 18 and older",
            "Must be physically located in one of the licensed states during telehealth consults",
            "Comprehensive laboratory panel must be completed within 90 days of initiating treatment",
            "Specific prescription and treatment eligibility remains at the clinical discretion of the licensed practice physician",
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-teal-600" />
              <span className="text-foreground/80 text-xs leading-normal">{item}</span>
            </li>
          ))}
        </ul>
      </PremiumCard>
    </div>
  );
}

function GalleryTab({ clinic }: { clinic: ClinicT }) {
  const c = colorClasses(clinic.logoColor);
  const gallery = getClinicGallery(clinic.slug);
  const captions = ["Reception area", "Consultation room", "Clinical office", "Treatment suite", "Facility entrance"];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  function openLightbox(i: number) {
    setLightboxIndex(i);
    setLightboxOpen(true);
  }

  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={ImageIcon} title="Facility Gallery" desc="Visual tour of clinic offices and medical equipment." />
      
      {gallery.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => openLightbox(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted"
            >
              <SmartImage
                src={img}
                alt={captions[i] || `${clinic.name} photo`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="transition duration-500 group-hover:scale-103"
                imgClassName="object-cover"
                fallback={<div className={cn("h-full w-full", c.soft)} />}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 transition group-hover:opacity-100" />
              <span className="absolute bottom-2 left-2 right-2 text-left text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100 truncate">
                {captions[i]}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState icon={ImageIcon} title="No gallery images published" description="Images are uploaded by the owner once the profile is claimed." />
      )}

      <ImageLightbox
        images={gallery}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        captions={captions}
      />
    </div>
  );
}

function ReviewsTab({ clinic }: { clinic: ClinicT }) {
  const reviewsList = clinic.reviews || [];
  
  // Calculate average rating
  const avgRating = useMemo(() => {
    if (reviewsList.length === 0) return 0;
    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviewsList.length).toFixed(1);
  }, [reviewsList]);

  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Star} title="Patient Reviews & Ratings" desc="Patient feedback is verified for clinical integrity." />
      
      <PremiumCard className="p-6 border-border space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-5xl font-semibold text-foreground tracking-tight">{reviewsList.length > 0 ? avgRating : "—"}</p>
            <div className="mt-1 flex justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={cn("h-4 w-4", 
                    reviewsList.length > 0 && s <= Math.round(Number(avgRating)) 
                      ? "text-amber-400 fill-amber-400" 
                      : "text-muted-foreground/30")} 
                />
              ))}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Based on {reviewsList.length} verified review{reviewsList.length !== 1 ? "s" : ""}</p>
          </div>
          
          <Separator orientation="vertical" className="hidden h-20 sm:block" />
          
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs text-muted-foreground leading-normal">
              Novalyte coordinates patient intake and clinic response. Published reviews reflect feedback submitted by patients who scheduled care through the directory. Reviews are verified for compliance.
            </p>
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              <StatusPill tone="teal"><ShieldCheck className="h-3 w-3" /> Verified Patient Matches</StatusPill>
              <StatusPill tone="muted"><Lock className="h-3 w-3" /> Moderation Active</StatusPill>
            </div>
          </div>
        </div>

        {reviewsList.length > 0 && (
          <div className="space-y-4 border-t border-border/40 pt-5">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="space-y-2 border-b border-border/30 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{rev.author}</span>
                    <span className="text-[10px] text-muted-foreground bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"><Check className="h-2.5 w-2.5" /> Verified Patient</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn("h-3 w-3", s <= rev.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-foreground/80 leading-normal font-medium">{rev.content}</p>

                {rev.response && (
                  <div className="ml-4 bg-muted/40 border-l-2 border-teal-500/50 p-2.5 rounded-r-lg text-xs leading-normal">
                    <p className="font-semibold text-teal-900">{clinic.name} response:</p>
                    <p className="text-muted-foreground mt-0.5">{rev.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </PremiumCard>
    </div>
  );
}

function FaqTab({ clinic }: { clinic: ClinicT }) {
  const status = resolveListingStatus(clinic);
  const faqs =
    status === "demo"
      ? [
          {
            q: "Is this a real clinic?",
            a: "No. This is a fictional demonstration profile created to preview Novalyte AI directory functionality. It does not represent an operating clinic.",
          },
          {
            q: "Can I claim or book this profile?",
            a: "Demo profiles are not claimable and do not accept real appointments. Browse other listings or apply to list your clinic through Novalyte AI.",
          },
        ]
      : [
          {
            q: `How do I book a consultation with ${clinic.name}?`,
            a: "Contact the clinic using the publicly listed phone or website when available, or submit a consultation request if the clinic has published booking options. Confirm details directly with the clinic.",
          },
          {
            q: "Does this clinic accept insurance?",
            a:
              clinic.insuranceAccepted === true
                ? "Public sources indicate insurance may be accepted. Confirm coverage, copays, and medication costs directly with the clinic."
                : "Insurance acceptance is not confirmed in publicly available information. Confirm payment options directly with the clinic.",
          },
          {
            q: "Is telehealth available?",
            a: clinic.telehealth
              ? `Public information indicates telehealth may be offered. Confirm coverage and states directly with the clinic${clinic.statesServed ? ` (listed states: ${clinic.statesServed})` : ""}.`
              : "Telehealth availability is not confirmed in publicly available information. Contact the clinic to confirm.",
          },
          {
            q: "What should I bring to my first appointment?",
            a: "Ask the clinic directly. Common requests include a government-issued photo ID, recent labs when available, and a current medication list.",
          },
        ];
  
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={MessageSquare} title="Frequently Asked Questions" />
      <PremiumCard className="p-2 border-border">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border last:border-0">
              <AccordionTrigger className="px-4 text-left text-xs font-semibold hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="px-4 text-xs text-muted-foreground leading-normal">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </PremiumCard>
    </div>
  );
}

function ContactTab({ clinic }: { clinic: ClinicT }) {
  const [form, setForm] = useState({ patientName: "", patientEmail: "", patientPhone: "", preferredTime: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: clinic.id,
          clinicName: clinic.name,
          ...form,
          treatmentInterest: splitCsv(clinic.specialties)[0] ?? null,
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      toast.success("Consultation request successfully submitted!");
    } catch {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Calendar} title="Schedule Consultation" desc="Send a secure care request directly to the clinic team." />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <PremiumCard className="p-6 border-border">
          {!done ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="c-name" className="text-xs">Full name *</Label>
                  <Input id="c-name" required value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className="h-9 text-xs" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="c-email" className="text-xs">Email Address *</Label>
                  <Input id="c-email" type="email" required value={form.patientEmail} onChange={(e) => setForm({ ...form, patientEmail: e.target.value })} className="h-9 text-xs" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="c-phone" className="text-xs">Phone Number *</Label>
                  <Input id="c-phone" required placeholder="(555) 012-3456" value={form.patientPhone} onChange={(e) => setForm({ ...form, patientPhone: e.target.value })} className="h-9 text-xs" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="c-time" className="text-xs">Preferred Contact Time</Label>
                  <Input id="c-time" placeholder="Mornings, Afternoons, Eves" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} className="h-9 text-xs" />
                </div>
              </div>
              
              <div className="grid gap-1.5">
                <Label htmlFor="c-notes" className="text-xs">Goals or Treatment Interest</Label>
                <Textarea id="c-notes" rows={3} placeholder="Describe what symptoms or treatments you are looking to address..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="text-xs" />
              </div>
              
              <label className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <input type="checkbox" required className="mt-0.5 accent-teal-600" />
                <span>I understand that Novalyte AI is a technology platform and not a medical provider. All clinical decisions are determined solely by the clinic staff.</span>
              </label>

              <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700 font-semibold" disabled={submitting}>
                {submitting ? "Sending..." : "Submit Consultation Request"} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600"><CheckCircle2 className="h-6 w-6" /></span>
              <h3 className="text-base font-semibold text-teal-950">Inquiry Routed to {clinic.name}</h3>
              <p className="max-w-sm text-xs text-muted-foreground">A clinic representative will reach out to confirm scheduling using your contact information.</p>
            </div>
          )}
        </PremiumCard>

        <PremiumCard className="p-5 border-border space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Direct Contacts</h4>
            <div className="mt-3 space-y-2.5 text-xs">
              {clinic.phone && <a href={`tel:${clinic.phone}`} data-analytics-event="clinic_phone_clicked" data-analytics-label={clinic.slug} className="flex items-center gap-2 text-foreground hover:text-teal-700 font-semibold"><Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {clinic.phone}</a>}
              {clinic.email && <a href={`mailto:${clinic.email}`} className="flex items-center gap-2 text-foreground hover:text-teal-700 truncate font-semibold"><Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> <span className="truncate">{clinic.email}</span></a>}
              {clinic.website && <a href={clinic.website} target="_blank" rel="noopener noreferrer" data-analytics-event="clinic_website_clicked" data-analytics-label={clinic.slug} className="flex items-center gap-2 text-foreground hover:text-teal-700 truncate font-semibold"><Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> <span className="truncate">Visit Website</span></a>}
              {clinic.bookingUrl && <a href={clinic.bookingUrl} target="_blank" rel="noopener noreferrer" data-analytics-event="booking_link_clicked" data-analytics-label={clinic.slug} className="flex items-center gap-2 text-foreground hover:text-teal-700 truncate font-semibold"><Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> <span className="truncate">Book Online</span></a>}
            </div>
          </div>

          <Separator className="my-2" />
          
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-foreground">Clinic Hours</p>
            <p className="text-muted-foreground leading-relaxed">{clinic.hours ?? "Contact clinic"}</p>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}

function SafetyTab({ clinic }: { clinic: ClinicT }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={ShieldCheck} title="Safety & Compliance" desc="Commitments to trust, privacy, and clinical standard safety." />
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { icon: ShieldCheck, title: "Verified Credentials", desc: "Practices submit active business registrations, licensing states, and medical director NPIs for review." },
          { icon: Lock, title: "Secure Communications", desc: "Intake and consultation request logs are transmitted over HIPAA-compliant channels." },
          { icon: FileText, title: "Pricing Integrity", desc: "Standardized pricing tags prevent hidden or surprise diagnostic and subscription fees." },
          { icon: Award, title: "Clinical Autonomy", desc: "Novalyte coordinates discovery. Licensed clinicians at the clinic retain independent oversight of all medical decisions." },
        ].map((s) => (
          <PremiumCard key={s.title} className="p-5 border-border">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100"><s.icon className="h-4.5 w-4.5" /></span>
            <h4 className="mt-3 text-sm font-semibold text-foreground">{s.title}</h4>
            <p className="mt-1 text-xs text-muted-foreground leading-normal">{s.desc}</p>
          </PremiumCard>
        ))}
      </div>
    </div>
  );
}
