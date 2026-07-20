"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { EmployerOnboarding } from "@/components/views/employer-onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { PUBLIC_SITE_URL } from "@/lib/clinic-portal";

type ClaimCandidate = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  slug: string | null;
  claimStatus: string | null;
};

export default function ClinicOnboardingPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [checking, setChecking] = useState(true);
  const [needsOrg, setNeedsOrg] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClaimCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.replace("/clinic/sign-in");
        return;
      }
      setToken(data.session.access_token);
      const res = await fetch("/api/clinic/status", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload.status === "active") {
        window.location.replace("/clinic/dashboard");
        return;
      }
      if (res.ok && payload.organization) {
        setNeedsOrg(false);
        setOrganizationId(payload.organization.id);
      }
      setChecking(false);
    }
    run();
  }, [supabase]);

  async function searchClinics() {
    if (!query.trim() || !token) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/clinic/claim-search?q=${encodeURIComponent(query.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Search failed");
      setResults(payload.clinics ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  async function claimClinic(clinicId: string) {
    if (!token || !organizationId) {
      toast.error("Organization required before claiming.");
      return;
    }
    setClaimingId(clinicId);
    try {
      const res = await fetch(`/api/clinics/${clinicId}/claim`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          authorized: true,
          notes: "Submitted from clinic portal onboarding",
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Claim failed");
      toast.success(payload.message || "Claim submitted for Novalyte review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit claim.");
    } finally {
      setClaimingId(null);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Preparing clinic onboarding...
      </div>
    );
  }

  return (
    <ClinicPortalShell active="dashboard" contextLabel="Onboarding">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Clinic portal onboarding</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your organization account, then claim your directory clinic so Novalyte can push verified leads
            into this portal.
          </p>
        </div>

        {needsOrg ? (
          <EmployerOnboarding />
        ) : (
          <div className="space-y-6 rounded-2xl border p-6">
            <div>
              <h2 className="font-semibold">Claim your clinic</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Search the directory and submit a claim. Novalyte ops must approve before your listing is linked —
                clinics never self-publish.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="clinic-search">Clinic name</Label>
                <Input
                  id="clinic-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Summit Men’s Health"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      searchClinics();
                    }
                  }}
                />
              </div>
              <Button
                className="mt-auto bg-teal-600 text-white hover:bg-teal-700"
                onClick={searchClinics}
                disabled={searching}
              >
                {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </div>

            <ul className="space-y-2">
              {results.map((clinic) => (
                <li
                  key={clinic.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{clinic.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[clinic.city, clinic.state].filter(Boolean).join(", ") || "Location TBD"}
                      {clinic.claimStatus ? ` · ${clinic.claimStatus}` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => claimClinic(clinic.id)}
                    disabled={claimingId === clinic.id}
                    className="bg-teal-600 text-white hover:bg-teal-700"
                  >
                    {claimingId === clinic.id ? "Submitting..." : "Claim"}
                  </Button>
                </li>
              ))}
              {!searching && results.length === 0 && query.trim() ? (
                <li className="text-sm text-muted-foreground">No unclaimed clinics matched that name.</li>
              ) : null}
            </ul>

            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button variant="outline" asChild>
                <a href={`${PUBLIC_SITE_URL}/directory`} target="_blank" rel="noreferrer">
                  Open public directory
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast.message("After your claim is approved, refresh the portal.");
                  window.location.assign("/clinic");
                }}
              >
                Check portal status
              </Button>
            </div>
          </div>
        )}
      </div>
    </ClinicPortalShell>
  );
}
