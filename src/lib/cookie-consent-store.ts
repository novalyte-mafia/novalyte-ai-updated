import { create } from "zustand";

export type CookiePreferences = {
  version: string;
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

type CookieConsentState = {
  preferences: CookiePreferences | null;
  showBanner: boolean;
  showPreferencesModal: boolean;
  setPreferences: (prefs: CookiePreferences) => void;
  setShowBanner: (show: boolean) => void;
  setShowPreferencesModal: (show: boolean) => void;
};

export const useCookieConsent = create<CookieConsentState>((set) => ({
  preferences: null,
  showBanner: false,
  showPreferencesModal: false,
  setPreferences: (preferences) => set({ preferences }),
  setShowBanner: (showBanner) => set({ showBanner }),
  setShowPreferencesModal: (showPreferencesModal) => set({ showPreferencesModal }),
}));
