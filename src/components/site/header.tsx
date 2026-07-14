"use client";

import { useState } from "react";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNav, navigate, type ViewKey } from "@/lib/nav";
import { PILLARS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Megaphone,
  Building2,
  Users,
  Package,
  Menu,
  ArrowRight,
  Stethoscope,
  Briefcase,
  Store,
  BookOpen,
  Info,
} from "lucide-react";

const PILLAR_ICONS: Record<string, React.ElementType> = {
  Megaphone,
  Building2,
  Users,
  Package,
};

const NAV_ITEMS: { label: string; view: ViewKey; desc: string; icon: React.ElementType }[] = [
  { label: "For Patients", view: "patients", desc: "Assessments, treatments, and provider discovery", icon: Stethoscope },
  { label: "For Clinics", view: "clinics", desc: "Demand, intake, talent, and sourcing", icon: Briefcase },
  { label: "Clinic Directory", view: "directory", desc: "Verified men's health clinics", icon: Building2 },
  { label: "Workforce", view: "workforce", desc: "Specialized healthcare talent", icon: Users },
  { label: "Marketplace", view: "marketplace", desc: "Equipment, services, and vendors", icon: Store },
  { label: "Journal", view: "journal", desc: "Educational content and research", icon: BookOpen },
  { label: "About", view: "about", desc: "Mission and company", icon: Info },
];

export function Header({ onGetStarted }: { onGetStarted: () => void }) {
  const { view } = useNav();
  const [mobileOpen, setMobileOpen] = useState(false);

  function go(v: ViewKey, anchor?: string) {
    setMobileOpen(false);
    navigate(v, anchor);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button onClick={() => go("home")} className="flex items-center" aria-label="Novalyte AI home">
          <Logo />
        </button>

        {/* Desktop nav */}
        <div className="hidden items-center lg:flex">
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Platform</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[640px] gap-2 p-4 md:grid-cols-2">
                    {PILLARS.map((p) => {
                      const Icon = PILLAR_ICONS[p.icon] ?? Building2;
                      return (
                        <button
                          key={p.key}
                          onClick={() => go(p.view)}
                          className="group flex w-full items-start gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-border hover:bg-muted/50"
                        >
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                            <Icon className="h-4.5 w-4.5" />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                              {p.label}
                              <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                            </span>
                            <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{p.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {NAV_ITEMS.slice(3, 5).map((item) => (
                <NavigationMenuItem key={item.view}>
                  <button
                    onClick={() => go(item.view)}
                    className={navigationMenuTriggerStyle({ className: "bg-transparent" })}
                  >
                    {item.label}
                  </button>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <button
                  onClick={() => go("journal")}
                  className={navigationMenuTriggerStyle({ className: "bg-transparent" })}
                >
                  Journal
                </button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button
                  onClick={() => go("about")}
                  className={navigationMenuTriggerStyle({ className: "bg-transparent" })}
                >
                  About
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => go("about")}
          >
            Sign In
          </Button>
          <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onGetStarted}>
            Get Started
          </Button>

          {/* Mobile menu */}
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
              <nav className="flex flex-col gap-1 p-3">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.view}
                      onClick={() => go(item.view)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-muted",
                        view === item.view && "bg-teal-50 text-teal-700",
                      )}
                    >
                      <Icon className="h-4 w-4 text-teal-600" />
                      <span className="flex-1">{item.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  );
                })}
                <div className="mt-3 flex flex-col gap-2 border-t pt-3">
                  <Button variant="outline" onClick={() => go("about")}>Sign In</Button>
                  <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => { setMobileOpen(false); onGetStarted(); }}>
                    Get Started
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
