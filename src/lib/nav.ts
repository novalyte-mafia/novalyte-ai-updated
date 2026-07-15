import { create } from "zustand";

export type ViewKey =
  | "home"
  | "patients"
  | "clinics"
  | "directory"
  | "clinic-profile"
  | "clinic-dashboard"
  | "provider-profile"
  | "workforce"
  | "workforce-dashboard"
  | "workforce-talent"
  | "job-detail"
  | "join"
  | "professional-onboarding"
  | "employer-onboarding"
  | "marketplace"
  | "product-detail"
  | "vendor-profile"
  | "treatment-detail"
  | "assessment"
  | "journal"
  | "journal-article"
  | "journal-category"
  | "about"
  | "privacy"
  | "terms"
  | "medical-disclaimer"
  | "accessibility"
  | "cookies";

type NavState = {
  view: ViewKey;
  /** anchor to scroll to within a view */
  anchor?: string;
  /** param payload for detail views (clinic id, product slug, vendor slug, job id) */
  params?: { id?: string; slug?: string; clinicId?: string };
  setView: (view: ViewKey, anchor?: string, params?: { id?: string; slug?: string; clinicId?: string }) => void;
};

export const useNav = create<NavState>((set) => ({
  view: "home",
  anchor: undefined,
  params: undefined,
  setView: (view, anchor, params) => set({ view, anchor, params }),
}));

/** Navigate between views. Accepts optional anchor and params for detail views. */
export function navigate(
  view: ViewKey,
  anchor?: string,
  params?: { id?: string; slug?: string; clinicId?: string },
) {
  useNav.getState().setView(view, anchor, params);
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: anchor ? "smooth" : "auto" });
  }
}

/* ───────────────────────────────────────────────────────────────
   Saved items store (localStorage-backed) — clinics, jobs, products
   ─────────────────────────────────────────────────────────────── */
type SavedKind = "clinic" | "job" | "product";
type SavedState = {
  clinics: string[];
  jobs: string[];
  products: string[];
  toggle: (kind: SavedKind, id: string) => void;
  has: (kind: SavedKind, id: string) => boolean;
  clear: (kind: SavedKind) => void;
};

const STORAGE_KEY = "novalyte-saved-v1";

function loadSaved(): { clinics: string[]; jobs: string[]; products: string[] } {
  if (typeof window === "undefined") return { clinics: [], jobs: [], products: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { clinics: [], jobs: [], products: [] };
    return JSON.parse(raw);
  } catch {
    return { clinics: [], jobs: [], products: [] };
  }
}

function persist(state: { clinics: string[]; jobs: string[]; products: string[] }) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export const useSaved = create<SavedState>((set, get) => ({
  ...loadSaved(),
  toggle: (kind, id) => {
    const key = `${kind}s` as "clinics" | "jobs" | "products";
    const current = get()[key];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    const newState = { ...get(), [key]: next };
    persist({ clinics: newState.clinics, jobs: newState.jobs, products: newState.products });
    set({ [key]: next } as Partial<SavedState>);
  },
  has: (kind, id) => get()[`${kind}s` as "clinics" | "jobs" | "products"].includes(id),
  clear: (kind) => {
    const key = `${kind}s` as "clinics" | "jobs" | "products";
    const newState = { ...get(), [key]: [] };
    persist({ clinics: newState.clinics, jobs: newState.jobs, products: newState.products });
    set({ [key]: [] } as Partial<SavedState>);
  },
}));

/* ───────────────────────────────────────────────────────────────
   Compare tray store (clinics + products comparison)
   ─────────────────────────────────────────────────────────────── */
type CompareKind = "clinic" | "product";
type CompareState = {
  clinics: string[];
  products: string[];
  toggle: (kind: CompareKind, id: string) => void;
  has: (kind: CompareKind, id: string) => boolean;
  remove: (kind: CompareKind, id: string) => void;
  clear: (kind: CompareKind) => void;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
};

export const useCompare = create<CompareState>((set, get) => ({
  clinics: [],
  products: [],
  isOpen: false,
  toggle: (kind, id) => {
    const key = `${kind}s` as "clinics" | "products";
    const current = get()[key];
    if (current.includes(id)) {
      set({ [key]: current.filter((x) => x !== id) } as Partial<CompareState>);
    } else {
      if (current.length >= 3) return; // max 3 to compare
      set({ [key]: [...current, id], isOpen: true } as Partial<CompareState>);
    }
  },
  has: (kind, id) => get()[`${kind}s` as "clinics" | "products"].includes(id),
  remove: (kind, id) => {
    const key = `${kind}s` as "clinics" | "products";
    set({ [key]: get()[key].filter((x) => x !== id) } as Partial<CompareState>);
  },
  clear: (kind) => set({ [`${kind}s`]: [], isOpen: false } as Partial<CompareState>),
  setOpen: (v) => set({ isOpen: v }),
}));
