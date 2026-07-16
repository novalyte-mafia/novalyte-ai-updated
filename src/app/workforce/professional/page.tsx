"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getProfessionalAccessToken, fetchProfessionalStatus } from "@/lib/professional-client";

export default function ProfessionalAccessGateway() {
  const [message, setMessage] = useState("Checking your professional account…");

  useEffect(() => {
    let active = true;
    async function routeProfessional() {
      try {
        const token = await getProfessionalAccessToken();
        if (!token) {
          window.location.replace("/workforce/professional/sign-up");
          return;
        }
        const status = await fetchProfessionalStatus(token);
        if (active) window.location.replace(status.redirectTo);
      } catch {
        if (active) {
          setMessage("We could not verify your account. Redirecting to sign in…");
          window.setTimeout(() => window.location.replace("/workforce/professional/sign-in"), 1200);
        }
      }
    }
    routeProfessional();
    return () => { active = false; };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </main>
  );
}
