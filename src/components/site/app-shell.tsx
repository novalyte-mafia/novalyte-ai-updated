"use client";

import { useState } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { GetStartedDialog } from "@/components/site/get-started-dialog";
import { HomeView } from "@/components/views/home-view";
import { PatientsView } from "@/components/views/patients-view";
import { ClinicsView } from "@/components/views/clinics-view";
import { DirectoryView } from "@/components/views/directory-view";
import { WorkforceView } from "@/components/views/workforce-view";
import { MarketplaceView } from "@/components/views/marketplace-view";
import { JournalView } from "@/components/views/journal-view";
import { AboutView } from "@/components/views/about-view";
import { LegalView } from "@/components/views/legal-view";
import { useNav } from "@/lib/nav";
import type {
  ClinicT,
  ProfessionalT,
  JobPostingT,
  MarketplaceListingT,
  ArticleT,
} from "@/lib/types";

export type PlatformData = {
  clinics: ClinicT[];
  professionals: ProfessionalT[];
  jobs: JobPostingT[];
  listings: MarketplaceListingT[];
  articles: ArticleT[];
};

export function AppShell({ data }: { data: PlatformData }) {
  const { view, anchor } = useNav();
  const [getStartedOpen, setGetStartedOpen] = useState(false);

  async function subscribe(email: string) {
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("failed");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => setGetStartedOpen(true)} />
      <main className="flex-1">
        {view === "home" && <HomeView data={data} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "patients" && <PatientsView data={data} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "clinics" && <ClinicsView data={data} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "directory" && <DirectoryView clinics={data.clinics} />}
        {view === "workforce" && <WorkforceView professionals={data.professionals} jobs={data.jobs} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "marketplace" && <MarketplaceView listings={data.listings} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "journal" && <JournalView articles={data.articles} />}
        {view === "about" && <AboutView onGetStarted={() => setGetStartedOpen(true)} />}
        {(view === "privacy" || view === "terms" || view === "medical-disclaimer" || view === "accessibility" || view === "cookies") && (
          <LegalView view={view} />
        )}
      </main>
      <Footer onNewsletter={subscribe} />
      <GetStartedDialog open={getStartedOpen} onOpenChange={setGetStartedOpen} />

      {/* anchor scroll helper (unused but reserved) */}
      <span className="sr-only">{anchor}</span>
    </div>
  );
}
