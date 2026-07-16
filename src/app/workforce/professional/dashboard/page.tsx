"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WorkforceDashboardView } from "@/components/views/workforce-dashboard-view";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { fetchProfessionalStatus } from "@/lib/professional-client";

export default function ProfessionalDashboardPage() {
  const supabaseClient = getSupabaseClient();
  const [session, setSession] = useState<any>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"pending_review" | "approved" | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessionAndProfile() {
      try {
        setLoading(true);
        // Get active auth session
        const { data: { session: activeSession }, error: authErr } = await supabaseClient.auth.getSession();
        
        if (authErr || !activeSession) {
          // Unauthenticated -> redirect to sign-in page
          window.location.href = "/workforce/professional/sign-in";
          return;
        }

        setSession(activeSession);

        const status = await fetchProfessionalStatus(activeSession.access_token);
        if (status.status !== "pending_review" && status.status !== "approved") {
          if (status.status === "onboarding_not_started" || status.status === "onboarding_in_progress") {
            toast.info("Please complete your professional onboarding to access the dashboard.");
          }
          window.location.replace(status.redirectTo);
          return;
        }
        setProfileId(status.profileId);
        setReviewStatus(status.status);
      } catch (err) {
        setErrorState("An error occurred loading your dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadSessionAndProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header onGetStarted={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm font-medium text-muted-foreground">Verifying secure session...</p>
        </div>
        <Footer onNewsletter={async () => {}} />
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header onGetStarted={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 px-4 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <h2 className="text-xl font-bold text-foreground">Error Loading Dashboard</h2>
          <p className="text-sm text-muted-foreground max-w-md">{errorState}</p>
          <Button onClick={() => window.location.reload()} className="bg-teal-600 text-white hover:bg-teal-700">
            Retry
          </Button>
        </div>
        <Footer onNewsletter={async () => {}} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => {}} />
      <main className="flex-1">
        {reviewStatus === "pending_review" && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
            <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm">
              <Clock3 className="h-4 w-4 shrink-0" />
              <span><strong>Profile submitted.</strong> Novalyte is reviewing your professional information. Email verification does not imply profile approval.</span>
            </div>
          </div>
        )}
        {profileId && <WorkforceDashboardView profileId={profileId} />}
      </main>
      <Footer onNewsletter={async () => {}} />
    </div>
  );
}
