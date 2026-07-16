"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WorkforceDashboardView } from "@/components/views/workforce-dashboard-view";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";

export default function ProfessionalDashboardPage() {
  const supabaseClient = getSupabaseClient();
  const [session, setSession] = useState<any>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
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
        posthog.identify(activeSession.user.id);

        // Fetch corresponding professional profile
        const { data: profile, error: profileErr } = await supabaseClient
          .from("workforce_professional_profiles")
          .select("id")
          .eq("userId", activeSession.user.id)
          .single();

        if (profileErr || !profile) {
          // Authenticated but no profile yet -> redirect to onboarding SPA view
          toast.info("Please complete your professional onboarding to access the dashboard.");
          window.location.href = "/?view=professional-onboarding";
          return;
        }

        setProfileId(profile.id);
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
        {profileId && <WorkforceDashboardView profileId={profileId} />}
      </main>
      <Footer onNewsletter={async () => {}} />
    </div>
  );
}
