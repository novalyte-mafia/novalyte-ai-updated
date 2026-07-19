"use client";

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { LegalView } from "@/components/views/legal-view";

async function subscribe(email: string) {
  const response = await fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error("Unable to subscribe.");
}

export function LegalPageShell({
  view,
}: {
  view: "privacy" | "terms" | "medical-disclaimer" | "accessibility";
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => {}} />
      <main className="flex-1">
        <LegalView view={view} />
      </main>
      <Footer onNewsletter={subscribe} />
    </div>
  );
}
