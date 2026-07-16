"use client";

import { useState } from "react";
import {
  PremiumCard, Breadcrumbs, StatCard,
} from "@/components/shared/enterprise";
import { SmartImage } from "@/components/shared/smart-image";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { navigate } from "@/lib/nav";
import { splitCsv, colorClasses, initials } from "@/lib/constants";
import type { ClinicT, ClinicProviderT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Users, MapPin, Video, Phone, Mail, Globe, Clock, ShieldCheck,
  Stethoscope, CheckCircle2, Star, ArrowRight, Building2, Calendar,
  Award, BookOpen, GraduationCap, FileText, ChevronRight, Check, AlertCircle,
} from "lucide-react";

export function ProviderProfileView({
  provider,
  clinic,
}: {
  provider: ClinicProviderT | null;
  clinic: ClinicT | null;
}) {
  const [form, setForm] = useState({ patientName: "", patientEmail: "", patientPhone: "", preferredTime: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!provider || !clinic) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Provider Profile Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested medical provider profile could not be loaded.</p>
        <Button onClick={() => navigate("directory")} className="bg-teal-600 hover:bg-teal-700 text-white">
          Back to Directory
        </Button>
      </div>
    );
  }

  const c = colorClasses(clinic.logoColor);
  const specs = splitCsv(provider.specialties || clinic.specialties);

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
          providerId: provider.id,
          providerName: provider.name,
          ...form,
          treatmentInterest: specs[0] ?? null,
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      toast.success(`Consultation request sent to ${provider.name}!`);
    } catch {
      toast.error("Failed to route consultation request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs items={[
            { label: "Home", onClick: () => navigate("home") },
            { label: "Clinic Directory", onClick: () => navigate("directory") },
            { label: clinic.name, onClick: () => navigate("clinic-profile", undefined, { id: clinic.id }) },
            { label: `${provider.name}, ${provider.credentials}` },
          ]} />
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          
          {/* Left Side: Avatar, Affiliation & Info Card */}
          <div className="space-y-4">
            <PremiumCard className="p-5 flex flex-col items-center text-center space-y-4 border-border">
              <div className="relative h-32 w-32 overflow-hidden rounded-2xl bg-muted border">
                {provider.avatarUrl ? (
                  <SmartImage src={provider.avatarUrl} alt={provider.name} fill sizes="128px" imgClassName="object-cover" />
                ) : (
                  <div className={cn("flex h-full w-full items-center justify-center text-3xl font-bold text-white", c.bg)}>
                    {initials(provider.name)}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground">{provider.name}</h2>
                <p className="text-xs font-bold text-teal-700">{provider.credentials} · {provider.role}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{provider.yearsExperience} Years Experience</p>
              </div>

              <div className="w-full pt-2">
                <StatusPill tone={clinic.verified ? "teal" : "muted"} className="w-full justify-center">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" /> {clinic.verified ? "Verified Provider Identity" : "Licensure Under Review"}
                </StatusPill>
              </div>

              <Separator />

              {/* Affiliation Link */}
              <div className="text-left w-full space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Practice Affiliation</p>
                <button
                  onClick={() => navigate("clinic-profile", undefined, { id: clinic.id })}
                  className="flex items-center gap-2.5 rounded-lg border border-border p-2 w-full text-left transition hover:border-teal-200 hover:bg-teal-50/20"
                >
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white", c.bg)}>
                    {initials(clinic.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{clinic.name}</p>
                    <p className="text-[10px] text-muted-foreground">{clinic.city}, {clinic.state}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>
              </div>
            </PremiumCard>

            {/* Quick Specs */}
            <PremiumCard className="p-5 space-y-3 text-xs border-border">
              <h3 className="font-semibold text-foreground">Provider Details</h3>
              
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Languages</p>
                <p className="font-medium text-foreground flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-teal-600" /> {provider.languages || "English"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Clinical Focus</p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {specs.slice(0, 3).map((s) => <Badge key={s} variant="outline" className="border-teal-100 bg-teal-50/20 text-teal-800 text-[10px]">{s}</Badge>)}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Telehealth Consults</p>
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  {provider.telehealth ? (
                    <><Video className="h-3.5 w-3.5 text-teal-600" /> Enabled (Multi-state)</>
                  ) : (
                    <><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> In-person only</>
                  )}
                </p>
              </div>
            </PremiumCard>
          </div>

          {/* Right Side: Professional Bio, Licenses, Locations, and Booking Form */}
          <div className="space-y-6">
            
            {/* Overview & Credentials */}
            <PremiumCard className="p-6 border-border space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Award className="h-5 w-5 text-teal-600" /> Professional Background
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Education, certifications, and clinical approach.</p>
              </div>

              <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {provider.bio || `Dr. ${provider.name} is a licensed men's health specialist affiliating with ${clinic.name}. Providing custom diagnostics and evidence-based patient optimization protocols.`}
              </p>

              <Separator />

              {/* Education & Licensure sections */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-teal-600" /> Education & Training</h4>
                  <ul className="list-disc pl-4 text-muted-foreground space-y-1 text-[11px]">
                    <li>Doctor of Medicine (MD) or Practitioner Degree</li>
                    <li>Residency / Board Specialized training</li>
                    <li>Continuous clinical research optimization</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-1.5"><FileText className="h-4 w-4 text-teal-600" /> Licensing & Regs</h4>
                  <ul className="list-disc pl-4 text-muted-foreground space-y-1 text-[11px]">
                    <li>Active State Medical Board Licensing</li>
                    <li>Registered NPI Practitioner</li>
                    <li>Licensed to serve: {clinic.statesServed || clinic.state}</li>
                  </ul>
                </div>
              </div>
            </PremiumCard>

            {/* Locations and Schedule Availability */}
            <PremiumCard className="p-6 border-border space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal-600" /> Locations & Scheduling
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Physical branches where this provider conducts consultations.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {clinic.locations && clinic.locations.length > 0 ? (
                  clinic.locations.map((loc) => (
                    <div key={loc.id} className="p-3 border rounded-xl bg-muted/20 text-xs space-y-1.5">
                      <p className="font-semibold text-foreground">{loc.name}</p>
                      <p className="text-muted-foreground flex items-start gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" /> {loc.address}</p>
                      <p className="text-[10px] text-muted-foreground"><strong>Availability:</strong> {loc.earliestAppt || "3-5 Days"}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 border rounded-xl bg-muted/20 text-xs space-y-1.5">
                    <p className="font-semibold text-foreground">{clinic.name} Main HQ</p>
                    <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {clinic.city}, {clinic.state}</p>
                  </div>
                )}
              </div>
            </PremiumCard>

            {/* Consultation Request Form */}
            <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
              <PremiumCard className="p-6 border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1"><Calendar className="h-4.5 w-4.5 text-teal-600" /> Request Consult with {provider.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">Direct your men's health inquiry to this clinician's scheduler.</p>
                
                {!done ? (
                  <form onSubmit={submit} className="space-y-4 text-xs">
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
                        <Label htmlFor="c-time" className="text-xs">Preferred Timing</Label>
                        <Input id="c-time" placeholder="Mornings, Afternoons" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} className="h-9 text-xs" />
                      </div>
                    </div>
                    
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-notes" className="text-xs">Symptoms / Goals</Label>
                      <Textarea id="c-notes" rows={3} placeholder="Please describe what goals or symptoms you would like to address..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="text-xs" />
                    </div>
                    
                    <label className="flex items-start gap-2 text-[11px] text-muted-foreground">
                      <input type="checkbox" required className="mt-0.5 accent-teal-600" />
                      <span>I understand that Novalyte AI coordinates discovery and is not a medical practice. All diagnostics and prescriptions are determined by licensed clinic providers.</span>
                    </label>

                    <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700 font-semibold" disabled={submitting}>
                      {submitting ? "Sending..." : "Submit Consultation Request"} <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600"><CheckCircle2 className="h-6 w-6" /></span>
                    <h3 className="text-base font-semibold text-teal-950">Inquiry Routed</h3>
                    <p className="max-w-sm text-xs text-muted-foreground">The coordinator at {clinic.name} will reach out shortly to schedule your appointment with {provider.name}.</p>
                  </div>
                )}
              </PremiumCard>

              {/* Direct Practice Contact Info */}
              <PremiumCard className="p-5 border-border space-y-4 text-xs">
                <div>
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase">Direct Contacts</h4>
                  <div className="mt-3 space-y-2 text-xs">
                    {clinic.phone && <a href={`tel:${clinic.phone}`} className="flex items-center gap-2 text-foreground hover:text-teal-700 font-semibold"><Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {clinic.phone}</a>}
                    {clinic.email && <a href={`mailto:${clinic.email}`} className="flex items-center gap-2 text-foreground hover:text-teal-700 truncate font-semibold"><Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> <span className="truncate">{clinic.email}</span></a>}
                    {clinic.website && <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-teal-700 truncate font-semibold"><Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> <span className="truncate">Visit Website</span></a>}
                  </div>
                </div>

                <Separator />
                
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Clinic Hours</p>
                  <p className="text-muted-foreground leading-relaxed">{clinic.hours ?? "Contact clinic"}</p>
                </div>
              </PremiumCard>
            </div>

            <DisclaimerBanner tone="muted">
              Dr. {provider.name} is affiliated with {clinic.name}, which is independently owned and operated. Verification reflects reviews of credentials at onboarding. Patient agreements are directly with the clinical practice.
            </DisclaimerBanner>
          </div>

        </div>
      </section>
    </div>
  );
}
