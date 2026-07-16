import "server-only";

import { PostHog } from "posthog-node";

type ServerEvent = {
  distinctId: string;
  event: string;
  properties?: Record<string, string | number | boolean | null>;
};

export async function captureServerEvent(event: ServerEvent): Promise<void> {
  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!projectToken || !host) return;

  const client = new PostHog(projectToken, { host, flushAt: 1, flushInterval: 0 });
  try {
    client.capture(event);
    await client.shutdown();
  } catch (error) {
    console.error("PostHog server event failed", error);
    await client.shutdown().catch(() => undefined);
  }
}
