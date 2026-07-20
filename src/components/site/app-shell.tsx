"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WorkspaceShell } from "@/components/site/workspace-shell";
import { JoinGateway } from "@/components/site/join-gateway";
import { Button } from "@/components/ui/button";
import { ProfessionalOnboarding } from "@/components/views/professional-onboarding";
import { EmployerOnboarding } from "@/components/views/employer-onboarding";
import { HomeView } from "@/components/views/home-view";
import { PatientsView } from "@/components/views/patients-view";
import { ClinicsView } from "@/components/views/clinics-view";
import { DirectoryView } from "@/components/views/directory-view";
import { ClinicApplicationView } from "@/components/views/clinic-application-view";
import { ClinicProfileView } from "@/components/views/clinic-profile-view";
import { ClinicDashboardView } from "@/components/views/clinic-dashboard-view";
import { ProviderProfileView } from "@/components/views/provider-profile-view";
import { WorkforceView } from "@/components/views/workforce-view";
import { WorkforceDashboardView } from "@/components/views/workforce-dashboard-view";
import { TalentProfileView } from "@/components/views/talent-profile-view";
import { JobDetailView } from "@/components/views/job-detail-view";
import { MarketplaceView } from "@/components/views/marketplace-view";
import { ProductDetailView } from "@/components/views/product-detail-view";
import { VendorProfileView } from "@/components/views/vendor-profile-view";
import { CartView } from "@/components/views/cart-view";
import { CheckoutView } from "@/components/views/checkout-view";
import { TreatmentDetailView } from "@/components/views/treatment-detail-view";
import { AssessmentExperience } from "@/components/views/assessment-experience";
import { ASSESSMENTS } from "@/lib/assessment-config";
import { JournalView } from "@/components/views/journal-view";
import { ArticleView } from "@/components/views/article-view";
import { JournalCategoryView } from "@/components/views/journal-category-view";
import { AboutView } from "@/components/views/about-view";
import { LegalView } from "@/components/views/legal-view";
import { useNav, useCompare, navigate, type ViewKey } from "@/lib/nav";
import { ARTICLES, getArticleBySlug } from "@/lib/article-content";
import { normalizeJournalSlug } from "@/lib/journal-article-v1";
import { goToProfessionalAccess } from "@/lib/professional-client";
import { ClinicCompareTray, ProductCompareTray } from "@/components/views/compare-trays";
import type {
  PlatformData,
} from "@/lib/platform-data";

export type { PlatformData };

