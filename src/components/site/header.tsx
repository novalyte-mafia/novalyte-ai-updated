"use client";

import { useState } from "react";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNav, navigate, type ViewKey } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Menu, Store, Stethoscope, Briefcase, Building2, Users, BookOpen } from "lucide-react";

const PRIMARY_NAV: { label: string; view: ViewKey; icon: React.ElementType }[] = [
  { label: "Patients", view: "patients", icon: Stethoscope },
  { label: "Clinics", view: "clinics", icon: Briefcase },
  { label: "Directory", view: "directory", icon: Building2 },
  { label: "Workforce", view: "workforce", icon: Users },
  { label: "Journal", view: "journal", icon: BookOpen },
];

export function Header({ onGetStarted: _onGetStarted }: { onGetStarted: () => void }) {
  const { view } = useNav();
  const [mobileOpen, setMobileOpen] = useState(false);

  function go(v: ViewKey, anchor?: string) {
    setMobileOpen(false);
    navigate(v, anchor);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* LEFT: logo */}
        <button onClick={() => go("home")} className="flex items-center" aria-label="Novalyte AI home">
          <Logo />
        </button>

        {/* CENTER: primary nav */}
        <nav className="mx-auto hidden lg:flex" aria-label="Primary">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((item) => {
              const isActive = view === item.view || (item.view === "directory" && view === "clinic-profile");
              return (
                <li key={item.view}>
                  <button
                    onClick={() => go(item.view)}
                    className={cn(
                      "relative rounded-lg px-3.5 py-2 text-sm font-medium transition",
                      isActive
                        ? "text-teal-700"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-teal-600" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* RIGHT: Sign In + Marketplace */}
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => go("join")}
          >
            Sign In
          </Button>
          <Button
            size="sm"
            className="bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
            onClick={() => go("marketplace")}
          >
            <Store className="mr-1.5 h-4 w-4" /> Marketplace
          </Button>

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs overflow-y-auto p-0">
              <SheetHeader className="border-b px-5 py-4">
                <SheetTitle asChild>
                  <div>
                    <Logo />
                  </div>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3" aria-label="Mobile">
                {PRIMARY_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = view === item.view;
                  return (
                    <button
                      key={item.view}
                      onClick={() => go(item.view)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-muted",
                        isActive && "bg-teal-50 text-teal-700",
                      )}
                    >
                      <Icon className="h-4 w-4 text-teal-600" />
                      <span className="flex-1">{item.label}</span>
                    </button>
                  );
                })}
                <div className="mt-3 flex flex-col gap-2 border-t pt-3">
                  <Button
                    className="bg-teal-600 text-white hover:bg-teal-700"
                    onClick={() => go("marketplace")}
                  >
                    <Store className="mr-1.5 h-4 w-4" /> Marketplace
                  </Button>
                  <Button variant="outline" onClick={() => go("join")}>Sign In</Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
