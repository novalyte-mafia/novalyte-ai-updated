"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import posthog from "posthog-js";
import { CookieConsent } from "@/components/site/cookie-consent";
import { useCookieConsent } from "@/lib/cookie-consent-store";
import { tryGetSupabaseClient } from "@/lib/supabase/client";
import {
  captureLandingAttribution,
  captureSafeEvent,
  ensurePostHogInitialized,
  identifyAnalyticsUser,
  isPostHogInitialized,
  registerInternalSuperProperties,
} from "@/lib/analytics-client";
import { isInternalBrowser } from "@/lib/analytics-classification";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const gtmId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;
const posthogEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

function applyGtagConsent(analyticsEnabled: boolean, marketingEnabled: boolean) {
  window.gtag?.("consent", "update", {
    analytics_storage: analyticsEnabled ? "granted" : "denied",
    ad_storage: marketingEnabled ? "granted" : "denied",
  });
}

export function AnalyticsManager() {
  const pathname = usePathname();
  const previousGaPath = useRef<string | null>(null);
  const preferences = useCookieConsent((state) => state.preferences);
  const analyticsEnabled = preferences?.analytics === true;
  const marketingEnabled = preferences?.marketing === true;

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
    const privateSurface =
      pathname.startsWith("/clinic") ||
      pathname.startsWith("/workforce") ||
      pathname.startsWith("/investor/admin") ||
      pathname.startsWith("/investor/data-room") ||
      pathname.startsWith("/investor/financials") ||
      pathname.startsWith("/investor/workspace") ||
      pathname.startsWith("/investor/updates") ||
      pathname.startsWith("/investor/traction");
    if (privateSurface) posthog.stopSessionRecording();
    else posthog.startSessionRecording();
  }, [analyticsEnabled, pathname]);

  useEffect(() => {
    if (!analyticsEnabled || !posthogEnabled) return;
    if (!ensurePostHogInitialized()) return;
    const supabase = tryGetSupabaseClient();
    if (!supabase) return;

    const identify = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        identifyAnalyticsUser(data.user.id, {
          role:
            typeof data.user.app_metadata?.role === "string"
              ? data.user.app_metadata.role
              : "professional",
        });
      }
    };

    identify();
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") posthog.reset();
      else if (session?.user) {
        identifyAnalyticsUser(session.user.id, {
          role:
            typeof session.user.app_metadata?.role === "string"
              ? session.user.app_metadata.role
              : "professional",
        });
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [analyticsEnabled]);

  useEffect(() => {
    if (!analyticsEnabled || !posthogEnabled) return;
    if (!ensurePostHogInitialized()) return;
    registerInternalSuperProperties();
  }, [analyticsEnabled]);

  // First-party attribution always — needed for outreach decisions even if analytics consent is declined.
  useEffect(() => {
    captureLandingAttribution();
  }, [pathname]);

  useEffect(() => {
    if (!analyticsEnabled) return;

    const url = new URL(window.location.href);
    const attribution = captureLandingAttribution();
    const deviceType = attribution.device_type || "desktop";
    const referrerDomain = attribution.referrer_domain ?? null;
    registerInternalSuperProperties();

    // Enrich automatic $pageview via register — do NOT emit a second PostHog page_view.
    const campaignProps = (() => {
      const parts = url.pathname.replace(/^\/ads\/?/, "/").split("/").filter(Boolean);
      if (parts.length >= 2) {
        return {
          campaign_treatment: parts[0],
          campaign_location: parts[1],
          campaign_slug: `${parts[0]}/${parts[1]}`,
          ad_platform: url.searchParams.get("utm_source"),
        };
      }
      if (parts.length === 1 && parts[0] !== "") {
        return { campaign_slug: parts[0] };
      }
      return {};
    })();

    try {
      if (isPostHogInitialized()) {
        posthog.register({
          path: url.pathname,
          referrer_domain: referrerDomain,
          device_type: deviceType,
          utm_source: url.searchParams.get("utm_source"),
          utm_medium: url.searchParams.get("utm_medium"),
          utm_campaign: url.searchParams.get("utm_campaign"),
          utm_content: url.searchParams.get("utm_content"),
          utm_term: url.searchParams.get("utm_term"),
          is_internal: isInternalBrowser(),
          ...campaignProps,
        });
      }
    } catch {
      /* optional */
    }

    // GA/dataLayer page context only (PostHog page_view suppressed in captureAnalyticsEvent).
    captureSafeEvent("page_view", {
      path: url.pathname,
      page_title: document.title,
      referrer_domain: referrerDomain,
      device_type: deviceType,
      utm_source: url.searchParams.get("utm_source"),
      utm_medium: url.searchParams.get("utm_medium"),
      utm_campaign: url.searchParams.get("utm_campaign"),
      utm_content: url.searchParams.get("utm_content"),
      utm_term: url.searchParams.get("utm_term"),
      ...campaignProps,
    });
    if (
      window.location.hostname.startsWith("ads.") ||
      url.pathname.startsWith("/ads/")
    ) {
      const parts = url.pathname.replace(/^\/ads\/?/, "/").split("/").filter(Boolean);
      if (parts.length >= 2) {
        captureSafeEvent("campaign_landing_viewed", {
          treatment: parts[0],
          location: parts[1],
          campaign_slug: `${parts[0]}/${parts[1]}`,
          path: url.pathname,
          utm_source: url.searchParams.get("utm_source"),
          utm_campaign: url.searchParams.get("utm_campaign"),
        });
      }
    }
    if (
      window.location.hostname === "investor.novalyte.io" ||
      url.pathname.startsWith("/investor")
    ) {
      captureSafeEvent("investor_page_viewed", { path: url.pathname });
    }

    // SPA GA4 page_view once per path change (gtag config already sends initial).
    if (previousGaPath.current && previousGaPath.current !== url.pathname) {
      window.gtag?.("event", "page_view", {
        page_title: document.title,
        page_location: url.href,
        page_path: url.pathname,
        traffic_type: isInternalBrowser() ? "internal" : "external",
        is_internal: isInternalBrowser() ? "true" : "false",
      });
    }
    previousGaPath.current = url.pathname;

    if (!window.sessionStorage.getItem("novalyte-analytics-session-event")) {
      window.sessionStorage.setItem("novalyte-analytics-session-event", "1");
      captureSafeEvent("session_started", {
        landing_path: url.pathname,
        referrer_domain: referrerDomain,
        device_type: deviceType,
      });
    }

    const reached = new Set<number>();
    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = Math.round((window.scrollY / scrollable) * 100);
      for (const threshold of [25, 50, 75, 90]) {
        if (percent >= threshold && !reached.has(threshold)) {
          reached.add(threshold);
          captureSafeEvent("scroll_depth_reached", {
            path: window.location.pathname,
            percent: threshold,
          });
        }
      }
    };

    const onClick = (event: MouseEvent) => {
      const element = (event.target as HTMLElement | null)?.closest<
        HTMLAnchorElement | HTMLButtonElement
      >("a,button");
      if (!element) return;
      const label =
        element.getAttribute("data-analytics-label") ||
        element.getAttribute("aria-label") ||
        element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ||
        "unlabeled";

      if (element instanceof HTMLAnchorElement) {
        const destination = new URL(element.href, window.location.href);
        if (destination.origin !== window.location.origin) {
          captureSafeEvent("outbound_link_clicked", {
            path: window.location.pathname,
            destination_host: destination.hostname,
            link_label: label,
          });
        }
      }

      const explicitEvent = element.getAttribute("data-analytics-event");
      if (explicitEvent) {
        captureSafeEvent(explicitEvent, {
          path: window.location.pathname,
          cta_label: label,
        });
      } else if (
        element.getAttribute("data-slot") === "button" ||
        element.classList.contains("bg-primary")
      ) {
        captureSafeEvent("primary_cta_clicked", {
          path: window.location.pathname,
          cta_label: label,
        });
      }
    };

    const onError = (event: ErrorEvent) => {
      captureSafeEvent("javascript_error", {
        path: window.location.pathname,
        error_name: event.error?.name ?? "Error",
      });
    };
    const onUnhandledRejection = () => {
      captureSafeEvent("javascript_error", {
        path: window.location.pathname,
        error_name: "UnhandledPromiseRejection",
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [analyticsEnabled, pathname]);

  useEffect(() => {
    if (!preferences) return;
    applyGtagConsent(analyticsEnabled, marketingEnabled);
  }, [analyticsEnabled, marketingEnabled, preferences]);

  useEffect(() => {
    if (!analyticsEnabled) return;
    const handleNavigation = (event: Event) => {
      const view = (event as CustomEvent<{ view: string }>).detail?.view;
      if (!view) return;
      captureSafeEvent("navigation_item_clicked", {
        destination_view: view,
      });
      window.gtag?.("event", "page_view", {
        page_title: view,
        page_location: `${window.location.origin}${window.location.pathname}`,
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
          <Script
            id="novalyte-google-analytics-config"
            strategy="afterInteractive"
            onReady={() => applyGtagConsent(analyticsEnabled, marketingEnabled)}
          >
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', wait_for_update: 500 });
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
      {analyticsEnabled && gtmId && (
        <Script id="novalyte-google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
    </>
  );
}
