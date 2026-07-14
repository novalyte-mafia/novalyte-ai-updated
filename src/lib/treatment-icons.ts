import {
  TestTube2, Activity, HeartPulse, Scale, Pill, FlaskConical,
  Scissors, Sparkles, Infinity as InfinityIcon, Dumbbell, ShieldCheck, Video,
  type LucideIcon,
} from "lucide-react";

/**
 * Treatment icon system — consistent icon per treatment category.
 * All icons share the Novalyte AI color system and are legible at small sizes.
 */
export const TREATMENT_ICONS: Record<string, LucideIcon> = {
  "testosterone-replacement-therapy": TestTube2,
  "hormone-optimization": Activity,
  "erectile-dysfunction": HeartPulse,
  "medical-weight-loss": Scale,
  "glp-1": Pill,
  "peptide-therapy": FlaskConical,
  "hair-restoration": Scissors,
  "sexual-wellness": Sparkles,
  "longevity-medicine": InfinityIcon,
  "performance-recovery": Dumbbell,
  "preventive-mens-health": ShieldCheck,
  "telehealth-services": Video,
};

export function getTreatmentIcon(slug: string): LucideIcon {
  return TREATMENT_ICONS[slug] ?? HeartPulse;
}
