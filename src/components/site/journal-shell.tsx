"use client";

import { useEffect } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { useNav } from "@/lib/nav";

/**
 * Client chrome for the standalone /journal App Router pages, matching the
 * shell used by /about and /clinics.
 */
export function JournalShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useNav.getState().setView("journal");
  }, []);

  async function subscribe(email: string) {
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error("Unable to subscribe.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => {}} />
      <main className="flex-1">{children}</main>
      <Footer onNewsletter={subscribe} />
    </div>
  );
}
