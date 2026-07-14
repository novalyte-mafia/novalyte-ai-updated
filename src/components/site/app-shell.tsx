"use client";

import { useState } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { GetStartedDialog } from "@/components/site/get-started-dialog";
import { HomeView } from "@/components/views/home-view";
import { PatientsView } from "@/components/views/patients-view";
import { ClinicsView } from "@/components/views/clinics-view";
import { DirectoryView } from "@/components/views/directory-view";
import { ClinicProfileView } from "@/components/views/clinic-profile-view";
import { WorkforceView } from "@/components/views/workforce-view";
import { JobDetailView } from "@/components/views/job-detail-view";
import { MarketplaceView } from "@/components/views/marketplace-view";
import { ProductDetailView } from "@/components/views/product-detail-view";
import { VendorProfileView } from "@/components/views/vendor-profile-view";
import { JournalView } from "@/components/views/journal-view";
import { AboutView } from "@/components/views/about-view";
import { LegalView } from "@/components/views/legal-view";
import { useNav, useCompare } from "@/lib/nav";
import { ClinicCompareTray, ProductCompareTray } from "@/components/views/compare-trays";
import type {
  ClinicT,
  ProfessionalT,
  JobPostingT,
  MarketplaceListingT,
  ArticleT,
  VendorT,
} from "@/lib/types";

export type PlatformData = {
  clinics: ClinicT[];
  professionals: ProfessionalT[];
  jobs: JobPostingT[];
  listings: MarketplaceListingT[];
  articles: ArticleT[];
  vendors: VendorT[];
};

export function AppShell({ data }: { data: PlatformData }) {
  const { view, params } = useNav();
  const [getStartedOpen, setGetStartedOpen] = useState(false);
  const compareClinics = useCompare((s) => s.clinics);
  const compareProducts = useCompare((s) => s.products);

  async function subscribe(email: string) {
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("failed");
  }

  // Clinic compare tray visibility: show on directory + clinic-profile
  const showClinicTray = (view === "directory" || view === "clinic-profile") && compareClinics.length > 0;
  const showProductTray = (view === "marketplace" || view === "product-detail") && compareProducts.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => setGetStartedOpen(true)} />
      <main className="flex-1">
        {view === "home" && <HomeView data={data} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "patients" && <PatientsView data={data} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "clinics" && <ClinicsView data={data} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "directory" && <DirectoryView clinics={data.clinics} />}
        {view === "clinic-profile" && (
          <ClinicProfileView
            clinic={data.clinics.find((c) => c.id === params?.id) ?? data.clinics[0]}
            allClinics={data.clinics}
          />
        )}
        {view === "workforce" && <WorkforceView professionals={data.professionals} jobs={data.jobs} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "job-detail" && (
          <JobDetailView
            job={data.jobs.find((j) => j.id === params?.id) ?? data.jobs[0]}
            allJobs={data.jobs}
          />
        )}
        {view === "marketplace" && <MarketplaceView listings={data.listings} vendors={data.vendors} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "product-detail" && (
          <ProductDetailView
            listing={data.listings.find((l) => l.id === params?.id) ?? data.listings[0]}
            allListings={data.listings}
            vendors={data.vendors}
          />
        )}
        {view === "vendor-profile" && (
          <VendorProfileView
            vendor={data.vendors.find((v) => v.id === params?.id) ?? data.vendors[0]}
            listings={data.listings.filter((l) => l.vendorName === (data.vendors.find((v) => v.id === params?.id) ?? data.vendors[0])?.name)}
          />
        )}
        {view === "journal" && <JournalView articles={data.articles} />}
        {view === "about" && <AboutView onGetStarted={() => setGetStartedOpen(true)} />}
        {(view === "privacy" || view === "terms" || view === "medical-disclaimer" || view === "accessibility" || view === "cookies") && (
          <LegalView view={view} />
        )}
      </main>
      <Footer onNewsletter={subscribe} />
      <GetStartedDialog open={getStartedOpen} onOpenChange={setGetStartedOpen} />
      {showClinicTray && <ClinicCompareTray clinics={data.clinics} />}
      {showProductTray && <ProductCompareTray listings={data.listings} />}
    </div>
  );
}
