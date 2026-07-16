import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { getPostHogClient } from "@/lib/posthog-server";

const schema = z.object({
  clinicId: z.string().optional().nullable(),
  clinicName: z.string().min(2).max(160),
  patientName: z.string().min(2).max(120),
  patientEmail: z.string().email().max(160),
  patientPhone: z.string().max(40).optional().nullable(),
  preferredTime: z.string().max(120).optional().nullable(),
  treatmentInterest: z.string().max(160).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const record = await db.consultationRequest.create({
      data: {
        clinicId: parsed.data.clinicId ?? null,
        clinicName: parsed.data.clinicName,
        patientName: parsed.data.patientName,
        patientEmail: parsed.data.patientEmail,
        patientPhone: parsed.data.patientPhone ?? null,
        preferredTime: parsed.data.preferredTime ?? null,
        treatmentInterest: parsed.data.treatmentInterest ?? null,
        notes: parsed.data.notes ?? null,
      },
    });
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: record.id,
      event: "consultation_requested",
      properties: {
        clinic_id: parsed.data.clinicId ?? null,
        treatment_interest: parsed.data.treatmentInterest ?? null,
        has_preferred_time: !!parsed.data.preferredTime,
      },
    });
    await posthog.flush();
    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error("consultation error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
