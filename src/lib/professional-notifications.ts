import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ProfessionalNotification = {
  userId: string;
  profileId?: string | null;
  eventKey: "account_confirmed" | "onboarding_completed";
  text: string;
};

export type NotificationDeliveryResult =
  | { status: "sent" | "already_sent" | "in_progress" }
  | { status: "failed"; error: string }
  | { status: "not_configured"; error: string };

export async function sendProfessionalSlackNotification(
  notification: ProfessionalNotification
): Promise<NotificationDeliveryResult> {
  const webhook = process.env.SLACK_WEBHOOK_URL || process.env.SLACK_WORKFORCE_WEBHOOK_URL;
  if (!webhook) {
    const error = "Professional Slack webhook is not configured.";
    console.error(error);
    return { status: "not_configured", error };
  }

  const admin = getSupabaseAdmin();
  const { data: claimedRows, error: claimError } = await admin.rpc(
    "claim_professional_notification",
    {
      p_user_id: notification.userId,
      p_profile_id: notification.profileId ?? null,
      p_event_key: notification.eventKey,
    }
  );
  const delivery = claimedRows?.[0];

  if (claimError) {
    const error = claimError?.message ?? "Unable to record Slack delivery.";
    console.error("Professional Slack claim failed", error);
    return { status: "failed", error };
  }
  if (!delivery) {
    const { data: existing } = await admin
      .from("professional_notification_deliveries")
      .select("delivery_status")
      .eq("user_id", notification.userId)
      .eq("event_key", notification.eventKey)
      .maybeSingle();
    return existing?.delivery_status === "sent" ? { status: "already_sent" } : { status: "in_progress" };
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: notification.text }),
    });
    if (!response.ok) {
      throw new Error(`Slack returned ${response.status} ${response.statusText}`);
    }

    await admin
      .from("professional_notification_deliveries")
      .update({
        delivery_status: "sent",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", delivery.id);
    return { status: "sent" };
  } catch (cause) {
    const error = cause instanceof Error ? cause.message : "Unknown Slack delivery error";
    console.error("Professional Slack delivery failed", error);
    await admin
      .from("professional_notification_deliveries")
      .update({ delivery_status: "failed", last_error: error, updated_at: new Date().toISOString() })
      .eq("id", delivery.id);
    return { status: "failed", error };
  }
}
