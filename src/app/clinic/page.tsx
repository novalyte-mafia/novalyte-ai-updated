"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function ClinicPortalGatewayPage() {
  const supabase = getSupabaseClient();
  const [message, setMessage] = useState("Checking clinic portal access...");

  useEffect(() => {
    async function run() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.replace("/clinic/sign-in");
        return;
      }
      const res = await fetch("/api/clinic/status", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      if (res.status === 401) {
        window.location.replace("/clinic/sign-in");
        return;
      }
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(payload.error || "Unable to resolve clinic portal status.");
        return;
      }
      window.location.replace(payload.redirectTo || "/clinic/dashboard");
    }
    run();
  }, [supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {message}
    </div>
  );
}
