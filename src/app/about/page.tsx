"use client";

import { useEffect } from "react";
import { AboutView } from "@/components/views/about-view";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { useNav } from "@/lib/nav";

export default function AboutPage() {
  useEffect(() => {
    useNav.getState().setView("about");
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
      <main className="flex-1"><AboutView /></main>
      <Footer onNewsletter={subscribe} />
    </div>
  );
}
