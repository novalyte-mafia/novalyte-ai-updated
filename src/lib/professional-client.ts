import { getSupabaseClient } from "@/lib/supabase/client";
import type { ProfessionalAccessStatus } from "@/lib/professional-access";
import { captureAnalyticsEvent } from "@/lib/analytics-client";

export type ProfessionalStatusResponse = {
  status: ProfessionalAccessStatus;
  profileId: string | null;
  onboardingStep: number | null;
  redirectTo: string;
};

export async function getProfessionalAccessToken(): Promise<string | null> {
  const { data } = await getSupabaseClient().auth.getSession();
  return data.session?.access_token ?? null;
}

export async function fetchProfessionalStatus(token: string): Promise<ProfessionalStatusResponse> {
  const response = await fetch("/api/professional/status", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to load professional account status.");
  return response.json();
}

export function goToProfessionalAccess(source = "professional_cta"): void {
  captureAnalyticsEvent("professional_profile_cta_clicked", { source });
  window.location.assign("/workforce/professional");
}
