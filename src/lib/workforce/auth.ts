import "server-only";

import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type WorkforceAccountType =
  | "professional"
  | "employer"
  | "admin"
  | "professional_reviewer"
  | "organization_reviewer";

export class WorkforceAuthError extends Error {
  constructor(message: string, public readonly statusCode = 401) {
    super(message);
  }
}

export function getBearerToken(request: Request): string {
  const authorization = request.headers.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new WorkforceAuthError("Authentication is required.");
  }
  return token;
}

export async function getAuthenticatedUser(request: Request): Promise<User> {
  const token = getBearerToken(request);
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user) {
    throw new WorkforceAuthError("Your session is invalid or has expired.");
  }
  return data.user;
}

export function getAccountTypes(user: User): WorkforceAccountType[] {
  const raw = user.app_metadata?.account_types;
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is WorkforceAccountType => typeof value === "string");
}

export function hasAccountType(user: User, type: WorkforceAccountType): boolean {
  return getAccountTypes(user).includes(type);
}

export async function grantAccountType(userId: string, type: WorkforceAccountType): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) throw new Error(error?.message ?? "Unable to load user for account type grant.");

  const existing = Array.isArray(data.user.app_metadata?.account_types)
    ? data.user.app_metadata.account_types.filter((value: unknown): value is string => typeof value === "string")
    : [];
  if (!existing.includes(type)) existing.push(type);

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...data.user.app_metadata,
      account_types: existing,
    },
  });
  if (updateError) throw updateError;

  // Keep legacy profiles.role non-authoritative but compatible.
  if (type === "professional" || type === "employer") {
    await admin.from("profiles").update({ role: type, updatedAt: new Date().toISOString() }).eq("id", userId);
  }
}

export async function requireVerifiedUser(request: Request): Promise<User> {
  const user = await getAuthenticatedUser(request);
  if (!user.email_confirmed_at) {
    throw new WorkforceAuthError("Confirm your email before continuing.", 403);
  }
  return user;
}

export function workforceAuthErrorResponse(error: unknown): Response | null {
  if (error instanceof WorkforceAuthError) {
    return Response.json({ error: error.message }, { status: error.statusCode });
  }
  return null;
}

export type OrgMembership = {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "recruiter" | "viewer";
  status: string;
};

export async function getActiveMemberships(userId: string): Promise<OrgMembership[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("organization_memberships")
    .select("id, organization_id, user_id, role, status")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) throw error;
  return (data ?? []) as OrgMembership[];
}

export async function requireOrgRole(
  userId: string,
  organizationId: string,
  roles: Array<OrgMembership["role"]>
): Promise<OrgMembership> {
  const { data, error } = await getSupabaseAdmin()
    .from("organization_memberships")
    .select("id, organization_id, user_id, role, status")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  if (!data || !roles.includes(data.role as OrgMembership["role"])) {
    throw new WorkforceAuthError("You do not have permission for this organization.", 403);
  }
  return data as OrgMembership;
}
