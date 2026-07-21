import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileText,
  LineChart,
  Megaphone,
  CalendarClock,
} from "lucide-react";

import { WorkspaceShell } from "@/components/investor/workspace-shell";
import { guardApprovedInvestor } from "@/lib/investor/guard";
import { logInvestorEvent } from "@/lib/investor/auth";
import { investorPath } from "@/lib/investor/config";

export const metadata: Metadata = { title: "Workspace", robots: { index: false } };

const cards = [
  {
    href: investorPath("traction"),
    label: "Traction",
    description: "Operating progress and honestly-labeled metrics.",
    icon: BarChart3,
  },
  {
    href: investorPath("financials"),
    label: "Financials",
    description: "Founder-entered scenarios and projections.",
    icon: LineChart,
  },
  {
    href: investorPath("data-room"),
    label: "Data room",
    description: "Confidential documents with secure, time-limited access.",
    icon: FileText,
  },
  {
    href: investorPath("updates"),
    label: "Updates",
    description: "Founder updates and progress notes.",
    icon: Megaphone,
  },
  {
    href: investorPath("meet"),
    label: "Meet",
    description: "Request a conversation with the founder.",
    icon: CalendarClock,
  },
];

export default async function WorkspacePage() {
  const { user, profile, isFounder } = await guardApprovedInvestor();
  const displayName =
    (profile.full_name as string) || user.email || "Investor";

  await logInvestorEvent({
    userId: user.id,
    eventType: "workspace_viewed",
    section: "workspace",
  });

  return (
    <WorkspaceShell isFounder={isFounder} displayName={displayName}>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-investor-serif)] text-3xl font-semibold text-stone-900">
          Welcome{displayName ? `, ${displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is the confidential Novalyte AI investor workspace. Everything
          here is proprietary and for approved recipients only.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-stone-900">
                {card.label}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {card.description}
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-teal-700">
                Open <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
        {isFounder ? (
          <Link
            href={investorPath("admin/requests")}
            className="group flex flex-col rounded-2xl border border-stone-300 border-dashed bg-white p-6 shadow-sm transition hover:border-teal-300"
          >
            <h2 className="text-base font-semibold text-stone-900">
              Founder admin
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Review access requests, manage investors, and publish content.
            </p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-teal-700">
              Open admin <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          </Link>
        ) : null}
      </div>
    </WorkspaceShell>
  );
}
