"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PremiumCard } from "@/components/shared/enterprise";
import { navigate } from "@/lib/nav";
import { splitCsv, US_STATES } from "@/lib/constants";
import type { ClinicT, ClinicLocationT, ClinicProviderT, ClinicTreatmentT } from "@/lib/types";
import { toast } from "sonner";
import {
  ArrowLeft, Building2, MapPin, Users, Stethoscope, Save,
  Plus, Trash2, LineChart, ShieldCheck, HelpCircle, AlertCircle,
  Eye, Check, CheckCircle2, Video, DollarSign, Languages, Accessibility,
} from "lucide-react";

export function ClinicDashboardView({ clinic, allClinics }: { clinic: ClinicT; allClinics: ClinicT[] }) {
  // Local state initialized from the clinic database record
  const [name, setName] = useState(clinic.name);
  const [tagline, setTagline] = useState(clinic.tagline ?? "");
  const [overview, setOverview] = useState(clinic.overview);
  const [phone, setPhone] = useState(clinic.phone ?? "");
  const [email, setEmail] = useState(clinic.email ?? "");
  const [website, setWebsite] = useState(clinic.website ?? "");
  const [hours, setHours] = useState(clinic.hours ?? "");
  const [acceptingNewPatients, setAcceptingNewPatients] = useState(clinic.acceptingNewPatients);
  const [initialConsultPrice, setInitialConsultPrice] = useState(clinic.initialConsultPrice ?? "");
  const [membershipPrice, setMembershipPrice] = useState(clinic.membershipPrice ?? "");
  const [insuranceAccepted, setInsuranceAccepted] = useState(clinic.insuranceAccepted);
  const [hsaFsaAccepted, setHsaFsaAccepted] = useState(clinic.hsaFsaAccepted);
  const [earliestAvailability, setEarliestAvailability] = useState(clinic.earliestAvailability ?? "");
  const [statesServed, setStatesServed] = useState(clinic.statesServed ?? "");
  const [languages, setLanguages] = useState(clinic.languages);
  const [accessibility, setAccessibility] = useState(clinic.accessibility);
  const [pricingStatus, setPricingStatus] = useState(clinic.pricingStatus);
  const [whatToExpect, setWhatToExpect] = useState(clinic.whatToExpect ?? "");

  // Relational list state
  const [locations, setLocations] = useState<Partial<ClinicLocationT>[]>(clinic.locations ?? []);
  const [providers, setProviders] = useState<Partial<ClinicProviderT>[]>(clinic.providers ?? []);
  const [treatments, setTreatments] = useState<Partial<ClinicTreatmentT>[]>(clinic.treatments ?? []);

  // Control tabs
  const [activeTab, setActiveTab] = useState("editor"); // editor | analytics
  const [editorSubTab, setEditorSubTab] = useState("org"); // org | locations | providers | treatments | pricing
  const [saving, setSaving] = useState(false);

  // Profile completeness calculation
  const completeness = useMemo(() => {
    let score = 0;
    const missing: string[] = [];

    if (name.trim()) score += 10; else missing.push("Clinic name");
    if (tagline.trim()) score += 5; else missing.push("Tagline");
    if (overview.trim()) score += 15; else missing.push("Detailed description");
    if (phone.trim() || email.trim() || website.trim()) score += 15; else missing.push("Contact links");
    if (locations.length > 0) score += 15; else missing.push("Clinic locations");
    if (providers.length > 0) score += 15; else missing.push("Providers");
    if (treatments.length > 0) score += 15; else missing.push("Treatments Catalog");
    if (pricingStatus && pricingStatus !== "Contact Clinic for Pricing") score += 10; else missing.push("Transparent pricing");

    return { score, missing };
  }, [name, tagline, overview, phone, email, website, locations, providers, treatments, pricingStatus]);

  // Locations Editor helpers
  const addLocation = () => {
    setLocations([...locations, { name: "New Branch", address: "", hours: "Mon-Fri 9am-5pm", phone: "", onSiteLab: true, phlebotomy: true, earliestAppt: "Next Day" }]);
  };
  const removeLocation = (idx: number) => {
    setLocations(locations.filter((_, i) => i !== idx));
  };
  const updateLocation = (idx: number, key: keyof ClinicLocationT, val: any) => {
    const updated = [...locations];
    updated[idx] = { ...updated[idx], [key]: val };
    setLocations(updated);
  };

  // Providers Editor helpers
  const addProvider = () => {
    setProviders([...providers, { name: "Dr. New Provider", credentials: "MD", role: "Physician", specialties: "TRT", yearsExperience: 5, bio: "", languages: "English", telehealth: true }]);
  };
  const removeProvider = (idx: number) => {
    setProviders(providers.filter((_, i) => i !== idx));
  };
  const updateProvider = (idx: number, key: keyof ClinicProviderT, val: any) => {
    const updated = [...providers];
    updated[idx] = { ...updated[idx], [key]: val };
    setProviders(updated);
  };

  // Treatments Editor helpers
  const addTreatment = () => {
    setTreatments([...treatments, { name: "New Treatment Program", category: "Hormone Optimization", description: "", concerns: "", priceRange: "$99/mo", labRequired: true, consultRequired: true, careFormat: "hybrid" }]);
  };
  const removeTreatment = (idx: number) => {
    setTreatments(treatments.filter((_, i) => i !== idx));
  };
  const updateTreatment = (idx: number, key: keyof ClinicTreatmentT, val: any) => {
    const updated = [...treatments];
    updated[idx] = { ...updated[idx], [key]: val };
    setTreatments(updated);
  };

  // Publish / Save to database
  const handlePublish = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        tagline,
        overview,
        phone,
        email,
        website,
        hours,
        acceptingNewPatients,
        initialConsultPrice: initialConsultPrice === "" ? null : Number(initialConsultPrice),
        membershipPrice: membershipPrice === "" ? null : Number(membershipPrice),
        insuranceAccepted,
        hsaFsaAccepted,
        earliestAvailability,
        statesServed,
        languages,
        accessibility,
        pricingStatus,
        whatToExpect,
        profileCompleteness: completeness.score,
        locations,
        providers,
        treatments,
      };

      const res = await fetch(`/api/clinics/${clinic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      // Sync changes back to main context object
      Object.assign(clinic, payload);
      toast.success("Clinic profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save updates.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("clinic-profile", undefined, { id: clinic.id })}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition"
            title="Back to profile"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              <Building2 className="h-5 w-5 text-teal-600" /> {name || "Clinic Dashboard"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage directory profile details, locations, pricing, and analytics.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("clinic-profile", undefined, { id: clinic.id })}
            className="font-semibold border-border flex items-center gap-1 text-xs"
          >
            <Eye className="h-4 w-4 text-teal-600" /> Preview Profile
          </Button>
          <Button 
            disabled={saving}
            onClick={handlePublish}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-1 text-xs shadow-premium-sm"
          >
            <Save className="h-4 w-4" /> {saving ? "Publishing..." : "Publish Approved Changes"}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left Column: Progress & Nav */}
        <div className="space-y-4">
          {/* Completeness Widget */}
          <PremiumCard className="p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profile Completeness</h3>
            
            <div className="space-y-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-foreground">{completeness.score}% Complete</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-teal-600 transition-all duration-500" 
                  style={{ width: `${completeness.score}%` }} 
                />
              </div>
            </div>

            {completeness.missing.length > 0 ? (
              <div className="text-[11px] space-y-1 bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg">
                <p className="font-semibold text-amber-900 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Missing items:</p>
                <ul className="list-disc pl-3 text-amber-800/80 space-y-0.5">
                  {completeness.missing.slice(0, 3).map((m) => <li key={m}>{m}</li>)}
                  {completeness.missing.length > 3 && <li>And {completeness.missing.length - 3} more items</li>}
                </ul>
              </div>
            ) : (
              <p className="text-[11px] text-teal-800 bg-teal-50 border border-teal-100 p-2.5 rounded-lg font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" /> Profile is 100% complete!
              </p>
            )}
          </PremiumCard>

          {/* Navigation tabs */}
          <PremiumCard className="p-2 space-y-1">
            <button
              onClick={() => setActiveTab("editor")}
              className={cn("w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition", 
                activeTab === "editor" ? "bg-teal-50 text-teal-800" : "text-foreground/80 hover:bg-muted/40")}
            >
              <Building2 className="h-4 w-4" /> Profile Editor
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={cn("w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition", 
                activeTab === "analytics" ? "bg-teal-50 text-teal-800" : "text-foreground/80 hover:bg-muted/40")}
            >
              <LineChart className="h-4 w-4" /> Performance Analytics
            </button>
          </PremiumCard>
        </div>

        {/* Right Column: Tab View */}
        <div className="min-w-0">
          {activeTab === "editor" && (
            <PremiumCard className="p-6 border-border space-y-6">
              {/* Editor Sub Navigation */}
              <div className="flex flex-wrap gap-1 border-b border-border/60 pb-3">
                {[
                  { id: "org", label: "Organization Info", icon: Building2 },
                  { id: "locations", label: "Locations", icon: MapPin },
                  { id: "providers", label: "Providers", icon: Users },
                  { id: "treatments", label: "Treatments", icon: Stethoscope },
                  { id: "pricing", label: "Pricing & Billing", icon: DollarSign },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setEditorSubTab(st.id)}
                    className={cn("px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition border border-transparent", 
                      editorSubTab === st.id ? "bg-card border-border shadow-premium-xs text-teal-800 font-bold" : "text-muted-foreground hover:text-foreground")}
                  >
                    <st.icon className="h-3.5 w-3.5" /> {st.label}
                  </button>
                ))}
              </div>

              {/* Sub Tab: Organization Details */}
              {editorSubTab === "org" && (
                <div className="space-y-4 text-xs">
                  <div className="grid gap-1.5">
                    <Label htmlFor="org-name" className="text-xs">Clinic Name *</Label>
                    <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-xs" />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="org-tagline" className="text-xs">Clinic Tagline</Label>
                    <Input id="org-tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="E.g. Evidence-based TRT and optimization" className="h-9 text-xs" />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="org-overview" className="text-xs">Detailed Bio / Overview *</Label>
                    <Textarea id="org-overview" rows={5} value={overview} onChange={(e) => setOverview(e.target.value)} className="text-xs" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="org-phone" className="text-xs">Phone Number</Label>
                      <Input id="org-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="org-email" className="text-xs">General Contact Email</Label>
                      <Input id="org-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="org-website" className="text-xs">Website URL</Label>
                      <Input id="org-website" value={website} onChange={(e) => setWebsite(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="org-hours" className="text-xs">Hours of Operation</Label>
                      <Input id="org-hours" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Mon-Fri 8am-6pm" className="h-9 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="org-languages" className="text-xs">Supported Languages (CSV)</Label>
                      <Input id="org-languages" value={languages} onChange={(e) => setLanguages(e.target.value)} className="h-9 text-xs" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="org-access" className="text-xs">Accessibility Accommodations</Label>
                      <Input id="org-access" value={accessibility} onChange={(e) => setAccessibility(e.target.value)} className="h-9 text-xs" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <div>
                        <p className="font-semibold text-foreground">Accepting New Patients</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Toggle clinic scheduling status in directory results.</p>
                      </div>
                      <Switch checked={acceptingNewPatients} onCheckedChange={setAcceptingNewPatients} />
                    </label>
                  </div>
                </div>
              )}

              {/* Sub Tab: Locations Manager */}
              {editorSubTab === "locations" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Locations list ({locations.length})</h4>
                    <Button onClick={addLocation} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-3 font-semibold flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" /> Add Location
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {locations.map((loc, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3 text-xs relative">
                        <button 
                          onClick={() => removeLocation(idx)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-rose-600 transition"
                          title="Remove Location"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                        
                        <div className="grid gap-1.5 pr-8">
                          <Label className="text-xs font-semibold">Location Name</Label>
                          <Input value={loc.name} onChange={(e) => updateLocation(idx, "name", e.target.value)} className="h-8 text-xs" />
                        </div>

                        <div className="grid gap-1.5">
                          <Label className="text-xs font-semibold">Street Address</Label>
                          <Input value={loc.address} onChange={(e) => updateLocation(idx, "address", e.target.value)} className="h-8 text-xs" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Branch Phone</Label>
                            <Input value={loc.phone ?? ""} onChange={(e) => updateLocation(idx, "phone", e.target.value)} className="h-8 text-xs" />
                          </div>
                          <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Appt availability</Label>
                            <Input value={loc.earliestAppt ?? ""} onChange={(e) => updateLocation(idx, "earliestAppt", e.target.value)} className="h-8 text-xs" />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={!!loc.onSiteLab} onChange={(e) => updateLocation(idx, "onSiteLab", e.target.checked)} className="accent-teal-600" />
                            <span>On-site Laboratory</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={!!loc.phlebotomy} onChange={(e) => updateLocation(idx, "phlebotomy", e.target.checked)} className="accent-teal-600" />
                            <span>Phlebotomy Station</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub Tab: Providers Manager */}
              {editorSubTab === "providers" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Providers list ({providers.length})</h4>
                    <Button onClick={addProvider} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-3 font-semibold flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" /> Add Provider
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {providers.map((prov, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3 text-xs relative">
                        <button 
                          onClick={() => removeProvider(idx)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-rose-600 transition"
                          title="Remove Provider"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>

                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Provider Full Name</Label>
                            <Input value={prov.name} onChange={(e) => updateProvider(idx, "name", e.target.value)} className="h-8 text-xs" />
                          </div>
                          <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Credentials</Label>
                            <Input value={prov.credentials} placeholder="MD, NP, PA-C" onChange={(e) => updateProvider(idx, "credentials", e.target.value)} className="h-8 text-xs" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Role</Label>
                            <Input value={prov.role} placeholder="Medical Director, Urologist" onChange={(e) => updateProvider(idx, "role", e.target.value)} className="h-8 text-xs" />
                          </div>
                          <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Experience Years</Label>
                            <Input type="number" value={prov.yearsExperience ?? 0} onChange={(e) => updateProvider(idx, "yearsExperience", Number(e.target.value))} className="h-8 text-xs" />
                          </div>
                        </div>

                        <div className="grid gap-1.5">
                          <Label className="text-xs font-semibold">Specialties (CSV)</Label>
                          <Input value={prov.specialties ?? ""} onChange={(e) => updateProvider(idx, "specialties", e.target.value)} className="h-8 text-xs" />
                        </div>

                        <div className="grid gap-1.5">
                          <Label className="text-xs font-semibold">Biography</Label>
                          <Textarea rows={2} value={prov.bio ?? ""} onChange={(e) => updateProvider(idx, "bio", e.target.value)} className="text-xs" />
                        </div>

                        <label className="flex items-center gap-1.5 cursor-pointer pt-1">
                          <input type="checkbox" checked={!!prov.telehealth} onChange={(e) => updateProvider(idx, "telehealth", e.target.checked)} className="accent-teal-600" />
                          <span>Provides Telehealth consults</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub Tab: Treatments Catalog */}
              {editorSubTab === "treatments" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Treatments catalog ({treatments.length})</h4>
                    <Button onClick={addTreatment} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-3 font-semibold flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" /> Add Treatment
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {treatments.map((t, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3 text-xs relative">
                        <button 
                          onClick={() => removeTreatment(idx)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-rose-600 transition"
                          title="Remove Treatment"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>

                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Treatment Name</Label>
                            <Input value={t.name} onChange={(e) => updateTreatment(idx, "name", e.target.value)} className="h-8 text-xs" />
                          </div>
                          <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Category</Label>
                            <Input value={t.category} placeholder="Hormone Optimization, Weight Loss" onChange={(e) => updateTreatment(idx, "category", e.target.value)} className="h-8 text-xs" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Estimated Monthly Price / Range</Label>
                            <Input value={t.priceRange ?? ""} placeholder="$120/mo, $250/panel" onChange={(e) => updateTreatment(idx, "priceRange", e.target.value)} className="h-8 text-xs" />
                          </div>
                          <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Format Mode</Label>
                            <Select value={t.careFormat ?? "hybrid"} onValueChange={(val) => updateTreatment(idx, "careFormat", val)}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="telehealth">Telehealth only</SelectItem>
                                <SelectItem value="in-person">In-person only</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid gap-1.5">
                          <Label className="text-xs font-semibold">Patient Concerns Addressed (CSV)</Label>
                          <Input value={t.concerns ?? ""} placeholder="Low energy, Weight gain" onChange={(e) => updateTreatment(idx, "concerns", e.target.value)} className="h-8 text-xs" />
                        </div>

                        <div className="grid gap-1.5">
                          <Label className="text-xs font-semibold">Short Program Description</Label>
                          <Textarea rows={2} value={t.description ?? ""} onChange={(e) => updateTreatment(idx, "description", e.target.value)} className="text-xs" />
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={!!t.consultRequired} onChange={(e) => updateTreatment(idx, "consultRequired", e.target.checked)} className="accent-teal-600" />
                            <span>Initial Consultation Required</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={!!t.labRequired} onChange={(e) => updateTreatment(idx, "labRequired", e.target.checked)} className="accent-teal-600" />
                            <span>Laboratory Panel Required</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub Tab: Pricing & Billing */}
              {editorSubTab === "pricing" && (
                <div className="space-y-4 text-xs">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold">Pricing Status Transparency</Label>
                    <Select value={pricingStatus} onValueChange={setPricingStatus}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full Pricing Published">Full Pricing Published</SelectItem>
                        <SelectItem value="Partial Pricing Published">Partial Pricing</SelectItem>
                        <SelectItem value="Consultation Pricing Available">Consultation Pricing</SelectItem>
                        <SelectItem value="Contact Clinic for Pricing">Contact Clinic for Pricing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="price-consult" className="text-xs">Consultation Price ($)</Label>
                      <Input id="price-consult" type="number" value={initialConsultPrice} onChange={(e) => setInitialConsultPrice(e.target.value)} placeholder="E.g. 150 or 0 for Free" className="h-9 text-xs" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="price-membership" className="text-xs">Est. Monthly Membership ($)</Label>
                      <Input id="price-membership" type="number" value={membershipPrice} onChange={(e) => setMembershipPrice(e.target.value)} placeholder="E.g. 99" className="h-9 text-xs" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3 pt-1">
                    <Label className="text-xs font-semibold text-foreground/80">Billing Methods</Label>
                    
                    <label className="flex items-center justify-between p-2 border rounded-lg">
                      <span>Accepts Commercial Health Insurance</span>
                      <Switch checked={insuranceAccepted} onCheckedChange={setInsuranceAccepted} />
                    </label>

                    <label className="flex items-center justify-between p-2 border rounded-lg">
                      <span>Accepts HSA / FSA Cards</span>
                      <Switch checked={hsaFsaAccepted} onCheckedChange={setHsaFsaAccepted} />
                    </label>
                  </div>

                  <Separator />

                  <div className="grid gap-1.5">
                    <Label htmlFor="telehealth-states" className="text-xs">Telehealth Licensing States (CSV)</Label>
                    <Input id="telehealth-states" value={statesServed} onChange={(e) => setStatesServed(e.target.value)} placeholder="TX, FL, CO" className="h-9 text-xs" />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="expect-timeline" className="text-xs">What to Expect Timeline Stages (CSV)</Label>
                    <Input id="expect-timeline" value={whatToExpect} onChange={(e) => setWhatToExpect(e.target.value)} placeholder="Consultation, Intake form, Lab draw, Review, Start treatment" className="h-9 text-xs" />
                  </div>
                </div>
              )}
            </PremiumCard>
          )}

          {activeTab === "analytics" && (
            <PremiumCard className="p-6 border-border space-y-6">
              <div>
                <h3 className="text-base font-semibold text-foreground flex items-center gap-1.5">
                  <LineChart className="h-5 w-5 text-teal-600" /> Directory Performance Metrics
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time tracking of patient engagement and platform conversion rates.</p>
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="p-4 rounded-xl border border-border bg-muted/20 text-center space-y-1">
                  <p className="text-xs text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold text-foreground">1,248</p>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px]">+14% this mo</Badge>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/20 text-center space-y-1">
                  <p className="text-xs text-muted-foreground">Inquiries Generated</p>
                  <p className="text-2xl font-bold text-foreground">42</p>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px]">+8% this mo</Badge>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/20 text-center space-y-1">
                  <p className="text-xs text-muted-foreground">Saves & Compares</p>
                  <p className="text-2xl font-bold text-foreground">89</p>
                  <Badge variant="outline" className="border-border text-[10px]">Stable</Badge>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/20 text-center space-y-1">
                  <p className="text-xs text-muted-foreground">Click Conversion</p>
                  <p className="text-2xl font-bold text-teal-700">3.4%</p>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px]">Top 10%</Badge>
                </div>
              </div>

              {/* Graph placeholder */}
              <div className="border border-border rounded-xl p-4 bg-muted/10 h-64 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Consultation Request Trends</span>
                  <span className="text-muted-foreground">Last 6 Months</span>
                </div>
                
                {/* Mock Chart drawing */}
                <div className="flex items-end justify-between h-40 px-4 pt-4 border-b border-l border-border">
                  {[20, 35, 25, 45, 55, 42].map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                      <div 
                        className="w-8 bg-teal-600 rounded-t-sm transition-all duration-500 hover:bg-teal-500" 
                        style={{ height: `${val * 2}px` }} 
                      />
                      <span className="text-[9px] text-muted-foreground font-semibold">
                        {["Feb", "Mar", "Apr", "May", "Jun", "Jul"][idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumCard>
          )}
        </div>
      </div>
    </div>
  );
}
