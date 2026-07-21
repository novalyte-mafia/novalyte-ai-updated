import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseSSRClient } from "@/lib/supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type InvestorAccountType =
  | "founder_admin"
  | "investor_pending"
  | "investor_approved"
  | "advisor"
  | "internal_team";

export class InvestorAuthError extends Error {
  constructor(message: string, public readonly statusCode = 401) {
    super(message);
  }
}

function accountTypes(user: User): string[] {
  const raw = user.app_metadata?.account_types;
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is string => typeof v === "string");
}

export function hasInvestorAccountType(user: User, type: InvestorAccountType): boolean {
  return accountTypes(user).includes(type);
}

export async function getInvestorSessionUser(): Promise<User | null> {
  const supabase = await createSupabaseSSRClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function requireInvestorUser(): Promise<User> {
  const user = await getInvestorSessionUser();
  if (!user) throw new InvestorAuthError("Sign in required.");
  if (!user.email_confirmed_at) {
    throw new InvestorAuthError("Confirm your email before continuing.", 403);
  }
  return user;
}

export async function requireFounderAdmin(): Promise<User> {
  const user = await requireInvestorUser();
  if (!hasInvestorAccountType(user, "founder_admin") && !accountTypes(user).includes("admin")) {
    throw new InvestorAuthError("Founder admin access required.", 403);
  }
  return user;
}

export async function requireApprovedInvestor(): Promise<{
  user: User;
  profile: Record<string, unknown>;
}> {
  const user = await requireInvestorUser();
  if (
    !hasInvestorAccountType(user, "investor_approved") &&
    !hasInvestorAccountType(user, "advisor") &&
    !hasInvestorAccountType(user, "internal_team") &&
    !hasInvestorAccountType(user, "founder_admin")
  ) {
    throw new InvestorAuthError("Approved investor access required.", 403);
  }

  const { data: profile, error } = await getSupabaseAdmin()
    .from("investor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;

  if (hasInvestorAccountType(user, "founder_admin")) {
    return {
      user,
      profile: profile ?? {
        user_id: user.id,
        full_name: user.email ?? "Founder",
        work_email: user.email,
        access_status: "approved",
        terms_accepted_at: new Date().toISOString(),
      },
    };
  }

  if (!profile || profile.access_status !== "approved") {
    throw new InvestorAuthError("Investor access has not been approved or was revoked.", 403);
  }

  return { user, profile };
}

export async function requireTermsAccepted(userId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("investor_profiles")
    .select("terms_accepted_at, terms_version")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!profile?.terms_accepted_at) {
    throw new InvestorAuthError("Accept the investor access terms to continue.", 403);
  }
}

export function investorAuthErrorResponse(error: unknown): Response | null {
  if (error instanceof InvestorAuthError) {
    return Response.json({ error: error.message }, { status: error.statusCode });
  }
  return null;
}

export async function logInvestorEvent(input: {
  userId?: string | null;
  profileId?: string | null;
  eventType: string;
  section?: string;
  documentId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await getSupabaseAdmin().from("investor_access_events").insert({
      user_id: input.userId ?? null,
      investor_profile_id: input.profileId ?? null,
      event_type: input.eventType,
      section: input.section ?? null,
      document_id: input.documentId ?? null,
      metadata: input.metadata ?? {},
    });
  } catch (error) {
    console.error("Failed to log investor event", error);
  }
}
