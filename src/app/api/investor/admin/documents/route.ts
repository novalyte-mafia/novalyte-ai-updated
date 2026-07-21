import { NextResponse } from "next/server";

import {
  requireFounderAdmin,
  investorAuthErrorResponse,
  logInvestorEvent,
} from "@/lib/investor/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "text/csv",
]);

export async function POST(request: Request) {
  try {
    const founder = await requireFounderAdmin();
    const form = await request.formData();
    const file = form.get("file");
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const category = String(form.get("category") ?? "General").trim();

    if (!(file instanceof File) || !title) {
      return NextResponse.json({ error: "File and title are required." }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type." },
        { status: 415 },
      );
    }
    if (file.size > 26214400) {
      return NextResponse.json({ error: "File exceeds 25MB." }, { status: 413 });
    }

    const admin = getSupabaseAdmin();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectPath = `${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${Date.now()}-${safeName}`;

    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from("investor-data-room")
      .upload(objectPath, bytes, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("document upload failed", uploadError);
      return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }

    const { data: doc, error: docError } = await admin
      .from("investor_documents")
      .insert({
        title,
        description: description || null,
        category,
        visibility: "approved_investors",
        featured: false,
        created_by: founder.id,
      })
      .select("id")
      .single();

    if (docError || !doc) {
      await admin.storage.from("investor-data-room").remove([objectPath]);
      return NextResponse.json({ error: "Unable to save document." }, { status: 500 });
    }

    const { data: version, error: versionError } = await admin
      .from("investor_document_versions")
      .insert({
        document_id: doc.id,
        version_label: "v1",
        bucket_id: "investor-data-room",
        object_path: objectPath,
        mime_type: file.type,
        file_size: file.size,
        upload_status: "approved",
        uploaded_by: founder.id,
      })
      .select("id")
      .single();

    if (versionError || !version) {
      return NextResponse.json({ error: "Unable to save version." }, { status: 500 });
    }

    await admin
      .from("investor_documents")
      .update({ current_version_id: version.id, updated_at: new Date().toISOString() })
      .eq("id", doc.id);

    await logInvestorEvent({
      userId: founder.id,
      eventType: "document_published",
      section: "data_room",
      documentId: doc.id,
      metadata: { title },
    });

    return NextResponse.json({ ok: true, id: doc.id });
  } catch (error) {
    const authResponse = investorAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("admin document error", error);
    return NextResponse.json({ error: "Unable to upload document." }, { status: 500 });
  }
}
