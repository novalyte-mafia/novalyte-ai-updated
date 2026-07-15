"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { navigate } from "@/lib/nav";
import {
  Stethoscope, Building2, Heart, Store, ArrowRight, CheckCircle2, Users, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "professional" | "employer" | "patient" | "vendor";

const PATHS: {
  key: Role;
  label: string;
  desc: string;
  icon: React.ElementType;
  primaryCta: string;
  secondaryCta?: string;
  primaryAction: () => void;
  secondaryAction?: () => void;
}[] = [
  {
    key: "professional",
    label: "I'm a Healthcare Professional",
    desc: "Build a professional profile, upload your credentials, discover healthcare opportunities, apply to roles, and track your applications.",
    icon: Stethoscope,
    primaryCta: "Create Professional Profile",
    secondaryCta: "Browse Jobs First",
    primaryAction: () => navigate("professional-onboarding"),
    secondaryAction: () => navigate("workforce"),
  },
  {
    key: "employer",
    label: "I Represent a Healthcare Organization",
    desc: "Create an organization profile, publish healthcare roles, review applicants, and build your clinical and operational team.",
    icon: Building2,
    primaryCta: "Create Organization Account",
    secondaryCta: "Post a Role",
    primaryAction: () => navigate("employer-onboarding"),
    secondaryAction: () => navigate("employer-onboarding"),
  },
  {
    key: "patient",
    label: "I'm Looking for Care",
    desc: "Explore treatments, complete an assessment, and find appropriate healthcare organizations.",
    icon: Heart,
    primaryCta: "Explore Patient Services",
    secondaryCta: "Find a Clinic",
    primaryAction: () => navigate("patients"),
    secondaryAction: () => navigate("directory"),
  },
  {
    key: "vendor",
    label: "I'm a Vendor or Service Provider",
    desc: "Present healthcare products, technology, equipment, or operational services to relevant organizations.",
    icon: Store,
    primaryCta: "Join the Marketplace",
    secondaryCta: "Explore Vendor Opportunities",
    primaryAction: () => navigate("marketplace"),
    secondaryAction: () => navigate("marketplace"),
  },
];

export function JoinGateway({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  function close() {
    onOpenChange(false);
    setTimeout(() => setSelectedRole(null), 200);
  }

  function handlePrimary() {
    if (!selectedRole) return;
    const path = PATHS.find((p) => p.key === selectedRole);
    if (path) {
      close();
      path.primaryAction();
    }
  }

  function handleSecondary() {
    if (!selectedRole) return;
    const path = PATHS.find((p) => p.key === selectedRole);
    if (path?.secondaryAction) {
      close();
      path.secondaryAction();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose How You Want to Use Novalyte</DialogTitle>
          <DialogDescription>
            Select the path that best describes you. Each Novalyte experience is designed around a different healthcare need.
          </DialogDescription>
        </DialogHeader>

        {/* Path cards */}
        <div className="grid gap-2.5">
          {PATHS.map((p) => {
            const Icon = p.icon;
            const active = selectedRole === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setSelectedRole(p.key)}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border p-4 text-left transition",
                  active
                    ? "border-teal-400 bg-teal-50/50 ring-1 ring-teal-200"
                    : "border-border bg-card hover:border-teal-200 hover:bg-teal-50/20",
                )}
              >
                <span className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition",
                  active ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-600 ring-1 ring-teal-100",
                )}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{p.label}</span>
                    {active && <CheckCircle2 className="h-4 w-4 text-teal-600" />}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions based on selected role */}
        {selectedRole && (
          <div className="mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            {PATHS.find((p) => p.key === selectedRole)?.secondaryCta && (
              <Button variant="outline" onClick={handleSecondary}>
                {PATHS.find((p) => p.key === selectedRole)?.secondaryCta}
              </Button>
            )}
            <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={handlePrimary}>
              {PATHS.find((p) => p.key === selectedRole)?.primaryCta} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Quick links for returning users */}
        <div className="mt-4 border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground">Already have an account?</p>
          <div className="mt-2 flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { close(); navigate("workforce"); }}>
              <Users className="mr-1 h-3.5 w-3.5" /> Professional sign in
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { close(); navigate("workforce"); }}>
              <Briefcase className="mr-1 h-3.5 w-3.5" /> Employer sign in
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
