"use client";

import { ProfessionalOnboarding } from "@/components/views/professional-onboarding";
import { WorkspaceShell } from "@/components/site/workspace-shell";

export default function ProfessionalOnboardingPage() {
  return (
    <WorkspaceShell
      role="professional"
      navItems={[{ label: "Onboarding", active: true, onClick: () => undefined }]}
      signOutRedirect="/workforce/professional/sign-in"
    >
      <ProfessionalOnboarding />
    </WorkspaceShell>
  );
}
