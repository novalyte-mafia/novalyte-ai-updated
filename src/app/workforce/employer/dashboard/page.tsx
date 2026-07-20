"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { WorkspaceShell } from "@/components/site/workspace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Loader2, Plus, Briefcase } from "lucide-react";

type Org = {
  id: string;
  legal_name: string;
  public_name: string | null;
  verification_status: string;
  lifecycle_status: string;
};

type Job = {
  id: string;
  title: string;
  status: string;
  city: string;
  state: string;
  employmentType: string;
};

type Applicant = {
  id: string;
  applicantName: string;
  status: string;
  coverNote: string | null;
  createdAt: string;
};

export default function EmployerDashboardPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [token, setToken] = useState<string | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    employmentType: "full-time",
    city: "",
    state: "",
    description: "",
  });

  async function authHeaders() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      window.location.replace("/workforce/employer/sign-in");
      return null;
    }
    setToken(data.session.access_token);
    return {
      Authorization: `Bearer ${data.session.access_token}`,
      "Content-Type": "application/json",
    };
  }

  async function refresh() {
    const headers = await authHeaders();
    if (!headers) return;
    setLoading(true);
    try {
      const statusRes = await fetch("/api/workforce/employer/status", { headers });
      const status = await statusRes.json();
      if (!statusRes.ok) throw new Error(status.error || "Unable to load status");
      if (status.status === "onboarding_required") {
        window.location.replace("/workforce/employer/onboarding");
        return;
      }
      setOrg(status.organization);
      const jobsRes = await fetch("/api/workforce/employer/jobs", { headers });
      const jobsPayload = await jobsRes.json();
      if (!jobsRes.ok) throw new Error(jobsPayload.error || "Unable to load jobs");
      setJobs(jobsPayload.jobs ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    const headers = await authHeaders();
    if (!headers) return;
    setCreating(true);
    try {
      const res = await fetch("/api/workforce/employer/jobs", {
        method: "POST",
        headers,
        body: JSON.stringify({
          organizationId: org.id,
          ...jobForm,
          status: "open",
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Unable to create job");
      toast.success("Job published.");
      setJobForm({ title: "", employmentType: "full-time", city: "", state: "", description: "" });
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create job");
    } finally {
      setCreating(false);
    }
  }

  async function loadApplicants(jobId: string) {
    const headers = await authHeaders();
    if (!headers) return;
    setSelectedJobId(jobId);
    const res = await fetch(`/api/workforce/employer/jobs/${jobId}/applicants`, { headers });
    const payload = await res.json();
    if (!res.ok) {
      toast.error(payload.error || "Unable to load applicants");
      return;
    }
    setApplicants(payload.applicants ?? []);
  }

  async function updateApplicantStatus(applicationId: string, status: string) {
    const headers = await authHeaders();
    if (!headers) return;
    const res = await fetch(`/api/workforce/employer/applications/${applicationId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    const payload = await res.json();
    if (!res.ok) {
      toast.error(payload.error || "Unable to update applicant");
      return;
    }
    setApplicants((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status } : a)));
    toast.success("Applicant status updated.");
  }

  const contextLabel = org?.public_name || org?.legal_name || undefined;
  const shellNav = [
    { label: "Dashboard", href: "/workforce/employer/dashboard", active: true },
  ];

  if (loading) {
    return (
      <WorkspaceShell role="employer" navItems={shellNav} signOutRedirect="/workforce/employer/sign-in">
        <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading employer dashboard...
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      role="employer"
      contextLabel={contextLabel}
      navItems={shellNav}
      signOutRedirect="/workforce/employer/sign-in"
    >
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            <Building2 className="h-4 w-4" /> Employer dashboard
          </div>
          <h1 className="mt-2 text-2xl font-semibold">{org?.public_name || org?.legal_name || "Organization"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verification: {org?.verification_status ?? "unknown"} · Lifecycle: {org?.lifecycle_status ?? "unknown"}
          </p>
        </div>
        <Button variant="outline" onClick={() => refresh()}>Refresh</Button>
      </div>

      <section className="rounded-2xl border p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Post a role</h2>
        <form onSubmit={createJob} className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Title</Label>
            <Input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} required />
          </div>
          <div className="grid gap-1.5">
            <Label>Employment type</Label>
            <Select value={jobForm.employmentType} onValueChange={(v) => setJobForm({ ...jobForm, employmentType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["full-time", "part-time", "contract", "per-diem"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>City</Label>
            <Input value={jobForm.city} onChange={(e) => setJobForm({ ...jobForm, city: e.target.value })} required />
          </div>
          <div className="grid gap-1.5">
            <Label>State</Label>
            <Input value={jobForm.state} onChange={(e) => setJobForm({ ...jobForm, state: e.target.value })} required />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea rows={4} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} required />
          </div>
          <Button type="submit" disabled={creating || !token} className="bg-emerald-600 text-white hover:bg-emerald-700 sm:col-span-2">
            {creating ? "Publishing..." : "Publish job"}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Briefcase className="h-4 w-4" /> Your jobs</h2>
        {!jobs.length && <p className="text-sm text-muted-foreground">No jobs yet.</p>}
        <div className="space-y-2">
          {jobs.map((job) => (
            <div key={job.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
              <div>
                <p className="font-medium text-sm">{job.title}</p>
                <p className="text-xs text-muted-foreground">{job.city}, {job.state} · {job.employmentType} · {job.status}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => loadApplicants(job.id)}>View applicants</Button>
            </div>
          ))}
        </div>
      </section>

      {selectedJobId && (
        <section className="rounded-2xl border p-5 space-y-4">
          <h2 className="font-semibold">Applicants</h2>
          {!applicants.length && <p className="text-sm text-muted-foreground">No applicants yet.</p>}
          {applicants.map((a) => (
            <div key={a.id} className="rounded-xl border p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{a.applicantName}</p>
                  <p className="text-xs text-muted-foreground">Status: {a.status}</p>
                </div>
                <Select value={a.status} onValueChange={(v) => updateApplicantStatus(a.id, v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["submitted", "reviewed", "interview", "offered", "hired", "rejected"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {a.coverNote && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{a.coverNote}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
    </WorkspaceShell>
  );
}
