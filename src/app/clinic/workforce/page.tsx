"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { toast } from "sonner";
import { Briefcase, Loader2, Plus, Users } from "lucide-react";

type Job = { id: string; title: string; status: string; city: string; state: string; employmentType: string };

export default function ClinicWorkforcePage() {
  const { loading, status, authHeaders, contextLabel } = useClinicPortalSession({ requireActive: true });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    employmentType: "full-time",
    city: "",
    state: "",
    description: "",
  });

  async function loadJobs() {
    if (!authHeaders) return;
    setJobsLoading(true);
    try {
      const res = await fetch("/api/workforce/employer/jobs", { headers: authHeaders });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Unable to load jobs");
      setJobs(payload.jobs ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load jobs");
    } finally {
      setJobsLoading(false);
    }
  }

  useEffect(() => {
    if (authHeaders) loadJobs();
  }, [authHeaders]);

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    if (!authHeaders || !status?.organization?.id) return;
    setCreating(true);
    try {
      const res = await fetch("/api/workforce/employer/jobs", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          organizationId: status.organization.id,
          ...jobForm,
          status: "open",
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Unable to create job");
      toast.success("Role published.");
      setJobForm({ title: "", employmentType: "full-time", city: "", state: "", description: "" });
      await loadJobs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create job");
    } finally {
      setCreating(false);
    }
  }

  return (
    <ClinicPortalShell active="workforce" contextLabel={contextLabel}>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Briefcase className="h-5 w-5 text-teal-700" /> Workforce
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Post clinical and operational roles. Candidates apply through Novalyte Workforce.
          </p>
        </div>

        {loading || jobsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <>
            <section className="space-y-4 rounded-2xl border p-5">
              <h2 className="flex items-center gap-2 font-semibold">
                <Plus className="h-4 w-4" /> Post a role
              </h2>
              <form onSubmit={createJob} className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label>Title</Label>
                  <Input
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Employment type</Label>
                  <Select
                    value={jobForm.employmentType}
                    onValueChange={(v) => setJobForm({ ...jobForm, employmentType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["full-time", "part-time", "contract", "per-diem"].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>City</Label>
                  <Input
                    value={jobForm.city}
                    onChange={(e) => setJobForm({ ...jobForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>State</Label>
                  <Input
                    value={jobForm.state}
                    onChange={(e) => setJobForm({ ...jobForm, state: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={4}
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-teal-600 text-white hover:bg-teal-700 sm:col-span-2"
                >
                  {creating ? "Publishing..." : "Publish role"}
                </Button>
              </form>
            </section>

            <section className="space-y-3 rounded-2xl border p-5">
              <h2 className="font-semibold">Your roles</h2>
              {!jobs.length && <p className="text-sm text-muted-foreground">No roles posted yet.</p>}
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.city}, {job.state} · {job.employmentType} · {job.status}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/clinic/workforce?jobId=${job.id}`}>
                      <Users className="mr-1.5 h-3.5 w-3.5" />
                      Applicants
                    </Link>
                  </Button>
                </div>
              ))}
            </section>

            <WorkforceApplicantsPanel authHeaders={authHeaders} />
          </>
        )}
      </div>
    </ClinicPortalShell>
  );
}

function WorkforceApplicantsPanel({
  authHeaders,
}: {
  authHeaders: Record<string, string> | null;
}) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<
    Array<{ id: string; applicantName: string; status: string; createdAt: string; coverNote: string | null }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = new URLSearchParams(window.location.search).get("jobId");
    setJobId(id);
  }, []);

  useEffect(() => {
    async function loadApplicants() {
      if (!authHeaders || !jobId) {
        setApplicants([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/workforce/employer/jobs/${jobId}/applicants`, { headers: authHeaders });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Unable to load applicants");
        setApplicants(payload.applicants ?? []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load applicants");
      } finally {
        setLoading(false);
      }
    }
    loadApplicants();
  }, [authHeaders, jobId]);

  if (!jobId) return null;

  return (
    <section className="space-y-3 rounded-2xl border border-teal-100 bg-teal-50/30 p-5">
      <h2 className="font-semibold text-teal-900">Applicants</h2>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading applicants...
        </div>
      ) : !applicants.length ? (
        <p className="text-sm text-muted-foreground">No applicants yet for this role.</p>
      ) : (
        applicants.map((a) => (
          <div key={a.id} className="rounded-xl border bg-white p-3 text-sm">
            <p className="font-medium">{a.applicantName}</p>
            <p className="text-xs capitalize text-muted-foreground">{a.status}</p>
            {a.coverNote ? <p className="mt-2 text-xs">{a.coverNote}</p> : null}
          </div>
        ))
      )}
    </section>
  );
}
