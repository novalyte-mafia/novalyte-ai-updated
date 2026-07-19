import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

const createSchema = z.object({
  type: z.enum(["resume", "license", "certification", "other"]).default("resume"),
  name: z.string().trim().min(1).max(200),
  mimeType: z.string().trim().min(3).max(120),
  size: z.number().int().positive().max(10 * 1024 * 1024),
});

function bucketForType(type: string): "professional-resumes" | "professional-credentials" {
  return type === "resume" ? "professional-resumes" : "professional-credentials";
}

export async function GET(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from("workforce_professional_profiles")
      .select("id")
      .eq("userId", user.id)
      .maybeSingle();
    if (!profile) return NextResponse.json({ documents: [] });

    const { data, error } = await admin
      .from("professional_documents")
      .select("id, type, name, size, mime_type, upload_status, verification_status, createdAt, bucket_id, object_path")
      .eq("profileId", profile.id)
      .order("createdAt", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ documents: data ?? [] });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: "Unable to load documents." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid document request." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from("workforce_professional_profiles")
      .select("id")
      .eq("userId", user.id)
      .maybeSingle();
    if (!profile) {
      return NextResponse.json({ error: "Professional profile required." }, { status: 403 });
    }

    const bucket = bucketForType(parsed.data.type);
    const documentId = crypto.randomUUID();
    const safeName = parsed.data.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
    const objectPath = `${user.id}/${documentId}/${safeName}`;

    const { data: doc, error: insertError } = await admin
      .from("professional_documents")
      .insert({
        id: documentId,
        profileId: profile.id,
        owner_user_id: user.id,
        type: parsed.data.type,
        name: parsed.data.name,
        path: objectPath,
        object_path: objectPath,
        bucket_id: bucket,
        size: parsed.data.size,
        mime_type: parsed.data.mimeType,
        status: "pending",
        upload_status: "pending",
        verification_status: "pending",
      })
      .select("id, bucket_id, object_path")
      .single();
    if (insertError || !doc) throw insertError ?? new Error("Unable to create document record.");

    const { data: signed, error: signError } = await admin.storage
      .from(bucket)
      .createSignedUploadUrl(objectPath);
    if (signError || !signed) throw signError ?? new Error("Unable to create upload URL.");

    return NextResponse.json({
      documentId: doc.id,
      bucket,
      path: objectPath,
      token: signed.token,
      signedUrl: signed.signedUrl,
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Document create failed", error);
    return NextResponse.json({ error: "Unable to start document upload." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const body = z
      .object({
        documentId: z.string().min(1),
        uploadStatus: z.enum(["uploaded", "failed"]),
      })
      .safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid upload finalization." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: doc, error } = await admin
      .from("professional_documents")
      .update({
        upload_status: body.data.uploadStatus,
        status: body.data.uploadStatus === "uploaded" ? "uploaded" : "failed",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", body.data.documentId)
      .eq("owner_user_id", user.id)
      .select("id, upload_status, verification_status")
      .maybeSingle();
    if (error) throw error;
    if (!doc) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    return NextResponse.json({ ok: true, document: doc });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: "Unable to finalize upload." }, { status: 500 });
  }
}
