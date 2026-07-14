"use client";

import { useState, useMemo, useCallback } from "react";
import {
  PremiumCard, MetaRow, StatCard, Breadcrumbs, SaveButton, SectionDivider,
} from "@/components/shared/enterprise";
import { StickyTabNav } from "@/components/shared/sticky-tab-nav";
import { SmartImage, ImageLightbox } from "@/components/shared/smart-image";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
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
import { toast } from "sonner";
import {
  MapPin, Video, Phone, Mail, Globe, Clock, ShieldCheck, Stethoscope,
  CheckCircle2, Star, ArrowRight, Heart, Navigation, Building2, Users,
  Calendar, DollarSign, FileText, Award, Lock, Sparkles, ChevronRight,
  Image as ImageIcon, MessageSquare, BookOpen,
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
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "faq", label: "FAQ", icon: MessageSquare },
  { id: "contact", label: "Contact & Booking", icon: Calendar },
  { id: "safety", label: "Safety & Compliance", icon: ShieldCheck },
];

export function ClinicProfileView({ clinic, allClinics }: { clinic: ClinicT; allClinics: ClinicT[] }) {
  const [activeTab, setActiveTab] = useState("overview");
  const saved = useSaved((s) => s.has("clinic", clinic.id));
  const toggleSave = useSaved((s) => s.toggle);
  const c = colorClasses(clinic.logoColor);

  const specs = splitCsv(clinic.specialties);
  const caps = splitCsv(clinic.capabilities);
  const providers = splitCsv(clinic.providerTypes);

  // Related clinics (same state or shared specialty, excluding self)
  const related = useMemo(() => {
    const clinicSpecs = splitCsv(clinic.specialties);
    return allClinics
      .filter((x) => x.id !== clinic.id)
      .map((x) => {
        const sharedSpecialty = splitCsv(x.specialties).filter((s) => clinicSpecs.includes(s)).length;
        const sameState = x.state === clinic.state ? 1 : 0;
        return { clinic: x, score: sharedSpecialty * 2 + sameState };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.clinic);
  }, [allClinics, clinic.id, clinic.specialties, clinic.state]);

  const scrollToTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
    const el = document.getElementById("clinic-content");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen">
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

      {/* Cover image */}
      <div className="relative h-48 overflow-hidden border-b border-border sm:h-64 lg:h-80">
        <SmartImage
          src={getClinicImage(clinic.slug)}
          alt={`${clinic.name} — men's health clinic in ${clinic.city}, ${clinic.state}`}
          fill
          priority
          sizes="100vw"
          imgClassName="object-cover"
          fallback={<div className={cn("h-full w-full", c.soft)} />}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" aria-hidden />
      </div>

      {/* Hero */}
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
                    <VerificationBadge verified={clinic.verified} status={clinic.verificationStatus} />
                  </div>
                  {clinic.tagline && <p className="mt-1 text-sm font-medium text-foreground/80">{clinic.tagline}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {clinic.city}, {clinic.state}</span>
                    {clinic.telehealth && <span className="inline-flex items-center gap-1"><Video className="h-3.5 w-3.5 text-teal-600" /> Telehealth</span>}
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
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-teal-600" /> {clinic.verified ? "Verified by Novalyte" : "Verification pending"}</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-emerald-600" /> {providers.length} provider type{providers.length !== 1 ? "s" : ""}</span>
                <span className="inline-flex items-center gap-1.5"><Stethoscope className="h-4 w-4 text-teal-600" /> {caps.length} capabilit{caps.length !== 1 ? "ies" : "y"}</span>
              </div>

              {/* Primary actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => scrollToTab("contact")}>
                  <Calendar className="mr-1.5 h-4 w-4" /> Request consultation
                </Button>
                <Button variant="outline" onClick={() => scrollToTab("treatments")}>
                  <Stethoscope className="mr-1.5 h-4 w-4" /> View treatments
                </Button>
                <SaveButton saved={saved} onToggle={() => toggleSave("clinic", clinic.id)} label={saved ? "Saved" : "Save"} />
              </div>
            </div>

            {/* Right: snapshot card */}
            <PremiumCard className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinic snapshot</h3>
              <div className="mt-3 space-y-3 text-sm">
                <SnapshotRow icon={Building2} label="Type" value="Men's health clinic" />
                <SnapshotRow icon={MapPin} label="Primary location" value={`${clinic.city}, ${clinic.state}`} />
                <SnapshotRow icon={Navigation} label="Service area" value={clinic.serviceArea ?? `${clinic.city} metro`} />
                <SnapshotRow icon={Video} label="Telehealth" value={clinic.telehealth ? "Available" : "Not available"} />
                <SnapshotRow icon={Users} label="Provider types" value={providers.length > 0 ? providers.join(", ") : "Not specified"} />
                <SnapshotRow icon={Clock} label="Hours" value={clinic.hours ?? "Contact clinic"} />
              </div>
              <Separator className="my-4" />
              <div className="space-y-1.5">
                {clinic.phone && <a href={`tel:${clinic.phone}`} className="flex items-center gap-2 text-sm text-foreground hover:text-teal-700"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {clinic.phone}</a>}
                {clinic.email && <a href={`mailto:${clinic.email}`} className="flex items-center gap-2 text-sm text-foreground hover:text-teal-700 truncate"><Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> <span className="truncate">{clinic.email}</span></a>}
                {clinic.website && <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground hover:text-teal-700 truncate"><Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> <span className="truncate">{clinic.website.replace(/^https?:\/\//, "")}</span></a>}
              </div>
            </PremiumCard>
          </div>
        </div>
      </section>

      {/* Sticky tab nav */}
      <StickyTabNav
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
        rightSlot={
          <Button size="sm" className="hidden bg-teal-600 text-white hover:bg-teal-700 sm:inline-flex" onClick={() => scrollToTab("contact")}>
            <Calendar className="mr-1 h-3.5 w-3.5" /> Book consultation
          </Button>
        }
      />

      {/* Content */}
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
            {activeTab === "reviews" && <ReviewsTab clinic={clinic} />}
            {activeTab === "faq" && <FaqTab clinic={clinic} />}
            {activeTab === "contact" && <ContactTab clinic={clinic} />}
            {activeTab === "safety" && <SafetyTab clinic={clinic} />}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <PremiumCard className="p-5">
              <h3 className="text-sm font-semibold text-foreground">Ready to connect?</h3>
              <p className="mt-1 text-xs text-muted-foreground">Send a structured consultation request. The clinic will follow up directly.</p>
              <Button className="mt-3 w-full bg-teal-600 text-white hover:bg-teal-700" onClick={() => scrollToTab("contact")}>
                <Calendar className="mr-1 h-4 w-4" /> Request consultation
              </Button>
              <Separator className="my-4" />
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-foreground">Verification</p>
                <div className="flex items-center gap-2"><VerificationBadge verified={clinic.verified} status={clinic.verificationStatus} /></div>
                <p className="text-muted-foreground">Verification reflects review of submitted business and provider information.</p>
              </div>
            </PremiumCard>

            <PremiumCard className="p-5">
              <h3 className="text-sm font-semibold text-foreground">Quick facts</h3>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between"><dt className="text-muted-foreground">State</dt><dd className="font-medium text-foreground">{clinic.state}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">ZIP</dt><dd className="font-medium text-foreground">{clinic.zip}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Telehealth</dt><dd className="font-medium text-foreground">{clinic.telehealth ? "Yes" : "No"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Specialties</dt><dd className="font-medium text-foreground">{specs.length}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Capabilities</dt><dd className="font-medium text-foreground">{caps.length}</dd></div>
              </dl>
            </PremiumCard>

            {/* Related clinics */}
            {related.length > 0 && (
              <PremiumCard className="p-5">
                <h3 className="text-sm font-semibold text-foreground">Related clinics</h3>
                <div className="mt-3 space-y-2">
                  {related.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => navigate("clinic-profile", undefined, { id: r.id })}
                      className="flex w-full items-center gap-3 rounded-lg border border-border p-2.5 text-left transition hover:border-teal-200 hover:bg-teal-50/30"
                    >
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white", colorClasses(r.logoColor).bg)}>{initials(r.name)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{r.name}</p>
                        <p className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><MapPin className="h-2.5 w-2.5" /> {r.city}, {r.state}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => navigate("directory")}>Browse all clinics</Button>
              </PremiumCard>
            )}
          </aside>
        </div>

        <DisclaimerBanner className="mt-10" tone="muted">
          Clinics are independently owned and operated. Provider participation does not constitute endorsement unless explicitly stated. Novalyte AI is a technology platform and does not provide medical care. Always consult a licensed healthcare professional.
        </DisclaimerBanner>
      </div>
    </div>
  );
}

function SnapshotRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc?: string }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><Icon className="h-5 w-5 text-teal-600" /> {title}</h2>
      {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
    </div>
  );
}

