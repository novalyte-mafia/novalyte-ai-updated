"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Menu, LogOut, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export type WorkspaceRole = "clinic" | "professional" | "employer";

export type WorkspaceNavItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
};

const ROLE_LABEL: Record<WorkspaceRole, string> = {
  clinic: "Clinic workspace",
  professional: "Professional workspace",
  employer: "Employer workspace",
};

function WorkspaceNavLink({
  item,
  className,
  onNavigate,
}: {
  item: WorkspaceNavItem;
  className?: string;
  onNavigate?: () => void;
}) {
  const classes = cn(
    "rounded-lg px-3 py-2 text-sm font-semibold transition",
    item.active
      ? "bg-teal-50 text-teal-800"
      : "text-foreground/70 hover:bg-muted hover:text-foreground",
    className,
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        className={classes}
        onClick={() => {
          onNavigate?.();
          item.onClick?.();
        }}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-current={item.active ? "page" : undefined}
      className={cn(classes, "text-left")}
      onClick={() => {
        onNavigate?.();
        item.onClick?.();
      }}
    >
      {item.label}
    </button>
  );
}

/**
 * Authenticated product chrome — logo, role nav, account actions.
 * No marketing links (Patients / Clinics / Marketplace / etc.).
 */
export function WorkspaceShell({
  role,
  contextLabel,
  navItems = [],
  children,
  signOutRedirect = "/",
  publicSiteUrl = "https://novalyte.io",
}: {
  role: WorkspaceRole;
  /** Optional subtitle under logo area, e.g. clinic or org name */
  contextLabel?: string;
  navItems?: WorkspaceNavItem[];
  children: React.ReactNode;
  signOutRedirect?: string;
  /** Absolute URL for leaving the workspace to the public marketing site */
  publicSiteUrl?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const homeHref = role === "clinic" ? "/clinic/dashboard" : "/";

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await getSupabaseClient().auth.signOut();
      toast.success("Signed out.");
      window.location.assign(signOutRedirect);
    } catch {
      toast.error("Unable to sign out.");
      setSigningOut(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={homeHref} className="shrink-0" aria-label="Novalyte workspace home">
              <Logo size="sm" />
            </Link>
            <div className="hidden min-w-0 sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {ROLE_LABEL[role]}
              </p>
              {contextLabel ? (
                <p className="truncate text-sm font-semibold text-foreground">{contextLabel}</p>
              ) : null}
            </div>
          </div>

          <nav className="mx-auto hidden max-w-[720px] items-center gap-0.5 overflow-x-auto lg:flex" aria-label="Workspace">
            {navItems.map((item) => (
              <WorkspaceNavLink key={item.label} item={item} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden text-muted-foreground sm:inline-flex" asChild>
              <a href={publicSiteUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Public site
              </a>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign out
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open workspace menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs p-0">
                <SheetHeader className="border-b px-5 py-4 text-left">
                  <SheetTitle asChild>
                    <div>
                      <Logo size="sm" />
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {ROLE_LABEL[role]}
                      </p>
                      {contextLabel ? (
                        <p className="mt-0.5 text-sm font-semibold">{contextLabel}</p>
                      ) : null}
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-3" aria-label="Workspace mobile">
                  {navItems.map((item) => (
                    <WorkspaceNavLink
                      key={item.label}
                      item={item}
                      className="rounded-lg px-3 py-2.5 text-sm font-semibold"
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                  <div className="mt-3 space-y-2 border-t pt-3">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <a href={publicSiteUrl} target="_blank" rel="noreferrer" onClick={() => setMobileOpen(false)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Public site
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleSignOut}
                      disabled={signingOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 py-4">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <span>Novalyte AI · {ROLE_LABEL[role]}</span>
          <a href={publicSiteUrl} className="font-medium text-teal-700 hover:underline" target="_blank" rel="noreferrer">
            Back to public site
          </a>
        </div>
      </footer>
    </div>
  );
}
