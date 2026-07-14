import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  role: z.enum(["patient", "clinic", "professional", "vendor", "investor", "other"]),
  message: z.string().min(5).max(4000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const record = await db.contactSubmission.create({ data: parsed.data });
    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error("contact error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
