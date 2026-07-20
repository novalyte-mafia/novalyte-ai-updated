"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

const PUBLIC_PATHS = new Set([
  "/clinic/sign-in",
  "/clinic/forgot-password",
  "/clinic/reset-password",
]);

/**
 * Client auth gate for /clinic/* (except public auth pages).
 * Bearer APIs remain the source of truth for authorization.
 */
export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.has(pathname);
    if (isPublic) {
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data } = await getSupabaseClient().auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        window.location.replace("/clinic/sign-in");
        return;
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!ready && !PUBLIC_PATHS.has(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking clinic session...
      </div>
    );
  }

  return <>{children}</>;
}
