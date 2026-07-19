import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  grantAccountType,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

const schema = z.object({
  currentStep: z.number().int().min(0).max(5),
  data: z.record(z.string(), z.unknown()),
  finalize: z.boolean().optional().default(false),
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function GET(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("employer_onboarding_drafts")
      .select("current_step, data, organization_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({
      currentStep: data?.current_step ?? 0,
      data: data?.data ?? {},
      organizationId: data?.organization_id ?? null,
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Employer onboarding GET failed", error);
    return NextResponse.json({ error: "Unable to load employer onboarding." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid employer onboarding payload." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const safeData = { ...parsed.data.data };
    delete safeData.password;

    const { error: draftError } = await admin.from("employer_onboarding_drafts").upsert(
      {
        user_id: user.id,
        current_step: parsed.data.currentStep,
        data: safeData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (draftError) throw draftError;

    if (!parsed.data.finalize) {
      return NextResponse.json({ ok: true });
    }

    const legalName = String(safeData.legalName ?? "").trim();
    const orgType = String(safeData.orgType ?? "").trim();
    if (!legalName || !orgType) {
      return NextResponse.json({ error: "Organization name and type are required." }, { status: 400 });
    }

    const publicName = String(safeData.publicName ?? legalName).trim() || legalName;
    const baseSlug = slugify(publicName) || `org-${user.id.slice(0, 8)}`;
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const { data: organization, error: orgError } = await admin
      .from("employer_organizations")
      .insert({
        legal_name: legalName,
        public_name: publicName,
        slug,
        org_type: orgType,
        website: String(safeData.website ?? "") || null,
        hq_state: String(safeData.hqState ?? "") || null,
        location_count: Number(safeData.locCount) || null,
        org_size: String(safeData.orgSize ?? "") || null,
        primary_specialty: String(safeData.primarySpecialty ?? "") || null,
        description: String(safeData.orgDescription ?? "") || null,
        verification_status: "pending",
        lifecycle_status: "draft",
        created_by: user.id,
      })
      .select("id")
      .single();
    if (orgError || !organization) throw orgError ?? new Error("Unable to create organization.");

    const { error: membershipError } = await admin.from("organization_memberships").insert({
      organization_id: organization.id,
      user_id: user.id,
      role: "owner",
      status: "active",
      accepted_at: new Date().toISOString(),
    });
    if (membershipError) throw membershipError;

    await admin.from("employer_onboarding_drafts").upsert(
      {
        user_id: user.id,
        current_step: 5,
        data: safeData,
        organization_id: organization.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    await grantAccountType(user.id, "employer");

    return NextResponse.json({ ok: true, organizationId: organization.id, status: "pending_review" });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Employer onboarding POST failed", error);
    return NextResponse.json({ error: "Unable to complete employer onboarding." }, { status: 500 });
  }
}
