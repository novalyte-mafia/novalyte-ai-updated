"use client";

import { useEffect } from "react";
import { captureSafeEvent } from "@/lib/analytics-client";

export function AnalyticsEvent({
  name,
  properties = {},
}: {
  name: string;
  properties?: Record<string, string | number | boolean | null>;
}) {
  const serializedProperties = JSON.stringify(properties);

  useEffect(() => {
    captureSafeEvent(
      name,
      JSON.parse(serializedProperties) as Record<
        string,
        string | number | boolean | null
      >,
    );
  }, [name, serializedProperties]);

  return null;
}
