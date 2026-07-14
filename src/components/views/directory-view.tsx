"use client";

import { useMemo, useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { VerificationBadge, StatusPill } from "@/components/shared/badges";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { splitCsv, colorClasses, initials, US_STATES, TREATMENT_VERTICALS } from "@/lib/constants";
import type { ClinicT } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Search, MapPin, Video, Building2, Phone, Mail, Globe, Clock, ArrowRight,
  Stethoscope, CheckCircle2, Star, X,
} from "lucide-react";

export function DirectoryView({ clinics }: { clinics: ClinicT[] }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("all");
  const [treatment, setTreatment] = useState("all");
  const [telehealthOnly, setTelehealthOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selected, setSelected] = useState<ClinicT | null>(null);

  const allTreatments = useMemo(() => {
    const set = new Set<string>();
    clinics.forEach((c) => splitCsv(c.specialties).forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [clinics]);

  const filtered = useMemo(() => {
    return clinics.filter((c) => {
      if (query) {
        const q = query.toLowerCase();
        const hay = `${c.name} ${c.city} ${c.state} ${c.overview} ${c.specialties}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (state !== "all" && c.state !== state) return false;
      if (treatment !== "all" && !splitCsv(c.specialties).includes(treatment)) return false;
      if (telehealthOnly && !c.telehealth) return false;
      if (verifiedOnly && !c.verified) return false;
      return true;
    });
  }, [clinics, query, state, treatment, telehealthOnly, verifiedOnly]);

  function resetFilters() {
    setQuery(""); setState("all"); setTreatment("all");
    setTelehealthOnly(false); setVerifiedOnly(false);
  }

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-14 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Verified Clinic Directory"
            title="Discover trusted men's health clinics"
            description="Search by location, treatment specialty, telehealth availability, and clinic capabilities. Verification status is shown for every clinic."
          />
        </div>
      </section>

      <SectionShell className="!pt-10">
        {/* Filters */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
            <div className="grid gap-1.5">
              <Label htmlFor="dir-q" className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="dir-q" placeholder="Clinic, city, or treatment..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger><SelectValue placeholder="All states" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Treatment</Label>
              <Select value={treatment} onValueChange={setTreatment}>
                <SelectTrigger><SelectValue placeholder="All treatments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All treatments</SelectItem>
                  {allTreatments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={telehealthOnly} onCheckedChange={setTelehealthOnly} />
                <span className="flex items-center gap-1 text-muted-foreground"><Video className="h-3.5 w-3.5" /> Telehealth</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                <span className="text-muted-foreground">Verified only</span>
              </label>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {clinics.length} clinics
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
            {filtered.map((c) => (
              <ClinicCard key={c.id} clinic={c} onView={() => setSelected(c)} />
            ))}
          </div>
        )}

        <DisclaimerBanner className="mt-8" tone="teal">
          Verification indicates that Novalyte AI has reviewed submitted business and provider
          information. It does not constitute endorsement or a guarantee of clinical outcomes.
          Licensure and credential information should be independently confirmed where appropriate.
        </DisclaimerBanner>
      </SectionShell>

      <ClinicProfileDialog clinic={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function ClinicCard({ clinic, onView }: { clinic: ClinicT; onView: () => void }) {
  const c = colorClasses(clinic.logoColor);
  const specs = splitCsv(clinic.specialties).slice(0, 3);
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white", c.bg)}>
            {initials(clinic.name)}
          </span>
          <div>
            <h3 className="text-base font-semibold leading-tight text-foreground">{clinic.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {clinic.city}, {clinic.state}
            </p>
          </div>
        </div>
        <VerificationBadge verified={clinic.verified} status={clinic.verificationStatus} />
      </div>

      {clinic.tagline && <p className="mt-3 text-sm font-medium text-foreground/80">{clinic.tagline}</p>}
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{clinic.overview}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {specs.map((s) => (
          <Badge key={s} variant="outline" className="border-teal-200 bg-teal-50/50 text-xs text-teal-700">{s}</Badge>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {clinic.telehealth && <StatusPill tone="teal"><Video className="h-3 w-3" /> Telehealth</StatusPill>}
        <StatusPill tone="muted"><Building2 className="h-3 w-3" /> In-person</StatusPill>
      </div>

      <div className="mt-4 flex gap-2 border-t pt-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={onView}>View Profile</Button>
        <Button size="sm" className="flex-1 bg-teal-600 text-white hover:bg-teal-700" onClick={onView}>
          Request Consultation
        </Button>
      </div>
    </div>
  );
}

function ClinicProfileDialog({ clinic, onClose }: { clinic: ClinicT | null; onClose: () => void }) {
  const [form, setForm] = useState({ patientName: "", patientEmail: "", patientPhone: "", preferredTime: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!clinic) return;
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

  function close() {
    onClose();
    setTimeout(() => { setDone(false); setForm({ patientName: "", patientEmail: "", patientPhone: "", preferredTime: "", notes: "" }); }, 200);
  }

  const specs = clinic ? splitCsv(clinic.specialties) : [];
  const caps = clinic ? splitCsv(clinic.capabilities) : [];
  const providers = clinic ? splitCsv(clinic.providerTypes) : [];
  const c = clinic ? colorClasses(clinic.logoColor) : colorClasses("teal");

  return (
    <Dialog open={!!clinic} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {clinic && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white", c.bg)}>
                    {initials(clinic.name)}
                  </span>
                  <div>
                    <DialogTitle className="text-xl">{clinic.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" /> {clinic.city}, {clinic.state}
                      <VerificationBadge verified={clinic.verified} status={clinic.verificationStatus} />
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {clinic.tagline && <p className="text-sm font-medium text-foreground/80">{clinic.tagline}</p>}
            <p className="text-sm leading-relaxed text-muted-foreground">{clinic.overview}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoBlock title="Treatment Specialties" icon={<Stethoscope className="h-4 w-4" />}>
                <div className="flex flex-wrap gap-1.5">
                  {specs.map((s) => <Badge key={s} variant="outline" className="border-teal-200 bg-teal-50/50 text-teal-700">{s}</Badge>)}
                </div>
              </InfoBlock>
              <InfoBlock title="Capabilities" icon={<CheckCircle2 className="h-4 w-4" />}>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {caps.map((cap) => <li key={cap} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />{cap}</li>)}
                </ul>
              </InfoBlock>
              <InfoBlock title="Provider Types" icon={<Star className="h-4 w-4" />}>
                <div className="flex flex-wrap gap-1.5">
                  {providers.map((p) => <StatusPill key={p} tone="muted">{p}</StatusPill>)}
                </div>
              </InfoBlock>
              <InfoBlock title="Service Area" icon={<MapPin className="h-4 w-4" />}>
                <p className="text-sm text-muted-foreground">{clinic.serviceArea ?? "Not specified"}</p>
              </InfoBlock>
            </div>

            <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
              {clinic.hours && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> {clinic.hours}</div>}
              {clinic.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {clinic.phone}</div>}
              {clinic.email && <div className="flex items-center gap-2 truncate"><Mail className="h-4 w-4 text-muted-foreground" /> {clinic.email}</div>}
              {clinic.website && <div className="flex items-center gap-2 truncate"><Globe className="h-4 w-4 text-muted-foreground" /> {clinic.website.replace(/^https?:\/\//, "")}</div>}
              <div className="flex items-center gap-2">
                {clinic.telehealth ? <Video className="h-4 w-4 text-teal-600" /> : <X className="h-4 w-4 text-muted-foreground" />}
                Telehealth {clinic.telehealth ? "available" : "not available"}
              </div>
            </div>

            {/* Consultation form */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-5">
              <h4 className="text-sm font-semibold text-foreground">Request a consultation</h4>
              <p className="mt-1 text-xs text-muted-foreground">Your request is sent to the clinic. Novalyte AI does not schedule or provide care.</p>
              {!done ? (
                <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input required placeholder="Full name" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} />
                  <Input required type="email" placeholder="Email" value={form.patientEmail} onChange={(e) => setForm({ ...form, patientEmail: e.target.value })} />
                  <Input placeholder="Phone (optional)" value={form.patientPhone} onChange={(e) => setForm({ ...form, patientPhone: e.target.value })} />
                  <Input placeholder="Preferred time (optional)" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} />
                  <Textarea className="sm:col-span-2" rows={2} placeholder="Anything the clinic should know? (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  <label className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
                    <input type="checkbox" required className="mt-0.5" />
                    <span>I understand Novalyte AI is a technology platform and does not provide medical care. A licensed provider at the clinic will determine appropriate care.</span>
                  </label>
                  <Button type="submit" className="sm:col-span-2 bg-teal-600 text-white hover:bg-teal-700" disabled={submitting}>
                    {submitting ? "Sending..." : "Send consultation request"} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <div className="mt-4 flex flex-col items-center gap-2 py-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-teal-600" />
                  <p className="text-sm font-medium">Request sent to {clinic.name}</p>
                  <Button variant="outline" size="sm" onClick={close}>Close</Button>
                </div>
              )}
            </div>

            <DisclaimerBanner tone="muted">
              Clinics are independently owned and operated. Provider participation does not
              constitute endorsement unless explicitly stated.
            </DisclaimerBanner>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoBlock({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
      <Search className="h-8 w-8 text-muted-foreground/60" />
      <h3 className="mt-3 text-base font-semibold">No clinics match your filters</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">Try widening your search or clearing filters to see more clinics.</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>Clear filters</Button>
    </div>
  );
}
