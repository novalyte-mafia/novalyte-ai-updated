"use client";

import { Hero } from "@/components/sections/hero";
import { TrustStrip, ProblemSection, PillarsSection } from "@/components/sections/home-marketing";
import { AudiencePathways } from "@/components/sections/home-journey";
import { CTASection } from "@/components/shared/cta";
import type { PlatformData } from "@/lib/platform-data";

export function HomeView({ onGetStarted }: { data: PlatformData; onGetStarted: () => void }) {
  return (
    <>
      <Hero onGetStarted={onGetStarted} />
      <TrustStrip />
      <ProblemSection />
      <PillarsSection />
      <AudiencePathways onGetStarted={onGetStarted} />
      <CTASection
        title="The Men's Health Industry Is Growing. Its Infrastructure Should Grow With It."
        description="Join the ecosystem connecting patient demand, verified clinics, specialized talent, and operational services."
        tone="dark"
      />
    </>
  );
}
