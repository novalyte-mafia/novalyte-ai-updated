"use client";

import { useState } from "react";
import { ClinicApplication, ApplicationConfirmation } from "@/components/views/clinic-application";
import { Breadcrumbs } from "@/components/shared/enterprise";
import { navigate } from "@/lib/nav";

/** Direct directory application entry point. No email gate is required before the form. */
export function ClinicApplicationView() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs items={[
            { label: "Home", onClick: () => navigate("home") },
            { label: "Clinic Directory", onClick: () => navigate("directory") },
            { label: "Apply to List Your Clinic" },
          ]} />
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Clinic Directory Application</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Apply to List Your Clinic</h1>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Start the complete clinic listing application now. Your progress is organized into short stages, and Novalyte AI will review the information before publication.
          </p>
        </div>
        {submitted ? (
          <ApplicationConfirmation
            applicationId={submitted}
            clinicName="Clinic listing"
            onBackToClinics={() => { setSubmitted(null); navigate("directory"); }}
          />
        ) : (
          <ClinicApplication onComplete={setSubmitted} />
        )}
      </main>
    </div>
  );
}
