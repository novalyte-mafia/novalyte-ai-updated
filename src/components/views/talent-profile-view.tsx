"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, ArrowLeft, ShieldCheck } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

type PublicTalent = {
  profile_id: string;
  public_slug: string | null;
  display_name: string;
  title: string;
  city: string | null;
  state: string | null;
  category: string | null;
  specialty: string | null;
  experience_band: string | null;
  availability: string | null;
  relocate: boolean;
  telehealth: boolean;
  bio: string | null;
  verified: boolean;
};

export function TalentProfileView({ profileId, onBack }: { profileId: string; onBack: () => void }) {
  const supabase = getSupabaseClient();
  const [profile, setProfile] = useState<PublicTalent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!profileId) return;
      try {
        setLoading(true);
        // Public projection only — never select base workforce_professional_profiles (*).
        const { data, error } = await supabase
          .from("professional_directory_profiles")
          .select("profile_id, public_slug, display_name, title, city, state, category, specialty, experience_band, availability, relocate, telehealth, bio, verified")
          .or(`profile_id.eq.${profileId},public_slug.eq.${profileId}`)
          .maybeSingle();
        if (error) throw error;
        setProfile((data as PublicTalent | null) ?? null);
      } catch (err) {
        console.error(err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profileId, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        <p className="text-xs text-muted-foreground">Loading public talent profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Public talent profile not found or not discoverable.</p>
        <Button onClick={onBack} size="sm" className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{profile.display_name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{profile.title}</p>
          </div>
          {profile.verified && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Verified
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[profile.city, profile.state].filter(Boolean).join(", ") || "Location private"}</span>
          <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{profile.specialty || profile.category || "Healthcare"}</span>
          {profile.experience_band && <span>Experience: {profile.experience_band} years</span>}
          {profile.availability && <span>Availability: {profile.availability}</span>}
          {profile.telehealth && <span>Telehealth</span>}
          {profile.relocate && <span>Open to relocate</span>}
        </div>

        {profile.bio && (
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{profile.bio}</p>
        )}

        <p className="text-[11px] text-muted-foreground border-t pt-3">
          Contact details, license numbers, and documents are never shown on public talent profiles.
        </p>
      </div>
    </div>
  );
}
