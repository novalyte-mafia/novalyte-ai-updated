"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { captureSafeEvent } from "@/lib/analytics-client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureSafeEvent("javascript_error", {
      error_name: error.name || "Error",
      error_digest: error.digest ?? null,
      route: window.location.pathname,
    });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-950">
        This page could not load
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        No form or assessment data was sent. Try the page again, or return
        home if the problem continues.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href="/">Return home</a>
        </Button>
      </div>
    </main>
  );
}
