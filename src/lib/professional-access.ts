import "server-only";

import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  WorkforceAuthError,
  getAuthenticatedUser,
  getBearerToken,
  hasAccountType,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

export type ProfessionalAccessStatus =
  | "auth_unverified"
  | "onboarding_not_started"
  | "onboarding_in_progress"
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended";

export type ProfessionalAccess = {
  user: User;
  status: ProfessionalAccessStatus;
  profileId: string | null;
  onboardingStep: number | null;
  redirectTo: string;
};

export class ProfessionalAuthError extends WorkforceAuthError {}

export { getBearerToken, workforceAuthErrorResponse as professionalAuthErrorResponse };

export async function getAuthenticatedProfessionalUser(request: Request): Promise<User> {
  const user = await getAuthenticatedUser(request);
  // Prefer protected app_metadata; allow onboarding path before grant completes.
  const hasProfessionalClaim = hasAccountType(user, "professional");
  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("workforce_professional_profiles")
    .select("id")
    .eq("userId", user.id)
    .maybeSingle();
  const { data: draft } = await admin
    .from("professional_onboarding_drafts")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!hasProfessionalClaim && !profile && !draft) {
    // First-time professional gateway users may not have app_metadata yet.
    // Do not authorize from user_metadata.role.
  }

  return user;
}

export async function resolveProfessionalAccess(request: Request): Promise<ProfessionalAccess> {
  const user = await getAuthenticatedProfessionalUser(request);
  if (!user.email_confirmed_at) {
    return {
      user,
      status: "auth_unverified",
      profileId: null,
      onboardingStep: null,
      redirectTo: "/workforce/professional/verification-pending",
    };
  }

  const admin = getSupabaseAdmin();
  const [{ data: profile, error: profileError }, { data: draft, error: draftError }] =
    await Promise.all([
      admin
        .from("workforce_professional_profiles")
        .select("id, review_status, onboarding_completed_at")
        .eq("userId", user.id)
        .maybeSingle(),
      admin
        .from("professional_onboarding_drafts")
        .select("current_step")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (profileError || draftError) {
    console.error("Unable to resolve professional access", profileError ?? draftError);
    throw new Error("Unable to resolve professional account status.");
  }

  if (!profile) {
    return {
      user,
      status: draft ? "onboarding_in_progress" : "onboarding_not_started",
      profileId: null,
      onboardingStep: draft?.current_step ?? null,
      redirectTo: "/workforce/professional/onboarding",
    };
  }

  if (!profile.onboarding_completed_at) {
    return {
      user,
      status: "onboarding_in_progress",
      profileId: profile.id,
      onboardingStep: draft?.current_step ?? 0,
      redirectTo: "/workforce/professional/onboarding",
    };
  }

  const reviewStatus = (profile.review_status ?? "pending_review") as
    | "pending_review"
    | "approved"
    | "rejected"
    | "suspended";

  return {
    user,
    status: reviewStatus,
    profileId: profile.id,
    onboardingStep: null,
    redirectTo:
      reviewStatus === "rejected" || reviewStatus === "suspended"
        ? "/workforce/professional/account-status"
        : "/workforce/professional/dashboard",
  };
}
