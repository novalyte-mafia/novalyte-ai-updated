import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  title: z.string().max(120).optional().nullable(),
  state: z.string().max(60).optional().nullable(),
  licenses: z.string().max(400).optional().nullable(),
  experience: z.string().max(120).optional().nullable(),
  preferences: z.string().max(4000).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const record = await db.professionalOnboarding.create({ data: parsed.data });
    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error("professional onboarding error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
