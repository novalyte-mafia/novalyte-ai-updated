import { NextResponse } from "next/server";
import {
  professionalAuthErrorResponse,
  resolveProfessionalAccess,
} from "@/lib/professional-access";
import { sendProfessionalSlackNotification, type NotificationDeliveryResult } from "@/lib/professional-notifications";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const access = await resolveProfessionalAccess(request);
    let notificationDelivery: NotificationDeliveryResult | null = null;
    let onboardingNotificationDelivery: NotificationDeliveryResult | null = null;

    if (access.user.email_confirmed_at) {
      notificationDelivery = await sendProfessionalSlackNotification({
        userId: access.user.id,
        profileId: access.profileId,
        eventKey: "account_confirmed",
        text: `✅ *Professional account confirmed*\n*Email:* ${access.user.email ?? "Not provided"}`,
      });
    }

    if (
      access.profileId &&
      ["pending_review", "approved", "rejected", "suspended"].includes(access.status)
    ) {
      onboardingNotificationDelivery = await sendProfessionalSlackNotification({
        userId: access.user.id,
        profileId: access.profileId,
        eventKey: "onboarding_completed",
        text: `👤 *Professional onboarding completed*\n*Email:* ${access.user.email ?? "Not provided"}\n*Profile:* ${access.profileId}\n*Status:* ${access.status.replaceAll("_", " ")}`,
      });
    }

    return NextResponse.json({
      status: access.status,
      profileId: access.profileId,
      onboardingStep: access.onboardingStep,
      redirectTo: access.redirectTo,
      notificationDelivery,
      onboardingNotificationDelivery,
    });
  } catch (error) {
    const authResponse = professionalAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Professional status resolver failed", error);
    return NextResponse.json({ error: "Unable to resolve professional account status." }, { status: 500 });
  }
}
