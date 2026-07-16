"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { fetchProfessionalStatus, getProfessionalAccessToken } from "@/lib/professional-client";

export default function ProfessionalAccountStatusPage() {
  const [status, setStatus] = useState<"rejected" | "suspended" | null>(null);
  useEffect(() => {
    getProfessionalAccessToken()
      .then(async (token) => {
        if (!token) return window.location.replace("/workforce/professional/sign-in");
        const result = await fetchProfessionalStatus(token);
        if (result.status !== "rejected" && result.status !== "suspended") {
          window.location.replace(result.redirectTo);
          return;
        }
        setStatus(result.status);
      })
      .catch(() => window.location.replace("/workforce/professional/sign-in"));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => {}} />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {!status ? <Loader2 className="h-8 w-8 animate-spin text-teal-600" /> : (
          <section className="w-full max-w-lg rounded-3xl border bg-card p-8 text-center shadow-premium-md">
            {status === "suspended" ? <ShieldAlert className="mx-auto h-12 w-12 text-amber-600" /> : <AlertCircle className="mx-auto h-12 w-12 text-rose-600" />}
            <h1 className="mt-5 text-2xl font-bold">{status === "suspended" ? "Account suspended" : "Application status"}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {status === "suspended"
                ? "Access to this professional account is currently suspended. Contact Novalyte support for assistance."
                : "This professional application was not approved. Contact Novalyte support if you believe this needs review."}
            </p>
            <a className="mt-6 inline-flex font-semibold text-teal-700 hover:underline" href="mailto:support@novalyte.io">Contact support</a>
          </section>
        )}
      </main>
      <Footer onNewsletter={async () => {}} />
    </div>
  );
}
