import { AppShell } from "@/components/site/app-shell";
import { getPublicPlatformData } from "@/lib/platform-data";
import type { ViewKey } from "@/lib/nav";

export async function PlatformRoute({
  view,
}: {
  view: Extract<
    ViewKey,
    "patients" | "clinics" | "directory" | "workforce" | "marketplace"
  >;
}) {
  const data = await getPublicPlatformData();
  return <AppShell data={data} initialView={view} />;
}
