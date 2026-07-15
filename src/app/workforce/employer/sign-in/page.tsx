"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Building2, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export default function EmployerSignIn() {
  const portalUrl = process.env.NEXT_PUBLIC_EMPLOYER_PORTAL_URL || "https://employer.novalyte.ai";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => {}} />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/20 via-background to-background">
        <div className="w-full max-w-lg space-y-8 bg-white border border-neutral-200/80 p-8 rounded-3xl shadow-premium-md text-center">
          <div className="flex flex-col items-center">
            {/* Round animated logo icon container */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-50/50 shadow-premium-sm">
              <Building2 className="h-7 w-7 text-emerald-700" />
            </div>
            
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <Sparkles className="h-3.5 w-3.5" /> Coming Soon
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              Employer Hiring Portal
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-sm">
              We are finalizing the dedicated Novalyte Employer Subdomain. In the future, you will access candidate pipelines, manage clinical placements, and review telemetry reports here.
            </p>
          </div>

          <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 flex flex-col items-center space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Need temporary access to submit requirements or browse talent pipelines?
            </p>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={() => window.open(portalUrl, "_blank")}
            >
              Go to Sandbox Workspace <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="text-center pt-2 border-t border-neutral-100">
            <a
              href="/?view=workforce"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-emerald-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Workforce Hub
            </a>
          </div>
        </div>
      </main>

      <Footer onNewsletter={async () => {}} />
    </div>
  );
}
