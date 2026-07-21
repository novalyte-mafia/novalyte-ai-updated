"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getInvestorBrowserClient } from "@/lib/supabase/browser";
import {
  INVESTOR_BASE_PATH,
  PROTECTED_NAV,
  ADMIN_NAV,
  investorPath,
} from "@/lib/investor/config";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceShell({
  children,
  isFounder = false,
  displayName,
}: {
  children: React.ReactNode;
  isFounder?: boolean;
  displayName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = isFounder ? [...PROTECTED_NAV, ...ADMIN_NAV] : PROTECTED_NAV;

  async function signOut() {
    await getInvestorBrowserClient().auth.signOut();
    router.replace(investorPath("sign-in"));
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-foreground">
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={investorPath("workspace")} className="shrink-0">
            <Logo />
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" /> Confidential
          </span>

          <nav className="mx-auto hidden lg:flex lg:items-center lg:gap-1" aria-label="Investor workspace">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive(pathname, item.href)
                    ? "bg-teal-50 text-teal-800"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {displayName ? (
              <span className="hidden text-sm text-stone-500 sm:inline">
                {displayName}
              </span>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="hidden border-stone-200 sm:inline-flex"
            >
              <LogOut className="mr-1.5 h-4 w-4" /> Sign out
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs overflow-y-auto p-0">
                <SheetHeader className="border-b border-stone-200 px-5 py-4">
                  <SheetTitle asChild>
                    <div>
                      <Logo />
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-3" aria-label="Mobile workspace navigation">
                  {nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-[15px] font-semibold",
                        isActive(pathname, item.href)
                          ? "bg-teal-50 text-teal-800"
                          : "text-stone-700 hover:bg-stone-100",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button
                    variant="outline"
                    onClick={signOut}
                    className="mt-3 border-stone-200"
                  >
                    <LogOut className="mr-1.5 h-4 w-4" /> Sign out
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 text-xs text-stone-500 sm:px-6 lg:px-8">
          Confidential and proprietary. © {new Date().getFullYear()} Novalyte AI.
        </div>
      </footer>
    </div>
  );
}
