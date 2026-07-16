"use client";

import { useEffect } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import posthog from "posthog-js";
import { CookieConsent } from "@/components/site/cookie-consent";
import { useCookieConsent } from "@/lib/cookie-consent-store";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  ensurePostHogInitialized,
  isPostHogInitialized,
} from "@/lib/analytics-client";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const posthogEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

export function AnalyticsManager() {
  const preferences = useCookieConsent((state) => state.preferences);
  const analyticsEnabled = preferences?.analytics === true;

  useEffect(() => {
    if (!posthogEnabled) return;

    if (analyticsEnabled) {
      if (!ensurePostHogInitialized()) return;
      posthog.set_config({ persistence: "localStorage+cookie" });
      posthog.opt_in_capturing();
    } else if (preferences && isPostHogInitialized()) {
      posthog.opt_out_capturing();
      posthog.reset();
      posthog.set_config({ persistence: "memory" });
    }
  }, [analyticsEnabled, preferences]);

  useEffect(() => {
    if (!analyticsEnabled || !posthogEnabled) return;
    if (!ensurePostHogInitialized()) return;
    const supabase = getSupabaseClient();

    const identify = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        posthog.identify(data.user.id, {
          email: data.user.email,
          role: data.user.user_metadata?.role ?? "professional",
        });
      }
    };

    identify();
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") posthog.reset();
      else if (session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
          role: session.user.user_metadata?.role ?? "professional",
        });
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [analyticsEnabled]);

  useEffect(() => {
    if (!preferences || analyticsEnabled || !window.gtag) return;
    window.gtag("consent", "update", { analytics_storage: "denied" });
  }, [analyticsEnabled, preferences]);

  useEffect(() => {
    if (!analyticsEnabled) return;
    const handleNavigation = (event: Event) => {
      const view = (event as CustomEvent<{ view: string }>).detail?.view;
      if (!view) return;
      if (ensurePostHogInitialized()) posthog.capture("site_view_changed", { view });
      window.gtag?.("event", "page_view", {
        page_title: view,
        page_location: `${window.location.origin}/?view=${encodeURIComponent(view)}`,
      });
    };
    window.addEventListener("novalyte:navigation", handleNavigation);
    return () => window.removeEventListener("novalyte:navigation", handleNavigation);
  }, [analyticsEnabled]);

  return (
    <>
      <CookieConsent />
      {analyticsEnabled && <Analytics />}
      {analyticsEnabled && gaId && (
        <>
          <Script
            id="novalyte-google-analytics"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="novalyte-google-analytics-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('consent', 'default', { analytics_storage: 'granted' });
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
