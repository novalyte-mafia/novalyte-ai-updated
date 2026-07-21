"use client";

import Link from "next/link";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Logo } from "@/components/site/logo";

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

export function CampaignAdsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/70 bg-background/90 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="https://novalyte.io" aria-label="Novalyte AI home">
            <Logo />
          </Link>
          <Link href="/directory" className="text-sm font-medium text-teal-700 hover:underline">
            Find clinics
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        <p>
          © {new Date().getFullYear()} Novalyte AI ·{" "}
          <Link href="/privacy" className="underline-offset-2 hover:underline">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/medical-disclaimer" className="underline-offset-2 hover:underline">
            Medical disclaimer
          </Link>
        </p>
      </footer>
    </div>
  );
}