/* ── Tabs ────────────────────────────────────────────────────── */
function OverviewTab({ clinic }: { clinic: ClinicT }) {
  const caps = splitCsv(clinic.capabilities);
  const providers = splitCsv(clinic.providerTypes);
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Building2} title="Clinic overview" desc="A physician-led men's health clinic focused on evidence-based care." />
      <PremiumCard className="p-6">
        <p className="text-pretty text-sm leading-relaxed text-foreground/80">{clinic.overview}</p>
        {clinic.serviceArea && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <Navigation className="mt-0.5 h-4 w-4 text-teal-600" />
            <div>
              <p className="font-medium text-foreground">Service area</p>
              <p className="text-muted-foreground">{clinic.serviceArea}</p>
            </div>
          </div>
        )}
      </PremiumCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Specialties" value={splitCsv(clinic.specialties).length} icon={Stethoscope} tone="teal" />
        <StatCard label="Capabilities" value={caps.length} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Provider types" value={providers.length} icon={Users} tone="teal" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Capabilities</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {caps.map((cap) => (
            <div key={cap} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-teal-600" /> {cap}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TreatmentsTab({ clinic }: { clinic: ClinicT }) {
  const specs = splitCsv(clinic.specialties);
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Stethoscope} title="Treatments & specialties" desc="Treatment areas this clinic supports." />
      <div className="grid gap-3 sm:grid-cols-2">
        {specs.map((s) => (
          <PremiumCard key={s} className="p-5">
            <div className="flex items-start justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100"><Stethoscope className="h-4.5 w-4.5" /></span>
              <StatusPill tone="teal">Available</StatusPill>
            </div>
            <h4 className="mt-3 text-sm font-semibold text-foreground">{s}</h4>
            <p className="mt-1 text-xs text-muted-foreground">Consult the clinic to confirm availability, eligibility, and treatment approach.</p>
          </PremiumCard>
        ))}
      </div>
      <DisclaimerBanner tone="amber">Treatment availability is subject to change and clinical suitability as determined by a licensed provider at the clinic. Novalyte AI does not guarantee availability of any specific treatment.</DisclaimerBanner>
    </div>
  );
}

