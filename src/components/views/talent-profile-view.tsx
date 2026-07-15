"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User, MapPin, Briefcase, GraduationCap, Award, Mail, Phone,
  ArrowLeft, ShieldCheck, ExternalLink, Sparkles
} from "lucide-react";
import { supabaseClient as supabase } from "@/lib/supabase/client";

export function TalentProfileView({ profileId, onBack }: { profileId: string; onBack: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Related details
  const [socials, setSocials] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);

  // Preview Mode
  const [previewAsEmployer, setPreviewAsEmployer] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!profileId) return;
      try {
        setLoading(true);
        const { data: prof } = await supabase
          .from("workforce_professional_profiles")
          .select("*")
          .eq("id", profileId)
          .single();
        setProfile(prof);

        const [socialRes, histRes, eduRes, licRes, certRes, skillRes, prefRes] = await Promise.all([
          supabase.from("professional_social_links").select("*").eq("profileId", profileId).maybeSingle(),
          supabase.from("professional_employment_history").select("*").eq("profileId", profileId).order("createdAt", { ascending: false }),
          supabase.from("professional_education").select("*").eq("profileId", profileId).order("createdAt", { ascending: false }),
          supabase.from("professional_licenses").select("*").eq("profileId", profileId),
          supabase.from("professional_certifications").select("*").eq("profileId", profileId),
          supabase.from("professional_skills").select("*").eq("profileId", profileId),
          supabase.from("professional_preferences").select("*").eq("profileId", profileId).maybeSingle()
        ]);

        setSocials(socialRes.data);
        setHistory(histRes.data || []);
        setEducation(eduRes.data || []);
        setLicenses(licRes.data || []);
        setCertifications(certRes.data || []);
        setSkills(skillRes.data || []);
        setPreferences(prefRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        <p className="text-xs text-muted-foreground">Loading talent credentials...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Talent profile not found.</p>
        <Button onClick={onBack} size="sm" className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Control Banner for Preview Selection */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-teal-700" />
          <div>
            <h4 className="text-sm font-bold text-teal-900">Talent Profile Preview Mode</h4>
            <p className="text-xs text-teal-700 font-medium">Toggle preview to see exactly what employers see versus your own private details view.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={previewAsEmployer ? "default" : "outline"}
            className={cn(previewAsEmployer ? "bg-teal-600 hover:bg-teal-700 text-white" : "")}
            onClick={() => setPreviewAsEmployer(true)}
          >
            Preview as Employer
          </Button>
          <Button
            size="sm"
            variant={!previewAsEmployer ? "default" : "outline"}
            className={cn(!previewAsEmployer ? "bg-teal-600 hover:bg-teal-700 text-white" : "")}
            onClick={() => setPreviewAsEmployer(false)}
          >
            Private View (Own Account)
          </Button>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-xs">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      {/* Main card */}
      <div className="rounded-2xl border border-border bg-card shadow-premium-sm overflow-hidden">
        
        {/* Profile Header Block */}
        <div className="bg-neutral-900 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
            <div className="h-20 w-20 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-teal-400">
              <User className="h-10 w-10" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                {profile.experience >= 3 && (
                  <Badge className="bg-teal-500 text-neutral-950 font-bold border-none">
                    Verified Talent
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-neutral-300">{profile.title}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-neutral-400">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.city}, {profile.state}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {profile.experience} Years Exp</span>
                <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> {profile.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
          
          {/* Left Column (Metadata) */}
          <div className="space-y-6">
            
            {/* Contact Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Contact Details</h3>
              <div className="space-y-2 text-xs font-semibold">
                {previewAsEmployer ? (
                  <>
                    <p className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> [email-protected]@novalyte.io</p>
                    <p className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> (***) ***-****</p>
                  </>
                ) : (
                  <>
                    <p className="text-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> {profile.email}</p>
                    {profile.phone && <p className="text-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> {profile.phone}</p>}
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Social Profile links */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Links</h3>
              <div className="space-y-2">
                {socials?.linkedin ? (
                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">No social links added.</span>
                )}
              </div>
            </div>

            <Separator />

            {/* Preferences block */}
            <div className="space-y-3 text-xs">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Preferences</h3>
              <p className="text-muted-foreground"><strong className="text-foreground">Work Arrangement:</strong> {preferences?.workArrangement || "ONSITE"}</p>
              <p className="text-muted-foreground"><strong className="text-foreground">Telehealth Willingness:</strong> {preferences?.telehealth ? "Yes" : "No"}</p>
            </div>
          </div>

          {/* Right Column (Body Details) */}
          <div className="space-y-8">
            
            {/* Biography */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">Biography & Summary</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{profile.bio || "No biography provided."}</p>
            </div>

            {/* Employment History */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-teal-600" /> Employment History
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground">No employment records declared.</p>
              ) : (
                <div className="space-y-4 border-l border-border pl-4">
                  {history.map((h, i) => (
                    <div key={i} className="relative space-y-1">
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                      <h4 className="text-xs font-bold text-foreground">{h.position}</h4>
                      <p className="text-[11px] text-muted-foreground font-semibold">{h.employer} | {h.startDate} - {h.endDate || "Present"}</p>
                      <p className="text-xs text-muted-foreground font-medium">{h.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education History */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="h-4.5 w-4.5 text-teal-600" /> Education
              </h3>
              {education.length === 0 ? (
                <p className="text-xs text-muted-foreground">No education history declared.</p>
              ) : (
                <div className="space-y-3">
                  {education.map((e, idx) => (
                    <div key={idx} className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground">{e.degree} in {e.field}</h4>
                      <p className="text-[11px] text-muted-foreground">{e.school} | Class of {e.graduationYear}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Licensures & Credentials */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-teal-600" /> Licensure & Certifications
              </h3>
              {licenses.length === 0 && certifications.length === 0 ? (
                <p className="text-xs text-muted-foreground">No credentials provided.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {licenses.map((lic, idx) => (
                    <div key={idx} className="border border-border p-3 rounded-xl flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{lic.type} License - {lic.state}</h4>
                        <p className="text-[10px] text-muted-foreground">
                          No. {previewAsEmployer ? `${lic.state}-****` : lic.number} | Status: {lic.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills & Specialties */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">Skills & Clinical Expertise</h3>
              {skills.length === 0 ? (
                <p className="text-xs text-muted-foreground">No professional skills declared.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-neutral-100 text-neutral-800 text-[10px] font-semibold border-none">
                      {s.name} ({s.level})
                    </Badge>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
