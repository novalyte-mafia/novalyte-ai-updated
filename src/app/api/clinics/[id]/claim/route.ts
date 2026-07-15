import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.authorized || !body.dmEmail) {
      return NextResponse.json({ error: "Missing authorization consent or contact email" }, { status: 400 });
    }

    const updated = await db.clinic.update({
      where: { id },
      data: {
        claimStatus: "claimed",
        profileCompleteness: 85,
      },
    });

    return NextResponse.json({ ok: true, clinic: updated });
  } catch (e) {
    console.error("Clinic claim error", e);
    return NextResponse.json({ error: "Failed to claim clinic profile" }, { status: 500 });
  }
}