function ProvidersTab({ clinic }: { clinic: ClinicT }) {
  const providers = splitCsv(clinic.providerTypes);
  const c = colorClasses(clinic.logoColor);
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Users} title="Provider information" desc="Types of healthcare professionals at this clinic." />
      <div className="grid gap-3 sm:grid-cols-2">
        {providers.map((p, i) => {
          const colors = ["teal", "emerald", "sky", "violet", "amber"];
          const col = colorClasses(colors[i % colors.length]);
          return (
            <PremiumCard key={p} className="flex items-center gap-3 p-4">
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white", col.bg)}>{p.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{p}</p>
                <p className="text-xs text-muted-foreground">Available on staff</p>
              </div>
              <ShieldCheck className="h-4 w-4 text-teal-600" />
            </PremiumCard>
          );
        })}
      </div>
      <DisclaimerBanner tone="muted">Provider types are self-reported by the clinic. Specific provider availability, schedules, and credentialing should be confirmed directly with the clinic. Licensure and credentials should be independently verified where appropriate.</DisclaimerBanner>
    </div>
  );
}

function LocationsTab({ clinic }: { clinic: ClinicT }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={MapPin} title="Locations & hours" desc="Primary location and operating hours." />
      <div className="grid gap-4 lg:grid-cols-2">
        <PremiumCard className="overflow-hidden">
          <div className="h-40 bg-teal-50/50">
            <div className="novalyte-grid h-full w-full opacity-60" />
          </div>
          <div className="p-5">
            <h4 className="text-sm font-semibold text-foreground">{clinic.name}</h4>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {clinic.city}, {clinic.state} {clinic.zip}</p>
            {clinic.serviceArea && <p className="mt-1 text-xs text-muted-foreground">Service area: {clinic.serviceArea}</p>}
          </div>
        </PremiumCard>
        <PremiumCard className="p-5">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Clock className="h-4 w-4 text-teal-600" /> Hours of operation</h4>
          <div className="mt-3 space-y-1.5 text-sm">
            {(clinic.hours ?? "Contact clinic for hours").split(/[,;]/).map((h, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                <span className="text-muted-foreground">{h.trim().split(" ").slice(0, 2).join(" ")}</span>
                <span className="font-medium text-foreground">{h.trim().split(" ").slice(2).join(" ") || h.trim()}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">Hours may vary on holidays. Confirm directly with the clinic.</p>
        </PremiumCard>
      </div>
    </div>
  );
}

function InsuranceTab({ clinic }: { clinic: ClinicT }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={DollarSign} title="Insurance & payment options" desc="Payment and insurance details should be confirmed with the clinic." />
      <PremiumCard className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Payment model</h4>
            <p className="mt-1 text-sm text-muted-foreground">Most men's health clinics operate on a direct-pay or membership model. Some accept insurance for specific services.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Consultation pricing</h4>
            <p className="mt-1 text-sm text-muted-foreground">Pricing varies by treatment and is confirmed during the consultation request. Novalyte AI does not set clinic pricing.</p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-4 text-sm">
          <p className="font-medium text-foreground">To get accurate pricing</p>
          <p className="mt-1 text-muted-foreground">Submit a consultation request and the clinic will provide details on costs, payment options, and any applicable insurance.</p>
        </div>
      </PremiumCard>
      <DisclaimerBanner tone="amber">Novalyte AI does not process payments or verify insurance coverage. All financial arrangements are made directly between the patient and the clinic.</DisclaimerBanner>
    </div>
  );
}

function TelehealthTab({ clinic }: { clinic: ClinicT }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Video} title="Telehealth availability" desc="Remote care options and telehealth jurisdictions." />
      <PremiumCard className="p-6">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl", clinic.telehealth ? "bg-teal-50 text-teal-600" : "bg-muted text-muted-foreground")}>
            <Video className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{clinic.telehealth ? "Telehealth available" : "Telehealth not available"}</p>
            <p className="text-xs text-muted-foreground">{clinic.telehealth ? "Remote consultations offered" : "In-person care only"}</p>
          </div>
        </div>
        {clinic.telehealth && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p className="font-medium text-foreground">Telehealth jurisdictions</p>
            <p className="mt-1 text-muted-foreground">Telehealth is subject to provider licensure in the patient's state. Confirm with the clinic whether they are licensed in your state before booking a remote consultation.</p>
          </div>
        )}
      </PremiumCard>
      <DisclaimerBanner tone="muted">Telehealth availability and state licensure should be confirmed directly with the clinic. Novalyte AI does not verify provider licensure in real time.</DisclaimerBanner>
    </div>
  );
}

