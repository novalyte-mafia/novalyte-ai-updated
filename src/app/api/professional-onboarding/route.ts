import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAuthenticatedProfessionalUser,
  professionalAuthErrorResponse,
} from "@/lib/professional-access";
import { sendProfessionalSlackNotification } from "@/lib/professional-notifications";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { captureServerEvent } from "@/lib/posthog-server";
import { grantAccountType } from "@/lib/workforce/auth";

const draftSchema = z.object({
  currentStep: z.number().int().min(0).max(9),
  data: z.record(z.string(), z.unknown()),
});

const finalSchema = z.object({
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  professionalTitle: z.string().trim().min(1).max(200),
  bio: z.string().max(5000).optional().default(""),
  city: z.string().trim().max(120).optional().default(""),
  state: z.string().trim().min(1).max(120),
  yearsExperience: z.string().max(40).optional().default(""),
  linkedinUrl: z.string().max(1000).optional().default(""),
  websiteUrl: z.string().max(1000).optional().default(""),
  portfolioUrl: z.string().max(1000).optional().default(""),
  employmentHistory: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  education: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  licenses: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  specialties: z.array(z.string().max(120)).optional().default([]),
  employmentPreference: z.array(z.string().max(80)).optional().default([]),
  workArrangements: z.array(z.string().max(80)).optional().default([]),
  relocationPreference: z.union([z.boolean(), z.string()]).optional().default(false),
  telehealthAvailability: z.boolean().optional().default(false),
  visibilitySettings: z.record(z.string(), z.unknown()).optional().default({}),
});

