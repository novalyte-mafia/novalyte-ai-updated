"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function EmployerGatewayPage() {
  const supabase = getSupabaseClient();
  const [message, setMessage] = useState("Checking employer account status...");

  useEffect(() => {
    async function run() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.replace("/workforce/employer/sign-in");
        return;
      }
      const res = await fetch("/api/workforce/employer/status", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      if (res.status === 401) {
        window.location.replace("/workforce/employer/sign-in");
        return;
      }
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(payload.error || "Unable to resolve employer status.");
        return;
      }
      window.location.replace(payload.redirectTo || "/workforce/employer/dashboard");
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
