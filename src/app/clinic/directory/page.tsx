"use client";

import { useState } from "react";
import Link from "next/link";
import { ClinicPortalShell } from "@/components/clinic/clinic-portal-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClinicPortalSession } from "@/hooks/use-clinic-portal";
import { PUBLIC_SITE_URL } from "@/lib/clinic-portal";
import { toast } from "sonner";
import { ExternalLink, Globe, Loader2, Send } from "lucide-react";

function publicationLabel(clinic: {
  publishedAt?: string | null;
  publicationStatus?: string | null;
  verificationStatus?: string | null;
}) {
  if (clinic.publicationStatus === "published" && clinic.publishedAt) return "Published on directory";
  if (clinic.verificationStatus === "under_review") return "Under Novalyte review";
  if (clinic.verificationStatus === "verified") return "Verified — awaiting publication";
  return "Not published";
}

export default function ClinicDirectoryPage() {
  const { loading, status, selectedClinic, authHeaders, refresh } = useClinicPortalSession({
    requireActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const previewUrl = selectedClinic?.slug
    ? `${PUBLIC_SITE_URL}/directory/${selectedClinic.slug}`
    : `${PUBLIC_SITE_URL}/directory`;

  async function submitForReview() {
    if (!authHeaders || !selectedClinic) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/clinic/directory/submit", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          clinicId: selectedClinic.id,
          organizationId: status?.organization?.id,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Submit failed");
      toast.success(payload.message || "Submitted for review.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit for review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ClinicPortalShell active="directory" contextLabel={selectedClinic?.name}>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Globe className="h-5 w-5 text-teal-700" /> Directory listing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your public Novalyte directory profile is reviewed before publication. You cannot self-publish.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading directory status...
          </div>
        ) : !selectedClinic ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No linked clinic found. Complete onboarding to claim a directory profile.
          </div>
        ) : (
          <>
            <section className="space-y-4 rounded-2xl border p-5">
              <h2 className="text-sm font-semibold">{selectedClinic.name}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Claim status
                  </p>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {selectedClinic.claimStatus ?? "unknown"}
                  </Badge>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Publication status
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {publicationLabel(selectedClinic)}
                  </Badge>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Verification
                  </p>
                  <p className="mt-1 text-sm capitalize">{selectedClinic.verificationStatus ?? "pending"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Location
                  </p>
                  <p className="mt-1 text-sm">
                    {[selectedClinic.city, selectedClinic.state].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
              </div>
            </section>

            <section className="flex flex-wrap gap-3 rounded-2xl border bg-muted/20 p-5">
              <Button variant="outline" asChild>
                <a href={previewUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview public directory
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/clinic/profile?clinicId=${selectedClinic.id}`}>Edit profile</Link>
              </Button>
              <Button
                className="bg-teal-600 text-white hover:bg-teal-700"
                disabled={submitting || selectedClinic.verificationStatus === "under_review"}
                onClick={submitForReview}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Submit for review
                  </>
                )}
              </Button>
            </section>

            <p className="text-xs text-muted-foreground">
              Submitting sends your profile to Novalyte for review. Publication requires admin approval and does not
              change claim status automatically.
            </p>
          </>
        )}
      </div>
    </ClinicPortalShell>
  );
}