function requireVerifiedUser(user: Awaited<ReturnType<typeof getAuthenticatedProfessionalUser>>) {
  if (!user.email_confirmed_at) {
    throw new Response(JSON.stringify({ error: "Confirm your email before starting onboarding." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function experienceYears(value: string): number {
  if (value.startsWith("1–2")) return 1;
  if (value.startsWith("3–5")) return 3;
  if (value.startsWith("5–10")) return 5;
  if (value.startsWith("10+")) return 10;
  return 0;
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedProfessionalUser(request);
    requireVerifiedUser(user);
    const { data, error } = await getSupabaseAdmin()
      .from("professional_onboarding_drafts")
      .select("current_step, data")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({
      currentStep: data?.current_step ?? 0,
      data: { ...(data?.data ?? {}), email: user.email ?? "" },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    const authResponse = professionalAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Professional onboarding draft read failed", error);
    return NextResponse.json({ error: "Unable to load onboarding progress." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedProfessionalUser(request);
    requireVerifiedUser(user);
    const parsed = draftSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid onboarding progress." }, { status: 400 });
    }

    const safeData: Record<string, unknown> = { ...parsed.data.data, email: user.email ?? "" };
    delete safeData.password;
    delete safeData.userId;

    const { error } = await getSupabaseAdmin().from("professional_onboarding_drafts").upsert(
      {
        user_id: user.id,
        current_step: parsed.data.currentStep,
        data: safeData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    const authResponse = professionalAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Professional onboarding draft save failed", error);
    return NextResponse.json({ error: "Unable to save onboarding progress." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedProfessionalUser(request);
    requireVerifiedUser(user);
    const parsed = finalSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid onboarding information.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;
    const email = user.email?.trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Your authenticated account has no email." }, { status: 400 });

    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    const name = `${d.firstName} ${d.lastName}`.trim();
    const relocate = d.relocationPreference === true || d.relocationPreference === "Yes";

    const { error: applicationError } = await admin
      .from("workforce_professional_applications")
      .upsert(
        {
          user_id: user.id,
          first_name: d.firstName,
          last_name: d.lastName,
          email,
          phone: d.phone,
          professional_title: d.professionalTitle,
          bio: d.bio || null,
          state_or_location: [d.city, d.state].filter(Boolean).join(", "),
          linkedin_url: d.linkedinUrl || null,
          employment_history: d.employmentHistory,
          education: d.education,
          licenses: d.licenses,
          specialties: d.specialties,
          employment_preference: d.employmentPreference,
          work_arrangement: d.workArrangements.join(", ") || null,
          relocation_preference: relocate,
          telehealth_availability: d.telehealthAvailability,
          visibility_settings: d.visibilitySettings,
          application_status: "submitted",
          updated_at: now,
        },
        { onConflict: "user_id" }
      );
    if (applicationError) throw applicationError;

    const { data: profile, error: profileError } = await admin
      .from("workforce_professional_profiles")
      .upsert(
        {
          userId: user.id,
          name,
          title: d.professionalTitle,
          city: d.city,
          state: d.state,
          email,
          phone: d.phone,
          bio: d.bio || null,
          category: d.specialties.length ? "Clinical Care" : "Healthcare Operations",
          specialty: d.specialties[0] ?? null,
          experience: experienceYears(d.yearsExperience),
          availability: "open",
          relocate,
          status: "onboarding_in_progress",
          review_status: "pending_review",
          visibility_status: "private",
          onboarding_completed_at: null,
          updatedAt: now,
        },
        { onConflict: "userId" }
      )
      .select("id")
      .single();
    if (profileError || !profile) throw profileError ?? new Error("Unable to create professional profile.");

    const profileId = profile.id;
    const childTables = [
      "professional_social_links",
      "professional_employment_history",
      "professional_education",
      "professional_licenses",
      "professional_preferences",
      "notification_preferences",
    ];
    for (const table of childTables) {
      const { error } = await admin.from(table).delete().eq("profileId", profileId);
      if (error) throw error;
    }

    const inserts: Array<PromiseLike<{ error: unknown }>> = [];
    inserts.push(
      admin.from("professional_social_links").insert({
        profileId,
        linkedin: d.linkedinUrl || null,
        website: d.websiteUrl || null,
        portfolio: d.portfolioUrl || null,
        visibility: "visible_to_verified_employers",
      }),
      admin.from("professional_preferences").insert({
        profileId,
        empTypes: d.employmentPreference.join(", "),
        workArrangement: d.workArrangements.join(", "),
        telehealth: d.telehealthAvailability,
        minSalary: null,
      }),
      admin.from("notification_preferences").insert({ profileId, matches: "in_app", applications: "in_app", interests: "in_app" })
    );

    const employmentRows = d.employmentHistory
      .map((item, index) => ({
        profileId,
        employer: text(item.org) || text(item.employer),
        position: text(item.title) || text(item.position),
        startDate: text(item.start) || text(item.startDate),
        endDate: text(item.end) || text(item.endDate) || null,
        current: item.current === true || item.current === "true",
        description: text(item.responsibilities) || text(item.description) || null,
        sortOrder: index,
      }))
      .filter((item) => item.employer && item.position && item.startDate);
    if (employmentRows.length) inserts.push(admin.from("professional_employment_history").insert(employmentRows));

    const educationRows = d.education
      .map((item) => ({
        profileId,
        school: text(item.institution) || text(item.school),
        degree: text(item.degree),
        field: text(item.field),
        graduationYear: text(item.gradDate) || text(item.graduationYear) || null,
      }))
      .filter((item) => item.school && item.degree && item.field);
    if (educationRows.length) inserts.push(admin.from("professional_education").insert(educationRows));

    const licenseRows = d.licenses
      .map((item) => ({
        profileId,
        type: text(item.type),
        number: text(item.number),
        state: text(item.state),
        expires: text(item.expiryDate) || text(item.expires) || null,
        status: "pending",
      }))
      .filter((item) => item.type && item.number && item.state);
    if (licenseRows.length) inserts.push(admin.from("professional_licenses").insert(licenseRows));

    const results = await Promise.all(inserts);
    const childError = results.find((result) => result.error)?.error;
    if (childError) throw childError;

    const { error: completeError } = await admin
      .from("workforce_professional_profiles")
      .update({ status: "pending_review", review_status: "pending_review", onboarding_completed_at: now, updatedAt: now })
      .eq("id", profileId)
      .eq("userId", user.id);
    if (completeError) throw completeError;

    await admin.from("professional_onboarding_drafts").delete().eq("user_id", user.id);
    await grantAccountType(user.id, "professional");

    const notificationDelivery = await sendProfessionalSlackNotification({
      userId: user.id,
      profileId,
      eventKey: "onboarding_completed",
      text: `👤 *Professional onboarding completed*\n*Name:* ${name}\n*Title:* ${d.professionalTitle}\n*Location:* ${[d.city, d.state].filter(Boolean).join(", ")}\n*Email:* ${email}\n*Status:* Pending review`,
    });

    await captureServerEvent({
      distinctId: user.id,
      event: "professional_onboarding_completed",
      properties: {
        review_status: "pending_review",
        specialty_count: d.specialties.length,
        employment_history_count: employmentRows.length,
        education_count: educationRows.length,
        license_count: licenseRows.length,
      },
    });

    return NextResponse.json({ ok: true, profileId, status: "pending_review", notificationDelivery });
  } catch (error) {
    if (error instanceof Response) return error;
    const authResponse = professionalAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Professional onboarding submission failed", error);
    return NextResponse.json({ error: "Unable to complete professional onboarding." }, { status: 500 });
  }
}
