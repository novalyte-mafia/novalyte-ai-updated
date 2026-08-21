import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Notify clinic org members when a lead is pushed to their portal.
 * Creates portal_notifications and optionally emails via Resend.
 */
export async function notifyClinicNewLead(input: {
  organizationId: string;
  clinicId: string;
  clinicName: string;
  leadId: string;
  assignmentId: string;
  patientLabel: string;
}): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data: members } = await admin
    .from("organization_memberships")
    .select("user_id")
    .eq("organization_id", input.organizationId)
    .eq("status", "active");

  const userIds = [...new Set((members ?? []).map((m) => m.user_id).filter(Boolean))];
  if (!userIds.length) return;

  const title = `New patient lead for ${input.clinicName}`;
  const body = `${input.patientLabel} was delivered to your clinic portal inbox.`;
  const payload = {
    assignmentId: input.assignmentId,
    leadId: input.leadId,
    clinicId: input.clinicId,
    href: `/clinic/leads/${input.assignmentId}`,
  };

  await admin.from("portal_notifications").insert(
    userIds.map((userId) => ({
      organization_id: input.organizationId,
      user_id: userId,
      type: "lead_delivered",
      title,
      body,
      payload,
    })),
  );

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return;

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  const emails = [...new Set((profiles ?? []).map((p) => p.email).filter(Boolean))] as string[];
  if (!emails.length) return;

  const portalUrl =
    process.env.NEXT_PUBLIC_PORTAL_SITE_URL?.replace(/\/$/, "") || "https://portal.novalyte.io";

  await Promise.allSettled(
    emails.map((to) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Novalyte <noreply@novalyte.io>",
          to: [to],
          subject: title,
          html: `<p>${body}</p><p><a href="${portalUrl}/clinic/leads/${input.assignmentId}">Open lead in portal</a></p>`,
        }),
      }),
    ),
  );
}
