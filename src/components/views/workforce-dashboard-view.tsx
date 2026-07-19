"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { navigate } from "@/lib/nav";
import {
  User, Briefcase, GraduationCap, Award, FileText, Bell, Settings,
  Sliders, Stethoscope, Eye, CheckCircle2, AlertCircle, Plus, Trash2,
  Video, DollarSign, ArrowRight, ShieldCheck, Mail, Phone, MapPin, Loader2,
  Lock, Check, ExternalLink
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

type TabKey =
  | "overview"
  | "profile"
  | "documents"
  | "experience"
  | "education"
  | "licenses"
  | "skills"
  | "preferences"
  | "alerts"
  | "recommendations"
  | "applications"
  | "notifications";

export function WorkforceDashboardView({ profileId }: { profileId: string }) {
  const supabase = getSupabaseClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Related collections state
  const [socials, setSocials] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  // Form states for creating new items
  const [newEmployer, setNewEmployer] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [newSchool, setNewSchool] = useState("");
  const [newDegree, setNewDegree] = useState("");
  const [newField, setNewField] = useState("");
  const [newGradYear, setNewGradYear] = useState("");

  const [newLicType, setNewLicType] = useState("");
  const [newLicNum, setNewLicNum] = useState("");
  const [newLicState, setNewLicState] = useState("");
  const [newLicExpires, setNewLicExpires] = useState("");

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("intermediate");

  const [newAlertName, setNewAlertName] = useState("");
  const [newAlertTitle, setNewAlertTitle] = useState("");
  const [newAlertState, setNewAlertState] = useState("");

  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("resume");

  useEffect(() => {
    async function loadData() {
      if (!profileId) return;
      try {
        setLoading(true);
        // Load main profile
        const { data: prof, error: profErr } = await supabase
          .from("workforce_professional_profiles")
          .select("*")
          .eq("id", profileId)
          .single();

        if (profErr || !prof) {
          toast.error("Professional profile not found.");
          setLoading(false);
          return;
        }
        setProfile(prof);

        // Load all linked elements parallelly
        const [
          socialRes,
          histRes,
          eduRes,
          licRes,
          certRes,
          skillRes,
          prefRes,
          docRes,
          alertRes,
          matchRes,
          appRes,
          notifyRes,
          jobsRes
        ] = await Promise.all([
          supabase.from("professional_social_links").select("*").eq("profileId", profileId).maybeSingle(),
          supabase.from("professional_employment_history").select("*").eq("profileId", profileId).order("createdAt", { ascending: false }),
          supabase.from("professional_education").select("*").eq("profileId", profileId).order("createdAt", { ascending: false }),
          supabase.from("professional_licenses").select("*").eq("profileId", profileId),
          supabase.from("professional_certifications").select("*").eq("profileId", profileId),
          supabase.from("professional_skills").select("*").eq("profileId", profileId),
          supabase.from("professional_preferences").select("*").eq("profileId", profileId).maybeSingle(),
          supabase.from("professional_documents").select("*").eq("profileId", profileId),
          supabase.from("professional_job_alerts").select("*").eq("profileId", profileId),
          supabase.from("workforce_job_matches").select("*").eq("profileId", profileId).order("score", { ascending: false }),
          supabase.from("JobApplication").select("*, JobPosting(*)").eq("workforce_profile_id", profileId),
          supabase.from("notifications").select("*").eq("profileId", profileId).order("createdAt", { ascending: false }),
          supabase.from("JobPosting").select("*").eq("status", "open")
        ]);

        setSocials(socialRes.data || { linkedin: "", website: "", portfolio: "" });
        setHistory(histRes.data || []);
        setEducation(eduRes.data || []);
        setLicenses(licRes.data || []);
        setCertifications(certRes.data || []);
        setSkills(skillRes.data || []);
        setPreferences(prefRes.data || { empTypes: "full-time", workArrangement: "onsite", telehealth: false, minSalary: 80000 });
        setDocuments(docRes.data || []);
        setAlerts(alertRes.data || []);
        setMatches(matchRes.data || []);
        setApplications(appRes.data || []);
        setNotifications(notifyRes.data || []);
        setJobs(jobsRes.data || []);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profileId]);

  // Run match generation triggers
  const triggerMatching = async () => {
    try {
      toast.loading("Matching your profile against clinic positions...", { id: "matching" });
      const res = await fetch("/api/workforce/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ profileId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Success! Generated ${data.count} opportunity matches.`, { id: "matching" });
        // Reload matches
        const { data: updatedMatches } = await supabase
          .from("workforce_job_matches")
          .select("*")
          .eq("profileId", profileId)
          .order("score", { ascending: false });
        setMatches(updatedMatches || []);
      } else {
        toast.error("Could not run match engine.", { id: "matching" });
      }
    } catch {
      toast.error("Matching engine connection error.", { id: "matching" });
    }
  };

  // Profile strength scoring (out of 100)
  const strength = useMemo(() => {
    let score = 20; // baseline for account
    const checklist: string[] = [];

    if (profile?.bio) { score += 10; } else { checklist.push("Add a professional biography"); }
    if (documents.some(d => d.type === "resume")) { score += 15; } else { checklist.push("Upload your primary résumé"); }
    if (history.length > 0) { score += 15; } else { checklist.push("Add employment history"); }
    if (education.length > 0) { score += 10; } else { checklist.push("Add your education background"); }
    if (licenses.length > 0) { score += 15; } else { checklist.push("Add professional license verification details"); }
    if (skills.length > 0) { score += 10; } else { checklist.push("Add key clinical or operational skills"); }
    if (socials?.linkedin) { score += 5; } else { checklist.push("Link your LinkedIn professional profile"); }

    return { score: Math.min(score, 100), checklist };
  }, [profile, documents, history, education, licenses, skills, socials]);

  // Handle Visibility Settings update
  const updateVisibility = async (val: string) => {
    try {
      const { error } = await supabase
        .from("workforce_professional_profiles")
        .update({ visibility_status: val })
        .eq("id", profileId);

      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, visibility_status: val }));
      toast.success(`Profile visibility updated to ${val.replace("_", " ")}`);
    } catch {
      toast.error("Failed to update visibility settings.");
    }
  };

  // Add employment history handler
  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployer || !newPosition || !newStart) {
      toast.error("Please fill in employer, position, and start date.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("professional_employment_history")
        .insert({
          profileId,
          employer: newEmployer,
          position: newPosition,
          startDate: newStart,
          endDate: newEnd || null,
          description: newDesc
        })
        .select()
        .single();

      if (error) throw error;
      setHistory(prev => [data, ...prev]);
      setNewEmployer("");
      setNewPosition("");
      setNewStart("");
      setNewEnd("");
      setNewDesc("");
      toast.success("Work experience added!");
    } catch {
      toast.error("Failed to save experience.");
    }
  };

  // Add license details handler
  const handleAddLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicType || !newLicNum || !newLicState) {
      toast.error("Required: License type, number, and issuing state.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("professional_licenses")
        .insert({
          profileId,
          type: newLicType,
          number: newLicNum,
          state: newLicState,
          expires: newLicExpires || null,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;
      setLicenses(prev => [...prev, data]);
      setNewLicType("");
      setNewLicNum("");
      setNewLicState("");
      setNewLicExpires("");
      toast.success("License added for review and verification.");
    } catch {
      toast.error("Failed to save license.");
    }
  };

  // Real private Storage upload via signed URL; verification stays pending for admin review.
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) {
      toast.error("Please add a title for this file.");
      return;
    }
    const fileInput = document.getElementById("workforce-doc-file") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) {
      toast.error("Choose a file to upload.");
      return;
    }
    setUploadingDoc(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Sign in required.");

      const start = await fetch("/api/workforce/professional/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: newDocType,
          name: newDocName,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
        }),
      });
      const started = await start.json();
      if (!start.ok) throw new Error(started.error || "Unable to start upload.");

      const { error: uploadError } = await supabase.storage
        .from(started.bucket)
        .uploadToSignedUrl(started.path, started.token, file);
      if (uploadError) {
        await fetch("/api/workforce/professional/documents", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ documentId: started.documentId, uploadStatus: "failed" }),
        });
        throw uploadError;
      }

      await fetch("/api/workforce/professional/documents", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documentId: started.documentId, uploadStatus: "uploaded" }),
      });

      const { data } = await supabase
        .from("professional_documents")
        .select("*")
        .eq("id", started.documentId)
        .single();
      if (data) setDocuments((prev) => [...prev, data]);
      setNewDocName("");
      if (fileInput) fileInput.value = "";
      toast.success("Document uploaded. Verification is pending Novalyte review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Document upload failed.");
    } finally {
      setUploadingDoc(false);
    }
  };

  // Create alert handler
  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertName) {
      toast.error("Please specify a name for this job alert.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("professional_job_alerts")
        .insert({
          profileId,
          name: newAlertName,
          title: newAlertTitle || null,
          state: newAlertState || null,
          active: true
        })
        .select()
        .single();

      if (error) throw error;
      setAlerts(prev => [...prev, data]);
      setNewAlertName("");
      setNewAlertTitle("");
      setNewAlertState("");
      toast.success("Job Alert configured!");
    } catch {
      toast.error("Failed to save alert rule.");
    }
  };

  // Dismiss notification handler
  const dismissNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      toast.error("Could not delete alert.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-sm font-medium text-muted-foreground">Loading your dashboard workspace...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Premium dashboard layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        
        {/* Navigation Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-premium-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{profile?.name}</h2>
                <p className="text-xs text-muted-foreground">{profile?.title}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <nav className="flex flex-col gap-1.5">
              {[
                { id: "overview", label: "Overview", icon: Sliders },
                { id: "profile", label: "Professional Identity", icon: Stethoscope },
                { id: "experience", label: "Employment History", icon: Briefcase },
                { id: "education", label: "Education", icon: GraduationCap },
                { id: "licenses", label: "Licenses & Certifications", icon: Award },
                { id: "documents", label: "Résumé & Documents", icon: FileText },
                { id: "alerts", label: "Job Alerts", icon: Sliders },
                { id: "recommendations", label: "Recommended Jobs", icon: Eye },
                { id: "applications", label: "Applications", icon: Briefcase },
                { id: "notifications", label: "Notifications", icon: Bell },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabKey)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all",
                      activeTab === item.id
                        ? "bg-teal-50 text-teal-800"
                        : "text-foreground/80 hover:bg-neutral-50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.label}</span>
                    {item.id === "notifications" && notifications.length > 0 && (
                      <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="my-3 border-t border-neutral-200/60" />

              <button
                onClick={() => window.location.href = "/workforce/professional/settings"}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-foreground/85 hover:bg-neutral-50 hover:text-foreground transition-all"
              >
                <Settings className="h-4.5 w-4.5 shrink-0" />
                <span>Account Settings</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Workspace Panel */}
        <main className="space-y-6">
          
          {/* Tab: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h1 className="text-xl font-bold text-foreground">Welcome to the Workforce Hub</h1>
                    <p className="text-sm text-muted-foreground">Manage your healthcare career credentials, job matches, and active applications.</p>
                  </div>
                  <Button
                    onClick={triggerMatching}
                    className="bg-teal-600 text-white hover:bg-teal-700 font-semibold"
                  >
                    Run Match Engine
                  </Button>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Profile Strength", value: `${strength.score}%` },
                    { label: "Active Applications", value: applications.length },
                    { label: "Recommended Jobs", value: matches.filter(m => m.score >= 70).length },
                    { label: "Pending Licenses", value: licenses.filter(l => l.status === "pending").length },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl bg-neutral-50/50 p-4 border border-border/60">
                      <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {/* Profile Strength Checklist */}
                  <div className="rounded-xl border border-border p-5">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="h-4.5 w-4.5 text-teal-600" /> Improve Your Profile
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">Complete these steps to rank higher in employer matching results.</p>
                    {strength.checklist.length === 0 ? (
                      <p className="mt-4 text-xs font-medium text-emerald-600">✓ Your professional talent profile is 100% complete!</p>
                    ) : (
                      <ul className="mt-4 space-y-2">
                        {strength.checklist.map((c, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> {c}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Visibility Preferences */}
                  <div className="rounded-xl border border-border p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Lock className="h-4.5 w-4.5 text-teal-600" /> Profile Visibility
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground font-medium">Control who can discover your professional profile credentials.</p>
                    </div>
                    <div className="mt-4">
                      <Select value={profile?.visibility_status ?? "private"} onValueChange={updateVisibility}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discoverable">Discoverable after approval</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Profile Identity */}
          {activeTab === "profile" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm space-y-6">
              <h2 className="text-base font-bold text-foreground">Professional Identity</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const { error } = await supabase
                    .from("workforce_professional_profiles")
                    .update({
                      name: profile.name,
                      title: profile.title,
                      city: profile.city,
                      state: profile.state,
                      bio: profile.bio,
                      category: profile.category,
                      specialty: profile.specialty,
                      experience: profile.experience,
                      pronouns: profile.pronouns
                    })
                    .eq("id", profileId);
                  if (error) throw error;
                  toast.success("Profile details updated successfully!");
                } catch {
                  toast.error("Failed to save changes.");
                }
              }} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Full Name</Label>
                    <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Professional Title (e.g. Family Nurse Practitioner)</Label>
                    <Input value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-1.5">
                    <Label>City</Label>
                    <Input value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>State</Label>
                    <Input value={profile.state} onChange={e => setProfile({...profile, state: e.target.value})} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Preferred Pronouns</Label>
                    <Input value={profile.pronouns || ""} onChange={e => setProfile({...profile, pronouns: e.target.value})} placeholder="e.g. they/them" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-1.5">
                    <Label>Healthcare Category</Label>
                    <Select value={profile.category} onValueChange={v => setProfile({...profile, category: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clinical Care">Clinical Care</SelectItem>
                        <SelectItem value="Allied Health">Allied Health</SelectItem>
                        <SelectItem value="Operations & Administration">Operations & Admin</SelectItem>
                        <SelectItem value="Specialty Care">Specialty Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Primary Specialty</Label>
                    <Input value={profile.specialty || ""} onChange={e => setProfile({...profile, specialty: e.target.value})} placeholder="e.g. TRT, Longevity" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Years of Experience</Label>
                    <Input type="number" value={profile.experience || 0} onChange={e => setProfile({...profile, experience: parseInt(e.target.value)})} />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label>Biography & Professional Objective</Label>
                  <Textarea value={profile.bio || ""} onChange={e => setProfile({...profile, bio: e.target.value})} rows={4} />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-teal-600 text-white hover:bg-teal-700 font-semibold">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Employment History */}
          {activeTab === "experience" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm space-y-6">
              <h2 className="text-base font-bold text-foreground">Work History & Experience</h2>
              
              <form onSubmit={handleAddHistory} className="bg-neutral-50/50 p-4 border border-border rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Add Experience Record</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Employer Name</Label>
                    <Input value={newEmployer} onChange={e => setNewEmployer(e.target.value)} placeholder="e.g. Austin Men's Health" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Position Title</Label>
                    <Input value={newPosition} onChange={e => setNewPosition(e.target.value)} placeholder="e.g. Senior Nurse Practitioner" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Start Date</Label>
                    <Input value={newStart} onChange={e => setNewStart(e.target.value)} placeholder="e.g. June 2022" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>End Date (leave blank if current)</Label>
                    <Input value={newEnd} onChange={e => setNewEnd(e.target.value)} placeholder="e.g. Present" />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>Responsibilities & Accomplishments</Label>
                  <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Detail patient sizes, clinical procedures, or hormone targets." rows={3} />
                </div>
                <Button type="submit" size="sm" className="bg-teal-600 text-white hover:bg-teal-700">
                  <Plus className="h-4 w-4 mr-1" /> Add Experience
                </Button>
              </form>

              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between items-start border border-border p-4 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{h.position}</h4>
                      <p className="text-xs text-muted-foreground font-medium">{h.employer} | {h.startDate} - {h.endDate || "Present"}</p>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{h.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      await supabase.from("professional_employment_history").delete().eq("id", h.id);
                      setHistory(prev => prev.filter(x => x.id !== h.id));
                      toast.success("Experience record removed.");
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Education */}
          {activeTab === "education" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm space-y-6">
              <h2 className="text-base font-bold text-foreground">Education Background</h2>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newSchool || !newDegree || !newField) return;
                const { data, error } = await supabase.from("professional_education").insert({
                  profileId, school: newSchool, degree: newDegree, field: newField, graduationYear: newGradYear
                }).select().single();
                if (!error) {
                  setEducation(prev => [data, ...prev]);
                  setNewSchool(""); setNewDegree(""); setNewField(""); setNewGradYear("");
                  toast.success("Education record added!");
                }
              }} className="bg-neutral-50/50 p-4 border border-border rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Add School/Degree</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-1.5">
                    <Label>School/University</Label>
                    <Input value={newSchool} onChange={e => setNewSchool(e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Degree Type</Label>
                    <Input value={newDegree} onChange={e => setNewDegree(e.target.value)} placeholder="e.g. Master of Science" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Field of Study</Label>
                    <Input value={newField} onChange={e => setNewField(e.target.value)} placeholder="e.g. Nursing" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-1.5">
                    <Label>Graduation Year</Label>
                    <Input value={newGradYear} onChange={e => setNewGradYear(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" size="sm" className="bg-teal-600 text-white hover:bg-teal-700">
                  Add Degree
                </Button>
              </form>

              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-center border border-border p-4 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{edu.degree} in {edu.field}</h4>
                      <p className="text-xs text-muted-foreground">{edu.school} | Class of {edu.graduationYear}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      await supabase.from("professional_education").delete().eq("id", edu.id);
                      setEducation(prev => prev.filter(x => x.id !== edu.id));
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Licenses & Certifications */}
          {activeTab === "licenses" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm space-y-6">
              <h2 className="text-base font-bold text-foreground">State Licensure & Certifications</h2>
              
              <form onSubmit={handleAddLicense} className="bg-neutral-50/50 p-4 border border-border rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Add Professional License</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>License Type (e.g. NP, RN, MD)</Label>
                    <Input value={newLicType} onChange={e => setNewLicType(e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>License Number</Label>
                    <Input value={newLicNum} onChange={e => setNewLicNum(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Issuing State</Label>
                    <Input value={newLicState} onChange={e => setNewLicState(e.target.value)} placeholder="e.g. TX" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Expiration Date</Label>
                    <Input value={newLicExpires} onChange={e => setNewLicExpires(e.target.value)} placeholder="e.g. 12/2027" />
                  </div>
                </div>
                <Button type="submit" size="sm" className="bg-teal-600 text-white hover:bg-teal-700">
                  Submit License
                </Button>
              </form>

              <div className="space-y-4">
                {licenses.map((lic, idx) => (
                  <div key={idx} className="flex justify-between items-center border border-border p-4 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{lic.type} License - {lic.state}</span>
                        <Badge variant={lic.status === "verified" ? "default" : "outline"} className={cn(
                          lic.status === "verified" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-50 text-neutral-600"
                        )}>
                          {lic.status === "verified" ? "Verified" : "Pending Verification"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Number: {lic.number} | Expires: {lic.expires || "N/A"}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      await supabase.from("professional_licenses").delete().eq("id", lic.id);
                      setLicenses(prev => prev.filter(x => x.id !== lic.id));
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Documents */}
          {activeTab === "documents" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm space-y-6">
              <h2 className="text-base font-bold text-foreground">Résumé & Documents Management</h2>
              
              <form onSubmit={handleAddDocument} className="bg-neutral-50/50 p-4 border border-border rounded-xl space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Document Title</Label>
                    <Input value={newDocName} onChange={e => setNewDocName(e.target.value)} placeholder="e.g. Curriculum Vitae 2026" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Document Type</Label>
                    <Select value={newDocType} onValueChange={setNewDocType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resume">Primary Résumé</SelectItem>
                        <SelectItem value="license">State License Doc</SelectItem>
                        <SelectItem value="certification">ACLS/CPR Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="workforce-doc-file">File</Label>
                  <Input id="workforce-doc-file" type="file" accept=".pdf,.doc,.docx,image/png,image/jpeg" />
                  <p className="text-[10px] text-muted-foreground">Uploads go to private storage. Verification stays pending until Novalyte reviews the file.</p>
                </div>
                <Button type="submit" disabled={uploadingDoc} className="bg-teal-600 text-white hover:bg-teal-700">
                  {uploadingDoc ? "Uploading..." : "Upload Document"}
                </Button>
              </form>

              <div className="space-y-4">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex justify-between items-center border border-border p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-teal-600" />
                      <div>
                        <span className="font-semibold text-sm text-foreground">{doc.name}</span>
                        <p className="text-xs text-muted-foreground capitalize">
                          Type: {doc.type} | Upload: {doc.upload_status || doc.status} | Verification: {doc.verification_status || "pending"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      await supabase.from("professional_documents").delete().eq("id", doc.id);
                      setDocuments(prev => prev.filter(x => x.id !== doc.id));
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Job Alerts */}
          {activeTab === "alerts" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm space-y-6">
              <h2 className="text-base font-bold text-foreground">Configure Job Alerts</h2>
              
              <form onSubmit={handleAddAlert} className="bg-neutral-50/50 p-4 border border-border rounded-xl space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-1.5">
                    <Label>Alert Rule Name</Label>
                    <Input value={newAlertName} onChange={e => setNewAlertName(e.target.value)} placeholder="e.g. NP roles in Texas" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Preferred Position Title</Label>
                    <Input value={newAlertTitle} onChange={e => setNewAlertTitle(e.target.value)} placeholder="e.g. Nurse Practitioner" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Preferred State</Label>
                    <Input value={newAlertState} onChange={e => setNewAlertState(e.target.value)} placeholder="e.g. TX" />
                  </div>
                </div>
                <Button type="submit" className="bg-teal-600 text-white hover:bg-teal-700">
                  Create Alert Rule
                </Button>
              </form>

              <div className="space-y-4">
                {alerts.map((a, idx) => (
                  <div key={idx} className="flex justify-between items-center border border-border p-4 rounded-xl">
                    <div>
                      <span className="font-semibold text-sm text-foreground">{a.name}</span>
                      <p className="text-xs text-muted-foreground">Title: {a.title || "Any"} | State: {a.state || "Any"}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      await supabase.from("professional_job_alerts").delete().eq("id", a.id);
                      setAlerts(prev => prev.filter(x => x.id !== a.id));
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Recommended Jobs (Matching Engine explanation) */}
          {activeTab === "recommendations" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Recommended Jobs</h2>
                <Button onClick={triggerMatching} size="sm" variant="outline">Rematch</Button>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-10">
                  <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No matches generated yet. Run the match engine!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {matches.map((m) => {
                    const matchedJob = jobs.find(j => j.id === m.jobId);
                    if (!matchedJob) return null;
                    return (
                      <div key={m.id} className="border border-border p-5 rounded-2xl space-y-4 bg-card">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-700/10">
                              {m.score}% Compatibility ({m.level})
                            </span>
                            <h3 className="mt-2 font-bold text-base text-foreground">{matchedJob.title}</h3>
                            <p className="text-xs text-muted-foreground font-semibold">{matchedJob.clinicName} | {matchedJob.city}, {matchedJob.state}</p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-teal-600 text-white hover:bg-teal-700"
                            onClick={() => navigate("job-detail", undefined, { id: matchedJob.id })}
                          >
                            View Job Detail
                          </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-lg bg-neutral-50/50 p-3 border border-border/40">
                            <h4 className="text-xs font-bold text-emerald-800">✓ Strong Match Criteria</h4>
                            <p className="mt-1 text-xs text-muted-foreground font-medium">{m.matchedCriteria || "None listed."}</p>
                          </div>
                          <div className="rounded-lg bg-neutral-50/50 p-3 border border-border/40">
                            <h4 className="text-xs font-bold text-amber-800">⚠ Potential Gaps</h4>
                            <p className="mt-1 text-xs text-muted-foreground font-medium">{m.missingCriteria || "None listed."}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Applications */}
          {activeTab === "applications" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm space-y-6">
              <h2 className="text-base font-bold text-foreground">Your Active Applications</h2>
              {applications.length === 0 ? (
                <p className="text-xs text-muted-foreground">You haven't submitted any job applications yet.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="border border-border p-4 rounded-xl flex justify-between items-center bg-card">
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">{app.JobPosting?.title}</h3>
                        <p className="text-xs text-muted-foreground">{app.JobPosting?.clinicName}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Submitted on {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge className="bg-teal-50 text-teal-700 border border-teal-200 capitalize">
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Notifications */}
          {activeTab === "notifications" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm space-y-6">
              <h2 className="text-base font-bold text-foreground">Notification Feed</h2>
              {notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground">You are all caught up!</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex justify-between items-start border border-border p-4 rounded-xl bg-card">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{n.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => dismissNotification(n.id)}>
                        Dismiss
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
