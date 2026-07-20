"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

const SELECTED_ORG_KEY = "clinic-portal:organizationId";
const SELECTED_CLINIC_KEY = "clinic-portal:clinicId";

export type ClinicPortalStatus = {
  status: string;
  hasEmployerClaim: boolean;
  memberships: Array<{
    id: string;
    organization_id: string;
    user_id: string;
    role: string;
    status: string;
  }>;
  organization: {
    id: string;
    legal_name: string;
    public_name: string | null;
    verification_status: string;
    lifecycle_status: string;
  } | null;
  clinics: Array<{
    id: string;
    name: string;
    slug: string | null;
    city: string | null;
    state: string | null;
    claimStatus: string | null;
    verificationStatus?: string | null;
    publicationStatus?: string | null;
    publishedAt?: string | null;
    logoUrl: string | null;
    organization_id: string | null;
  }>;
  unreadLeadCount: number;
  redirectTo?: string;
};

type UseClinicPortalOptions = {
  /** When false, skip redirect to sign-in (auth pages). Default true. */
  requireAuth?: boolean;
  /** When true, redirect to onboarding if status is not active. Default false. */
  requireActive?: boolean;
};

export function useClinicPortalSession(options: UseClinicPortalOptions = {}) {
  const { requireAuth = true, requireActive = false } = options;
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<ClinicPortalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicIdState] = useState<string | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);

  const setSelectedClinicId = useCallback((clinicId: string | null) => {
    setSelectedClinicIdState(clinicId);
    if (clinicId) {
      localStorage.setItem(SELECTED_CLINIC_KEY, clinicId);
    } else {
      localStorage.removeItem(SELECTED_CLINIC_KEY);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setToken(null);
        setStatus(null);
        if (requireAuth) {
          window.location.replace("/clinic/sign-in");
        }
        return null;
      }

      setToken(data.session.access_token);

      const urlOrgId =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("organizationId")
          : null;
      const storedOrgId =
        typeof window !== "undefined" ? localStorage.getItem(SELECTED_ORG_KEY) : null;
      const organizationId = urlOrgId || storedOrgId;
      if (organizationId) {
        localStorage.setItem(SELECTED_ORG_KEY, organizationId);
        setSelectedOrganizationId(organizationId);
      }

      const qs = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : "";
      const res = await fetch(`/api/clinic/status${qs}`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const payload = (await res.json().catch(() => ({}))) as ClinicPortalStatus & { error?: string };
      if (!res.ok) {
        setStatus(null);
        return null;
      }

      setStatus(payload);

      const storedClinicId =
        typeof window !== "undefined" ? localStorage.getItem(SELECTED_CLINIC_KEY) : null;
      const urlClinicId =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("clinicId")
          : null;
      const clinicIds = (payload.clinics ?? []).map((c) => c.id);
      const preferredClinicId =
        urlClinicId && clinicIds.includes(urlClinicId)
          ? urlClinicId
          : storedClinicId && clinicIds.includes(storedClinicId)
            ? storedClinicId
            : payload.clinics?.[0]?.id ?? null;
      if (preferredClinicId) {
        setSelectedClinicIdState(preferredClinicId);
        localStorage.setItem(SELECTED_CLINIC_KEY, preferredClinicId);
      }

      if (requireActive && payload.status !== "active") {
        window.location.replace(payload.redirectTo || "/clinic/onboarding");
        return null;
      }

      return payload;
    } finally {
      setLoading(false);
    }
  }, [requireActive, requireAuth, supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectedClinic = useMemo(
    () => status?.clinics.find((c) => c.id === selectedClinicId) ?? status?.clinics[0] ?? null,
    [selectedClinicId, status?.clinics],
  );

  const contextLabel =
    selectedClinic?.name ||
    status?.organization?.public_name ||
    status?.organization?.legal_name ||
    undefined;

  return {
    token,
    status,
    loading,
    refresh,
    selectedClinicId: selectedClinic?.id ?? selectedClinicId,
    setSelectedClinicId,
    selectedOrganizationId,
    selectedClinic,
    contextLabel,
    authHeaders: token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : null,
  };
}