export function AppShell({
  data,
  initialView,
  initialParams,
}: {
  data: PlatformData;
  initialView?: ViewKey;
  initialParams?: { id?: string; slug?: string; clinicId?: string };
}) {
  const { view: storedView, params: storedParams } = useNav();
  const view = initialView ?? storedView;
  const params = initialParams ?? storedParams;
  const [getStartedOpen, setGetStartedOpen] = useState(false);
  const compareClinics = useCompare((s) => s.clinics);
  const compareProducts = useCompare((s) => s.products);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Legacy hash links (`/#journal`, `/#journal/{slug}`,
      // `/#journal/category/{name}`) now live at real routes. Hash fragments
      // never reach the server, so redirect them client-side.
      const hash = window.location.hash;
      if (hash.startsWith("#journal")) {
        const rest = hash.slice("#journal".length).replace(/^\//, "");
        const normalize = (value: string) => normalizeJournalSlug(decodeURIComponent(value));
        let target = "/journal";
        if (rest.startsWith("category/")) {
          const category = normalize(rest.slice("category/".length));
          if (category) target = `/journal/category/${category}`;
        } else if (rest) {
          const slug = normalize(rest);
          if (slug) target = `/journal/${slug}`;
        }
        window.location.replace(target);
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const queryView = searchParams.get("view") as ViewKey | null;
      const queryParamsRaw = searchParams.get("params");
      let queryParams = undefined;
      if (queryParamsRaw) {
        try {
          queryParams = JSON.parse(decodeURIComponent(queryParamsRaw));
        } catch (e) {}
      }
      const queryAnchor = searchParams.get("anchor") || undefined;
      
      if (queryView) {
        let finalView = queryView;
        let finalAnchor = queryAnchor;
        if (queryView === "cookies") {
          finalView = "privacy";
          finalAnchor = "cookies";
        }
        useNav.getState().setView(finalView, finalAnchor, queryParams);
      }
    }
  }, []);

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

  const isWorkspaceView =
    view === "clinic-dashboard" ||
    view === "workforce-dashboard" ||
    view === "workforce-talent" ||
    view === "professional-onboarding" ||
    view === "employer-onboarding";

  const clinicForWorkspace =
    view === "clinic-dashboard"
      ? data.clinics.find((c) => c.id === params?.id)
      : undefined;

  const workspaceMain = (
    <>
      {view === "clinic-dashboard" && (() => {
        const clinic = clinicForWorkspace;
        if (!clinic) {
          return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center">
              <h1 className="text-2xl font-semibold">Clinic dashboard not found</h1>
              <Button className="mt-6" onClick={() => navigate("directory")}>
                Back to directory
              </Button>
            </div>
          );
        }
        return <ClinicDashboardView clinic={clinic} allClinics={data.clinics} />;
      })()}
      {view === "workforce-dashboard" && (
        <WorkforceDashboardView profileId={params?.id || ""} />
      )}
      {view === "workforce-talent" && (
        <TalentProfileView
          profileId={params?.id || ""}
          onBack={() => navigate("workforce-dashboard", undefined, { id: params?.id })}
        />
      )}
      {view === "professional-onboarding" && <ProfessionalOnboarding />}
      {view === "employer-onboarding" && <EmployerOnboarding />}
    </>
  );

  if (isWorkspaceView) {
    const role =
      view === "clinic-dashboard"
        ? "clinic"
        : view === "employer-onboarding"
          ? "employer"
          : "professional";

    const navItems =
      view === "clinic-dashboard" && clinicForWorkspace
        ? [
            { label: "Dashboard", active: true as const, onClick: () => undefined },
            {
              label: "Public listing",
              onClick: () => navigate("clinic-profile", undefined, { id: clinicForWorkspace.id }),
            },
          ]
        : view === "workforce-dashboard" || view === "workforce-talent"
          ? [
              {
                label: "Dashboard",
                active: view === "workforce-dashboard",
                onClick: () => navigate("workforce-dashboard", undefined, { id: params?.id }),
              },
              {
                label: "Profile",
                active: view === "workforce-talent",
                onClick: () => navigate("workforce-talent", undefined, { id: params?.id }),
              },
              { label: "Settings", href: "/workforce/professional/settings" },
            ]
          : view === "professional-onboarding"
            ? [{ label: "Onboarding", active: true as const, onClick: () => undefined }]
            : [{ label: "Onboarding", active: true as const, onClick: () => undefined }];

    return (
      <WorkspaceShell
        role={role}
        contextLabel={clinicForWorkspace?.name}
        navItems={navItems}
        signOutRedirect={role === "employer" ? "/workforce/employer/sign-in" : "/workforce/professional/sign-in"}
      >
        {workspaceMain}
      </WorkspaceShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => setGetStartedOpen(true)} />
      <main className="flex-1">
        {view === "home" && <HomeView data={data} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "patients" && <PatientsView data={data} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "clinics" && <ClinicsView data={data} onGetStarted={() => setGetStartedOpen(true)} />}
        {view === "directory" && <DirectoryView clinics={data.clinics} />}
        {view === "clinic-application" && <ClinicApplicationView />}
        {view === "clinic-profile" && (() => {
          const clinic = data.clinics.find((c) => c.id === params?.id);
          if (!clinic) {
            return (
              <div className="mx-auto max-w-3xl px-4 py-16 text-center">
                <h1 className="text-2xl font-semibold">Clinic profile not found</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  This clinic is not available in the public directory.
                </p>
                <Button className="mt-6" onClick={() => navigate("directory")}>
                  Back to directory
                </Button>
              </div>
            );
          }
          return <ClinicProfileView clinic={clinic} allClinics={data.clinics} />;
        })()}
        {view === "provider-profile" && (() => {
          let foundProvider: (typeof data.clinics)[number]["providers"][number] | null = null;
          let foundClinic: (typeof data.clinics)[number] | null = null;
          for (const c of data.clinics) {
            const p = c.providers?.find((prov) => prov.id === params?.id);
            if (p) {
              foundProvider = p;
              foundClinic = c;
              break;
            }
          }
          return (
            <ProviderProfileView
              provider={foundProvider}
              clinic={foundClinic}
            />
          );
        })()}
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
        {view === "cart" && <CartView />}
        {view === "checkout" && <CheckoutView />}
        {view === "treatment-detail" && (
          <TreatmentDetailView
            slug={params?.slug ?? "testosterone-replacement-therapy"}
            clinics={data.clinics}
            articles={data.articles}
            onStartAssessment={(slug) => navigate("assessment", undefined, { slug })}
          />
        )}
        {view === "assessment" && (
          <AssessmentExperience
            config={ASSESSMENTS[params?.slug ?? "testosterone-replacement-therapy"] ?? ASSESSMENTS["testosterone-replacement-therapy"]}
            clinics={data.clinics}
            onExit={() => navigate("patients")}
          />
        )}
        {view === "journal" && <JournalView articles={ARTICLES} />}
        {view === "journal-article" && (
          <ArticleView
            article={getArticleBySlug(params?.slug) ?? ARTICLES[0]}
            allArticles={ARTICLES}
          />
        )}
        {view === "journal-category" && (
          <JournalCategoryView
            category={params?.slug ?? ARTICLES[0]!.category}
            articles={ARTICLES}
          />
        )}
        {view === "join" && (
          <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Choose How You Want to Use Novalyte</h1>
              <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">Select the path that best describes you. Each Novalyte experience is designed around a different healthcare need.</p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { label: "I'm a Healthcare Professional", desc: "Build a professional profile, discover healthcare opportunities, apply to roles, and track applications.", icon: "stethoscope", primary: "Create Professional Profile", secondary: "Browse Jobs First", primaryView: "professional-onboarding", secondaryView: "workforce" },
                { label: "I Represent a Healthcare Organization", desc: "Create an organization profile, publish healthcare roles, review applicants, and build your team.", icon: "building", primary: "Create Organization Account", secondary: "Post a Role", primaryView: "employer-onboarding", secondaryView: "employer-onboarding" },
                { label: "I'm Looking for Care", desc: "Explore treatments, complete an assessment, and find appropriate healthcare organizations.", icon: "heart", primary: "Explore Patient Services", secondary: "Find a Clinic", primaryView: "patients", secondaryView: "directory" },
                { label: "I'm a Vendor or Service Provider", desc: "Present healthcare products, technology, equipment, or operational services to relevant organizations.", icon: "store", primary: "Join the Marketplace", secondary: "Explore Vendor Opportunities", primaryView: "marketplace", secondaryView: "marketplace" },
              ].map((p) => (
                <div key={p.label} className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm">
                  <h3 className="text-base font-semibold text-foreground">{p.label}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.desc}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => p.primaryView === "professional-onboarding" ? goToProfessionalAccess("join_page") : navigate(p.primaryView as ViewKey)}>{p.primary}</Button>
                    {p.secondaryView && <Button size="sm" variant="outline" onClick={() => navigate(p.secondaryView as ViewKey)}>{p.secondary}</Button>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">Already have an account?</p>
              <div className="mt-2 flex justify-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("workforce")}>Professional sign in</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("workforce")}>Employer sign in</Button>
              </div>
            </div>
          </div>
        )}
        {view === "about" && <AboutView />}
        {(view === "privacy" || view === "terms" || view === "medical-disclaimer" || view === "accessibility" || view === "cookies") && (
          <LegalView view={view} />
        )}
      </main>
      <Footer onNewsletter={subscribe} />
      <JoinGateway open={getStartedOpen} onOpenChange={setGetStartedOpen} />
      {showClinicTray && <ClinicCompareTray clinics={data.clinics} />}
      {showProductTray && <ProductCompareTray listings={data.listings} />}
    </div>
  );
}
