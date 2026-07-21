import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { SectionHeading } from "@/components/investor/section";
import { MeetingRequestForm } from "@/components/investor/meeting-request-form";
import { guardApprovedInvestor } from "@/lib/investor/guard";
import { logInvestorEvent } from "@/lib/investor/auth";

export const metadata: Metadata = { title: "Meet", robots: { index: false } };

export default async function MeetPage() {
  const { user, profile, isFounder } = await guardApprovedInvestor();

  await logInvestorEvent({
    userId: user.id,
    eventType: "meet_viewed",
    section: "meet",
  });

  const displayName = (profile.full_name as string) || user.email || undefined;

  return (
    <WorkspaceShell isFounder={isFounder} displayName={displayName}>
      <SectionHeading
        eyebrow="Meet"
        title="Request a conversation"
        description="Set up time with the founder to discuss Novalyte AI, the round, and any questions from the data room."
      />
      <div className="mt-8 max-w-3xl">
        <MeetingRequestForm
          defaultName={(profile.full_name as string) || undefined}
          defaultEmail={(profile.work_email as string) || user.email || undefined}
        />
      </div>
    </WorkspaceShell>
  );
}
