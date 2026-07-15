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
      <main className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
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
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(240px,0.72fr)_minmax(0,2fr)] lg:gap-8">
            <aside className="rounded-2xl border border-teal-200 bg-teal-50/35 p-5 lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Before you begin</p>
              <h2 className="mt-3 text-xl font-semibold text-foreground">Create a complete clinic profile</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Have your organization, location, provider, treatment, contact, and booking information available. You can save progress on this device and return to finish.
              </p>
              <div className="mt-5 space-y-2.5 text-xs text-foreground/80">
                {["Free application", "Approximately 8–12 minutes", "Reviewed before publication", "Optional services remain separate"].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" /> {item}
                  </div>
                ))}
              </div>
            </aside>
            <ClinicApplication onComplete={setSubmitted} />
          </div>
        )}
      </main>
    </div>
  );
}
