import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { captureServerEvent } from "@/lib/posthog-server";

const schema = z.object({ email: z.string().email().max(160) });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const record = await db.newsletterSignup.upsert({
      where: { email: parsed.data.email },
      update: {},
      create: { email: parsed.data.email },
    });
    await captureServerEvent({
      distinctId: record.id,
      event: "newsletter_signup",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("newsletter error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
