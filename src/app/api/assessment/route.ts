import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  treatmentType: z.string().max(160).optional().nullable(),
  ageRange: z.string().max(40).optional().nullable(),
  locationState: z.string().max(60).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  concerns: z.array(z.string()).optional().nullable(),
  symptoms: z.array(z.string()).optional().nullable(),
  treatmentInterest: z.string().max(160).optional().nullable(),
  careFormat: z.string().max(40).optional().nullable(),
  telehealthPref: z.boolean().optional().nullable(),
  timeline: z.string().max(60).optional().nullable(),
  selfPayOpenness: z.string().max(60).optional().nullable(),
  budgetRange: z.string().max(60).optional().nullable(),
  firstName: z.string().max(80).optional().nullable(),
  lastName: z.string().max(80).optional().nullable(),
  email: z.string().email().max(160).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  preferredContact: z.string().max(40).optional().nullable(),
  bestTime: z.string().max(80).optional().nullable(),
  consentContact: z.boolean().optional().nullable(),
  consentSms: z.boolean().optional().nullable(),
  // legacy
  contactName: z.string().max(120).optional().nullable(),
  contactEmail: z.string().email().max(160).optional().nullable(),
  consent: z.boolean().optional().nullable(),
  internalStatus: z.string().max(60).optional().nullable(),
  matchedClinicIds: z.array(z.string()).optional().nullable(),
  sourcePage: z.string().max(160).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;
    const record = await db.assessmentSubmission.create({
      data: {
        treatmentType: d.treatmentType ?? null,
        ageRange: d.ageRange ?? null,
        locationState: d.locationState ?? null,
        zip: d.zip ?? null,
        concerns: (d.concerns ?? []).join(","),
        symptoms: (d.symptoms ?? []).join(","),
        treatmentInterest: d.treatmentInterest ?? null,
        careFormat: d.careFormat ?? null,
        telehealthPref: d.telehealthPref ?? false,
        timeline: d.timeline ?? null,
        selfPayOpenness: d.selfPayOpenness ?? null,
        budgetRange: d.budgetRange ?? null,
        firstName: d.firstName ?? null,
        lastName: d.lastName ?? null,
        email: d.email ?? null,
        phone: d.phone ?? null,
        preferredContact: d.preferredContact ?? null,
        bestTime: d.bestTime ?? null,
        consentContact: d.consentContact ?? false,
        consentSms: d.consentSms ?? false,
        // legacy compat
        contactName: d.contactName ?? (d.firstName && d.lastName ? `${d.firstName} ${d.lastName}` : null),
        contactEmail: d.contactEmail ?? d.email ?? null,
        consent: d.consent ?? d.consentContact ?? false,
        internalStatus: d.internalStatus ?? null,
        matchedClinicIds: (d.matchedClinicIds ?? []).join(","),
        sourcePage: d.sourcePage ?? null,
      },
    });
    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error("assessment error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
