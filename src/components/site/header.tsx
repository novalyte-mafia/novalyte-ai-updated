"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNav, navigate, type ViewKey } from "@/lib/nav";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { Menu, Store, Stethoscope, Briefcase, Building2, Users, BookOpen, ShoppingCart, Info, MessageSquare } from "lucide-react";

const PRIMARY_NAV: { label: string; view: ViewKey; anchor?: string; icon: React.ElementType }[] = [
  { label: "Patients", view: "patients", icon: Stethoscope },
  { label: "Clinics", view: "clinics", icon: Briefcase },
  { label: "Directory", view: "directory", icon: Building2 },
  { label: "Workforce", view: "workforce", icon: Users },
  { label: "Journal", view: "journal", icon: BookOpen },
  { label: "About", view: "about", icon: Info },
  { label: "Contact", view: "contact", icon: MessageSquare },
];

function isNavItemActive(
  item: (typeof PRIMARY_NAV)[number],
  view: ViewKey,
  anchor: string | undefined,
  pathname: string,
): boolean {
  if (item.view === "contact") {
    return pathname === "/contact" || (view === "contact" && pathname === "/");
  }
  if (item.view === "journal") {
    return pathname.startsWith("/journal") || view === "journal" || view === "journal-article" || view === "journal-category";
  }
  if (item.view === "about") {
    return pathname.startsWith("/about") || view === "about";
  }
  if (pathname !== "/" && pathname !== "") {
    // Standalone marketing routes should not light up SPA-only tabs.
    return false;
  }
  if (item.anchor) {
    return view === item.view && anchor === item.anchor;
  }
  if (item.view === "directory" && view === "clinic-profile") return true;
  return view === item.view && (!anchor || anchor !== "contact");
}

export function Header({ onGetStarted: _onGetStarted }: { onGetStarted: () => void }) {
  const { view, anchor } = useNav();
  const pathname = usePathname() || "/";
  const cartItems = useCart((s) => s.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const showCart =
    ["marketplace", "product-detail", "vendor-profile", "cart", "checkout"].includes(view) ||
    pathname.startsWith("/marketplace");

  function go(v: ViewKey, nextAnchor?: string) {
    setMobileOpen(false);
    navigate(v, nextAnchor);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full max-w-[1400px] items-center px-4 sm:px-6 lg:px-8">
        {/* LEFT: logo */}
        <button onClick={() => go("home")} className="mr-6 flex items-center" aria-label="Novalyte AI home">
          <Logo />
        </button>

        {/* CENTER: primary nav */}
        <nav className="mx-auto hidden lg:flex" aria-label="Primary">
          <ul className="flex items-center gap-1 lg:gap-2">
            {PRIMARY_NAV.map((item) => {
              const isActive = isNavItemActive(item, view, anchor, pathname);
              return (
                <li key={item.label}>
                  <button
                    onClick={() => go(item.view, item.anchor)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group relative rounded-lg px-3 py-2 text-base font-semibold tracking-[-0.01em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                      isActive
                        ? "text-teal-700"
                        : "text-foreground/80 hover:text-teal-700",
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-teal-600 transition-transform duration-200",
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                      )}
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* RIGHT: Marketplace & Cart */}
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Button
            size="sm"
            className="h-10 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            onClick={() => go("marketplace")}
          >
            <Store className="mr-1.5 h-4 w-4" /> Marketplace
          </Button>

          {showCart && (
            <Button
              variant="outline"
              size="icon"
              className="relative h-10 w-10 border border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
              onClick={() => go("cart")}
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Button>
          )}

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-teal-200 text-teal-700 hover:bg-teal-50 lg:hidden"
                aria-label="Open menu"
              >
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
                  const isActive = isNavItemActive(item, view, anchor, pathname);
                  return (
                    <button
                      key={item.label}
                      onClick={() => go(item.view, item.anchor)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-semibold transition hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                        isActive ? "bg-teal-50 text-teal-700" : "text-foreground/85",
                      )}
                    >
                      <Icon className="h-4 w-4 text-teal-600" />
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  );
                })}
                <div className="mt-3 flex flex-col gap-2 border-t pt-3">
                  <Button
                    className="bg-teal-600 text-base font-semibold text-white hover:bg-teal-700"
                    onClick={() => go("marketplace")}
                  >
                    <Store className="mr-1.5 h-4 w-4" /> Marketplace
                  </Button>

                  {showCart && (
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2 border-teal-200 text-teal-700"
                      onClick={() => go("cart")}
                    >
                      <ShoppingCart className="h-4 w-4" /> Cart ({cartCount})
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
