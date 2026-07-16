import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { captureServerEvent } from "@/lib/posthog-server";

const schema = z.object({
  jobPostingId: z.string().min(2),
  applicantName: z.string().min(2).max(120),
  applicantEmail: z.string().email().max(160),
  applicantPhone: z.string().max(40).optional().nullable(),
  coverNote: z.string().max(4000).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const record = await db.jobApplication.create({
      data: {
        jobPostingId: parsed.data.jobPostingId,
        applicantName: parsed.data.applicantName,
        applicantEmail: parsed.data.applicantEmail,
        applicantPhone: parsed.data.applicantPhone ?? null,
        coverNote: parsed.data.coverNote ?? null,
      },
    });
    await captureServerEvent({
      distinctId: record.id,
      event: "job_application_submitted",
      properties: {
        job_posting_id: parsed.data.jobPostingId,
        has_cover_note: !!parsed.data.coverNote,
      },
    });
    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error("job application error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
