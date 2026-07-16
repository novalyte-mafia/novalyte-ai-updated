import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { getPostHogClient } from "@/lib/posthog-server";

const schema = z.object({
  companyName: z.string().min(2).max(160),
  contactName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  category: z.string().max(120).optional().nullable(),
  productTypes: z.string().max(400).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const record = await db.vendorOnboarding.create({ data: parsed.data });
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: record.id,
      event: "vendor_onboarding_submitted",
      properties: {
        category: parsed.data.category ?? null,
        product_types: parsed.data.productTypes ?? null,
      },
    });
    await posthog.flush();
    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error("vendor onboarding error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
