"use client";

import { useEffect } from "react";
import { captureSafeEvent } from "@/lib/analytics-client";

export function NotFoundEvent() {
  useEffect(() => {
    captureSafeEvent("404_page_viewed", {
      path: window.location.pathname,
      referrer_domain: document.referrer
        ? new URL(document.referrer).hostname
        : null,
    });
  }, []);

  return null;
}
