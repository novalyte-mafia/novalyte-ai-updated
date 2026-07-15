"use client";

import { Hero } from "@/components/sections/hero";
import { TrustStrip, ProblemSection, PillarsSection } from "@/components/sections/home-marketing";
import { TreatmentVerticals, AudiencePathways } from "@/components/sections/home-journey";
import { CTASection } from "@/components/shared/cta";
import { navigate } from "@/lib/nav";
import type { PlatformData } from "@/components/site/app-shell";

export function HomeView({ onGetStarted }: { data: PlatformData; onGetStarted: () => void }) {
  return (
    <>
      <Hero onGetStarted={onGetStarted} />
      <TrustStrip />
      <ProblemSection />
      <PillarsSection />
      <TreatmentVerticals />
      <AudiencePathways onGetStarted={onGetStarted} />
      <CTASection
        title="The Men's Health Industry Is Growing. Its Infrastructure Should Grow With It."
        description="Join the ecosystem connecting patient demand, verified clinics, specialized talent, and operational services."
        primaryLabel="Join the Novalyte Ecosystem"
        onPrimary={onGetStarted}
        secondaryLabel="Contact Novalyte AI"
        secondaryView="about"
        tone="dark"
      />
    </>
  );
}
