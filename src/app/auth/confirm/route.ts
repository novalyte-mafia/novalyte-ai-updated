import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { captureServerEvent } from "@/lib/posthog-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/workforce/professional";

  const redirectUrl = new URL("/auth/callback", request.url);

  if (token_hash && type) {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      if (data.user) {
        await captureServerEvent({
          distinctId: data.user.id,
          event: "professional_email_confirmed",
          properties: { confirmation_type: type },
        });
      }
      redirectUrl.searchParams.set("status", "success");
      redirectUrl.searchParams.set("type", type);
      redirectUrl.searchParams.set("next", next);
      return NextResponse.redirect(redirectUrl);
    } else {
      console.error("Auth verification error:", error);
      redirectUrl.searchParams.set("status", "error");
      redirectUrl.searchParams.set("message", error.message);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If parameters are missing
  redirectUrl.searchParams.set("status", "error");
  redirectUrl.searchParams.set("message", "Invalid or incomplete verification parameters.");
  return NextResponse.redirect(redirectUrl);
}
