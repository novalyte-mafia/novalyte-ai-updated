import { NextResponse } from "next/server";

import {
  requireApprovedInvestor,
  investorAuthErrorResponse,
  logInvestorEvent,
} from "@/lib/investor/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, profile } = await requireApprovedInvestor();
    const { id } = await params;

    const admin = getSupabaseAdmin();
    const { data: doc, error } = await admin
      .from("investor_documents")
      .select(
        "id, title, visibility, deleted_at, current_version_id, investor_document_versions!investor_documents_current_version_fk(bucket_id, object_path, upload_status)",
      )
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    if (doc.visibility === "draft" || doc.visibility === "internal") {
      return NextResponse.json({ error: "Not available." }, { status: 403 });
    }

    const version = Array.isArray(doc.investor_document_versions)
      ? doc.investor_document_versions[0]
      : doc.investor_document_versions;

    if (!version || version.upload_status !== "approved") {
      return NextResponse.json(
        { error: "Document is not yet available." },
        { status: 409 },
      );
    }

    const { data: signed, error: signError } = await admin.storage
      .from(version.bucket_id)
      .createSignedUrl(version.object_path, 60);

    if (signError || !signed?.signedUrl) {
      return NextResponse.json({ error: "Unable to open document." }, { status: 500 });
    }

    await logInvestorEvent({
      userId: user.id,
      profileId: (profile.id as string) ?? null,
      eventType: "document_downloaded",
      section: "data_room",
      documentId: id,
      metadata: { title: doc.title },
    });

    return NextResponse.redirect(signed.signedUrl, 302);
  } catch (error) {
    const authResponse = investorAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("investor document download error", error);
    return NextResponse.json({ error: "Unable to open document." }, { status: 500 });
  }
}
