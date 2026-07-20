"use client";

import { EmployerOnboarding } from "@/components/views/employer-onboarding";
import { WorkspaceShell } from "@/components/site/workspace-shell";

export default function EmployerOnboardingPage() {
  return (
    <WorkspaceShell
      role="employer"
      navItems={[{ label: "Onboarding", active: true, onClick: () => undefined }]}
      signOutRedirect="/workforce/employer/sign-in"
    >
      <EmployerOnboarding />
    </WorkspaceShell>
  );
}
