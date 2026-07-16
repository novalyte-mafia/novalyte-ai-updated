"use client";

import { useEffect, useState } from "react";
import { useCookieConsent, type CookiePreferences } from "@/lib/cookie-consent-store";
import { navigate } from "@/lib/nav";
import { captureAnalyticsEvent } from "@/lib/analytics-client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COOKIE_STORAGE_KEY = "novalyte-cookie-consent";
const CURRENT_VERSION = "1.0";

export function CookieConsent() {
  const {
    preferences,
    showBanner,
    showPreferencesModal,
    setPreferences,
    setShowBanner,
    setShowPreferencesModal,
  } = useCookieConsent();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(COOKIE_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as CookiePreferences;
          if (parsed.version === CURRENT_VERSION) {
            setPreferences(parsed);
            return;
          }
        } catch (e) {
          // invalid storage, clear it
        }
      }
      // No valid consent, show banner
      setShowBanner(true);
    }
  }, [setPreferences, setShowBanner]);

  function saveConsent(updated: Omit<CookiePreferences, "version" | "updatedAt">) {
    const record: CookiePreferences = {
      version: CURRENT_VERSION,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(record));
    setPreferences(record);
    if (record.analytics && !preferences?.analytics) {
      captureAnalyticsEvent("analytics_consent_granted");
    }
    setShowBanner(false);
    setShowPreferencesModal(false);
  }

  function handleAcceptAll() {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  }

  function handleRejectNonEssential() {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  }

  if (!showBanner && !showPreferencesModal) return null;

  return (
    <>
      {/* Consent Banner */}
      {showBanner && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-40 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-premium-lg sm:bottom-6 sm:left-6 sm:right-6 lg:left-auto lg:right-6 lg:max-w-md"
        >
          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-semibold text-foreground">Cookie Consent</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use strictly necessary cookies for security and operation of our services. We may also use optional functional, analytics, and marketing cookies to enhance your experience. Learn more in our{" "}
              <button
                onClick={() => navigate("privacy", "cookies")}
                className="font-semibold text-teal-600 underline hover:text-teal-700 focus:outline-none"
              >
                Privacy Policy
              </button>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="flex-1 bg-teal-600 text-white hover:bg-teal-700 text-xs font-semibold px-3 h-8.5"
              onClick={handleAcceptAll}
            >
              Accept All
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs font-semibold px-3 h-8.5"
              onClick={handleRejectNonEssential}
            >
              Reject Non-Essential
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-xs font-medium text-muted-foreground hover:text-foreground h-8.5 mt-1 sm:w-auto"
              onClick={() => setShowPreferencesModal(true)}
            >
              Manage Preferences
            </Button>
          </div>
        </div>
      )}

      {/* Preferences Dialog */}
      {showPreferencesModal && (
        <PreferencesDialog
          preferences={preferences}
          onClose={() => setShowPreferencesModal(false)}
          onSave={saveConsent}
        />
      )}
    </>
  );
}

function PreferencesDialog({
  preferences,
  onClose,
  onSave,
}: {
  preferences: CookiePreferences | null;
  onClose: () => void;
  onSave: (preferences: Omit<CookiePreferences, "version" | "updatedAt">) => void;
}) {
  const [funcEnabled, setFuncEnabled] = useState(preferences?.functional ?? false);
  const [analEnabled, setAnalEnabled] = useState(preferences?.analytics ?? false);
  const [markEnabled, setMarkEnabled] = useState(preferences?.marketing ?? false);

  return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Customize how cookies are used on our site. Strictly necessary cookies cannot be disabled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Strictly Necessary */}
            <div className="flex items-center justify-between gap-4 border-b border-border/55 pb-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Strictly Necessary Cookies</Label>
                <p className="text-xs text-muted-foreground">
                  Required for security, session state, and system operations.
                </p>
              </div>
              <Switch checked disabled aria-label="Strictly Necessary Cookies (Required)" />
            </div>

            {/* Functional */}
            <div className="flex items-center justify-between gap-4 border-b border-border/55 pb-3">
              <div className="space-y-0.5">
                <Label htmlFor="cookie-functional" className="text-sm font-semibold">
                  Functional Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Remember your selections, customized preferences, and helper tools.
                </p>
              </div>
              <Switch
                id="cookie-functional"
                checked={funcEnabled}
                onCheckedChange={setFuncEnabled}
              />
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between gap-4 border-b border-border/55 pb-3">
              <div className="space-y-0.5">
                <Label htmlFor="cookie-analytics" className="text-sm font-semibold">
                  Analytics Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Analyze user behavior, page load performance, and traffic sources to optimize the platform.
                </p>
              </div>
              <Switch
                id="cookie-analytics"
                checked={analEnabled}
                onCheckedChange={setAnalEnabled}
              />
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="cookie-marketing" className="text-sm font-semibold">
                  Marketing Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Track the performance of marketing campaigns. No cross-site ad targeting cookies are implemented.
                </p>
              </div>
              <Switch
                id="cookie-marketing"
                checked={markEnabled}
                onCheckedChange={setMarkEnabled}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 text-white hover:bg-teal-700"
              size="sm"
              onClick={() =>
                onSave({
                  necessary: true,
                  functional: funcEnabled,
                  analytics: analEnabled,
                  marketing: markEnabled,
                })
              }
            >
              Save Choices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}
