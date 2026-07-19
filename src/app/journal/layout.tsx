import type { Metadata } from "next";
import { JournalShell } from "@/components/site/journal-shell";

export const metadata: Metadata = {
  title: {
    default: "Novalyte Journal — Men's Health Education",
    template: "%s | Novalyte Journal",
  },
  description:
    "Educational articles on men's health treatments, clinic operations, and healthcare workforce trends from the Novalyte Journal.",
};

export default function JournalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <JournalShell>{children}</JournalShell>;
}
