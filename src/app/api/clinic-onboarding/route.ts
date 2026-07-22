import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { captureServerEvent } from "@/lib/posthog-server";
import { recordFormSubmissionAndNotify } from "@/lib/form-notifications";

const schema = z.object({
  clinicName: z.string().min(2).max(160),
  contactName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(40).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  state: z.string().max(60).optional().nullable(),
  specialties: z.string().max(400).optional().nullable(),
  currentVolume: z.string().max(120).optional().nullable(),
  goals: z.string().max(4000).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const record = await db.clinicOnboarding.create({ data: parsed.data });
    await recordFormSubmissionAndNotify({
      request: req,
      formType: "clinic_onboarding",
      sourceTable: "ClinicOnboarding",
      sourceRecordId: record.id,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.email,
      contactPhone: parsed.data.phone ?? null,
      organization: parsed.data.clinicName,
      safeMetadata: {
        city: parsed.data.city,
        state: parsed.data.state,
        current_volume: parsed.data.currentVolume,
      },
    }).catch((error) => console.error("clinic onboarding notification failed", error));
    await captureServerEvent({
      distinctId: record.id,
      event: "clinic_onboarding_submitted",
      properties: {
        state: parsed.data.state ?? null,
        specialties: parsed.data.specialties ?? null,
        current_volume: parsed.data.currentVolume ?? null,
      },
    });
    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error("clinic onboarding error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
