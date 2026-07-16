import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { getPostHogClient } from "@/lib/posthog-server";

const schema = z.object({
  firstName: z.string().min(1).max(120).optional().nullable(),
  lastName: z.string().min(1).max(120).optional().nullable(),
  name: z.string().max(240).optional().nullable(),
  email: z.string().email().max(160),
  phone: z.string().max(40).optional().nullable(),
  professionalTitle: z.string().max(200).optional().nullable(),
  bio: z.string().optional().nullable(),
  stateOrLocation: z.string().max(120).optional().nullable(),
  resumeUrl: z.string().max(1000).optional().nullable(),
  linkedinUrl: z.string().max(1000).optional().nullable(),
  employmentHistory: z.array(z.any()).optional().nullable(),
  education: z.array(z.any()).optional().nullable(),
  licenses: z.array(z.any()).optional().nullable(),
  specialties: z.array(z.string()).optional().nullable(),
  employmentPreference: z.array(z.string()).optional().nullable(),
  workArrangement: z.string().max(80).optional().nullable(),
  relocationPreference: z.boolean().optional().nullable(),
  telehealthAvailability: z.boolean().optional().nullable(),
  visibilitySettings: z.record(z.string(), z.any()).optional().nullable(),
  applicationStatus: z.enum(["submitted", "under_review", "contacted", "interviewing", "approved", "rejected", "withdrawn"]).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;
    let firstName = d.firstName;
    let lastName = d.lastName;
    
    // Split legacy full name input if provided
    if (!firstName && d.name) {
      const parts = d.name.trim().split(/\s+/);
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || " ";
    }
    
    firstName = firstName || "First";
    lastName = lastName || "Last";

    // Insert into database mapping workforceProfessionalApplication
    const record = await db.workforceProfessionalApplication.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email: d.email.trim().toLowerCase(),
        phone: d.phone ? d.phone.trim() : null,
        professional_title: d.professionalTitle ?? null,
        bio: d.bio ?? null,
        state_or_location: d.stateOrLocation ?? null,
        resume_url: d.resumeUrl ?? null,
        linkedin_url: d.linkedinUrl ?? null,
        employment_history: d.employmentHistory ?? [],
        education: d.education ?? [],
        licenses: d.licenses ?? [],
        specialties: d.specialties ?? [],
        employment_preference: d.employmentPreference ?? [],
        work_arrangement: d.workArrangement ?? null,
        relocation_preference: !!d.relocationPreference,
        telehealth_availability: !!d.telehealthAvailability,
        visibility_settings: d.visibilitySettings ?? {},
        application_status: d.applicationStatus ?? "submitted",
      },
    });

    // Create new normalized professional profile
    const name = `${firstName} ${lastName}`.trim();
    const locParts = (d.stateOrLocation || "").split(",");
    const city = (locParts[0] || "San Francisco").trim();
    const state = (locParts[1] || "CA").trim();

    const profProfile = await db.workforceProfessionalProfile.create({
      data: {
        name,
        title: d.professionalTitle || "Healthcare Professional",
        city,
        state,
        email: d.email.trim().toLowerCase(),
        phone: d.phone ? d.phone.trim() : null,
        bio: d.bio ?? null,
        category: d.specialties && d.specialties[0] ? "Clinical Care" : "Allied Health",
        specialty: d.specialties && d.specialties[0] ? d.specialties[0] : null,
        experience: 5,
        availability: "open",
        relocate: !!d.relocationPreference,
        status: "profile_published",
      },
    });

    // Social links
    await db.professionalSocialLink.create({
      data: {
        profileId: profProfile.id,
        linkedin: d.linkedinUrl ?? "",
        visibility: "visible_to_verified_employers",
      },
    });

    // Preferences
    await db.professionalPreference.create({
      data: {
        profileId: profProfile.id,
        empTypes: (d.employmentPreference || []).join(","),
        workArrangement: d.workArrangement || "onsite",
        telehealth: !!d.telehealthAvailability,
        minSalary: 85000,
      },
    });

    // Notification Preferences
    await db.notificationPreference.create({
      data: {
        profileId: profProfile.id,
        matches: "in_app",
        applications: "in_app",
        interests: "in_app",
      },
    });

    // Add list items
    if (d.employmentHistory && Array.isArray(d.employmentHistory)) {
      for (const item of d.employmentHistory) {
        await db.professionalEmploymentHistory.create({
          data: {
            profileId: profProfile.id,
            employer: item.company || item.employer || "Clinic",
            position: item.title || item.position || "Staff",
            startDate: item.startDate || "2020",
            endDate: item.endDate || "Present",
            description: item.description || "",
          },
        });
      }
    }

    if (d.education && Array.isArray(d.education)) {
      for (const item of d.education) {
        await db.professionalEducation.create({
          data: {
            profileId: profProfile.id,
            school: item.school || item.institution || "University",
            degree: item.degree || "BS",
            field: item.field || "Nursing",
            graduationYear: item.graduationYear || item.year || "2019",
          },
        });
      }
    }

    if (d.licenses && Array.isArray(d.licenses)) {
      for (const item of d.licenses) {
        await db.professionalLicense.create({
          data: {
            profileId: profProfile.id,
            type: item.type || "NP",
            number: item.number || "9999",
            state: item.state || state,
            expires: item.expires || "2028",
            status: "verified",
          },
        });
      }
    }

    // Trigger matching calculation asynchronously for this new profile
    try {
      const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || process.env.SLACK_WORKFORCE_WEBHOOK_URL;
      if (SLACK_WEBHOOK) {
        await fetch(SLACK_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `👤 *New Professional Talent Registered* 👤\n*Name*: ${name}\n*Title*: ${d.professionalTitle}\n*Location*: ${city}, ${state}\n*Email*: ${d.email}`,
          }),
        }).catch(() => {});
      }
    } catch {}

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: profProfile.id,
      event: "professional_onboarding_completed",
      properties: {
        specialty: d.specialties?.[0] ?? null,
        state_or_location: d.stateOrLocation ?? null,
        employment_preference: d.employmentPreference ?? null,
        work_arrangement: d.workArrangement ?? null,
        telehealth_availability: d.telehealthAvailability ?? false,
        relocation_preference: d.relocationPreference ?? false,
      },
    });
    await posthog.flush();
    return NextResponse.json({ ok: true, id: record.id, profileId: profProfile.id });
  } catch (e) {
    console.error("professional onboarding error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
