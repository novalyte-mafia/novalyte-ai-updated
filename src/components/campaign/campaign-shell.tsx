"use client";

import Link from "next/link";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { buildDirectoryUrl, mainSitePath } from "@/lib/campaigns/directory-url";
import { trackCampaignEvent, type CampaignAnalyticsContext } from "@/lib/campaigns/analytics";
import { cn } from "@/lib/utils";

async function subscribe(email: string) {
  const response = await fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error("Unable to subscribe.");
}

export function CampaignOrganicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => {}} />
      <main className="flex-1">{children}</main>
      <Footer onNewsletter={subscribe} />
    </div>
  );
}

export type CampaignAdsShellProps = {
  children: React.ReactNode;
  /** Hub keeps visitors on ads.novalyte.io; campaign logo scrolls to hero. */
  variant?: "hub" | "campaign";
  directoryUrl?: string;
  assessmentHref?: string;
  analytics?: CampaignAnalyticsContext;
  showAssessmentCta?: boolean;
};

export function CampaignAdsShell({
  children,
  variant = "hub",
  directoryUrl,
  assessmentHref = "#campaign-assessment",
  analytics,
  showAssessmentCta = variant === "campaign",
}: CampaignAdsShellProps) {
  const findClinicsUrl = directoryUrl ?? buildDirectoryUrl();

  const onFindClinics = () => {
    trackCampaignEvent("campaign_find_clinics_clicked", analytics, {
      directory_destination: findClinicsUrl,
      source: "ads_shell_nav",
    });
    trackCampaignEvent("campaign_directory_opened", analytics, {
      directory_destination: findClinicsUrl,
      source: "ads_shell_nav",
    });
  };

  const onStartAssessment = () => {
    trackCampaignEvent("campaign_primary_cta_clicked", analytics, {
      source: "ads_shell_nav",
      cta: "start_assessment",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          {variant === "hub" ? (
            <Link href="/" aria-label="Novalyte AI campaign home" className="shrink-0">
              <Logo />
            </Link>
          ) : (
            <a
              href="#campaign-hero"
              aria-label="Back to top of this campaign"
              className="shrink-0"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("campaign-hero")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Logo />
            </a>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={findClinicsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onFindClinics}
              className="hidden text-sm font-medium text-muted-foreground hover:text-teal-800 sm:inline"
            >
              Find Clinics
            </a>
            {showAssessmentCta ? (
              <Button asChild size="sm" className="bg-teal-700 text-white hover:bg-teal-800">
                <a href={assessmentHref} onClick={onStartAssessment}>
                  Start Assessment
                </a>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="sm:hidden">
                <a
                  href={findClinicsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onFindClinics}
                >
                  Find Clinics
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        <p className={cn("mx-auto max-w-5xl")}>
          © {new Date().getFullYear()} Novalyte AI ·{" "}
          <a
            href={mainSitePath("/privacy")}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            Privacy
          </a>{" "}
          ·{" "}
          <a
            href={mainSitePath("/terms")}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            Terms
          </a>{" "}
          ·{" "}
          <a
            href={mainSitePath("/medical-disclaimer")}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            Medical disclaimer
          </a>
        </p>
      </footer>
    </div>
  );
}
