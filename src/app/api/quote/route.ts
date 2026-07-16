import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { getPostHogClient } from "@/lib/posthog-server";

const schema = z.object({
  listingId: z.string().min(2),
  requesterName: z.string().min(2).max(120),
  requesterEmail: z.string().email().max(160),
  requesterOrg: z.string().max(160).optional().nullable(),
  quantity: z.string().max(120).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const record = await db.quoteRequest.create({
      data: {
        listingId: parsed.data.listingId,
        requesterName: parsed.data.requesterName,
        requesterEmail: parsed.data.requesterEmail,
        requesterOrg: parsed.data.requesterOrg ?? null,
        quantity: parsed.data.quantity ?? null,
        notes: parsed.data.notes ?? null,
      },
    });
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: record.id,
      event: "quote_requested",
      properties: {
        listing_id: parsed.data.listingId,
        quantity: parsed.data.quantity ?? null,
        has_org: !!parsed.data.requesterOrg,
      },
    });
    await posthog.flush();
    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error("quote error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
