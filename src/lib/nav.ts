import { create } from "zustand";

export type ViewKey =
  | "home"
  | "patients"
  | "clinics"
  | "directory"
  | "workforce"
  | "marketplace"
  | "journal"
  | "about"
  | "privacy"
  | "terms"
  | "medical-disclaimer"
  | "accessibility"
  | "cookies";

type NavState = {
  view: ViewKey;
  /** optional anchor to scroll to within a view */
  anchor?: string;
  setView: (view: ViewKey, anchor?: string) => void;
};

export const useNav = create<NavState>((set) => ({
  view: "home",
  anchor: undefined,
  setView: (view, anchor) => set({ view, anchor }),
}));

/** Hook used by any component to navigate between views. */
export function navigate(view: ViewKey, anchor?: string) {
  useNav.getState().setView(view, anchor);
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: anchor ? "smooth" : "auto" });
  }
}