function EligibilityTab({ clinic }: { clinic: ClinicT }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={FileText} title="Patient eligibility" desc="General eligibility considerations for this clinic." />
      <PremiumCard className="p-6">
        <ul className="space-y-3 text-sm">
          {[
            "Adults seeking men's health services",
            "Patients with relevant treatment interest",
            "Telehealth patients must be located in a state where the provider is licensed",
            "Specific treatment eligibility determined by a licensed provider during consultation",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              <span className="text-foreground/80">{item}</span>
            </li>
          ))}
        </ul>
      </PremiumCard>
      <DisclaimerBanner tone="amber">Eligibility is determined by the clinic's licensed providers based on individual health factors. Novalyte AI does not determine patient eligibility or clinical suitability.</DisclaimerBanner>
    </div>
  );
}

function GalleryTab({ clinic }: { clinic: ClinicT }) {
  const c = colorClasses(clinic.logoColor);
  const gallery = getClinicGallery(clinic.slug);
  const captions = ["Reception and waiting area", "Consultation room", "Treatment suite", "Lab & phlebotomy area", "Clinic exterior"];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  function openLightbox(i: number) {
    setLightboxIndex(i);
    setLightboxOpen(true);
  }

  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={ImageIcon} title="Facility gallery" desc="A visual preview of the clinic environment." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {gallery.map((img, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border"
          >
            <SmartImage
              src={img}
              alt={captions[i] ?? `${clinic.name} facility photo ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="transition duration-500 group-hover:scale-105"
              imgClassName="object-cover"
              fallback={<div className={cn("h-full w-full", c.soft)} />}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 transition group-hover:opacity-100" />
            <span className="absolute bottom-2 left-2 right-2 text-left text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
              {captions[i] ?? `View ${i + 1}`}
            </span>
          </button>
        ))}
      </div>
      <DisclaimerBanner tone="muted">Gallery images are representative development fixtures. In production, clinics submit facility photos that are moderated by Novalyte AI before publication.</DisclaimerBanner>
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
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Star} title="Ratings & verified reviews" desc="Patient feedback is moderated for authenticity." />
      <PremiumCard className="p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-semibold text-foreground">—</p>
            <div className="mt-1 flex justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 text-muted-foreground/30" />)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">No ratings yet</p>
          </div>
          <Separator orientation="vertical" className="hidden h-20 sm:block" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Verified reviews will appear here once patients submit feedback through the Novalyte platform. Reviews are moderated to ensure authenticity and compliance.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill tone="muted"><Lock className="h-3 w-3" /> Moderated</StatusPill>
              <StatusPill tone="teal"><ShieldCheck className="h-3 w-3" /> Verified patients</StatusPill>
            </div>
          </div>
        </div>
      </PremiumCard>
      <DisclaimerBanner tone="muted">Reviews reflect individual patient experiences and do not constitute clinical outcomes data. Novalyte AI moderates reviews for authenticity but does not endorse specific clinical claims.</DisclaimerBanner>
    </div>
  );
}

function FaqTab({ clinic }: { clinic: ClinicT }) {
  const faqs = [
    { q: `How do I book a consultation with ${clinic.name}?`, a: "Submit a consultation request through the Contact & Booking tab. The clinic will follow up directly to schedule your appointment." },
    { q: "Does this clinic accept insurance?", a: "Insurance and payment models vary. Most men's health clinics operate on direct-pay or membership models. Confirm payment details directly with the clinic." },
    { q: "Is telehealth available?", a: clinic.telehealth ? "Yes, this clinic offers telehealth for eligible patients, subject to provider licensure in your state." : "This clinic currently focuses on in-person care. Contact the clinic to confirm." },
    { q: "What should I bring to my first appointment?", a: "Bring a government-issued ID, any relevant medical records or recent lab results, and a list of current medications. The clinic will confirm specific requirements." },
    { q: "How does Novalyte AI verify this clinic?", a: "Novalyte reviews submitted business and provider information during the verification process. Verification does not constitute endorsement or guarantee clinical outcomes." },
  ];
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={MessageSquare} title="Frequently asked questions" />
      <PremiumCard className="p-2">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border last:border-0">
              <AccordionTrigger className="px-4 text-left text-sm font-medium hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="px-4 text-sm text-muted-foreground">{f.a}</AccordionContent>
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
      toast.success("Consultation request sent. The clinic will follow up.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={Calendar} title="Contact & booking" desc="Send a structured consultation request directly to the clinic." />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <PremiumCard className="p-6">
          {!done ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5"><Label htmlFor="c-name" className="text-xs">Full name *</Label><Input id="c-name" required value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label htmlFor="c-email" className="text-xs">Email *</Label><Input id="c-email" type="email" required value={form.patientEmail} onChange={(e) => setForm({ ...form, patientEmail: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label htmlFor="c-phone" className="text-xs">Phone</Label><Input id="c-phone" value={form.patientPhone} onChange={(e) => setForm({ ...form, patientPhone: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label htmlFor="c-time" className="text-xs">Preferred time</Label><Input id="c-time" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label htmlFor="c-notes" className="text-xs">Anything the clinic should know?</Label><Textarea id="c-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" required className="mt-0.5 accent-teal-600" /><span>I understand Novalyte AI is a technology platform and does not provide medical care. A licensed provider at the clinic will determine appropriate care.</span></label>
              <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700" disabled={submitting}>{submitting ? "Sending..." : "Send consultation request"} <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600"><CheckCircle2 className="h-6 w-6" /></span>
              <h3 className="text-lg font-semibold">Request sent to {clinic.name}</h3>
              <p className="max-w-sm text-sm text-muted-foreground">The clinic will follow up directly. You can also contact them using the details on the right.</p>
            </div>
          )}
        </PremiumCard>
        <PremiumCard className="p-5">
          <h4 className="text-sm font-semibold text-foreground">Contact directly</h4>
          <div className="mt-3 space-y-2 text-sm">
            {clinic.phone && <a href={`tel:${clinic.phone}`} className="flex items-center gap-2 text-foreground hover:text-teal-700"><Phone className="h-4 w-4 text-muted-foreground" /> {clinic.phone}</a>}
            {clinic.email && <a href={`mailto:${clinic.email}`} className="flex items-center gap-2 text-foreground hover:text-teal-700 truncate"><Mail className="h-4 w-4 text-muted-foreground shrink-0" /> <span className="truncate">{clinic.email}</span></a>}
            {clinic.website && <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-teal-700 truncate"><Globe className="h-4 w-4 text-muted-foreground shrink-0" /> <span className="truncate">Website</span></a>}
          </div>
          <Separator className="my-4" />
          <div className="space-y-1 text-xs">
            <p className="font-medium text-foreground">Hours</p>
            <p className="text-muted-foreground">{clinic.hours ?? "Contact clinic"}</p>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}

function SafetyTab({ clinic }: { clinic: ClinicT }) {
  return (
    <div className="space-y-6 novalyte-fade-up">
      <SectionTitle icon={ShieldCheck} title="Safety & compliance" desc="How Novalyte AI supports trust and safety." />
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { icon: ShieldCheck, title: "Verification process", desc: "Novalyte reviews submitted business and provider information before marking a clinic as verified." },
          { icon: Lock, title: "Privacy-conscious", desc: "Patient inquiries are routed through secure infrastructure designed for healthcare workflows." },
          { icon: FileText, title: "Transparent status", desc: "Verification status is displayed clearly. Pending or under-review clinics are not marked as verified." },
          { icon: Award, title: "Independent operation", desc: "Clinics are independently owned and operated. Licensed providers make all clinical decisions." },
        ].map((s) => (
          <PremiumCard key={s.title} className="p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100"><s.icon className="h-4.5 w-4.5" /></span>
            <h4 className="mt-3 text-sm font-semibold text-foreground">{s.title}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
          </PremiumCard>
        ))}
      </div>
      <DisclaimerBanner tone="teal">Novalyte AI is designed for secure healthcare workflows and built with privacy-conscious infrastructure. Verification reflects review of submitted information and does not constitute endorsement. Licensure and credentials should be independently confirmed where appropriate.</DisclaimerBanner>
    </div>
  );
}
