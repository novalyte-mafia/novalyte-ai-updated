import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  ageRange: z.string().min(1).max(40),
  locationState: z.string().max(60).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  concerns: z.array(z.string()).optional().nullable(),
  symptoms: z.array(z.string()).optional().nullable(),
  treatmentInterest: z.string().max(160).optional().nullable(),
  careFormat: z.string().max(40).optional().nullable(),
  telehealthPref: z.boolean().optional().nullable(),
  contactName: z.string().max(120).optional().nullable(),
  contactEmail: z.string().email().max(160).optional().nullable(),
  consent: z.boolean(),
  matchedClinicIds: z.array(z.string()).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const record = await db.assessmentSubmission.create({
      data: {
        ageRange: parsed.data.ageRange,
        locationState: parsed.data.locationState ?? null,
        zip: parsed.data.zip ?? null,
        concerns: (parsed.data.concerns ?? []).join(","),
        symptoms: (parsed.data.symptoms ?? []).join(","),
        treatmentInterest: parsed.data.treatmentInterest ?? null,
        careFormat: parsed.data.careFormat ?? null,
        telehealthPref: parsed.data.telehealthPref ?? false,
        contactName: parsed.data.contactName ?? null,
        contactEmail: parsed.data.contactEmail ?? null,
        consent: parsed.data.consent,
        matchedClinicIds: (parsed.data.matchedClinicIds ?? []).join(","),
      },
    });
    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error("assessment error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
